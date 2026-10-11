import hashlib
import io
import os
import uuid

from sqlalchemy import select
from sqlalchemy.orm import Session

from app.core.config import settings
from app.core.errors import (
    ForbiddenException,
    NotFoundException,
    ValidationFailedException,
)
from app.db.audit import record_audit_event
from app.db.models import (
    Document,
    DocumentExtraction,
    ExtractionField,
    Project,
    ProjectMember,
    ReviewDecision,
    SourceRecord,
    User,
    generate_uuid,
    utc_now,
)
from app.modules.documents.schemas import (
    DocumentAssignProjectRequest,
    DocumentMarkRequest,
    ExtractionFieldDecision,
    ManualEntryRequest,
    UploadUrlRequest,
    UploadUrlResponse,
)
from app.storage.local import local_storage

# Allowed file MIME types
ALLOWED_MIME_TYPES = {
    "application/pdf": ".pdf",
    "image/jpeg": ".jpg",
    "image/png": ".png",
    "image/webp": ".webp",
    "text/csv": ".csv",
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet": ".xlsx",
    "application/vnd.ms-excel": ".xls",
    "message/rfc822": ".eml",
}

# Max upload size: 50MB
MAX_FILE_SIZE = 50 * 1024 * 1024

# Disallowed extensions (executable or macro-enabled)
DANGEROUS_EXTENSIONS = {
    ".exe",
    ".bat",
    ".cmd",
    ".sh",
    ".py",
    ".js",
    ".vbs",
    ".xlsm",
    ".xltm",
    ".docm",
    ".dotm",
}


def validate_file_safety(filename: str, content_type: str, size_bytes: int):
    if size_bytes > MAX_FILE_SIZE:
        raise ValidationFailedException(
            message=f"File exceeds maximum allowed size of {MAX_FILE_SIZE // (1024 * 1024)}MB."
        )

    ext = os.path.splitext(filename)[1].lower()
    if ext in DANGEROUS_EXTENSIONS:
        raise ValidationFailedException(
            message=f"Files with extension '{ext}' or macros/executable content are not allowed."
        )

    if content_type not in ALLOWED_MIME_TYPES and ext not in ALLOWED_MIME_TYPES.values():
        raise ValidationFailedException(
            message=f"Unsupported file type '{content_type}'. Allowed types are PDF, Images, CSV, XLSX, and EML."
        )


