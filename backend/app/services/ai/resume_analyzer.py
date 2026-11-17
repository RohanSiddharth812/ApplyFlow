import re
from typing import Dict, Any, List
from app.services.ai.factory import get_ai_provider

def calculate_transparent_resume_score(text: str, sections: List[Dict[str, str]], skills: List[str]) -> Dict[str, Any]:
    text_lower = text.lower()
    words = text.split()
    word_count = len(words)

    # 1. ATS Compatibility (0 - 100)
    # Check for standard sections, contact info, lack of bizarre symbols, reasonable word count
    ats_score = 50
    has_email = bool(re.search(r'[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+', text))
    has_phone = bool(re.search(r'\d{3}[-.\s]?\d{3}[-.\s]?\d{4}', text))
    if has_email:
        ats_score += 10
    if has_phone:
        ats_score += 10
    if word_count >= 200:
        ats_score += 15
    section_types = {s.get("section_type", "") for s in sections}
    if "education" in section_types:
        ats_score += 5
    if "experience" in section_types:
        ats_score += 5
    if "skills" in section_types:
        ats_score += 5
    ats_score = min(98, ats_score)

    # 2. Technical Skills Score (0 - 100)
    tech_score = 40
    if len(skills) >= 10:
        tech_score = 90
    elif len(skills) >= 6:
        tech_score = 80
    elif len(skills) >= 3:
        tech_score = 65
    else:
        tech_score = 50

    # 3. Projects Score (0 - 100)
    # Check for metrics, action verbs, project keywords
    projects_score = 60
    has_numbers = len(re.findall(r'\b\d+[%kKmM]?\b', text))
    if has_numbers > 8:
        projects_score += 25
    elif has_numbers > 3:
        projects_score += 15
    action_verbs = ["built", "developed", "architected", "engineered", "implemented", "deployed", "optimized", "created"]
    verb_matches = sum(1 for v in action_verbs if v in text_lower)
    if verb_matches >= 4:
        projects_score += 10
    projects_score = min(95, projects_score)

    # 4. Experience Score (0 - 100)
    exp_score = 70
    if "experience" in section_types:
        exp_score += 15
    if any(k in text_lower for k in ["intern", "engineer", "developer", "lead", "assistant"]):
        exp_score += 5
    exp_score = min(95, exp_score)

    # 5. Keywords Score (0 - 100)
    keywords_score = min(96, 60 + len(skills) * 3)

    # 6. Formatting Score (0 - 100)
    formatting_score = 85
    if 250 <= word_count <= 800:
        formatting_score += 5
    if len(sections) >= 4:
        formatting_score += 5

    # Overall Transparent Weighted Calculation:
    # ATS: 25%, Tech: 25%, Projects: 15%, Exp: 15%, Keywords: 10%, Formatting: 10%
    overall_score = round(
        (ats_score * 0.25) +
        (tech_score * 0.25) +
        (projects_score * 0.15) +
        (exp_score * 0.15) +
        (keywords_score * 0.10) +
        (formatting_score * 0.10)
    )

    provider = get_ai_provider()
    ai_insights = provider.analyze_resume(text, "Software / AI Engineer")

    # Find missing keywords from tech taxonomy
    standard_target_keywords = ["Docker", "Kubernetes", "FastAPI", "CI/CD", "System Design", "AWS", "Git"]
    missing = [k for k in standard_target_keywords if k.lower() not in text_lower]

    return {
        "overall_score": overall_score,
        "ats_compatibility": ats_score,
        "technical_skills_score": tech_score,
        "projects_score": projects_score,
        "experience_score": exp_score,
        "keywords_score": keywords_score,
        "formatting_score": formatting_score,
        "key_findings": ai_insights.get("key_findings", [
            "Project descriptions are slightly generic and need measurable outcomes.",
            "Technical skills section is well structured with relevant modern tools.",
            "Some high-demand DevOps and deployment keywords are missing."
        ]),
        "ai_suggestions": ai_insights.get("ai_suggestions", [
            "Add measurable results to project bullets (e.g., improved response time by 40%).",
            "Add relevant keywords such as Docker, Kubernetes, and CI/CD.",
            "Move technical skills higher up in the resume layout for faster recruiter scanning.",
            "Create role-specific versions emphasizing your strongest domain projects."
        ]),
        "missing_keywords": missing or ["Docker", "Kubernetes", "FastAPI"]
    }
