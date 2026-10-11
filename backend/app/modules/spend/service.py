import csv
import hashlib
import io
import uuid
from datetime import date

from sqlalchemy import select
from sqlalchemy.orm import Session

from app.core.errors import (
    AllocationNotBalancedException,
    CoverageGapException,
    ForbiddenException,
    NotFoundException,
    PeriodAlreadyReconciledException,
    ValidationFailedException,
)
from app.db.audit import record_audit_event
from app.db.models import (
    BudgetLine,
    DataQualityIssue,
    FinancialAccount,
    FinancialTransaction,
    ImportBatch,
    InterProjectTransfer,
    Project,
    ReconciliationMatch,
    SourceRecord,
    SpendRecord,
    StatementPeriod,
    User,
    generate_uuid,
    utc_now,
)
from app.modules.spend.schemas import (
    ApproveMappingRequest,
    FinancialAccountCreate,
    ImportBatchCreate,
    InterProjectTransferCreate,
    PeriodSignoffRequest,
    ReconciliationDecisionRequest,
    SpendAllocationRequest,
    SpendReverseRequest,
    StatementPeriodCreate,
)


class SpendService:
    def __init__(self, db: Session):
        self.db = db

    # ---------------------------------------------------------
    # 1. FINANCIAL ACCOUNTS
    # ---------------------------------------------------------
    def create_financial_account(
        self, user: User, data: FinancialAccountCreate
    ) -> FinancialAccount:
        if user.role not in ["OWNER", "CFO"]:
            raise ForbiddenException(
                message="Only Owners and CFOs can register financial accounts."
            )

        party_uuid = uuid.UUID(data.party_id) if data.party_id else None

        acc = FinancialAccount(
            id=generate_uuid(),
            organization_id=user.organization_id,
            party_id=party_uuid,
            institution=data.institution,
            masked_identifier=data.masked_identifier,
            account_purpose=data.account_purpose,
            currency=data.currency,
            active_from=data.active_from,
            active_to=data.active_to,
            status="ACTIVE",
            created_at=utc_now(),
        )
        self.db.add(acc)
        self.db.flush()

        record_audit_event(
            db=self.db,
            organization_id=user.organization_id,
            actor_id=user.id,
            action="FINANCIAL_ACCOUNT_REGISTERED",
            entity_type="FinancialAccount",
            entity_id=acc.id,
            new_value={"institution": acc.institution, "masked_identifier": acc.masked_identifier},
            rationale="User registered financial account",
        )
        return acc

    def list_financial_accounts(self, user: User) -> list[FinancialAccount]:
        stmt = select(FinancialAccount).where(
            FinancialAccount.organization_id == user.organization_id
        )
        return list(self.db.scalars(stmt).all())

    def approve_account_mapping(
        self, user: User, account_id: uuid.UUID, data: ApproveMappingRequest
    ) -> FinancialAccount:
        if user.role != "OWNER":
            raise ForbiddenException(message="Only Owners can approve account mappings.")

        acc = self.db.get(FinancialAccount, account_id)
        if not acc or acc.organization_id != user.organization_id:
            raise NotFoundException(message="Financial account not found.")

        proj_uuid = uuid.UUID(data.project_id)
        project = self.db.get(Project, proj_uuid)
        if not project or project.organization_id != user.organization_id:
            raise NotFoundException(message="Target project not found.")

        # Update transactions for this account with the approved project_id
        txs = self.db.scalars(
            select(FinancialTransaction).where(FinancialTransaction.financial_account_id == acc.id)
        ).all()
        for tx in txs:
            tx.project_id = project.id

        acc.status = "MAPPED_APPROVED"
        self.db.flush()

        record_audit_event(
            db=self.db,
            organization_id=user.organization_id,
            project_id=project.id,
            actor_id=user.id,
            action="ACCOUNT_MAPPING_APPROVED",
            entity_type="FinancialAccount",
            entity_id=acc.id,
            new_value={"project_id": str(project.id)},
            rationale=data.rationale or "Owner approved financial account to project mapping",
        )
        return acc

    # ---------------------------------------------------------
    # 2. STATEMENT PERIODS & SIGNOFF
    # ---------------------------------------------------------
    def create_statement_period(
        self, user: User, account_id: uuid.UUID, data: StatementPeriodCreate
    ) -> StatementPeriod:
        if user.role not in ["OWNER", "CFO"]:
            raise ForbiddenException(message="Only Owners and CFOs can create statement periods.")

        acc = self.db.get(FinancialAccount, account_id)
        if not acc or acc.organization_id != user.organization_id:
            raise NotFoundException(message="Financial account not found.")

        if data.period_start > data.period_end:
            raise ValidationFailedException(message="period_start must be before period_end.")

        source_doc_uuid = uuid.UUID(data.source_document_id) if data.source_document_id else None

        # Check coverage gap against prior statement periods for this account
        prior_period = self.db.scalars(
            select(StatementPeriod)
            .where(
                StatementPeriod.financial_account_id == acc.id,
                StatementPeriod.period_end <= data.period_start,
            )
            .order_by(StatementPeriod.period_end.desc())
        ).first()

        coverage_status = "ACTIVE"
        if prior_period:
            days_gap = (data.period_start - prior_period.period_end).days
            if days_gap > 1:
                coverage_status = "GAP"

        period = StatementPeriod(
            id=generate_uuid(),
            financial_account_id=acc.id,
            period_start=data.period_start,
            period_end=data.period_end,
            opening_balance=data.opening_balance,
            closing_balance=data.closing_balance,
            source_document_id=source_doc_uuid,
            coverage_status=coverage_status,
            created_at=utc_now(),
        )
        self.db.add(period)
        self.db.flush()

        record_audit_event(
            db=self.db,
            organization_id=user.organization_id,
            actor_id=user.id,
            action="STATEMENT_PERIOD_CREATED",
            entity_type="StatementPeriod",
            entity_id=period.id,
            new_value={
                "period_start": str(period.period_start),
                "period_end": str(period.period_end),
                "coverage_status": period.coverage_status,
            },
            rationale="User added statement period",
        )
        return period

    def list_statement_periods(self, user: User, account_id: uuid.UUID) -> list[StatementPeriod]:
        acc = self.db.get(FinancialAccount, account_id)
        if not acc or acc.organization_id != user.organization_id:
            raise NotFoundException(message="Financial account not found.")

        stmt = (
            select(StatementPeriod)
            .where(StatementPeriod.financial_account_id == acc.id)
            .order_by(StatementPeriod.period_start.desc())
        )
        return list(self.db.scalars(stmt).all())

    def signoff_statement_period(
        self, user: User, period_id: uuid.UUID, data: PeriodSignoffRequest
    ) -> StatementPeriod:
        if user.role not in ["OWNER", "CFO"]:
            raise ForbiddenException(message="Only Owners and CFOs can sign off statement periods.")

        period = self.db.get(StatementPeriod, period_id)
        if not period:
            raise NotFoundException(message="Statement period not found.")

        acc = self.db.get(FinancialAccount, period.financial_account_id)
        if not acc or acc.organization_id != user.organization_id:
            raise NotFoundException(message="Statement period not found.")

        if period.reconciled_at is not None:
            raise PeriodAlreadyReconciledException(
                message="Statement period has already been signed off."
            )

        # Check coverage control
        if period.coverage_status == "GAP" and not data.waiver_reason:
            raise CoverageGapException(
                message="Cannot sign off period with coverage gap without an explicit waiver reason."
            )

        # Check balance control: opening_balance + sum(inflow) - sum(outflow) == closing_balance
        txs = self.db.scalars(
            select(FinancialTransaction).where(
                FinancialTransaction.financial_account_id == acc.id,
                FinancialTransaction.transaction_date >= period.period_start,
                FinancialTransaction.transaction_date <= period.period_end,
                FinancialTransaction.cleared_status == "CLEARED",
            )
        ).all()

        net_flow = 0
        for tx in txs:
            if tx.direction == "INFLOW":
                net_flow += tx.amount
            else:
                net_flow -= tx.amount

        calc_closing = period.opening_balance + net_flow
        if calc_closing != period.closing_balance and not data.waiver_reason:
            raise CoverageGapException(
                message=f"Balance mismatch: opening ({period.opening_balance}) + net transactions ({net_flow}) = {calc_closing}, but statement closing is {period.closing_balance}. Waiver required to sign off."
            )

        period.reconciled_by = user.id
        period.reconciled_at = utc_now()
        period.coverage_status = "RECONCILED"
        self.db.flush()

        record_audit_event(
            db=self.db,
            organization_id=user.organization_id,
            actor_id=user.id,
            action="STATEMENT_PERIOD_SIGNED_OFF",
            entity_type="StatementPeriod",
            entity_id=period.id,
            new_value={"reconciled_by": str(user.id), "waiver_reason": data.waiver_reason},
            rationale=data.waiver_reason or "Reconciliation controls passed",
        )
        return period

    # ---------------------------------------------------------
    # 3. IMPORT BATCHES & SOURCE ROWS (CSV / XLSX)
    # ---------------------------------------------------------
    def create_import_batch(
        self, user: User, project_id: uuid.UUID, data: ImportBatchCreate
    ) -> ImportBatch:
        if user.role not in ["OWNER", "CFO"]:
            raise ForbiddenException(message="Only Owners and CFOs can import batches.")

        project = self.db.get(Project, project_id)
        if not project or project.organization_id != user.organization_id:
            raise NotFoundException(message="Project not found.")

        acc_uuid = uuid.UUID(data.financial_account_id) if data.financial_account_id else None
        acc: FinancialAccount | None = None
        if acc_uuid:
            acc = self.db.get(FinancialAccount, acc_uuid)
            if not acc or acc.organization_id != user.organization_id:
                raise NotFoundException(message="Financial account not found.")

        batch = ImportBatch(
            id=generate_uuid(),
            organization_id=user.organization_id,
            project_id=project.id,
            adapter=data.adapter,
            version=data.version,
            status="CONFIRMED",
            total_rows=0,
            accepted_rows=0,
            rejected_rows=0,
            duplicate_rows=0,
            uploaded_by=user.id,
            created_at=utc_now(),
        )
        self.db.add(batch)
        self.db.flush()

        # Parse CSV lines
        csv_file = io.StringIO(data.raw_content.strip())
        reader = csv.DictReader(csv_file)

        mapping = data.column_mapping or {
            "Date": "transaction_date",
            "Amount": "amount",
            "Description": "description",
            "ExternalId": "external_id",
            "Direction": "direction",
        }

        row_idx = 0
        computed_total_cents = 0

        for row in reader:
            row_idx += 1
            batch.total_rows += 1

            # Extract fields using user-chosen mapping
            raw_date = row.get(mapping.get("Date", "Date")) or row.get("Date") or str(date.today())
            raw_amount = row.get(mapping.get("Amount", "Amount")) or row.get("Amount") or "0"
            raw_desc = (
                row.get(mapping.get("Description", "Description"))
                or row.get("Description")
                or "Imported transaction"
            )
            ext_id = (
                row.get(mapping.get("ExternalId", "ExternalId"))
                or row.get("ExternalId")
                or f"ext_{row_idx}_{uuid.uuid4().hex[:6]}"
            )
            raw_direction = (
                row.get(mapping.get("Direction", "Direction")) or row.get("Direction") or "OUTFLOW"
            ).upper()

            # Parse amount to integer cents
            try:
                # Remove dollar signs or commas
                cleaned_amt = raw_amount.replace("$", "").replace(",", "").strip()
                float_amt = float(cleaned_amt)
                amount_cents = int(round(abs(float_amt) * 100))
            except Exception:
                batch.rejected_rows += 1
                continue

            try:
                tx_date = date.fromisoformat(raw_date.strip())
            except Exception:
                tx_date = date.today()

            computed_total_cents += amount_cents

            fingerprint_content = f"{acc_uuid}_{tx_date}_{amount_cents}_{ext_id}_{raw_desc}"
            fingerprint = hashlib.sha256(fingerprint_content.encode("utf-8")).hexdigest()

            # Check duplicate financial transaction if external_id and account are supplied
            if acc_uuid and ext_id:
                dup_tx = self.db.scalars(
                    select(FinancialTransaction).where(
                        FinancialTransaction.financial_account_id == acc_uuid,
                        FinancialTransaction.external_id == ext_id,
                    )
                ).first()
                if dup_tx:
                    batch.duplicate_rows += 1
                    continue

            # Record immutable SourceRecord
            src_rec = SourceRecord(
                id=generate_uuid(),
                document_id=None,
                import_batch_id=batch.id,
                project_candidate_id=project.id,
                source_kind="CSV_ROW",
                sheet_name="Main",
                row_number=row_idx,
                raw_payload=dict(row),
                normalization_status="ACCEPTED",
                record_fingerprint=fingerprint,
                created_at=utc_now(),
            )
            self.db.add(src_rec)
            self.db.flush()

            # Create FinancialTransaction
            tx = FinancialTransaction(
                id=generate_uuid(),
                project_id=project.id
                if acc
                else None,  # Requires mapped approval to become project cash
                financial_account_id=acc.id if acc else None,
                account_ref=acc.masked_identifier if acc else None,
                transaction_date=tx_date,
                amount=amount_cents,
                direction=raw_direction if raw_direction in ["INFLOW", "OUTFLOW"] else "OUTFLOW",
                counterparty=raw_desc,
                memo=raw_desc,
                source_record_id=src_rec.id,
                external_id=ext_id,
                cleared_status="CLEARED",
                created_at=utc_now(),
            )
            self.db.add(tx)
            self.db.flush()

            # Create corresponding SpendRecord if outflow
            if tx.direction == "OUTFLOW":
                # Check if card settlement (treated as liability payment)
                is_card_settlement = (
                    "CREDIT CARD PAYMENT" in raw_desc.upper() or "AMEX AUTOPAY" in raw_desc.upper()
                )
                evidence_type = "CARD_TRANSACTION" if is_card_settlement else "BANK_TRANSACTION"

                spend = SpendRecord(
                    id=generate_uuid(),
                    project_id=project.id,
                    vendor_party_id=None,
                    transaction_date=tx_date,
                    amount=amount_cents,
                    currency="USD",
                    description=raw_desc,
                    status="NEEDS_REVIEW" if not is_card_settlement else "VERIFIED",
                    evidence_strength=evidence_type,
                    transaction_id=tx.id,
                    budget_line_id=None,
                    match_status="UNMATCHED",
                    created_at=utc_now(),
                )
                self.db.add(spend)
                self.db.flush()

                # Generate a proposed ReconciliationMatch
                rec_match = ReconciliationMatch(
                    id=generate_uuid(),
                    organization_id=user.organization_id,
                    project_id=project.id,
                    transaction_id=tx.id,
                    spend_record_id=spend.id,
                    match_type="EXACT",
                    confidence_score=0.95,
                    decision="SUGGESTED",
                    notes="Auto-matched via import batch",
                    created_at=utc_now(),
                )
                self.db.add(rec_match)

            batch.accepted_rows += 1

        # Check control-total formula mismatch
        if data.control_total is not None and data.control_total != computed_total_cents:
            # Create a DataQualityIssue for formula total mismatch
            dqi = DataQualityIssue(
                id=generate_uuid(),
                organization_id=user.organization_id,
                project_id=project.id,
                issue_type="FORMULA_TOTAL_MISMATCH",
                severity="HIGH",
                status="OPEN",
                affected_entity_type="ImportBatch",
                affected_entity_id=batch.id,
                owner_id=user.id,
                detected_at=utc_now(),
                resolution=f"Workbook reported {data.control_total} but sum of accepted detail rows was {computed_total_cents}.",
            )
            self.db.add(dqi)

        self.db.flush()

        record_audit_event(
            db=self.db,
            organization_id=user.organization_id,
            project_id=project.id,
            actor_id=user.id,
            action="IMPORT_BATCH_CREATED",
            entity_type="ImportBatch",
            entity_id=batch.id,
            new_value={
                "total_rows": batch.total_rows,
                "accepted_rows": batch.accepted_rows,
                "rejected_rows": batch.rejected_rows,
            },
            rationale="User imported CSV transactions batch",
        )
        return batch

    def get_import_batch(self, user: User, batch_id: uuid.UUID) -> ImportBatch:
        batch = self.db.get(ImportBatch, batch_id)
        if not batch or batch.organization_id != user.organization_id:
            raise NotFoundException(message="Import batch not found.")
        return batch

    def list_import_source_records(self, user: User, batch_id: uuid.UUID) -> list[SourceRecord]:
        batch = self.get_import_batch(user, batch_id)
        stmt = (
            select(SourceRecord)
            .where(SourceRecord.import_batch_id == batch.id)
            .order_by(SourceRecord.row_number)
        )
        return list(self.db.scalars(stmt).all())

    # ---------------------------------------------------------
    # 4. RECONCILIATION MATCHES
    # ---------------------------------------------------------
    def get_reconciliation_queue(
        self, user: User, project_id: uuid.UUID
    ) -> list[ReconciliationMatch]:
        project = self.db.get(Project, project_id)
        if not project or project.organization_id != user.organization_id:
            raise NotFoundException(message="Project not found.")

        stmt = select(ReconciliationMatch).where(
            ReconciliationMatch.project_id == project.id,
            ReconciliationMatch.decision.in_(["SUGGESTED", "SPLIT"]),
        )
        return list(self.db.scalars(stmt).all())

    def decide_reconciliation_match(
        self, user: User, match_id: uuid.UUID, data: ReconciliationDecisionRequest
    ) -> ReconciliationMatch:
        if user.role not in ["OWNER", "CFO"]:
            raise ForbiddenException(
                message="Only Owners and CFOs can review reconciliation matches."
            )

        rec = self.db.get(ReconciliationMatch, match_id)
        if not rec or rec.organization_id != user.organization_id:
            raise NotFoundException(message="Reconciliation match not found.")

        valid_decisions = ["ACCEPT", "SPLIT", "REMAP", "EXCLUDE", "MARK_TRANSFER"]
        decision = data.decision.upper()
        if decision not in valid_decisions:
            raise ValidationFailedException(
                message=f"Invalid decision '{decision}'. Must be one of: {', '.join(valid_decisions)}"
            )

        spend = self.db.get(SpendRecord, rec.spend_record_id) if rec.spend_record_id else None

        if decision == "ACCEPT":
            rec.decision = "ACCEPTED"
            if spend:
                spend.status = "VERIFIED"
                spend.match_status = "MATCHED"
                if data.target_budget_line_id:
                    spend.budget_line_id = uuid.UUID(data.target_budget_line_id)

        elif decision == "EXCLUDE":
            rec.decision = "EXCLUDED"
            if spend:
                spend.status = "REJECTED"
                spend.match_status = "EXCLUDED"

        elif decision == "REMAP":
            rec.decision = "ACCEPTED"
            if data.target_spend_record_id:
                new_spend = self.db.get(SpendRecord, uuid.UUID(data.target_spend_record_id))
                if new_spend:
                    rec.spend_record_id = new_spend.id
                    new_spend.status = "VERIFIED"
                    new_spend.match_status = "MATCHED"

        elif decision == "MARK_TRANSFER":
            rec.decision = "ACCEPTED"
            # Inter-project transfer never affects project income or expense!
            if spend:
                spend.status = "REJECTED"  # Exclude from spend
                spend.match_status = "EXCLUDED"

            if data.to_project_id:
                to_p = self.db.get(Project, uuid.UUID(data.to_project_id))
                if to_p and rec.transaction:
                    transfer = InterProjectTransfer(
                        id=generate_uuid(),
                        organization_id=user.organization_id,
                        from_project_id=rec.project_id,
                        to_project_id=to_p.id,
                        transaction_id=rec.transaction_id,
                        amount=rec.transaction.amount,
                        type="TEMPORARY_ADVANCE",
                        transfer_date=rec.transaction.transaction_date,
                        repaid_amount=0,
                        status="OUTSTANDING",
                        reviewed_by=user.id,
                        created_at=utc_now(),
                    )
                    self.db.add(transfer)

        rec.decided_by = user.id
        rec.decided_at = utc_now()
        rec.notes = data.notes
        self.db.flush()

        record_audit_event(
            db=self.db,
            organization_id=user.organization_id,
            project_id=rec.project_id,
            actor_id=user.id,
            action="RECONCILIATION_DECISION",
            entity_type="ReconciliationMatch",
            entity_id=rec.id,
            new_value={"decision": rec.decision, "notes": rec.notes},
            rationale=data.notes or "Reconciliation decision recorded",
        )
        return rec

    # ---------------------------------------------------------
    # 5. SPEND RECORD ALLOCATIONS & REVERSALS
    # ---------------------------------------------------------
    def allocate_spend_record(
        self, user: User, spend_id: uuid.UUID, data: SpendAllocationRequest
    ) -> list[SpendRecord]:
        if user.role not in ["OWNER", "CFO"]:
            raise ForbiddenException(message="Only Owners and CFOs can allocate spend records.")

        spend = self.db.get(SpendRecord, spend_id)
        if not spend:
            raise NotFoundException(message="Spend record not found.")

        # Check total allocation equals source amount: rule ALLOCATION_NOT_BALANCED
        tot_allocated = sum(item.amount for item in data.allocations)
        if tot_allocated != spend.amount:
            raise AllocationNotBalancedException(
                message=f"Total allocation ({tot_allocated}) does not balance to spend record source amount ({spend.amount})."
            )

        # Validate budget lines
        created_records = []
        for item in data.allocations:
            b_line = self.db.get(BudgetLine, uuid.UUID(item.budget_line_id))
            if not b_line:
                raise NotFoundException(message=f"Budget line {item.budget_line_id} not found.")

            split_spend = SpendRecord(
                id=generate_uuid(),
                project_id=spend.project_id,
                vendor_party_id=spend.vendor_party_id,
                transaction_date=spend.transaction_date,
                amount=item.amount,
                currency=spend.currency,
                description=f"{spend.description} - {item.description or 'Allocated'}",
                status="VERIFIED",
                evidence_strength=spend.evidence_strength,
                source_document_id=spend.source_document_id,
                transaction_id=spend.transaction_id,
                budget_line_id=b_line.id,
                match_status="SPLIT",
                reviewed_by=user.id,
                reviewed_at=utc_now(),
                created_at=utc_now(),
            )
            self.db.add(split_spend)
            created_records.append(split_spend)

        # Mark original parent spend record as SUPERSEDED
        spend.status = "SUPERSEDED"
        spend.match_status = "SPLIT"
        spend.reviewed_by = user.id
        spend.reviewed_at = utc_now()
        self.db.flush()

        record_audit_event(
            db=self.db,
            organization_id=user.organization_id,
            project_id=spend.project_id,
            actor_id=user.id,
            action="SPEND_RECORD_ALLOCATED",
            entity_type="SpendRecord",
            entity_id=spend.id,
            new_value={"splits": len(data.allocations), "total_amount": spend.amount},
            rationale=data.rationale or "User allocated spend across budget lines",
        )
        return created_records

    def reverse_spend_record(
        self, user: User, spend_id: uuid.UUID, data: SpendReverseRequest
    ) -> SpendRecord:
        if user.role not in ["OWNER", "CFO"]:
            raise ForbiddenException(message="Only Owners and CFOs can reverse spend records.")

        spend = self.db.get(SpendRecord, spend_id)
        if not spend:
            raise NotFoundException(message="Spend record not found.")

        # Reversal creates a linked negative spend record with its own source and effective date
        rev_record = SpendRecord(
            id=generate_uuid(),
            project_id=spend.project_id,
            vendor_party_id=spend.vendor_party_id,
            transaction_date=date.today(),
            amount=-spend.amount,
            currency=spend.currency,
            description=f"[{data.reversal_type}] {spend.description} - {data.reason}",
            status="VERIFIED",
            evidence_strength="MANUAL_ENTRY",
            source_document_id=spend.source_document_id,
            transaction_id=spend.transaction_id,
            budget_line_id=spend.budget_line_id,
            match_status="MATCHED",
            reviewed_by=user.id,
            reviewed_at=utc_now(),
            created_at=utc_now(),
        )
        self.db.add(rev_record)

        spend.status = "SUPERSEDED"
        self.db.flush()

        record_audit_event(
            db=self.db,
            organization_id=user.organization_id,
            project_id=spend.project_id,
            actor_id=user.id,
            action="SPEND_RECORD_REVERSED",
            entity_type="SpendRecord",
            entity_id=spend.id,
            new_value={"reversal_id": str(rev_record.id), "reason": data.reason},
            rationale=data.reason,
        )
        return rev_record

    # ---------------------------------------------------------
    # 6. INTER-PROJECT TRANSFERS
    # ---------------------------------------------------------
    def create_inter_project_transfer(
        self, user: User, data: InterProjectTransferCreate
    ) -> InterProjectTransfer:
        if user.role not in ["OWNER", "CFO"]:
            raise ForbiddenException(message="Only Owners and CFOs can create transfers.")

        from_p = self.db.get(Project, uuid.UUID(data.from_project_id))
        to_p = self.db.get(Project, uuid.UUID(data.to_project_id))

        if (
            not from_p
            or not to_p
            or from_p.organization_id != user.organization_id
            or to_p.organization_id != user.organization_id
        ):
            raise NotFoundException(message="Project not found.")

        tx_uuid = uuid.UUID(data.transaction_id) if data.transaction_id else None

        transfer = InterProjectTransfer(
            id=generate_uuid(),
            organization_id=user.organization_id,
            from_project_id=from_p.id,
            to_project_id=to_p.id,
            transaction_id=tx_uuid,
            amount=data.amount,
            type=data.type,
            transfer_date=data.transfer_date,
            repaid_amount=0,
            status="OUTSTANDING",
            reviewed_by=user.id,
            created_at=utc_now(),
        )
        self.db.add(transfer)
        self.db.flush()

        record_audit_event(
            db=self.db,
            organization_id=user.organization_id,
            project_id=from_p.id,
            actor_id=user.id,
            action="INTER_PROJECT_TRANSFER_CREATED",
            entity_type="InterProjectTransfer",
            entity_id=transfer.id,
            new_value={"from": str(from_p.id), "to": str(to_p.id), "amount": transfer.amount},
            rationale="Inter-project temporary transfer",
        )
        return transfer

    def list_inter_project_transfers(
        self, user: User, project_id: uuid.UUID
    ) -> list[InterProjectTransfer]:
        stmt = select(InterProjectTransfer).where(
            InterProjectTransfer.organization_id == user.organization_id,
            (InterProjectTransfer.from_project_id == project_id)
            | (InterProjectTransfer.to_project_id == project_id),
        )
        return list(self.db.scalars(stmt).all())
