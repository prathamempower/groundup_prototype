import uuid
from datetime import date

import pytest
from httpx import ASGITransport, AsyncClient

from app.main import app


@pytest.mark.asyncio
async def test_milestone_lifecycle_and_baseline_protection():
    """
    Test B8 milestone creation, baseline immutability, reason enforcement on forecast moves,
    progress regressions requiring correction reason, and unknown dates reporting as None.
    """
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as client:
        owner_email = f"owner_{uuid.uuid4().hex[:6]}@example.com"
        pm_email = f"pm_{uuid.uuid4().hex[:6]}@example.com"

        # 1. Signup owner
        await client.post(
            "/api/v1/auth/signup",
            json={
                "organization_name": "Horizon Developments",
                "email": owner_email,
                "password": "Password123!",
                "first_name": "Oliver",
                "last_name": "Queen",
            },
        )

        # 2. Create project
        proj_resp = await client.post(
            "/api/v1/projects",
            json={
                "name": "Queen Tower",
                "project_entity": "Queen LLC",
                "address": "100 Star City Plaza",
            },
        )
        proj_id = proj_resp.json()["data"]["id"]

        # 3. Invite PM
        invite_pm = await client.post(
            "/api/v1/invitations",
            json={
                "email": pm_email,
                "role": "PM",
                "scope": "PROJECT",
            },
        )
        pm_token = invite_pm.json()["data"]["invitation_url"].split("token=")[1]
        async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as pm_client:
            await pm_client.post(
                f"/api/v1/invitations/{pm_token}/accept",
                json={
                    "first_name": "Felicity",
                    "last_name": "Smoak",
                    "password": "Password123!",
                },
            )

        # 4. Sign in as PM
        await client.post("/api/v1/auth/signin", json={"email": pm_email, "password": "Password123!"})

        # Create milestone with unknown actual dates
        m_create_resp = await client.post(
            f"/api/v1/projects/{proj_id}/milestones",
            json={
                "name": "Substructure & Foundation",
                "code": "M-01",
                "planned_start_date": "2026-05-01",
                "planned_completion_date": "2026-07-31",
                "progress_percentage": 0.0,
            },
        )
        assert m_create_resp.status_code == 200, m_create_resp.text
        m_data = m_create_resp.json()["data"]
        m_id = m_data["id"]
        assert m_data["status"] == "NOT_STARTED"
        assert m_data["delay_days"] == 0
        # Unknown actual dates reported as None/null, not zero
        assert m_data["actual_start_date"] is None
        assert m_data["actual_completion_date"] is None

        # 5. Attempt moving forecast date without reason -> 400 validation error
        bad_update = await client.patch(
            f"/api/v1/milestones/{m_id}",
            json={
                "forecast_completion_date": "2026-08-31",
            },
        )
        assert bad_update.status_code == 400
        assert bad_update.json()["error"]["code"] == "VALIDATION_FAILED"

        # 6. Moving forecast date with reason succeeds
        good_update = await client.patch(
            f"/api/v1/milestones/{m_id}",
            json={
                "forecast_completion_date": "2026-08-31",
                "forecast_change_reason": "Supply chain delay in steel rebar delivery",
                "delay_cause": "Rebar shortage",
                "progress_percentage": 25.0,
                "actual_start_date": "2026-05-10",
            },
        )
        assert good_update.status_code == 200
        updated_data = good_update.json()["data"]
        # Baseline dates are untouched
        assert updated_data["planned_start_date"] == "2026-05-01"
        assert updated_data["planned_completion_date"] == "2026-07-31"
        assert updated_data["forecast_completion_date"] == "2026-08-31"
        assert updated_data["status"] == "DELAYED"
        assert updated_data["delay_days"] == 31
        assert updated_data["progress_percentage"] == 25.0

        # 7. Regressing progress without regression_reason -> 400 validation error
        regress_bad = await client.patch(
            f"/api/v1/milestones/{m_id}",
            json={
                "progress_percentage": 15.0,
            },
        )
        assert regress_bad.status_code == 400
        assert regress_bad.json()["error"]["code"] == "VALIDATION_FAILED"

        # 8. Regressing progress with regression_reason succeeds
        regress_good = await client.patch(
            f"/api/v1/milestones/{m_id}",
            json={
                "progress_percentage": 20.0,
                "regression_reason": "Rework required on foundation footer section B",
            },
        )
        assert regress_good.status_code == 200
        assert regress_good.json()["data"]["progress_percentage"] == 20.0


