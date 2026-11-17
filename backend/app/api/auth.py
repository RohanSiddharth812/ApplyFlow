import hashlib
import secrets
from datetime import datetime, timedelta, timezone
from urllib.parse import urlencode

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.core.config import settings
from app.database.connection import get_db
from app.core.security import get_password_hash, verify_password, create_access_token
from app.models.models import EmailVerificationToken, User, Profile
from app.schemas.schemas import (
    EmailVerificationRequest, RegistrationResponse, ResendVerificationRequest,
    UserRegister, UserLogin, Token, UserResponse
)
from app.api.deps import get_current_user
from app.services.email_sender import EmailDeliveryError, send_verification_email

router = APIRouter(prefix="/auth", tags=["Authentication"])

def _now_naive_utc() -> datetime:
    return datetime.now(timezone.utc).replace(tzinfo=None)


def _new_verification_token(db: Session, user: User) -> str:
    now = _now_naive_utc()
    db.query(EmailVerificationToken).filter(
        EmailVerificationToken.user_id == user.id,
        EmailVerificationToken.used_at.is_(None),
    ).update({EmailVerificationToken.used_at: now}, synchronize_session=False)
    raw_token = secrets.token_urlsafe(32)
    db.add(EmailVerificationToken(
        user_id=user.id,
        token_hash=hashlib.sha256(raw_token.encode("utf-8")).hexdigest(),
        expires_at=now + timedelta(minutes=settings.EMAIL_VERIFICATION_TTL_MINUTES),
    ))
    return raw_token


def _verification_url(raw_token: str) -> str:
    base_url = settings.FRONTEND_BASE_URL.rstrip("/")
    return f"{base_url}/verify-email?{urlencode({'token': raw_token})}"


def _send_or_dev_link(user: User, raw_token: str) -> str | None:
    verify_url = _verification_url(raw_token)
    try:
        sent = send_verification_email(user.email, user.full_name, verify_url)
    except EmailDeliveryError as exc:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail=f"Your account was created but verification email delivery failed. You can request another link. {exc}",
        ) from exc
    if not sent and settings.APP_ENV.lower() != "production":
        return verify_url
    return None


@router.post("/register", response_model=RegistrationResponse, status_code=status.HTTP_202_ACCEPTED)
def register(user_in: UserRegister, db: Session = Depends(get_db)):
    if settings.APP_ENV.lower() == "production" and (
        not settings.BREVO_API_KEY or not settings.BREVO_SENDER_EMAIL
    ):
        raise HTTPException(status_code=503, detail="Email verification is not configured. Contact the administrator.")
    existing = db.query(User).filter(User.email == user_in.email.lower()).first()
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="An account with this email already exists."
        )

    user = User(
        email=user_in.email.lower(),
        full_name=user_in.full_name,
        hashed_password=get_password_hash(user_in.password),
        is_active=False
    )
    db.add(user)
    db.flush()

    # Initialize the profile while the account remains unable to log in.
    db.add(Profile(user_id=user.id))
    raw_token = _new_verification_token(db, user)
    db.commit()
    db.refresh(user)
    dev_url = _send_or_dev_link(user, raw_token)
    return RegistrationResponse(
        message="Check your email for a verification link before signing in.",
        email=user.email,
        dev_verification_url=dev_url,
    )


@router.post("/resend-verification", response_model=RegistrationResponse, status_code=status.HTTP_202_ACCEPTED)
def resend_verification(request: ResendVerificationRequest, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == request.email.lower()).first()
    response = RegistrationResponse(
        message="If this address has an unverified account, a verification link has been sent.",
        email=request.email,
    )
    if not user or user.is_active:
        return response

    raw_token = _new_verification_token(db, user)
    db.commit()
    return RegistrationResponse(
        message=response.message,
        email=request.email,
        dev_verification_url=_send_or_dev_link(user, raw_token),
    )


@router.post("/verify-email", response_model=Token)
def verify_email(request: EmailVerificationRequest, db: Session = Depends(get_db)):
    token_hash = hashlib.sha256(request.token.encode("utf-8")).hexdigest()
    verification = db.query(EmailVerificationToken).filter(
        EmailVerificationToken.token_hash == token_hash
    ).first()
    now = _now_naive_utc()
    if (
        not verification
        or verification.used_at is not None
        or verification.expires_at.replace(tzinfo=None) <= now
    ):
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="This verification link is invalid or expired.")

    user = db.query(User).filter(User.id == verification.user_id).first()
    if not user:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="This verification link is invalid or expired.")

    user.is_active = True
    user.email_verified_at = now
    verification.used_at = now
    db.commit()
    db.refresh(user)
    token = create_access_token(subject=user.id)
    user_resp = UserResponse(
        id=user.id,
        email=user.email,
        full_name=user.full_name,
        is_active=user.is_active,
        created_at=user.created_at,
        has_profile=bool(user.profile and user.profile.location),
    )
    return Token(access_token=token, token_type="bearer", user=user_resp)

@router.post("/login", response_model=Token)
def login(user_in: UserLogin, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == user_in.email.lower()).first()
    if not user or not verify_password(user_in.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password."
        )

    if not user.is_active or not user.email_verified_at:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Verify your email address before signing in.",
        )

    has_profile = bool(user.profile and user.profile.location)
    token = create_access_token(subject=user.id)
    user_resp = UserResponse(
        id=user.id,
        email=user.email,
        full_name=user.full_name,
        is_active=user.is_active,
        created_at=user.created_at,
        has_profile=has_profile
    )
    return Token(access_token=token, token_type="bearer", user=user_resp)

@router.post("/logout")
def logout():
    return {"message": "Logged out successfully"}

@router.get("/me", response_model=UserResponse)
def get_me(current_user: User = Depends(get_current_user)):
    has_profile = bool(current_user.profile and current_user.profile.location)
    return UserResponse(
        id=current_user.id,
        email=current_user.email,
        full_name=current_user.full_name,
        is_active=current_user.is_active,
        created_at=current_user.created_at,
        has_profile=has_profile
    )
