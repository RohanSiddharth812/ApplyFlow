import re
from typing import Dict, Any, List
from app.services.ai.base import BaseLLMProvider

class MockAIProvider(BaseLLMProvider):
    """High quality mock provider providing realistic AI outputs for local testing."""

    def analyze_resume(self, text: str, target_role: str) -> Dict[str, Any]:
        text_lower = text.lower()
        word_count = len(text.split())

        # Transparent criteria evaluation
        ats_score = 85
        tech_score = 80
        projects_score = 78
        exp_score = 70
        keywords_score = 88
        formatting_score = 90

        if "python" in text_lower:
            tech_score += 5
        if "fastapi" in text_lower or "docker" in text_lower:
            keywords_score += 4
        if word_count < 150:
            formatting_score -= 10
            projects_score -= 10

        overall = round((ats_score * 0.25) + (tech_score * 0.25) + (projects_score * 0.15) + 
                        (exp_score * 0.15) + (keywords_score * 0.1) + (formatting_score * 0.1))

        return {
            "overall_score": min(98, max(50, overall)),
            "ats_compatibility": ats_score,
            "technical_skills_score": min(100, tech_score),
            "projects_score": projects_score,
            "experience_score": exp_score,
            "keywords_score": keywords_score,
            "formatting_score": formatting_score,
            "key_findings": [
                "Project descriptions are slightly generic and would benefit from explicit metrics.",
                "Technical skills section is well structured with modern frameworks highlighted.",
                "Work experience demonstrates clear technical progression and responsibility.",
                "Good keyword coverage for software engineering and AI/ML positions."
            ],
            "ai_suggestions": [
                "Add measurable business impact results to project bullets (e.g. reduced latency by 35%).",
                "Add relevant keywords such as Docker, Kubernetes, and CI/CD pipelines.",
                "Highlight technical skills in the top third of the first page for ATS scanning.",
                "Consider creating a role-specific resume version emphasizing production deployment."
            ],
            "missing_keywords": ["Docker", "Kubernetes", "FastAPI", "CI/CD", "System Design"]
        }

    def rewrite_bullet(self, original: str, context: str = "") -> Dict[str, str]:
        # Intelligent contextual rewrite
        original_clean = original.strip()
        
        if "ai" in original_clean.lower() or "python" in original_clean.lower():
            suggested = (
                "Architected and deployed an AI-powered document retrieval system using Python, "
                "FastAPI, and RAG techniques, enhancing query response accuracy by 42% and reducing retrieval latency."
            )
            reasoning = "Added strong action verbs ('Architected', 'Deployed'), quantified impact (42% accuracy), and highlighted specific tech stack (FastAPI, RAG)."
        elif "api" in original_clean.lower() or "backend" in original_clean.lower():
            suggested = (
                "Developed high-throughput RESTful microservices in Python/FastAPI with PostgreSQL and Redis caching, "
                "supporting 10,000+ daily requests with sub-50ms latency."
            )
            reasoning = "Transformed passive duties into measurable scale, throughput metrics, and specific database/caching technologies."
        else:
            suggested = (
                f"Spearheaded development of {original_clean.lower().rstrip('.')}, collaborating with cross-functional "
                "teams to deliver production-ready deliverables 2 weeks ahead of scheduled deadlines."
            )
            reasoning = "Applied XYZ resume formula: Accomplished [X], measured by [Y], by doing [Z]."

        return {
            "original": original_clean,
            "suggested": suggested,
            "reasoning": reasoning
        }

    def generate_cover_letter(self, user_profile: Dict[str, Any], resume_text: str, job: Dict[str, Any]) -> str:
        applicant_name = user_profile.get("full_name", "Applicant")
        company = job.get("company", "the company")
        job_title = job.get("title", "this position")
        
        return (
            f"Dear Hiring Manager at {company},\n\n"
            f"I am writing to express my enthusiastic interest in the {job_title} role at {company}. "
            f"With a strong foundation in modern software engineering, hands-on experience building scalable applications, "
            f"and a passion for innovative technology solutions, I am confident in my ability to deliver immediate value to your engineering team.\n\n"
            f"In my previous work and projects, I have developed robust backend microservices, leveraged modern AI/ML frameworks, "
            f"and designed efficient data pipelines with clean, test-driven code. The mission and technical challenges at {company} strongly align "
            f"with my career goals and dedication to high-impact software craft.\n\n"
            f"I welcome the opportunity to discuss how my technical skills and proactive problem-solving mindset can support {company}'s ongoing objectives. "
            f"Thank you for your time and consideration.\n\n"
            f"Warm regards,\n"
            f"{applicant_name}"
        )

    def answer_application_questions(
        self, questions: List[str], user_profile: Dict[str, Any], resume_text: str, job: Dict[str, Any]
    ) -> List[Dict[str, str]]:
        company = job.get("company", "your organization")
        job_title = job.get("title", "this position")

        answers = []
        for q in questions:
            q_lower = q.lower()
            if "why are you interested" in q_lower or "why do you want" in q_lower:
                ans = (
                    f"I have closely followed {company}'s leadership in the industry. The {job_title} role offers the perfect "
                    f"intersection of challenging technical architecture and meaningful user impact, where I can apply my expertise "
                    f"while contributing to high-standard products."
                )
            elif "why should we hire you" in q_lower or "why are you a good fit" in q_lower:
                ans = (
                    f"I combine rigorous technical fundamentals in modern software architectures with rapid execution and problem-solving skills. "
                    f"I take ownership of deliverables end-to-end, write well-documented, testable code, and thrive in collaborative engineering cultures."
                )
            elif "python" in q_lower or "experience" in q_lower:
                ans = (
                    "I have extensive hands-on experience designing and deploying Python services, implementing RESTful APIs with FastAPI and SQLAlchemy, "
                    "optimizing asynchronous workflows, and integrating AI and machine learning models into production systems."
                )
            elif "salary" in q_lower or "compensation" in q_lower:
                ans = "Negotiable based on the total compensation package, role expectations, and growth opportunities."
            elif "notice" in q_lower or "start" in q_lower:
                ans = "Available immediately or within a 2-week transition window."
            else:
                ans = (
                    f"My background in software engineering and hands-on project delivery equips me with the technical agility "
                    f"and disciplined mindset required to excel in this capacity at {company}."
                )

            answers.append({
                "question": q,
                "answer": ans
            })
        return answers

    def generate_interview_questions(
        self, role: str, difficulty: str, job: Dict[str, Any] = None, resume_text: str = ""
    ) -> List[Dict[str, Any]]:
        return [
            {
                "id": "q1",
                "question": f"Can you describe how you architect and optimize a RESTful API service in a {role} context to handle traffic spikes?",
                "question_type": "Technical",
                "expected_points": "Discuss caching (Redis), asynchronous task processing, database indexing, horizontal scaling, and rate limiting."
            },
            {
                "id": "q2",
                "question": "Tell me about a challenging technical bug or edge case you encountered in your projects and how you diagnosed and resolved it.",
                "question_type": "Project-based",
                "expected_points": "Structure answer using STAR method: Situation, Task, Action, Result with specific debugging tools and metrics."
            },
            {
                "id": "q3",
                "question": "How do you evaluate and implement security best practices (e.g. authentication, input sanitization, token expiration) in your applications?",
                "question_type": "Technical",
                "expected_points": "Mention JWT/OAuth, bcrypt hashing, parameter validation (Pydantic), CORS policies, and HTTPS encryption."
            },
            {
                "id": "q4",
                "question": "Describe a scenario where you received critical code review feedback or had to balance engineering speed versus code perfection.",
                "question_type": "Behavioral",
                "expected_points": "Demonstrate receptiveness to feedback, pragmatic tradeoff analysis, and communication with team members."
            },
            {
                "id": "q5",
                "question": "What steps do you take to stay up-to-date with emerging tools and frameworks in modern software engineering and AI?",
                "question_type": "HR",
                "expected_points": "Demonstrate curiosity, active experimentation with open source libraries, reading papers/blogs, and building side projects."
            }
        ]

    def evaluate_interview_answer(
        self, question: str, user_answer: str, role: str
    ) -> Dict[str, Any]:
        ans_length = len(user_answer.split())
        score = 80
        feedback_notes = []

        if ans_length < 15:
            score = 60
            feedback_notes.append("The answer is quite brief. Consider using the STAR method (Situation, Task, Action, Result) to provide concrete examples.")
        elif ans_length > 40:
            score = 88
            feedback_notes.append("Great detail and structured response. You covered relevant technical concepts and articulated your reasoning clearly.")
        else:
            score = 78
            feedback_notes.append("Good foundational response. Expanding with specific quantitative results and architectural tradeoffs would strengthen your answer.")

        return {
            "score": score,
            "feedback": " ".join(feedback_notes)
        }