class DocumentService:
    def __init__(self, db: Session):
        self.db = db
        self.storage = local_storage

    def authorize_upload(self, user: User, req: UploadUrlRequest) -> UploadUrlResponse:
        validate_file_safety(req.filename, req.content_type, req.size_bytes)

        doc_id = generate_uuid()
        storage_key = f"org_{user.organization_id}/{doc_id}_{req.filename}"

        upload_url = f"{settings.API_V1_STR}/documents/{doc_id}/content"

        return UploadUrlResponse(
            document_id=str(doc_id),
            upload_url=upload_url,
            storage_key=storage_key,
            method="PUT",
            headers={"Content-Type": req.content_type},
        )

    async def upload_direct(
        self,
        user: User,
        filename: str,
        content_type: str,
        file_bytes: bytes,
        project_id: uuid.UUID | None = None,
    ) -> Document:
        validate_file_safety(filename, content_type, len(file_bytes))

        sha256 = hashlib.sha256(file_bytes).hexdigest()

        # Exact duplicate detection: check if organization already has this document
        existing = self.db.scalars(
            select(Document).where(
                Document.organization_id == user.organization_id,
                Document.sha256 == sha256,
            )
        ).first()

        doc_id = generate_uuid()
        storage_key = f"org_{user.organization_id}/{doc_id}_{filename}"

        duplicate_of_id = None
        if existing:
            # Re-use existing file on disk: link as duplicate
            duplicate_of_id = existing.id
        else:
            # Save file to storage
            await self.storage.save_file(io.BytesIO(file_bytes), storage_key, content_type)

        doc = Document(
            id=doc_id,
            organization_id=user.organization_id,
            project_id=project_id,
            storage_key=storage_key,
            sha256=sha256,
            original_filename=filename,
            mime_type=content_type,
            document_type="OTHER",
            source_system="DIRECT_UPLOAD",
            ingestion_status="READY_FOR_REVIEW",
            duplicate_of_document_id=duplicate_of_id,
            uploaded_by=user.id,
            uploaded_at=utc_now(),
        )
        self.db.add(doc)
        self.db.flush()

        record_audit_event(
            db=self.db,
            organization_id=user.organization_id,
            project_id=project_id,
            actor_id=user.id,
            action="DOCUMENT_UPLOADED",
            entity_type="Document",
            entity_id=doc.id,
            new_value={
                "filename": filename,
                "sha256": sha256,
                "is_duplicate": duplicate_of_id is not None,
            },
            rationale="User uploaded document",
        )

        return doc

    def list_project_documents(self, user: User, project_id: uuid.UUID) -> list[Document]:
        project = self.db.get(Project, project_id)
        if not project or project.organization_id != user.organization_id:
            raise NotFoundException(message="Project not found.")

        stmt = select(Document).where(
            Document.organization_id == user.organization_id,
            Document.project_id == project_id,
        )
        return list(self.db.scalars(stmt).all())

    def get_document(self, user: User, doc_id: uuid.UUID) -> Document:
        doc = self.db.get(Document, doc_id)
        if not doc or doc.organization_id != user.organization_id:
            raise NotFoundException(message="Document not found.")

        # Check project scope: Owners and CFOs have org-wide access.
        # Other roles must be members of the project if the document is bound to a project.
        if doc.project_id and user.role not in ["OWNER", "CFO"]:
            membership = self.db.scalars(
                select(ProjectMember).where(
                    ProjectMember.project_id == doc.project_id,
                    ProjectMember.user_id == user.id,
                )
            ).first()
            if not membership:
                raise NotFoundException(message="Document not found.")

        return doc

    def get_download_url(self, user: User, doc_id: uuid.UUID) -> str:
        doc = self.get_document(user, doc_id)
        return f"{settings.API_V1_STR}/documents/{doc.id}/download"

    def mark_document(self, user: User, doc_id: uuid.UUID, data: DocumentMarkRequest) -> Document:
        if user.role not in ["OWNER", "CFO"]:
            raise ForbiddenException(message="Only Owners and CFOs can mark documents.")

        doc = self.get_document(user, doc_id)
        allowed_marks = ["DUPLICATE", "MISFILED", "IRRELEVANT", "NOT_APPLICABLE"]
        if data.mark.upper() not in allowed_marks:
            raise ValidationFailedException(
                message=f"Invalid mark. Must be one of: {', '.join(allowed_marks)}"
            )

        decision = ReviewDecision(
            id=generate_uuid(),
            document_id=doc.id,
            decision=data.mark.upper(),
            rationale=data.rationale,
            decided_by=user.id,
            decided_at=utc_now(),
        )
        self.db.add(decision)
        doc.ingestion_status = "REVIEWED"
        self.db.flush()

        record_audit_event(
            db=self.db,
            organization_id=user.organization_id,
            project_id=doc.project_id,
            actor_id=user.id,
            action="DOCUMENT_MARKED",
            entity_type="Document",
            entity_id=doc.id,
            new_value={"decision": decision.decision, "rationale": decision.rationale},
            rationale="User marked document status",
        )

        return doc

    def assign_project(
        self, user: User, doc_id: uuid.UUID, data: DocumentAssignProjectRequest
    ) -> Document:
        if user.role not in ["OWNER", "CFO"]:
            raise ForbiddenException(
                message="Only Owners and CFOs can assign documents to projects."
            )

        doc = self.get_document(user, doc_id)
        proj_id = uuid.UUID(data.project_id)
        project = self.db.get(Project, proj_id)
        if not project or project.organization_id != user.organization_id:
            raise NotFoundException(message="Target project not found.")

        doc.project_id = project.id
        self.db.flush()

        record_audit_event(
            db=self.db,
            organization_id=user.organization_id,
            project_id=project.id,
            actor_id=user.id,
            action="DOCUMENT_PROJECT_ASSIGNED",
            entity_type="Document",
            entity_id=doc.id,
            new_value={"project_id": str(project.id)},
            rationale="User linked inbox document to project",
        )

        return doc

    def record_manual_entry(
        self, user: User, doc_id: uuid.UUID, data: ManualEntryRequest
    ) -> SourceRecord:
        if user.role not in ["OWNER", "CFO", "PM"]:
            raise ForbiddenException(message="Only Owner, CFO, or PM can add manual entries.")

        doc = self.get_document(user, doc_id)

        source_rec = SourceRecord(
            id=generate_uuid(),
            document_id=doc.id,
            project_candidate_id=doc.project_id,
            source_kind="MANUAL",
            raw_payload={"field_name": data.field_name, "value": data.value, "notes": data.notes},
            normalization_status="NORMALIZED",
            created_at=utc_now(),
        )
        self.db.add(source_rec)
        self.db.flush()

        record_audit_event(
            db=self.db,
            organization_id=user.organization_id,
            project_id=doc.project_id,
            actor_id=user.id,
            action="DOCUMENT_MANUAL_ENTRY_CREATED",
            entity_type="SourceRecord",
            entity_id=source_rec.id,
            new_value=source_rec.raw_payload,
            rationale=data.rationale or "Manual entry linked to document",
        )

        return source_rec

    def list_extractions(self, user: User, doc_id: uuid.UUID) -> list[ExtractionField]:
        doc = self.get_document(user, doc_id)
        stmt = (
            select(ExtractionField)
            .join(DocumentExtraction, DocumentExtraction.id == ExtractionField.extraction_id)
            .where(DocumentExtraction.document_id == doc.id)
        )
        return list(self.db.scalars(stmt).all())

    def decide_extraction_field(
        self, user: User, field_id: uuid.UUID, data: ExtractionFieldDecision
    ) -> ExtractionField:
        field = self.db.get(ExtractionField, field_id)
        if not field:
            raise NotFoundException(message="Extraction field not found.")

        extraction = self.db.get(DocumentExtraction, field.extraction_id)
        if not extraction:
            raise NotFoundException(message="Extraction not found.")

        doc = self.db.get(Document, extraction.document_id)
        if not doc or doc.organization_id != user.organization_id:
            raise NotFoundException(message="Extraction field not found.")

        field.status = data.decision.upper()
        if data.accepted_value:
            field.accepted_value = data.accepted_value
        elif data.decision.upper() == "ACCEPT":
            field.accepted_value = field.proposed_value

        self.db.flush()

        record_audit_event(
            db=self.db,
            organization_id=user.organization_id,
            project_id=doc.project_id,
            actor_id=user.id,
            action="EXTRACTION_FIELD_DECISION",
            entity_type="ExtractionField",
            entity_id=field.id,
            new_value={"decision": field.status, "accepted_value": field.accepted_value},
            rationale=data.rationale,
        )

        return field
