import {
  User, Profile, Resume, ResumeDetail, Job, JobDetail, JobMatchAnalysis,
  Application, ApplicationPrepareResponse, LearningHubOverview, RolePredictionResponse,
  Interview, AnalyticsOverview
} from '../types';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8000/api';

class ApiClient {
  private getToken(): string | null {
    const token = localStorage.getItem('applyflow_token');
    if (token) return token;
    const legacyToken = localStorage.getItem('jobmate_token');
    if (legacyToken) {
      localStorage.setItem('applyflow_token', legacyToken);
      localStorage.removeItem('jobmate_token');
    }
    return legacyToken;
  }

  public setToken(token: string) {
    localStorage.setItem('applyflow_token', token);
  }

  public clearToken() {
    localStorage.removeItem('applyflow_token');
    localStorage.removeItem('jobmate_token');
  }

  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const headers: Record<string, string> = {
      ...(options.headers as Record<string, string>),
    };

    const token = this.getToken();
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    if (!(options.body instanceof FormData)) {
      headers['Content-Type'] = 'application/json';
    }

    const res = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      headers,
    });

    if (!res.ok) {
      const errorData = await res.json().catch(() => ({ detail: 'Network request failed' }));
      throw new Error(errorData.detail || `Request failed with status ${res.status}`);
    }

    return res.json();
  }

  // --- Auth ---
  async login(email: string, password: string): Promise<{ access_token: string; user: User }> {
    const res = await this.request<{ access_token: string; user: User }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
    this.setToken(res.access_token);
    return res;
  }

  async register(email: string, password: string, full_name: string): Promise<{ message: string; email: string; dev_verification_url?: string }> {
    return this.request<{ message: string; email: string; dev_verification_url?: string }>('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ email, password, full_name }),
    });
  }

  async verifyEmail(token: string): Promise<{ access_token: string; user: User }> {
    const res = await this.request<{ access_token: string; user: User }>('/auth/verify-email', {
      method: 'POST', body: JSON.stringify({ token }),
    });
    this.setToken(res.access_token);
    return res;
  }

  async resendVerification(email: string): Promise<{ message: string; email: string; dev_verification_url?: string }> {
    return this.request('/auth/resend-verification', {
      method: 'POST', body: JSON.stringify({ email }),
    });
  }

  async getMe(): Promise<User> {
    return this.request<User>('/auth/me');
  }

  async logout(): Promise<void> {
    await this.request('/auth/logout', { method: 'POST' }).catch(() => {});
    this.clearToken();
  }

  // --- Profile ---
  async getProfile(): Promise<Profile> {
    return this.request<Profile>('/profile');
  }

  async updateProfile(profile: Partial<Profile>): Promise<Profile> {
    return this.request<Profile>('/profile', {
      method: 'PUT',
      body: JSON.stringify(profile),
    });
  }

  // --- Resumes ---
  async listResumes(): Promise<Resume[]> {
    return this.request<Resume[]>('/resumes');
  }

  async getResume(id: string): Promise<ResumeDetail> {
    return this.request<ResumeDetail>(`/resumes/${id}`);
  }

  async uploadResume(file: File, target_role: string = 'General'): Promise<ResumeDetail> {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('target_role', target_role);

    return this.request<ResumeDetail>('/resumes/upload', {
      method: 'POST',
      body: formData,
    });
  }

  async analyzeResume(id: string): Promise<ResumeDetail> {
    return this.request<ResumeDetail>(`/resumes/${id}/analyze`, { method: 'POST' });
  }

  async predictResumeRoles(id: string): Promise<RolePredictionResponse> {
    return this.request<RolePredictionResponse>(`/resumes/${id}/role-predictions`);
  }

  async improveResumeBullet(
    id: string,
    section_id?: string,
    instruction?: string
  ): Promise<{ original: string; suggested: string; reasoning: string }> {
    return this.request(`/resumes/${id}/improve`, {
      method: 'POST',
      body: JSON.stringify({ section_id, instruction }),
    });
  }

  async deleteResume(id: string): Promise<void> {
    await this.request(`/resumes/${id}`, { method: 'DELETE' });
  }

  // --- Jobs ---
  async listJobs(params: {
    query?: string;
    role?: string;
    location?: string;
    experience?: string;
    tab?: string;
  } = {}): Promise<Job[]> {
    const searchParams = new URLSearchParams();
    if (params.query) searchParams.append('query', params.query);
    if (params.role) searchParams.append('role', params.role);
    if (params.location) searchParams.append('location', params.location);
    if (params.experience) searchParams.append('experience', params.experience);
    if (params.tab) searchParams.append('tab', params.tab);

    const qs = searchParams.toString();
    return this.request<Job[]>(`/jobs${qs ? `?${qs}` : ''}`);
  }

  async getJob(id: string): Promise<JobDetail> {
    return this.request<JobDetail>(`/jobs/${id}`);
  }

  async toggleSaveJob(id: string): Promise<{ saved: boolean }> {
    return this.request<{ saved: boolean }>(`/jobs/${id}/save`, { method: 'POST' });
  }

  async matchJob(id: string, resume_id?: string): Promise<JobMatchAnalysis> {
    return this.request<JobMatchAnalysis>(`/jobs/${id}/match${resume_id ? `?resume_id=${resume_id}` : ''}`, {
      method: 'POST',
    });
  }

  // --- Applications & Copilot ---
  async listApplications(status?: string): Promise<Application[]> {
    return this.request<Application[]>(`/applications${status ? `?status=${status}` : ''}`);
  }

  async prepareApplication(job_id: string, resume_id?: string): Promise<ApplicationPrepareResponse> {
    return this.request<ApplicationPrepareResponse>(
      `/applications/prepare?job_id=${job_id}${resume_id ? `&resume_id=${resume_id}` : ''}`,
      { method: 'POST' }
    );
  }

  async submitApplication(payload: {
    job_id: string;
    resume_id: string;
    cover_letter: string;
    answers: { question: string; answer: string }[];
    notes?: string;
    confirmed_human_review: boolean;
  }): Promise<Application> {
    return this.request<Application>('/applications', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  }

  async getApplication(id: string): Promise<Application> {
    return this.request<Application>(`/applications/${id}`);
  }

  async updateApplication(id: string, status?: string, notes?: string): Promise<Application> {
    return this.request<Application>(`/applications/${id}`, {
      method: 'PUT',
      body: JSON.stringify({ status, notes }),
    });
  }

  // --- Learning Hub ---
  async getLearningRoadmap(): Promise<LearningHubOverview> {
    return this.request<LearningHubOverview>('/learning/roadmap');
  }

  async toggleLearningItem(itemId: string): Promise<any> {
    return this.request(`/learning/roadmap/${itemId}`, { method: 'PUT' });
  }

  // --- Mock Interviews ---
  async startInterview(role: string, difficulty: string, job_id?: string): Promise<Interview> {
    return this.request<Interview>('/interviews', {
      method: 'POST',
      body: JSON.stringify({ role, difficulty, job_id }),
    });
  }

  async answerInterviewQuestion(
    interviewId: string,
    questionId: string,
    answer: string
  ): Promise<{ id: string; user_answer: string; feedback: string; score: number }> {
    return this.request(`/interviews/${interviewId}/answer`, {
      method: 'POST',
      body: JSON.stringify({ question_id: questionId, answer }),
    });
  }

  async getInterview(id: string): Promise<Interview> {
    return this.request<Interview>(`/interviews/${id}`);
  }

  // --- Analytics ---
  async getAnalytics(): Promise<AnalyticsOverview> {
    return this.request<AnalyticsOverview>('/analytics/overview');
  }
}

export const api = new ApiClient();
