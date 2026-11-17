from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database.connection import get_db
from app.models.models import User, Profile, Skill, UserSkill
from app.schemas.schemas import ProfileResponse, ProfileUpdate
from app.api.deps import get_current_user

router = APIRouter(prefix="/profile", tags=["Profile"])

@router.get("", response_model=ProfileResponse)
def get_profile(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    profile = current_user.profile
    if not profile:
        profile = Profile(user_id=current_user.id)
        db.add(profile)
        db.commit()
        db.refresh(profile)

    skills = [us.skill.name for us in current_user.user_skills]
    return ProfileResponse(
        id=profile.id,
        user_id=current_user.id,
        full_name=current_user.full_name,
        email=current_user.email,
        phone=profile.phone,
        location=profile.location,
        preferred_locations=profile.preferred_locations or [],
        job_types=profile.job_types or [],
        experience_level=profile.experience_level or "Fresher (0-1 years)",
        target_roles=profile.target_roles or [],
        bio=profile.bio,
        created_at=profile.created_at,
        skills=skills
    )

@router.put("", response_model=ProfileResponse)
def update_profile(
    profile_in: ProfileUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    profile = current_user.profile
    if not profile:
        profile = Profile(user_id=current_user.id)
        db.add(profile)

    if profile_in.full_name:
        current_user.full_name = profile_in.full_name

    profile.phone = profile_in.phone
    profile.location = profile_in.location
    profile.preferred_locations = profile_in.preferred_locations
    profile.job_types = profile_in.job_types
    profile.experience_level = profile_in.experience_level
    profile.target_roles = profile_in.target_roles
    profile.bio = profile_in.bio

    if profile_in.skills is not None:
        db.query(UserSkill).filter(UserSkill.user_id == current_user.id).delete()
        unique_names = {name.strip().casefold(): name.strip() for name in profile_in.skills if name.strip()}
        for name in unique_names.values():
            skill = db.query(Skill).filter(Skill.name.ilike(name)).first()
            if not skill:
                skill = Skill(name=name, category="Technical")
                db.add(skill)
                db.flush()
            db.add(UserSkill(user_id=current_user.id, skill_id=skill.id))

    db.commit()
    db.refresh(profile)

    skills = [us.skill.name for us in current_user.user_skills]
    return ProfileResponse(
        id=profile.id,
        user_id=current_user.id,
        full_name=current_user.full_name,
        email=current_user.email,
        phone=profile.phone,
        location=profile.location,
        preferred_locations=profile.preferred_locations or [],
        job_types=profile.job_types or [],
        experience_level=profile.experience_level,
        target_roles=profile.target_roles or [],
        bio=profile.bio,
        created_at=profile.created_at,
        skills=skills
    )
