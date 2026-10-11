import uuid

import pytest
from httpx import ASGITransport, AsyncClient

from app.db.models import ProjectMilestone, SpendRecord
from app.db.session import SessionLocal
from app.main import app


@pytest.mark.asyncio
async def test_budget_creation_hierarchy_and_immutable_approval():
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as client:
        # 1. Owner signs up
        owner_email = f"owner_{uuid.uuid4().hex[:6]}@example.com"
        await client.post(
            "/api/v1/auth/signup",
            json={
                "organization_name": "Apex Builders",
                "email": owner_email,
                "password": "Password123!",
                "first_name": "Tony",
                "last_name": "Stark",
            },
        )

        # 2. Create Project
        proj_resp = await client.post(
            "/api/v1/projects",
            json={
                "name": "Apex Luxury Tower",
                "project_entity": "Apex Tower LLC",
                "address": "123 Fifth Ave, NY",
            },
        )
        assert proj_resp.status_code == 200
        proj_id = proj_resp.json()["data"]["id"]

        # 3. Create Draft Budget with hierarchy
        # Parent: 01-HARD-COSTS ($1,000,000)
        # Children: 01-01 Foundation ($600,000), 01-02 Structure ($400,000)
        # Parent: 02-CONTINGENCY ($100,000)
        budget_payload = {
            "lines": [
                {
                    "code": "01-HARD",
                    "name": "Hard Costs",
                    "category": "HARD_COSTS",
                    "original_amount": 100000000,  # $1,000,000 in cents
                    "sort_order": 1,
                },
                {
                    "code": "01-01",
                    "name": "Foundation",
                    "category": "HARD_COSTS",
                    "original_amount": 60000000,  # $600,000 in cents
                    "parent_line_code": "01-HARD",
                    "sort_order": 2,
                },
                {
                    "code": "01-02",
                    "name": "Structure",
                    "category": "HARD_COSTS",
                    "original_amount": 40000000,  # $400,000 in cents
                    "parent_line_code": "01-HARD",
                    "sort_order": 3,
                },
                {
                    "code": "02-CONTINGENCY",
                    "name": "Contingency",
                    "category": "CONTINGENCY",
                    "original_amount": 10000000,  # $100,000 in cents
                    "sort_order": 4,
                },
            ]
        }
        b_create_resp = await client.post(
            f"/api/v1/projects/{proj_id}/budgets", json=budget_payload
        )
        assert b_create_resp.status_code == 200, b_create_resp.text
        b_data = b_create_resp.json()["data"]
        budget_id = b_data["id"]
        assert b_data["status"] == "DRAFT"
        assert b_data["version_number"] == 1
        assert len(b_data["lines"]) == 4

        # 4. Approve baseline budget
        appr_resp = await client.post(f"/api/v1/budgets/{budget_id}/approve")
        assert appr_resp.status_code == 200, appr_resp.text
        assert appr_resp.json()["data"]["status"] == "APPROVED"

        # 5. Verify lines hierarchy
        lines_resp = await client.get(f"/api/v1/budgets/{budget_id}/lines")
        assert lines_resp.status_code == 200
        lines = lines_resp.json()["data"]
        parent_line = next(line for line in lines if line["code"] == "01-HARD")
        child_lines = [line for line in lines if line["parent_line_id"] == parent_line["id"]]
        assert len(child_lines) == 2


