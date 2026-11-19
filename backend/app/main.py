from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
import os
import asyncio
import logging
from sqlalchemy import inspect, text

from app.core.config import settings
from app.database.connection import engine, Base, SessionLocal
from app.database.seed_data import seed_database
from app.api import auth, profile, resumes, jobs, applications, learning, interviews, analytics
from app.services.jobs.feed_sync import sync_job_boards

logger = logging.getLogger(__name__)

async def refresh_job_boards():
    while True:
        await asyncio.sleep(6 * 60 * 60)
        try:
            result = await asyncio.to_thread(sync_job_boards)
            logger.info("Employer board refresh completed: %s", result)
        except Exception:
            logger.exception("Employer board refresh failed")

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Initialize DB tables
    Base.metadata.create_all(bind=engine)
    # Add the verification timestamp to databases created by older ApplyFlow versions.
    if "email_verified_at" not in {column["name"] for column in inspect(engine).get_columns("users")}:
        column_type = "DATETIME" if engine.dialect.name == "sqlite" else "TIMESTAMP WITH TIME ZONE"
        with engine.begin() as connection:
            connection.execute(text(f"ALTER TABLE users ADD COLUMN email_verified_at {column_type}"))
    # Seed initial data if needed
    db = SessionLocal()
    try:
        seed_database(db)
    finally:
        db.close()
    # Refresh once at startup and then every six hours. Feed failures are logged
    # per board and do not prevent the API from starting.
    await asyncio.to_thread(sync_job_boards)
    refresh_task = asyncio.create_task(refresh_job_boards())
    yield
    refresh_task.cancel()
    try:
        await refresh_task
    except asyncio.CancelledError:
        pass

app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.VERSION,
    description="ApplyFlow: AI-Powered Job Application Assistant API",
    lifespan=lifespan
)

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Keep uploaded resumes private; they are stored on the persistent disk and are
# not exposed as unauthenticated static files.
os.makedirs(settings.UPLOAD_DIR, exist_ok=True)

# Include Routers
app.include_router(auth.router, prefix=settings.API_V1_STR)
app.include_router(profile.router, prefix=settings.API_V1_STR)
app.include_router(resumes.router, prefix=settings.API_V1_STR)
app.include_router(jobs.router, prefix=settings.API_V1_STR)
app.include_router(applications.router, prefix=settings.API_V1_STR)
app.include_router(learning.router, prefix=settings.API_V1_STR)
app.include_router(interviews.router, prefix=settings.API_V1_STR)
app.include_router(analytics.router, prefix=settings.API_V1_STR)

@app.get("/")
def root():
    return {
        "name": settings.PROJECT_NAME,
        "version": settings.VERSION,
        "status": "online",
        "docs_url": "/docs",
        "mock_mode": {
            "ai": settings.USE_MOCK_AI,
            "jobs": settings.USE_MOCK_JOBS
        }
    }

@app.get("/health")
def health():
    return {"status": "healthy"}
