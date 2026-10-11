import uuid

from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session

from app.core.auth import require_role
from app.core.envelope import ResponseEnvelope
from app.db.models import User
from app.db.session import get_db
from app.modules.spend.schemas import (
    ApproveMappingRequest,
    FinancialAccountCreate,
    FinancialAccountRead,
    ImportBatchCreate,
    ImportBatchRead,
    InterProjectTransferCreate,
    InterProjectTransferRead,
    PeriodSignoffRequest,
    ReconciliationDecisionRequest,
    ReconciliationMatchRead,
    SourceRecordRead,
    SpendAllocationRequest,
    SpendRecordRead,
    SpendReverseRequest,
    StatementPeriodCreate,
    StatementPeriodRead,
)
from app.modules.spend.service import SpendService

router = APIRouter(tags=["Spend & Accounts"])


# ---------------------------------------------------------
# Financial Accounts
# ---------------------------------------------------------
@router.get("/financial-accounts", response_model=ResponseEnvelope[list[FinancialAccountRead]])
async def list_financial_accounts_endpoint(
    user: User = Depends(require_role(["OWNER", "CFO"])),
    db: Session = Depends(get_db),
):
    service = SpendService(db)
    accounts = service.list_financial_accounts(user)
    return ResponseEnvelope(
        data=[
            FinancialAccountRead(
                id=str(a.id),
                organization_id=str(a.organization_id),
                party_id=str(a.party_id) if a.party_id else None,
                institution=a.institution,
                masked_identifier=a.masked_identifier,
                account_purpose=a.account_purpose,
                currency=a.currency,
                active_from=a.active_from.isoformat(),
                active_to=a.active_to.isoformat() if a.active_to else None,
                status=a.status,
                created_at=a.created_at.isoformat(),
            )
            for a in accounts
        ]
    )


@router.post("/financial-accounts", response_model=ResponseEnvelope[FinancialAccountRead])
async def create_financial_account_endpoint(
    data: FinancialAccountCreate,
    user: User = Depends(require_role(["OWNER", "CFO"])),
    db: Session = Depends(get_db),
):
    service = SpendService(db)
    acc = service.create_financial_account(user, data)
    db.commit()
    return ResponseEnvelope(
        data=FinancialAccountRead(
            id=str(acc.id),
            organization_id=str(acc.organization_id),
            party_id=str(acc.party_id) if acc.party_id else None,
            institution=acc.institution,
            masked_identifier=acc.masked_identifier,
            account_purpose=acc.account_purpose,
            currency=acc.currency,
            active_from=acc.active_from.isoformat(),
            active_to=acc.active_to.isoformat() if acc.active_to else None,
            status=acc.status,
            created_at=acc.created_at.isoformat(),
        )
    )


@router.post(
    "/financial-accounts/{id}/approve-mapping",
    response_model=ResponseEnvelope[FinancialAccountRead],
)
async def approve_account_mapping_endpoint(
    id: uuid.UUID,
    data: ApproveMappingRequest,
    user: User = Depends(require_role(["OWNER"])),
    db: Session = Depends(get_db),
):
    service = SpendService(db)
    acc = service.approve_account_mapping(user, id, data)
    db.commit()
    return ResponseEnvelope(
        data=FinancialAccountRead(
            id=str(acc.id),
            organization_id=str(acc.organization_id),
            party_id=str(acc.party_id) if acc.party_id else None,
            institution=acc.institution,
            masked_identifier=acc.masked_identifier,
            account_purpose=acc.account_purpose,
            currency=acc.currency,
            active_from=acc.active_from.isoformat(),
            active_to=acc.active_to.isoformat() if acc.active_to else None,
            status=acc.status,
            created_at=acc.created_at.isoformat(),
        )
    )


# ---------------------------------------------------------
# Statement Periods
# ---------------------------------------------------------
@router.get(
    "/financial-accounts/{id}/statement-periods",
    response_model=ResponseEnvelope[list[StatementPeriodRead]],
)
async def list_statement_periods_endpoint(
    id: uuid.UUID,
    user: User = Depends(require_role(["OWNER", "CFO"])),
    db: Session = Depends(get_db),
):
    service = SpendService(db)
    periods = service.list_statement_periods(user, id)
    return ResponseEnvelope(
        data=[
            StatementPeriodRead(
                id=str(p.id),
                financial_account_id=str(p.financial_account_id),
                period_start=p.period_start.isoformat(),
                period_end=p.period_end.isoformat(),
                opening_balance=p.opening_balance,
                closing_balance=p.closing_balance,
                source_document_id=str(p.source_document_id) if p.source_document_id else None,
                coverage_status=p.coverage_status,
                reconciled_by=str(p.reconciled_by) if p.reconciled_by else None,
                reconciled_at=p.reconciled_at.isoformat() if p.reconciled_at else None,
                created_at=p.created_at.isoformat(),
            )
            for p in periods
        ]
    )


