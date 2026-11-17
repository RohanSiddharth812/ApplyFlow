from typing import List, Dict, Any
from app.services.jobs.base import JobSourceAdapter

class LinkedInAdapter(JobSourceAdapter):
    @property
    def source_name(self) -> str:
        return "LinkedIn"

    def fetch_jobs(self, query: str = "", location: str = "", limit: int = 20) -> List[Dict[str, Any]]:
        # In mock mode, returns simulated structured feed from LinkedIn public career endpoints
        return []

class IndeedAdapter(JobSourceAdapter):
    @property
    def source_name(self) -> str:
        return "Indeed"

    def fetch_jobs(self, query: str = "", location: str = "", limit: int = 20) -> List[Dict[str, Any]]:
        return []

class CompanyCareersAdapter(JobSourceAdapter):
    @property
    def source_name(self) -> str:
        return "Company Careers"

    def fetch_jobs(self, query: str = "", location: str = "", limit: int = 20) -> List[Dict[str, Any]]:
        return []

class InstahyreAdapter(JobSourceAdapter):
    @property
    def source_name(self) -> str:
        return "Instahyre"

    def fetch_jobs(self, query: str = "", location: str = "", limit: int = 20) -> List[Dict[str, Any]]:
        return []
