import json
import logging
from typing import Dict, Any, List
from openai import OpenAI
from app.services.ai.base import BaseLLMProvider
from app.core.config import settings

logger = logging.getLogger(__name__)

class OpenAIProvider(BaseLLMProvider):
    def __init__(self):
        self.client = OpenAI(
            api_key=settings.AI_API_KEY or "missing_key",
            base_url=settings.AI_BASE_URL
        )
        self.model = settings.AI_MODEL

    def _call_llm(self, system_prompt: str, user_prompt: str, json_mode: bool = True) -> str:
        response = self.client.chat.completions.create(
            model=self.model,
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": user_prompt}
            ],
            response_format={"type": "json_object"} if json_mode else None,
            temperature=0.3
        )
        return response.choices[0].message.content or ""

    def analyze_resume(self, text: str, target_role: str) -> Dict[str, Any]:
        system_prompt = (
            "You are an expert ATS and technical recruiter. Analyze the provided resume text and return a JSON object with: "
            "overall_score (0-100), ats_compatibility (0-100), technical_skills_score (0-100), projects_score (0-100), "
            "experience_score (0-100), keywords_score (0-100), formatting_score (0-100), "
            "key_findings (list of strings), ai_suggestions (list of strings), missing_keywords (list of strings)."
        )
        user_prompt = f"Target Role: {target_role}\n\nResume Text:\n{text[:6000]}"
        try:
            content = self._call_llm(system_prompt, user_prompt, json_mode=True)
            return json.loads(content)
        except Exception as e:
            logger.error(f"OpenAI error in analyze_resume: {e}")
            from app.services.ai.mock_provider import MockAIProvider
            return MockAIProvider().analyze_resume(text, target_role)

    def rewrite_bullet(self, original: str, context: str = "") -> Dict[str, str]:
        system_prompt = (
            "You are an executive resume writer. Rewrite the bullet point using the Google XYZ formula: "
            "'Accomplished [X] as measured by [Y], by doing [Z]'. "
            "Return JSON with 'original', 'suggested', and 'reasoning'."
        )
        user_prompt = f"Context: {context}\nOriginal Bullet: {original}"
        try:
            content = self._call_llm(system_prompt, user_prompt, json_mode=True)
            return json.loads(content)
        except Exception as e:
            logger.error(f"OpenAI error in rewrite_bullet: {e}")
            from app.services.ai.mock_provider import MockAIProvider
            return MockAIProvider().rewrite_bullet(original, context)

    def generate_cover_letter(self, user_profile: Dict[str, Any], resume_text: str, job: Dict[str, Any]) -> str:
        system_prompt = "You are a professional cover letter writer. Write a compelling, concise 3-paragraph cover letter tailored to the job. Return plain text."
        user_prompt = f"Candidate Profile: {json.dumps(user_profile)}\nJob Details: {json.dumps(job)}\nResume Summary: {resume_text[:2000]}"
        try:
            return self._call_llm(system_prompt, user_prompt, json_mode=False)
        except Exception as e:
            logger.error(f"OpenAI error in generate_cover_letter: {e}")
            from app.services.ai.mock_provider import MockAIProvider
            return MockAIProvider().generate_cover_letter(user_profile, resume_text, job)

    def answer_application_questions(
        self, questions: List[str], user_profile: Dict[str, Any], resume_text: str, job: Dict[str, Any]
    ) -> List[Dict[str, str]]:
        system_prompt = (
            "Answer the application questions authentically and professionally based only on the candidate's profile and resume. "
            "Do not fabricate experience. Return JSON object with 'answers': [{'question': '...', 'answer': '...'}]"
        )
        user_prompt = f"Questions: {json.dumps(questions)}\nProfile: {json.dumps(user_profile)}\nJob: {json.dumps(job)}"
        try:
            content = self._call_llm(system_prompt, user_prompt, json_mode=True)
            return json.loads(content).get("answers", [])
        except Exception as e:
            logger.error(f"OpenAI error in answer_application_questions: {e}")
            from app.services.ai.mock_provider import MockAIProvider
            return MockAIProvider().answer_application_questions(questions, user_profile, resume_text, job)

    def generate_interview_questions(
        self, role: str, difficulty: str, job: Dict[str, Any] = None, resume_text: str = ""
    ) -> List[Dict[str, Any]]:
        system_prompt = (
            "Generate 5 realistic interview questions (mix of Technical, Project-based, Behavioral, and HR). "
            "Return JSON object with 'questions': [{'id': 'q1', 'question': '...', 'question_type': '...', 'expected_points': '...'}]"
        )
        user_prompt = f"Role: {role}, Difficulty: {difficulty}"
        try:
            content = self._call_llm(system_prompt, user_prompt, json_mode=True)
            return json.loads(content).get("questions", [])
        except Exception as e:
            logger.error(f"OpenAI error in generate_interview_questions: {e}")
            from app.services.ai.mock_provider import MockAIProvider
            return MockAIProvider().generate_interview_questions(role, difficulty, job, resume_text)

    def evaluate_interview_answer(
        self, question: str, user_answer: str, role: str
    ) -> Dict[str, Any]:
        system_prompt = (
            "Evaluate candidate's interview response. Be constructive, factual, and actionable. "
            "Return JSON object with 'score' (0-100) and 'feedback' (string)."
        )
        user_prompt = f"Role: {role}\nQuestion: {question}\nCandidate Answer: {user_answer}"
        try:
            content = self._call_llm(system_prompt, user_prompt, json_mode=True)
            return json.loads(content)
        except Exception as e:
            logger.error(f"OpenAI error in evaluate_interview_answer: {e}")
            from app.services.ai.mock_provider import MockAIProvider
            return MockAIProvider().evaluate_interview_answer(question, user_answer, role)
