import uuid
from datetime import datetime, timezone, timedelta
from sqlalchemy.orm import Session
from app.core.config import settings
from app.core.security import get_password_hash
from app.models.models import (
    User, Profile, Resume, ResumeSection, Skill, UserSkill, ResumeSkill,
    Job, JobSource, JobSkill, JobMatch, SavedJob, Application,
    ApplicationAnswer, CoverLetter, Interview, InterviewQuestion,
    LearningPath, LearningItem
)

def seed_database(db: Session):
    if settings.APP_ENV.lower() == "production":
        print("Production environment detected; demo data seeding is disabled.")
        return
    # Check if database is already seeded
    existing_user = db.query(User).filter_by(email="rohan@example.com").first()
    if existing_user:
        print("Database already contains seed data. Skipping.")
        return

    print("Seeding database with realistic development data...")

    # 1. Create Default User
    demo_user = User(
        id=str(uuid.uuid4()),
        email="rohan@example.com",
        full_name="Rohan Siddharth",
        hashed_password=get_password_hash("password123"),
        is_active=True
    )
    db.add(demo_user)
    db.commit()
    db.refresh(demo_user)

    # 2. User Profile
    demo_profile = Profile(
        user_id=demo_user.id,
        phone="+91 98765 43210",
        location="Hyderabad, India",
        preferred_locations=["Hyderabad, India", "Bengaluru, India", "Remote"],
        job_types=["Full-time", "Internship"],
        experience_level="Fresher (0-1 years)",
        target_roles=["AI Engineer", "Software Engineer", "ML Engineer"],
        bio="Passionate software engineer focused on building intelligent systems using Python, FastAPI, and Generative AI."
    )
    db.add(demo_profile)

    # 3. Master Skills (10 core skills + categories)
    skills_data = [
        ("Python", "AI/ML"),
        ("Machine Learning", "AI/ML"),
        ("GenAI", "AI/ML"),
        ("FastAPI", "Backend"),
        ("PostgreSQL", "Database"),
        ("Docker", "Cloud/DevOps"),
        ("Kubernetes", "Cloud/DevOps"),
        ("React", "Frontend"),
        ("SQL", "Database"),
        ("Git", "Tools"),
        ("AWS", "Cloud/DevOps"),
        ("System Design", "Backend")
    ]
    skill_objects = {}
    for s_name, s_cat in skills_data:
        skill = Skill(name=s_name, category=s_cat)
        db.add(skill)
        skill_objects[s_name] = skill
    db.commit()

    # Add user skills
    for s_name in ["Python", "Machine Learning", "GenAI", "SQL", "Git", "React"]:
        user_skill = UserSkill(
            user_id=demo_user.id,
            skill_id=skill_objects[s_name].id,
            proficiency="Intermediate"
        )
        db.add(user_skill)

    # 4. Resumes (5 sample resumes)
    sample_resumes = [
        {
            "filename": "Rohan_Resume_AI.pdf",
            "target_role": "AI Engineer",
            "is_master": True,
            "overall_score": 82,
            "ats": 85, "tech": 80, "proj": 78, "exp": 70, "kw": 88, "fmt": 90,
            "skills": ["Python", "Machine Learning", "GenAI", "SQL", "Git"],
            "text": (
                "Rohan Siddharth | rohan@example.com | +91 98765 43210 | Hyderabad, India\n\n"
                "SUMMARY\nInnovative AI Engineer with strong background in Python, Deep Learning, and Generative AI applications. "
                "Proven capability in developing RAG pipelines, model fine-tuning, and scalable inference APIs.\n\n"
                "TECHNICAL SKILLS\nLanguages: Python, SQL, JavaScript\nAI/ML: PyTorch, GenAI, LangChain, Transformers, RAG\n"
                "Backend & Tools: FastAPI, PostgreSQL, Git, Linux\n\n"
                "EXPERIENCE\nAI Research Intern | TechCorp India | Jan 2025 - Jun 2025\n"
                "- Built custom LLM evaluation benchmarks reducing hallucination rates by 30%.\n"
                "- Implemented vector search indexing across 50,000+ technical documents.\n\n"
                "PROJECTS\nApplyFlow AI Copilot (2025)\n"
                "- Engineered an intelligent job application assistant utilizing Python and vector embeddings.\n"
                "- Implemented automated resume parsing and transparent ATS score evaluation.\n\n"
                "EDUCATION\nB.Tech in Computer Science and Engineering | 2021 - 2025"
            )
        },
        {
            "filename": "Resume_Backend.pdf",
            "target_role": "Backend Developer",
            "is_master": False,
            "overall_score": 78,
            "ats": 82, "tech": 82, "proj": 74, "exp": 68, "kw": 80, "fmt": 85,
            "skills": ["Python", "FastAPI", "SQL", "Git", "PostgreSQL"],
            "text": (
                "Rohan Siddharth | Backend Developer | Hyderabad\n"
                "SUMMARY: Backend engineer specialized in building robust RESTful APIs with Python, FastAPI, and PostgreSQL.\n"
                "SKILLS: Python, FastAPI, PostgreSQL, SQL, Docker, Redis, Git, Unit Testing\n"
                "PROJECTS: Distributed Task Queue Service using Python and Redis\n"
                "EDUCATION: B.Tech in Computer Science"
            )
        },
        {
            "filename": "Resume_Cloud.pdf",
            "target_role": "Cloud & DevOps",
            "is_master": False,
            "overall_score": 75,
            "ats": 78, "tech": 75, "proj": 72, "exp": 65, "kw": 76, "fmt": 88,
            "skills": ["Git", "Docker", "AWS", "Python"],
            "text": (
                "Rohan Siddharth | Cloud & DevOps Enthusiast\n"
                "SKILLS: Docker, Kubernetes, AWS (EC2, S3), CI/CD, Git, Linux, Python scripting\n"
                "EXPERIENCE: Cloud Infrastructure Project Intern\n"
                "PROJECTS: Automated Multi-Environment Deployment Pipeline\n"
                "EDUCATION: B.Tech Computer Science"
            )
        },
        {
            "filename": "Resume_Fullstack.pdf",
            "target_role": "Full Stack Engineer",
            "is_master": False,
            "overall_score": 84,
            "ats": 88, "tech": 85, "proj": 82, "exp": 75, "kw": 86, "fmt": 90,
            "skills": ["React", "Python", "FastAPI", "SQL", "Git"],
            "text": (
                "Rohan Siddharth | Full Stack Software Engineer\n"
                "SUMMARY: Full-stack builder proficient in modern React, TypeScript, and Python FastAPI backend architectures.\n"
                "SKILLS: React, TypeScript, Tailwind CSS, Python, FastAPI, PostgreSQL, REST APIs\n"
                "EXPERIENCE: Web Development Intern\n"
                "PROJECTS: Real-Time Collaborative Workspace\n"
                "EDUCATION: B.Tech Computer Science"
            )
        },
        {
            "filename": "Resume_DataScience.pdf",
            "target_role": "Data Scientist",
            "is_master": False,
            "overall_score": 80,
            "ats": 82, "tech": 82, "proj": 80, "exp": 70, "kw": 84, "fmt": 85,
            "skills": ["Python", "Machine Learning", "SQL"],
            "text": (
                "Rohan Siddharth | Data Scientist\n"
                "SKILLS: Python, Pandas, NumPy, Scikit-Learn, SQL, Statistical Analysis, Data Visualization\n"
                "PROJECTS: Customer Churn Prediction and Predictive Modeling\n"
                "EDUCATION: B.Tech Computer Science"
            )
        }
    ]

    resume_objects = []
    for r in sample_resumes:
        r_id = str(uuid.uuid4())
        res = Resume(
            id=r_id,
            user_id=demo_user.id,
            filename=r["filename"],
            file_path=f"uploads/{r['filename']}",
            target_role=r["target_role"],
            is_master=r["is_master"],
            parsed_text=r["text"],
            overall_score=r["overall_score"],
            ats_compatibility=r["ats"],
            technical_skills_score=r["tech"],
            projects_score=r["proj"],
            experience_score=r["exp"],
            keywords_score=r["kw"],
            formatting_score=r["fmt"],
            key_findings=[
                "Project descriptions are a bit generic and could highlight quantitative business results.",
                "Some important deployment keywords like Docker and Kubernetes are missing.",
                "Technical skills section is well structured with modern frameworks.",
                "Educational background is clearly documented."
            ],
            ai_suggestions=[
                "Use measurable results in project bullets (e.g. reduced query latency by 35%).",
                "Add relevant keywords for target roles such as Docker, Kubernetes, and CI/CD.",
                "Highlight technical skills in the first section for higher ATS visibility.",
                "Consider creating a role-specific resume focusing on production microservices."
            ],
            missing_keywords=["Docker", "Kubernetes", "FastAPI", "CI/CD", "System Design"],
            extracted_data={
                "education": "B.Tech in Computer Science and Engineering (2021 - 2025)",
                "experience": "AI Research Intern at TechCorp India (Jan 2025 - Jun 2025)",
                "projects": "ApplyFlow AI Copilot, RAG Query Pipeline"
            }
        )
        db.add(res)
        resume_objects.append(res)
        
        # Add Resume Section
        sec = ResumeSection(
            id=str(uuid.uuid4()),
            resume_id=r_id,
            section_type="project",
            title="Projects",
            original_content="Worked on an AI project using Python.",
            suggested_content="Developed an AI-powered document retrieval system using Python and RAG techniques to improve information retrieval accuracy by 42%.",
            is_improved=False
        )
        db.add(sec)
        
        # Link skills
        for s in r["skills"]:
            if s in skill_objects:
                rs = ResumeSkill(resume_id=res.id, skill_id=skill_objects[s].id)
                db.add(rs)

    db.commit()

    # 5. Seed 20 Jobs across 10 Tech Companies
    companies_data = [
        ("Google", "https://logo.clearbit.com/google.com"),
        ("Microsoft", "https://logo.clearbit.com/microsoft.com"),
        ("Amazon", "https://logo.clearbit.com/amazon.com"),
        ("Deloitte", "https://logo.clearbit.com/deloitte.com"),
        ("Accenture", "https://logo.clearbit.com/accenture.com"),
        ("Meta", "https://logo.clearbit.com/meta.com"),
        ("Apple", "https://logo.clearbit.com/apple.com"),
        ("Netflix", "https://logo.clearbit.com/netflix.com"),
        ("Uber", "https://logo.clearbit.com/uber.com"),
        ("Stripe", "https://logo.clearbit.com/stripe.com")
    ]

    jobs_definitions = [
        {
            "title": "AI Engineer (Fresher)",
            "company": "Google",
            "logo": "https://upload.wikimedia.org/wikipedia/commons/2/2f/Google_2015_logo.svg",
            "location": "Hyderabad, India",
            "employment_type": "Full-time",
            "experience_level": "Fresher",
            "salary": "₹18 - ₹24 LPA",
            "is_remote": False,
            "is_internship": False,
            "posted_date": "Posted 2 days ago",
            "skills": ["Python", "Machine Learning", "GenAI", "SQL", "Git"],
            "description": "Join Google's Core AI team in Hyderabad building foundational machine learning models and Generative AI applications. You will collaborate on RAG architectures, model optimization, and scalable inference services."
        },
        {
            "title": "Software Developer",
            "company": "Microsoft",
            "logo": "https://upload.wikimedia.org/wikipedia/commons/9/96/Microsoft_logo_%282012%29.svg",
            "location": "Bengaluru, India",
            "employment_type": "Full-time",
            "experience_level": "Fresher",
            "salary": "₹16 - ₹22 LPA",
            "is_remote": False,
            "is_internship": False,
            "posted_date": "Posted 3 days ago",
            "skills": ["Python", "System Design", "SQL", "Git"],
            "description": "Microsoft is looking for a software developer to build high-scale cloud platforms and services. You will design clean RESTful APIs and write robust backend services."
        },
        {
            "title": "ML Intern",
            "company": "Amazon",
            "logo": "https://upload.wikimedia.org/wikipedia/commons/a/a9/Amazon_logo.svg",
            "location": "Remote",
            "employment_type": "Internship",
            "experience_level": "Fresher",
            "salary": "₹60,000 / month",
            "is_remote": True,
            "is_internship": True,
            "posted_date": "Posted 5 days ago",
            "skills": ["Python", "Machine Learning", "GenAI", "Git"],
            "description": "Amazon AWS AI organization is hiring an ML Intern for a 6-month term. Assist our science team with data modeling, GenAI pipelines, and natural language understanding models."
        },
        {
            "title": "Backend Developer",
            "company": "Deloitte",
            "logo": "https://upload.wikimedia.org/wikipedia/commons/5/56/Deloitte.svg",
            "location": "Hyderabad, India",
            "employment_type": "Full-time",
            "experience_level": "1-2 years",
            "salary": "₹10 - ₹14 LPA",
            "is_remote": False,
            "is_internship": False,
            "posted_date": "Posted 1 week ago",
            "skills": ["Python", "FastAPI", "SQL", "PostgreSQL"],
            "description": "Deloitte Consulting is seeking a talented backend developer with experience in modern Python frameworks, relational database optimization, and cloud services."
        },
        {
            "title": "Software Engineer",
            "company": "Accenture",
            "logo": "https://upload.wikimedia.org/wikipedia/commons/c/cd/Accenture.svg",
            "location": "Bengaluru, India",
            "employment_type": "Full-time",
            "experience_level": "Fresher",
            "salary": "₹8 - ₹11 LPA",
            "is_remote": False,
            "is_internship": False,
            "posted_date": "Posted 4 days ago",
            "skills": ["Python", "React", "SQL", "Git"],
            "description": "Accenture Technology is hiring early career Software Engineers to engineer web applications, microservices, and automated testing suites."
        },
        {
            "title": "GenAI Solutions Engineer",
            "company": "Meta",
            "logo": "https://upload.wikimedia.org/wikipedia/commons/7/7b/Meta_Platforms_Inc._logo.svg",
            "location": "Remote",
            "employment_type": "Full-time",
            "experience_level": "1-3 years",
            "salary": "₹28 - ₹35 LPA",
            "is_remote": True,
            "is_internship": False,
            "posted_date": "Posted 1 day ago",
            "skills": ["Python", "GenAI", "Machine Learning", "System Design"],
            "description": "Build agentic AI workflows and LLM applications at Meta. Work directly with partner engineering teams to deploy cutting edge Generative AI models."
        },
        {
            "title": "Data Science Intern",
            "company": "Apple",
            "logo": "https://upload.wikimedia.org/wikipedia/commons/f/fa/Apple_logo_black.svg",
            "location": "Hyderabad, India",
            "employment_type": "Internship",
            "experience_level": "Fresher",
            "salary": "₹75,000 / month",
            "is_remote": False,
            "is_internship": True,
            "posted_date": "Posted 6 days ago",
            "skills": ["Python", "Machine Learning", "SQL"],
            "description": "Join Apple's Siri and Intelligence team as a Data Science Intern. Analyze user interaction data and evaluate acoustic and linguistic model accuracy."
        },
        {
            "title": "Cloud Infrastructure Engineer",
            "company": "Netflix",
            "logo": "https://upload.wikimedia.org/wikipedia/commons/0/08/Netflix_2015_logo.svg",
            "location": "Remote",
            "employment_type": "Full-time",
            "experience_level": "1-3 years",
            "salary": "₹30 - ₹40 LPA",
            "is_remote": True,
            "is_internship": False,
            "posted_date": "Posted 3 days ago",
            "skills": ["Docker", "Kubernetes", "AWS", "Python"],
            "description": "Operate the world's most resilient media streaming infrastructure. Implement automated container orchestration, telemetry, and zero-downtime deployments."
        },
        {
            "title": "Full Stack Developer",
            "company": "Stripe",
            "logo": "https://upload.wikimedia.org/wikipedia/commons/b/ba/Stripe_Logo%2C_revised_2016.svg",
            "location": "Bengaluru, India",
            "employment_type": "Full-time",
            "experience_level": "Fresher",
            "salary": "₹20 - ₹28 LPA",
            "is_remote": False,
            "is_internship": False,
            "posted_date": "Posted 2 days ago",
            "skills": ["React", "Python", "SQL", "Git"],
            "description": "Develop mission critical financial dashboards and developer tools. Focus on responsive, accessible user interfaces with robust backend API services."
        },
        {
            "title": "Backend Systems Intern",
            "company": "Uber",
            "logo": "https://upload.wikimedia.org/wikipedia/commons/c/cc/Uber_logo_2018.png",
            "location": "Hyderabad, India",
            "employment_type": "Internship",
            "experience_level": "Fresher",
            "salary": "₹65,000 / month",
            "is_remote": False,
            "is_internship": True,
            "posted_date": "Posted 4 days ago",
            "skills": ["Python", "FastAPI", "SQL", "Git"],
            "description": "Uber Engineering in Hyderabad is looking for a Backend Systems Intern. Work on real-time marketplace routing, geospatial indexing, and messaging queues."
        },
        # Additional 10 jobs to reach 20 total
        {
            "title": "Junior Machine Learning Engineer",
            "company": "Google",
            "logo": "https://upload.wikimedia.org/wikipedia/commons/2/2f/Google_2015_logo.svg",
            "location": "Bengaluru, India",
            "employment_type": "Full-time",
            "experience_level": "Fresher",
            "salary": "₹17 - ₹23 LPA",
            "is_remote": False,
            "is_internship": False,
            "posted_date": "Posted 1 week ago",
            "skills": ["Python", "Machine Learning", "GenAI", "Git"],
            "description": "Design and train machine learning models for search and recommendation ranking."
        },
        {
            "title": "Frontend Engineer (React)",
            "company": "Microsoft",
            "logo": "https://upload.wikimedia.org/wikipedia/commons/9/96/Microsoft_logo_%282012%29.svg",
            "location": "Hyderabad, India",
            "employment_type": "Full-time",
            "experience_level": "Fresher",
            "salary": "₹14 - ₹19 LPA",
            "is_remote": False,
            "is_internship": False,
            "posted_date": "Posted 5 days ago",
            "skills": ["React", "Git", "SQL"],
            "description": "Build high-performance web experiences using React, TypeScript, and modern design systems."
        },
        {
            "title": "DevOps / SRE Intern",
            "company": "Amazon",
            "logo": "https://upload.wikimedia.org/wikipedia/commons/a/a9/Amazon_logo.svg",
            "location": "Hyderabad, India",
            "employment_type": "Internship",
            "experience_level": "Fresher",
            "salary": "₹55,000 / month",
            "is_remote": False,
            "is_internship": True,
            "posted_date": "Posted 3 days ago",
            "skills": ["Docker", "AWS", "Git", "Python"],
            "description": "Support AWS infrastructure automation, monitoring alerts, and CI/CD pipelines."
        },
        {
            "title": "AI Application Developer",
            "company": "Deloitte",
            "logo": "https://upload.wikimedia.org/wikipedia/commons/5/56/Deloitte.svg",
            "location": "Bengaluru, India",
            "employment_type": "Full-time",
            "experience_level": "Fresher",
            "salary": "₹9 - ₹13 LPA",
            "is_remote": False,
            "is_internship": False,
            "posted_date": "Posted 2 days ago",
            "skills": ["Python", "GenAI", "FastAPI", "SQL"],
            "description": "Deliver custom AI enterprise solutions, automated knowledge assistants, and analytical dashboards."
        },
        {
            "title": "Cloud Engineer (Azure/AWS)",
            "company": "Accenture",
            "logo": "https://upload.wikimedia.org/wikipedia/commons/c/cd/Accenture.svg",
            "location": "Hyderabad, India",
            "employment_type": "Full-time",
            "experience_level": "1-2 years",
            "salary": "₹10 - ₹15 LPA",
            "is_remote": False,
            "is_internship": False,
            "posted_date": "Posted 6 days ago",
            "skills": ["AWS", "Docker", "Git", "Python"],
            "description": "Architect and migrate enterprise workloads to cloud native platforms with secure container management."
        },
        {
            "title": "Research Intern (NLP & LLMs)",
            "company": "Meta",
            "logo": "https://upload.wikimedia.org/wikipedia/commons/7/7b/Meta_Platforms_Inc._logo.svg",
            "location": "Remote",
            "employment_type": "Internship",
            "experience_level": "Fresher",
            "salary": "₹80,000 / month",
            "is_remote": True,
            "is_internship": True,
            "posted_date": "Posted 1 day ago",
            "skills": ["Python", "GenAI", "Machine Learning"],
            "description": "Investigate novel prompt engineering techniques, fine-tuning mechanisms, and reasoning evaluation."
        },
        {
            "title": "Software Quality & Test Engineer",
            "company": "Apple",
            "logo": "https://upload.wikimedia.org/wikipedia/commons/f/fa/Apple_logo_black.svg",
            "location": "Bengaluru, India",
            "employment_type": "Full-time",
            "experience_level": "Fresher",
            "salary": "₹15 - ₹20 LPA",
            "is_remote": False,
            "is_internship": False,
            "posted_date": "Posted 4 days ago",
            "skills": ["Python", "Git", "SQL"],
            "description": "Create automated end-to-end testing frameworks and stress testing harnesses for system software."
        },
        {
            "title": "Data Engineer",
            "company": "Netflix",
            "logo": "https://upload.wikimedia.org/wikipedia/commons/0/08/Netflix_2015_logo.svg",
            "location": "Remote",
            "employment_type": "Full-time",
            "experience_level": "1-2 years",
            "salary": "₹25 - ₹32 LPA",
            "is_remote": True,
            "is_internship": False,
            "posted_date": "Posted 5 days ago",
            "skills": ["Python", "SQL", "PostgreSQL", "Git"],
            "description": "Build high throughput streaming ETL data pipelines processing billions of viewing telemetry events."
        },
        {
            "title": "API Platform Engineer",
            "company": "Stripe",
            "logo": "https://upload.wikimedia.org/wikipedia/commons/b/ba/Stripe_Logo%2C_revised_2016.svg",
            "location": "Bengaluru, India",
            "employment_type": "Full-time",
            "experience_level": "1-3 years",
            "salary": "₹22 - ₹30 LPA",
            "is_remote": False,
            "is_internship": False,
            "posted_date": "Posted 3 days ago",
            "skills": ["FastAPI", "Python", "SQL", "System Design"],
            "description": "Develop the high-reliability payment APIs powering internet commerce across millions of global businesses."
        },
        {
            "title": "Mobile & Web Engineer",
            "company": "Uber",
            "logo": "https://upload.wikimedia.org/wikipedia/commons/c/cc/Uber_logo_2018.png",
            "location": "Bengaluru, India",
            "employment_type": "Full-time",
            "experience_level": "Fresher",
            "salary": "₹16 - ₹22 LPA",
            "is_remote": False,
            "is_internship": False,
            "posted_date": "Posted 2 days ago",
            "skills": ["React", "Git", "Python"],
            "description": "Build responsive driver and rider web apps optimized for unstable mobile network conditions."
        }
    ]

    job_objects = []
    primary_resume = resume_objects[0]

    for j_data in jobs_definitions:
        j_id = str(uuid.uuid4())
        job = Job(
            id=j_id,
            title=j_data["title"],
            company=j_data["company"],
            company_logo=j_data["logo"],
            location=j_data["location"],
            employment_type=j_data["employment_type"],
            experience_level=j_data["experience_level"],
            salary_range=j_data["salary"],
            is_remote=j_data["is_remote"],
            is_internship=j_data["is_internship"],
            posted_date=j_data["posted_date"],
            application_url=f"https://careers.{j_data['company'].lower().replace(' ', '')}.com/jobs",
            description=j_data["description"]
        )
        db.add(job)
        job_objects.append(job)

        # Multi-source attribution (e.g. LinkedIn, Indeed, Company Careers)
        sources = [
            ("LinkedIn", f"https://linkedin.com/jobs/view/{uuid.uuid4().hex[:8]}"),
            ("Indeed", f"https://indeed.com/viewjob?jk={uuid.uuid4().hex[:8]}"),
            ("Company Careers", job.application_url)
        ]
        for s_name, s_url in sources:
            js = JobSource(job_id=job.id, source_name=s_name, source_url=s_url)
            db.add(js)

        # Job skills
        for s_name in j_data["skills"]:
            if s_name in skill_objects:
                jsk = JobSkill(job_id=job.id, skill_id=skill_objects[s_name].id, is_required=True)
                db.add(jsk)

        # Generate precomputed match for demo user
        match_pct = 92 if "AI Engineer" in job.title else (87 if "Software" in job.title else (95 if "ML" in job.title else 78))
        job_match = JobMatch(
            user_id=demo_user.id,
            job_id=job.id,
            resume_id=primary_resume.id,
            overall_match=match_pct,
            skill_match=90,
            experience_match=85,
            education_match=95,
            project_match=85,
            location_match=90,
            role_match=90,
            why_match=["Python", "Machine Learning", "GenAI", "SQL", "Git"][:len(j_data["skills"])],
            missing_skills=["Kubernetes", "Docker", "FastAPI"],
            experience_gap="This role prefers 1-2 years of experience. You can still apply as a fresher with strong project portfolio."
        )
        db.add(job_match)

    db.commit()

    # 6. Applications (10 tracked applications matching Reference #9)
    # Statuses: Saved, Applied, Assessment, Interview, Rejected, Offer
    applications_data = [
        (job_objects[0], "Applied", 3, "Submitted through Google Careers portal with tailored cover letter."),
        (job_objects[1], "Assessment", 7, "Online assessment invitation received for algorithms and data structures."),
        (job_objects[2], "Interview", 10, "First round technical interview scheduled with senior ML scientist."),
        (job_objects[3], "Applied", 12, "Application submitted for Hyderabad office."),
        (job_objects[4], "Rejected", 16, "Candidate pool completed. Feedback noted high technical test score."),
        (job_objects[5], "Offer", 2, "Offer letter received for remote GenAI Solutions role! Reviewing compensation."),
        (job_objects[6], "Applied", 5, "Applied via Apple Careers. Awaiting review."),
        (job_objects[7], "Assessment", 8, "Completed take-home cloud infrastructure deployment exercise."),
        (job_objects[8], "Interview", 14, "Completed system design panel. Waiting for executive round."),
        (job_objects[9], "Saved", 1, "Saved to review requirements and update projects section.")
    ]

    for job, status, days_ago, notes in applications_data:
        app_date = datetime.now(timezone.utc) - timedelta(days=days_ago)
        app_id = str(uuid.uuid4())
        app = Application(
            id=app_id,
            user_id=demo_user.id,
            job_id=job.id,
            resume_id=primary_resume.id,
            status=status,
            applied_date=app_date,
            job_url=job.application_url,
            notes=notes
        )
        db.add(app)
        
        # Add Cover letter and answers
        cl = CoverLetter(
            id=str(uuid.uuid4()),
            application_id=app_id,
            user_id=demo_user.id,
            job_id=job.id,
            content=(
                f"Dear Hiring Team at {job.company},\n\n"
                f"I am writing to express my eager interest in the {job.title} position at {job.company}. "
                f"My background in software engineering, applied AI, and building production-ready services directly aligns "
                f"with your team's mission.\n\n"
                f"Sincerely,\nRohan Siddharth"
            )
        )
        db.add(cl)

        ans = ApplicationAnswer(
            id=str(uuid.uuid4()),
            application_id=app_id,
            question="Why are you interested in this position?",
            answer=f"I want to contribute to {job.company}'s engineering initiatives and scale robust systems that impact millions of users."
        )
        db.add(ans)

    # 7. Mock Interview
    mock_id = str(uuid.uuid4())
    mock_int = Interview(
        id=mock_id,
        user_id=demo_user.id,
        job_id=job_objects[0].id,
        role="AI Engineer",
        difficulty="Medium",
        overall_score=85,
        feedback_summary="Strong technical foundation in machine learning and Python. Articulated trade-offs well.",
        status="Completed"
    )
    db.add(mock_int)
    
    interview_qs = [
        ("Can you explain how a RAG (Retrieval-Augmented Generation) pipeline functions and how you mitigate hallucinations?", "Technical", 88, "Discussed chunking, embedding generation, vector indexing, and cross-encoder re-ranking."),
        ("Describe a project where you solved a difficult performance bottleneck.", "Project-based", 85, "Detailed how query latency was reduced through Redis caching and PostgreSQL indexes."),
        ("How do you handle disagreement with team members regarding API architectural choices?", "Behavioral", 82, "Highlighted objective benchmarking, listening, and maintaining focus on user requirements."),
        ("What is your approach to fine-tuning LLMs vs using prompt engineering?", "Technical", 90, "Accurately noted parameter efficiency, LoRA, cost-benefit trade-offs, and latency implications."),
        ("Where do you see yourself contributing most effectively in our engineering team?", "HR", 84, "Expressed clear enthusiasm for building reliable infrastructure and rapid experimentation.")
    ]
    for q_text, q_type, q_score, q_fb in interview_qs:
        iq = InterviewQuestion(
            id=str(uuid.uuid4()),
            interview_id=mock_id,
            question=q_text,
            question_type=q_type,
            user_answer="Detailed candidate technical response provided during mock session.",
            feedback=q_fb,
            score=q_score
        )
        db.add(iq)

    # 8. Learning Paths (3 learning roadmaps)
    learning_paths_data = [
        {
            "title": "30-Day DevOps & Containerization Roadmap",
            "skill": "Docker",
            "gap": 30,
            "progress": 45,
            "items": [
                (1, "Week 1: Container Fundamentals", "Docker Architecture & Dockerfiles", "Master image layers, multi-stage builds, and container networking."),
                (2, "Week 2: Orchestration Basics", "Docker Compose & Local Microservices", "Orchestrate multi-container setups with web app, database, and Redis cache."),
                (3, "Week 3: Kubernetes Essentials", "Pods, Deployments, and Services", "Deploy scalable workloads, configure ingress controllers, and manage secrets."),
                (4, "Week 4: Production CI/CD", "Automated Pipelines with GitHub Actions", "Build, test, scan, and deploy containers automatically to cloud environments.")
            ]
        },
        {
            "title": "Production FastAPI Microservices Roadmap",
            "skill": "FastAPI",
            "gap": 25,
            "progress": 70,
            "items": [
                (1, "Week 1: Async Python & FastAPI", "Pydantic V2 & Async Request Handlers", "Deep dive into async/await performance and schema validations."),
                (2, "Week 2: Database Layer", "SQLAlchemy 2.0 & Connection Pooling", "Design relational models, migrations with Alembic, and session management."),
                (3, "Week 3: Security & Auth", "OAuth2, JWT Tokens, and Role-Based Access", "Secure API endpoints with rate limiting, password hashing, and CORS."),
                (4, "Week 4: Caching & Background Tasks", "Redis and Background Workers", "Offload long running LLM generation and notification jobs.")
            ]
        },
        {
            "title": "Cloud Architecture & AWS Services Roadmap",
            "skill": "AWS",
            "gap": 20,
            "progress": 25,
            "items": [
                (1, "Week 1: Compute & Storage", "EC2, ECS, and S3 Storage", "Configure secure S3 buckets with presigned URLs and run containers on ECS."),
                (2, "Week 2: Serverless Functions", "AWS Lambda & API Gateway", "Build event-driven serverless endpoints and trigger background processing."),
                (3, "Week 3: Managed Databases", "Amazon RDS & DynamoDB", "Deploy high-availability PostgreSQL on RDS with automated backups."),
                (4, "Week 4: Cloud Security & IAM", "IAM Roles, VPCs, and Security Groups", "Configure zero-trust security boundaries and least-privilege policies.")
            ]
        }
    ]

    for lp_data in learning_paths_data:
        lp_id = str(uuid.uuid4())
        lp = LearningPath(
            id=lp_id,
            user_id=demo_user.id,
            title=lp_data["title"],
            target_skill=lp_data["skill"],
            gap_percentage=lp_data["gap"],
            progress_percentage=lp_data["progress"]
        )
        db.add(lp)
        for w_num, w_title, topic, desc in lp_data["items"]:
            li = LearningItem(
                id=str(uuid.uuid4()),
                learning_path_id=lp_id,
                week_number=w_num,
                week_title=w_title,
                topic=topic,
                description=desc,
                resource_url=None,
                is_completed=(w_num <= 1)
            )
            db.add(li)

    db.commit()
    print("Database successfully seeded!")
