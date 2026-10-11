import uuid

import pytest
from httpx import ASGITransport, AsyncClient

from app.main import app


@pytest.mark.asyncio
async def test_economics_pro_forma_contributions_and_distributions():
    """
    Test B9 Pro Forma plan versioning, economics basis calculation,
    dated contributions and distributions, and IRR status (NOT_MEANINGFUL when missing dated cash flows,
    VERIFIED when dated flows exist).
    """
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as client:
        owner_email = f"owner_{uuid.uuid4().hex[:6]}@example.com"

        # 1. Signup owner
        await client.post(
            "/api/v1/auth/signup",
            json={
                "organization_name": "Metropolis Real Estate",
                "email": owner_email,
                "password": "Password123!",
                "first_name": "Lex",
                "last_name": "Luthor",
            },
        )

        # 2. Create project
        proj_resp = await client.post(
            "/api/v1/projects",
            json={
                "name": "LexCorp Tower",
                "project_entity": "LexCorp LLC",
                "address": "1 Metropolis Way",
            },
        )
        proj_id = proj_resp.json()["data"]["id"]

        # 3. Check initial economics: missing inputs, IRR returns NOT_MEANINGFUL
        econ_initial = await client.get(f"/api/v1/projects/{proj_id}/economics")
        assert econ_initial.status_code == 200
        econ_data = econ_initial.json()["data"]
        assert not econ_data["is_forecast_complete"]
        assert len(econ_data["missing_input_reasons"]) > 0
        assert econ_data["irr_status"] == "NOT_MEANINGFUL"

        # 4. Create Financial Plan Pro Forma version 1
        plan_resp = await client.post(
            f"/api/v1/projects/{proj_id}/financial-plans",
            json={
                "plan_type": "ORIGINAL",
                "projected_revenue": 5000000000,  # $50M in cents
                "projected_cost": 3800000000,  # $38M in cents
                "target_irr": 18.5,
                "target_equity_multiple": 1.75,
                "pro_forma_lines": [
                    {
                        "category": "REVENUE",
                        "line_name": "Condominium Sales",
                        "original_plan_amount": 5000000000,
                        "current_forecast_amount": 5000000000,
                        "basis": "ESTIMATED",
                    },
                    {
                        "category": "HARD_COST",
                        "line_name": "Direct Construction",
                        "original_plan_amount": 3000000000,
                        "current_forecast_amount": 3000000000,
                        "basis": "ESTIMATED",
                    },
                ],
            },
        )
        assert plan_resp.status_code == 200, plan_resp.text
        plan_data = plan_resp.json()["data"]
        assert plan_data["version_number"] == 1
        assert plan_data["is_active"] is True

        # 5. Insert Investor Party
        from app.db.models import Party, generate_uuid, utc_now
        from app.db.session import SessionLocal

        with SessionLocal() as db:
            from sqlalchemy import select

            from app.db.models import User
            user_rec = db.scalars(select(User).where(User.email == owner_email)).first()
            assert user_rec is not None
            org_id = user_rec.organization_id

            investor_party = Party(
                id=generate_uuid(),
                organization_id=org_id,
                name="Vanguard Equity Fund",
                party_type="INVESTOR",
                created_at=utc_now(),
            )
            db.add(investor_party)
            db.commit()
            inv_party_id = str(investor_party.id)

        # 6. Record Investor Contribution ($10M in cents)
        contrib_resp = await client.post(
            f"/api/v1/projects/{proj_id}/investors/contributions",
            json={
                "investor_party_id": inv_party_id,
                "amount": 1000000000,
                "received_date": "2026-01-15",
                "notes": "Initial capital call wire",
            },
        )
        assert contrib_resp.status_code == 200, contrib_resp.text
        contrib_data = contrib_resp.json()["data"]
        p_inv_id = contrib_data["project_investor_id"]

        # List contributions
        clist_resp = await client.get(f"/api/v1/projects/{proj_id}/investors/contributions")
        assert clist_resp.status_code == 200
        assert len(clist_resp.json()["data"]) == 1

        # 7. Record Investor Distribution ($15M in cents)
        distrib_resp = await client.post(
            f"/api/v1/projects/{proj_id}/investors/distributions",
            json={
                "project_investor_id": p_inv_id,
                "amount": 1500000000,
                "distribution_date": "2028-12-15",
                "distribution_type": "PROFIT",
            },
        )
        assert distrib_resp.status_code == 200, distrib_resp.text

        # List distributions
        dlist_resp = await client.get(f"/api/v1/projects/{proj_id}/investors/distributions")
        assert dlist_resp.status_code == 200
        assert len(dlist_resp.json()["data"]) == 1

        # 8. Check economics: Now with dated cash flows, IRR is calculated & VERIFIED
        econ_after = await client.get(f"/api/v1/projects/{proj_id}/economics")
        assert econ_after.status_code == 200
        econ_final = econ_after.json()["data"]
        assert econ_final["sponsor_equity_invested"] == 1000000000
        assert econ_final["total_distributions"] == 1500000000
        assert econ_final["irr_status"] == "VERIFIED"
        assert econ_final["irr_pct"] == 50.0  # (15M - 10M) / 10M * 100


