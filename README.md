# ApplyFlow — Your Job Search, Organized

ApplyFlow is a full-stack job search and application assistant that brings the key parts of a job hunt into one workspace. Build a career profile, organize and analyze resumes, discover and compare relevant roles, prepare application materials, track applications, and practice interviews. Its matching tools explain how a role aligns with your skills, while you stay in control of every application and submit directly through the employer's site.

The current project is a local prototype: job listings use sample data until approved live job sources are connected, and email verification uses Brevo when configured.

---

## ✨ Features

| Feature | Description |
|---|---|
| **Smart Onboarding** | 4-step wizard to capture your profile, skills, and job preferences |
| **Resume Manager** | Upload multiple resumes (PDF/DOCX), analyze ATS score, rewrite with AI |
| **AI Resume Analysis** | Detects flaws, keyword gaps, formatting issues; scores across 5 dimensions |
| **Job Discovery** | Search & filter seeded demo listings; real job sources still need integration |
| **Job Matching** | Weighted skill-matching algorithm explains why each job fits (or doesn't) |
| **Application Copilot** | Prepare a resume, cover letter, and answers; apply on the employer site, then record it in ApplyFlow |
| **Application Tracker** | Kanban-style table tracking all applications with status & notes |
| **Learning Paths** | Identifies skill gaps; builds personalized roadmaps with tracked progress |
| **Mock Interviews** | AI-powered Q&A simulator with real-time feedback on your answers |
| **Analytics Dashboard** | Pipeline health, response rates, skill trends, and progress charts |
| **Settings** | Manage profile, AI provider config, and notification preferences |

---

## 🚀 Quick Start

### Option A — One-Click Launch (Recommended)

Double-click **`start-all.bat`** in this folder. It will:
1. Start the FastAPI backend on `http://127.0.0.1:8000`
2. Start the Vite frontend on `http://127.0.0.1:5173`
3. Automatically open the app in your browser after 5 seconds

### Option B — Manual Launch

**Terminal 1 — Backend:**
```bat
start-backend.bat
```

**Terminal 2 — Frontend:**
```bat
start-frontend.bat
```

---

## 🔗 Key URLs

| URL | Description |
|---|---|
| `http://127.0.0.1:5173` | Main application (React frontend) |
| `http://127.0.0.1:8000/docs` | Interactive API documentation (Swagger UI) |
| `http://127.0.0.1:8000/redoc` | Alternative API documentation (ReDoc) |
| `http://127.0.0.1:8000/api/jobs` | Jobs API endpoint (raw JSON) |

---

## 🔑 Demo Login

Choose **Try Demo — Instant Access** on the sign-in page, or create your own account. Demo credentials, if needed:

| Field | Value |
|---|---|
| Email | `rohan@example.com` |
| Password | `password123` |

---

## 🗂️ Project Structure

```
ApplyFlow/
├── backend/                    # FastAPI Python backend
│   ├── app/
│   │   ├── main.py             # FastAPI app entry point
│   │   ├── core/               # Config, security, storage
│   │   ├── models/             # SQLAlchemy ORM models
│   │   ├── schemas/            # Pydantic v2 schemas
│   │   ├── api/                # Route handlers (auth, resumes, jobs…)
│   │   ├── services/
│   │   │   ├── ai/             # AI providers (Mock + OpenAI)
│   │   │   ├── jobs/           # Job aggregation adapters
│   │   │   └── parser/         # PDF/DOCX resume parser
│   │   └── database/           # SQLite + seed data
│   ├── tests/                  # 7 pytest API tests (all passing)
│   ├── applyflow.db            # SQLite database (pre-seeded)
│   ├── .venv/                  # Python virtual environment
│   └── requirements.txt        # Python dependencies
│
├── frontend/                   # Vite + React + TypeScript frontend
│   ├── src/
│   │   ├── pages/              # 12 full-page components
│   │   ├── components/         # Reusable UI (sidebar, topbar, badges…)
│   │   ├── services/api.ts     # Typed API client
│   │   ├── context/            # Auth context
│   │   ├── types/index.ts      # TypeScript interfaces
│   │   └── index.css           # Tailwind v4 + custom color theme
│   └── dist/                   # Production build output
│
├── start-all.bat               # 🚀 One-click launcher (both servers)
├── start-backend.bat           # Backend only
├── start-frontend.bat          # Frontend only
├── .env.example                # Environment config template
└── README.md                   # This file
```

---

## ⚙️ Configuration

Copy `.env.example` to `backend/.env` to customize settings. Mock AI and demo job listings work locally without API keys. For a real AI provider, set:

```bash
# Use a real OpenAI-compatible provider instead of mock responses
USE_MOCK_AI=false
AI_API_KEY=your-provider-key
AI_MODEL=gpt-4o-mini
AI_BASE_URL=https://api.openai.com/v1

# Security (change in production!)
SECRET_KEY=your-long-random-secret-key
```

**By default**, `USE_MOCK_AI=true` and `USE_MOCK_JOBS=true`. The app runs with local mock AI and seeded demo listings. The employer application itself is completed on the employer's site; ApplyFlow does not submit it directly.

### Resume role model

The supplied archive can train a local resume-to-role classifier. It uses the `Category` labels and only the `Summary`, `Skills`, `Experience`, and `Education` fields; contact fields are excluded and names, email addresses, and phone patterns are stripped. The raw archive is not copied into the repository. To retrain after placing the archive at `C:\Users\Rohan\Downloads\archive.zip`, run from `backend/`:

```powershell
.\.venv\Scripts\python.exe -m app.services.ml.train_role_classifier C:\Users\Rohan\Downloads\archive.zip
```

This writes `backend/app/services/ml/role_classifier.json`, which the resume detail page uses for its **Suggest roles** action. On a deduplicated stratified holdout of 649 resumes, the current model reached 77.0% top-1 and 87.4% top-3 accuracy. The archive contains both ResumeAtlas and synthetic records with personal contact fields; review the dataset's privacy terms and usage rights before redistributing either the data or a deployed model.

### Requirements before a real deployment

- Configure a real job data source and confirm its API access and usage terms. The included LinkedIn, Indeed, Company Careers, and Instahyre adapters currently return no listings; the UI uses seeded data.
- Choose hosting, a production database, and persistent private storage for resume uploads. The included setup uses SQLite and local disk.
- Set a unique `SECRET_KEY`, restrict `CORS_ORIGINS` to the deployed frontend, and add account recovery/email delivery if needed.
- Set a supported AI provider key in the backend environment if you want real generated content. Never place provider secrets in the frontend.
- ApplyFlow currently prepares materials and tracks applications. Direct submission requires employer/ATS integrations and their authorization; this project does not automate that step.

---

## 🧪 Running Tests

```powershell
cd backend
.\.venv\Scripts\activate
pytest -q
```

The repository includes API tests for auth, resumes, jobs, applications, learning, interviews, and analytics.

---

## 🛠️ Tech Stack

**Backend**
- Python 3.13 + FastAPI
- SQLAlchemy + SQLite (zero-config database)
- Pydantic v2 for validation
- JWT authentication (python-jose + bcrypt)
- PyMuPDF + python-docx for resume parsing
- OpenAI SDK (optional — falls back to mock)

**Frontend**
- React 18 + TypeScript
- Vite 8 (build tool)
- Tailwind CSS v4 (utility-first styling)
- React Router v6
- Lucide React (icons)
- Recharts (analytics charts)

---

## 🔮 Future Enhancements

- [ ] Real job board integrations (LinkedIn, Indeed, Glassdoor APIs)
- [ ] Email notifications for application status updates
- [ ] Chrome extension for 1-click job capture from job boards
- [ ] PDF export for cover letters
- [ ] Team/recruiter portal
- [ ] Mobile app (React Native)

---

*Built with ❤️ — Powered by FastAPI + React + Tailwind CSS + AI*
# ApplyFlow operational notes

## Database and secrets

Local development currently uses SQLite at `backend/applyflow.db`; SQLAlchemy creates tables when the API starts. Keep this file and uploaded resumes out of Git. The production deployment should use managed PostgreSQL (AWS RDS or Azure Database for PostgreSQL); SQLite files are not suitable for ephemeral app containers or multi-instance deployments. Resume files should move to private S3 or Azure Blob storage, and credentials should live in AWS Secrets Manager or Azure Key Vault.

For local email verification, copy `.env.example` to `backend/.env`. Set `BREVO_API_KEY` and `BREVO_SENDER_EMAIL` to a Brevo API key and a verified sender. Never put the Brevo key in `frontend/.env` or commit either env file. The local app can return a development-only verification link when no Brevo key is configured. Production never returns that link and registration is rejected until email delivery is configured.

## Job data and training

Job listings are operational input data, not training labels. The existing source adapters are placeholders and currently return no live jobs; the UI's sample listings come from development seed data. Populate jobs from company career APIs/feeds that permit this use (for example, Lever's public postings API), then normalize and deduplicate them using `data/job_postings_template.csv`. Avoid scraping sources whose terms do not permit it.

For personalized ranking, collect consented user/job events such as view, save, apply, and interview in the shape shown in `data/job_interactions_template.csv`. Combine these events with job attributes and resume/profile features to train ranking only after collecting enough representative examples. Do not train on personally identifying resume text unless there is a clear need, consent, and a privacy plan. The existing role classifier is trained for resume role categories, not job search ranking.