@router.post(
    "/financial-accounts/{id}/statement-periods",
    response_model=ResponseEnvelope[StatementPeriodRead],
)
async def create_statement_period_endpoint(
    id: uuid.UUID,
    data: StatementPeriodCreate,
    user: User = Depends(require_role(["OWNER", "CFO"])),
    db: Session = Depends(get_db),
):
    service = SpendService(db)
    period = service.create_statement_period(user, id, data)
    db.commit()
    return ResponseEnvelope(
        data=StatementPeriodRead(
            id=str(period.id),
            financial_account_id=str(period.financial_account_id),
            period_start=period.period_start.isoformat(),
            period_end=period.period_end.isoformat(),
            opening_balance=period.opening_balance,
            closing_balance=period.closing_balance,
            source_document_id=str(period.source_document_id)
            if period.source_document_id
            else None,
            coverage_status=period.coverage_status,
            reconciled_by=str(period.reconciled_by) if period.reconciled_by else None,
            reconciled_at=period.reconciled_at.isoformat() if period.reconciled_at else None,
            created_at=period.created_at.isoformat(),
        )
    )


@router.post(
    "/statement-periods/{id}/signoff", response_model=ResponseEnvelope[StatementPeriodRead]
)
async def signoff_statement_period_endpoint(
    id: uuid.UUID,
    data: PeriodSignoffRequest,
    user: User = Depends(require_role(["OWNER", "CFO"])),
    db: Session = Depends(get_db),
):
    service = SpendService(db)
    period = service.signoff_statement_period(user, id, data)
    db.commit()
    return ResponseEnvelope(
        data=StatementPeriodRead(
            id=str(period.id),
            financial_account_id=str(period.financial_account_id),
            period_start=period.period_start.isoformat(),
            period_end=period.period_end.isoformat(),
            opening_balance=period.opening_balance,
            closing_balance=period.closing_balance,
            source_document_id=str(period.source_document_id)
            if period.source_document_id
            else None,
            coverage_status=period.coverage_status,
            reconciled_by=str(period.reconciled_by) if period.reconciled_by else None,
            reconciled_at=period.reconciled_at.isoformat() if period.reconciled_at else None,
            created_at=period.created_at.isoformat(),
        )
    )


# ---------------------------------------------------------
# Import Batches
# ---------------------------------------------------------
@router.post(
    "/projects/{pid}/import-batches",
    response_model=ResponseEnvelope[ImportBatchRead],
    status_code=status.HTTP_202_ACCEPTED,
)
async def create_import_batch_endpoint(
    pid: uuid.UUID,
    data: ImportBatchCreate,
    user: User = Depends(require_role(["CFO", "OWNER"])),
    db: Session = Depends(get_db),
):
    service = SpendService(db)
    batch = service.create_import_batch(user, pid, data)
    db.commit()
    return ResponseEnvelope(
        data=ImportBatchRead(
            id=str(batch.id),
            organization_id=str(batch.organization_id),
            project_id=str(batch.project_id),
            adapter=batch.adapter,
            version=batch.version,
            status=batch.status,
            total_rows=batch.total_rows,
            accepted_rows=batch.accepted_rows,
            rejected_rows=batch.rejected_rows,
            duplicate_rows=batch.duplicate_rows,
            uploaded_by=str(batch.uploaded_by),
            created_at=batch.created_at.isoformat(),
        )
    )


@router.get("/import-batches/{id}", response_model=ResponseEnvelope[ImportBatchRead])
async def get_import_batch_endpoint(
    id: uuid.UUID,
    user: User = Depends(require_role(["CFO", "OWNER"])),
    db: Session = Depends(get_db),
):
    service = SpendService(db)
    batch = service.get_import_batch(user, id)
    return ResponseEnvelope(
        data=ImportBatchRead(
            id=str(batch.id),
            organization_id=str(batch.organization_id),
            project_id=str(batch.project_id),
            adapter=batch.adapter,
            version=batch.version,
            status=batch.status,
            total_rows=batch.total_rows,
            accepted_rows=batch.accepted_rows,
            rejected_rows=batch.rejected_rows,
            duplicate_rows=batch.duplicate_rows,
            uploaded_by=str(batch.uploaded_by),
            created_at=batch.created_at.isoformat(),
        )
    )


