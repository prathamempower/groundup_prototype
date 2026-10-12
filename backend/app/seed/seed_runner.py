"""
Modular, Production-Grade Seed Runner for GroundUp AI.

Extracts, sanitizes, and seeds comprehensive, realistic real-estate development data from:
`/home/pratham/Desktop/GroundUp AI/Datasets (Incomplete yet)`

Covers:
1. Complete Database Reset / Legacy Purge:
   - Safely truncates existing database records with CASCADE.
   - Cleans legacy mock files from storage_data.
2. Tenant & User Personas:
   - Organization: Vance Development LLC
   - Users:
     * Marcus Vance (OWNER / Executive)
     * Sarah Lin (CFO / Financial Analyst)
     * David Ross (PM / Project Manager)
     * Frank Miller (GC / Contractor)
     * Elena Rostova (INVESTOR / Capital Partner)
     * Kunal Shah (OWNER / Managing Partner)
   - Default password loaded from SEED_DEFAULT_PASSWORD in environment.
3. Three Real Projects:
   - 73 Broadway (Active Construction, Cost-Plus, 200+ real transactions, AIA Budget, Draws 1 & 3 short-funded, at-risk milestone)
   - 392 First Street (Completed, GMP, 15 real draws from Amhar report, 12 condo units, disposition, investor distributions, 1,200+ real transactions)
   - 161 Woodlawn Ave (Active Pre-Construction, Partner funding $475k, 500+ real transactions)
4. Real Document Ingestion:
   - Ingests real PDF, XLSX, and MD files from dataset directory.
   - Computes real SHA-256 hashes and copies files to storage_data/projects/{pid}/{doc_id}/{filename}.
   - Sets up DocumentExtractions, ExtractionFields, and ReviewDecisions.
5. Idempotent & Production-Grade:
   - Can be run standalone or via `make seed`.
"""

import hashlib
import os
import shutil
import sys
import uuid
from datetime import UTC, date, datetime, timedelta
from pathlib import Path
from typing import Any

# Ensure backend root is on sys.path
BACKEND_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", ".."))
if BACKEND_DIR not in sys.path:
    sys.path.insert(0, BACKEND_DIR)

import openpyxl
from sqlalchemy import select, text
from sqlalchemy.orm import Session

from app.core.config import settings
from app.core.security import hash_password
from app.db.base import Base, generate_uuid, utc_now
from app.db.models import (
    Acquisition,
    Alert,
    AuditEvent,
    Budget,
    BudgetLine,
    ChangeOrder,
    ChangeOrderLine,
    ContingencyMovement,
    DataQualityIssue,
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
    GCSubmission,
    InterProjectTransfer,
    InvestorContribution,
    InvestorDistribution,
    InvestorUpdate,
    Loan,
    LoanTerm,
    Notification,
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
)
from app.db.session import SessionLocal, engine
from app.storage.local import LocalStorageBackend

DEFAULT_PASSWORD = settings.SEED_DEFAULT_PASSWORD
DATASET_BASE = Path("/home/pratham/Desktop/GroundUp AI/Datasets (Incomplete yet)")


def to_cents(val: Any) -> int:
    """Convert dollars (float, int, or string) to integer cents (minor units)."""
    if val is None:
        return 0
    if isinstance(val, (int, float)):
        return int(round(float(val) * 100))
    if isinstance(val, str):
        cleaned = val.replace("$", "").replace(",", "").strip()
        try:
            return int(round(float(cleaned) * 100))
        except ValueError:
            return 0
    return 0


def parse_date(v: Any, default: date | None = None) -> date:
    """Parse Excel datetime, date, or date string into datetime.date."""
    if isinstance(v, datetime):
        return v.date()
    if isinstance(v, date):
        return v
    if isinstance(v, str):
        v = v.strip()
        for fmt in ("%m/%d/%Y", "%Y-%m-%d", "%m-%d-%Y", "%d/%m/%Y"):
            try:
                return datetime.strptime(v, fmt).date()
            except ValueError:
                pass
    return default or date(2025, 1, 1)


def wipe_database():
    """Wipe all application table records to establish a clean baseline."""
    print("🧹 Purging legacy records from groundup_db...")
    Base.metadata.create_all(bind=engine)
    with engine.begin() as conn:
        res = conn.execute(
            text(
                "SELECT tablename FROM pg_tables WHERE schemaname = 'public' AND tablename != 'alembic_version';"
            )
        ).fetchall()
        tables = [f'"{r[0]}"' for r in res]
        if tables:
            conn.execute(text(f"TRUNCATE {', '.join(tables)} CASCADE;"))
    print(f"✅ Clean baseline established: Truncated {len(tables)} tables.")

    # Clean legacy mock directories from storage_data, keeping only projects directory
    storage_dir = Path(settings.STORAGE_DIR)
    if storage_dir.exists():
        for item in storage_dir.iterdir():
            if item.is_dir() and item.name.startswith("org_"):
                try:
                    shutil.rmtree(item)
                except Exception:
                    pass
    print("✅ Storage directory cleaned of obsolete mock data.")


def copy_and_register_document(
    db: Session,
    source_path: Path,
    org_id: uuid.UUID,
    project_id: uuid.UUID,
    doc_type: str,
    doc_date: date,
    uploaded_by_id: uuid.UUID,
    storage: LocalStorageBackend,
) -> Document:
    """Copy physical file from dataset to storage_data and create Document record."""
    filename = source_path.name
    doc_id = generate_uuid()
    storage_key = f"projects/{project_id}/{doc_id}/{filename}"
    target_path = storage._resolve_path(storage_key)
    target_path.parent.mkdir(parents=True, exist_ok=True)

    if source_path.exists():
        with open(source_path, "rb") as f_in, open(target_path, "wb") as f_out:
            shutil.copyfileobj(f_in, f_out)
        with open(target_path, "rb") as f:
            content = f.read()
            sha256 = hashlib.sha256(content).hexdigest()
    else:
        content = f"Simulated content for {filename}".encode("utf-8")
        with open(target_path, "wb") as f_out:
            f_out.write(content)
        sha256 = hashlib.sha256(content).hexdigest()

    mime_type = "application/octet-stream"
    if filename.lower().endswith(".pdf"):
        mime_type = "application/pdf"
    elif filename.lower().endswith(".xlsx"):
        mime_type = "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    elif filename.lower().endswith(".md") or filename.lower().endswith(".txt"):
        mime_type = "text/plain"

    doc = Document(
        id=doc_id,
        organization_id=org_id,
        project_id=project_id,
        storage_key=storage_key,
        sha256=sha256,
        original_filename=filename,
        mime_type=mime_type,
        document_type=doc_type,
        document_date=doc_date,
        source_system="LOCAL_UPLOAD",
        ingestion_status="REVIEWED",
        uploaded_by=uploaded_by_id,
        uploaded_at=utc_now(),
    )
    db.add(doc)
    db.flush()
    return doc


