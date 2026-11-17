from abc import ABC, abstractmethod
from typing import List, Dict, Any

class JobSourceAdapter(ABC):
    @property
    @abstractmethod
    def source_name(self) -> str:
        pass

    @abstractmethod
    def fetch_jobs(self, query: str = "", location: str = "", limit: int = 20) -> List[Dict[str, Any]]:
        """Fetch jobs from the official API or permitted feed."""
        pass
