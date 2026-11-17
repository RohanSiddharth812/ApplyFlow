import pytest
from urllib.parse import parse_qs, urlparse
from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

def test_root():
    response = client.get("/")
    assert response.status_code == 200
    data = response.json()
    assert data["name"] == "ApplyFlow"
    assert data["status"] == "online"

def test_health():
    response = client.get("/health")
    assert response.status_code == 200
    assert response.json()["status"] == "healthy"

def test_auth_login():
    response = client.post(
        "/api/auth/login",
        json={"email": "rohan@example.com", "password": "password123"}
    )
    assert response.status_code == 200
    data = response.json()
    assert "access_token" in data
    assert data["user"]["email"] == "rohan@example.com"

def test_signup_requires_email_verification_before_login():
    email = "verification-test@example.com"
    registered = client.post("/api/auth/register", json={
        "email": email, "full_name": "Verification Test", "password": "strong-pass-123"
    })
    assert registered.status_code == 202
    verification_url = registered.json()["dev_verification_url"]
    token = parse_qs(urlparse(verification_url).query)["token"][0]

    blocked_login = client.post("/api/auth/login", json={"email": email, "password": "strong-pass-123"})
    assert blocked_login.status_code == 403

    verified = client.post("/api/auth/verify-email", json={"token": token})
    assert verified.status_code == 200
    assert verified.json()["user"]["email"] == email

    allowed_login = client.post("/api/auth/login", json={"email": email, "password": "strong-pass-123"})
    assert allowed_login.status_code == 200
    assert "access_token" in allowed_login.json()
    reused = client.post("/api/auth/verify-email", json={"token": token})
    assert reused.status_code == 400

def test_list_resumes():
    # Authenticated via demo fallback or token
    login_resp = client.post(
        "/api/auth/login",
        json={"email": "rohan@example.com", "password": "password123"}
    )
    token = login_resp.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}

    res = client.get("/api/resumes", headers=headers)
    assert res.status_code == 200
    resumes = res.json()
    assert len(resumes) >= 5
    assert any(r["filename"] == "Rohan_Resume_AI.pdf" for r in resumes)

def test_list_jobs_and_match():
    login_resp = client.post(
        "/api/auth/login",
        json={"email": "rohan@example.com", "password": "password123"}
    )
    token = login_resp.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}

    # All jobs
    res = client.get("/api/jobs", headers=headers)
    assert res.status_code == 200
    jobs = res.json()
    assert len(jobs) >= 20

    # Recommended jobs
    res_rec = client.get("/api/jobs?tab=recommended", headers=headers)
    assert res_rec.status_code == 200
    rec_jobs = res_rec.json()
    assert len(rec_jobs) > 0
    assert rec_jobs[0]["match_percentage"] >= 80

    # Job Detail & Match
    first_job_id = jobs[0]["id"]
    job_det = client.get(f"/api/jobs/{first_job_id}", headers=headers)
    assert job_det.status_code == 200
    data = job_det.json()
    assert "match_analysis" in data
    assert data["match_analysis"]["overall_match"] > 0
    assert len(data["match_analysis"]["why_match"]) > 0

def test_application_copilot_and_submit():
    login_resp = client.post(
        "/api/auth/login",
        json={"email": "rohan@example.com", "password": "password123"}
    )
    token = login_resp.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}

    jobs = client.get("/api/jobs", headers=headers).json()
    job_id = jobs[0]["id"]

    # 1. Prepare
    prep_res = client.post(f"/api/applications/prepare?job_id={job_id}", headers=headers)
    assert prep_res.status_code == 200
    prep_data = prep_res.json()
    assert "generated_cover_letter" in prep_data
    assert len(prep_data["suggested_answers"]) > 0
    assert prep_data["recommended_resume"] is not None

    # 2. Submit with human confirmation
    payload = {
        "job_id": job_id,
        "resume_id": prep_data["recommended_resume"]["id"],
        "cover_letter": prep_data["generated_cover_letter"],
        "answers": prep_data["suggested_answers"],
        "notes": "Automated test application submission",
        "confirmed_human_review": True
    }
    submit_res = client.post("/api/applications", json=payload, headers=headers)
    assert submit_res.status_code == 200
    app_data = submit_res.json()
    assert app_data["status"] == "Applied"
    assert app_data["company"] == prep_data["job"]["company"]

def test_analytics_and_learning():
    login_resp = client.post(
        "/api/auth/login",
        json={"email": "rohan@example.com", "password": "password123"}
    )
    token = login_resp.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}

    # Analytics
    an_res = client.get("/api/analytics/overview", headers=headers)
    assert an_res.status_code == 200
    an_data = an_res.json()
    assert an_data["total_applications"] > 0
    assert len(an_data["most_requested_skills"]) > 0

    # Learning Roadmap
    lr_res = client.get("/api/learning/roadmap", headers=headers)
    assert lr_res.status_code == 200
    lr_data = lr_res.json()
    assert len(lr_data["skill_gaps"]) > 0
    assert len(lr_data["roadmap"]) > 0
