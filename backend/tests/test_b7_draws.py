import uuid
from datetime import date

import pytest
from httpx import ASGITransport, AsyncClient

from app.main import app


@pytest.mark.asyncio
async def test_draw_lifecycle_verification_and_decision():
    """
    Test B7 draw creation, lines update, packet, PM/CFO verification,
    submission, partial lender decision with shortfall, and child revision.
    """
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as client:
        # 1. Setup organization, Owner and PM users
        owner_email = f"owner_{uuid.uuid4().hex[:6]}@example.com"
        pm_email = f"pm_{uuid.uuid4().hex[:6]}@example.com"
        cfo_email = f"cfo_{uuid.uuid4().hex[:6]}@example.com"

        owner_signup = await client.post(
            "/api/v1/auth/signup",
            json={
                "organization_name": "Skyline Capital",
                "email": owner_email,
                "password": "Password123!",
                "first_name": "Bruce",
                "last_name": "Wayne",
            },
        )
        assert owner_signup.status_code == 200

        # Create Project
        proj_resp = await client.post(
            "/api/v1/projects",
            json={
                "name": "Skyline Tower",
                "project_entity": "Skyline LLC",
                "address": "100 Gotham Way",
            },
        )
        assert proj_resp.status_code == 200
        proj_id = proj_resp.json()["data"]["id"]

        # Invite PM & CFO
        invite_pm = await client.post(
            "/api/v1/invitations",
            json={
                "email": pm_email,
                "role": "PM",
                "scope": "PROJECT",
            },
        )
        assert invite_pm.status_code == 200
        pm_token = invite_pm.json()["data"]["invitation_url"].split("token=")[1]

        invite_cfo = await client.post(
            "/api/v1/invitations",
            json={
                "email": cfo_email,
                "role": "CFO",
                "scope": "PROJECT",
            },
        )
        assert invite_cfo.status_code == 200
        cfo_token = invite_cfo.json()["data"]["invitation_url"].split("token=")[1]

        # Accept invites
        async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as pm_client:
            p_res = await pm_client.post(
                f"/api/v1/invitations/{pm_token}/accept",
                json={
                    "first_name": "Lucius",
                    "last_name": "Fox",
                    "password": "Password123!",
                },
            )
            assert p_res.status_code == 200

        async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as cfo_client:
            c_res = await cfo_client.post(
                f"/api/v1/invitations/{cfo_token}/accept",
                json={
                    "first_name": "Alfred",
                    "last_name": "Pennyworth",
                    "password": "Password123!",
                },
            )
            assert c_res.status_code == 200

        # 2. Login back as Owner to create budget baseline & loan
        await client.post("/api/v1/auth/signin", json={"email": owner_email, "password": "Password123!"})

        # Create draft budget & budget lines
        budget_payload = {
            "lines": [
                {
                    "code": "03-300",
                    "name": "Cast-in-Place Concrete",
                    "category": "HARD_COSTS",
                    "original_amount": 50000000,
                    "sort_order": 1,
                }
            ]
        }
        b_create_resp = await client.post(
            f"/api/v1/projects/{proj_id}/budgets", json=budget_payload
        )
        assert b_create_resp.status_code == 200, b_create_resp.text
        b_data = b_create_resp.json()["data"]
        budget_id = b_data["id"]
        concrete_line_id = b_data["lines"][0]["id"]

        # Approve baseline
        await client.post(f"/api/v1/budgets/{budget_id}/approve")

        # Create Loan in db via helper session or endpoint if available
        # Since Loan doesn't have dedicated CRUD in onboarding yet, we can insert a loan record directly in DB
        from app.db.models import Loan, Party, generate_uuid, utc_now
        from app.db.session import SessionLocal

        org_id = uuid.UUID(b_data["organization_id"])

        with SessionLocal() as db:
            lender_party = Party(
                id=generate_uuid(),
                organization_id=org_id,
                name="Gotham Commercial Bank",
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
                loan_number="LN-2026-001",
                commitment_amount=200000000,
                status="ACTIVE",
                currency="USD",
                created_at=utc_now(),
            )
            db.add(loan)
            db.commit()
            loan_id = str(loan.id)
            lender_id = str(lender_party.id)

        # 3. Create Draw #1
        draw_resp = await client.post(
            f"/api/v1/projects/{proj_id}/draws",
            json={
                "loan_id": loan_id,
                "draw_number": "1",
                "period_start": "2026-03-01",
                "period_end": "2026-03-31",
                "lender_party_id": lender_id,
                "lines": [
                    {
                        "budget_line_id": concrete_line_id,
                        "requested_amount": 15000000,
                        "reason": "Foundation pouring completed",
                        "evidence_status": "PENDING",
                    }
                ],
            },
        )
        assert draw_resp.status_code == 200, draw_resp.text
        draw_data = draw_resp.json()["data"]
        draw_id = draw_data["id"]
        assert draw_data["status"] == "DRAFT"
        assert len(draw_data["requirements"]) > 0
        assert draw_data["total_requested"] == 15000000

        # Check Draw Packet
        packet_resp = await client.get(f"/api/v1/draws/{draw_id}/packet")
        assert packet_resp.status_code == 200
        packet_data = packet_resp.json()["data"]
        assert packet_data["portal_entry_summary"]["requested_total"] == 15000000
        assert packet_data["total_requested"] == 15000000

        # 4. PM verifies work
        await client.post("/api/v1/auth/signin", json={"email": pm_email, "password": "Password123!"})
        v_work = await client.post(
            f"/api/v1/draws/{draw_id}/verify-work",
            json={
                "progress_notes": "Site inspection confirmed 30% foundation complete",
            },
        )
        assert v_work.status_code == 200

        # 5. CFO verifies cost
        await client.post("/api/v1/auth/signin", json={"email": cfo_email, "password": "Password123!"})
        v_cost = await client.post(
            f"/api/v1/draws/{draw_id}/verify-cost",
            json={
                "cost_notes": "Invoices and lien waivers match $150,000 requested",
                "prior_payment_verified": True,
            },
        )
        assert v_cost.status_code == 200

        # 6. Owner submits draw
        await client.post("/api/v1/auth/signin", json={"email": owner_email, "password": "Password123!"})
        sub_resp = await client.post(f"/api/v1/draws/{draw_id}/mark-submitted")
        assert sub_resp.status_code == 200
        assert sub_resp.json()["data"]["status"] == "SUBMITTED"

        # 7. Record Lender Decision: PARTIALLY_APPROVED ($120,000 approved, $30,000 shortfall)
        decision_resp = await client.post(
            f"/api/v1/draws/{draw_id}/lender-decision",
            json={
                "decision": "PARTIALLY_APPROVED",
                "reason": "Lender withheld $30,000 pending second engineer signoff",
                "line_decisions": [
                    {
                        "budget_line_id": concrete_line_id,
                        "recommended_amount": 15000000,
                        "approved_amount": 12000000,
                        "reason": "Withheld $30,000",
                    }
                ],
            },
        )
        assert decision_resp.status_code == 200
        dec_data = decision_resp.json()["data"]
        assert dec_data["status"] == "PARTIALLY_APPROVED"
        assert dec_data["total_approved"] == 12000000

        # 8. Create Child Revision
        rev_resp = await client.post(
            f"/api/v1/draws/{draw_id}/revisions",
            json={
                "new_draw_number": "1.1",
                "reason": "Draw 1.1 revised to address engineer report requirement",
            },
        )
        assert rev_resp.status_code == 200
        child_draw = rev_resp.json()["data"]
        assert child_draw["parent_draw_id"] == draw_id
        assert child_draw["status"] == "DRAFT"
        assert child_draw["draw_number"] == "1.1"
        assert child_draw["total_requested"] == 15000000


