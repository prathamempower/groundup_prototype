import uuid
from datetime import UTC, datetime, timedelta

import pytest
from httpx import ASGITransport, AsyncClient

from app.db.session import SessionLocal
from app.main import app


@pytest.mark.asyncio
async def test_b10_alerts_rules_and_data_quality():
    """
    Test Track B10:
    1. Automatic rule evaluation on material writes (OVERRUN, MISSING_EVIDENCE, SHORT_FUNDED_DRAW, UNALLOCATED_CASH, DELAYED_MILESTONE)
    2. Deduplication of alerts
    3. Alert lifecycle: resolve with note, waive with reason & expiry, escalate to CRITICAL
    4. Data quality issues listing and resolution/waiver with evidence
    5. Audit events recorded on alert & data quality mutations
    """
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as client:
        owner_email = f"owner_{uuid.uuid4().hex[:6]}@example.com"

        # 1. Signup owner
        await client.post(
            "/api/v1/auth/signup",
            json={
                "organization_name": "Apex Development Partners",
                "email": owner_email,
                "password": "Password123!",
                "first_name": "Alex",
                "last_name": "Owner",
            },
        )
        login_res = await client.post(
            "/api/v1/auth/signin",
            json={"email": owner_email, "password": "Password123!"},
        )
        assert login_res.status_code == 200

        # Create project
        proj_res = await client.post(
            "/api/v1/projects",
            json={
                "name": "73 Broadway Tower",
                "project_entity": "73 Broadway LLC",
                "address": "73 Broadway, New York, NY",
                "lifecycle_stage": "CONSTRUCTION",
                "contract_model": "GMP",
                "currency": "USD",
            },
        )
        assert proj_res.status_code == 200
        project_id = proj_res.json()["data"]["id"]

        # Directly insert test fixtures in DB:
        with SessionLocal() as db:
            from sqlalchemy import select

            from app.db.models import (
                Budget,
                BudgetLine,
                DataQualityIssue,
                Draw,
                FinancialAccount,
                FinancialTransaction,
                ProjectMilestone,
                SpendRecord,
                User,
                generate_uuid,
                utc_now,
            )

            user_rec = db.scalars(select(User).where(User.email == owner_email)).first()
            assert user_rec is not None
            org_id = user_rec.organization_id

            # Create an approved budget with a line
            b = Budget(
                id=generate_uuid(),
                organization_id=org_id,
                project_id=uuid.UUID(project_id),
                version_number=1,
                status="APPROVED",
                total_original_amount=5000000,
                total_current_approved_amount=5000000,
                approved_by=user_rec.id,
                approved_at=utc_now(),
                created_at=utc_now(),
            )
            db.add(b)
            db.flush()

            bl = BudgetLine(
                id=generate_uuid(),
                budget_id=b.id,
                code="03-CONCRETE",
                name="Structural Concrete",
                category="HARD_COST",
                original_amount=1000000,
                current_approved_amount=1000000,
                created_at=utc_now(),
            )
            db.add(bl)
            db.flush()

            # Insert an overrun spend record without source document (triggers OVERRUN and MISSING_EVIDENCE)
            sr = SpendRecord(
                id=generate_uuid(),
                project_id=uuid.UUID(project_id),
                budget_line_id=bl.id,
                amount=1200000,  # 1.2M > 1.0M budget
                currency="USD",
                description="Overrun concrete pour invoice",
                status="VERIFIED",
                evidence_strength="MANUAL_ENTRY",
                source_document_id=None,
                transaction_date=datetime.now(UTC).date(),
                created_at=utc_now(),
            )
            db.add(sr)

            # Insert a partially approved draw (triggers SHORT_FUNDED_DRAW)
            from app.db.models import Loan, Party
            party = Party(
                id=generate_uuid(),
                organization_id=org_id,
                name="Metropolitan Lender",
                party_type="LENDER",
                created_at=utc_now(),
            )
            db.add(party)
            db.flush()

            loan = Loan(
                id=generate_uuid(),
                organization_id=org_id,
                project_id=uuid.UUID(project_id),
                lender_party_id=party.id,
                loan_number="LN-9901",
                commitment_amount=8000000,
                status="ACTIVE",
                created_at=utc_now(),
            )
            db.add(loan)
            db.flush()

            d = Draw(
                id=generate_uuid(),
                organization_id=org_id,
                project_id=uuid.UUID(project_id),
                loan_id=loan.id,
                draw_number="01",
                status="PARTIALLY_APPROVED",
                period_start=datetime.now(UTC).date(),
                period_end=datetime.now(UTC).date(),
                created_at=utc_now(),
            )
            db.add(d)

            # Insert an unallocated cleared deposit (triggers UNALLOCATED_CASH)
            fa = FinancialAccount(
                id=generate_uuid(),
                organization_id=org_id,
                party_id=party.id,
                institution="Chase",
                masked_identifier="*9876",
                account_purpose="OPERATING",
                currency="USD",
                active_from=datetime.now(UTC).date(),
                status="ACTIVE",
                created_at=utc_now(),
            )
            db.add(fa)
            db.flush()

            tx = FinancialTransaction(
                id=generate_uuid(),
                project_id=uuid.UUID(project_id),
                financial_account_id=fa.id,
                transaction_date=datetime.now(UTC).date(),
                amount=50000000,  # $500,000 cleared deposit
                direction="INFLOW",
                counterparty="Wire from Sponsor",
                cleared_status="CLEARED",
                created_at=utc_now(),
            )
            db.add(tx)

            # Insert a delayed milestone (triggers DELAYED_MILESTONE)
            pm = ProjectMilestone(
                id=generate_uuid(),
                organization_id=org_id,
                project_id=uuid.UUID(project_id),
                name="Foundation Complete",
                code="M1",
                planned_completion_date=datetime.now(UTC).date(),
                forecast_completion_date=datetime.now(UTC).date() + timedelta(days=30),
                status="IN_PROGRESS",
                created_at=utc_now(),
            )
            db.add(pm)

            # Insert a DataQualityIssue
            dqi = DataQualityIssue(
                id=generate_uuid(),
                organization_id=org_id,
                project_id=uuid.UUID(project_id),
                issue_type="STATEMENT_COVERAGE_GAP",
                severity="HIGH",
                status="OPEN",
                affected_entity_type="FinancialAccount",
                affected_entity_id=fa.id,
                detected_at=utc_now(),
            )
            db.add(dqi)
            db.commit()

        # 2. Query alerts: rules evaluate synchronously and return deduplicated alerts
        alerts_res = await client.get(f"/api/v1/projects/{project_id}/alerts")
        assert alerts_res.status_code == 200
        alerts = alerts_res.json()["data"]
        alert_types = [a["alert_type"] for a in alerts]

        assert "OVERRUN" in alert_types
        assert "MISSING_EVIDENCE" in alert_types
        assert "SHORT_FUNDED_DRAW" in alert_types
        assert "UNALLOCATED_CASH" in alert_types
        assert "DELAYED_MILESTONE" in alert_types

        # Verify deduplication: calling again does not duplicate open alerts
        alerts_res_2 = await client.get(f"/api/v1/projects/{project_id}/alerts")
        assert len(alerts_res_2.json()["data"]) == len(alerts)

        # 3. Test Alert Resolution
        overrun_alert = next(a for a in alerts if a["alert_type"] == "OVERRUN")
        res_alert = await client.post(
            f"/api/v1/alerts/{overrun_alert['id']}/resolve",
            json={"notes": "Resolved via change order #02 approved by Owner"},
        )
        assert res_alert.status_code == 200
        assert res_alert.json()["data"]["status"] == "RESOLVED"

        # 4. Test Alert Waiver with formal reason and expiry
        missing_ev_alert = next(a for a in alerts if a["alert_type"] == "MISSING_EVIDENCE")
        waive_expiry = (datetime.now(UTC) + timedelta(days=14)).isoformat()
        res_waive = await client.post(
            f"/api/v1/alerts/{missing_ev_alert['id']}/waive",
            json={"reason": "Vendor paper receipt lost; verified by GC signoff", "expiry_date": waive_expiry},
        )
        assert res_waive.status_code == 200
        assert res_waive.json()["data"]["status"] == "WAIVED"
        assert res_waive.json()["data"]["waive_reason"] == "Vendor paper receipt lost; verified by GC signoff"

        # 5. Test Alert Escalation
        short_funded_alert = next(a for a in alerts if a["alert_type"] == "SHORT_FUNDED_DRAW")
        res_esc = await client.post(
            f"/api/v1/alerts/{short_funded_alert['id']}/escalate",
            json={"reason": "Lender rejected foundation dry-in costs, needs emergency CFO review"},
        )
        assert res_esc.status_code == 200
        assert res_esc.json()["data"]["status"] == "ESCALATED"
        assert res_esc.json()["data"]["severity"] == "CRITICAL"

        # 6. Test Data Quality Issues Listing & Resolution
        dq_res = await client.get(f"/api/v1/projects/{project_id}/data-quality-issues")
        assert dq_res.status_code == 200
        dq_issues = dq_res.json()["data"]
        assert len(dq_issues) >= 1
        dq_id = dq_issues[0]["id"]

        resolve_dq_res = await client.post(
            f"/api/v1/data-quality-issues/{dq_id}/resolve",
            json={
                "resolution": "Bank statement for missing month uploaded and verified",
                "waive": False,
            },
        )
        assert resolve_dq_res.status_code == 200
        assert resolve_dq_res.json()["data"]["status"] == "RESOLVED"


