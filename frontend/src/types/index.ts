export interface User {
  id: string;
  email: string;
  full_name: string;
  is_active: boolean;
  has_profile: boolean;
}

export interface Profile {
  id: string;
  user_id: string;
  full_name?: string;
  email?: string;
  phone?: string;
  location?: string;
  preferred_locations: string[];
  job_types: string[];
  experience_level: string;
  target_roles: string[];
  bio?: string;
  skills: string[];
}

export interface Resume {
  id: string;
  filename: string;
  target_role: string;
  is_master: boolean;
  overall_score: number;
  ats_compatibility: number;
  created_at: string;
}

export interface ResumeSection {
  id: string;
  section_type: string;
  title: string;
  original_content: string;
  suggested_content?: string;
  is_improved: boolean;
}

export interface ResumeDetail extends Resume {
  file_path: string;
  parsed_text?: string;
  technical_skills_score: number;
  projects_score: number;
  experience_score: number;
  keywords_score: number;
  formatting_score: number;
  key_findings: string[];
  ai_suggestions: string[];
  missing_keywords: string[];
  extracted_data: Record<string, any>;
  sections: ResumeSection[];
  skills: string[];
}

export interface RolePrediction {
  role: string;
}

export interface RolePredictionResponse {
  algorithm: string;
  metrics: { top1_accuracy: number; top3_accuracy: number; holdout_documents: number };
  predictions: RolePrediction[];
}

export interface JobSource {
  source_name: string;
  source_url: string;
}

export interface Job {
  id: string;
  title: string;
  company: string;
  company_logo?: string;
  description: string;
  location: string;
  employment_type: string;
  experience_level: string;
  salary_range?: string;
  is_remote: boolean;
  is_internship: boolean;
  posted_date: string;
  application_url: string;
  sources_count: number;
  sources: JobSource[];
  required_skills: string[];
  match_percentage?: number;
  is_saved: boolean;
}

export interface JobMatchAnalysis {
  overall_match: number;
  skill_match: number;
  experience_match: number;
  education_match: number;
  project_match: number;
  location_match: number;
  role_match: number;
  why_match: string[];
  missing_skills: string[];
  experience_gap?: string;
  recommended_resume_id?: string;
  recommended_resume_name?: string;
}

export interface JobDetail extends Job {
  match_analysis?: JobMatchAnalysis;
  similar_jobs: Job[];
}

export interface ApplicationAnswer {
  id?: string;
  question: string;
  answer: string;
}

export interface ApplicationPrepareResponse {
  job: Job;
  recommended_resume?: Resume;
  all_resumes: Resume[];
  generated_cover_letter: string;
  suggested_answers: ApplicationAnswer[];
  match_percentage: number;
}

export interface Application {
  id: string;
  job_id: string;
  job_title: string;
  company: string;
  company_logo?: string;
  location: string;
  employment_type: string;
  resume_name?: string;
  resume_id?: string;
  status: string; // Saved, Applied, Assessment, Interview, Rejected, Offer
  applied_date: string;
  job_url?: string;
  notes?: string;
  cover_letter?: string;
  answers?: ApplicationAnswer[];
}

export interface LearningItem {
  id: string;
  week_number: number;
  week_title: string;
  topic: string;
  description?: string;
  resource_url?: string;
  is_completed: boolean;
}

export interface LearningPath {
  id: string;
  title: string;
  description?: string;
  target_skill: string;
  gap_percentage: number;
  progress_percentage: number;
  items: LearningItem[];
}

export interface LearningHubOverview {
  skill_gaps: { skill: string; gap_percentage: number }[];
  roadmap: LearningPath[];
}

export interface InterviewQuestion {
  id: string;
  question: string;
  question_type: string;
  user_answer?: string;
  feedback?: string;
  score?: number;
}

export interface Interview {
  id: string;
  role: string;
  difficulty: string;
  overall_score: number;
  feedback_summary?: string;
  status: string;
  created_at: string;
  questions: InterviewQuestion[];
}

export interface AnalyticsOverview {
  total_applications: number;
  applied_count: number;
  assessment_count: number;
  interview_count: number;
  rejected_count: number;
  offer_count: number;
  interview_rate: number;
  response_rate: number;
  applications_by_role: Record<string, number>;
  applications_by_location: Record<string, number>;
  applications_by_resume: Record<string, number>;
  applications_over_time: { label: string; applications: number }[];
  most_requested_skills: { name: string; count: number }[];
  common_missing_skills: { name: string; count: number }[];
}