@pytest.mark.asyncio
async def test_evidence_verification_conflict_and_carry_impact():
    """
    Test B8 evidence attachment, PM progress verification, conflict flag on inspection discrepancy,
    and schedule forecast carry-cost calculation derived from loan terms.
    """
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as client:
        owner_email = f"owner_{uuid.uuid4().hex[:6]}@example.com"
        pm_email = f"pm_{uuid.uuid4().hex[:6]}@example.com"

        # 1. Signup owner
        await client.post(
            "/api/v1/auth/signup",
            json={
                "organization_name": "Apex Realty Partners",
                "email": owner_email,
                "password": "Password123!",
                "first_name": "Barry",
                "last_name": "Allen",
            },
        )

        proj_resp = await client.post(
            "/api/v1/projects",
            json={
                "name": "Central City Tower",
                "project_entity": "Central City LLC",
                "address": "400 Speed Force Way",
            },
        )
        proj_id = proj_resp.json()["data"]["id"]

        # Invite PM
        invite_pm = await client.post(
            "/api/v1/invitations",
            json={
                "email": pm_email,
                "role": "PM",
                "scope": "PROJECT",
            },
        )
        pm_token = invite_pm.json()["data"]["invitation_url"].split("token=")[1]
        async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as pm_client:
            await pm_client.post(
                f"/api/v1/invitations/{pm_token}/accept",
                json={
                    "first_name": "Iris",
                    "last_name": "West",
                    "password": "Password123!",
                },
            )

        # 2. Insert Loan, LoanTerm, Document, and Inspection in DB
        from app.db.models import (
            Document,
            Inspection,
            Loan,
            LoanTerm,
            Party,
            generate_uuid,
            utc_now,
        )
        from app.db.session import SessionLocal

        with SessionLocal() as db:
            from sqlalchemy import select

            from app.db.models import User
            user_rec = db.scalars(select(User).where(User.email == owner_email)).first()
            assert user_rec is not None
            org_id = user_rec.organization_id

            lender_party = Party(
                id=generate_uuid(),
                organization_id=org_id,
                name="Central Commercial Bank",
                party_type="LENDER",
                created_at=utc_now(),
            )
            db.add(lender_party)
            db.flush()

            loan = Loan(
                id=generate_uuid(),
                organization_id=org_id,
                project_id=uuid.UUID(proj_id),
                lender_party_id=lender_party.id,
                loan_number="LN-CENTRAL-001",
                commitment_amount=1000000000,  # $10,000,000 in cents
                status="ACTIVE",
                currency="USD",
                created_at=utc_now(),
            )
            db.add(loan)
            db.flush()

            loan_term = LoanTerm(
                id=generate_uuid(),
                organization_id=org_id,
                loan_id=loan.id,
                interest_rate=6.0,  # 6% per annum
                interest_method="ACTUAL_360",
                interest_reserve_amount=50000000,
                retainage_percentage=10.0,
                maturity_date=date(2028, 12, 31),
                effective_date=date(2026, 1, 1),
                created_at=utc_now(),
            )
            db.add(loan_term)

            # Document for evidence
            doc_key = f"evidence/photo_{uuid.uuid4().hex[:8]}.jpg"
            doc = Document(
                id=generate_uuid(),
                organization_id=org_id,
                project_id=uuid.UUID(proj_id),
                storage_key=doc_key,
                sha256=uuid.uuid4().hex + uuid.uuid4().hex,
                original_filename="site_photo_phase1.jpg",
                mime_type="image/jpeg",
                document_type="PHOTO",
                source_system="LOCAL_UPLOAD",
                ingestion_status="REVIEWED",
                uploaded_by=user_rec.id,
                uploaded_at=utc_now(),
            )
            db.add(doc)

            # Failed Inspection to trigger conflict flag
            inspection = Inspection(
                id=generate_uuid(),
                organization_id=org_id,
                project_id=uuid.UUID(proj_id),
                inspection_type="MUNICIPAL_STRUCTURAL",
                inspection_date=date(2026, 6, 1),
                inspector_name="City Inspector Vance",
                result="CONDITIONAL",
                notes="Rebar spacing on north wall failed tolerance spec",
                created_at=utc_now(),
            )
            db.add(inspection)
            db.commit()

            doc_id = str(doc.id)

        # 3. PM creates milestone
        await client.post("/api/v1/auth/signin", json={"email": pm_email, "password": "Password123!"})

        m_resp = await client.post(
            f"/api/v1/projects/{proj_id}/milestones",
            json={
                "name": "Superstructure Framing",
                "code": "M-02",
                "planned_start_date": "2026-06-01",
                "planned_completion_date": "2026-08-31",
                "progress_percentage": 0.0,
            },
        )
        m_id = m_resp.json()["data"]["id"]

        # 4. Attach photo evidence
        ev_resp = await client.post(
            f"/api/v1/milestones/{m_id}/evidence",
            json={
                "document_id": doc_id,
                "evidence_type": "PHOTO",
                "description": "Framing inspection photo",
            },
        )
        assert ev_resp.status_code == 200, ev_resp.text
        assert ev_resp.json()["data"]["evidence_type"] == "PHOTO"

        # 5. PM verifies progress at 75% -> triggers conflict flag because inspection was CONDITIONAL
        verify_resp = await client.post(
            f"/api/v1/milestones/{m_id}/verify",
            json={
                "percentage": 75.0,
                "notes": "PM confirms framing is 75% framed",
            },
        )
        assert verify_resp.status_code == 200
        verified_data = verify_resp.json()["data"]
        assert verified_data["progress_percentage"] == 75.0
        assert verified_data["conflict"] is not None
        assert verified_data["conflict"]["has_conflict"] is True

        # 6. PM delays milestone by 30 days
        await client.patch(
            f"/api/v1/milestones/{m_id}",
            json={
                "forecast_completion_date": "2026-09-30",
                "forecast_change_reason": "Structural rebar rework required by inspector",
            },
        )

        # 7. Check schedule forecast and carrying cost calculation
        forecast_resp = await client.get(f"/api/v1/projects/{proj_id}/schedule/forecast")
        assert forecast_resp.status_code == 200
        fc_data = forecast_resp.json()["data"]

        assert fc_data["is_delayed"] is True
        assert fc_data["delay_days"] == 30
        assert fc_data["critical_path_milestone"] == "Superstructure Framing"
        # Commitment = $10,000,000 (1000000000 cents), 6% annual interest
        # Monthly carry = (1,000,000,000 * 0.06) / 12 = 5,000,000 cents ($50,000 / month)
        # 30 days carry = (1,000,000,000 * 0.06 / 365) * 30 = 4,931,507 cents
        assert fc_data["carry_impact_monthly"] == 5000000
        assert fc_data["total_carry_cost_exposure"] > 4000000
        assert fc_data["active_discrepancies_count"] >= 1
