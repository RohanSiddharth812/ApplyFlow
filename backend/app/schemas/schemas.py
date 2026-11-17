from pydantic import BaseModel, EmailStr, Field, ConfigDict
from typing import List, Optional, Dict, Any
from datetime import datetime

# --- Auth & User ---
class UserBase(BaseModel):
    email: EmailStr
    full_name: str

class UserRegister(UserBase):
    password: str

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class EmailVerificationRequest(BaseModel):
    token: str

class ResendVerificationRequest(BaseModel):
    email: EmailStr

class RegistrationResponse(BaseModel):
    message: str
    email: EmailStr
    dev_verification_url: Optional[str] = None

class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: "UserResponse"

class UserResponse(UserBase):
    id: str
    is_active: bool
    created_at: datetime
    has_profile: bool = False

    model_config = ConfigDict(from_attributes=True)

# --- Profile ---
class ProfileBase(BaseModel):
    phone: Optional[str] = None
    location: Optional[str] = None
    preferred_locations: List[str] = Field(default_factory=list)
    job_types: List[str] = Field(default_factory=list)
    experience_level: str = "Fresher (0-1 years)"
    target_roles: List[str] = Field(default_factory=list)
    bio: Optional[str] = None

class ProfileUpdate(ProfileBase):
    full_name: Optional[str] = None
    skills: Optional[List[str]] = None

class ProfileResponse(ProfileBase):
    id: str
    user_id: str
    full_name: Optional[str] = None
    email: Optional[str] = None
    created_at: datetime
    skills: List[str] = Field(default_factory=list)

    model_config = ConfigDict(from_attributes=True)

# --- Skills ---
class SkillResponse(BaseModel):
    id: str
    name: str
    category: str

    model_config = ConfigDict(from_attributes=True)

class UserSkillCreate(BaseModel):
    skills: List[str]

# --- Resumes ---
class ResumeSectionResponse(BaseModel):
    id: str
    section_type: str
    title: str
    original_content: str
    suggested_content: Optional[str] = None
    is_improved: bool

    model_config = ConfigDict(from_attributes=True)

class ResumeBase(BaseModel):
    filename: str
    target_role: str = "General"
    is_master: bool = False

class ResumeResponse(ResumeBase):
    id: str
    overall_score: int
    ats_compatibility: int
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)

class ResumeDetailResponse(ResumeResponse):
    file_path: str
    parsed_text: Optional[str] = None
    technical_skills_score: int
    projects_score: int
    experience_score: int
    keywords_score: int
    formatting_score: int
    key_findings: List[str] = []
    ai_suggestions: List[str] = []
    missing_keywords: List[str] = []
    extracted_data: Dict[str, Any] = {}
    sections: List[ResumeSectionResponse] = []
    skills: List[str] = []

    model_config = ConfigDict(from_attributes=True)

class RolePrediction(BaseModel):
    role: str

class RolePredictionResponse(BaseModel):
    algorithm: str
    metrics: Dict[str, float]
    predictions: List[RolePrediction]

class ResumeImproveRequest(BaseModel):
    section_id: Optional[str] = None
    instruction: Optional[str] = None

class ResumeRewriteResponse(BaseModel):
    original: str
    suggested: str
    reasoning: str

# --- Jobs ---
class JobSourceResponse(BaseModel):
    source_name: str
    source_url: str

    model_config = ConfigDict(from_attributes=True)

class JobBase(BaseModel):
    title: str
    company: str
    company_logo: Optional[str] = None
    description: str
    location: str
    employment_type: str
    experience_level: str
    salary_range: Optional[str] = None
    is_remote: bool
    is_internship: bool
    posted_date: str
    application_url: str

class JobResponse(JobBase):
    id: str
    sources_count: int = 1
    sources: List[JobSourceResponse] = []
    required_skills: List[str] = []
    match_percentage: Optional[int] = None
    is_saved: bool = False

    model_config = ConfigDict(from_attributes=True)

class JobMatchResponse(BaseModel):
    overall_match: int
    skill_match: int
    experience_match: int
    education_match: int
    project_match: int
    location_match: int
    role_match: int
    why_match: List[str] = []
    missing_skills: List[str] = []
    experience_gap: Optional[str] = None
    recommended_resume_id: Optional[str] = None
    recommended_resume_name: Optional[str] = None

