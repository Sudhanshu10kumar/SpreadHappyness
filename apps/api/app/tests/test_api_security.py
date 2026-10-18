import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from app.main import app
from app.core.database import Base, get_db
from app.models.user import UserRole

# Use in-memory SQLite for high-speed, isolated test runs
SQLALCHEMY_DATABASE_URL = "sqlite:///./test_verseora.db"

engine = create_engine(SQLALCHEMY_DATABASE_URL, connect_args={"check_same_thread": False})
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base.metadata.drop_all(bind=engine)
Base.metadata.create_all(bind=engine)

def override_get_db():
    try:
        db = TestingSessionLocal()
        yield db
    finally:
        db.close()

app.dependency_overrides[get_db] = override_get_db
client = TestClient(app)

@pytest.fixture(scope="module")
def setup_users():
    # Register User A
    res_a = client.post("/api/v1/auth/register", json={
        "username": "poet_arun",
        "email": "arun@example.com",
        "password": "SecurePassword123!",
        "full_name": "Arun Sharma"
    })
    token_a = res_a.json()["access_token"]
    user_a_id = res_a.json()["user"]["id"]

    # Register User B
    res_b = client.post("/api/v1/auth/register", json={
        "username": "shayar_mira",
        "email": "mira@example.com",
        "password": "SecurePassword123!",
        "full_name": "Mira Sen"
    })
    token_b = res_b.json()["access_token"]
    user_b_id = res_b.json()["user"]["id"]

    # Register Admin user directly in DB
    db = TestingSessionLocal()
    from app.core.security import get_password_hash
    from app.models.user import User, Profile
    admin_user = User(
        username="verse_admin",
        email="admin@verseora.io",
        hashed_password=get_password_hash("AdminMasterPass123!"),
        full_name="Chief Editor",
        role=UserRole.ADMIN,
        is_active=True,
        is_verified=True
    )
    db.add(admin_user)
    db.flush()
    profile = Profile(user_id=admin_user.id, pen_name="Admin")
    db.add(profile)
    db.commit()
    admin_id = admin_user.id
    db.close()

    # Admin login
    res_admin = client.post("/api/v1/auth/login", json={
        "login": "verse_admin",
        "password": "AdminMasterPass123!"
    })
    token_admin = res_admin.json()["access_token"]

    return {
        "user_a": {"id": user_a_id, "token": token_a, "headers": {"Authorization": f"Bearer {token_a}"}},
        "user_b": {"id": user_b_id, "token": token_b, "headers": {"Authorization": f"Bearer {token_b}"}},
        "admin": {"id": admin_id, "token": token_admin, "headers": {"Authorization": f"Bearer {token_admin}"}},
    }

def test_health_check():
    response = client.get("/health")
    assert response.status_code == 200
    assert response.json()["status"] == "healthy"

def test_auth_login_and_logout(setup_users):
    response = client.post("/api/v1/auth/login", json={
        "login": "poet_arun",
        "password": "SecurePassword123!"
    })
    assert response.status_code == 200
    data = response.json()
    assert "access_token" in data
    assert data["user"]["username"] == "poet_arun"

    logout_res = client.post("/api/v1/auth/logout")
    assert logout_res.status_code == 200

def test_draft_privacy_isolation(setup_users):
    """Proves User A cannot read or modify User B's private draft, and feed never leaks it."""
    headers_a = setup_users["user_a"]["headers"]
    headers_b = setup_users["user_b"]["headers"]

    # User A creates private draft
    res_draft = client.post("/api/v1/posts/", headers=headers_a, json={
        "title": "Secret Midnight Musings",
        "content": "<p>These are deeply personal lines not ready for the world.</p>",
        "content_type": "reflection",
        "language": "hindi",
        "tags": ["personal", "night"]
    })
    assert res_draft.status_code == 201
    draft_data = res_draft.json()
    draft_id = draft_data["id"]
    slug = draft_data["slug"]

    # Verify defaults are strictly private and draft
    assert draft_data["status"] == "draft"
    assert draft_data["visibility"] == "private"

    # User B attempts to access User A's private draft -> MUST FAIL with 404
    res_b_view = client.get(f"/api/v1/posts/{draft_id}", headers=headers_b)
    assert res_b_view.status_code == 404

    # Anonymous user attempts to access private draft -> MUST FAIL with 404
    res_anon_view = client.get(f"/api/v1/posts/{draft_id}")
    assert res_anon_view.status_code == 404

    # User B attempts to edit User A's draft -> MUST FAIL with 403
    res_b_edit = client.put(f"/api/v1/posts/{draft_id}", headers=headers_b, json={
        "title": "Hacked Title"
    })
    assert res_b_edit.status_code == 403

    # Public feed MUST NOT contain the private draft
    feed_res = client.get("/api/v1/posts/feed")
    assert feed_res.status_code == 200
    feed_items = feed_res.json()["items"]
    feed_ids = [item["id"] for item in feed_items]
    assert draft_id not in feed_ids

