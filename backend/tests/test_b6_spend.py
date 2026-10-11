import uuid

import pytest
from httpx import ASGITransport, AsyncClient

from app.main import app


@pytest.mark.asyncio
async def test_financial_accounts_statement_periods_and_signoff():
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as client:
        # 1. Owner signup
        owner_email = f"owner_{uuid.uuid4().hex[:6]}@example.com"
        await client.post(
            "/api/v1/auth/signup",
            json={
                "organization_name": "Parkview Holdings",
                "email": owner_email,
                "password": "Password123!",
                "first_name": "Clark",
                "last_name": "Kent",
            },
        )

        # 2. Register Financial Account (*4432)
        acc_resp = await client.post(
            "/api/v1/financial-accounts",
            json={
                "institution": "JPMorgan Chase",
                "masked_identifier": "*4432",
                "account_purpose": "OPERATING",
                "currency": "USD",
                "active_from": "2026-01-01",
            },
        )
        assert acc_resp.status_code == 200, acc_resp.text
        acc_data = acc_resp.json()["data"]
        acc_id = acc_data["id"]
        assert acc_data["masked_identifier"] == "*4432"

        # 3. Create Project
        proj_resp = await client.post(
            "/api/v1/projects",
            json={
                "name": "Parkview Tower",
                "project_entity": "Parkview LLC",
                "address": "400 Park Ave, NY",
            },
        )
        proj_id = proj_resp.json()["data"]["id"]

        # 4. Approve Account Mapping to Project
        map_resp = await client.post(
            f"/api/v1/financial-accounts/{acc_id}/approve-mapping",
            json={"project_id": proj_id, "rationale": "Primary operating account for Parkview"},
        )
        assert map_resp.status_code == 200
        assert map_resp.json()["data"]["status"] == "MAPPED_APPROVED"

        # 5. Create Statement Period (Opening: $100,000, Closing: $100,000, no txs -> balances)
        period_resp = await client.post(
            f"/api/v1/financial-accounts/{acc_id}/statement-periods",
            json={
                "period_start": "2026-01-01",
                "period_end": "2026-01-31",
                "opening_balance": 10000000,
                "closing_balance": 10000000,
            },
        )
        assert period_resp.status_code == 200, period_resp.text
        period_data = period_resp.json()["data"]
        period_id = period_data["id"]
        assert period_data["coverage_status"] == "ACTIVE"

        # 6. Sign off period cleanly
        signoff_resp = await client.post(
            f"/api/v1/statement-periods/{period_id}/signoff",
            json={},
        )
        assert signoff_resp.status_code == 200, signoff_resp.text
        assert signoff_resp.json()["data"]["coverage_status"] == "RECONCILED"

        # 7. Create second period with a gap (starts 2026-02-15 instead of 2026-02-01)
        gap_period_resp = await client.post(
            f"/api/v1/financial-accounts/{acc_id}/statement-periods",
            json={
                "period_start": "2026-02-15",
                "period_end": "2026-02-28",
                "opening_balance": 10000000,
                "closing_balance": 10000000,
            },
        )
        assert gap_period_resp.status_code == 200
        gap_p_id = gap_period_resp.json()["data"]["id"]
        assert gap_period_resp.json()["data"]["coverage_status"] == "GAP"

        # Attempt to sign off period with gap without waiver -> 422 COVERAGE_GAP
        fail_signoff = await client.post(
            f"/api/v1/statement-periods/{gap_p_id}/signoff",
            json={},
        )
        assert fail_signoff.status_code == 422
        assert fail_signoff.json()["error"]["code"] == "COVERAGE_GAP"

        # Sign off with waiver reason succeeds
        waiver_signoff = await client.post(
            f"/api/v1/statement-periods/{gap_p_id}/signoff",
            json={
                "waiver_reason": "Account was dormant Feb 1 to Feb 14; certified by bank statement"
            },
        )
        assert waiver_signoff.status_code == 200
        assert waiver_signoff.json()["data"]["coverage_status"] == "RECONCILED"


@pytest.mark.asyncio
async def test_csv_import_batches_source_lineage_and_reconciliation():
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as client:
        # Owner signup
        owner_email = f"owner_{uuid.uuid4().hex[:6]}@example.com"
        await client.post(
            "/api/v1/auth/signup",
            json={
                "organization_name": "Vanguard Builders",
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
                "name": "Vanguard Tower",
                "project_entity": "Vanguard LLC",
                "address": "600 Broadway, NY",
            },
        )
        proj_id = proj_resp.json()["data"]["id"]

        # Register financial account
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

        # 1. Import CSV transactions batch with lineage
        csv_data = (
            "Date,Amount,Description,ExternalId,Direction\n"
            "2026-03-01,15000.00,Acme Concrete Foundation,TXN_001,OUTFLOW\n"
            "2026-03-02,5000.00,Steel Supplies Inc,TXN_002,OUTFLOW\n"
            "2026-03-05,20000.00,American Express Credit Card Payment,TXN_003,OUTFLOW\n"
        )
        # Expected total: $40,000 (4000000 cents)
        import_resp = await client.post(
            f"/api/v1/projects/{proj_id}/import-batches",
            json={
                "adapter": "CSV",
                "raw_content": csv_data,
                "financial_account_id": acc_id,
                "control_total": 4000000,
            },
        )
        assert import_resp.status_code == 202, import_resp.text
        batch_id = import_resp.json()["data"]["id"]
        assert import_resp.json()["data"]["accepted_rows"] == 3

        # 2. Verify source records with lineage exist
        src_resp = await client.get(f"/api/v1/import-batches/{batch_id}/source-records")
        assert src_resp.status_code == 200
        sources = src_resp.json()["data"]
        assert len(sources) == 3
        assert sources[0]["source_kind"] == "CSV_ROW"
        assert sources[0]["raw_payload"]["Description"] == "Acme Concrete Foundation"

        # 3. Check reconciliation queue
        rec_resp = await client.get(f"/api/v1/projects/{proj_id}/reconciliation/queue")
        assert rec_resp.status_code == 200
        matches = rec_resp.json()["data"]
        assert len(matches) == 3
        match_id = matches[0]["id"]
        assert matches[0]["spend_record_id"] is not None

        # 4. Accept reconciliation match
        dec_resp = await client.post(
            f"/api/v1/reconciliation-matches/{match_id}/decision",
            json={"decision": "ACCEPT", "notes": "Verified against invoice #104"},
        )
        assert dec_resp.status_code == 200
        assert dec_resp.json()["data"]["decision"] == "ACCEPTED"