@pytest.mark.asyncio
async def test_change_orders_and_immutable_baseline():
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as client:
        # Owner signs up
        owner_email = f"owner_{uuid.uuid4().hex[:6]}@example.com"
        await client.post(
            "/api/v1/auth/signup",
            json={
                "organization_name": "Sterling Builders",
                "email": owner_email,
                "password": "Password123!",
                "first_name": "Bruce",
                "last_name": "Wayne",
            },
        )

        # Create Project
        proj_resp = await client.post(
            "/api/v1/projects",
            json={
                "name": "Wayne Plaza",
                "project_entity": "Wayne Plaza LLC",
                "address": "100 Gotham Way, Gotham",
            },
        )
        proj_id = proj_resp.json()["data"]["id"]

        # Create and approve baseline budget
        budget_payload = {
            "lines": [
                {
                    "code": "01-SITE",
                    "name": "Site Prep",
                    "category": "HARD_COSTS",
                    "original_amount": 50000000,  # $500,000
                    "sort_order": 1,
                },
                {
                    "code": "02-CONT",
                    "name": "Contingency",
                    "category": "CONTINGENCY",
                    "original_amount": 5000000,  # $50,000
                    "sort_order": 2,
                },
            ]
        }
        b_create_resp = await client.post(
            f"/api/v1/projects/{proj_id}/budgets", json=budget_payload
        )
        budget_id = b_create_resp.json()["data"]["id"]
        site_line_id = b_create_resp.json()["data"]["lines"][0]["id"]
        cont_line_id = b_create_resp.json()["data"]["lines"][1]["id"]

        await client.post(f"/api/v1/budgets/{budget_id}/approve")

        # 1. Request Change Order
        co_resp = await client.post(
            f"/api/v1/projects/{proj_id}/change-orders",
            json={
                "title": "Unforeseen Bedrock Excavation",
                "reason": "Encountered bedrock layer requiring hydraulic hammers",
                "lines": [
                    {
                        "budget_line_id": site_line_id,
                        "amount": 2500000,  # +$25,000
                        "description": "Additional hammer rental & rock removal",
                    }
                ],
            },
        )
        assert co_resp.status_code == 200, co_resp.text
        co_data = co_resp.json()["data"]
        co_id = co_data["id"]
        assert co_data["status"] == "SUBMITTED"
        assert co_data["requested_amount"] == 2500000

        # Before approval: Current budget view still shows baseline current_approved_amount
        view_before = await client.get(f"/api/v1/projects/{proj_id}/budgets/current")
        assert view_before.status_code == 200
        line_01 = next(
            bline for bline in view_before.json()["data"]["lines"] if bline["id"] == site_line_id
        )
        assert line_01["original_amount"] == 50000000
        assert line_01["current_approved_amount"] == 50000000  # Not yet approved!

        # 2. Approve Change Order
        appr_co_resp = await client.post(f"/api/v1/change-orders/{co_id}/approve")
        assert appr_co_resp.status_code == 200
        assert appr_co_resp.json()["data"]["status"] == "APPROVED"

        # After approval: current_approved_amount increased, but original_amount is unchanged!
        view_after = await client.get(f"/api/v1/projects/{proj_id}/budgets/current")
        line_01_after = next(
            bline for bline in view_after.json()["data"]["lines"] if bline["id"] == site_line_id
        )
        assert line_01_after["original_amount"] == 50000000  # Baseline strictly preserved!
        assert line_01_after["current_approved_amount"] == 52500000  # $500k + $25k

        # 3. Move Contingency ($10,000 from 02-CONT to 01-SITE)
        move_resp = await client.post(
            f"/api/v1/projects/{proj_id}/contingency-movements",
            json={
                "from_budget_line_id": cont_line_id,
                "to_budget_line_id": site_line_id,
                "amount": 1000000,  # $10,000
                "reason": "Reallocate contingency for site prep permits",
            },
        )
        assert move_resp.status_code == 200, move_resp.text
        assert move_resp.json()["data"]["amount"] == 1000000

        # After contingency movement:
        # Contingency current: $50,000 - $10,000 = $40,000
        # Site prep current: $525,000 + $10,000 = $535,000
        view_after_cm = await client.get(f"/api/v1/projects/{proj_id}/budgets/current")
        site_cm = next(
            bline for bline in view_after_cm.json()["data"]["lines"] if bline["id"] == site_line_id
        )
        cont_cm = next(
            bline for bline in view_after_cm.json()["data"]["lines"] if bline["id"] == cont_line_id
        )
        assert site_cm["current_approved_amount"] == 53500000
        assert cont_cm["current_approved_amount"] == 4000000
        # Baseline original amount is preserved on both lines!
        assert site_cm["original_amount"] == 50000000
        assert cont_cm["original_amount"] == 5000000

        # 4. Contingency movement exceeding available balance fails with 422 CONTINGENCY_EXCEEDED
        fail_move = await client.post(
            f"/api/v1/projects/{proj_id}/contingency-movements",
            json={
                "from_budget_line_id": cont_line_id,
                "to_budget_line_id": site_line_id,
                "amount": 10000000,  # $100,000 > available ($40,000)
                "reason": "Excess movement",
            },
        )
        assert fail_move.status_code == 422
        assert fail_move.json()["error"]["code"] == "CONTINGENCY_EXCEEDED"


