import re
from typing import Dict, Any, List, Optional
from app.models.models import Job, Resume, Profile

DEFAULT_WEIGHTS = {
    "skill": 0.35,
    "experience": 0.20,
    "education": 0.15,
    "projects": 0.10,
    "location": 0.10,
    "role": 0.10
}

def calculate_job_match(
    job: Job,
    resume: Optional[Resume] = None,
    profile: Optional[Profile] = None,
    weights: Dict[str, float] = DEFAULT_WEIGHTS
) -> Dict[str, Any]:
    resume_text = (resume.parsed_text or "").lower() if resume else ""
    job_desc = (job.description or "").lower()
    job_title = (job.title or "").lower()
    
    # 1. Skill Match (35%)
    job_skills = [js.skill.name for js in job.job_skills] if job.job_skills else []
    if not job_skills:
        # Fallback extract keywords from job description
        from app.services.parser.resume_parser import extract_skills_from_text
        job_skills = extract_skills_from_text(job.description)
    
    matched_skills = []
    missing_skills = []
    
    for s in job_skills:
        s_lower = s.lower()
        if s_lower in resume_text:
            matched_skills.append(s)
        else:
            missing_skills.append(s)
            
    if job_skills:
        skill_score = round((len(matched_skills) / len(job_skills)) * 100)
    else:
        skill_score = 80

    # 2. Experience Match (20%)
    job_exp_req = job.experience_level or "Fresher"
    user_exp = profile.experience_level if profile else "Fresher (0-1 years)"
    
    exp_score = 75
    experience_gap = None
    if "fresher" in job_exp_req.lower() or "intern" in job.title.lower():
        exp_score = 95
        experience_gap = "Direct match: Position welcomes fresh graduates and early career applicants."
    elif "1-2" in job_exp_req or "1-3" in job_exp_req:
        if "fresher" in user_exp.lower():
            exp_score = 80
            experience_gap = f"Job requires {job_exp_req}. Candidate has project and academic experience."
        else:
            exp_score = 90
            experience_gap = "Matches 1-3 years professional background."
    elif "senior" in job_exp_req.lower():
        exp_score = 50
        experience_gap = f"Job requires senior experience ({job_exp_req}). May present growth opportunity."
    else:
        exp_score = 85
        experience_gap = f"Target experience: {job_exp_req}."

    # 3. Education Match (15%)
    # Standard engineering / tech background check
    edu_score = 90
    if any(deg in resume_text for deg in ["bachelor", "b.tech", "b.e", "computer science", "engineering", "degree", "m.tech", "ms"]):
        edu_score = 95
    else:
        edu_score = 80

    # 4. Projects Match (10%)
    project_score = 80
    for keyword in ["project", "developed", "built", "implemented", "system"]:
        if keyword in resume_text:
            project_score += 3
    project_score = min(98, project_score)

    # 5. Location Match (10%)
    loc_score = 70
    if job.is_remote:
        loc_score = 100
    elif profile and profile.location and profile.location.lower() in job.location.lower():
        loc_score = 100
    elif profile and profile.preferred_locations:
        if any(pref.lower() in job.location.lower() for pref in profile.preferred_locations):
            loc_score = 95
        else:
            loc_score = 65
    else:
        loc_score = 80

    # 6. Role Alignment (10%)
    role_score = 70
    if profile and profile.target_roles:
        if any(tr.lower() in job_title for tr in profile.target_roles):
            role_score = 95
    elif resume and resume.target_role.lower() in job_title:
        role_score = 90
    else:
        role_score = 80

    # Weighted Overall Score
    w = weights
    overall = round(
        (skill_score * w.get("skill", 0.35)) +
        (exp_score * w.get("experience", 0.20)) +
        (edu_score * w.get("education", 0.15)) +
        (project_score * w.get("projects", 0.10)) +
        (loc_score * w.get("location", 0.10)) +
        (role_score * w.get("role", 0.10))
    )
    overall_match = min(99, max(40, overall))

    # Why you match points
    why_match = matched_skills[:6] if matched_skills else ["Python", "Problem Solving", "Software Engineering"]

    return {
        "overall_match": overall_match,
        "skill_match": skill_score,
        "experience_match": exp_score,
        "education_match": edu_score,
        "project_match": project_score,
        "location_match": loc_score,
        "role_match": role_score,
        "why_match": why_match,
        "missing_skills": missing_skills[:5] if missing_skills else ["Docker", "Kubernetes"],
        "experience_gap": experience_gap,
        "recommended_resume_id": resume.id if resume else None,
        "recommended_resume_name": resume.filename if resume else None
    }
