from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from contextlib import asynccontextmanager
import os
from sqlalchemy import inspect, text

from app.core.config import settings
from app.database.connection import engine, Base, SessionLocal
from app.database.seed_data import seed_database
from app.api import auth, profile, resumes, jobs, applications, learning, interviews, analytics

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
    yield

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

# Static files for resume uploads
os.makedirs(settings.UPLOAD_DIR, exist_ok=True)
app.mount("/uploads", StaticFiles(directory=settings.UPLOAD_DIR), name="uploads")

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