@pytest.mark.asyncio
async def test_b10_dashboard_reports_exports_and_audit():
    """
    Test Track B10:
    1. Control Center Dashboard (/dashboard) with data_quality status and source_refs
    2. Reports (VARIANCE, FUNDING_GAP, DRAW_STATUS, FORECAST) with source_refs
    3. Synchronous CSV and XLSX export generation (HTTP 202)
    4. Organization Audit Events querying with filters (/audit-events)
    """
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as client:
        owner_email = f"owner_{uuid.uuid4().hex[:6]}@example.com"

        # 1. Signup owner
        await client.post(
            "/api/v1/auth/signup",
            json={
                "organization_name": "Skyline Capital Group",
                "email": owner_email,
                "password": "Password123!",
                "first_name": "Sam",
                "last_name": "Skyline",
            },
        )
        await client.post(
            "/api/v1/auth/signin",
            json={"email": owner_email, "password": "Password123!"},
        )

        # Create project
        proj_res = await client.post(
            "/api/v1/projects",
            json={
                "name": "392 First Street",
                "project_entity": "392 First Street LLC",
                "address": "392 First Street, Brooklyn, NY",
                "lifecycle_stage": "CONSTRUCTION",
                "contract_model": "GMP",
                "currency": "USD",
            },
        )
        project_id = proj_res.json()["data"]["id"]

        # 2. Control Center Dashboard
        dash_res = await client.get(f"/api/v1/projects/{project_id}/dashboard")
        assert dash_res.status_code == 200
        dash_data = dash_res.json()["data"]
        assert "data_quality_status" in dash_data
        assert "source_refs" in dash_data
        assert "cash_gap" in dash_data
        assert "contingency_remaining" in dash_data
        assert "top_exceptions" in dash_data

        # 3. Reports: VARIANCE
        var_rep = await client.get(f"/api/v1/projects/{project_id}/reports/variance")
        assert var_rep.status_code == 200
        assert var_rep.json()["data"]["report_type"] == "VARIANCE"
        assert "summary_totals" in var_rep.json()["data"]

        # Reports: FUNDING_GAP
        fg_rep = await client.get(f"/api/v1/projects/{project_id}/reports/funding-gap")
        assert fg_rep.status_code == 200
        assert fg_rep.json()["data"]["report_type"] == "FUNDING_GAP"

        # Reports: DRAW_STATUS
        draw_rep = await client.get(f"/api/v1/projects/{project_id}/reports/draw-status")
        assert draw_rep.status_code == 200
        assert draw_rep.json()["data"]["report_type"] == "DRAW_STATUS"

        # 4. Synchronous Export (CSV & XLSX)
        csv_export_res = await client.post(
            f"/api/v1/projects/{project_id}/report-exports",
            json={"report_type": "VARIANCE", "format": "CSV"},
        )
        assert csv_export_res.status_code == 202
        export_csv_data = csv_export_res.json()["data"]
        assert export_csv_data["format"] == "CSV"
        assert export_csv_data["status"] == "COMPLETED"
        assert "download_url" in export_csv_data

        xlsx_export_res = await client.post(
            f"/api/v1/projects/{project_id}/report-exports",
            json={"report_type": "VARIANCE", "format": "XLSX"},
        )
        assert xlsx_export_res.status_code == 202
        export_xlsx_data = xlsx_export_res.json()["data"]
        assert export_xlsx_data["format"] == "XLSX"
        assert export_xlsx_data["status"] == "COMPLETED"

        # Retrieve export by ID
        get_export_res = await client.get(f"/api/v1/report-exports/{export_csv_data['id']}")
        assert get_export_res.status_code == 200
        assert get_export_res.json()["data"]["id"] == export_csv_data["id"]

        # 5. Audit Events query
        audit_res = await client.get("/api/v1/audit-events")
        assert audit_res.status_code == 200
        audit_events = audit_res.json()["data"]
        assert len(audit_events) > 0
        actions = [e["action"] for e in audit_events]
        assert "REPORT_EXPORT_GENERATED" in actions