@router.get(
    "/import-batches/{id}/source-records", response_model=ResponseEnvelope[list[SourceRecordRead]]
)
async def list_import_source_records_endpoint(
    id: uuid.UUID,
    user: User = Depends(require_role(["CFO", "OWNER"])),
    db: Session = Depends(get_db),
):
    service = SpendService(db)
    records = service.list_import_source_records(user, id)
    return ResponseEnvelope(
        data=[
            SourceRecordRead(
                id=str(r.id),
                document_id=str(r.document_id) if r.document_id else None,
                import_batch_id=str(r.import_batch_id) if r.import_batch_id else None,
                project_candidate_id=str(r.project_candidate_id)
                if r.project_candidate_id
                else None,
                source_kind=r.source_kind,
                sheet_name=r.sheet_name,
                row_number=r.row_number,
                cell_range=r.cell_range,
                raw_payload=r.raw_payload,
                raw_formula=r.raw_formula,
                normalization_status=r.normalization_status,
                record_fingerprint=r.record_fingerprint,
                created_at=r.created_at.isoformat(),
            )
            for r in records
        ]
    )


# ---------------------------------------------------------
# Reconciliation Matches
# ---------------------------------------------------------
@router.get(
    "/projects/{pid}/reconciliation/queue",
    response_model=ResponseEnvelope[list[ReconciliationMatchRead]],
)
async def get_reconciliation_queue_endpoint(
    pid: uuid.UUID,
    user: User = Depends(require_role(["CFO", "OWNER"])),
    db: Session = Depends(get_db),
):
    service = SpendService(db)
    matches = service.get_reconciliation_queue(user, pid)
    return ResponseEnvelope(
        data=[
            ReconciliationMatchRead(
                id=str(m.id),
                organization_id=str(m.organization_id),
                project_id=str(m.project_id),
                transaction_id=str(m.transaction_id),
                spend_record_id=str(m.spend_record_id) if m.spend_record_id else None,
                match_type=m.match_type,
                confidence_score=float(m.confidence_score)
                if m.confidence_score is not None
                else None,
                decision=m.decision,
                decided_by=str(m.decided_by) if m.decided_by else None,
                decided_at=m.decided_at.isoformat() if m.decided_at else None,
                notes=m.notes,
                created_at=m.created_at.isoformat(),
                transaction_amount=m.transaction.amount if m.transaction else None,
                transaction_counterparty=m.transaction.counterparty if m.transaction else None,
            )
            for m in matches
        ]
    )


@router.post(
    "/reconciliation-matches/{id}/decision",
    response_model=ResponseEnvelope[ReconciliationMatchRead],
)
async def decide_reconciliation_match_endpoint(
    id: uuid.UUID,
    data: ReconciliationDecisionRequest,
    user: User = Depends(require_role(["CFO", "OWNER"])),
    db: Session = Depends(get_db),
):
    service = SpendService(db)
    m = service.decide_reconciliation_match(user, id, data)
    db.commit()
    return ResponseEnvelope(
        data=ReconciliationMatchRead(
            id=str(m.id),
            organization_id=str(m.organization_id),
            project_id=str(m.project_id),
            transaction_id=str(m.transaction_id),
            spend_record_id=str(m.spend_record_id) if m.spend_record_id else None,
            match_type=m.match_type,
            confidence_score=float(m.confidence_score) if m.confidence_score is not None else None,
            decision=m.decision,
            decided_by=str(m.decided_by) if m.decided_by else None,
            decided_at=m.decided_at.isoformat() if m.decided_at else None,
            notes=m.notes,
            created_at=m.created_at.isoformat(),
            transaction_amount=m.transaction.amount if m.transaction else None,
            transaction_counterparty=m.transaction.counterparty if m.transaction else None,
        )
    )


# ---------------------------------------------------------
# Spend Records: Allocations & Reversals
# ---------------------------------------------------------
@router.post(
    "/spend-records/{id}/allocations", response_model=ResponseEnvelope[list[SpendRecordRead]]
)
async def allocate_spend_record_endpoint(
    id: uuid.UUID,
    data: SpendAllocationRequest,
    user: User = Depends(require_role(["CFO", "OWNER"])),
    db: Session = Depends(get_db),
):
    service = SpendService(db)
    records = service.allocate_spend_record(user, id, data)
    db.commit()
    return ResponseEnvelope(
        data=[
            SpendRecordRead(
                id=str(s.id),
                project_id=str(s.project_id),
                vendor_party_id=str(s.vendor_party_id) if s.vendor_party_id else None,
                transaction_date=s.transaction_date.isoformat(),
                amount=s.amount,
                currency=s.currency,
                description=s.description,
                status=s.status,
                evidence_strength=s.evidence_strength,
                source_document_id=str(s.source_document_id) if s.source_document_id else None,
                transaction_id=str(s.transaction_id) if s.transaction_id else None,
                budget_line_id=str(s.budget_line_id) if s.budget_line_id else None,
                match_status=s.match_status,
                reviewed_by=str(s.reviewed_by) if s.reviewed_by else None,
                reviewed_at=s.reviewed_at.isoformat() if s.reviewed_at else None,
                created_at=s.created_at.isoformat(),
            )
            for s in records
        ]
    )


