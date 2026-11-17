from abc import ABC, abstractmethod
from typing import Dict, Any, List

class BaseLLMProvider(ABC):
    @abstractmethod
    def analyze_resume(self, text: str, target_role: str) -> Dict[str, Any]:
        """Perform comprehensive resume analysis."""
        pass

    @abstractmethod
    def rewrite_bullet(self, original: str, context: str = "") -> Dict[str, str]:
        """Improve a resume bullet point or section."""
        pass

    @abstractmethod
    def generate_cover_letter(self, user_profile: Dict[str, Any], resume_text: str, job: Dict[str, Any]) -> str:
        """Generate a personalized cover letter."""
        pass

    @abstractmethod
    def answer_application_questions(
        self, questions: List[str], user_profile: Dict[str, Any], resume_text: str, job: Dict[str, Any]
    ) -> List[Dict[str, str]]:
        """Answer common job application questions."""
        pass

    @abstractmethod
    def generate_interview_questions(
        self, role: str, difficulty: str, job: Dict[str, Any] = None, resume_text: str = ""
    ) -> List[Dict[str, Any]]:
        """Generate tailored mock interview questions."""
        pass

    @abstractmethod
    def evaluate_interview_answer(
        self, question: str, user_answer: str, role: str
    ) -> Dict[str, Any]:
        """Evaluate a candidate's answer to an interview question."""
        pass