@pytest.mark.asyncio
async def test_spend_allocations_reversals_and_transfers():
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as client:
        # Owner signup
        owner_email = f"owner_{uuid.uuid4().hex[:6]}@example.com"
        await client.post(
            "/api/v1/auth/signup",
            json={
                "organization_name": "Titan Properties",
                "email": owner_email,
                "password": "Password123!",
                "first_name": "Arthur",
                "last_name": "Curry",
            },
        )

        # Create Project 1 (73 Broadway) & Project 2 (392 First)
        p1_resp = await client.post(
            "/api/v1/projects",
            json={
                "name": "73 Broadway",
                "project_entity": "73 Broadway LLC",
                "address": "73 Broadway, NY",
            },
        )
        p1_id = p1_resp.json()["data"]["id"]

        p2_resp = await client.post(
            "/api/v1/projects",
            json={
                "name": "392 First Street",
                "project_entity": "392 First LLC",
                "address": "392 First St, NY",
            },
        )
        p2_id = p2_resp.json()["data"]["id"]

        # Create budget for Project 1 with two lines
        b_resp = await client.post(
            f"/api/v1/projects/{p1_id}/budgets",
            json={
                "lines": [
                    {
                        "code": "01-CONCRETE",
                        "name": "Concrete",
                        "category": "HARD",
                        "original_amount": 5000000,
                    },
                    {
                        "code": "02-REBAR",
                        "name": "Rebar",
                        "category": "HARD",
                        "original_amount": 5000000,
                    },
                ]
            },
        )
        line1_id = b_resp.json()["data"]["lines"][0]["id"]
        line2_id = b_resp.json()["data"]["lines"][1]["id"]

        # Import a single spend record of $10,000 (1000000 cents)
        csv_data = "Date,Amount,Description,ExternalId,Direction\n2026-03-10,10000.00,Combined Materials,CM_001,OUTFLOW\n"
        imp_resp = await client.post(
            f"/api/v1/projects/{p1_id}/import-batches",
            json={"adapter": "CSV", "raw_content": csv_data},
        )
        assert imp_resp.status_code == 202

        rec_resp = await client.get(f"/api/v1/projects/{p1_id}/reconciliation/queue")
        spend_id = rec_resp.json()["data"][0]["spend_record_id"]

        # 1. Allocation mismatch fails with 400 ALLOCATION_NOT_BALANCED ($6,000 + $3,000 = $9,000 != $10,000)
        unbalanced_resp = await client.post(
            f"/api/v1/spend-records/{spend_id}/allocations",
            json={
                "allocations": [
                    {"budget_line_id": line1_id, "amount": 600000},
                    {"budget_line_id": line2_id, "amount": 300000},
                ]
            },
        )
        assert unbalanced_resp.status_code == 400
        assert unbalanced_resp.json()["error"]["code"] == "ALLOCATION_NOT_BALANCED"

        # 2. Balanced allocation succeeds ($6,000 + $4,000 = $10,000)
        balanced_resp = await client.post(
            f"/api/v1/spend-records/{spend_id}/allocations",
            json={
                "allocations": [
                    {"budget_line_id": line1_id, "amount": 600000},
                    {"budget_line_id": line2_id, "amount": 400000},
                ]
            },
        )
        assert balanced_resp.status_code == 200
        splits = balanced_resp.json()["data"]
        assert len(splits) == 2
        split1_id = splits[0]["id"]

        # 3. Reverse split spend record (creates linked negative record)
        rev_resp = await client.post(
            f"/api/v1/spend-records/{split1_id}/reverse",
            json={"reversal_type": "REVERSAL", "reason": "Vendor refunded overcharge on concrete"},
        )
        assert rev_resp.status_code == 200
        assert rev_resp.json()["data"]["amount"] == -600000

        # 4. Inter-project transfer from P1 to P2
        transfer_resp = await client.post(
            f"/api/v1/projects/{p1_id}/inter-project-transfers",
            json={
                "from_project_id": p1_id,
                "to_project_id": p2_id,
                "amount": 2500000,  # $25,000
                "transfer_date": "2026-03-15",
                "type": "TEMPORARY_ADVANCE",
            },
        )
        assert transfer_resp.status_code == 200
        transfer_data = transfer_resp.json()["data"]
        assert transfer_data["status"] == "OUTSTANDING"
        assert transfer_data["amount"] == 2500000
