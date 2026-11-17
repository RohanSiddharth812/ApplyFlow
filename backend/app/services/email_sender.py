"""Transactional email delivery through Brevo."""
from html import escape

import httpx

from app.core.config import settings


class EmailDeliveryError(RuntimeError):
    pass


def send_verification_email(email: str, full_name: str, verification_url: str) -> bool:
    """Send a verification link; return False when dev mode has no provider key."""
    if not settings.BREVO_API_KEY:
        if settings.APP_ENV.lower() == "production":
            raise EmailDeliveryError("Brevo is not configured for production email delivery.")
        return False
    if not settings.BREVO_SENDER_EMAIL:
        raise EmailDeliveryError("Configure BREVO_SENDER_EMAIL with a verified Brevo sender.")

    safe_name = escape(full_name or "there")
    safe_url = escape(verification_url, quote=True)
    payload = {
        "sender": {"name": settings.BREVO_SENDER_NAME, "email": settings.BREVO_SENDER_EMAIL},
        "to": [{"email": email, "name": full_name}],
        "subject": "Verify your ApplyFlow email",
        "htmlContent": (
            f"<p>Hello {safe_name},</p>"
            "<p>Verify your email address to finish creating your ApplyFlow account.</p>"
            f'<p><a href="{safe_url}">Verify email address</a></p>'
            f"<p>This link expires in {settings.EMAIL_VERIFICATION_TTL_MINUTES // 60} hours and can only be used once.</p>"
            "<p>If you did not create an account, you can ignore this email.</p>"
        ),
        "textContent": (
            f"Hello {full_name or 'there'},\n\n"
            "Verify your email address to finish creating your ApplyFlow account:\n"
            f"{verification_url}\n\n"
            f"This link expires in {settings.EMAIL_VERIFICATION_TTL_MINUTES // 60} hours and can only be used once."
        ),
    }
    try:
        response = httpx.post(
            "https://api.brevo.com/v3/smtp/email",
            headers={"api-key": settings.BREVO_API_KEY, "accept": "application/json"},
            json=payload,
            timeout=15,
        )
        response.raise_for_status()
    except httpx.HTTPError as exc:
        raise EmailDeliveryError("Brevo could not send the verification email.") from exc
    return True
