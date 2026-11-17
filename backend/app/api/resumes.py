from typing import List
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form, status
from sqlalchemy.orm import Session
from app.database.connection import get_db
from app.models.models import User, Resume, ResumeSection, Skill, ResumeSkill
from app.schemas.schemas import (
    ResumeResponse, ResumeDetailResponse, ResumeSectionResponse,
    ResumeRewriteResponse, ResumeImproveRequest, RolePredictionResponse
)
from app.api.deps import get_current_user
from app.core.storage import storage
from app.services.parser.resume_parser import parse_resume_file
from app.services.ai.resume_analyzer import calculate_transparent_resume_score
from app.services.ai.factory import get_ai_provider
from app.services.ml.role_classifier import classify_resume

router = APIRouter(prefix="/resumes", tags=["Resumes"])

@router.get("", response_model=List[ResumeResponse])
def list_resumes(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    resumes = db.query(Resume).filter(Resume.user_id == current_user.id).order_by(Resume.created_at.desc()).all()
    return resumes

@router.post("/upload", response_model=ResumeDetailResponse)
async def upload_resume(
    file: UploadFile = File(...),
    target_role: str = Form("General"),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    allowed_exts = [".pdf", ".docx", ".doc", ".txt"]
    file_ext = "." + file.filename.split(".")[-1].lower() if "." in file.filename else ""
    if file_ext not in allowed_exts:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Unsupported file format '{file_ext}'. Please upload a PDF or DOCX."
        )

    # Save file using storage abstraction
    saved_path = storage.save_file(file.file, file.filename)

    # Parse resume document
    parsed_result = parse_resume_file(saved_path)
    resume_text = parsed_result.get("text", "")
    sections_data = parsed_result.get("sections", [])
    extracted_skills = parsed_result.get("skills", [])

    # Calculate transparent ATS & quality scores
    analysis = calculate_transparent_resume_score(resume_text, sections_data, extracted_skills)

    # Check if this should be master resume
    existing_count = db.query(Resume).filter(Resume.user_id == current_user.id).count()
    is_master = (existing_count == 0)

    # Create Resume entity
    resume = Resume(
        user_id=current_user.id,
        filename=file.filename,
        file_path=saved_path,
        target_role=target_role,
        is_master=is_master,
        parsed_text=resume_text,
        overall_score=analysis["overall_score"],
        ats_compatibility=analysis["ats_compatibility"],
        technical_skills_score=analysis["technical_skills_score"],
        projects_score=analysis["projects_score"],
        experience_score=analysis["experience_score"],
        keywords_score=analysis["keywords_score"],
        formatting_score=analysis["formatting_score"],
        key_findings=analysis["key_findings"],
        ai_suggestions=analysis["ai_suggestions"],
        missing_keywords=analysis["missing_keywords"],
        extracted_data=parsed_result.get("contact_info", {})
    )
    db.add(resume)
    db.commit()
    db.refresh(resume)

    # Save parsed sections
    for sec in sections_data:
        section_obj = ResumeSection(
            resume_id=resume.id,
            section_type=sec.get("section_type", "general"),
            title=sec.get("title", "Section"),
            original_content=sec.get("content", ""),
            suggested_content=None,
            is_improved=False
        )
        db.add(section_obj)

    # Associate extracted skills
    for s_name in extracted_skills:
        skill = db.query(Skill).filter(Skill.name.ilike(s_name)).first()
        if not skill:
            skill = Skill(name=s_name, category="Technical")
            db.add(skill)
            db.commit()
            db.refresh(skill)
        rs = ResumeSkill(resume_id=resume.id, skill_id=skill.id)
        db.add(rs)

    db.commit()
    db.refresh(resume)

    return _build_detail_response(resume, db)

@router.get("/{resume_id}", response_model=ResumeDetailResponse)
def get_resume(resume_id: str, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    resume = db.query(Resume).filter(Resume.id == resume_id, Resume.user_id == current_user.id).first()
    if not resume:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Resume not found")
    return _build_detail_response(resume, db)

@router.get("/{resume_id}/role-predictions", response_model=RolePredictionResponse)
def predict_resume_roles(resume_id: str, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    resume = db.query(Resume).filter(Resume.id == resume_id, Resume.user_id == current_user.id).first()
    if not resume:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Resume not found")
    private_values = [current_user.full_name, current_user.email]
    private_values.extend(str(value) for value in (resume.extracted_data or {}).values() if value)
    result = classify_resume(resume.parsed_text or "", private_values)
    return RolePredictionResponse(**result)

@router.post("/{resume_id}/analyze", response_model=ResumeDetailResponse)
def reanalyze_resume(resume_id: str, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    resume = db.query(Resume).filter(Resume.id == resume_id, Resume.user_id == current_user.id).first()
    if not resume:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Resume not found")

    sections_data = [{"section_type": s.section_type, "title": s.title, "content": s.original_content} for s in resume.sections]
    skills = [rs.skill.name for rs in resume.resume_skills]
    analysis = calculate_transparent_resume_score(resume.parsed_text or "", sections_data, skills)

    resume.overall_score = analysis["overall_score"]
    resume.ats_compatibility = analysis["ats_compatibility"]
    resume.technical_skills_score = analysis["technical_skills_score"]
    resume.projects_score = analysis["projects_score"]
    resume.experience_score = analysis["experience_score"]
    resume.keywords_score = analysis["keywords_score"]
    resume.formatting_score = analysis["formatting_score"]
    resume.key_findings = analysis["key_findings"]
    resume.ai_suggestions = analysis["ai_suggestions"]
    resume.missing_keywords = analysis["missing_keywords"]

    db.commit()
    db.refresh(resume)
    return _build_detail_response(resume, db)

@router.post("/{resume_id}/improve", response_model=ResumeRewriteResponse)
def improve_resume_bullet(
    resume_id: str,
    improve_req: ResumeImproveRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    resume = db.query(Resume).filter(Resume.id == resume_id, Resume.user_id == current_user.id).first()
    if not resume:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Resume not found")

    target_section = None
    if improve_req.section_id:
        target_section = db.query(ResumeSection).filter(
            ResumeSection.id == improve_req.section_id,
            ResumeSection.resume_id == resume.id
        ).first()

    original_text = (
        target_section.original_content if target_section
        else (improve_req.instruction or "Worked on an AI project using Python.")
    )

    ai_provider = get_ai_provider()
    result = ai_provider.rewrite_bullet(original_text, context=resume.target_role)

    if target_section:
        target_section.suggested_content = result["suggested"]
        db.commit()

    return ResumeRewriteResponse(
        original=result["original"],
        suggested=result["suggested"],
        reasoning=result["reasoning"]
    )

@router.delete("/{resume_id}")
def delete_resume(resume_id: str, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    resume = db.query(Resume).filter(Resume.id == resume_id, Resume.user_id == current_user.id).first()
    if not resume:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Resume not found")

    storage.delete_file(resume.file_path)
    db.delete(resume)
    db.commit()
    return {"message": "Resume deleted successfully"}

def _build_detail_response(resume: Resume, db: Session) -> ResumeDetailResponse:
    skills = [rs.skill.name for rs in resume.resume_skills]
    sections = [
        ResumeSectionResponse(
            id=s.id,
            section_type=s.section_type,
            title=s.title,
            original_content=s.original_content,
            suggested_content=s.suggested_content,
            is_improved=s.is_improved
        )
        for s in resume.sections
    ]
    return ResumeDetailResponse(
        id=resume.id,
        filename=resume.filename,
        file_path=resume.file_path,
        target_role=resume.target_role,
        is_master=resume.is_master,
        parsed_text=resume.parsed_text,
        overall_score=resume.overall_score,
        ats_compatibility=resume.ats_compatibility,
        technical_skills_score=resume.technical_skills_score,
        projects_score=resume.projects_score,
        experience_score=resume.experience_score,
        keywords_score=resume.keywords_score,
        formatting_score=resume.formatting_score,
        key_findings=resume.key_findings or [],
        ai_suggestions=resume.ai_suggestions or [],
        missing_keywords=resume.missing_keywords or [],
        extracted_data=resume.extracted_data or {},
        sections=sections,
        skills=skills,
        created_at=resume.created_at
    )
