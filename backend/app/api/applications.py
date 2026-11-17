from typing import List, Optional
from datetime import datetime, timezone
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session
from app.database.connection import get_db
from app.models.models import (
    User, Application, ApplicationAnswer, CoverLetter, Job, Resume, JobMatch
)
from app.schemas.schemas import (
    ApplicationCreate, ApplicationUpdate, ApplicationResponse,
    ApplicationDetailResponse, ApplicationPrepareResponse, ApplicationAnswerResponse,
    JobResponse, ResumeResponse
)
from app.api.deps import get_current_user
from app.services.ai.factory import get_ai_provider
from app.services.ai.job_matcher import calculate_job_match

router = APIRouter(prefix="/applications", tags=["Applications"])

@router.get("", response_model=List[ApplicationResponse])
def list_applications(
    status_filter: Optional[str] = Query(None, alias="status"),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    q = db.query(Application).filter(Application.user_id == current_user.id)
    if status_filter and status_filter.lower() != "all":
        q = q.filter(Application.status.ilike(status_filter))

    applications = q.order_by(Application.applied_date.desc()).all()
    results = []
    for app in applications:
        results.append(ApplicationResponse(
            id=app.id,
            job_id=app.job_id,
            job_title=app.job.title if app.job else "Position",
            company=app.job.company if app.job else "Company",
            company_logo=app.job.company_logo if app.job else None,
            location=app.job.location if app.job else "Remote",
            employment_type=app.job.employment_type if app.job else "Full-time",
            resume_name=app.resume.filename if app.resume else "Primary Resume",
            resume_id=app.resume_id,
            status=app.status,
            applied_date=app.applied_date or app.created_at,
            job_url=app.job_url or (app.job.application_url if app.job else None),
            notes=app.notes
        ))
    return results

@router.post("/prepare", response_model=ApplicationPrepareResponse)
def prepare_application(
    job_id: str = Query(...),
    resume_id: Optional[str] = None,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    job = db.query(Job).filter(Job.id == job_id).first()
    if not job:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Job not found")

    user_resumes = db.query(Resume).filter(Resume.user_id == current_user.id).all()
    
    # Select best resume automatically
    recommended_resume = None
    if resume_id:
        recommended_resume = db.query(Resume).filter(Resume.id == resume_id, Resume.user_id == current_user.id).first()
    
    if not recommended_resume and user_resumes:
        # Find resume with highest overall score or matching target role
        recommended_resume = max(user_resumes, key=lambda r: r.overall_score)

    match_result = calculate_job_match(job, resume=recommended_resume, profile=current_user.profile)
    ai_provider = get_ai_provider()

    # User profile payload for AI
    user_prof = {
        "full_name": current_user.full_name,
        "email": current_user.email,
        "location": current_user.profile.location if current_user.profile else "India",
        "experience_level": current_user.profile.experience_level if current_user.profile else "Fresher"
    }
    job_dict = {
        "title": job.title,
        "company": job.company,
        "description": job.description,
        "location": job.location
    }
    resume_text = recommended_resume.parsed_text if recommended_resume else ""

    # Generate custom cover letter
    cover_letter = ai_provider.generate_cover_letter(user_prof, resume_text, job_dict)

    # Prepare answers for standard application questions
    standard_questions = [
        "Why are you interested in this position?",
        "Why should we hire you?",
        "Describe your experience with Python.",
        "Expected salary?",
        "Notice period / availability?"
    ]
    answers_data = ai_provider.answer_application_questions(standard_questions, user_prof, resume_text, job_dict)
    suggested_answers = [ApplicationAnswerResponse(question=item["question"], answer=item["answer"]) for item in answers_data]

    job_resp = JobResponse(
        id=job.id,
        title=job.title,
        company=job.company,
        company_logo=job.company_logo,
        description=job.description,
        location=job.location,
        employment_type=job.employment_type,
        experience_level=job.experience_level,
        salary_range=job.salary_range,
        is_remote=job.is_remote,
        is_internship=job.is_internship,
        posted_date=job.posted_date,
        application_url=job.application_url,
        sources_count=1,
        sources=[],
        required_skills=[js.skill.name for js in job.job_skills],
        match_percentage=match_result["overall_match"],
        is_saved=False
    )

    all_resumes_resp = [
        ResumeResponse(
            id=r.id,
            filename=r.filename,
            target_role=r.target_role,
            is_master=r.is_master,
            overall_score=r.overall_score,
            ats_compatibility=r.ats_compatibility,
            created_at=r.created_at
        )
        for r in user_resumes
    ]

    rec_resume_resp = None
    if recommended_resume:
        rec_resume_resp = ResumeResponse(
            id=recommended_resume.id,
            filename=recommended_resume.filename,
            target_role=recommended_resume.target_role,
            is_master=recommended_resume.is_master,
            overall_score=recommended_resume.overall_score,
            ats_compatibility=recommended_resume.ats_compatibility,
            created_at=recommended_resume.created_at
        )

    return ApplicationPrepareResponse(
        job=job_resp,
        recommended_resume=rec_resume_resp,
        all_resumes=all_resumes_resp,
        generated_cover_letter=cover_letter,
        suggested_answers=suggested_answers,
        match_percentage=match_result["overall_match"]
    )

@router.post("", response_model=ApplicationDetailResponse)
def submit_application(
    app_in: ApplicationCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    if not app_in.confirmed_human_review:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Mandatory human review confirmation required before submission."
        )

    job = db.query(Job).filter(Job.id == app_in.job_id).first()
    if not job:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Job not found")

    # Create application record
    app = Application(
        user_id=current_user.id,
        job_id=job.id,
        resume_id=app_in.resume_id,
        status="Applied",
        applied_date=datetime.now(timezone.utc).replace(tzinfo=None),
        job_url=job.application_url,
        notes=app_in.notes or "Applied via ApplyFlow Application Copilot."
    )
    db.add(app)
    db.commit()
    db.refresh(app)

    # Save cover letter
    cl = CoverLetter(
        application_id=app.id,
        user_id=current_user.id,
        job_id=job.id,
        content=app_in.cover_letter
    )
    db.add(cl)

    # Save answers
    for item in app_in.answers:
        ans = ApplicationAnswer(
            application_id=app.id,
            question=item.question,
            answer=item.answer
        )
        db.add(ans)

    db.commit()
    db.refresh(app)

    return _build_application_detail(app)

@router.get("/{app_id}", response_model=ApplicationDetailResponse)
def get_application(app_id: str, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    app = db.query(Application).filter(Application.id == app_id, Application.user_id == current_user.id).first()
    if not app:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Application not found")
    return _build_application_detail(app)

@router.put("/{app_id}", response_model=ApplicationDetailResponse)
def update_application(
    app_id: str,
    app_update: ApplicationUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    app = db.query(Application).filter(Application.id == app_id, Application.user_id == current_user.id).first()
    if not app:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Application not found")

    if app_update.status:
        app.status = app_update.status
    if app_update.notes is not None:
        app.notes = app_update.notes

    db.commit()
    db.refresh(app)
    return _build_application_detail(app)

def _build_application_detail(app: Application) -> ApplicationDetailResponse:
    answers_resp = [
        ApplicationAnswerResponse(id=ans.id, question=ans.question, answer=ans.answer)
        for ans in app.answers
    ]
    return ApplicationDetailResponse(
        id=app.id,
        job_id=app.job_id,
        job_title=app.job.title if app.job else "Job Position",
        company=app.job.company if app.job else "Company",
        company_logo=app.job.company_logo if app.job else None,
        location=app.job.location if app.job else "Remote",
        employment_type=app.job.employment_type if app.job else "Full-time",
        resume_name=app.resume.filename if app.resume else "Primary Resume",
        resume_id=app.resume_id,
        status=app.status,
        applied_date=app.applied_date or app.created_at,
        job_url=app.job_url,
        notes=app.notes,
        cover_letter=app.cover_letter.content if app.cover_letter else None,
        answers=answers_resp
    )