class JobDetailResponse(JobResponse):
    match_analysis: Optional[JobMatchResponse] = None
    similar_jobs: List[JobResponse] = []

class JobSearchQuery(BaseModel):
    query: Optional[str] = None
    role: Optional[str] = None
    location: Optional[str] = None
    experience: Optional[str] = None
    employment_type: Optional[str] = None
    is_remote: Optional[bool] = None
    is_internship: Optional[bool] = None
    tab: Optional[str] = "all"  # all, recommended, internships, saved

# --- Applications & Copilot ---
class ApplicationPrepareRequest(BaseModel):
    job_id: str
    resume_id: Optional[str] = None

class ApplicationAnswerResponse(BaseModel):
    id: Optional[str] = None
    question: str
    answer: str

class ApplicationPrepareResponse(BaseModel):
    job: JobResponse
    recommended_resume: Optional[ResumeResponse] = None
    all_resumes: List[ResumeResponse] = []
    generated_cover_letter: str
    suggested_answers: List[ApplicationAnswerResponse] = []
    match_percentage: int = 0

class ApplicationCreate(BaseModel):
    job_id: str
    resume_id: str
    cover_letter: str
    answers: List[ApplicationAnswerResponse] = []
    notes: Optional[str] = None
    confirmed_human_review: bool = True

class ApplicationUpdate(BaseModel):
    status: Optional[str] = None
    notes: Optional[str] = None

class ApplicationResponse(BaseModel):
    id: str
    job_id: str
    job_title: str
    company: str
    company_logo: Optional[str] = None
    location: str
    employment_type: str
    resume_name: Optional[str] = None
    resume_id: Optional[str] = None
    status: str
    applied_date: datetime
    job_url: Optional[str] = None
    notes: Optional[str] = None

    model_config = ConfigDict(from_attributes=True)

class ApplicationDetailResponse(ApplicationResponse):
    cover_letter: Optional[str] = None
    answers: List[ApplicationAnswerResponse] = []

# --- Learning Hub ---
class LearningItemResponse(BaseModel):
    id: str
    week_number: int
    week_title: str
    topic: str
    description: Optional[str] = None
    resource_url: Optional[str] = None
    is_completed: bool

    model_config = ConfigDict(from_attributes=True)

class LearningPathResponse(BaseModel):
    id: str
    title: str
    description: Optional[str] = None
    target_skill: str
    gap_percentage: int
    progress_percentage: int
    items: List[LearningItemResponse] = []

    model_config = ConfigDict(from_attributes=True)

class SkillGapItem(BaseModel):
    skill: str
    gap_percentage: int

class LearningHubOverview(BaseModel):
    skill_gaps: List[SkillGapItem]
    roadmap: List[LearningPathResponse]

# --- Mock Interview ---
class InterviewCreate(BaseModel):
    job_id: Optional[str] = None
    role: str
    difficulty: str = "Medium"

class InterviewQuestionResponse(BaseModel):
    id: str
    question: str
    question_type: str
    user_answer: Optional[str] = None
    feedback: Optional[str] = None
    score: Optional[int] = None

    model_config = ConfigDict(from_attributes=True)

class InterviewResponse(BaseModel):
    id: str
    role: str
    difficulty: str
    overall_score: int
    feedback_summary: Optional[str] = None
    status: str
    created_at: datetime
    questions: List[InterviewQuestionResponse] = []

    model_config = ConfigDict(from_attributes=True)

class InterviewAnswerRequest(BaseModel):
    question_id: str
    answer: str

# --- Analytics ---
class SkillTrendItem(BaseModel):
    name: str
    count: int

class AnalyticsOverview(BaseModel):
    total_applications: int
    applied_count: int
    assessment_count: int
    interview_count: int
    rejected_count: int
    offer_count: int
    interview_rate: float
    response_rate: float
    applications_by_role: Dict[str, int]
    applications_by_location: Dict[str, int]
    applications_by_resume: Dict[str, int]
    applications_over_time: List[Dict[str, Any]]
    most_requested_skills: List[SkillTrendItem]
    common_missing_skills: List[SkillTrendItem]
