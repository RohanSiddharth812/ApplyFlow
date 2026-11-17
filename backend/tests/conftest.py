"""Give API tests a disposable database instead of the user's local app data."""
from __future__ import annotations

import os
import tempfile
from pathlib import Path
from uuid import uuid4
from datetime import datetime, timezone

import pytest


_test_dir = Path(tempfile.gettempdir()) / f"applyflow-tests-{uuid4().hex}"
_test_dir.mkdir()
_test_db = _test_dir / "test.db"
os.environ["DATABASE_URL"] = f"sqlite:///{_test_db.as_posix()}"


@pytest.fixture(scope="session", autouse=True)
def initialize_test_database():
    # Import after overriding DATABASE_URL so the app engine points at this DB.
    from app.database.connection import Base, SessionLocal, engine
    from app.database.seed_data import seed_database
    import app.main  # noqa: F401; registers all ORM models with Base

    Base.metadata.create_all(bind=engine)
    db = SessionLocal()
    try:
        seed_database(db)
        # Existing demo fixtures represent a previously verified account. Signup
        # verification behavior is exercised separately by the auth tests.
        from app.models.models import User
        demo_user = db.query(User).filter_by(email="rohan@example.com").first()
        if demo_user:
            demo_user.email_verified_at = datetime.now(timezone.utc)
            db.commit()
    finally:
        db.close()

    yield

    Base.metadata.drop_all(bind=engine)
    engine.dispose()
    for suffix in ("", "-wal", "-shm"):
        candidate = Path(str(_test_db) + suffix)
        if candidate.exists():
            candidate.unlink()
    _test_dir.rmdir()
