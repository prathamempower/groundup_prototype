"""
Seed Runner for GroundUp AI backend.
Populates realistic, comprehensive, and consistent project data for:
1. Organization: Vance Development LLC
2. Users: Marcus Vance (OWNER), Sarah Lin (CFO), David Ross (PM), Frank Miller (GC), Elena Rostova (INVESTOR)
3. Projects:
   - 73 Broadway (Live, Construction, Cost-Plus, 150+ transactions, Budget, COs, Contingency, Draws 1 & 3, Short-funded, Unallocated cash, Milestones, Alerts)
   - 392 First Street (Completed, Closed, 15 draws with funding, 12 condominium unit sales, Loan payoff, Investor distributions, Audit events)
   - 161 Woodlawn Ave (Pre-construction, setup in progress)
4. Documents with physical files on disk in storage_data/
Idempotent: Can be run repeatedly safely.
"""

import os
import sys
import uuid
from datetime import UTC, date, datetime, timedelta

# Ensure backend root is on sys.path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..")))

import hashlib

from sqlalchemy import func, select

from app.core.security import hash_password
from app.db.models import (
    Alert,
    AuditEvent,
    Budget,
    BudgetLine,
    ChangeOrder,
    ContingencyMovement,
    Disposition,
    Document,
    DocumentExtraction,
    Draw,
    DrawFunding,
    DrawLine,
    DrawRequirement,
    ExtractionField,
    FinancialAccount,
    FinancialTransaction,
    InvestorContribution,
    InvestorDistribution,
    Loan,
    LoanTerm,
    Organization,
    Party,
    Project,
    ProjectFinancialPlan,
    ProjectInvestor,
    ProjectMember,
    ProjectMilestone,
    ReconciliationMatch,
    ReviewDecision,
    SpendRecord,
    StatementPeriod,
    Unit,
    User,
    generate_uuid,
    utc_now,
)
from app.db.session import SessionLocal
from app.storage.local import LocalStorageBackend

DEFAULT_PASSWORD = "Password123!"