@pytest.mark.asyncio
async def test_draw_funding_allocation_and_threshold():
    """
    Test B7 Funding allocation:
    - Lists unallocated deposits
    - Rejects allocation from uncleared transaction (422 DRAW_NOT_FUNDABLE)
    - Rejects allocation exceeding deposit amount
    - Splits cleared deposit across draws
    - Status transitions to FUNDED only when approved threshold is met
    """
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as client:
        owner_email = f"owner_{uuid.uuid4().hex[:6]}@example.com"
        cfo_email = f"cfo_{uuid.uuid4().hex[:6]}@example.com"

        await client.post(
            "/api/v1/auth/signup",
            json={
                "organization_name": "Summit Properties",
                "email": owner_email,
                "password": "Password123!",
                "first_name": "Diana",
                "last_name": "Prince",
            },
        )

        proj_resp = await client.post(
            "/api/v1/projects",
            json={
                "name": "Summit Plaza",
                "project_entity": "Summit LLC",
                "address": "200 Themyscira Blvd",
            },
        )
        proj_id = proj_resp.json()["data"]["id"]

        # Invite CFO
        invite_cfo = await client.post(
            "/api/v1/invitations",
            json={
                "email": cfo_email,
                "role": "CFO",
                "scope": "PROJECT",
            },
        )
        assert invite_cfo.status_code == 200
        cfo_token = invite_cfo.json()["data"]["invitation_url"].split("token=")[1]
        async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as cfo_client:
            accept_res = await cfo_client.post(
                f"/api/v1/invitations/{cfo_token}/accept",
                json={
                    "first_name": "Etta",
                    "last_name": "Candy",
                    "password": "Password123!",
                },
            )
            assert accept_res.status_code == 200

        # Switch to Owner to setup baseline, loan, financial account & draws
        await client.post("/api/v1/auth/signin", json={"email": owner_email, "password": "Password123!"})

        # Draft & Baseline Budget
        budget_payload = {
            "lines": [
                {
                    "code": "01-100",
                    "name": "General Conditions",
                    "category": "HARD_COSTS",
                    "original_amount": 40000000,
                    "sort_order": 1,
                }
            ]
        }
        b_create_resp = await client.post(
            f"/api/v1/projects/{proj_id}/budgets", json=budget_payload
        )
        assert b_create_resp.status_code == 200, b_create_resp.text
        b_data = b_create_resp.json()["data"]
        budget_id = b_data["id"]
        bline_id = b_data["lines"][0]["id"]

        await client.post(f"/api/v1/budgets/{budget_id}/approve")

        # Financial Account setup
        acc_resp = await client.post(
            "/api/v1/financial-accounts",
            json={
                "institution": "Bank of America",
                "masked_identifier": "*9876",
                "account_purpose": "OPERATING",
                "currency": "USD",
                "active_from": "2026-01-01",
            },
        )
        acc_id = acc_resp.json()["data"]["id"]

        await client.post(
            f"/api/v1/financial-accounts/{acc_id}/approve-mapping",
            json={"project_id": proj_id, "rationale": "Project bank account"},
        )

        # Insert Loan and Transactions directly
        from app.db.models import (
            FinancialTransaction,
            Loan,
            Party,
            generate_uuid,
            utc_now,
        )
        from app.db.session import SessionLocal

        with SessionLocal() as db:
            lender_party = Party(
                id=generate_uuid(),
                organization_id=uuid.UUID(acc_resp.json()["data"]["organization_id"]),
                name="First National Lender",
                party_type="LENDER",
                created_at=utc_now(),
            )
            db.add(lender_party)
            db.flush()

            loan = Loan(
                id=generate_uuid(),
                organization_id=lender_party.organization_id,
                project_id=uuid.UUID(proj_id),
                lender_party_id=lender_party.id,
                loan_number="LN-PLAZA-001",
                commitment_amount=100000000,
                status="ACTIVE",
                currency="USD",
                created_at=utc_now(),
            )
            db.add(loan)

            # Uncleared deposit transaction
            tx_uncleared = FinancialTransaction(
                id=generate_uuid(),
                project_id=uuid.UUID(proj_id),
                financial_account_id=uuid.UUID(acc_id),
                transaction_date=date(2026, 4, 10),
                amount=5000000,
                direction="INFLOW",
                counterparty="First National Lender",
                memo="Loan Draw #1 advance",
                cleared_status="UNCLEARED",
                created_at=utc_now(),
            )
            db.add(tx_uncleared)

            # Cleared deposit transaction of $200,000 (20000000 minor units)
            tx_cleared = FinancialTransaction(
                id=generate_uuid(),
                project_id=uuid.UUID(proj_id),
                financial_account_id=uuid.UUID(acc_id),
                transaction_date=date(2026, 4, 15),
                amount=20000000,
                direction="INFLOW",
                counterparty="First National Lender",
                memo="Loan Draw #1 advance cleared",
                cleared_status="CLEARED",
                created_at=utc_now(),
            )
            db.add(tx_cleared)
            db.commit()

            loan_id = str(loan.id)
            tx_uncleared_id = str(tx_uncleared.id)
            tx_cleared_id = str(tx_cleared.id)

        # Create two draws (Draw #1: $100k, Draw #2: $100k)
        draw1_resp = await client.post(
            f"/api/v1/projects/{proj_id}/draws",
            json={
                "loan_id": loan_id,
                "draw_number": "1",
                "period_start": "2026-04-01",
                "period_end": "2026-04-15",
                "lines": [
                    {
                        "budget_line_id": bline_id,
                        "requested_amount": 10000000,
                        "reason": "Phase 1 works",
                        "evidence_status": "VERIFIED",
                    }
                ],
            },
        )
        assert draw1_resp.status_code == 200, draw1_resp.text
        draw1_id = draw1_resp.json()["data"]["id"]

        draw2_resp = await client.post(
            f"/api/v1/projects/{proj_id}/draws",
            json={
                "loan_id": loan_id,
                "draw_number": "2",
                "period_start": "2026-04-16",
                "period_end": "2026-04-30",
                "lines": [
                    {
                        "budget_line_id": bline_id,
                        "requested_amount": 10000000,
                        "reason": "Phase 2 works",
                        "evidence_status": "VERIFIED",
                    }
                ],
            },
        )
        assert draw2_resp.status_code == 200, draw2_resp.text
        draw2_id = draw2_resp.json()["data"]["id"]

        # Submit and approve both draws
        await client.post(f"/api/v1/draws/{draw1_id}/mark-submitted")
        await client.post(
            f"/api/v1/draws/{draw1_id}/lender-decision",
            json={
                "decision": "APPROVED",
                "line_decisions": [
                    {
                        "budget_line_id": bline_id,
                        "recommended_amount": 10000000,
                        "approved_amount": 10000000,
                    }
                ],
            },
        )

        await client.post(f"/api/v1/draws/{draw2_id}/mark-submitted")
        await client.post(
            f"/api/v1/draws/{draw2_id}/lender-decision",
            json={
                "decision": "APPROVED",
                "line_decisions": [
                    {
                        "budget_line_id": bline_id,
                        "recommended_amount": 10000000,
                        "approved_amount": 10000000,
                    }
                ],
            },
        )

        # 4. CFO checks unallocated funding
        await client.post("/api/v1/auth/signin", json={"email": cfo_email, "password": "Password123!"})

        unalloc_resp = await client.get(f"/api/v1/projects/{proj_id}/funding/unallocated")
        assert unalloc_resp.status_code == 200
        unalloc_list = unalloc_resp.json()["data"]
        # Only the cleared inflow transaction should appear
        tx_ids = [item["transaction_id"] for item in unalloc_list]
        assert tx_cleared_id in tx_ids
        assert tx_uncleared_id not in tx_ids

        # 5. Attempt funding with uncleared transaction -> 422 DRAW_NOT_FUNDABLE
        bad_fund_resp = await client.post(
            f"/api/v1/draws/{draw1_id}/fundings",
            json={
                "allocations": [
                    {
                        "transaction_id": tx_uncleared_id,
                        "amount": 5000000,
                        "funding_date": "2026-04-10",
                    }
                ]
            },
        )
        assert bad_fund_resp.status_code == 422
        assert bad_fund_resp.json()["error"]["code"] == "DRAW_NOT_FUNDABLE"

        # 6. Attempt allocating more than cleared deposit balance -> 422 DRAW_NOT_FUNDABLE
        excess_fund_resp = await client.post(
            f"/api/v1/draws/{draw1_id}/fundings",
            json={
                "allocations": [
                    {
                        "transaction_id": tx_cleared_id,
                        "amount": 25000000,
                        "funding_date": "2026-04-15",
                    }
                ]
            },
        )
        assert excess_fund_resp.status_code == 422
        assert excess_fund_resp.json()["error"]["code"] == "DRAW_NOT_FUNDABLE"

        # 7. Partial funding of Draw #1 ($60,000 out of $100,000)
        partial_fund_resp = await client.post(
            f"/api/v1/draws/{draw1_id}/fundings",
            json={
                "allocations": [
                    {
                        "transaction_id": tx_cleared_id,
                        "amount": 6000000,
                        "funding_date": "2026-04-15",
                    }
                ]
            },
        )
        assert partial_fund_resp.status_code == 200

        # Check Draw #1 is still not fully FUNDED
        draw1_check = await client.get(f"/api/v1/draws/{draw1_id}")
        assert draw1_check.status_code == 200
        assert draw1_check.json()["data"]["status"] == "PARTIALLY_FUNDED"
        assert draw1_check.json()["data"]["total_funded"] == 6000000

        # 8. Complete Draw #1 funding ($40,000 from tx_cleared)
        fund_draw1_complete = await client.post(
            f"/api/v1/draws/{draw1_id}/fundings",
            json={
                "allocations": [
                    {
                        "transaction_id": tx_cleared_id,
                        "amount": 4000000,
                        "funding_date": "2026-04-15",
                    }
                ]
            },
        )
        assert fund_draw1_complete.status_code == 200
        draw1_check_done = await client.get(f"/api/v1/draws/{draw1_id}")
        assert draw1_check_done.json()["data"]["status"] == "FUNDED"
        assert draw1_check_done.json()["data"]["total_funded"] == 10000000

        # 9. Split remaining $100,000 of the same deposit into Draw #2 -> also becomes FUNDED
        fund_draw2_resp = await client.post(
            f"/api/v1/draws/{draw2_id}/fundings",
            json={
                "allocations": [
                    {
                        "transaction_id": tx_cleared_id,
                        "amount": 10000000,
                        "funding_date": "2026-04-15",
                    }
                ]
            },
        )
        assert fund_draw2_resp.status_code == 200
        draw2_check_done = await client.get(f"/api/v1/draws/{draw2_id}")
        assert draw2_check_done.json()["data"]["status"] == "FUNDED"
        assert draw2_check_done.json()["data"]["total_funded"] == 10000000

        # 10. Check that tx_cleared is now fully allocated and no longer appears in unallocated
        unalloc_final = await client.get(f"/api/v1/projects/{proj_id}/funding/unallocated")
        remaining_tx_ids = [item["transaction_id"] for item in unalloc_final.json()["data"]]
        assert tx_cleared_id not in remaining_tx_ids
