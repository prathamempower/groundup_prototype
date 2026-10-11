import os

import pytest

from app.core.security import verify_password
from app.db.models import (
    Alert,
    Budget,
    Disposition,
    Document,
    Draw,
    FinancialTransaction,
    InvestorDistribution,
    Organization,
    Project,
    ProjectMilestone,
    Unit,
    User,
)
from app.db.session import SessionLocal


@pytest.fixture(scope="module")
def db_session():
    db = SessionLocal()
    yield db
    db.close()


def test_b11_seed_personas_and_passwords(db_session):
    """Verify that all 5 user personas exist and authenticate with Password123!"""
    expected_users = {
        "m.vance@vancedev.com": ("Marcus", "Vance", "OWNER"),
        "s.lin@vancedev.com": ("Sarah", "Lin", "CFO"),
        "d.ross@vancedev.com": ("David", "Ross", "PM"),
        "frank@apexconstruction.com": ("Frank", "Miller", "GC"),
        "e.rostova@meridiancap.com": ("Elena", "Rostova", "INVESTOR"),
    }

    for email, (first_name, last_name, role) in expected_users.items():
        user = db_session.query(User).filter(User.email == email).first()
        assert user is not None, f"User {email} should exist in seed data"
        assert user.first_name == first_name
        assert user.last_name == last_name
        assert user.role == role
        assert verify_password("Password123!", user.hashed_password), f"Password verification failed for {email}"


def test_b11_seed_73_broadway_live_project(db_session):
    """Verify 73 Broadway has complete active construction fixtures."""
    p73 = (
        db_session.query(Project)
        .join(Project.organization)
        .filter(Project.organization.has(name="Vance Development LLC"), Project.name == "73 Broadway")
        .first()
    )
    assert p73 is not None
    assert p73.status == "ACTIVE"
    assert p73.contract_model == "COST_PLUS"

    # Budget
    budget = db_session.query(Budget).filter(Budget.project_id == p73.id, Budget.status == "APPROVED").first()
    assert budget is not None
    assert len(budget.lines) >= 7

    # Over 100 transactions
    tx_count = db_session.query(FinancialTransaction).filter(FinancialTransaction.project_id == p73.id).count()
    assert tx_count >= 100, f"Expected at least 100 transactions, found {tx_count}"

    # Draws: Draw 1 and Draw 3
    draws = db_session.query(Draw).filter(Draw.project_id == p73.id).all()
    draw_numbers = {d.draw_number for d in draws}
    assert "1" in draw_numbers
    assert "3" in draw_numbers

    # Draw 3 short-funded
    draw_3 = next(d for d in draws if d.draw_number == "3")
    assert draw_3.status in ("PARTIALLY_APPROVED", "SUBMITTED")
    total_requested = sum(line.requested_amount for line in draw_3.lines)
    total_approved = sum(line.approved_amount for line in draw_3.lines)
    assert total_requested > total_approved

    # Unallocated cash transaction exists
    unalloc_tx = (
        db_session.query(FinancialTransaction)
        .filter(
            FinancialTransaction.project_id == p73.id,
            FinancialTransaction.memo.like("%not yet allocated%"),
        )
        .first()
    )
    assert unalloc_tx is not None
    assert unalloc_tx.amount == 15000000

    # At-risk milestone
    ms = (
        db_session.query(ProjectMilestone)
        .filter(
            ProjectMilestone.project_id == p73.id,
            ProjectMilestone.name.like("%Structural Steel%"),
        )
        .first()
    )
    assert ms is not None
    assert ms.forecast_completion_date is not None
    assert ms.planned_completion_date is not None
    assert ms.forecast_completion_date > ms.planned_completion_date

    # Alerts exist
    alerts = db_session.query(Alert).filter(Alert.project_id == p73.id).all()
    assert len(alerts) >= 2


def test_b11_seed_392_first_street_completed_project(db_session):
    """Verify 392 First Street has 15 closed draws, 12 sold condo units, closed disposition, and distributions."""
    p392 = (
        db_session.query(Project)
        .join(Project.organization)
        .filter(Project.organization.has(name="Vance Development LLC"), Project.name == "392 First Street")
        .first()
    )
    assert p392 is not None
    assert p392.status == "COMPLETED"

    # 15 draws
    draw_count = db_session.query(Draw).filter(Draw.project_id == p392.id).count()
    assert draw_count == 15, f"Expected 15 draws, found {draw_count}"

    # 12 units
    unit_count = db_session.query(Unit).filter(Unit.project_id == p392.id).count()
    assert unit_count == 12, f"Expected 12 units, found {unit_count}"

    # Closed disposition
    disp = db_session.query(Disposition).filter(Disposition.project_id == p392.id).first()
    assert disp is not None
    assert disp.sale_price > 0
    assert disp.net_proceeds > 0

    # Distributions
    dist_count = (
        db_session.query(InvestorDistribution)
        .join(InvestorDistribution.project_investor)
        .filter(InvestorDistribution.project_investor.has(project_id=p392.id))
        .count()
    )
    assert dist_count >= 2


def test_b11_seed_documents_on_disk(db_session):
    """Verify seeded documents point to existing files on disk."""
    from app.core.config import settings

    org = (
        db_session.query(Organization)
        .filter(Organization.name == "Vance Development LLC")
        .first()
    )
    assert org is not None
    docs = db_session.query(Document).filter(Document.organization_id == org.id).all()
    assert len(docs) > 0
    for doc in docs:
        file_path = os.path.join(settings.STORAGE_DIR, doc.storage_key)
        assert os.path.exists(file_path), f"File {file_path} should exist on disk"
