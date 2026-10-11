import uuid

import pytest
from httpx import ASGITransport, AsyncClient

from app.db.models import Organization, Project, User
from app.db.session import SessionLocal
from app.main import app


@pytest.mark.asyncio
async def test_owner_signup_and_me():
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as client:
        unique_email = f"owner_{uuid.uuid4().hex[:6]}@example.com"
        signup_payload = {
            "organization_name": "Acme Developments",
            "email": unique_email,
            "password": "SuperSecretPassword123!",
            "first_name": "Alice",
            "last_name": "Developer",
        }
        resp = await client.post("/api/v1/auth/signup", json=signup_payload)
        assert resp.status_code == 200, resp.text
        data = resp.json()["data"]
        assert data["email"] == unique_email
        assert data["role"] == "OWNER"
        assert "access_token" in resp.cookies

        # Calling /me with cookie
        me_resp = await client.get("/api/v1/me")
        assert me_resp.status_code == 200
        me_data = me_resp.json()["data"]
        assert me_data["email"] == unique_email
        assert "organization:manage" in me_data["permissions"]


@pytest.mark.asyncio
async def test_signin_and_signout():
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as client:
        unique_email = f"cfo_{uuid.uuid4().hex[:6]}@example.com"
        # Create an owner first
        await client.post(
            "/api/v1/auth/signup",
            json={
                "organization_name": "Gotham Builders",
                "email": unique_email,
                "password": "Password123!",
                "first_name": "Bruce",
                "last_name": "Wayne",
            },
        )

        # Sign in
        signin_resp = await client.post(
            "/api/v1/auth/signin",
            json={
                "email": unique_email,
                "password": "Password123!",
            },
        )
        assert signin_resp.status_code == 200
        assert "access_token" in signin_resp.cookies

        # Sign out
        signout_resp = await client.post("/api/v1/auth/signout")
        assert signout_resp.status_code == 200


@pytest.mark.asyncio
async def test_invitations_and_role_access():
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as client:
        # Owner signs up
        owner_email = f"owner_{uuid.uuid4().hex[:6]}@example.com"
        signup_resp = await client.post(
            "/api/v1/auth/signup",
            json={
                "organization_name": "Skyline Holdings",
                "email": owner_email,
                "password": "Password123!",
                "first_name": "Sarah",
                "last_name": "Connor",
            },
        )
        assert signup_resp.status_code == 200

        # Owner invites a GC
        gc_email = f"gc_{uuid.uuid4().hex[:6]}@contractor.com"
        invite_resp = await client.post(
            "/api/v1/invitations",
            json={
                "email": gc_email,
                "role": "GC",
                "scope": "PROJECT",
            },
        )
        assert invite_resp.status_code == 200
        inv_data = invite_resp.json()["data"]
        invite_url = inv_data["invitation_url"]
        token = invite_url.rsplit("/", 1)[1]

        details_resp = await client.get(f"/api/v1/invitations/{token}")
        assert details_resp.status_code == 200
        assert details_resp.json()["data"]["email"] == gc_email
        assert details_resp.json()["data"]["role"] == "GC"
        assert details_resp.json()["data"]["status"] == "PENDING"

        # New client (representing GC) accepts invite
        async with AsyncClient(
            transport=ASGITransport(app=app), base_url="http://test"
        ) as gc_client:
            accept_resp = await gc_client.post(
                f"/api/v1/invitations/{token}/accept",
                json={
                    "first_name": "Bob",
                    "last_name": "Builder",
                    "password": "BuildPassword123!",
                },
            )
            assert accept_resp.status_code == 200
            gc_profile = accept_resp.json()["data"]
            assert gc_profile["email"] == gc_email
            assert gc_profile["role"] == "GC"

            # GC checks /me
            gc_me = await gc_client.get("/api/v1/me")
            assert gc_me.status_code == 200
            assert "submissions:manage" in gc_me.json()["data"]["permissions"]
            accepted_invitation = await gc_client.get(f"/api/v1/invitations/{token}")
            assert accepted_invitation.json()["data"]["status"] == "ACCEPTED"

            # GC should be blocked from Owner-only endpoint (e.g. creating organizations or invitations)
            blocked_resp = await gc_client.post(
                "/api/v1/invitations",
                json={
                    "email": "another@contractor.com",
                    "role": "PM",
                },
            )
            assert blocked_resp.status_code == 403
            assert blocked_resp.json()["error"]["code"] == "FORBIDDEN"


@pytest.mark.asyncio
async def test_out_of_scope_project_returns_404():
    from app.core.auth import require_project_scope
    from app.core.errors import NotFoundException

    session = SessionLocal()
    try:
        org1 = Organization(name="Org 1")
        org2 = Organization(name="Org 2")
        session.add(org1)
        session.add(org2)
        session.flush()

        # Create user in org1 and project in org2
        user = User(
            organization_id=org1.id,
            email=f"user_{uuid.uuid4().hex[:6]}@example.com",
            hashed_password="pw",
            first_name="Test",
            last_name="User",
            role="PM",
        )
        project = Project(
            organization_id=org2.id,  # Different organization!
            name="Secret Project",
            project_entity="Entity LLC",
            address="123 Road",
        )
        session.add(user)
        session.add(project)
        session.flush()

        with pytest.raises(NotFoundException) as exc_info:
            require_project_scope(pid=project.id, user=user, db=session)
        assert exc_info.value.status_code == 404
        assert exc_info.value.code == "NOT_FOUND"
    finally:
        session.close()