@pytest.mark.asyncio
async def test_disposition_closeout_adjustments_and_investor_sharing():
    """
    Test B9 Disposition import, Closeout approval (blocking unresolved items unless exception granted),
    Post-closeout adjustments on CLOSED projects, and Investor sharing snapshot workflow
    (draft -> edit -> publish immutable snapshot -> withdraw).
    """
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as client:
        owner_email = f"owner_{uuid.uuid4().hex[:6]}@example.com"
        inv_email = f"inv_{uuid.uuid4().hex[:6]}@example.com"

        # 1. Signup Owner
        await client.post(
            "/api/v1/auth/signup",
            json={
                "organization_name": "Gotham Equity",
                "email": owner_email,
                "password": "Password123!",
                "first_name": "Bruce",
                "last_name": "Wayne",
            },
        )

        proj_resp = await client.post(
            "/api/v1/projects",
            json={
                "name": "Wayne Manor Condos",
                "project_entity": "Wayne Manor LLC",
                "address": "100 Mountain Drive",
            },
        )
        proj_id = proj_resp.json()["data"]["id"]

        # Invite Investor
        invite_inv = await client.post(
            "/api/v1/invitations",
            json={
                "email": inv_email,
                "role": "INVESTOR",
                "scope": "PROJECT",
            },
        )
        inv_token = invite_inv.json()["data"]["invitation_url"].split("token=")[1]
        async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as inv_client:
            await inv_client.post(
                f"/api/v1/invitations/{inv_token}/accept",
                json={
                    "first_name": "Selina",
                    "last_name": "Kyle",
                    "password": "Password123!",
                },
            )

        # 2. Import Disposition (sale proceeds $20,000,000, settlement costs $500,000, net proceeds $19,500,000)
        disp_resp = await client.post(
            f"/api/v1/projects/{proj_id}/disposition/import",
            json={
                "sale_price": 2000000000,
                "closing_date": "2026-10-01",
                "settlement_costs": 50000000,
                "net_proceeds": 1950000000,
                "notes": "Bulk asset disposition closing",
            },
        )
        assert disp_resp.status_code == 202
        assert disp_resp.json()["data"]["net_proceeds"] == 1950000000

        # 3. Create open Alert in DB to test closeout blocking
        from app.db.models import Alert, generate_uuid, utc_now
        from app.db.session import SessionLocal

        with SessionLocal() as db:
            from sqlalchemy import select

            from app.db.models import User
            user_rec = db.scalars(select(User).where(User.email == owner_email)).first()
            assert user_rec is not None
            org_id = user_rec.organization_id

            alert = Alert(
                id=generate_uuid(),
                organization_id=org_id,
                project_id=uuid.UUID(proj_id),
                alert_type="OVERRUN",
                severity="HIGH",
                title="Open trade dispute",
                description="Trade dispute unresolved",
                status="OPEN",
                created_at=utc_now(),
            )
            db.add(alert)
            db.commit()

        # 4. Attempt closeout without exception -> 400 validation error
        close_blocked = await client.post(
            f"/api/v1/projects/{proj_id}/closeout/approve",
            json={"grant_exception": False},
        )
        assert close_blocked.status_code == 400
        assert close_blocked.json()["error"]["code"] == "VALIDATION_FAILED"

        # 5. Closeout with explicit exception succeeds
        close_ok = await client.post(
            f"/api/v1/projects/{proj_id}/closeout/approve",
            json={
                "grant_exception": True,
                "exception_reason": "Escrow reserve held with title company covering trade dispute",
            },
        )
        assert close_ok.status_code == 200
        assert close_ok.json()["data"]["status"] == "CLOSED"

        # 6. Post-closeout adjustment on CLOSED project
        adj_resp = await client.post(
            f"/api/v1/projects/{proj_id}/post-closeout-adjustments",
            json={
                "category": "WARRANTY_COST",
                "amount": 2500000,  # $25,000 warranty repair
                "description": "Roof warranty remediation post-close",
                "adjustment_date": "2026-10-10",
            },
        )
        assert adj_resp.status_code == 200
        assert adj_resp.json()["data"]["amount"] == 2500000

        # 7. Create Investor Update Draft
        draft_resp = await client.post(
            f"/api/v1/projects/{proj_id}/investor-updates",
            json={
                "title": "Q3 2026 Asset Disposition & Distribution Brief",
                "progress_summary": "Asset sold successfully, capital returned to investors.",
                "material_disclosures": ["Post-closing warranty reserve held in escrow"],
                "recipients": ["Selina Kyle"],
            },
        )
        assert draft_resp.status_code == 200
        update_id = draft_resp.json()["data"]["id"]
        assert draft_resp.json()["data"]["status"] == "DRAFT"

        # 8. Edit draft
        edit_resp = await client.patch(
            f"/api/v1/investor-updates/{update_id}",
            json={
                "title": "Q3 2026 Asset Disposition & Final Returns Brief",
            },
        )
        assert edit_resp.status_code == 200
        assert edit_resp.json()["data"]["title"] == "Q3 2026 Asset Disposition & Final Returns Brief"

        # 9. Attempt publish without acknowledging material warning on incomplete forecast -> fails
        bad_pub = await client.post(
            f"/api/v1/investor-updates/{update_id}/publish",
            json={"material_warnings_acknowledged": False},
        )
        assert bad_pub.status_code == 400

        # 10. Publish with acknowledged warning -> succeeds
        pub_ok = await client.post(
            f"/api/v1/investor-updates/{update_id}/publish",
            json={"material_warnings_acknowledged": True},
        )
        assert pub_ok.status_code == 200
        assert pub_ok.json()["data"]["status"] == "PUBLISHED"

        # 11. Investor signs in and reads snapshot (never sees raw bills or internal exception data)
        await client.post("/api/v1/auth/signin", json={"email": inv_email, "password": "Password123!"})
        inv_snap = await client.get(f"/api/v1/investor/updates/{update_id}")
        assert inv_snap.status_code == 200
        snap_data = inv_snap.json()["data"]
        assert snap_data["status"] == "PUBLISHED"
        assert snap_data["title"] == "Q3 2026 Asset Disposition & Final Returns Brief"
        # Verify no vendor, bank or internal transaction keys are leaked
        assert "bank_account" not in snap_data
        assert "vendor_party" not in snap_data

        # 12. Owner withdraws update
        await client.post("/api/v1/auth/signin", json={"email": owner_email, "password": "Password123!"})
        withdrawn_resp = await client.post(
            f"/api/v1/investor-updates/{update_id}/withdraw",
            json={"reason": "Updated audited returns replacing previous preliminary draft"},
        )
        assert withdrawn_resp.status_code == 200
        assert withdrawn_resp.json()["data"]["status"] == "WITHDRAWN"

        # 13. Investor attempting to read withdrawn update -> 404
        await client.post("/api/v1/auth/signin", json={"email": inv_email, "password": "Password123!"})
        inv_blocked = await client.get(f"/api/v1/investor/updates/{update_id}")
        assert inv_blocked.status_code == 404