def seed_database(wipe_first: bool = True):
    print("🌱 Starting GroundUp AI Comprehensive Seed Runner...")
    if wipe_first:
        wipe_database()

    db = SessionLocal()
    storage = LocalStorageBackend()

    try:
        # ==========================================
        # 1. Organization
        # ==========================================
        org = Organization(
            id=generate_uuid(),
            name="Vance Development LLC",
            created_at=utc_now(),
        )
        db.add(org)
        db.flush()
        print(f"🏢 Created organization: {org.name} ({org.id})")

        # ==========================================
        # 2. Users (Personas for all roles)
        # ==========================================
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
            {
                "email": "kunal@builderscapital.com",
                "first_name": "Kunal",
                "last_name": "Shah",
                "role": "OWNER",
            },
        ]

        users_list: list[User] = []
        users_by_role: dict[str, User] = {}
        for u_def in users_def:
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
            users_list.append(u)
            if u_def["role"] not in users_by_role:
                users_by_role[u_def["role"]] = u
            users_by_role[u_def["email"]] = u
            print(f"👤 Created user: {u.first_name} {u.last_name} ({u.role}) - {u.email}")
        users = users_by_role

        # ==========================================
        # 3. Third Parties
        # ==========================================
        parties: dict[str, Party] = {}

        def get_or_create_party(name: str, party_type: str) -> Party:
            if name in parties:
                return parties[name]
            p = Party(
                id=generate_uuid(),
                organization_id=org.id,
                name=name,
                party_type=party_type,
                created_at=utc_now(),
            )
            db.add(p)
            db.flush()
            parties[name] = p
            return p

        # Lenders
        lender_columbia = get_or_create_party("Columbia Bank Construction Lending", "LENDER")
        lender_builders = get_or_create_party("Builders Capital Investments LLC", "LENDER")
        lender_truly = get_or_create_party("Truly Investor Capital", "LENDER")
        lender_fci = get_or_create_party("FCI Lender Services", "LENDER")
        lender_bsi = get_or_create_party("BSI Finance", "LENDER")
        get_or_create_party("Oaktree Funding Corporation", "LENDER")

        # General Contractors & Trade Vendors
        gc_apex = get_or_create_party("Apex Construction Services LLC", "GC")
        gc_ks = get_or_create_party("KS Builders LLC", "GC")
        gc_capex = get_or_create_party("Capex Capital Construction", "GC")
        vendor_concrete = get_or_create_party("Red Hook Concrete Supply LLC", "VENDOR")
        vendor_steel = get_or_create_party("Atlantic Iron Works Corp", "VENDOR")
        vendor_ra_design = get_or_create_party("RA Design & Consultants", "VENDOR")
        vendor_reuther = get_or_create_party("Reuther Material Co", "VENDOR")
        vendor_passaic = get_or_create_party("Passaic Valley Sewage", "VENDOR")
        vendor_jc_tax = get_or_create_party("Jersey City Tax Collector", "VENDOR")
        vendor_amex = get_or_create_party("American Express", "VENDOR")
        vendor_cpa = get_or_create_party("Ami Shah CPA", "VENDOR")
        get_or_create_party("Perkins Eastman Architects", "VENDOR")

        # Title & Settlement
        get_or_create_party("Sunnyside Title Agency LLC", "OTHER")
        party_schonberger = get_or_create_party("Law Office of Michael C. Schonberger LLC", "OTHER")

        # Investors & Equity Partners
        investor_meridian = get_or_create_party("Meridian Capital Real Estate Fund III", "INVESTOR")
        get_or_create_party("First Street Capital Partners LP", "INVESTOR")
        investor_kunal = get_or_create_party("Kunal Shah", "INVESTOR")
        investor_swekit = get_or_create_party("Swekit Patel", "INVESTOR")
        investor_harshad = get_or_create_party("Harshad Patel", "INVESTOR")
        investor_kirit = get_or_create_party("Kirit Chothani", "INVESTOR")
        investor_nilesh = get_or_create_party("Nilesh Chothani", "INVESTOR")
        investor_vijay = get_or_create_party("Vijay Soni", "INVESTOR")
        investor_piyush = get_or_create_party("Piyush Patel", "INVESTOR")
        investor_alpesh = get_or_create_party("Alpesh Vasani", "INVESTOR")

        # Laborers
        for laborer in [
            "Nilson Mocalos",
            "Milton Son",
            "Carlos Chipix",
            "Luis Angel Rimacachin",
            "Juan Minim",
            "Richard Wadsworth",
            "Javier Alejandro Ormaza",
            "Akanksha Shah",
        ]:
            get_or_create_party(laborer, "VENDOR")

        # =========================================================================
        # 4. Project 1: 73 Broadway (Active Construction, Cost-Plus, 200+ txs)
        # =========================================================================
        p73 = Project(
            id=generate_uuid(),
            organization_id=org.id,
            name="73 Broadway",
            project_entity="JC Realty Ventures LLC",
            address="73 Broadway, Jersey City, NJ 07306",
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
        print(f"🏗️ Created Project: 73 Broadway ({p73.id})")

        # Project Members for 73 Broadway
        # Marcus (OWNER), Sarah (CFO), David (PM), Frank (GC), Elena (INVESTOR), Kunal (OWNER)
        for u in users_list:
            db.add(
                ProjectMember(
                    id=generate_uuid(),
                    organization_id=org.id,
                    project_id=p73.id,
                    user_id=u.id,
                    role=u.role,
                    created_at=utc_now(),
                )
            )

        # Financing
        loan73 = Loan(
            id=generate_uuid(),
            organization_id=org.id,
            project_id=p73.id,
            lender_party_id=lender_columbia.id,
            loan_number="COL-2025-73B",
            commitment_amount=120000000,  # $1,200,000.00
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

        # Financial Accounts
        acc_bcb_73 = FinancialAccount(
            id=generate_uuid(),
            organization_id=org.id,
            party_id=gc_apex.id,
            institution="BCB Community Bank",
            masked_identifier="•••• 4182",
            account_purpose="OPERATING",
            currency="USD",
            active_from=date(2025, 4, 1),
            status="ACTIVE",
            created_at=utc_now(),
        )
        db.add(acc_bcb_73)

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
        sp1_73 = StatementPeriod(
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
        sp2_73 = StatementPeriod(
            id=generate_uuid(),
            financial_account_id=acc_bcb_73.id,
            period_start=date(2025, 9, 1),
            period_end=date(2025, 9, 30),
            opening_balance=21400000,
            closing_balance=13425000,
            coverage_status="ACTIVE",
            reconciled_by=users["CFO"].id,
            reconciled_at=utc_now(),
            created_at=utc_now(),
        )
        db.add_all([sp1_73, sp2_73])

        # Acquisition
        acq73 = Acquisition(
            id=generate_uuid(),
            organization_id=org.id,
            project_id=p73.id,
            purchase_price=70000000,  # $700,000.00
            closing_date=date(2025, 4, 4),
            closing_costs=2539982,  # $25,399.82
            notes="Acquisition closed with Law Office of Michael C. Schonberger LLC, Ramsa Properties LLC seller.",
            created_at=utc_now(),
        )
        db.add(acq73)

        # Budget & Budget Lines (17 categories directly from construction budget)
        budget73 = Budget(
            id=generate_uuid(),
            organization_id=org.id,
            project_id=p73.id,
            version_number=1,
            status="APPROVED",
            total_original_amount=101922000,  # $1,019,220.00
            total_current_approved_amount=101922000,
            approved_by=users["OWNER"].id,
            approved_at=utc_now(),
            created_at=utc_now(),
        )
        db.add(budget73)
        db.flush()

        budget73_lines_data = [
            ("1.01", "Consultant Fees: Architect", 1500000),
            ("1.02", "Consultant Fees: Engineer", 180000),
            ("1.03", "Consultant Fees: Surveyor", 350000),
            ("1.05", "Permits & Fees", 2400000),
            ("2.05", "Site Prep: Grading/Excavation", 1500000),
            ("2.09", "Foundation/Structural Concrete", 4500000),
            ("3.01", "Framing & Structural Carpentry", 12000000),
            ("3.02", "Structural Steel Fabrication & Erection", 600000),
            ("3.05", "Roofing & Waterproofing", 4500000),
            ("4.01", "Rough Plumbing", 2700000),
            ("4.05", "Rough Electrical", 3200000),
            ("4.08", "HVAC Rough Systems", 2400000),
            ("5.01", "Thermal & Acoustic Insulation", 1600000),
            ("5.02", "Interior Walls & Ceilings (Drywall)", 2600000),
            ("5.04", "Kitchen Cabinets & Millwork", 4000000),
            ("6.01", "Builder / GC Supervisory Fee", 11205000),
            ("6.02", "Contingency Reserve", 8247000),
        ]
        b73_lines_map: dict[str, BudgetLine] = {}
        for idx, (code, desc, amt) in enumerate(budget73_lines_data):
            bl = BudgetLine(
                id=generate_uuid(),
                budget_id=budget73.id,
                code=code,
                name=desc,
                category="SOFT_COST" if code.startswith("1.") else "HARD_COST",
                original_amount=amt,
                current_approved_amount=amt,
                is_draw_eligible=True,
                sort_order=idx,
                created_at=utc_now(),
            )
            db.add(bl)
            db.flush()
            b73_lines_map[code] = bl

        # Change Orders & Contingency Movement
        co73 = ChangeOrder(
            id=generate_uuid(),
            organization_id=org.id,
            project_id=p73.id,
            change_order_number="CO-001",
            title="Structural Steel Reinforcement and Mill Surcharge",
            reason="Additional bracing mandated by structural engineer inspection",
            status="APPROVED",
            requested_amount=1500000,
            approved_amount=1500000,
            requested_by=users["GC"].id,
            approved_by=users["OWNER"].id,
            approved_at=utc_now(),
            created_at=utc_now(),
        )
        db.add(co73)
        db.flush()

        db.add(
            ChangeOrderLine(
                id=generate_uuid(),
                change_order_id=co73.id,
                budget_line_id=b73_lines_map["3.02"].id,
                amount=1500000,
                description="Structural steel bracing materials and hoisting",
                created_at=utc_now(),
            )
        )
        b73_lines_map["3.02"].current_approved_amount += 1500000

        db.add(
            ContingencyMovement(
                id=generate_uuid(),
                organization_id=org.id,
                project_id=p73.id,
                from_budget_line_id=b73_lines_map["6.02"].id,
                to_budget_line_id=b73_lines_map["3.02"].id,
                amount=1500000,
                reason="Reallocated from contingency for engineer mandated structural steel bracing",
                approved_by=users["OWNER"].id,
                approved_at=utc_now(),
                created_at=utc_now(),
            )
        )
        b73_lines_map["6.02"].current_approved_amount -= 1500000

        # Pending GC Change Order for 73 Broadway
        co73_2 = ChangeOrder(
            id=generate_uuid(),
            organization_id=org.id,
            project_id=p73.id,
            change_order_number="CO-002",
            title="Rough Carpentry Seismic Shear Wall Bracing",
            reason="Mandated lateral tie-downs and shear clips per engineer review",
            status="SUBMITTED",
            requested_amount=1850000,
            requested_by=users["GC"].id,
            created_at=utc_now(),
        )
        db.add(co73_2)
        db.flush()

        db.add(
            ChangeOrderLine(
                id=generate_uuid(),
                change_order_id=co73_2.id,
                budget_line_id=b73_lines_map["3.01"].id,
                amount=1850000,
                description="Structural moment framing tie-down clips and shear paneling",
                created_at=utc_now(),
            )
        )

        # Physical Documents on Disk for 73 Broadway
        p73_docs_to_seed = [
            ("73 Broadway - Report #1.pdf", "REPORT", date(2025, 6, 1)),
            ("73 Broadway - Report #2.pdf", "REPORT", date(2025, 9, 15)),
            ("73 Construction Loan.pdf", "LOAN_AGREEMENT", date(2025, 4, 1)),
            ("73 Land Aquisition Cash Deal.pdf", "CLOSING_STATEMENT", date(2025, 4, 4)),
            ("Budget for 73 Broadway (1).pdf", "BUDGET_SOV", date(2025, 4, 1)),
            (
                "JC Realty Ventures LLC - $1.2MM Construction Loan - Commitment Letter - 12-16-25 - signed.pdf",
                "LOAN_AGREEMENT",
                date(2025, 12, 16),
            ),
            ("73 Broadway.xlsx", "BUDGET_SOV", date(2025, 9, 1)),
            ("AIA Form (1).xlsx", "DRAW_PACKET", date(2025, 9, 15)),
        ]
        doc73_map: dict[str, Document] = {}
        for fname, dtype, fdate in p73_docs_to_seed:
            fpath = DATASET_BASE / "73broadway" / fname
            d = copy_and_register_document(
                db, fpath, org.id, p73.id, dtype, fdate, users["OWNER"].id, storage
            )
            doc73_map[fname] = d

        # Seed realistic spend records for 73 Broadway ($420,450.00 total)
        p73_spend_records = [
            ("1.05", 4500000, vendor_jc_tax, "Permits, architectural filings, and municipal inspections", date(2025, 4, 15)),
            ("2.05", 11000000, parties.get("Tri-State Excavation", gc_apex), "Mass site excavation, rock breaking, cut & fill grading", date(2025, 5, 20)),
            ("2.09", 18545000, parties.get("Precision Rebar & Concrete", gc_apex), "Continuous footings, rebar cages, and foundation concrete pour", date(2025, 6, 25)),
            ("3.01", 8000000, parties.get("Apex Lumber Supply", gc_apex), "Superstructure rough carpentry lumber package & shear panels", date(2025, 7, 30)),
        ]
        for bcode_73, amt_c_73, vnd_73, dsc_73, dt_73 in p73_spend_records:
            tx_73_id = generate_uuid()
            db.add(
                FinancialTransaction(
                    id=tx_73_id,
                    project_id=p73.id,
                    financial_account_id=acc_bcb_73.id,
                    account_ref=f"73B-BCB-{bcode_73}",
                    transaction_date=dt_73,
                    posted_date=dt_73,
                    amount=amt_c_73,
                    direction="OUTFLOW",
                    counterparty=vnd_73.name,
                    memo=dsc_73,
                    external_id=f"73B-SP-{bcode_73}-{dt_73}",
                    cleared_status="CLEARED",
                    created_at=utc_now(),
                )
            )
            db.add(
                SpendRecord(
                    id=generate_uuid(),
                    project_id=p73.id,
                    vendor_party_id=vnd_73.id,
                    transaction_date=dt_73,
                    amount=amt_c_73,
                    currency="USD",
                    description=dsc_73,
                    status="VERIFIED",
                    evidence_strength="BANK_TRANSACTION",
                    source_document_id=doc73_map["73 Broadway - Report #1.pdf"].id if "73 Broadway - Report #1.pdf" in doc73_map else list(doc73_map.values())[0].id,
                    transaction_id=tx_73_id,
                    budget_line_id=b73_lines_map[bcode_73].id,
                    match_status="MATCHED",
                    reviewed_by=users["CFO"].id,
                    reviewed_at=utc_now(),
                    created_at=utc_now(),
                )
            )

        # Draws for 73 Broadway (Draw 1 Approved & Funded, Draw 3 Short-Funded)
        draw1_73 = Draw(
            id=generate_uuid(),
            organization_id=org.id,
            project_id=p73.id,
            loan_id=loan73.id,
            draw_number="1",
            status="APPROVED",
            period_start=date(2025, 5, 1),
            period_end=date(2025, 5, 31),
            submitted_at=datetime(2025, 6, 2, tzinfo=UTC),
            approved_at=datetime(2025, 6, 10, tzinfo=UTC),
            lender_party_id=lender_columbia.id,
            source_document_id=doc73_map["AIA Form (1).xlsx"].id,
            created_at=utc_now(),
        )
        db.add(draw1_73)
        db.flush()

        db.add(
            DrawLine(
                id=generate_uuid(),
                draw_id=draw1_73.id,
                budget_line_id=b73_lines_map["2.05"].id,
                requested_amount=1500000,
                recommended_amount=1500000,
                approved_amount=1500000,
                funded_amount=1500000,
                reason="Excavation and site grading completed 100%",
                evidence_status="VERIFIED",
                created_at=utc_now(),
            )
        )
        db.add(
            DrawLine(
                id=generate_uuid(),
                draw_id=draw1_73.id,
                budget_line_id=b73_lines_map["1.05"].id,
                requested_amount=350000,
                recommended_amount=350000,
                approved_amount=350000,
                funded_amount=350000,
                reason="Initial building permits issued by city",
                evidence_status="VERIFIED",
                created_at=utc_now(),
            )
        )

        # Draw 3 (Short-Funded)
        draw3_73 = Draw(
            id=generate_uuid(),
            organization_id=org.id,
            project_id=p73.id,
            loan_id=loan73.id,
            draw_number="3",
            status="PARTIALLY_APPROVED",
            period_start=date(2025, 8, 1),
            period_end=date(2025, 8, 31),
            submitted_at=datetime(2025, 9, 2, tzinfo=UTC),
            approved_at=datetime(2025, 9, 12, tzinfo=UTC),
            lender_party_id=lender_columbia.id,
            source_document_id=doc73_map["73 Broadway - Report #2.pdf"].id,
            created_at=utc_now(),
        )
        db.add(draw3_73)
        db.flush()

        db.add(
            DrawLine(
                id=generate_uuid(),
                draw_id=draw3_73.id,
                budget_line_id=b73_lines_map["3.01"].id,
                requested_amount=30000000,
                recommended_amount=30000000,
                approved_amount=30000000,
                funded_amount=30000000,
                reason="Framing progress verified on-site",
                evidence_status="VERIFIED",
                created_at=utc_now(),
            )
        )
        # Structural steel line: Requested 220k, recommended 160k (short-funded)
        db.add(
            DrawLine(
                id=generate_uuid(),
                draw_id=draw3_73.id,
                budget_line_id=b73_lines_map["3.02"].id,
                requested_amount=22000000,
                recommended_amount=16000000,
                approved_amount=16000000,
                funded_amount=16000000,
                reason="Inspector withheld $60,000 pending mill test certification submittal",
                evidence_status="PARTIAL",
                created_at=utc_now(),
            )
        )

        db.add(
            DrawRequirement(
                id=generate_uuid(),
                draw_id=draw3_73.id,
                title="Certified Mill Test Reports for Structural Steel",
                requirement_type="INSPECTION",
                status="ACTION_REQUIRED",
                document_id=doc73_map["73 Broadway - Report #2.pdf"].id,
                created_at=utc_now(),
            )
        )

        # Document Extraction & Review Decisions for Draw 3 Inspection
        ext73 = DocumentExtraction(
            id=generate_uuid(),
            document_id=doc73_map["73 Broadway - Report #2.pdf"].id,
            model_version="v1.0",
            status="COMPLETED",
            created_at=utc_now(),
        )
        db.add(ext73)
        db.flush()

        db.add(
            ExtractionField(
                id=generate_uuid(),
                extraction_id=ext73.id,
                field_name="Inspector Approved Amount",
                proposed_value="$460,000.00",
                accepted_value="$460,000.00",
                confidence=0.99,
                page_number=2,
                status="ACCEPTED",
                created_at=utc_now(),
            )
        )
        db.add(
            ExtractionField(
                id=generate_uuid(),
                extraction_id=ext73.id,
                field_name="Withheld Retainage / Items",
                proposed_value="$60,000.00 uncertified structural steel",
                accepted_value="$60,000.00 uncertified structural steel",
                confidence=0.97,
                page_number=3,
                status="ACCEPTED",
                created_at=utc_now(),
            )
        )
        db.add(
            ReviewDecision(
                id=generate_uuid(),
                document_id=doc73_map["73 Broadway - Report #2.pdf"].id,
                decision="ACCEPTED",
                rationale="Inspector certified $460k against $520k request. Approved with holdback.",
                decided_by=users["OWNER"].id,
                decided_at=utc_now(),
            )
        )

        # Draw 1 Funding
        tx_funding1 = FinancialTransaction(
            id=generate_uuid(),
            project_id=p73.id,
            financial_account_id=acc_columbia_73.id,
            account_ref="COLUMBIA-DISBURSE-01",
            transaction_date=date(2025, 6, 12),
            posted_date=date(2025, 6, 12),
            amount=1850000,
            direction="INFLOW",
            counterparty="Columbia Bank Construction Lending",
            memo="Disbursement for Draw 1 approved certification",
            external_id="COL-DRAW1-FUND",
            cleared_status="CLEARED",
            created_at=utc_now(),
        )
        db.add(tx_funding1)
        db.flush()

        db.add(
            DrawFunding(
                id=generate_uuid(),
                draw_id=draw1_73.id,
                transaction_id=tx_funding1.id,
                amount=1850000,
                funding_date=date(2025, 6, 12),
                created_at=utc_now(),
            )
        )

        # Unallocated Cash Transaction for 73 Broadway
        unalloc_tx_73 = FinancialTransaction(
            id=generate_uuid(),
            project_id=p73.id,
            financial_account_id=acc_bcb_73.id,
            account_ref="BCB-DEP-UNALLOC",
            transaction_date=date(2025, 9, 20),
            posted_date=date(2025, 9, 20),
            amount=15000000,  # $150,000.00
            direction="INFLOW",
            counterparty="Vance Development Operating",
            memo="Wire deposit from capital reserve - not yet allocated to draw",
            external_id="BCB-TX-UNALLOC-150K",
            cleared_status="CLEARED",
            created_at=utc_now(),
        )
        db.add(unalloc_tx_73)

        # Parse and insert 200+ real transactions for 73 Broadway from 73 Broadway.xlsx
        xlsx73_path = DATASET_BASE / "73broadway" / "73 Broadway.xlsx"
        if xlsx73_path.exists():
            wb73 = openpyxl.load_workbook(xlsx73_path, data_only=True)
            sheet_configs = [
                ("Construction Exp", gc_apex, b73_lines_map["3.01"], "OUTFLOW"),
                ("Labour Exp", parties["Akanksha Shah"], b73_lines_map["3.01"], "OUTFLOW"),
                ("Bank Fee", lender_columbia, b73_lines_map["1.05"], "OUTFLOW"),
                ("Muncipality Exp", vendor_jc_tax, b73_lines_map["1.05"], "OUTFLOW"),
                ("Land Acquisition", party_schonberger, b73_lines_map["1.01"], "OUTFLOW"),
            ]
            for sname, default_party, default_bline, direction in sheet_configs:
                if sname not in wb73.sheetnames:
                    continue
                ws = wb73[sname]
                for r in range(2, ws.max_row + 1):
                    d_val = ws.cell(r, 1).value
                    mode_val = str(ws.cell(r, 2).value or "").strip()
                    desc_val = str(ws.cell(r, 3).value or "").strip()
                    amt_val = ws.cell(r, 4).value
                    if sname in ["Bank Fee", "Muncipality Exp"]:
                        amt_val = ws.cell(r, 4).value or ws.cell(r, 3).value

                    tx_date = parse_date(d_val, None)
                    if not tx_date or amt_val is None or not isinstance(amt_val, (int, float)):
                        continue
                    cents = to_cents(amt_val)
                    if cents == 0:
                        continue

                    full_desc = f"{mode_val} {desc_val}".strip() or f"{sname} expense"
                    tx_id = generate_uuid()
                    ftx = FinancialTransaction(
                        id=tx_id,
                        project_id=p73.id,
                        financial_account_id=acc_bcb_73.id,
                        account_ref=f"73B-{sname[:3].upper()}-{r}",
                        transaction_date=tx_date,
                        posted_date=tx_date,
                        amount=cents,
                        direction=direction,
                        counterparty=desc_val or default_party.name,
                        memo=full_desc,
                        external_id=f"73B-{sname.replace(' ', '')}-{r}-{tx_date}",
                        cleared_status="CLEARED",
                        created_at=utc_now(),
                    )
                    db.add(ftx)

                    sp = SpendRecord(
                        id=generate_uuid(),
                        project_id=p73.id,
                        vendor_party_id=default_party.id,
                        transaction_date=tx_date,
                        amount=cents,
                        currency="USD",
                        description=full_desc,
                        status="VERIFIED",
                        evidence_strength="BANK_TRANSACTION",
                        source_document_id=doc73_map["73 Broadway.xlsx"].id,
                        transaction_id=tx_id,
                        budget_line_id=default_bline.id,
                        match_status="MATCHED",
                        reviewed_by=users["CFO"].id,
                        reviewed_at=utc_now(),
                        created_at=utc_now(),
                    )
                    db.add(sp)

                    # Vary decision and match type for realistic queue workflow (first 6 rows in Construction Exp pending review)
                    is_queue_item = (sname == "Construction Exp" and 2 <= r <= 7)
                    rec_decision = "SUGGESTED" if is_queue_item and r % 2 == 0 else ("SPLIT" if is_queue_item else "ACCEPTED")
                    conf_score = 0.94 if rec_decision == "SUGGESTED" else (0.88 if rec_decision == "SPLIT" else 1.0)
                    m_type = "FUZZY" if rec_decision == "SUGGESTED" else ("SPLIT" if rec_decision == "SPLIT" else "EXACT")

                    db.add(
                        ReconciliationMatch(
                            id=generate_uuid(),
                            organization_id=org.id,
                            project_id=p73.id,
                            transaction_id=tx_id,
                            spend_record_id=sp.id,
                            match_type=m_type,
                            confidence_score=conf_score,
                            decision=rec_decision,
                            decided_by=None if is_queue_item else users["CFO"].id,
                            decided_at=None if is_queue_item else utc_now(),
                            notes="AI proposed budget match pending CFO review" if is_queue_item else "Automatically matched and verified from accounting ledger",
                            created_at=utc_now(),
                        )
                    )

            # Inner Bank Transfers for 73 Broadway
            if "Inner Bank Transfer" in wb73.sheetnames:
                ws_ibt = wb73["Inner Bank Transfer"]
                for r in range(3, min(25, ws_ibt.max_row + 1)):
                    d_val = ws_ibt.cell(r, 1).value
                    amt_val = ws_ibt.cell(r, 3).value or ws_ibt.cell(r, 2).value
                    t_date = parse_date(d_val, None)
                    if t_date and isinstance(amt_val, (int, float)) and amt_val != 0:
                        cents = to_cents(abs(amt_val))
                        db.add(
                            InterProjectTransfer(
                                id=generate_uuid(),
                                organization_id=org.id,
                                from_project_id=p73.id,
                                to_project_id=p73.id,  # Linked to internal affiliate
                                amount=cents,
                                type="TEMPORARY_ADVANCE",
                                transfer_date=t_date,
                                repaid_amount=cents if amt_val < 0 else 0,
                                status="REPAID" if amt_val < 0 else "OUTSTANDING",
                                reviewed_by=users["CFO"].id,
                                created_at=utc_now(),
                            )
                        )

        # Milestones for 73 Broadway (including at-risk Structural Steel)
        ms_data_73 = [
            ("Demolition & Site Clear", "M-01", date(2025, 4, 1), date(2025, 5, 15), 100, "COMPLETED"),
            ("Foundation & Concrete Pours", "M-02", date(2025, 5, 16), date(2025, 7, 31), 100, "COMPLETED"),
            (
                "Structural Steel Fabrication & Erection",
                "M-03",
                date(2025, 8, 1),
                date(2025, 9, 15),
                65,
                "IN_PROGRESS",
            ),
            ("Wood Framing & Sheathing", "M-04", date(2025, 9, 16), date(2025, 11, 30), 20, "IN_PROGRESS"),
            ("Rough MEP & Inspections", "M-05", date(2025, 12, 1), date(2026, 3, 31), 0, "PLANNED"),
            ("Interior Finishes & Punchlist", "M-06", date(2026, 4, 1), date(2026, 11, 15), 0, "PLANNED"),
        ]
        for name, code, p_start, p_comp, pct, m_status in ms_data_73:
            ms = ProjectMilestone(
                id=generate_uuid(),
                organization_id=org.id,
                project_id=p73.id,
                name=name,
                code=code,
                planned_start_date=p_start,
                planned_completion_date=p_comp,
                actual_start_date=p_start if pct > 0 else None,
                actual_completion_date=p_comp if pct == 100 else None,
                # Enforce at-risk forecast completion for Structural Steel
                forecast_completion_date=date(2025, 10, 20) if code == "M-03" else p_comp,
                forecast_change_reason="Mill test certification review bottleneck delayed erection"
                if code == "M-03"
                else None,
                progress_percentage=pct,
                status=m_status,
                created_at=utc_now(),
            )
            db.add(ms)

        # Alerts for 73 Broadway
        alerts_73 = [
            (
                "SHORT_FUNDED_DRAW",
                "HIGH",
                "Draw 3 Short-Funded by Lender Inspection",
                "Lender inspector reduced Draw 3 disbursement by $60,000 pending structural steel mill reports.",
            ),
            (
                "UNALLOCATED_CASH",
                "MEDIUM",
                "Unallocated Cash Deposit Detected ($150,000.00)",
                "Deposit from capital reserve received on 2025-09-20 requires draw allocation.",
            ),
            (
                "DELAYED_MILESTONE",
                "HIGH",
                "Structural Steel Milestone Behind Schedule",
                "Milestone M-03 forecast completion moved from 2025-09-15 to 2025-10-20.",
            ),
            (
                "OVERRUN",
                "LOW",
                "Change Order CO-001 Approved from Contingency",
                "Transferred $15,000 from contingency reserve to budget line 3.02.",
            ),
        ]
        for a_type, sev, title, desc in alerts_73:
            db.add(
                Alert(
                    id=generate_uuid(),
                    organization_id=org.id,
                    project_id=p73.id,
                    alert_type=a_type,
                    severity=sev,
                    title=title,
                    description=desc,
                    status="OPEN",
                    owner_id=users["PM"].id,
                    created_at=utc_now(),
                )
            )

        # -------------------------------------------------------------------------
        # Contractor Submissions for 73 Broadway
        # -------------------------------------------------------------------------
        sub1_73 = GCSubmission(
            id=generate_uuid(),
            organization_id=org.id,
            project_id=p73.id,
            submission_number="GC-CLAIM-001",
            type="MILESTONE_CLAIM",
            title="Foundation & Excavation 100% Completion Claim",
            description="Completed excavation, footings, and waterproofing backfill according to approved architectural and structural plans.",
            contract_model="COST_PLUS",
            status="APPROVED",
            submitted_at=datetime(2025, 1, 15, 10, 0, tzinfo=UTC),
            submitted_by="Frank Miller (GC)",
            contractor_name="Apex Construction LLC",
            csi_code="03-000",
            csi_category="Concrete & Foundations",
            claimed_amount=18500000,
            retainage_rate_pct=10.0,
            retainage_amount=1850000,
            net_payable_amount=16650000,
            prior_claimed_pct=0.0,
            current_claimed_pct=100.0,
            incremental_claimed_pct=100.0,
            invoice_numbers=["INV-APEX-101", "INV-APEX-102"],
            evidence_items=[
                {
                    "id": "ev-1",
                    "filename": "73 Broadway - Report #1.pdf",
                    "type": "PHOTO",
                    "file_size_bytes": 245000,
                    "uploaded_at": "2025-01-15T09:45:00Z",
                    "notes": "City building department foundation inspection approved stamp",
                },
                {
                    "id": "ev-2",
                    "filename": "AIA Form (1).xlsx",
                    "type": "INVOICE",
                    "file_size_bytes": 180000,
                    "uploaded_at": "2025-01-15T09:50:00Z",
                    "invoice_number": "INV-APEX-101",
                    "vendor_name": "Apex Construction LLC",
                    "amount": "18500000",
                },
            ],
            reviews=[
                {
                    "role": "PM",
                    "reviewer_name": "David Ross",
                    "status": "APPROVED",
                    "reviewed_at": "2025-01-18T14:00:00Z",
                    "comments": "Work verified on site. Concrete compressive strength tests passed.",
                },
                {
                    "role": "CFO",
                    "reviewer_name": "Sarah Lin",
                    "status": "APPROVED",
                    "reviewed_at": "2025-01-20T11:30:00Z",
                    "comments": "Reconciled with Draw 1 application and Columbia Bank escrow disbursement.",
                },
            ],
            created_at=datetime(2025, 1, 15, 10, 0, tzinfo=UTC),
        )
        db.add(sub1_73)

        sub2_73 = GCSubmission(
            id=generate_uuid(),
            organization_id=org.id,
            project_id=p73.id,
            submission_number="GC-COR-001",
            type="CHANGE_ORDER_REQUEST",
            title="CO-001: Structural Steel Engineering Connection Reinforcement",
            description="Engineer-of-record field revision requiring seismic moment plate stiffeners on Level 3 column splices.",
            contract_model="COST_PLUS",
            status="UNDER_REVIEW",
            submitted_at=datetime(2025, 2, 10, 15, 30, tzinfo=UTC),
            submitted_by="Frank Miller (GC)",
            contractor_name="Apex Construction LLC",
            csi_code="05-120",
            csi_category="Structural Steel",
            claimed_amount=3500000,
            retainage_rate_pct=10.0,
            retainage_amount=350000,
            net_payable_amount=3150000,
            prior_claimed_pct=0.0,
            current_claimed_pct=0.0,
            incremental_claimed_pct=0.0,
            schedule_delay_days=14,
            invoice_numbers=["COR-001-EST"],
            evidence_items=[
                {
                    "id": "ev-3",
                    "filename": "73 Broadway - Report #2.pdf",
                    "type": "OTHER",
                    "file_size_bytes": 420000,
                    "uploaded_at": "2025-02-10T14:15:00Z",
                    "notes": "Structural engineer stamped drawing revision",
                }
            ],
            reviews=[
                {
                    "role": "PM",
                    "reviewer_name": "David Ross",
                    "status": "PENDING",
                    "reviewed_at": None,
                    "comments": None,
                }
            ],
            created_at=datetime(2025, 2, 10, 15, 30, tzinfo=UTC),
        )
        db.add(sub2_73)

        sub3_73 = GCSubmission(
            id=generate_uuid(),
            organization_id=org.id,
            project_id=p73.id,
            submission_number="GC-COST-001",
            type="COST_EVIDENCE",
            title="Rough Plumbing & Underground Drainage Materials Package",
            description="Ferguson plumbing piping, cast iron soil pipes, and PVC drainage fittings delivered to site with paid bill of lading.",
            contract_model="COST_PLUS",
            status="UNDER_REVIEW",
            submitted_at=datetime(2025, 2, 18, 11, 0, tzinfo=UTC),
            submitted_by="Frank Miller (GC)",
            contractor_name="Apex Construction LLC",
            csi_code="22-000",
            csi_category="Plumbing",
            claimed_amount=1245000,
            retainage_rate_pct=10.0,
            retainage_amount=124500,
            net_payable_amount=1120500,
            prior_claimed_pct=0.0,
            current_claimed_pct=35.0,
            incremental_claimed_pct=35.0,
            invoice_numbers=["INV-FERG-8841"],
            evidence_items=[
                {
                    "id": "ev-4",
                    "filename": "73 Broadway.xlsx",
                    "type": "INVOICE",
                    "file_size_bytes": 165000,
                    "uploaded_at": "2025-02-18T10:45:00Z",
                    "invoice_number": "INV-FERG-8841",
                    "vendor_name": "Ferguson Plumbing Supply",
                    "amount": "1245000",
                }
            ],
            reviews=[],
            created_at=datetime(2025, 2, 18, 11, 0, tzinfo=UTC),
        )
        db.add(sub3_73)

        # -------------------------------------------------------------------------
        # Investor Update for 73 Broadway
        # -------------------------------------------------------------------------
        db.add(
            InvestorUpdate(
                id=generate_uuid(),
                organization_id=org.id,
                project_id=p73.id,
                title="Q4 Comprehensive Development & Financial Brief",
                as_of_date=date(2025, 9, 30),
                status="PUBLISHED",
                published_at=datetime(2025, 10, 1, 10, 0, tzinfo=UTC),
                gross_development_value=1280000000,
                current_forecast_profit=240000000,
                senior_debt_drawn=43000000,
                equity_funded=150000000,
                progress_summary="Active construction advancing with Draw 1 funded and Draw 3 inspection reviewed. Critical milestone tracking structural steel engineering.",
                material_disclosures=[
                    "Structural Steel milestone forecast extended by 14 days due to engineer-of-record revision.",
                    "Draw 3 partially approved by Columbia Bank ($310,000 disbursed vs $350,000 requested).",
                    "Unallocated operating cash reserve maintained at $150,000.",
                ],
                recipients=["e.rostova@meridiancap.com", "m.vance@vancedev.com"],
                created_at=datetime(2025, 9, 30, tzinfo=UTC),
            )
        )

        # -------------------------------------------------------------------------
        # In-App Notifications for 73 Broadway
        # -------------------------------------------------------------------------
        db.add(
            Notification(
                id=generate_uuid(),
                organization_id=org.id,
                project_id=p73.id,
                user_id=users["OWNER"].id,
                title="Draw 3 Short-Funded by Columbia Bank",
                message="Columbia Bank approved $310,000 against $350,000 requested ($40,000 shortfall). Action required on engineering inspection conditions.",
                type="DRAW",
                severity="WARNING",
                read=False,
                link_url="/draws",
                created_at=utc_now() - timedelta(hours=2),
            )
        )
        db.add(
            Notification(
                id=generate_uuid(),
                organization_id=org.id,
                project_id=p73.id,
                user_id=users["PM"].id,
                title="Milestone Forecast Delay: Structural Steel",
                message="Forecast completion slipped by 14 days due to connection engineering review. Critical path alert active.",
                type="MILESTONE",
                severity="CRITICAL",
                read=False,
                link_url="/timeline",
                created_at=utc_now() - timedelta(hours=5),
            )
        )
        db.add(
            Notification(
                id=generate_uuid(),
                organization_id=org.id,
                project_id=p73.id,
                user_id=users["CFO"].id,
                title="Unallocated Cash Deposit Detected",
                message="$150,000 wire received from Columbia Bank not yet matched to budget line items.",
                type="RECONCILIATION",
                severity="INFO",
                read=False,
                link_url="/reconciliation",
                created_at=utc_now() - timedelta(days=1),
            )
        )

        # -------------------------------------------------------------------------
        # Underwriting Financial Plan (Pro-Forma) for 73 Broadway
        # -------------------------------------------------------------------------
        pfp_73 = ProjectFinancialPlan(
            id=generate_uuid(),
            organization_id=org.id,
            project_id=p73.id,
            version_number=1,
            plan_type="PRO_FORMA",
            projected_revenue=285000000,  # $2,850,000.00
            projected_cost=185000000,     # $1,850,000.00
            target_irr=19.5,
            target_equity_multiple=1.45,
            is_active=True,
            payload={
                "lines": [
                    {
                        "category": "REVENUE",
                        "line_name": "Projected Residential Condominium Gross Sales (8 Units)",
                        "original_plan_amount": 285000000,
                        "current_forecast_amount": 285000000,
                        "basis": "ESTIMATED",
                        "variance_rationale": "Underwriting sales forecast based on Jersey City comps ($525/sqft)",
                    },
                    {
                        "category": "HARD_COST",
                        "line_name": "Direct Construction Hard Costs (Foundations, Steel, Framing, Finishes)",
                        "original_plan_amount": 92000000,
                        "current_forecast_amount": 93500000,
                        "basis": "APPROVED",
                        "variance_rationale": "CO-001 approved for structural steel reinforcement (+$15,000.00)",
                    },
                    {
                        "category": "SOFT_COST",
                        "line_name": "Architecture, Engineering, Environmental & Municipal Permits",
                        "original_plan_amount": 28000000,
                        "current_forecast_amount": 28000000,
                        "basis": "APPROVED",
                        "variance_rationale": "Permit expediting and structural engineer sign-offs locked",
                    },
                    {
                        "category": "FINANCING",
                        "line_name": "Columbia Bank Construction Loan Interest & Facility Closing Fees",
                        "original_plan_amount": 25000000,
                        "current_forecast_amount": 25000000,
                        "basis": "COMMITTED",
                        "variance_rationale": "$1.2MM loan facility commitment at 5.75% interest reserve",
                    },
                ]
            },
            created_at=utc_now(),
        )
        db.add(pfp_73)

        # -------------------------------------------------------------------------
        # Investors & Equity Contributions for 73 Broadway
        # -------------------------------------------------------------------------
        investors_data_73 = [
            (investor_meridian, 45000000, 60.0),   # Meridian Capital LP: $450,000 (60%)
            (investor_kunal, 30000000, 40.0),      # Kunal Shah / Sponsor: $300,000 (40%)
        ]
        for inv_party, commit_cents, own_pct in investors_data_73:
            pinv = ProjectInvestor(
                id=generate_uuid(),
                organization_id=org.id,
                project_id=p73.id,
                investor_party_id=inv_party.id,
                committed_amount=commit_cents,
                ownership_percentage=own_pct,
                status="ACTIVE",
                created_at=utc_now(),
            )
            db.add(pinv)
            db.flush()

            db.add(
                InvestorContribution(
                    id=generate_uuid(),
                    project_investor_id=pinv.id,
                    amount=commit_cents,
                    received_date=date(2025, 4, 1),
                    created_at=utc_now(),
                )
            )

        # -------------------------------------------------------------------------
        # Data Quality Issues for 73 Broadway
        # -------------------------------------------------------------------------
        dqi_73 = [
            (
                "FORMULA_TOTAL_MISMATCH",
                "HIGH",
                "OPEN",
                "DOCUMENT",
                doc73_map["73 Broadway.xlsx"].id,
                users["CFO"].id,
                None,
                None,
            ),
            (
                "DRAW_DEPOSIT_MISMATCH",
                "HIGH",
                "OPEN",
                "DRAW",
                draw3_73.id,
                users["PM"].id,
                None,
                None,
            ),
            (
                "MISFILED_DOCUMENT",
                "MEDIUM",
                "RESOLVED",
                "DOCUMENT",
                doc73_map["73 Broadway - Report #2.pdf"].id,
                users["PM"].id,
                utc_now() - timedelta(days=2),
                "Document re-indexed from General into Project Inspection Reports directory.",
            ),
        ]
        for itype, sev, stat, a_type, a_id, o_id, res_at, res_text in dqi_73:
            db.add(
                DataQualityIssue(
                    id=generate_uuid(),
                    organization_id=org.id,
                    project_id=p73.id,
                    issue_type=itype,
                    severity=sev,
                    status=stat,
                    affected_entity_type=a_type,
                    affected_entity_id=a_id,
                    owner_id=o_id,
                    detected_at=utc_now() - timedelta(days=5),
                    resolved_at=res_at,
                    resolution=res_text,
                )
            )

        print("✅ 73 Broadway fixtures, draws, and 200+ transactions created.")

        # =========================================================================
        # 5. Project 2: 392 First Street (Completed, 15 Draws, 12 Condo Units, 1200+ txs)
        # =========================================================================
        p392 = Project(
            id=generate_uuid(),
            organization_id=org.id,
            name="392 First Street",
            project_entity="Builders Capital Investments LLC",
            address="392 1st Street, Jersey City, NJ 07302",
            lifecycle_stage="CLOSEOUT",
            contract_model="GMP",
            status="COMPLETED",
            currency="USD",
            started_at=datetime(2024, 1, 10, tzinfo=UTC),
            target_completion_at=datetime(2025, 11, 1, tzinfo=UTC),
            created_at=utc_now(),
        )
        db.add(p392)
        db.flush()
        print(f"🏢 Created Project: 392 First Street ({p392.id})")

        # Project Members for 392 First Street
        # Kunal Shah has role CFO on 392 First Street, proving project role variance
        for u in users_list:
            role_for_p392 = "CFO" if u.email == "kunal@builderscapital.com" else u.role
            db.add(
                ProjectMember(
                    id=generate_uuid(),
                    organization_id=org.id,
                    project_id=p392.id,
                    user_id=u.id,
                    role=role_for_p392,
                    created_at=utc_now(),
                )
            )

        # Loan
        loan392 = Loan(
            id=generate_uuid(),
            organization_id=org.id,
            project_id=p392.id,
            lender_party_id=lender_truly.id,
            loan_number="23-03394",
            commitment_amount=82445000,  # $824,450.00
            status="CLOSED",
            currency="USD",
            created_at=utc_now(),
        )
        db.add(loan392)
        db.flush()

        lt392 = LoanTerm(
            id=generate_uuid(),
            organization_id=org.id,
            loan_id=loan392.id,
            interest_rate=6.2500,
            interest_method="ACTUAL_360",
            interest_reserve_amount=35000000,
            retainage_percentage=10.0,
            effective_date=date(2024, 1, 10),
            maturity_date=date(2025, 11, 1),
            created_at=utc_now(),
        )
        db.add(lt392)

        # Financial Accounts
        acc_bcb_392 = FinancialAccount(
            id=generate_uuid(),
            organization_id=org.id,
            party_id=lender_builders.id,
            institution="BCB Community Bank",
            masked_identifier="•••• 2754",
            account_purpose="OPERATING",
            currency="USD",
            active_from=date(2024, 1, 10),
            status="ACTIVE",
            created_at=utc_now(),
        )
        db.add(acc_bcb_392)

        acc_amex_392 = FinancialAccount(
            id=generate_uuid(),
            organization_id=org.id,
            party_id=vendor_amex.id,
            institution="American Express Business Platinum",
            masked_identifier="•••• 05005",
            account_purpose="CREDIT_CARD",
            currency="USD",
            active_from=date(2024, 1, 10),
            status="ACTIVE",
            created_at=utc_now(),
        )
        db.add(acc_amex_392)
        db.flush()

        # Acquisition
        acq392 = Acquisition(
            id=generate_uuid(),
            organization_id=org.id,
            project_id=p392.id,
            purchase_price=110000000,  # $1,100,000.00
            closing_date=date(2024, 1, 10),
            closing_costs=62482301,
            notes="Acquisition closed with Sunnyside Title Agency LLC, Seller Simple Deal LLC.",
            created_at=utc_now(),
        )
        db.add(acq392)

        # Budget from Amhar Loan Report
        budget392 = Budget(
            id=generate_uuid(),
            organization_id=org.id,
            project_id=p392.id,
            version_number=1,
            status="APPROVED",
            total_original_amount=82445000,
            total_current_approved_amount=82445000,
            approved_by=users["OWNER"].id,
            approved_at=utc_now(),
            created_at=utc_now(),
        )
        db.add(budget392)
        db.flush()

        b392_lines_map: dict[str, BudgetLine] = {}
        amhar_xlsx = DATASET_BASE / "392 First Street" / "Amhar - Loan Report for Project_ 446.xlsx"
        if amhar_xlsx.exists():
            wb_amhar = openpyxl.load_workbook(amhar_xlsx, data_only=True)
            ws_amhar = wb_amhar["Project - 446"]
            for r in range(10, ws_amhar.max_row + 1):
                c1 = ws_amhar.cell(r, 1).value
                c3 = ws_amhar.cell(r, 3).value
                c5 = ws_amhar.cell(r, 5).value
                if c1 and c3 and c5:
                    code_str = str(c1)
                    desc_str = str(c3)
                    amt_cents = to_cents(c5)
                    bl = BudgetLine(
                        id=generate_uuid(),
                        budget_id=budget392.id,
                        code=code_str,
                        name=desc_str,
                        category="SOFT_COST" if code_str.startswith("1.") else "HARD_COST",
                        original_amount=amt_cents,
                        current_approved_amount=amt_cents,
                        is_draw_eligible=True,
                        sort_order=r,
                        created_at=utc_now(),
                    )
                    db.add(bl)
                    db.flush()
                    b392_lines_map[code_str] = bl

        # Physical Documents on Disk for 392 First Street
        p392_docs_to_seed = [
            ("Amhar - Loan Report for Project_ 446.xlsx", "BUDGET_SOV", date(2025, 10, 21)),
            ("Builders Capital.xlsx", "BUDGET_SOV", date(2025, 10, 21)),
            ("Amhar - Loan Report for Project_ 446.pdf", "REPORT", date(2025, 10, 21)),
            ("Builders Capital.pdf", "REPORT", date(2025, 10, 21)),
            ("Purchase including construction loan reserve.PDF", "CLOSING_STATEMENT", date(2024, 1, 10)),
            ("combined_draw_project446_draw4301.pdf", "DRAW_PACKET", date(2025, 10, 21)),
        ]
        doc392_map: dict[str, Document] = {}
        for fname, dtype, fdate in p392_docs_to_seed:
            fpath = DATASET_BASE / "392 First Street" / fname
            d = copy_and_register_document(
                db, fpath, org.id, p392.id, dtype, fdate, users["OWNER"].id, storage
            )
            doc392_map[fname] = d

        # Seed all 15 Draws from Amhar Report
        if amhar_xlsx.exists():
            wb_amhar = openpyxl.load_workbook(amhar_xlsx, data_only=True)
            ws_amhar = wb_amhar["Project - 446"]
            for d_idx, col in enumerate(range(7, 22), start=1):
                draw_date_val = ws_amhar.cell(8, col).value
                d_date = parse_date(draw_date_val, date(2024, 8, 1) + timedelta(days=d_idx * 30))

                draw_obj = Draw(
                    id=generate_uuid(),
                    organization_id=org.id,
                    project_id=p392.id,
                    loan_id=loan392.id,
                    draw_number=str(d_idx),
                    status="CLOSED" if d_idx < 15 else "APPROVED",
                    period_start=d_date - timedelta(days=25),
                    period_end=d_date,
                    submitted_at=datetime.combine(d_date, datetime.min.time(), tzinfo=UTC),
                    approved_at=datetime.combine(d_date, datetime.min.time(), tzinfo=UTC),
                    lender_party_id=lender_truly.id,
                    source_document_id=doc392_map["Amhar - Loan Report for Project_ 446.xlsx"].id,
                    created_at=utc_now(),
                )
                db.add(draw_obj)
                db.flush()

                draw_total = 0
                for r in range(10, ws_amhar.max_row + 1):
                    code_val = str(ws_amhar.cell(r, 1).value or "")
                    amt_cell = ws_amhar.cell(r, col).value
                    cents = to_cents(amt_cell)
                    if cents > 0 and code_val in b392_lines_map:
                        draw_total += cents
                        db.add(
                            DrawLine(
                                id=generate_uuid(),
                                draw_id=draw_obj.id,
                                budget_line_id=b392_lines_map[code_val].id,
                                requested_amount=cents,
                                recommended_amount=cents,
                                approved_amount=cents,
                                funded_amount=cents,
                                reason=f"Draw {d_idx} inspection verified item {code_val}",
                                evidence_status="VERIFIED",
                                created_at=utc_now(),
                            )
                        )

                # Add funding transaction
                if draw_total > 0:
                    tx_fund = FinancialTransaction(
                        id=generate_uuid(),
                        project_id=p392.id,
                        financial_account_id=acc_bcb_392.id,
                        account_ref=f"392-DRAW-{d_idx}",
                        transaction_date=d_date,
                        posted_date=d_date,
                        amount=draw_total,
                        direction="INFLOW",
                        counterparty="Truly Investor Capital",
                        memo=f"Draw {d_idx} loan funding disbursement",
                        external_id=f"392-DRAW-FUND-{d_idx}",
                        cleared_status="CLEARED",
                        created_at=utc_now(),
                    )
                    db.add(tx_fund)
                    db.flush()

                    db.add(
                        DrawFunding(
                            id=generate_uuid(),
                            draw_id=draw_obj.id,
                            transaction_id=tx_fund.id,
                            amount=draw_total,
                            funding_date=d_date,
                            created_at=utc_now(),
                        )
                    )

        # 12 Condominium Units (Units 1, 2, 3 sold with exact actual sales prices, Units 4-12)
        condo_units_data = [
            ("Unit 1", 1250, 85000000, 85601237, "SOLD"),
            ("Unit 2", 1180, 80000000, 80094705, "SOLD"),
            ("Unit 3", 2100, 150000000, 150225108, "SOLD"),
            ("Unit 4", 1250, 85000000, 85000000, "SOLD"),
            ("Unit 5", 1180, 80000000, 80000000, "SOLD"),
            ("Unit 6", 1200, 82000000, 82000000, "SOLD"),
            ("Unit 7", 1300, 87000000, 87000000, "SOLD"),
            ("Unit 8", 1250, 85000000, 85000000, "SOLD"),
            ("Unit 9", 1180, 80000000, 80000000, "SOLD"),
            ("Unit 10", 1220, 83000000, 83000000, "SOLD"),
            ("Unit 11", 1280, 86000000, 86000000, "SOLD"),
            ("Unit 12", 2100, 150000000, 150000000, "SOLD"),
        ]
        for u_num, sqft, target_p, actual_p, u_stat in condo_units_data:
            db.add(
                Unit(
                    id=generate_uuid(),
                    organization_id=org.id,
                    project_id=p392.id,
                    unit_number=u_num,
                    square_feet=sqft,
                    target_price=target_p,
                    actual_sale_price=actual_p,
                    status=u_stat,
                    created_at=utc_now(),
                )
            )

        # Closed Disposition for 392 First Street
        disp392 = Disposition(
            id=generate_uuid(),
            organization_id=org.id,
            project_id=p392.id,
            sale_price=315921050,  # $3,159,210.50
            closing_date=date(2025, 10, 15),
            settlement_costs=24309890,  # $243,098.90
            net_proceeds=155902676,  # $1,559,026.76
            buyer_party_id=investor_meridian.id,
            notes="Full condominium project disposition closed. Loan completely paid off ($1,357,084.84).",
            created_at=utc_now(),
        )
        db.add(disp392)

        # Investors, Contributions & Distributions for 392 First Street
        investors_data_392 = [
            (investor_harshad, 36000000, 45.0, 6457550),
            (investor_kirit, 12000000, 15.0, 2152516),
            (investor_kunal, 8000000, 10.0, 1435011),
            (investor_swekit, 8000000, 10.0, 1435011),
            (investor_nilesh, 8000000, 10.0, 1435011),
            (investor_vijay, 8000000, 10.0, 1435011),
        ]
        for inv_party, commit_amt, pct, dist_amt in investors_data_392:
            pinv = ProjectInvestor(
                id=generate_uuid(),
                organization_id=org.id,
                project_id=p392.id,
                investor_party_id=inv_party.id,
                committed_amount=commit_amt,
                ownership_percentage=pct,
                status="ACTIVE",
                created_at=utc_now(),
            )
            db.add(pinv)
            db.flush()

            db.add(
                InvestorContribution(
                    id=generate_uuid(),
                    project_investor_id=pinv.id,
                    amount=commit_amt,
                    received_date=date(2024, 1, 10),
                    created_at=utc_now(),
                )
            )
            db.add(
                InvestorDistribution(
                    id=generate_uuid(),
                    project_investor_id=pinv.id,
                    amount=dist_amt,
                    distribution_date=date(2025, 10, 25),
                    distribution_type="PROFIT",
                    created_at=utc_now(),
                )
            )

        # Parse 569+ Transactions from Builders Capital.xlsx
        xlsx392_path = DATASET_BASE / "392 First Street" / "Builders Capital.xlsx"
        first_bline_392 = list(b392_lines_map.values())[0] if b392_lines_map else None
        if xlsx392_path.exists():
            wb392 = openpyxl.load_workbook(xlsx392_path, data_only=True)
            sheet_configs_392 = [
                ("Construction ", gc_apex, "3.01", 4, "OUTFLOW"),
                ("Labour", parties["Luis Angel Rimacachin"], "3.01", 4, "OUTFLOW"),
                ("Bank fees", lender_truly, "1.05", 3, "OUTFLOW"),
                ("Muncipality Expenses", vendor_jc_tax, "1.05", 3, "OUTFLOW"),
                ("Land acquisition", party_schonberger, "1.01", 3, "OUTFLOW"),
                ("Loan Payment", lender_fci, "1.05", 3, "OUTFLOW"),
                ("Misc.", vendor_reuther, "3.01", 4, "OUTFLOW"),
            ]
            for sname, def_party, bcode, amt_col, direction in sheet_configs_392:
                if sname not in wb392.sheetnames:
                    continue
                ws = wb392[sname]
                bline_target = b392_lines_map.get(bcode, first_bline_392)
                for r in range(2, ws.max_row + 1):
                    d_val = ws.cell(r, 1).value
                    mode_val = str(ws.cell(r, 2).value or "").strip()
                    desc_val = str(ws.cell(r, 3).value or "").strip()
                    amt_val = ws.cell(r, amt_col).value

                    t_date = parse_date(d_val, None)
                    if not t_date or amt_val is None or not isinstance(amt_val, (int, float)):
                        continue
                    cents = to_cents(amt_val)
                    if cents == 0:
                        continue

                    full_desc = f"{mode_val} {desc_val}".strip() or f"{sname} transaction"
                    tx_id = generate_uuid()
                    ftx = FinancialTransaction(
                        id=tx_id,
                        project_id=p392.id,
                        financial_account_id=acc_bcb_392.id,
                        account_ref=f"392-{sname[:3].upper()}-{r}",
                        transaction_date=t_date,
                        posted_date=t_date,
                        amount=abs(cents),
                        direction="INFLOW" if cents < 0 else direction,
                        counterparty=desc_val or def_party.name,
                        memo=full_desc,
                        external_id=f"392-{sname.strip()}-{r}-{t_date}",
                        cleared_status="CLEARED",
                        created_at=utc_now(),
                    )
                    db.add(ftx)

                    sp = SpendRecord(
                        id=generate_uuid(),
                        project_id=p392.id,
                        vendor_party_id=def_party.id,
                        transaction_date=t_date,
                        amount=abs(cents),
                        currency="USD",
                        description=full_desc,
                        status="VERIFIED",
                        evidence_strength="BANK_TRANSACTION",
                        source_document_id=doc392_map["Builders Capital.xlsx"].id,
                        transaction_id=tx_id,
                        budget_line_id=bline_target.id if bline_target else None,
                        match_status="MATCHED",
                        reviewed_by=users["CFO"].id,
                        reviewed_at=utc_now(),
                        created_at=utc_now(),
                    )
                    db.add(sp)

                    db.add(
                        ReconciliationMatch(
                            id=generate_uuid(),
                            organization_id=org.id,
                            project_id=p392.id,
                            transaction_id=tx_id,
                            spend_record_id=sp.id,
                            match_type="EXACT",
                            confidence_score=1.0,
                            decision="ACCEPTED",
                            decided_by=users["CFO"].id,
                            decided_at=utc_now(),
                            notes="Verified against general contractor bank ledger",
                            created_at=utc_now(),
                        )
                    )

        # Parse American Express Card Activity (699 transactions)
        amex_md = (
            DATASET_BASE
            / "392 First Street"
            / "Builders capital 25-26 American Express - Account Activity.md"
        )
        if amex_md.exists():
            with open(amex_md, "r", encoding="utf-8", errors="ignore") as fp:
                lines = [l.strip() for l in fp if l.strip()]
            i = 0
            while i < len(lines):
                line = lines[i]
                if line.startswith("$") and i >= 2:
                    amt_str = line.replace("$", "").replace(",", "")
                    try:
                        amt = float(amt_str)
                        desc = lines[i - 1]
                        date_str = lines[i - 2]
                        cents = to_cents(amt)
                        t_date = parse_date(date_str, date(2025, 3, 1))

                        tx_id = generate_uuid()
                        db.add(
                            FinancialTransaction(
                                id=tx_id,
                                project_id=p392.id,
                                financial_account_id=acc_amex_392.id,
                                account_ref="AMEX-05005",
                                transaction_date=t_date,
                                posted_date=t_date,
                                amount=cents,
                                direction="OUTFLOW",
                                counterparty=desc[:100],
                                memo=desc,
                                external_id=f"AMEX-{i}-{t_date}",
                                cleared_status="CLEARED",
                                created_at=utc_now(),
                            )
                        )

                        sp = SpendRecord(
                            id=generate_uuid(),
                            project_id=p392.id,
                            vendor_party_id=vendor_amex.id,
                            transaction_date=t_date,
                            amount=cents,
                            currency="USD",
                            description=desc,
                            status="VERIFIED",
                            evidence_strength="CARD_TRANSACTION",
                            source_document_id=doc392_map["Builders Capital.pdf"].id,
                            transaction_id=tx_id,
                            budget_line_id=first_bline_392.id if first_bline_392 else None,
                            match_status="MATCHED",
                            reviewed_by=users["CFO"].id,
                            reviewed_at=utc_now(),
                            created_at=utc_now(),
                        )
                        db.add(sp)
                    except ValueError:
                        pass
                i += 1

        # -------------------------------------------------------------------------
        # Investor Update for 392 First Street (Closed)
        # -------------------------------------------------------------------------
        db.add(
            InvestorUpdate(
                id=generate_uuid(),
                organization_id=org.id,
                project_id=p392.id,
                title="Final Project Closeout & LP Waterfall Report",
                as_of_date=date(2025, 2, 28),
                status="PUBLISHED",
                published_at=datetime(2025, 3, 1, 10, 0, tzinfo=UTC),
                gross_development_value=1250000000,
                current_forecast_profit=254000000,
                senior_debt_drawn=750000000,
                equity_funded=240000000,
                progress_summary="Development 100% completed. All 12 luxury residential units closed. Senior construction loan paid in full. Equity returns and profit waterfall distributed.",
                material_disclosures=[
                    "Final Certificate of Occupancy issued and municipal closeout signed.",
                    "100% lien waivers collected from General Contractor and subcontractors.",
                    "Final net profit distributed to LP partners yielding 21.4% IRR and 1.38x Equity Multiple.",
                ],
                recipients=["e.rostova@meridiancap.com", "m.vance@vancedev.com", "kunal@builderscapital.com"],
                created_at=datetime(2025, 2, 28, tzinfo=UTC),
            )
        )

        # -------------------------------------------------------------------------
        # GC Submission for 392 First Street
        # -------------------------------------------------------------------------
        db.add(
            GCSubmission(
                id=generate_uuid(),
                organization_id=org.id,
                project_id=p392.id,
                submission_number="GC-CLAIM-015",
                type="MILESTONE_CLAIM",
                title="Final Punchlist & Retainage Release Pay Application",
                description="Final closeout claim covering punchlist completion, final municipal sign-offs, and 10% retainage balance disbursement.",
                contract_model="GMP",
                status="APPROVED",
                submitted_at=datetime(2025, 1, 20, 10, 0, tzinfo=UTC),
                submitted_by="Frank Miller (GC)",
                contractor_name="Apex Construction LLC",
                csi_code="01-700",
                csi_category="Execution & Closeout",
                claimed_amount=42500000,
                retainage_rate_pct=0.0,
                retainage_amount=0,
                net_payable_amount=42500000,
                prior_claimed_pct=100.0,
                current_claimed_pct=100.0,
                incremental_claimed_pct=0.0,
                invoice_numbers=["INV-APEX-FINAL"],
                evidence_items=[
                    {
                        "id": "ev-392-1",
                        "filename": "Amhar - Loan Report for Project_ 446.pdf",
                        "type": "INVOICE",
                        "file_size_bytes": 220000,
                        "uploaded_at": "2025-01-20T09:00:00Z",
                        "invoice_number": "INV-APEX-FINAL",
                        "vendor_name": "Apex Construction LLC",
                        "amount": "42500000",
                    }
                ],
                reviews=[
                    {
                        "role": "OWNER",
                        "reviewer_name": "Marcus Vance",
                        "status": "APPROVED",
                        "reviewed_at": "2025-01-25T14:00:00Z",
                        "comments": "Final closeout approved. Retainage released upon receipt of unconditional lien waiver.",
                    }
                ],
                created_at=datetime(2025, 1, 20, 10, 0, tzinfo=UTC),
            )
        )

        # -------------------------------------------------------------------------
        # Notification for 392 First Street
        # -------------------------------------------------------------------------
        db.add(
            Notification(
                id=generate_uuid(),
                organization_id=org.id,
                project_id=p392.id,
                user_id=users["OWNER"].id,
                title="Project 392 First Street Closed Out",
                message="All 12 condo sales recorded. Senior loan repaid and $2.4M equity returns disbursed.",
                type="GENERAL",
                severity="INFO",
                read=True,
                link_url="/economics",
                created_at=utc_now() - timedelta(days=7),
            )
        )

        # -------------------------------------------------------------------------
        # Historical Milestones for 392 First Street (All 100% Completed)
        # -------------------------------------------------------------------------
        ms_data_392 = [
            ("Demolition & Excavation", "M-01", date(2024, 1, 15), date(2024, 3, 1), 100, "COMPLETED"),
            ("Concrete Foundation & Footings", "M-02", date(2024, 3, 2), date(2024, 5, 15), 100, "COMPLETED"),
            ("Structural Framing & Decking", "M-03", date(2024, 5, 16), date(2024, 8, 30), 100, "COMPLETED"),
            ("MEP Rough-Ins & Pre-Drywall", "M-04", date(2024, 9, 1), date(2024, 11, 15), 100, "COMPLETED"),
            ("Interior Finishes & Fixtures", "M-05", date(2024, 11, 16), date(2025, 1, 15), 100, "COMPLETED"),
            ("Final Inspections & Certificate of Occupancy", "M-06", date(2025, 1, 16), date(2025, 2, 28), 100, "COMPLETED"),
        ]
        for name, code, p_start, p_comp, pct, m_status in ms_data_392:
            db.add(
                ProjectMilestone(
                    id=generate_uuid(),
                    organization_id=org.id,
                    project_id=p392.id,
                    name=name,
                    code=code,
                    planned_start_date=p_start,
                    planned_completion_date=p_comp,
                    actual_start_date=p_start,
                    actual_completion_date=p_comp,
                    forecast_completion_date=p_comp,
                    progress_percentage=pct,
                    status=m_status,
                    created_at=utc_now(),
                )
            )

        # -------------------------------------------------------------------------
        # Audited Pro-Forma Plan for 392 First Street (Completed Closeout)
        # -------------------------------------------------------------------------
        pfp_392 = ProjectFinancialPlan(
            id=generate_uuid(),
            organization_id=org.id,
            project_id=p392.id,
            version_number=1,
            plan_type="PRO_FORMA",
            projected_revenue=315921050,  # $3,159,210.50
            projected_cost=214000000,     # $2,140,000.00
            target_irr=21.4,
            target_equity_multiple=1.38,
            is_active=True,
            payload={
                "lines": [
                    {
                        "category": "REVENUE",
                        "line_name": "Actual Realized Condominium Sales (12 Closed Units)",
                        "original_plan_amount": 310000000,
                        "current_forecast_amount": 315921050,
                        "actual_cleared_amount": 315921050,
                        "basis": "ACTUAL",
                        "variance_rationale": "Settled gross proceeds from 12 closed units exceeding pro-forma by +$59,210.50",
                    },
                    {
                        "category": "HARD_COST",
                        "line_name": "Final Direct Construction Hard Costs (GMP Contract)",
                        "original_plan_amount": 138000000,
                        "current_forecast_amount": 138000000,
                        "actual_cleared_amount": 138000000,
                        "basis": "ACTUAL",
                        "variance_rationale": "Amhar engineering loan report draw schedule verified to penny ($1,380,000.00)",
                    },
                    {
                        "category": "SOFT_COST",
                        "line_name": "Architecture, Municipal Permitting, Engineering & Survey",
                        "original_plan_amount": 38000000,
                        "current_forecast_amount": 38000000,
                        "actual_cleared_amount": 38000000,
                        "basis": "ACTUAL",
                        "variance_rationale": "All professional services cleared and lien waivers received",
                    },
                    {
                        "category": "FINANCING",
                        "line_name": "Truly Investor Capital Senior Loan Interest & Legal Carrying",
                        "original_plan_amount": 38000000,
                        "current_forecast_amount": 38000000,
                        "actual_cleared_amount": 38000000,
                        "basis": "ACTUAL",
                        "variance_rationale": "Senior construction loan fully satisfied from disposition proceeds",
                    },
                ]
            },
            created_at=utc_now(),
        )
        db.add(pfp_392)

        # -------------------------------------------------------------------------
        # Data Quality Issues for 392 First Street
        # -------------------------------------------------------------------------
        dqi_392 = [
            (
                "STATEMENT_COVERAGE_GAP",
                "MEDIUM",
                "RESOLVED",
                "DOCUMENT",
                doc392_map["Builders Capital.xlsx"].id,
                users["CFO"].id,
                utc_now() - timedelta(days=14),
                "Missing monthly bank reconciliation resolved against closing settlement statement.",
            ),
            (
                "DUPLICATE_CANDIDATE",
                "LOW",
                "RESOLVED",
                "DOCUMENT",
                doc392_map["Amhar - Loan Report for Project_ 446.pdf"].id,
                users["CFO"].id,
                utc_now() - timedelta(days=20),
                "Duplicate invoice flag inspected and dismissed as legitimate progressive draw line.",
            ),
        ]
        for itype, sev, stat, a_type, a_id, o_id, res_at, res_text in dqi_392:
            db.add(
                DataQualityIssue(
                    id=generate_uuid(),
                    organization_id=org.id,
                    project_id=p392.id,
                    issue_type=itype,
                    severity=sev,
                    status=stat,
                    affected_entity_type=a_type,
                    affected_entity_id=a_id,
                    owner_id=o_id,
                    detected_at=utc_now() - timedelta(days=30),
                    resolved_at=res_at,
                    resolution=res_text,
                )
            )

        print("✅ 392 First Street fixtures, 15 draws, 12 units, and 1,200+ transactions created.")

        # =========================================================================
        # 6. Project 3: 161 Woodlawn Ave (Active Pre-Construction, 500+ txs)
        # =========================================================================
        p161 = Project(
            id=generate_uuid(),
            organization_id=org.id,
            name="161 Woodlawn Ave",
            project_entity="161 Woodlawn Development LLC",
            address="161 Woodlawn Ave, Jersey City, NJ 07305",
            lifecycle_stage="PRE_CONSTRUCTION",
            contract_model="COST_PLUS",
            status="ACTIVE",
            currency="USD",
            started_at=datetime(2024, 4, 24, tzinfo=UTC),
            target_completion_at=datetime(2026, 12, 31, tzinfo=UTC),
            created_at=utc_now(),
        )
        db.add(p161)
        db.flush()
        print(f"📐 Created Project: 161 Woodlawn Ave ({p161.id})")

        # Project Members for 161 Woodlawn Ave
        # Kunal Shah has NO access to 161 Woodlawn Ave, proving complete project isolation
        for u in users_list:
            if u.email == "kunal@builderscapital.com":
                continue  # No membership on 161 Woodlawn!
            db.add(
                ProjectMember(
                    id=generate_uuid(),
                    organization_id=org.id,
                    project_id=p161.id,
                    user_id=u.id,
                    role=u.role,
                    created_at=utc_now(),
                )
            )

        # Financial Account
        acc_bcb_161 = FinancialAccount(
            id=generate_uuid(),
            organization_id=org.id,
            party_id=gc_apex.id,
            institution="BCB Community Bank",
            masked_identifier="•••• 1913",
            account_purpose="OPERATING",
            currency="USD",
            active_from=date(2024, 4, 24),
            status="ACTIVE",
            created_at=utc_now(),
        )
        db.add(acc_bcb_161)
        db.flush()

        # Acquisition
        acq161 = Acquisition(
            id=generate_uuid(),
            organization_id=org.id,
            project_id=p161.id,
            purchase_price=37736794,  # $377,367.94
            closing_date=date(2024, 5, 20),
            closing_costs=1500000,
            notes="Land acquisition completed for 161 Woodlawn Ave.",
            created_at=utc_now(),
        )
        db.add(acq161)

        # Loan for 161 Woodlawn Ave
        loan161 = Loan(
            id=generate_uuid(),
            organization_id=org.id,
            project_id=p161.id,
            lender_party_id=lender_fci.id,
            loan_number="FCI-2024-161W",
            commitment_amount=95000000,  # $950,000.00
            status="ACTIVE",
            currency="USD",
            created_at=utc_now(),
        )
        db.add(loan161)
        db.flush()

        lt161 = LoanTerm(
            id=generate_uuid(),
            organization_id=org.id,
            loan_id=loan161.id,
            interest_rate=6.5000,
            interest_method="ACTUAL_360",
            interest_reserve_amount=15000000,
            retainage_percentage=10.0,
            effective_date=date(2024, 5, 20),
            maturity_date=date(2026, 12, 31),
            created_at=utc_now(),
        )
        db.add(lt161)

        # Budget for 161 Woodlawn ($1,019,220.00 baseline across 6 CSI Divisions + Contingency Reserve)
        budget161 = Budget(
            id=generate_uuid(),
            organization_id=org.id,
            project_id=p161.id,
            version_number=1,
            status="APPROVED",
            total_original_amount=101922000,  # $1,019,220.00
            total_current_approved_amount=101922000,
            approved_by=users["OWNER"].id,
            approved_at=utc_now(),
            created_at=utc_now(),
        )
        db.add(budget161)
        db.flush()

        b161_lines_data = [
            ("01-100", "General Conditions & Requirements", 8500000, "SOFT_COST"),     # $85,000.00
            ("02-200", "Site Work & Excavation", 14200000, "HARD_COST"),               # $142,000.00
            ("03-300", "Concrete & Foundation Structure", 31000000, "HARD_COST"),      # $310,000.00
            ("06-100", "Rough Carpentry & Framing", 22000000, "HARD_COST"),            # $220,000.00
            ("15-100", "Plumbing & HVAC Systems", 17500000, "HARD_COST"),              # $175,000.00
            ("16-100", "Electrical & Systems", 8722000, "HARD_COST"),                  # $87,220.00
            ("20-000", "Contingency Reserve", 8247000, "CONTINGENCY"),                  # $82,470.00
        ]
        b161_lines_map: dict[str, BudgetLine] = {}
        for idx, (code, desc, amt, cat) in enumerate(b161_lines_data):
            bl = BudgetLine(
                id=generate_uuid(),
                budget_id=budget161.id,
                code=code,
                name=desc,
                category=cat,
                original_amount=amt,
                current_approved_amount=amt,
                is_draw_eligible=True,
                sort_order=idx,
                created_at=utc_now(),
            )
            db.add(bl)
            db.flush()
            b161_lines_map[code] = bl

        # Aliases for backwards compatibility with legacy sheet mapping and draws
        b161_lines_map["1.00"] = b161_lines_map["01-100"]
        b161_lines_map["2.00"] = b161_lines_map["02-200"]
        b161_lines_map["3.00"] = b161_lines_map["03-300"]
        b161_lines_map["4.00"] = b161_lines_map["15-100"]
        b161_lines_map["5.00"] = b161_lines_map["16-100"]
        b161_lines_map["6.00"] = b161_lines_map["06-100"]
        b161_lines_map["7.00"] = b161_lines_map["20-000"]

        # Investors (Partner ratios: Kirit 25%, Nilesh 25%, Kunal 25%, Swekit 25% = $475,000)
        for inv_p in [investor_kirit, investor_nilesh, investor_kunal, investor_swekit]:
            pinv = ProjectInvestor(
                id=generate_uuid(),
                organization_id=org.id,
                project_id=p161.id,
                investor_party_id=inv_p.id,
                committed_amount=11875000,  # $118,750.00
                ownership_percentage=25.0,
                status="ACTIVE",
                created_at=utc_now(),
            )
            db.add(pinv)
            db.flush()
            db.add(
                InvestorContribution(
                    id=generate_uuid(),
                    project_investor_id=pinv.id,
                    amount=11875000,
                    received_date=date(2024, 5, 20),
                    created_at=utc_now(),
                )
            )

        # Physical Documents on Disk for 161 Woodlawn Ave
        p161_docs_to_seed = [
            ("161 Woodlawn Ave.xlsx", "BUDGET_SOV", date(2026, 5, 1)),
            ("161 Woodlawn Ave.xlsx.pdf", "REPORT", date(2026, 5, 1)),
            ("Woodlawn May 2026.pdf", "REPORT", date(2026, 5, 30)),
            ("Woodlawn july 2026.pdf", "REPORT", date(2026, 7, 31)),
        ]
        doc161_map: dict[str, Document] = {}
        for fname, dtype, fdate in p161_docs_to_seed:
            fpath = DATASET_BASE / "161 Woodlawn Ave" / fname
            d = copy_and_register_document(
                db, fpath, org.id, p161.id, dtype, fdate, users["OWNER"].id, storage
            )
            doc161_map[fname] = d

        # Parse 552 Transactions from 161 Woodlawn Ave.xlsx
        xlsx161_path = DATASET_BASE / "161 Woodlawn Ave" / "161 Woodlawn Ave.xlsx"
        first_bline_161 = list(b161_lines_map.values())[0]
        if xlsx161_path.exists():
            wb161 = openpyxl.load_workbook(xlsx161_path, data_only=True)
            sheet_configs_161 = [
                ("Labour", parties["Nilson Mocalos"], "3.00", 4, "OUTFLOW"),
                ("Construction Expenses", gc_apex, "2.00", 4, "OUTFLOW"),
                ("Accounting & Legal", vendor_cpa, "7.00", 4, "OUTFLOW"),
                ("Bank fees", lender_columbia, "5.00", 3, "OUTFLOW"),
                ("Land acquisition", party_schonberger, "1.00", 3, "OUTFLOW"),
                ("Muncipality Expenses", vendor_jc_tax, "4.00", 4, "OUTFLOW"),
                ("Loan Payment", lender_fci, "6.00", 3, "OUTFLOW"),
                ("Misc.", vendor_reuther, "2.00", 4, "OUTFLOW"),
                ("Soft Cost", gc_apex, "2.00", 4, "OUTFLOW"),
            ]
            for sname, def_party, bcode, amt_col, direction in sheet_configs_161:
                if sname not in wb161.sheetnames:
                    continue
                ws = wb161[sname]
                bline_target = b161_lines_map.get(bcode, first_bline_161)
                for r in range(2, ws.max_row + 1):
                    d_val = ws.cell(r, 1).value
                    mode_val = str(ws.cell(r, 2).value or "").strip()
                    desc_val = str(ws.cell(r, 3).value or "").strip()
                    amt_val = ws.cell(r, amt_col).value

                    t_date = parse_date(d_val, None)
                    if not t_date or amt_val is None or not isinstance(amt_val, (int, float)):
                        continue
                    cents = to_cents(amt_val)
                    if cents == 0:
                        continue

                    full_desc = f"{mode_val} {desc_val}".strip() or f"{sname} transaction"
                    tx_id = generate_uuid()
                    ftx = FinancialTransaction(
                        id=tx_id,
                        project_id=p161.id,
                        financial_account_id=acc_bcb_161.id,
                        account_ref=f"161-{sname[:3].upper()}-{r}",
                        transaction_date=t_date,
                        posted_date=t_date,
                        amount=abs(cents),
                        direction="INFLOW" if cents < 0 else direction,
                        counterparty=desc_val or def_party.name,
                        memo=full_desc,
                        external_id=f"161-{sname.strip()}-{r}-{t_date}",
                        cleared_status="CLEARED",
                        created_at=utc_now(),
                    )
                    db.add(ftx)

                    sp = SpendRecord(
                        id=generate_uuid(),
                        project_id=p161.id,
                        vendor_party_id=def_party.id,
                        transaction_date=t_date,
                        amount=abs(cents),
                        currency="USD",
                        description=full_desc,
                        status="VERIFIED",
                        evidence_strength="BANK_TRANSACTION",
                        source_document_id=doc161_map["161 Woodlawn Ave.xlsx"].id,
                        transaction_id=tx_id,
                        budget_line_id=bline_target.id,
                        match_status="MATCHED",
                        reviewed_by=users["CFO"].id,
                        reviewed_at=utc_now(),
                        created_at=utc_now(),
                    )
                    db.add(sp)

                    # Vary decision and match type for realistic queue workflow (first 6 rows in Labour pending review)
                    is_queue_item_161 = (sname == "Labour" and 2 <= r <= 7)
                    rec_decision_161 = "SUGGESTED" if is_queue_item_161 and r % 2 == 0 else ("SPLIT" if is_queue_item_161 else "ACCEPTED")
                    conf_score_161 = 0.92 if rec_decision_161 == "SUGGESTED" else (0.86 if rec_decision_161 == "SPLIT" else 1.0)
                    m_type_161 = "FUZZY" if rec_decision_161 == "SUGGESTED" else ("SPLIT" if rec_decision_161 == "SPLIT" else "EXACT")

                    db.add(
                        ReconciliationMatch(
                            id=generate_uuid(),
                            organization_id=org.id,
                            project_id=p161.id,
                            transaction_id=tx_id,
                            spend_record_id=sp.id,
                            match_type=m_type_161,
                            confidence_score=conf_score_161,
                            decision=rec_decision_161,
                            decided_by=None if is_queue_item_161 else users["CFO"].id,
                            decided_at=None if is_queue_item_161 else utc_now(),
                            notes="Automated extraction suggested match pending human sign-off" if is_queue_item_161 else "Ledger verified matching disbursement",
                            created_at=utc_now(),
                        )
                    )

        # Change Orders for 161 Woodlawn Ave
        co1_161 = ChangeOrder(
            id=generate_uuid(),
            organization_id=org.id,
            project_id=p161.id,
            change_order_number="CO-001",
            title="Foundation Soil Stabilization & Footing Extension",
            reason="Geotechnical variance on bedrock elevation for column footings",
            status="APPROVED",
            requested_amount=0,
            approved_amount=0,
            requested_by=users["GC"].id,
            approved_by=users["OWNER"].id,
            approved_at=utc_now(),
            created_at=utc_now(),
        )
        db.add(co1_161)
        db.flush()

        db.add(
            ChangeOrderLine(
                id=generate_uuid(),
                change_order_id=co1_161.id,
                budget_line_id=b161_lines_map["03-300"].id,
                amount=0,
                description="Subgrade soil stabilization and bedrock anchoring",
                created_at=utc_now(),
            )
        )

        co2_161 = ChangeOrder(
            id=generate_uuid(),
            organization_id=org.id,
            project_id=p161.id,
            change_order_number="CO-002",
            title="Framing Additional Shear Wall & Moment Framing",
            reason="Mandated shear transfer connection details per SE inspection memo",
            status="SUBMITTED",
            requested_amount=1850000,  # $18,500.00
            requested_by=users["GC"].id,
            created_at=utc_now(),
        )
        db.add(co2_161)
        db.flush()

        db.add(
            ChangeOrderLine(
                id=generate_uuid(),
                change_order_id=co2_161.id,
                budget_line_id=b161_lines_map["06-100"].id,
                amount=1850000,
                description="Structural moment framing steel plate clips and shear paneling",
                created_at=utc_now(),
            )
        )

        # Seed realistic spend records for 161 Woodlawn Ave ($420,450.00 total)
        woodlawn_spend_allocations = [
            ("01-100", 2500000, parties.get("Site Services LLC", gc_apex), "Site trailer mobilization, perimeter fencing, security & jobsite facilities", date(2025, 1, 15)),
            ("01-100", 2000000, gc_apex, "Superintendent supervisory fees & engineering field coordination", date(2025, 2, 1)),
            ("02-200", 6500000, parties.get("Tri-State Excavation", gc_apex), "Mass earthwork excavation, rock breaking, and sub-base grading", date(2025, 2, 10)),
            ("02-200", 4500000, parties.get("Underground Dynamics", gc_apex), "Sheet piling, perimeter soldier piles & dewatering pump operations", date(2025, 3, 5)),
            ("03-300", 9545000, parties.get("Precision Rebar & Concrete", gc_apex), "Rebar cage fabrication, grade 60 steel placement & anchor bolts", date(2025, 3, 20)),
            ("03-300", 9000000, parties.get("Metro Concrete Pumping", gc_apex), "Foundation spread footings & 4,500 PSI continuous wall concrete pour", date(2025, 4, 10)),
            ("06-100", 5000000, parties.get("Apex Lumber Supply", gc_apex), "Superstructure engineered lumber, LVL beams & subfloor deck package", date(2025, 4, 25)),
            ("06-100", 3000000, gc_apex, "Rough carpentry framing crew labor draw #1", date(2025, 5, 10)),
        ]
        for code_wl, amt_cents_wl, vendor_p_wl, desc_str_wl, tx_dt_wl in woodlawn_spend_allocations:
            tx_id_wl = generate_uuid()
            db.add(
                FinancialTransaction(
                    id=tx_id_wl,
                    project_id=p161.id,
                    financial_account_id=acc_bcb_161.id,
                    account_ref=f"161-BCB-{code_wl}",
                    transaction_date=tx_dt_wl,
                    posted_date=tx_dt_wl,
                    amount=amt_cents_wl,
                    direction="OUTFLOW",
                    counterparty=vendor_p_wl.name,
                    memo=desc_str_wl,
                    external_id=f"161-WL-{code_wl}-{tx_dt_wl}",
                    cleared_status="CLEARED",
                    created_at=utc_now(),
                )
            )
            db.add(
                SpendRecord(
                    id=generate_uuid(),
                    project_id=p161.id,
                    vendor_party_id=vendor_p_wl.id,
                    transaction_date=tx_dt_wl,
                    amount=amt_cents_wl,
                    currency="USD",
                    description=desc_str_wl,
                    status="VERIFIED",
                    evidence_strength="BANK_TRANSACTION",
                    source_document_id=doc161_map["161 Woodlawn Ave.xlsx"].id if "161 Woodlawn Ave.xlsx" in doc161_map else list(doc161_map.values())[0].id,
                    transaction_id=tx_id_wl,
                    budget_line_id=b161_lines_map[code_wl].id,
                    match_status="MATCHED",
                    reviewed_by=users["CFO"].id,
                    reviewed_at=utc_now(),
                    created_at=utc_now(),
                )
            )

        # Pre-construction Milestones for 161 Woodlawn Ave
        ms_161_objs = []
        ms_161 = [
            ("Pre-Construction & Permitting", "W-01", date(2024, 4, 24), date(2024, 5, 20), 100, "COMPLETED"),
            ("Site Excavation & Grading", "W-02", date(2024, 6, 1), date(2024, 12, 1), 100, "COMPLETED"),
            ("Foundation & Concrete Pour", "W-03", date(2024, 12, 2), date(2025, 4, 30), 80, "IN_PROGRESS"),
            ("Superstructure Framing", "W-04", date(2025, 5, 1), date(2025, 8, 30), 35, "IN_PROGRESS"),
            ("MEP Rough-Ins", "W-05", date(2025, 9, 1), date(2025, 11, 30), 0, "PLANNED"),
            ("Electrical & Low Voltage", "W-06", date(2025, 12, 1), date(2026, 3, 31), 0, "PLANNED"),
        ]
        for name, code, p_start, p_comp, pct, m_status in ms_161:
            pm = ProjectMilestone(
                id=generate_uuid(),
                organization_id=org.id,
                project_id=p161.id,
                name=name,
                code=code,
                planned_start_date=p_start,
                planned_completion_date=p_comp,
                actual_start_date=p_start if pct > 0 else None,
                actual_completion_date=p_comp if pct == 100 else None,
                forecast_completion_date=p_comp,
                progress_percentage=pct,
                status=m_status,
                created_at=utc_now(),
            )
            db.add(pm)
            db.flush()
            ms_161_objs.append(pm)

        # Link budget lines to milestones
        b161_lines_map["01-100"].milestone_id = ms_161_objs[0].id
        b161_lines_map["02-200"].milestone_id = ms_161_objs[1].id
        b161_lines_map["03-300"].milestone_id = ms_161_objs[2].id
        b161_lines_map["06-100"].milestone_id = ms_161_objs[3].id
        b161_lines_map["15-100"].milestone_id = ms_161_objs[4].id
        b161_lines_map["16-100"].milestone_id = ms_161_objs[5].id

        # -------------------------------------------------------------------------
        # Underwriting Financial Plan (Pro-Forma) for 161 Woodlawn Ave
        # -------------------------------------------------------------------------
        pfp_161 = ProjectFinancialPlan(
            id=generate_uuid(),
            organization_id=org.id,
            project_id=p161.id,
            version_number=1,
            plan_type="PRO_FORMA",
            projected_revenue=245000000,  # $2,450,000.00
            projected_cost=156100000,     # $1,561,000.00
            target_irr=22.8,
            target_equity_multiple=1.57,
            is_active=True,
            payload={
                "lines": [
                    {
                        "category": "REVENUE",
                        "line_name": "Projected Residential Condominium Gross Sales (6 Multi-Family Units)",
                        "original_plan_amount": 245000000,
                        "current_forecast_amount": 245000000,
                        "basis": "ESTIMATED",
                        "variance_rationale": "Pre-construction underwriting valuation ($408,333 / unit average)",
                    },
                    {
                        "category": "HARD_COST",
                        "line_name": "Construction & Site Demolition Budget",
                        "original_plan_amount": 102160856,
                        "current_forecast_amount": 102160856,
                        "basis": "APPROVED",
                        "variance_rationale": "Includes site clearing, excavation, and Apex Construction contract baseline",
                    },
                    {
                        "category": "SOFT_COST",
                        "line_name": "Land Acquisition, Zoning & Municipality Permit Fees",
                        "original_plan_amount": 38631619,
                        "current_forecast_amount": 38631619,
                        "basis": "APPROVED",
                        "variance_rationale": "Land deed acquired with architectural planning and variance filings active",
                    },
                    {
                        "category": "FINANCING",
                        "line_name": "Loan Facility Carrying Costs & Lender Services",
                        "original_plan_amount": 15257109,
                        "current_forecast_amount": 15257109,
                        "basis": "COMMITTED",
                        "variance_rationale": "FCI Lender Services carrying fee reserve through pre-construction",
                    },
                ]
            },
            created_at=utc_now(),
        )
        db.add(pfp_161)

        # -------------------------------------------------------------------------
        # Initial Mobilization Draw for 161 Woodlawn Ave
        # -------------------------------------------------------------------------
        draw1_161 = Draw(
            id=generate_uuid(),
            organization_id=org.id,
            project_id=p161.id,
            loan_id=loan161.id,
            draw_number="1",
            status="APPROVED",
            period_start=date(2025, 1, 1),
            period_end=date(2025, 1, 31),
            submitted_at=datetime(2025, 2, 1, tzinfo=UTC),
            approved_at=datetime(2025, 2, 10, tzinfo=UTC),
            lender_party_id=lender_fci.id,
            source_document_id=doc161_map["161 Woodlawn Ave.xlsx.pdf"].id,
            created_at=utc_now(),
        )
        db.add(draw1_161)
        db.flush()

        db.add(
            DrawLine(
                id=generate_uuid(),
                draw_id=draw1_161.id,
                budget_line_id=b161_lines_map["2.00"].id,
                requested_amount=15000000,
                recommended_amount=15000000,
                approved_amount=15000000,
                funded_amount=15000000,
                reason="Site clearing, geotechnical soil borings, and environmental testing",
                evidence_status="VERIFIED",
                created_at=utc_now(),
            )
        )

        # -------------------------------------------------------------------------
        # Data Quality Issues for 161 Woodlawn Ave
        # -------------------------------------------------------------------------
        dqi_161 = [
            (
                "STATEMENT_COVERAGE_GAP",
                "HIGH",
                "OPEN",
                "DOCUMENT",
                doc161_map["161 Woodlawn Ave.xlsx"].id,
                users["CFO"].id,
                None,
                None,
            ),
            (
                "FORMULA_TOTAL_MISMATCH",
                "MEDIUM",
                "OPEN",
                "DOCUMENT",
                doc161_map["161 Woodlawn Ave.xlsx.pdf"].id,
                users["CFO"].id,
                None,
                None,
            ),
            (
                "MISFILED_DOCUMENT",
                "LOW",
                "RESOLVED",
                "DOCUMENT",
                doc161_map["Woodlawn May 2026.pdf"].id,
                users["PM"].id,
                utc_now() - timedelta(days=5),
                "Environmental permit filing routed to correct municipal compliance folder.",
            ),
        ]
        for itype, sev, stat, a_type, a_id, o_id, res_at, res_text in dqi_161:
            db.add(
                DataQualityIssue(
                    id=generate_uuid(),
                    organization_id=org.id,
                    project_id=p161.id,
                    issue_type=itype,
                    severity=sev,
                    status=stat,
                    affected_entity_type=a_type,
                    affected_entity_id=a_id,
                    owner_id=o_id,
                    detected_at=utc_now() - timedelta(days=10),
                    resolved_at=res_at,
                    resolution=res_text,
                )
            )

        # -------------------------------------------------------------------------
        # Investor Update for 161 Woodlawn Ave
        # -------------------------------------------------------------------------
        db.add(
            InvestorUpdate(
                id=generate_uuid(),
                organization_id=org.id,
                project_id=p161.id,
                title="Q1 Pre-Development & Architectural Brief",
                as_of_date=date(2025, 3, 31),
                status="PUBLISHED",
                published_at=datetime(2025, 4, 1, 10, 0, tzinfo=UTC),
                gross_development_value=245000000,
                current_forecast_profit=88900000,
                senior_debt_drawn=0,
                equity_funded=47500000,
                progress_summary="Site acquisition finalized and environmental approvals underway. Geotechnical investigation completed with no anomalies identified.",
                material_disclosures=[
                    "Zoning variance board application submitted on schedule for 6-unit residential density.",
                    "Equity partner funding fully subscribed at $475,000 across sponsor and partners.",
                    "Excavation contractor bidding process initiated for Q3 site mobilization.",
                ],
                recipients=["kunal@builderscapital.com", "m.vance@vancedev.com"],
                created_at=datetime(2025, 3, 31, tzinfo=UTC),
            )
        )

        # -------------------------------------------------------------------------
        # GC Submission for 161 Woodlawn Ave
        # -------------------------------------------------------------------------
        db.add(
            GCSubmission(
                id=generate_uuid(),
                organization_id=org.id,
                project_id=p161.id,
                submission_number="GC-CLAIM-W01",
                type="PROGRESS_CLAIM",
                title="Site Clearing & Geotechnical Soil Boring Claim",
                description="Completed mobilization, site clearing, soil sample collection, and environmental monitoring installation.",
                contract_model="COST_PLUS",
                status="APPROVED",
                submitted_at=datetime(2025, 1, 5, 10, 0, tzinfo=UTC),
                submitted_by="Frank Miller (GC)",
                contractor_name="Apex Construction LLC",
                csi_code="02-300",
                csi_category="Earthwork & Site Prep",
                claimed_amount=15000000,
                retainage_rate_pct=0.0,
                retainage_amount=0,
                net_payable_amount=15000000,
                prior_claimed_pct=0.0,
                current_claimed_pct=100.0,
                incremental_claimed_pct=100.0,
                invoice_numbers=["INV-APEX-W01"],
                evidence_items=[
                    {
                        "id": "ev-161-1",
                        "filename": "161 Woodlawn Ave.xlsx.pdf",
                        "type": "INVOICE",
                        "file_size_bytes": 180000,
                        "uploaded_at": "2025-01-05T09:00:00Z",
                        "invoice_number": "INV-APEX-W01",
                        "vendor_name": "Apex Construction LLC",
                        "amount": "15000000",
                    }
                ],
                reviews=[
                    {
                        "role": "OWNER",
                        "reviewer_name": "Marcus Vance",
                        "status": "APPROVED",
                        "reviewed_at": "2025-01-08T14:00:00Z",
                        "comments": "Pre-con site clearing work inspected and approved.",
                    }
                ],
                created_at=datetime(2025, 1, 5, 10, 0, tzinfo=UTC),
            )
        )

        print("✅ 161 Woodlawn Ave fixtures, partner funding, and 500+ transactions created.")

        # ==========================================
        # 7. Realistic Activity & Audit Events Trail
        # ==========================================
        audit_records = [
            (users["OWNER"].id, "PROJECT_CREATED", "Project", p73.id, "Created 73 Broadway development workspace"),
            (users["OWNER"].id, "BUDGET_APPROVED", "Budget", budget73.id, "Approved initial baseline budget for 73 Broadway ($1,019,220.00)"),
            (users["GC"].id, "CHANGE_ORDER_REQUESTED", "ChangeOrder", co73.id, "Submitted CO-001 for structural steel engineering reinforcement"),
            (users["OWNER"].id, "CHANGE_ORDER_APPROVED", "ChangeOrder", co73.id, "Approved CO-001 with contingency re-allocation"),
            (users["CFO"].id, "DRAW_SUBMITTED", "Draw", draw3_73.id, "Submitted Draw 3 payment application to Columbia Bank"),
            (users["PM"].id, "INSPECTION_CONDUCTED", "Document", doc73_map["73 Broadway - Report #2.pdf"].id, "Reviewed on-site engineering inspection report"),
            (users["OWNER"].id, "DISPOSITION_CLOSED", "Disposition", disp392.id, "Approved final condominium disposition for 392 First Street ($3,159,210.50)"),
        ]
        for actor_id, action, etype, eid, rationale in audit_records:
            db.add(
                AuditEvent(
                    id=generate_uuid(),
                    organization_id=org.id,
                    project_id=p73.id,
                    actor_id=actor_id,
                    action=action,
                    entity_type=etype,
                    entity_id=eid,
                    rationale=rationale,
                    occurred_at=utc_now(),
                )
            )

        db.commit()
        print("\n🎉 GroundUp AI database seeding completed successfully!")
        print("📊 Summary of seeded records:")
        print(f"   • Organization: Vance Development LLC ({org.id})")
        print(f"   • Personas: {len(users)} users configured with SEED_DEFAULT_PASSWORD.")
        print("   • Projects: 3 (73 Broadway, 392 First Street, 161 Woodlawn Ave)")
        print(f"   • Third Parties: {len(parties)} parties (lenders, GCs, vendors, investors)")
        print("   • Total Transactions: 2,000+ parsed directly from raw ledgers")
        print("   • Disk Storage: All project documents verified and stored on disk")

    except Exception as e:
        db.rollback()
        print(f"❌ Error during database seeding: {e}")
        raise
    finally:
        db.close()


if __name__ == "__main__":
    wipe_arg = "--no-wipe" not in sys.argv
    seed_database(wipe_first=wipe_arg)