def seed_database():
    print("🌱 Starting GroundUp AI Seed Script...")
    db = SessionLocal()
    storage = LocalStorageBackend()

    try:
        # 1. Organization: Vance Development LLC
        org = db.scalars(select(Organization).where(Organization.name == "Vance Development LLC")).first()
        if not org:
            org = Organization(
                id=generate_uuid(),
                name="Vance Development LLC",
                created_at=utc_now(),
            )
            db.add(org)
            db.flush()
            print(f"Created organization: {org.name} ({org.id})")
        else:
            print(f"Using existing organization: {org.name}")

        # 2. Users (One per role)
        users_def = [
            {
                "email": "m.vance@vancedev.com",
                "first_name": "Marcus",
                "last_name": "Vance",
                "role": "OWNER",
            },
            {
                "email": "s.lin@vancedev.com",
                "first_name": "Sarah",
                "last_name": "Lin",
                "role": "CFO",
            },
            {
                "email": "d.ross@vancedev.com",
                "first_name": "David",
                "last_name": "Ross",
                "role": "PM",
            },
            {
                "email": "frank@apexconstruction.com",
                "first_name": "Frank",
                "last_name": "Miller",
                "role": "GC",
            },
            {
                "email": "e.rostova@meridiancap.com",
                "first_name": "Elena",
                "last_name": "Rostova",
                "role": "INVESTOR",
            },
        ]

        users: dict[str, User] = {}
        for u_def in users_def:
            u = db.scalars(select(User).where(User.email == u_def["email"])).first()
            if not u:
                u = User(
                    id=generate_uuid(),
                    organization_id=org.id,
                    email=u_def["email"],
                    hashed_password=hash_password(DEFAULT_PASSWORD),
                    first_name=u_def["first_name"],
                    last_name=u_def["last_name"],
                    role=u_def["role"],
                    is_active=True,
                    created_at=utc_now(),
                )
                db.add(u)
                db.flush()
                print(f"Created user: {u.first_name} {u.last_name} ({u.role}) - {u.email}")
            users[u_def["role"]] = u

        # 3. Third Parties (Lender, GC, Vendors, Investors)
        def get_or_create_party(name: str, party_type: str) -> Party:
            p = db.scalars(
                select(Party).where(Party.organization_id == org.id, Party.name == name)
            ).first()
            if not p:
                p = Party(
                    id=generate_uuid(),
                    organization_id=org.id,
                    name=name,
                    party_type=party_type,
                    created_at=utc_now(),
                )
                db.add(p)
                db.flush()
            return p

        lender_columbia = get_or_create_party("Columbia Bank Construction Lending", "LENDER")
        lender_bofa = get_or_create_party("Bank of America Commercial Real Estate", "LENDER")
        gc_party = get_or_create_party("Apex Construction Services LLC", "GC")
        concrete_vendor = get_or_create_party("Red Hook Concrete Supply LLC", "VENDOR")
        steel_vendor = get_or_create_party("Atlantic Iron Works Corp", "VENDOR")
        get_or_create_party("Perkins Eastman Architects", "VENDOR")
        investor_meridian = get_or_create_party("Meridian Capital Real Estate Fund III", "INVESTOR")
        investor_fscp = get_or_create_party("First Street Capital Partners LP", "INVESTOR")

        # 4. Project: 73 Broadway (Live Construction Project)
        p73 = db.scalars(
            select(Project).where(Project.organization_id == org.id, Project.name == "73 Broadway")
        ).first()
        if not p73:
            p73 = Project(
                id=generate_uuid(),
                organization_id=org.id,
                name="73 Broadway",
                project_entity="73 Broadway Partners LLC",
                address="73 Broadway, New York, NY",
                lifecycle_stage="CONSTRUCTION",
                contract_model="COST_PLUS",
                status="ACTIVE",
                currency="USD",
                started_at=datetime(2025, 4, 1, tzinfo=UTC),
                target_completion_at=datetime(2026, 11, 15, tzinfo=UTC),
                created_at=utc_now(),
            )
            db.add(p73)
            db.flush()
            print(f"Created project: 73 Broadway ({p73.id})")

        # Project Members for 73 Broadway
        for role, u in users.items():
            pmem = db.scalars(
                select(ProjectMember).where(
                    ProjectMember.project_id == p73.id,
                    ProjectMember.user_id == u.id,
                )
            ).first()
            if not pmem:
                pmem = ProjectMember(
                    id=generate_uuid(),
                    organization_id=org.id,
                    project_id=p73.id,
                    user_id=u.id,
                    role=role,
                    created_at=utc_now(),
                )
                db.add(pmem)

        # 73 Broadway Financing (Loan & Terms)
        loan73 = db.scalars(select(Loan).where(Loan.project_id == p73.id)).first()
        if not loan73:
            loan73 = Loan(
                id=generate_uuid(),
                organization_id=org.id,
                project_id=p73.id,
                lender_party_id=lender_columbia.id,
                loan_number="COL-2025-73B",
                commitment_amount=420000000,  # $4,200,000.00
                status="ACTIVE",
                currency="USD",
                created_at=utc_now(),
            )
            db.add(loan73)
            db.flush()

            lt73 = LoanTerm(
                id=generate_uuid(),
                organization_id=org.id,
                loan_id=loan73.id,
                interest_rate=5.7500,
                interest_method="ACTUAL_360",
                interest_reserve_amount=52000000,
                retainage_percentage=10.0,
                effective_date=date(2025, 4, 1),
                maturity_date=date(2027, 4, 1),
                created_at=utc_now(),
            )
            db.add(lt73)

        # 73 Broadway Financial Accounts & Statement Periods
        acc_bcb_73 = db.scalars(
            select(FinancialAccount).where(
                FinancialAccount.organization_id == org.id,
                FinancialAccount.institution == "BCB Community Bank",
            )
        ).first()
        if not acc_bcb_73:
            acc_bcb_73 = FinancialAccount(
                id=generate_uuid(),
                organization_id=org.id,
                party_id=gc_party.id,
                institution="BCB Community Bank",
                masked_identifier="•••• 4182",
                account_purpose="OPERATING",
                currency="USD",
                active_from=date(2025, 4, 1),
                status="ACTIVE",
                created_at=utc_now(),
            )
            db.add(acc_bcb_73)
            db.flush()

        acc_columbia_73 = db.scalars(
            select(FinancialAccount).where(
                FinancialAccount.organization_id == org.id,
                FinancialAccount.institution == "Columbia Bank",
            )
        ).first()
        if not acc_columbia_73:
            acc_columbia_73 = FinancialAccount(
                id=generate_uuid(),
                organization_id=org.id,
                party_id=lender_columbia.id,
                institution="Columbia Bank",
                masked_identifier="•••• 8904",
                account_purpose="DRAW_DISBURSEMENT",
                currency="USD",
                active_from=date(2025, 4, 1),
                status="ACTIVE",
                created_at=utc_now(),
            )
            db.add(acc_columbia_73)
            db.flush()

        # Statement Periods
        sp1 = db.scalars(
            select(StatementPeriod).where(
                StatementPeriod.financial_account_id == acc_bcb_73.id,
                StatementPeriod.period_start == date(2025, 8, 1),
            )
        ).first()
        if not sp1:
            sp1 = StatementPeriod(
                id=generate_uuid(),
                financial_account_id=acc_bcb_73.id,
                period_start=date(2025, 8, 1),
                period_end=date(2025, 8, 31),
                opening_balance=38500000,
                closing_balance=21400000,
                coverage_status="ACTIVE",
                reconciled_by=users["CFO"].id,
                reconciled_at=utc_now(),
                created_at=utc_now(),
            )
            db.add(sp1)

        sp2 = db.scalars(
            select(StatementPeriod).where(
                StatementPeriod.financial_account_id == acc_bcb_73.id,
                StatementPeriod.period_start == date(2025, 9, 1),
            )
        ).first()
        if not sp2:
            sp2 = StatementPeriod(
                id=generate_uuid(),
                financial_account_id=acc_bcb_73.id,
                period_start=date(2025, 9, 1),
                period_end=date(2025, 9, 30),
                opening_balance=21400000,
                closing_balance=13425000,
                coverage_status="ACTIVE",
                created_at=utc_now(),
            )
            db.add(sp2)

        # 73 Broadway Documents with Disk Files
        def create_seed_doc(filename: str, doc_type: str, content: bytes, pid: uuid.UUID) -> Document:
            existing = db.scalars(
                select(Document).where(Document.project_id == pid, Document.original_filename == filename)
            ).first()
            if existing:
                target_path = storage._resolve_path(existing.storage_key)
                if not target_path.exists():
                    target_path.parent.mkdir(parents=True, exist_ok=True)
                    with open(target_path, "wb") as f:
                        f.write(content)
                return existing

            doc_id = generate_uuid()
            storage_key = f"projects/{pid}/{doc_id}/{filename}"
            target_path = storage._resolve_path(storage_key)
            target_path.parent.mkdir(parents=True, exist_ok=True)
            with open(target_path, "wb") as f:
                f.write(content)
            sha256 = hashlib.sha256(content).hexdigest()

            d = Document(
                id=doc_id,
                organization_id=org.id,
                project_id=pid,
                storage_key=storage_key,
                sha256=sha256,
                original_filename=filename,
                mime_type="application/pdf" if filename.endswith(".pdf") else "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
                document_type=doc_type,
                document_date=date(2025, 9, 15),
                source_system="LOCAL_UPLOAD",
                ingestion_status="REVIEWED",
                uploaded_by=users["OWNER"].id,
                uploaded_at=utc_now(),
            )
            db.add(d)
            db.flush()
            return d

        doc_budget_73 = create_seed_doc("73_Broadway_Approved_Budget_2025.xlsx", "BUDGET_SOV", b"SOV Budget Content for 73 Broadway", p73.id)
        doc_draw1_73 = create_seed_doc("73_Broadway_Lender_Draw_1_Certified.pdf", "DRAW_PACKET", b"AIA G702 Certified Draw 1 PDF Content", p73.id)
        doc_draw3_insp = create_seed_doc("73_Broadway_Draw_3_Lender_Inspection_Report.pdf", "INSPECTION", b"Lender Inspection Report Recommending $460k against $520k", p73.id)

        # Pre-fill Extraction Fields & Review Decisions on doc_draw3_insp
        ext = db.scalars(select(DocumentExtraction).where(DocumentExtraction.document_id == doc_draw3_insp.id)).first()
        if not ext:
            ext = DocumentExtraction(
                id=generate_uuid(),
                document_id=doc_draw3_insp.id,
                model_version="v1.0",
                status="COMPLETED",
                created_at=utc_now(),
            )
            db.add(ext)
            db.flush()

            ef1 = ExtractionField(
                id=generate_uuid(),
                extraction_id=ext.id,
                field_name="Inspector Approved Amount",
                proposed_value="$460,000.00",
                accepted_value="$460,000.00",
                confidence=0.98,
                page_number=2,
                status="ACCEPTED",
                created_at=utc_now(),
            )
            db.add(ef1)
            db.flush()

            rd1 = ReviewDecision(
                id=generate_uuid(),
                document_id=doc_draw3_insp.id,
                decision="ACCEPTED",
                decided_by=users["CFO"].id,
                decided_at=utc_now(),
                rationale="Certified by ATD Inspector Michael Klein after field walkthrough.",
            )
            db.add(rd1)

        # 73 Broadway Master Baseline Budget
        b73 = db.scalars(select(Budget).where(Budget.project_id == p73.id, Budget.status == "APPROVED")).first()
        if not b73:
            b73 = Budget(
                id=generate_uuid(),
                organization_id=org.id,
                project_id=p73.id,
                version_number=1,
                status="APPROVED",
                total_original_amount=446000000,  # $4,460,000.00
                total_current_approved_amount=446000000,
                approved_by=users["OWNER"].id,
                approved_at=utc_now(),
                created_at=utc_now(),
            )
            db.add(b73)
            db.flush()

        # Budget Lines for 73 Broadway
        budget_lines_data = [
            ("01-000", "General Requirements & Supervision", "SOFT_COST", 28000000, 28000000, 1),
            ("02-100", "Demolition & Excavation", "HARD_COST", 34000000, 36000000, 2),  # +20k CO-01
            ("03-200", "Foundation & Concrete Substructure", "HARD_COST", 72000000, 72000000, 3),
            ("05-100", "Structural Steel & Metal Decking", "HARD_COST", 98000000, 106000000, 4),  # +80k CO-02
            ("09-200", "Drywall & Rough Framing", "HARD_COST", 64000000, 64000000, 5),
            ("15-000", "MEP Systems (Mechanical, Electrical, Plumbing)", "HARD_COST", 115000000, 120000000, 6),  # +50k CO-03
            ("20-000", "Hard Cost Contingency", "CONTINGENCY", 35000000, 20000000, 7),  # -150k moved
        ]
        bls73: dict[str, BudgetLine] = {}
        for code, name, cat, orig_amt, curr_amt, order in budget_lines_data:
            bl = db.scalars(
                select(BudgetLine).where(BudgetLine.budget_id == b73.id, BudgetLine.code == code)
            ).first()
            if not bl:
                bl = BudgetLine(
                    id=generate_uuid(),
                    budget_id=b73.id,
                    code=code,
                    name=name,
                    category=cat,
                    original_amount=orig_amt,
                    current_approved_amount=curr_amt,
                    is_draw_eligible=(cat != "CONTINGENCY"),
                    sort_order=order,
                    created_at=utc_now(),
                )
                db.add(bl)
                db.flush()
            bls73[code] = bl

        # Change Orders & Contingency Movements
        co1 = db.scalars(
            select(ChangeOrder).where(ChangeOrder.project_id == p73.id, ChangeOrder.change_order_number == "CO-01")
        ).first()
        if not co1:
            co1 = ChangeOrder(
                id=generate_uuid(),
                organization_id=org.id,
                project_id=p73.id,
                change_order_number="CO-01",
                title="Subgrade Rock Ledge Excavation",
                reason="Unforeseen basalt rock ledge discovered at bedrock elevation requiring hydraulic hoe-ramming.",
                requested_amount=2000000,
                approved_amount=2000000,
                status="APPROVED",
                requested_by=users["GC"].id,
                approved_by=users["OWNER"].id,
                approved_at=utc_now() - timedelta(days=85),
                created_at=utc_now(),
            )
            db.add(co1)
            db.flush()

            cm1 = ContingencyMovement(
                id=generate_uuid(),
                organization_id=org.id,
                project_id=p73.id,
                from_budget_line_id=bls73["20-000"].id,
                to_budget_line_id=bls73["02-100"].id,
                amount=2000000,
                reason="Fund CO-01 subgrade rock removal",
                approved_by=users["OWNER"].id,
                approved_at=utc_now() - timedelta(days=85),
                created_at=utc_now(),
            )
            db.add(cm1)

        # 73 Broadway Milestones
        ms_defs_73 = [
            ("M1", "Demolition & Site Preparation", date(2025, 4, 1), date(2025, 5, 30), date(2025, 5, 28), date(2025, 5, 28), 100.0, "COMPLETED", bls73["02-100"].id),
            ("M2", "Foundation & Subgrade Pours", date(2025, 6, 1), date(2025, 7, 31), date(2025, 8, 4), date(2025, 8, 4), 100.0, "COMPLETED", bls73["03-200"].id),
            ("M3", "Framing & Structural Steel Erection", date(2025, 8, 5), date(2025, 10, 15), None, date(2025, 11, 30), 65.0, "DELAYED", bls73["05-100"].id),
            ("M4", "Building Envelope & Roof Sealing", date(2025, 10, 20), date(2025, 12, 30), None, date(2026, 2, 15), 0.0, "NOT_STARTED", bls73["09-200"].id),
            ("M5", "Mechanical, Electrical & Rough Plumbing", date(2026, 1, 5), date(2026, 4, 15), None, date(2026, 5, 30), 0.0, "NOT_STARTED", bls73["15-000"].id),
        ]
        ms73_map: dict[str, ProjectMilestone] = {}
        for code, name, p_start, p_comp, a_comp, f_comp, pct, st, _bl_id in ms_defs_73:
            ms = db.scalars(
                select(ProjectMilestone).where(ProjectMilestone.project_id == p73.id, ProjectMilestone.code == code)
            ).first()
            if not ms:
                ms = ProjectMilestone(
                    id=generate_uuid(),
                    organization_id=org.id,
                    project_id=p73.id,
                    name=name,
                    code=code,
                    planned_start_date=p_start,
                    planned_completion_date=p_comp,
                    actual_completion_date=a_comp,
                    forecast_completion_date=f_comp,
                    progress_percentage=pct,
                    status=st,
                    forecast_change_reason="Mill fabricator wide-flange delivery delay of 45 days" if code == "M3" else None,
                    created_at=utc_now(),
                )
                db.add(ms)
                db.flush()
            ms73_map[code] = ms

        # Link budget lines to milestones
        bls73["02-100"].milestone_id = ms73_map["M1"].id
        bls73["03-200"].milestone_id = ms73_map["M2"].id
        bls73["05-100"].milestone_id = ms73_map["M3"].id
        bls73["09-200"].milestone_id = ms73_map["M4"].id
        bls73["15-000"].milestone_id = ms73_map["M5"].id
        db.flush()

        # 73 Broadway Draws: Application #1 (Funded) and Application #3 (Short-Funded)
        draw1 = db.scalars(select(Draw).where(Draw.project_id == p73.id, Draw.draw_number == "1")).first()
        if not draw1:
            draw1 = Draw(
                id=generate_uuid(),
                organization_id=org.id,
                project_id=p73.id,
                loan_id=loan73.id,
                draw_number="1",
                status="FUNDED",
                period_start=date(2025, 4, 1),
                period_end=date(2025, 5, 31),
                submitted_at=datetime(2025, 6, 5, 10, 0, tzinfo=UTC),
                approved_at=datetime(2025, 6, 18, 14, 30, tzinfo=UTC),
                lender_party_id=lender_columbia.id,
                source_document_id=doc_draw1_73.id,
                created_at=utc_now(),
            )
            db.add(draw1)
            db.flush()

            dl1 = DrawLine(
                id=generate_uuid(),
                draw_id=draw1.id,
                budget_line_id=bls73["02-100"].id,
                requested_amount=38500000,
                recommended_amount=38500000,
                approved_amount=38500000,
                funded_amount=38500000,
                evidence_status="VERIFIED",
                created_at=utc_now(),
            )
            db.add(dl1)

        draw3 = db.scalars(select(Draw).where(Draw.project_id == p73.id, Draw.draw_number == "3")).first()
        if not draw3:
            draw3 = Draw(
                id=generate_uuid(),
                organization_id=org.id,
                project_id=p73.id,
                loan_id=loan73.id,
                draw_number="3",
                status="PARTIALLY_APPROVED",  # Short-funded draw!
                period_start=date(2025, 8, 1),
                period_end=date(2025, 9, 15),
                submitted_at=datetime(2025, 9, 18, 11, 0, tzinfo=UTC),
                approved_at=datetime(2025, 9, 28, 16, 0, tzinfo=UTC),
                lender_party_id=lender_columbia.id,
                source_document_id=doc_draw3_insp.id,
                created_at=utc_now(),
            )
            db.add(draw3)
            db.flush()

            dl3 = DrawLine(
                id=generate_uuid(),
                draw_id=draw3.id,
                budget_line_id=bls73["05-100"].id,
                requested_amount=52000000,
                recommended_amount=46000000,
                approved_amount=46000000,
                funded_amount=40000000,  # $60,000 shortfall
                reason="$60,000 condition holdback pending certified mechanical engineering signoff",
                evidence_status="PENDING_INSPECTION",
                created_at=utc_now(),
            )
            db.add(dl3)

            dr1 = DrawRequirement(
                id=generate_uuid(),
                draw_id=draw3.id,
                title="Certified Mechanical Engineering Certificate",
                requirement_type="INSPECTION",
                status="MISSING",
                created_at=utc_now(),
            )
            db.add(dr1)

        # 73 Broadway ~150 Financial Transactions
        tx_count_73 = db.scalar(
            select(func.count(FinancialTransaction.id)).where(FinancialTransaction.project_id == p73.id)
        ) or 0
        if tx_count_73 < 50:
            print("Generating realistic financial transactions for 73 Broadway...")
            vendors_seed = [
                ("Apex Construction Services LLC", gc_party.id, "05-100", 4250000, "OUTFLOW"),
                ("City of New York Dept of Buildings", None, "01-000", 1580000, "OUTFLOW"),
                ("Empire Surveying & Geotechnical", None, "02-100", 840000, "OUTFLOW"),
                ("Red Hook Concrete Supply LLC", concrete_vendor.id, "03-200", 1840000, "OUTFLOW"),
                ("Atlantic Iron Works Corp", steel_vendor.id, "05-100", 5600000, "OUTFLOW"),
                ("Tri-State Environmental Consulting", None, "01-000", 450000, "OUTFLOW"),
            ]

            # Inbound Draw Wires
            t_wire1 = FinancialTransaction(
                id=generate_uuid(),
                project_id=p73.id,
                financial_account_id=acc_columbia_73.id,
                transaction_date=date(2025, 6, 18),
                amount=38500000,  # $385,000.00
                direction="INFLOW",
                counterparty="Columbia Bank Draw Wire #01",
                memo="Columbia Bank Draw #01 Funding",
                cleared_status="CLEARED",
                created_at=utc_now(),
            )
            db.add(t_wire1)
            db.flush()

            # Allocate Draw 1 funding
            df1 = DrawFunding(
                id=generate_uuid(),
                draw_id=draw1.id,
                transaction_id=t_wire1.id,
                amount=38500000,
                funding_date=date(2025, 6, 18),
                created_at=utc_now(),
            )
            db.add(df1)

            t_wire3 = FinancialTransaction(
                id=generate_uuid(),
                project_id=p73.id,
                financial_account_id=acc_columbia_73.id,
                transaction_date=date(2025, 9, 30),
                amount=40000000,  # $400,000.00
                direction="INFLOW",
                counterparty="Columbia Bank Draw Wire #03",
                memo="Columbia Bank Draw #03 Partial Advance",
                cleared_status="CLEARED",
                created_at=utc_now(),
            )
            db.add(t_wire3)
            db.flush()

            df3 = DrawFunding(
                id=generate_uuid(),
                draw_id=draw3.id,
                transaction_id=t_wire3.id,
                amount=40000000,
                funding_date=date(2025, 9, 30),
                created_at=utc_now(),
            )
            db.add(df3)

            # Unallocated Inbound Wire Deposit ($150,000 sitting in Columbia Bank)
            t_unallocated = FinancialTransaction(
                id=generate_uuid(),
                project_id=p73.id,
                financial_account_id=acc_columbia_73.id,
                transaction_date=date(2025, 9, 25),
                amount=15000000,  # $150,000.00 unallocated deposit
                direction="INFLOW",
                counterparty="Columbia Bank Unallocated Escrow Wire",
                memo="Advance escrow wire - not yet allocated to draw application",
                cleared_status="CLEARED",
                created_at=utc_now(),
            )
            db.add(t_unallocated)

            # Generate vendor debits and spend records (~150 transactions total)
            for i in range(1, 148):
                v_name, v_id, bl_code, base_amt, direction = vendors_seed[i % len(vendors_seed)]
                day = min(28, (i % 28) + 1)
                month = min(9, (i // 12) + 4)
                tx_date = date(2025, month, day)
                amt = base_amt + (i * 2500)

                tx = FinancialTransaction(
                    id=generate_uuid(),
                    project_id=p73.id,
                    financial_account_id=acc_bcb_73.id,
                    transaction_date=tx_date,
                    amount=amt,
                    direction=direction,
                    counterparty=v_name,
                    memo=f"{v_name} payment for {bl_code} voucher #{5000+i}",
                    cleared_status="CLEARED" if i < 94 else "PENDING",
                    created_at=utc_now(),
                )
                db.add(tx)
                db.flush()

                # Corresponding SpendRecord (one has missing invoice)
                sr = SpendRecord(
                    id=generate_uuid(),
                    project_id=p73.id,
                    vendor_party_id=v_id,
                    transaction_date=tx_date,
                    amount=amt,
                    currency="USD",
                    description=f"{v_name} - {bl_code} expense",
                    status="VERIFIED" if i != 50 else "PROVISIONAL",
                    evidence_strength="VERIFIED_INVOICE" if i != 50 else "MANUAL_ENTRY",
                    source_document_id=doc_budget_73.id if i != 50 else None,  # One missing invoice
                    transaction_id=tx.id,
                    budget_line_id=bls73[bl_code].id,
                    match_status="CONFIRMED" if i != 50 else "UNMATCHED",
                    reviewed_by=users["CFO"].id if i != 50 else None,
                    reviewed_at=utc_now() if i != 50 else None,
                    created_at=utc_now(),
                )
                db.add(sr)
                db.flush()

                # Proposed reconciliation match
                if i % 5 == 0:
                    rm = ReconciliationMatch(
                        id=generate_uuid(),
                        organization_id=org.id,
                        project_id=p73.id,
                        transaction_id=tx.id,
                        spend_record_id=sr.id,
                        match_type="EXACT",
                        confidence_score=0.95,
                        decision="SUGGESTED",
                        created_at=utc_now(),
                    )
                    db.add(rm)

            db.flush()

        # 73 Broadway Pro Forma & Units
        pf73 = db.scalars(
            select(ProjectFinancialPlan).where(ProjectFinancialPlan.project_id == p73.id, ProjectFinancialPlan.is_active)
        ).first()
        if not pf73:
            pf73 = ProjectFinancialPlan(
                id=generate_uuid(),
                organization_id=org.id,
                project_id=p73.id,
                version_number=1,
                plan_type="PRO_FORMA",
                projected_revenue=650000000,
                projected_cost=446000000,
                target_irr=19.5,
                target_equity_multiple=1.92,
                payload={"lines": [
                    {"category": "REVENUE", "line_name": "Gross Development Value (GDV)", "original_plan_amount": 650000000, "current_forecast_amount": 650000000, "basis": "ESTIMATED"},
                    {"category": "HARD_COST", "line_name": "Direct Construction Hard Costs", "original_plan_amount": 343000000, "current_forecast_amount": 354000000, "basis": "COMMITTED"},
                    {"category": "SOFT_COST", "line_name": "Architectural, Engineering & Fees", "original_plan_amount": 28000000, "current_forecast_amount": 28000000, "basis": "ACTUAL"},
                    {"category": "FINANCING", "line_name": "Senior Loan Interest & Carrying", "original_plan_amount": 52000000, "current_forecast_amount": 54775000, "basis": "ESTIMATED"},
                ]},
                is_active=True,
                created_at=utc_now(),
            )
            db.add(pf73)

        # 73 Broadway Units
        u73_count = db.scalar(select(func.count(Unit.id)).where(Unit.project_id == p73.id)) or 0
        if u73_count == 0:
            units_73_data = [
                ("Unit 1A", 850, 79500000, 82000000, "UNDER_CONTRACT"),
                ("Unit 2A", 1150, 115000000, None, "AVAILABLE"),
                ("Unit 3A", 1150, 117500000, None, "AVAILABLE"),
                ("Penthouse A", 1650, 185000000, None, "AVAILABLE"),
                ("Ground Retail", 2200, 153000000, None, "AVAILABLE"),
            ]
            for unum, sqft, target_p, actual_p, u_st in units_73_data:
                unit = Unit(
                    id=generate_uuid(),
                    organization_id=org.id,
                    project_id=p73.id,
                    unit_number=unum,
                    square_feet=sqft,
                    target_price=target_p,
                    actual_sale_price=actual_p,
                    status=u_st,
                    created_at=utc_now(),
                )
                db.add(unit)

        # 73 Broadway Investor Contributions
        pi73 = db.scalars(
            select(ProjectInvestor).where(
                ProjectInvestor.project_id == p73.id,
                ProjectInvestor.investor_party_id == investor_meridian.id,
            )
        ).first()
        if not pi73:
            pi73 = ProjectInvestor(
                id=generate_uuid(),
                organization_id=org.id,
                project_id=p73.id,
                investor_party_id=investor_meridian.id,
                committed_amount=230000000,
                ownership_percentage=60.0,
                created_at=utc_now(),
            )
            db.add(pi73)
            db.flush()

            ic73 = InvestorContribution(
                id=generate_uuid(),
                project_investor_id=pi73.id,
                amount=138000000,  # $1,380,000.00
                received_date=date(2025, 4, 1),
                created_at=utc_now(),
            )
            db.add(ic73)

        # 73 Broadway Alerts & Data Quality Issues
        alert_shortfall = db.scalars(
            select(Alert).where(Alert.project_id == p73.id, Alert.alert_type == "SHORT_FUNDED_DRAW")
        ).first()
        if not alert_shortfall:
            alert_shortfall = Alert(
                id=generate_uuid(),
                organization_id=org.id,
                project_id=p73.id,
                alert_type="SHORT_FUNDED_DRAW",
                severity="HIGH",
                title="Draw Application #3 Short-Funded ($60,000)",
                description="Lender withheld $60,000 on Line 05-100 pending submission of certified mechanical engineering certificate.",
                status="OPEN",
                owner_id=users["CFO"].id,
                created_at=utc_now(),
            )
            db.add(alert_shortfall)

        alert_unallocated = db.scalars(
            select(Alert).where(Alert.project_id == p73.id, Alert.alert_type == "UNALLOCATED_CASH")
        ).first()
        if not alert_unallocated:
            alert_unallocated = Alert(
                id=generate_uuid(),
                organization_id=org.id,
                project_id=p73.id,
                alert_type="UNALLOCATED_CASH",
                severity="MEDIUM",
                title="Unallocated Wire Deposit ($150,000)",
                description="$150,000.00 in cleared wire deposits sitting in Columbia Bank has not yet been allocated to draw lines.",
                status="OPEN",
                owner_id=users["CFO"].id,
                created_at=utc_now(),
            )
            db.add(alert_unallocated)

        alert_delay = db.scalars(
            select(Alert).where(Alert.project_id == p73.id, Alert.alert_type == "DELAYED_MILESTONE")
        ).first()
        if not alert_delay:
            alert_delay = Alert(
                id=generate_uuid(),
                organization_id=org.id,
                project_id=p73.id,
                alert_type="DELAYED_MILESTONE",
                severity="MEDIUM",
                title="Structural Steel Erection Delayed 45 Days",
                description="Milestone M3 is delayed 45 days past planned schedule due to mill fabricator wide-flange delivery delays.",
                status="OPEN",
                owner_id=users["PM"].id,
                created_at=utc_now(),
            )
            db.add(alert_delay)

        # ---------------------------------------------------------------------
        # 5. Project: 392 First Street (Completed, Closed Out Project)
        # ---------------------------------------------------------------------
        p392 = db.scalars(
            select(Project).where(Project.organization_id == org.id, Project.name == "392 First Street")
        ).first()
        if not p392:
            p392 = Project(
                id=generate_uuid(),
                organization_id=org.id,
                name="392 First Street",
                project_entity="392 First St Development LLC",
                address="392 First Street, Jersey City, NJ",
                lifecycle_stage="CLOSED",
                contract_model="FIXED_PRICE",
                status="COMPLETED",
                currency="USD",
                started_at=datetime(2024, 1, 15, tzinfo=UTC),
                target_completion_at=datetime(2025, 1, 20, tzinfo=UTC),
                created_at=utc_now() - timedelta(days=400),
            )
            db.add(p392)
            db.flush()
            print(f"Created project: 392 First Street ({p392.id})")

        # Project Members for 392 First Street
        for role, u in users.items():
            pmem = db.scalars(
                select(ProjectMember).where(
                    ProjectMember.project_id == p392.id,
                    ProjectMember.user_id == u.id,
                )
            ).first()
            if not pmem:
                pmem = ProjectMember(
                    id=generate_uuid(),
                    organization_id=org.id,
                    project_id=p392.id,
                    user_id=u.id,
                    role=role,
                    created_at=utc_now(),
                )
                db.add(pmem)

        # 392 Financing (Loan, 100% Repaid)
        loan392 = db.scalars(select(Loan).where(Loan.project_id == p392.id)).first()
        if not loan392:
            loan392 = Loan(
                id=generate_uuid(),
                organization_id=org.id,
                project_id=p392.id,
                lender_party_id=lender_bofa.id,
                loan_number="BOFA-CRE-392F",
                commitment_amount=385000000,
                status="PAID_OFF",
                currency="USD",
                created_at=utc_now(),
            )
            db.add(loan392)
            db.flush()

        # 392 First Street Master Budget (Closed)
        b392 = db.scalars(select(Budget).where(Budget.project_id == p392.id, Budget.status == "APPROVED")).first()
        if not b392:
            b392 = Budget(
                id=generate_uuid(),
                organization_id=org.id,
                project_id=p392.id,
                version_number=1,
                status="APPROVED",
                total_original_amount=385000000,
                total_current_approved_amount=385000000,
                approved_by=users["OWNER"].id,
                approved_at=utc_now() - timedelta(days=350),
                created_at=utc_now() - timedelta(days=350),
            )
            db.add(b392)
            db.flush()

            bl392 = BudgetLine(
                id=generate_uuid(),
                budget_id=b392.id,
                code="01-MASTER",
                name="Master Construction GMP",
                category="HARD_COST",
                original_amount=385000000,
                current_approved_amount=385000000,
                is_draw_eligible=True,
                sort_order=1,
                created_at=utc_now(),
            )
            db.add(bl392)
            db.flush()

        # 392 First Street: 15 Draws (Fully Approved & Funded)
        draws_392_count = db.scalar(select(func.count(Draw.id)).where(Draw.project_id == p392.id)) or 0
        if draws_392_count < 15:
            print("Generating 15 closed draws for 392 First Street...")
            amt_per_draw = 385000000 // 15
            for dnum in range(1, 16):
                m_idx = min(12, dnum)
                d_date = date(2024, m_idx, 28)
                d = Draw(
                    id=generate_uuid(),
                    organization_id=org.id,
                    project_id=p392.id,
                    loan_id=loan392.id,
                    draw_number=str(dnum),
                    status="CLOSED",
                    period_start=date(2024, m_idx, 1),
                    period_end=d_date,
                    submitted_at=datetime(2024, m_idx, 28, 10, 0, tzinfo=UTC),
                    approved_at=datetime(2024, m_idx, 29, 14, 0, tzinfo=UTC),
                    lender_party_id=lender_bofa.id,
                    created_at=utc_now() - timedelta(days=300 - (dnum * 15)),
                )
                db.add(d)
                db.flush()

                dl = DrawLine(
                    id=generate_uuid(),
                    draw_id=d.id,
                    budget_line_id=bl392.id,
                    requested_amount=amt_per_draw,
                    recommended_amount=amt_per_draw,
                    approved_amount=amt_per_draw,
                    funded_amount=amt_per_draw,
                    evidence_status="VERIFIED",
                    created_at=utc_now(),
                )
                db.add(dl)

        # 392 First Street: 12 Closed Units & Dispositions
        u392_count = db.scalar(select(func.count(Unit.id)).where(Unit.project_id == p392.id)) or 0
        if u392_count < 12:
            print("Generating 12 closed condominium units for 392 First Street...")
            unit_price = 640000000 // 12  # $533,333.33 each for $6.4M total
            for unum in range(1, 13):
                floor = ((unum - 1) // 4) + 1
                letter = chr(65 + ((unum - 1) % 4))
                u = Unit(
                    id=generate_uuid(),
                    organization_id=org.id,
                    project_id=p392.id,
                    unit_number=f"Unit {floor}0{((unum - 1) % 4) + 1} ({letter})",
                    square_feet=1050,
                    target_price=unit_price,
                    actual_sale_price=unit_price,
                    status="SOLD",
                    created_at=utc_now() - timedelta(days=350),
                )
                db.add(u)

        # 392 Disposition Record (Master HUD-1 Settlement)
        disp392 = db.scalars(select(Disposition).where(Disposition.project_id == p392.id)).first()
        if not disp392:
            disp392 = Disposition(
                id=generate_uuid(),
                organization_id=org.id,
                project_id=p392.id,
                sale_price=640000000,  # $6,400,000.00
                closing_date=date(2025, 1, 15),
                settlement_costs=32000000,  # $320,000.00 commissions & closing
                net_proceeds=608000000,  # $6,080,000.00
                notes="Master disposition for 12 closed condominium units at 392 First Street.",
                created_at=utc_now(),
            )
            db.add(disp392)
            db.flush()

        # 392 Investor Distributions (Waterfall return of capital & profits)
        pi392 = db.scalars(
            select(ProjectInvestor).where(
                ProjectInvestor.project_id == p392.id,
                ProjectInvestor.investor_party_id == investor_fscp.id,
            )
        ).first()
        if not pi392:
            pi392 = ProjectInvestor(
                id=generate_uuid(),
                organization_id=org.id,
                project_id=p392.id,
                investor_party_id=investor_fscp.id,
                committed_amount=115000000,
                ownership_percentage=80.0,
                created_at=utc_now(),
            )
            db.add(pi392)
            db.flush()

            # Capital contribution
            ic392 = InvestorContribution(
                id=generate_uuid(),
                project_investor_id=pi392.id,
                amount=115000000,
                received_date=date(2024, 1, 10),
                created_at=utc_now(),
            )
            db.add(ic392)

            # Waterfall Distributions
            dist1 = InvestorDistribution(
                id=generate_uuid(),
                project_investor_id=pi392.id,
                amount=115000000,  # Return of capital
                distribution_date=date(2025, 1, 20),
                distribution_type="RETURN_OF_CAPITAL",
                created_at=utc_now(),
            )
            db.add(dist1)

            dist2 = InvestorDistribution(
                id=generate_uuid(),
                project_investor_id=pi392.id,
                amount=70000000,  # Profit split / preferred return
                distribution_date=date(2025, 1, 22),
                distribution_type="PROFIT_SPLIT",
                created_at=utc_now(),
            )
            db.add(dist2)

        # 392 First Street Audit Events
        ae1 = db.scalars(
            select(AuditEvent).where(AuditEvent.project_id == p392.id, AuditEvent.action == "PROJECT_CLOSED")
        ).first()
        if not ae1:
            ae1 = AuditEvent(
                id=generate_uuid(),
                organization_id=org.id,
                project_id=p392.id,
                actor_id=users["OWNER"].id,
                action="PROJECT_CLOSED",
                entity_type="Project",
                entity_id=p392.id,
                previous_value={"status": "ACTIVE"},
                new_value={"status": "COMPLETED", "lifecycle_stage": "CLOSED"},
                rationale="All 12 units closed, senior debt paid off with BofA, and waterfall distributions cleared.",
                occurred_at=datetime(2025, 2, 15, 14, 0, tzinfo=UTC),
            )
            db.add(ae1)

        db.commit()
        print("✅ Database seeding completed successfully!")

    except Exception as e:
        db.rollback()
        print(f"❌ Error during seed: {e}")
        raise
    finally:
        db.close()


if __name__ == "__main__":
    seed_database()
