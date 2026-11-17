import uuid
from datetime import datetime, timezone
from sqlalchemy import (
    Column, String, Integer, Float, Boolean, Text, ForeignKey, DateTime, JSON
)
from sqlalchemy.orm import relationship
from app.database.connection import Base

def generate_uuid() -> str:
    return str(uuid.uuid4())

def utc_now() -> datetime:
    return datetime.now(timezone.utc)

class User(Base):
    __tablename__ = "users"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    email = Column(String(255), unique=True, index=True, nullable=False)
    hashed_password = Column(String(255), nullable=False)
    full_name = Column(String(255), nullable=False)
    is_active = Column(Boolean, default=True)
    email_verified_at = Column(DateTime(timezone=True), nullable=True)
    created_at = Column(DateTime(timezone=True), default=utc_now)
    updated_at = Column(DateTime(timezone=True), default=utc_now, onupdate=utc_now)

    # Relationships
    profile = relationship("Profile", back_populates="user", uselist=False, cascade="all, delete-orphan")
    resumes = relationship("Resume", back_populates="user", cascade="all, delete-orphan")
    user_skills = relationship("UserSkill", back_populates="user", cascade="all, delete-orphan")
    applications = relationship("Application", back_populates="user", cascade="all, delete-orphan")
    saved_jobs = relationship("SavedJob", back_populates="user", cascade="all, delete-orphan")
    job_matches = relationship("JobMatch", back_populates="user", cascade="all, delete-orphan")
    interviews = relationship("Interview", back_populates="user", cascade="all, delete-orphan")
    learning_paths = relationship("LearningPath", back_populates="user", cascade="all, delete-orphan")
    notifications = relationship("Notification", back_populates="user", cascade="all, delete-orphan")


