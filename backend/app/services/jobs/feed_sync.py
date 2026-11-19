"""Import configured public employer boards into the local jobs database."""

import json
import logging
from typing import Any, Dict, List

from sqlalchemy.orm import Session

from app.core.config import settings
from app.database.connection import SessionLocal
from app.models.models import Job, JobSource
from app.services.jobs.adapters import BoardAdapter

logger = logging.getLogger(__name__)


def configured_boards() -> List[Dict[str, Any]]:
    try:
        value = json.loads(settings.JOB_BOARDS or "[]")
    except json.JSONDecodeError as exc:
        logger.error("JOB_BOARDS must be a JSON array: %s", exc)
        return []
    if not isinstance(value, list):
        logger.error("JOB_BOARDS must be a JSON array")
        return []
    boards = []
    for board in value:
        if (isinstance(board, dict) and board.get("provider") in ("greenhouse", "lever")
                and isinstance(board.get("token"), str) and board["token"].strip()):
            boards.append(board)
        else:
            logger.warning("Ignoring invalid JOB_BOARDS entry")
    return boards


def _sync_board(db: Session, board: Dict[str, Any]) -> int:
    adapter = BoardAdapter(board)
    jobs = adapter.fetch_jobs()
    seen_ids = set()
    for item in jobs:
        external_id = item["external_id"]
        seen_ids.add(external_id)
        source = db.query(JobSource).filter_by(
            source_name=adapter.source_name, external_id=external_id
        ).first()
        if source:
            job = source.job
            job.title = item["title"][:255]
            job.company = item["company"][:255]
            job.description = item["description"] or item["title"]
            job.location = item["location"][:255]
            job.employment_type = item["employment_type"]
            job.is_internship = item["employment_type"] == "Internship"
            job.is_remote = item["is_remote"]
            job.posted_date = item["posted_date"][:50]
            job.application_url = item["url"][:500]
            job.is_active = True
            source.source_url = item["url"][:500]
        else:
            job = Job(
                title=item["title"][:255], company=item["company"][:255],
                description=item["description"] or item["title"],
                location=item["location"][:255], employment_type=item["employment_type"],
                is_internship=item["employment_type"] == "Internship", is_remote=item["is_remote"],
                posted_date=item["posted_date"][:50], application_url=item["url"][:500], is_active=True,
            )
            db.add(job)
            db.flush()
            db.add(JobSource(
                job_id=job.id, source_name=adapter.source_name,
                source_url=item["url"][:500], external_id=external_id,
            ))

    # Only retire listings after this particular board returned a successful response.
    stale_sources = db.query(JobSource).filter(
        JobSource.source_name == adapter.source_name,
        JobSource.external_id.isnot(None),
    ).all()
    for source in stale_sources:
        if source.external_id not in seen_ids:
            job_id = source.job_id
            has_other_source = db.query(JobSource.id).filter(
                JobSource.job_id == job_id, JobSource.id != source.id
            ).first() is not None
            db.delete(source)
            if not has_other_source:
                source.job.is_active = False
    db.commit()
    return len(jobs)


def sync_job_boards() -> Dict[str, Any]:
    boards = configured_boards()
    if not boards:
        return {"boards": 0, "jobs": 0}
    db = SessionLocal()
    total = 0
    completed = 0
    try:
        for board in boards:
            try:
                count = _sync_board(db, board)
                total += count
                completed += 1
                logger.info("Imported %s jobs from %s/%s", count, board["provider"], board["token"])
            except Exception:
                db.rollback()
                logger.exception("Could not refresh %s/%s", board.get("provider"), board.get("token"))
        return {"boards": completed, "jobs": total}
    finally:
        db.close()
