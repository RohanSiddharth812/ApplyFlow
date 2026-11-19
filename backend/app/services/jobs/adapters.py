"""Public job-board feed adapters for Greenhouse and Lever."""

from datetime import datetime, timezone
from html import unescape
from typing import Any, Dict, List

import httpx


def _plain_text(value: str) -> str:
    import re

    return unescape(re.sub(r"<[^>]+>", " ", value or " ")).strip()


def _employment_type(value: str) -> str:
    value = (value or "").lower()
    if "intern" in value:
        return "Internship"
    if "contract" in value or "temporary" in value:
        return "Contract"
    if "part" in value:
        return "Part-time"
    return "Full-time"


class BoardAdapter:
    """Fetch published jobs from one configured employer ATS board."""

    def __init__(self, board: Dict[str, Any]):
        self.board = board
        self.provider = str(board["provider"]).lower()
        self.token = str(board["token"]).strip()
        self.company = str(board.get("company") or self.token)

    @property
    def source_name(self) -> str:
        return f"{self.provider.title()} / {self.token}"

    def fetch_jobs(self, limit: int = 500) -> List[Dict[str, Any]]:
        if self.provider == "greenhouse":
            return self._greenhouse(limit)
        if self.provider == "lever":
            return self._lever(limit)
        raise ValueError(f"Unsupported job board provider: {self.provider}")

    def _greenhouse(self, limit: int) -> List[Dict[str, Any]]:
        response = httpx.get(
            f"https://boards-api.greenhouse.io/v1/boards/{self.token}/jobs",
            params={"content": "true"}, timeout=20,
        )
        response.raise_for_status()
        rows = response.json().get("jobs", [])
        jobs = []
        for row in rows[:limit]:
            location = (row.get("location") or {}).get("name") or "Not specified"
            content = _plain_text(row.get("content", ""))
            metadata = row.get("metadata") or []
            job_type = " ".join(
                str(value.get("value", "")) for value in metadata
                if isinstance(value, dict)
                and any(term in str(value.get("name", "")).lower() for term in ("employment", "job type", "commitment"))
            )
            jobs.append({
                "external_id": str(row["id"]), "title": row.get("title") or "Role",
                "company": self.company, "description": content or row.get("title", ""),
                "location": location, "url": row.get("absolute_url") or "",
                "posted_date": row.get("updated_at") or "Recently",
                "employment_type": _employment_type(job_type),
                "is_remote": "remote" in location.lower(),
            })
        return [job for job in jobs if job["url"]]

    def _lever(self, limit: int) -> List[Dict[str, Any]]:
        rows = []
        while len(rows) < limit:
            page_size = min(100, limit - len(rows))
            response = httpx.get(
                f"https://api.lever.co/v0/postings/{self.token}",
                params={"mode": "json", "skip": len(rows), "limit": page_size}, timeout=20,
            )
            response.raise_for_status()
            page = response.json()
            rows.extend(page)
            if len(page) < page_size:
                break
        jobs = []
        for row in rows[:limit]:
            categories = row.get("categories") or {}
            location = categories.get("location") or "Not specified"
            country = str(row.get("country") or "").upper()
            if country == "IN" and "india" not in location.lower():
                location = f"{location}, India"
            commitment = categories.get("commitment") or ""
            jobs.append({
                "external_id": str(row["id"]), "title": row.get("text") or "Role",
                "company": self.company,
                "description": _plain_text(row.get("descriptionPlain") or row.get("description", "")),
                "location": location, "url": row.get("hostedUrl") or row.get("applyUrl") or "",
                "posted_date": datetime.fromtimestamp(row["createdAt"] / 1000, timezone.utc).date().isoformat()
                if row.get("createdAt") else "Recently",
                "employment_type": _employment_type(commitment),
                "is_remote": "remote" in (location + " " + str(categories.get("workplaceType", ""))).lower(),
                "country": country,
            })
        return [job for job in jobs if job["url"]]