class EmailVerificationToken(Base):
    __tablename__ = "email_verification_tokens"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    user_id = Column(String(36), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    token_hash = Column(String(64), unique=True, nullable=False, index=True)
    expires_at = Column(DateTime(timezone=True), nullable=False)
    used_at = Column(DateTime(timezone=True), nullable=True)
    created_at = Column(DateTime(timezone=True), default=utc_now, nullable=False)

    user = relationship("User")


class Profile(Base):
    __tablename__ = "profiles"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    user_id = Column(String(36), ForeignKey("users.id", ondelete="CASCADE"), unique=True, nullable=False)
    phone = Column(String(50), nullable=True)
    location = Column(String(255), nullable=True)
    preferred_locations = Column(JSON, default=list)  # e.g. ["Hyderabad", "Bengaluru", "Remote"]
    job_types = Column(JSON, default=list)  # e.g. ["Full-time", "Internship"]
    experience_level = Column(String(50), default="Fresher (0-1 years)")
    target_roles = Column(JSON, default=list)  # e.g. ["AI Engineer", "Software Engineer"]
    bio = Column(Text, nullable=True)
    created_at = Column(DateTime(timezone=True), default=utc_now)
    updated_at = Column(DateTime(timezone=True), default=utc_now, onupdate=utc_now)

    user = relationship("User", back_populates="profile")


class Resume(Base):
    __tablename__ = "resumes"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    user_id = Column(String(36), ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    filename = Column(String(255), nullable=False)
    file_path = Column(String(500), nullable=False)
    target_role = Column(String(100), default="General")
    is_master = Column(Boolean, default=False)
    parsed_text = Column(Text, nullable=True)
    
    # Detailed Scores (0-100)
    overall_score = Column(Integer, default=0)
    ats_compatibility = Column(Integer, default=0)
    technical_skills_score = Column(Integer, default=0)
    projects_score = Column(Integer, default=0)
    experience_score = Column(Integer, default=0)
    keywords_score = Column(Integer, default=0)
    formatting_score = Column(Integer, default=0)

    # Structured Insights
    key_findings = Column(JSON, default=list)
    ai_suggestions = Column(JSON, default=list)
    missing_keywords = Column(JSON, default=list)
    extracted_data = Column(JSON, default=dict)  # extracted education, experience, projects, skills

    created_at = Column(DateTime(timezone=True), default=utc_now)
    updated_at = Column(DateTime(timezone=True), default=utc_now, onupdate=utc_now)

    user = relationship("User", back_populates="resumes")
    sections = relationship("ResumeSection", back_populates="resume", cascade="all, delete-orphan")
    resume_skills = relationship("ResumeSkill", back_populates="resume", cascade="all, delete-orphan")
    job_matches = relationship("JobMatch", back_populates="resume", cascade="all, delete-orphan")


class ResumeSection(Base):
    __tablename__ = "resume_sections"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    resume_id = Column(String(36), ForeignKey("resumes.id", ondelete="CASCADE"), nullable=False)
    section_type = Column(String(50), nullable=False)  # summary, experience, project, education, skills
    title = Column(String(255), nullable=False)
    original_content = Column(Text, nullable=False)
    suggested_content = Column(Text, nullable=True)
    is_improved = Column(Boolean, default=False)
    created_at = Column(DateTime(timezone=True), default=utc_now)

    resume = relationship("Resume", back_populates="sections")


class Skill(Base):
    __tablename__ = "skills"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    name = Column(String(100), unique=True, index=True, nullable=False)
    category = Column(String(50), default="Technical")  # AI/ML, Backend, Cloud, Frontend, Database, Tools
    created_at = Column(DateTime(timezone=True), default=utc_now)

    user_skills = relationship("UserSkill", back_populates="skill", cascade="all, delete-orphan")
    resume_skills = relationship("ResumeSkill", back_populates="skill", cascade="all, delete-orphan")
    job_skills = relationship("JobSkill", back_populates="skill", cascade="all, delete-orphan")


class UserSkill(Base):
    __tablename__ = "user_skills"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    user_id = Column(String(36), ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    skill_id = Column(String(36), ForeignKey("skills.id", ondelete="CASCADE"), nullable=False)
    proficiency = Column(String(50), default="Intermediate")

    user = relationship("User", back_populates="user_skills")
    skill = relationship("Skill", back_populates="user_skills")


class ResumeSkill(Base):
    __tablename__ = "resume_skills"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    resume_id = Column(String(36), ForeignKey("resumes.id", ondelete="CASCADE"), nullable=False)
    skill_id = Column(String(36), ForeignKey("skills.id", ondelete="CASCADE"), nullable=False)

    resume = relationship("Resume", back_populates="resume_skills")
    skill = relationship("Skill", back_populates="resume_skills")


class Job(Base):
    __tablename__ = "jobs"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    title = Column(String(255), index=True, nullable=False)
    company = Column(String(255), index=True, nullable=False)
    company_logo = Column(String(500), nullable=True)
    description = Column(Text, nullable=False)
    location = Column(String(255), nullable=False)
    employment_type = Column(String(50), default="Full-time")  # Full-time, Internship, Contract
    experience_level = Column(String(50), default="Fresher")  # Fresher, 1-3 years, Senior
    salary_range = Column(String(100), nullable=True)  # e.g. "$90,000 - $120,000 / yr" or "₹8 - ₹12 LPA"
    is_remote = Column(Boolean, default=False)
    is_internship = Column(Boolean, default=False)
    posted_date = Column(String(50), default="Recently")
    application_url = Column(String(500), nullable=False)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime(timezone=True), default=utc_now)

    sources = relationship("JobSource", back_populates="job", cascade="all, delete-orphan")
    job_skills = relationship("JobSkill", back_populates="job", cascade="all, delete-orphan")
    applications = relationship("Application", back_populates="job", cascade="all, delete-orphan")
    job_matches = relationship("JobMatch", back_populates="job", cascade="all, delete-orphan")
    saved_by = relationship("SavedJob", back_populates="job", cascade="all, delete-orphan")


class JobSource(Base):
    __tablename__ = "job_sources"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    job_id = Column(String(36), ForeignKey("jobs.id", ondelete="CASCADE"), nullable=False)
    source_name = Column(String(100), nullable=False)  # LinkedIn, Indeed, Company Careers, Instahyre
    source_url = Column(String(500), nullable=False)
    external_id = Column(String(255), nullable=True)

    job = relationship("Job", back_populates="sources")


class JobSkill(Base):
    __tablename__ = "job_skills"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    job_id = Column(String(36), ForeignKey("jobs.id", ondelete="CASCADE"), nullable=False)
    skill_id = Column(String(36), ForeignKey("skills.id", ondelete="CASCADE"), nullable=False)
    is_required = Column(Boolean, default=True)

    job = relationship("Job", back_populates="job_skills")
    skill = relationship("Skill", back_populates="job_skills")


class JobMatch(Base):
    __tablename__ = "job_matches"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    user_id = Column(String(36), ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    job_id = Column(String(36), ForeignKey("jobs.id", ondelete="CASCADE"), nullable=False)
    resume_id = Column(String(36), ForeignKey("resumes.id", ondelete="SET NULL"), nullable=True)

    overall_match = Column(Integer, default=0)
    skill_match = Column(Integer, default=0)
    experience_match = Column(Integer, default=0)
    education_match = Column(Integer, default=0)
    project_match = Column(Integer, default=0)
    location_match = Column(Integer, default=0)
    role_match = Column(Integer, default=0)

    why_match = Column(JSON, default=list)  # List of matched skills & strengths
    missing_skills = Column(JSON, default=list)  # List of missing/recommended skills
    experience_gap = Column(String(255), nullable=True)
    calculated_at = Column(DateTime(timezone=True), default=utc_now)

    user = relationship("User", back_populates="job_matches")
    job = relationship("Job", back_populates="job_matches")
    resume = relationship("Resume", back_populates="job_matches")


class SavedJob(Base):
    __tablename__ = "saved_jobs"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    user_id = Column(String(36), ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    job_id = Column(String(36), ForeignKey("jobs.id", ondelete="CASCADE"), nullable=False)
    saved_at = Column(DateTime(timezone=True), default=utc_now)

    user = relationship("User", back_populates="saved_jobs")
    job = relationship("Job", back_populates="saved_by")


class Application(Base):
    __tablename__ = "applications"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    user_id = Column(String(36), ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    job_id = Column(String(36), ForeignKey("jobs.id", ondelete="CASCADE"), nullable=False)
    resume_id = Column(String(36), ForeignKey("resumes.id", ondelete="SET NULL"), nullable=True)

    # Saved, Applied, Assessment, Interview, Rejected, Offer
    status = Column(String(50), default="Applied")
    applied_date = Column(DateTime(timezone=True), default=utc_now)
    job_url = Column(String(500), nullable=True)
    notes = Column(Text, nullable=True)
    created_at = Column(DateTime(timezone=True), default=utc_now)
    updated_at = Column(DateTime(timezone=True), default=utc_now, onupdate=utc_now)

    user = relationship("User", back_populates="applications")
    job = relationship("Job", back_populates="applications")
    resume = relationship("Resume")
    cover_letter = relationship("CoverLetter", back_populates="application", uselist=False, cascade="all, delete-orphan")
    answers = relationship("ApplicationAnswer", back_populates="application", cascade="all, delete-orphan")


class ApplicationAnswer(Base):
    __tablename__ = "application_answers"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    application_id = Column(String(36), ForeignKey("applications.id", ondelete="CASCADE"), nullable=False)
    question = Column(Text, nullable=False)
    answer = Column(Text, nullable=False)

    application = relationship("Application", back_populates="answers")


class CoverLetter(Base):
    __tablename__ = "cover_letters"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    application_id = Column(String(36), ForeignKey("applications.id", ondelete="CASCADE"), nullable=True)
    user_id = Column(String(36), ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    job_id = Column(String(36), ForeignKey("jobs.id", ondelete="CASCADE"), nullable=False)
    content = Column(Text, nullable=False)
    created_at = Column(DateTime(timezone=True), default=utc_now)
    updated_at = Column(DateTime(timezone=True), default=utc_now, onupdate=utc_now)

    application = relationship("Application", back_populates="cover_letter")


class Interview(Base):
    __tablename__ = "interviews"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    user_id = Column(String(36), ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    job_id = Column(String(36), ForeignKey("jobs.id", ondelete="SET NULL"), nullable=True)
    role = Column(String(100), nullable=False)
    difficulty = Column(String(50), default="Medium")  # Easy, Medium, Hard
    overall_score = Column(Integer, default=0)
    feedback_summary = Column(Text, nullable=True)
    status = Column(String(50), default="In Progress")  # In Progress, Completed
    created_at = Column(DateTime(timezone=True), default=utc_now)

    user = relationship("User", back_populates="interviews")
    questions = relationship("InterviewQuestion", back_populates="interview", cascade="all, delete-orphan")


class InterviewQuestion(Base):
    __tablename__ = "interview_questions"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    interview_id = Column(String(36), ForeignKey("interviews.id", ondelete="CASCADE"), nullable=False)
    question = Column(Text, nullable=False)
    question_type = Column(String(50), default="Technical")  # Technical, Behavioral, HR, Project-based
    user_answer = Column(Text, nullable=True)
    feedback = Column(Text, nullable=True)
    score = Column(Integer, nullable=True)  # 0-100

    interview = relationship("Interview", back_populates="questions")


class LearningPath(Base):
    __tablename__ = "learning_paths"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    user_id = Column(String(36), ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    title = Column(String(255), nullable=False)
    description = Column(Text, nullable=True)
    target_skill = Column(String(100), nullable=False)
    gap_percentage = Column(Integer, default=25)
    progress_percentage = Column(Integer, default=0)
    created_at = Column(DateTime(timezone=True), default=utc_now)

    user = relationship("User", back_populates="learning_paths")
    items = relationship("LearningItem", back_populates="path", cascade="all, delete-orphan")


class LearningItem(Base):
    __tablename__ = "learning_items"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    learning_path_id = Column(String(36), ForeignKey("learning_paths.id", ondelete="CASCADE"), nullable=False)
    week_number = Column(Integer, default=1)
    week_title = Column(String(255), nullable=False)
    topic = Column(String(255), nullable=False)
    description = Column(Text, nullable=True)
    resource_url = Column(String(500), nullable=True)
    is_completed = Column(Boolean, default=False)

    path = relationship("LearningPath", back_populates="items")


class Notification(Base):
    __tablename__ = "notifications"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    user_id = Column(String(36), ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    title = Column(String(255), nullable=False)
    message = Column(Text, nullable=False)
    notification_type = Column(String(50), default="info")  # info, match, application, interview
    is_read = Column(Boolean, default=False)
    created_at = Column(DateTime(timezone=True), default=utc_now)

    user = relationship("User", back_populates="notifications")
