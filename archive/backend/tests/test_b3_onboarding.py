import uuid

import pytest
from httpx import ASGITransport, AsyncClient

from app.db.models import ConfigurationVersion
from app.db.session import SessionLocal
from app.main import app


@pytest.mark.asyncio
async def test_project_crud_and_readiness_gates():
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as client:
        # Sign up owner
        owner_email = f"owner_{uuid.uuid4().hex[:6]}@example.com"
        await client.post(
            "/api/v1/auth/signup",
            json={
                "organization_name": "Empire Construction",
                "email": owner_email,
                "password": "Password123!",
                "first_name": "Tony",
                "last_name": "Stark",
            },
        )

        # Create Project
        proj_payload = {
            "name": "Stark Tower Renovation",
            "project_entity": "Stark Real Estate LLC",
            "address": "200 Park Avenue, NY",
            "lifecycle_stage": "CONSTRUCTION",
            "contract_model": "GMP",
            "currency": "USD",
        }
        proj_resp = await client.post("/api/v1/projects", json=proj_payload)
        assert proj_resp.status_code == 200, proj_resp.text
        proj_data = proj_resp.json()["data"]
        project_id = proj_data["id"]
        assert proj_data["name"] == "Stark Tower Renovation"
        assert proj_data["contract_model"] == "GMP"

        # List projects
        list_resp = await client.get("/api/v1/projects")
        assert list_resp.status_code == 200
        assert len(list_resp.json()["data"]) >= 1

        # Check Readiness Gates
        readiness_resp = await client.get(f"/api/v1/projects/{project_id}/readiness")
        assert readiness_resp.status_code == 200
        readiness_data = readiness_resp.json()["data"]
        assert readiness_data["project_id"] == project_id
        # Initially blocked by initial financial account and milestone schedule tasks
        assert readiness_data["overall_status"] == "BLOCKED"
        gate_names = [g["gate_name"] for g in readiness_data["gates"]]
        assert "VERIFIED_DASHBOARD" in gate_names
        assert "SUBMISSION_READY_DRAW" in gate_names

        # Check Delegated Tasks
        tasks_resp = await client.get(f"/api/v1/projects/{project_id}/onboarding/tasks")
        assert tasks_resp.status_code == 200
        tasks = tasks_resp.json()["data"]
        task_types = [t["task_type"] for t in tasks]
        assert "CONFIGURE_FINANCIAL_ACCOUNTS" in task_types
        assert "ESTABLISH_MILESTONE_SCHEDULE" in task_types

        # Update Project identity fields
        patch_resp = await client.patch(
            f"/api/v1/projects/{project_id}",
            json={
                "lifecycle_stage": "COMPLETION",
            },
        )
        assert patch_resp.status_code == 200
        assert patch_resp.json()["data"]["lifecycle_stage"] == "COMPLETION"
        assert patch_resp.json()["data"]["version"] == 2


@pytest.mark.asyncio
async def test_adaptive_question_graph_and_config_approval():
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as client:
        # Owner signup
        owner_email = f"owner_{uuid.uuid4().hex[:6]}@example.com"
        await client.post(
            "/api/v1/auth/signup",
            json={
                "organization_name": "Apex Builders",
                "email": owner_email,
                "password": "Password123!",
                "first_name": "Peter",
                "last_name": "Parker",
            },
        )

        # Create project
        proj_resp = await client.post(
            "/api/v1/projects",
            json={
                "name": "Queens Tower",
                "project_entity": "Queens LLC",
                "address": " Queens Blvd, NY",
            },
        )
        project_id = proj_resp.json()["data"]["id"]

        # Get current onboarding session
        session_resp = await client.get(
            f"/api/v1/onboarding/sessions/current?project_id={project_id}"
        )
        assert session_resp.status_code == 200
        sess_data = session_resp.json()["data"]
        session_id = sess_data["id"]
        # Owner's first question must be OWNER_PROPERTY_ACQUIRED
        assert sess_data["next_question"] is not None
        assert sess_data["next_question"]["question_key"] == "OWNER_PROPERTY_ACQUIRED"

        # Attempting to submit wrong question out of order fails with 400
        wrong_q_resp = await client.post(
            f"/api/v1/onboarding/sessions/{session_id}/answers",
            json={
                "question_key": "OWNER_CONTRACT_MODEL",
                "answer_payload": {"value": "GMP"},
            },
        )
        assert wrong_q_resp.status_code == 400
        assert wrong_q_resp.json()["error"]["code"] == "VALIDATION_FAILED"

        # Submit first valid answer
        ans1_resp = await client.post(
            f"/api/v1/onboarding/sessions/{session_id}/answers",
            json={
                "question_key": "OWNER_PROPERTY_ACQUIRED",
                "answer_payload": {"value": "true"},
            },
        )
        assert ans1_resp.status_code == 200
        assert ans1_resp.json()["data"]["question_key"] == "OWNER_PROPERTY_ACQUIRED"

        # Query session again - next question must be OWNER_ACQUISITION_FUNDING (high-risk)
        session2_resp = await client.get(
            f"/api/v1/onboarding/sessions/current?project_id={project_id}"
        )
        assert session2_resp.status_code == 200
        assert (
            session2_resp.json()["data"]["next_question"]["question_key"]
            == "OWNER_ACQUISITION_FUNDING"
        )

        # Submit answer for OWNER_ACQUISITION_FUNDING
        ans2_resp = await client.post(
            f"/api/v1/onboarding/sessions/{session_id}/answers",
            json={
                "question_key": "OWNER_ACQUISITION_FUNDING",
                "answer_payload": {"value": "ACQUISITION_LOAN"},
            },
        )
        assert ans2_resp.status_code == 200

        # High-risk answer generates a ConfigurationVersion
        from sqlalchemy import select

        db = SessionLocal()
        try:
            config = db.scalars(
                select(ConfigurationVersion).where(
                    ConfigurationVersion.project_id == uuid.UUID(project_id)
                )
            ).first()
            assert config is not None
            config_id = str(config.id)
        finally:
            db.close()

        # Owner approves high-risk configuration version
        approve_resp = await client.post(f"/api/v1/configuration-versions/{config_id}/approve")
        assert approve_resp.status_code == 200
        assert approve_resp.json()["data"]["approved_by"] is not None

        # Next question dynamically branches to OWNER_ACQUISITION_LOAN_TERMS because funding was ACQUISITION_LOAN
        session3_resp = await client.get(
            f"/api/v1/onboarding/sessions/current?project_id={project_id}"
        )
        assert session3_resp.status_code == 200
        assert (
            session3_resp.json()["data"]["next_question"]["question_key"]
            == "OWNER_ACQUISITION_LOAN_TERMS"
        )


