import uuid
import pytest
from httpx import ASGITransport, AsyncClient

from app.core.security import hash_password
from app.db.models import Organization, Project, ProjectMember, User, Document
from app.db.session import SessionLocal
from app.main import app


@pytest.fixture
def db_session():
    session = SessionLocal()
    try:
        yield session
    finally:
        session.close()


@pytest.mark.asyncio
async def test_role_matrix_and_project_member_effective_role(db_session):
    # Setup organization and two projects
    org = Organization(name=f"Org-{uuid.uuid4().hex[:6]}")
    db_session.add(org)
    db_session.flush()

    p1 = Project(organization_id=org.id, name="Project Alpha", project_entity="Alpha LLC", address="100 Alpha St")
    p2 = Project(organization_id=org.id, name="Project Beta", project_entity="Beta LLC", address="200 Beta St")
    db_session.add_all([p1, p2])
    db_session.flush()

    # User who is PM on Project Alpha, but CFO on Project Beta
    multi_user = User(
        organization_id=org.id,
        email=f"multi_{uuid.uuid4().hex[:6]}@example.com",
        hashed_password=hash_password("Password123!"),
        first_name="Multi",
        last_name="Role",
        role="PM",  # Default org role
    )
    # User who is GC on Project Alpha
    gc_user = User(
        organization_id=org.id,
        email=f"gc_{uuid.uuid4().hex[:6]}@example.com",
        hashed_password=hash_password("Password123!"),
        first_name="Gary",
        last_name="Contractor",
        role="GC",
    )
    # User who is Owner
    owner_user = User(
        organization_id=org.id,
        email=f"owner_{uuid.uuid4().hex[:6]}@example.com",
        hashed_password=hash_password("Password123!"),
        first_name="Olivia",
        last_name="Owner",
        role="OWNER",
    )
    db_session.add_all([multi_user, gc_user, owner_user])
    db_session.flush()

    # Add project members
    pm_member = ProjectMember(organization_id=org.id, project_id=p1.id, user_id=multi_user.id, role="PM")
    cfo_member = ProjectMember(organization_id=org.id, project_id=p2.id, user_id=multi_user.id, role="CFO")
    gc_member = ProjectMember(organization_id=org.id, project_id=p1.id, user_id=gc_user.id, role="GC")
    db_session.add_all([pm_member, cfo_member, gc_member])
    db_session.commit()

    # 1. Test effective role on Project Alpha vs Beta for multi_user
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as client:
        # Sign in multi_user
        signin_resp = await client.post(
            "/api/v1/auth/signin",
            json={"email": multi_user.email, "password": "Password123!"},
        )
        assert signin_resp.status_code == 200

        # investor-updates is Owner only
        # On p1 (where multi_user is PM), should return 403
        resp1 = await client.get(f"/api/v1/projects/{p1.id}/investor-updates")
        assert resp1.status_code == 403

        # On p2 (where multi_user is CFO), should ALSO return 403 (Investor updates is OWNER only!)
        resp2 = await client.get(f"/api/v1/projects/{p2.id}/investor-updates")
        assert resp2.status_code == 403

    # 2. Test Owner access to investor-updates
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as client:
        signin_resp = await client.post(
            "/api/v1/auth/signin",
            json={"email": owner_user.email, "password": "Password123!"},
        )
        assert signin_resp.status_code == 200
        owner_resp = await client.get(f"/api/v1/projects/{p1.id}/investor-updates")
        assert owner_resp.status_code == 200


@pytest.mark.asyncio
async def test_gc_alerts_restriction_and_404_cross_project(db_session):
    # Setup organization and project
    org = Organization(name=f"Org-{uuid.uuid4().hex[:6]}")
    db_session.add(org)
    db_session.flush()

    p = Project(organization_id=org.id, name="Project Delta", project_entity="Delta LLC", address="300 Delta St")
    db_session.add(p)
    db_session.flush()

    gc_user = User(
        organization_id=org.id,
        email=f"gc_{uuid.uuid4().hex[:6]}@example.com",
        hashed_password=hash_password("Password123!"),
        first_name="Gabe",
        last_name="Contractor",
        role="GC",
    )
    owner_user = User(
        organization_id=org.id,
        email=f"own_{uuid.uuid4().hex[:6]}@example.com",
        hashed_password=hash_password("Password123!"),
        first_name="Owen",
        last_name="Owner",
        role="OWNER",
    )
    db_session.add_all([gc_user, owner_user])
    db_session.flush()

    db_session.add(ProjectMember(organization_id=org.id, project_id=p.id, user_id=gc_user.id, role="GC"))
    db_session.commit()

    # GC attempts to access alerts endpoint -> should receive 403
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as client:
        await client.post("/api/v1/auth/signin", json={"email": gc_user.email, "password": "Password123!"})
        gc_alert_resp = await client.get(f"/api/v1/projects/{p.id}/alerts")
        assert gc_alert_resp.status_code == 403

    # Owner accesses alerts -> 200
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as client:
        await client.post("/api/v1/auth/signin", json={"email": owner_user.email, "password": "Password123!"})
        owner_alert_resp = await client.get(f"/api/v1/projects/{p.id}/alerts")
        assert owner_alert_resp.status_code == 200