@pytest.mark.asyncio
async def test_overrun_detection_and_milestone_linking():
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as client:
        # Owner signs up
        owner_email = f"owner_{uuid.uuid4().hex[:6]}@example.com"
        await client.post(
            "/api/v1/auth/signup",
            json={
                "organization_name": "Centurion Real Estate",
                "email": owner_email,
                "password": "Password123!",
                "first_name": "Diana",
                "last_name": "Prince",
            },
        )

        # Create Project
        proj_resp = await client.post(
            "/api/v1/projects",
            json={
                "name": "Centurion Tower",
                "project_entity": "Centurion LLC",
                "address": "500 Market St, SF",
            },
        )
        proj_id = proj_resp.json()["data"]["id"]

        # Create Budget
        budget_payload = {
            "lines": [
                {
                    "code": "01-FOUNDATION",
                    "name": "Foundation Works",
                    "category": "HARD_COSTS",
                    "original_amount": 10000000,  # $100,000
                    "sort_order": 1,
                }
            ]
        }
        b_create_resp = await client.post(
            f"/api/v1/projects/{proj_id}/budgets", json=budget_payload
        )
        budget_id = b_create_resp.json()["data"]["id"]
        line_id = b_create_resp.json()["data"]["lines"][0]["id"]
        await client.post(f"/api/v1/budgets/{budget_id}/approve")

        # Create a Milestone directly in DB for testing linkage
        db = SessionLocal()
        try:
            ms = ProjectMilestone(
                organization_id=uuid.UUID(b_create_resp.json()["data"]["organization_id"]),
                project_id=uuid.UUID(proj_id),
                name="Foundation Pour Complete",
                code="MS-01",
            )
            db.add(ms)
            db.flush()
            ms_id = str(ms.id)

            # Insert an overrun spend record ($120,000 spend against $100,000 budget)
            spend_date = ms.created_at.date()
            spend = SpendRecord(
                project_id=ms.project_id,
                vendor_party_id=None,
                transaction_date=spend_date,
                amount=12000000,  # $120,000
                currency="USD",
                description="Foundation subcontracts invoice",
                status="VERIFIED",
                evidence_strength="VERIFIED_INVOICE",
                budget_line_id=uuid.UUID(line_id),
            )
            db.add(spend)
            db.commit()
        finally:
            db.close()

        # Link budget line to milestone
        link_resp = await client.patch(
            f"/api/v1/budget-lines/{line_id}/milestone",
            json={"milestone_id": ms_id},
        )
        assert link_resp.status_code == 200
        assert link_resp.json()["data"]["milestone_id"] == ms_id

        # Verify Current budget view detects overrun!
        view_resp = await client.get(f"/api/v1/projects/{proj_id}/budgets/current")
        assert view_resp.status_code == 200
        v_data = view_resp.json()["data"]
        assert v_data["has_overrun"] is True
        line_v = v_data["lines"][0]
        assert line_v["spend_amount"] == 12000000
        assert line_v["current_approved_amount"] == 10000000
        assert line_v["is_overrun"] is True
        assert line_v["remaining_exposure"] == -2000000  # ($20,000 negative remaining exposure)