@router.post("/spend-records/{id}/reverse", response_model=ResponseEnvelope[SpendRecordRead])
async def reverse_spend_record_endpoint(
    id: uuid.UUID,
    data: SpendReverseRequest,
    user: User = Depends(require_role(["CFO", "OWNER"])),
    db: Session = Depends(get_db),
):
    service = SpendService(db)
    rev = service.reverse_spend_record(user, id, data)
    db.commit()
    return ResponseEnvelope(
        data=SpendRecordRead(
            id=str(rev.id),
            project_id=str(rev.project_id),
            vendor_party_id=str(rev.vendor_party_id) if rev.vendor_party_id else None,
            transaction_date=rev.transaction_date.isoformat(),
            amount=rev.amount,
            currency=rev.currency,
            description=rev.description,
            status=rev.status,
            evidence_strength=rev.evidence_strength,
            source_document_id=str(rev.source_document_id) if rev.source_document_id else None,
            transaction_id=str(rev.transaction_id) if rev.transaction_id else None,
            budget_line_id=str(rev.budget_line_id) if rev.budget_line_id else None,
            match_status=rev.match_status,
            reviewed_by=str(rev.reviewed_by) if rev.reviewed_by else None,
            reviewed_at=rev.reviewed_at.isoformat() if rev.reviewed_at else None,
            created_at=rev.created_at.isoformat(),
        )
    )


# ---------------------------------------------------------
# Inter-Project Transfers
# ---------------------------------------------------------
@router.post(
    "/projects/{pid}/inter-project-transfers",
    response_model=ResponseEnvelope[InterProjectTransferRead],
)
async def create_inter_project_transfer_endpoint(
    pid: uuid.UUID,
    data: InterProjectTransferCreate,
    user: User = Depends(require_role(["CFO", "OWNER"])),
    db: Session = Depends(get_db),
):
    service = SpendService(db)
    transfer = service.create_inter_project_transfer(user, data)
    db.commit()
    return ResponseEnvelope(
        data=InterProjectTransferRead(
            id=str(transfer.id),
            organization_id=str(transfer.organization_id),
            from_project_id=str(transfer.from_project_id),
            to_project_id=str(transfer.to_project_id),
            transaction_id=str(transfer.transaction_id) if transfer.transaction_id else None,
            amount=transfer.amount,
            type=transfer.type,
            transfer_date=transfer.transfer_date.isoformat(),
            repaid_amount=transfer.repaid_amount,
            repaid_date=transfer.repaid_date.isoformat() if transfer.repaid_date else None,
            status=transfer.status,
            reviewed_by=str(transfer.reviewed_by) if transfer.reviewed_by else None,
            created_at=transfer.created_at.isoformat(),
        )
    )


@router.get(
    "/projects/{pid}/inter-project-transfers",
    response_model=ResponseEnvelope[list[InterProjectTransferRead]],
)
async def list_inter_project_transfers_endpoint(
    pid: uuid.UUID,
    user: User = Depends(require_role(["CFO", "OWNER"])),
    db: Session = Depends(get_db),
):
    service = SpendService(db)
    transfers = service.list_inter_project_transfers(user, pid)
    return ResponseEnvelope(
        data=[
            InterProjectTransferRead(
                id=str(t.id),
                organization_id=str(t.organization_id),
                from_project_id=str(t.from_project_id),
                to_project_id=str(t.to_project_id),
                transaction_id=str(t.transaction_id) if t.transaction_id else None,
                amount=t.amount,
                type=t.type,
                transfer_date=t.transfer_date.isoformat(),
                repaid_amount=t.repaid_amount,
                repaid_date=t.repaid_date.isoformat() if t.repaid_date else None,
                status=t.status,
                reviewed_by=str(t.reviewed_by) if t.reviewed_by else None,
                created_at=t.created_at.isoformat(),
            )
            for t in transfers
        ]
    )