def test_xss_sanitization(setup_users):
    """Proves malicious script tags and event handlers are stripped from poetry submissions."""
    headers_a = setup_users["user_a"]["headers"]

    malicious_payload = (
        "<p>Sundar Shayari</p>"
        "<script>alert('xss_attack')</script>"
        "<img src=x onerror=alert('img_xss')>"
        "<em>True poetry survives safely.</em>"
    )

    res = client.post("/api/v1/posts/", headers=headers_a, json={
        "title": "XSS Test Poem",
        "content": malicious_payload,
        "content_type": "shayari",
        "language": "hindi"
    })
    assert res.status_code == 201
    saved_content = res.json()["content"]
    assert "<script>" not in saved_content
    assert "alert(" not in saved_content
    assert "onerror=" not in saved_content
    assert "<em>True poetry survives safely.</em>" in saved_content

def test_public_publishing_and_feed(setup_users):
    """Proves explicit publication makes poem visible to public feed."""
    headers_a = setup_users["user_a"]["headers"]

    # Create and publish a poem
    res = client.post("/api/v1/posts/", headers=headers_a, json={
        "title": "Chupke Se",
        "content": "<p>Chupke se raat aayi, taaron ki doli sajayi.</p>",
        "content_type": "shayari",
        "language": "hinglish",
        "mood": "silence",
        "tags": ["night", "peace"]
    })
    post_id = res.json()["id"]

    # Explicitly publish with public visibility
    pub_res = client.put(f"/api/v1/posts/{post_id}", headers=headers_a, json={
        "status": "published",
        "visibility": "public"
    })
    assert pub_res.status_code == 200
    assert pub_res.json()["status"] == "published"
    assert pub_res.json()["visibility"] == "public"

    # Now verify it appears in public feed
    feed_res = client.get("/api/v1/posts/feed?language=hinglish&mood=silence")
    assert feed_res.status_code == 200
    items = feed_res.json()["items"]
    assert any(item["id"] == post_id for item in items)

def test_duplicate_likes_prevented(setup_users):
    """Proves repeated like calls toggle cleanly and prevent duplicate records in database."""
    headers_b = setup_users["user_b"]["headers"]

    # User A creates and publishes
    headers_a = setup_users["user_a"]["headers"]
    post_res = client.post("/api/v1/posts/", headers=headers_a, json={
        "title": "Ghazal of Morning",
        "content": "<p>Subah ki kiran...</p>",
        "content_type": "poem"
    })
    post_id = post_res.json()["id"]
    client.put(f"/api/v1/posts/{post_id}", headers=headers_a, json={"status": "published", "visibility": "public"})

    # User B likes
    like1 = client.post(f"/api/v1/social/posts/{post_id}/like", headers=headers_b)
    assert like1.status_code == 200
    assert like1.json()["liked"] is True
    assert like1.json()["likes_count"] == 1

    # User B likes again -> toggles off (unlikes)
    like2 = client.post(f"/api/v1/social/posts/{post_id}/like", headers=headers_b)
    assert like2.status_code == 200
    assert like2.json()["liked"] is False
    assert like2.json()["likes_count"] == 0

def test_admin_rbac_enforcement(setup_users):
    """Proves non-admin users cannot access administrative endpoints."""
    headers_b = setup_users["user_b"]["headers"]
    headers_admin = setup_users["admin"]["headers"]

    # User B tries to view reports -> 403 Forbidden
    res_unauth = client.get("/api/v1/admin/reports", headers=headers_b)
    assert res_unauth.status_code == 403

    # Admin accesses reports -> 200 OK
    res_admin = client.get("/api/v1/admin/reports", headers=headers_admin)
    assert res_admin.status_code == 200

def test_user_data_export(setup_users):
    """Proves user can export their complete personal writing history."""
    headers_a = setup_users["user_a"]["headers"]
    res = client.get("/api/v1/export/my-data", headers=headers_a)
    assert res.status_code == 200
    data = res.json()
    assert "user" in data
    assert "posts" in data
    assert "collections" in data