@pytest.mark.asyncio
async def test_pm_document_type_scoping(db_session):
    org = Organization(name=f"Org-{uuid.uuid4().hex[:6]}")
    db_session.add(org)
    db_session.flush()

    p = Project(organization_id=org.id, name="Project Epsilon", project_entity="Epsilon LLC", address="400 Ep St")
    db_session.add(p)
    db_session.flush()

    pm_user = User(
        organization_id=org.id,
        email=f"pm_{uuid.uuid4().hex[:6]}@example.com",
        hashed_password=hash_password("Password123!"),
        first_name="Paul",
        last_name="Manager",
        role="PM",
    )
    db_session.add(pm_user)
    db_session.flush()
    db_session.add(ProjectMember(organization_id=org.id, project_id=p.id, user_id=pm_user.id, role="PM"))

    # Add 1 evidence document (PERMIT) and 1 financial document (BANK_STATEMENT)
    doc_permit = Document(
        project_id=p.id,
        organization_id=org.id,
        uploaded_by=pm_user.id,
        original_filename="building_permit.pdf",
        document_type="PERMIT",
        storage_key=f"docs/permit_{uuid.uuid4().hex[:6]}.pdf",
        sha256="fakehash1",
        mime_type="application/pdf",
        ingestion_status="READY_FOR_REVIEW",
    )
    doc_finance = Document(
        project_id=p.id,
        organization_id=org.id,
        uploaded_by=pm_user.id,
        original_filename="bank_statement.pdf",
        document_type="BANK_STATEMENT",
        storage_key=f"docs/stmt_{uuid.uuid4().hex[:6]}.pdf",
        sha256="fakehash2",
        mime_type="application/pdf",
        ingestion_status="READY_FOR_REVIEW",
    )
    db_session.add_all([doc_permit, doc_finance])
    db_session.commit()

    # PM lists documents -> only evidence type returned, not BANK_STATEMENT
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as client:
        await client.post("/api/v1/auth/signin", json={"email": pm_user.email, "password": "Password123!"})
        docs_resp = await client.get(f"/api/v1/projects/{p.id}/documents")
        assert docs_resp.status_code == 200
        docs = docs_resp.json()["data"]
        doc_ids = [d["id"] for d in docs]
        assert str(doc_permit.id) in doc_ids
        assert str(doc_finance.id) not in doc_ids

        # PM gets financial document directly -> 404 (out of scope)
        single_resp = await client.get(f"/api/v1/documents/{doc_finance.id}")
        assert single_resp.status_code == 404


@pytest.mark.asyncio
async def test_cross_project_and_organization_isolation(db_session):
    """
    Test that users without project membership or users from another organization
    receive 404 across all project endpoints: dashboard, documents, alerts, tasks, etc.
    """
    # Org 1 with Project 1
    org1 = Organization(name=f"Org1-{uuid.uuid4().hex[:6]}")
    org2 = Organization(name=f"Org2-{uuid.uuid4().hex[:6]}")
    db_session.add_all([org1, org2])
    db_session.flush()

    p1 = Project(organization_id=org1.id, name="P1", project_entity="P1 LLC", address="101 St")
    p2 = Project(organization_id=org2.id, name="P2", project_entity="P2 LLC", address="202 St")
    db_session.add_all([p1, p2])
    db_session.flush()

    user_org1_pm = User(
        organization_id=org1.id,
        email=f"u1_{uuid.uuid4().hex[:6]}@example.com",
        hashed_password=hash_password("Password123!"),
        first_name="User",
        last_name="One",
        role="PM",
    )
    user_org2_pm = User(
        organization_id=org2.id,
        email=f"u2_{uuid.uuid4().hex[:6]}@example.com",
        hashed_password=hash_password("Password123!"),
        first_name="User",
        last_name="Two",
        role="PM",
    )
    db_session.add_all([user_org1_pm, user_org2_pm])
    db_session.flush()

    # User 1 is ONLY member of Project 1
    db_session.add(ProjectMember(organization_id=org1.id, project_id=p1.id, user_id=user_org1_pm.id, role="PM"))
    db_session.commit()

    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as client:
        await client.post("/api/v1/auth/signin", json={"email": user_org1_pm.email, "password": "Password123!"})

        # 1. Accessing p1 works (200)
        p1_resp = await client.get(f"/api/v1/projects/{p1.id}/dashboard")
        assert p1_resp.status_code == 200

        # 2. Accessing p2 (cross-organization) returns 404
        p2_resp = await client.get(f"/api/v1/projects/{p2.id}/dashboard")
        assert p2_resp.status_code == 404

        p2_alerts = await client.get(f"/api/v1/projects/{p2.id}/alerts")
        assert p2_alerts.status_code == 404

        p2_docs = await client.get(f"/api/v1/projects/{p2.id}/documents")
        assert p2_docs.status_code == 404

        p2_tasks = await client.get(f"/api/v1/projects/{p2.id}/onboarding/tasks")
        assert p2_tasks.status_code == 404