@pytest.mark.asyncio
async def test_duplicate_check_and_special_unknown_answers():
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as client:
        owner_email = f"owner_{uuid.uuid4().hex[:6]}@example.com"
        await client.post(
            "/api/v1/auth/signup",
            json={
                "organization_name": "Skyline Holdings",
                "email": owner_email,
                "password": "Password123!",
                "first_name": "Clark",
                "last_name": "Kent",
            },
        )

        # 1. Create a base project
        await client.post(
            "/api/v1/projects",
            json={
                "name": "Metropolis Tower",
                "project_entity": "Metropolis Partners LLC",
                "address": "100 Daily Planet Way, Metropolis",
            },
        )

        # 2. Check duplicates with matching address
        dup_resp = await client.post(
            "/api/v1/projects/check-duplicates",
            json={
                "name": "Daily Planet Suites",
                "address": "100 Daily Planet Way",
            },
        )
        assert dup_resp.status_code == 200
        dup_data = dup_resp.json()["data"]
        assert dup_data["has_matches"] is True
        assert len(dup_data["matches"]) >= 1
        assert "Matching address" in dup_data["matches"][0]["similarity_reason"]

        # 3. Create project with UNKNOWN answer and verify follow-up task creation
        proj_resp2 = await client.post(
            "/api/v1/projects",
            json={
                "name": "Smallville Grain Facility",
                "project_entity": "Smallville Ag LLC",
                "address": "400 Rural Route 3",
            },
        )
        p2_id = proj_resp2.json()["data"]["id"]

        sess_resp = await client.get(f"/api/v1/onboarding/sessions/current?project_id={p2_id}")
        s2_id = sess_resp.json()["data"]["id"]

        # Submit UNKNOWN answer with reason
        ans_resp = await client.post(
            f"/api/v1/onboarding/sessions/{s2_id}/answers",
            json={
                "question_key": "OWNER_PROPERTY_ACQUIRED",
                "answer_payload": {
                    "special": "UNKNOWN",
                    "reason": "Deed transfer pending probate court sign-off",
                },
            },
        )
        assert ans_resp.status_code == 200

        # Verify OnboardingTask was generated for follow-up
        tasks_resp = await client.get(f"/api/v1/projects/{p2_id}/onboarding/tasks")
        assert tasks_resp.status_code == 200
        tasks = tasks_resp.json()["data"]
        task_types = [t["task_type"] for t in tasks]
        assert "RESOLVE_ANSWER_OWNER_PROPERTY_ACQUIRED" in task_types

        # 4. Submit OTHER answer with other_specification on target closing timeline
        ans_other_resp = await client.post(
            f"/api/v1/onboarding/sessions/{s2_id}/answers",
            json={
                "question_key": "OWNER_TARGET_CLOSING_TIMELINE",
                "answer_payload": {
                    "value": "OTHER",
                    "other_specification": "Contingent on 1031 exchange closing on adjacent parcel",
                },
            },
        )
        assert ans_other_resp.status_code == 200
        ans_data = ans_other_resp.json()["data"]
        assert ans_data["answer_payload"]["value"] == "OTHER"
        assert ans_data["answer_payload"]["other_specification"] == "Contingent on 1031 exchange closing on adjacent parcel"
