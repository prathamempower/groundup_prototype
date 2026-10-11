import uuid
from datetime import date

import pytest
from sqlalchemy import select

from app.db.audit import record_audit_event
from app.db.models import (
    Budget,
    BudgetLine,
    FinancialAccount,
    FinancialTransaction,
    Organization,
    Project,
    User,
)
from app.db.session import SessionLocal
from app.db.unit_of_work import UnitOfWork


def test_models_and_uow_transaction():
    with UnitOfWork() as uow:
        # Create organization
        org = Organization(name="Test GroundUp Org")
        uow.db.add(org)
        uow.db.flush()

        # Create user
        user = User(
            organization_id=org.id,
            email=f"cfo_{uuid.uuid4().hex[:6]}@groundup.test",
            hashed_password="argon2_hashed_dummy",
            first_name="Jane",
            last_name="Doe",
            role="CFO",
        )
        uow.db.add(user)
        uow.db.flush()

        # Create project
        project = Project(
            organization_id=org.id,
            name="73 Broadway Pilot",
            project_entity="73 Broadway LLC",
            address="73 Broadway, New York, NY",
            lifecycle_stage="CONSTRUCTION",
            contract_model="GMP",
            status="ACTIVE",
            currency="USD",
        )
        uow.db.add(project)
        uow.db.flush()

        # Create budget & line
        budget = Budget(
            organization_id=org.id,
            project_id=project.id,
            version_number=1,
            status="APPROVED",
            total_original_amount=500000000,
            total_current_approved_amount=500000000,
        )
        uow.db.add(budget)
        uow.db.flush()

        line = BudgetLine(
            budget_id=budget.id,
            code="03-3000",
            name="Cast-in-Place Concrete",
            category="Structural",
            original_amount=12000000,  # $120,000.00
            current_approved_amount=12000000,
            is_draw_eligible=True,
            sort_order=1,
        )
        uow.db.add(line)
        uow.db.flush()

        # Financial write with audit event
        audit = record_audit_event(
            db=uow.db,
            organization_id=org.id,
            project_id=project.id,
            actor_id=user.id,
            action="BUDGET_BASELINE_APPROVED",
            entity_type="Budget",
            entity_id=budget.id,
            previous_value=None,
            new_value={"total": 500000000, "status": "APPROVED"},
            rationale="Initial baseline approved by CFO",
        )

        uow.commit()

        assert org.id is not None
        assert user.id is not None
        assert project.id is not None
        assert budget.id is not None
        assert line.id is not None
        assert audit.id is not None
        assert audit.action == "BUDGET_BASELINE_APPROVED"


def test_unique_external_id_and_financial_account():
    session = SessionLocal()
    try:
        org = session.scalars(select(Organization)).first()
        assert org is not None

        # Create financial account
        account = FinancialAccount(
            organization_id=org.id,
            institution="JPMorgan Chase",
            masked_identifier="*9876",
            account_purpose="OPERATING",
            currency="USD",
            active_from=date(2026, 1, 1),
            status="ACTIVE",
        )
        session.add(account)
        session.commit()

        # First transaction with external_id
        tx1 = FinancialTransaction(
            financial_account_id=account.id,
            transaction_date=date(2026, 2, 1),
            amount=500000,  # $5,000.00
            direction="OUTFLOW",
            counterparty="Ace Concrete Supplies",
            external_id="ext_tx_unique_001",
            cleared_status="CLEARED",
        )
        session.add(tx1)
        session.commit()

        # Duplicate external_id on same financial account must violate constraint
        tx2 = FinancialTransaction(
            financial_account_id=account.id,
            transaction_date=date(2026, 2, 2),
            amount=200000,
            direction="OUTFLOW",
            counterparty="Ace Concrete Supplies",
            external_id="ext_tx_unique_001",
            cleared_status="CLEARED",
        )
        from sqlalchemy.exc import IntegrityError

        session.add(tx2)
        with pytest.raises(IntegrityError):
            session.commit()
        session.rollback()
    finally:
        session.close()
