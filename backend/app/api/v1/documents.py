import uuid

from fastapi import APIRouter, Depends, File, Form, UploadFile
from fastapi.responses import Response as RawResponse
from sqlalchemy.orm import Session

from app.core.auth import get_current_user, require_project_scope, require_role
from app.core.envelope import ResponseEnvelope
from app.db.models import Project, User
from app.db.session import get_db
from app.modules.documents.schemas import (
    ConfirmUploadRequest,
    DocumentAssignProjectRequest,
    DocumentMarkRequest,
    DocumentRead,
    DownloadUrlResponse,
    ExtractionFieldDecision,
    ExtractionFieldRead,
    ManualEntryRequest,
    UploadUrlRequest,
    UploadUrlResponse,
)
from app.modules.documents.service import DocumentService

router = APIRouter()


@router.post("/documents/upload-url", response_model=ResponseEnvelope[UploadUrlResponse])
async def authorize_upload_url(
    req: UploadUrlRequest,
    user: User = Depends(require_role(["OWNER", "CFO", "PM", "GC"])),
    db: Session = Depends(get_db),
):
    service = DocumentService(db)
    res = service.authorize_upload(user, req)
    return ResponseEnvelope(data=res)


@router.post("/documents/upload", response_model=ResponseEnvelope[DocumentRead])
async def upload_document_multipart(
    file: UploadFile = File(...),
    project_id: uuid.UUID | None = Form(None),
    user: User = Depends(require_role(["OWNER", "CFO", "PM", "GC"])),
    db: Session = Depends(get_db),
):
    content = await file.read()
    service = DocumentService(db)
    doc = await service.upload_direct(
        user=user,
        filename=file.filename or "unknown",
        content_type=file.content_type or "application/octet-stream",
        file_bytes=content,
        project_id=project_id,
    )
    db.commit()
    return ResponseEnvelope(
        data=DocumentRead(
            id=str(doc.id),
            organization_id=str(doc.organization_id),
            project_id=str(doc.project_id) if doc.project_id else None,
            storage_key=doc.storage_key,
            sha256=doc.sha256,
            original_filename=doc.original_filename,
            mime_type=doc.mime_type,
            document_type=doc.document_type,
            document_date=doc.document_date.isoformat() if doc.document_date else None,
            source_system=doc.source_system,
            ingestion_status=doc.ingestion_status,
            duplicate_of_document_id=str(doc.duplicate_of_document_id)
            if doc.duplicate_of_document_id
            else None,
            uploaded_by=str(doc.uploaded_by),
            uploaded_at=doc.uploaded_at.isoformat(),
        )
    )


@router.post("/documents/{id}/confirm-upload", status_code=202)
async def confirm_upload(
    id: uuid.UUID,
    data: ConfirmUploadRequest,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    service = DocumentService(db)
    doc = service.get_document(user, id)
    # Marks confirmed state
    doc.ingestion_status = "READY_FOR_REVIEW"
    db.commit()
    return ResponseEnvelope(data={"status": "confirmed", "document_id": str(doc.id)})


@router.get("/projects/{pid}/documents", response_model=ResponseEnvelope[list[DocumentRead]])
async def list_project_documents_endpoint(
    pid: uuid.UUID,
    project: Project = Depends(require_project_scope),
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    service = DocumentService(db)
    docs = service.list_project_documents(user, project.id)
    results = [
        DocumentRead(
            id=str(d.id),
            organization_id=str(d.organization_id),
            project_id=str(d.project_id) if d.project_id else None,
            storage_key=d.storage_key,
            sha256=d.sha256,
            original_filename=d.original_filename,
            mime_type=d.mime_type,
            document_type=d.document_type,
            document_date=d.document_date.isoformat() if d.document_date else None,
            source_system=d.source_system,
            ingestion_status=d.ingestion_status,
            duplicate_of_document_id=str(d.duplicate_of_document_id)
            if d.duplicate_of_document_id
            else None,
            uploaded_by=str(d.uploaded_by),
            uploaded_at=d.uploaded_at.isoformat(),
        )
        for d in docs
    ]
    return ResponseEnvelope(data=results)


@router.get("/documents/{id}", response_model=ResponseEnvelope[DocumentRead])
async def get_document_endpoint(
    id: uuid.UUID,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    service = DocumentService(db)
    doc = service.get_document(user, id)
    return ResponseEnvelope(
        data=DocumentRead(
            id=str(doc.id),
            organization_id=str(doc.organization_id),
            project_id=str(doc.project_id) if doc.project_id else None,
            storage_key=doc.storage_key,
            sha256=doc.sha256,
            original_filename=doc.original_filename,
            mime_type=doc.mime_type,
            document_type=doc.document_type,
            document_date=doc.document_date.isoformat() if doc.document_date else None,
            source_system=doc.source_system,
            ingestion_status=doc.ingestion_status,
            duplicate_of_document_id=str(doc.duplicate_of_document_id)
            if doc.duplicate_of_document_id
            else None,
            uploaded_by=str(doc.uploaded_by),
            uploaded_at=doc.uploaded_at.isoformat(),
        )
    )


@router.get("/documents/{id}/download-url", response_model=ResponseEnvelope[DownloadUrlResponse])
async def get_document_download_url(
    id: uuid.UUID,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    service = DocumentService(db)
    url = service.get_download_url(user, id)
    return ResponseEnvelope(data=DownloadUrlResponse(download_url=url))


@router.get("/documents/{id}/download")
async def download_document_content(
    id: uuid.UUID,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    service = DocumentService(db)
    doc = service.get_document(user, id)
    content = await service.storage.get_file(doc.storage_key)
    if not content:
        content = b""
    return RawResponse(
        content=content,
        media_type=doc.mime_type,
        headers={"Content-Disposition": f'attachment; filename="{doc.original_filename}"'},
    )


@router.post("/documents/{id}/mark", response_model=ResponseEnvelope[DocumentRead])
async def mark_document_endpoint(
    id: uuid.UUID,
    data: DocumentMarkRequest,
    user: User = Depends(require_role(["OWNER", "CFO"])),
    db: Session = Depends(get_db),
):
    service = DocumentService(db)
    doc = service.mark_document(user, id, data)
    db.commit()
    return ResponseEnvelope(
        data=DocumentRead(
            id=str(doc.id),
            organization_id=str(doc.organization_id),
            project_id=str(doc.project_id) if doc.project_id else None,
            storage_key=doc.storage_key,
            sha256=doc.sha256,
            original_filename=doc.original_filename,
            mime_type=doc.mime_type,
            document_type=doc.document_type,
            document_date=doc.document_date.isoformat() if doc.document_date else None,
            source_system=doc.source_system,
            ingestion_status=doc.ingestion_status,
            duplicate_of_document_id=str(doc.duplicate_of_document_id)
            if doc.duplicate_of_document_id
            else None,
            uploaded_by=str(doc.uploaded_by),
            uploaded_at=doc.uploaded_at.isoformat(),
        )
    )


@router.post("/documents/{id}/assign-project", response_model=ResponseEnvelope[DocumentRead])
async def assign_project_endpoint(
    id: uuid.UUID,
    data: DocumentAssignProjectRequest,
    user: User = Depends(require_role(["OWNER", "CFO"])),
    db: Session = Depends(get_db),
):
    service = DocumentService(db)
    doc = service.assign_project(user, id, data)
    db.commit()
    return ResponseEnvelope(
        data=DocumentRead(
            id=str(doc.id),
            organization_id=str(doc.organization_id),
            project_id=str(doc.project_id) if doc.project_id else None,
            storage_key=doc.storage_key,
            sha256=doc.sha256,
            original_filename=doc.original_filename,
            mime_type=doc.mime_type,
            document_type=doc.document_type,
            document_date=doc.document_date.isoformat() if doc.document_date else None,
            source_system=doc.source_system,
            ingestion_status=doc.ingestion_status,
            duplicate_of_document_id=str(doc.duplicate_of_document_id)
            if doc.duplicate_of_document_id
            else None,
            uploaded_by=str(doc.uploaded_by),
            uploaded_at=doc.uploaded_at.isoformat(),
        )
    )


@router.post("/documents/{id}/manual-entry", response_model=ResponseEnvelope[dict])
async def record_manual_entry_endpoint(
    id: uuid.UUID,
    data: ManualEntryRequest,
    user: User = Depends(require_role(["OWNER", "CFO", "PM"])),
    db: Session = Depends(get_db),
):
    service = DocumentService(db)
    rec = service.record_manual_entry(user, id, data)
    db.commit()
    return ResponseEnvelope(data={"status": "recorded", "source_record_id": str(rec.id)})


@router.get(
    "/documents/{id}/extractions", response_model=ResponseEnvelope[list[ExtractionFieldRead]]
)
async def list_extractions_endpoint(
    id: uuid.UUID,
    user: User = Depends(require_role(["OWNER", "CFO", "PM"])),
    db: Session = Depends(get_db),
):
    service = DocumentService(db)
    fields = service.list_extractions(user, id)
    results = [
        ExtractionFieldRead(
            id=str(f.id),
            extraction_id=str(f.extraction_id),
            field_name=f.field_name,
            proposed_value=f.proposed_value,
            confidence=float(f.confidence),
            page_number=f.page_number,
            citation=f.citation,
            accepted_value=f.accepted_value,
            status=f.status,
            created_at=f.created_at.isoformat(),
        )
        for f in fields
    ]
    return ResponseEnvelope(data=results)


@router.post(
    "/extraction-fields/{id}/decision", response_model=ResponseEnvelope[ExtractionFieldRead]
)
async def decide_extraction_field_endpoint(
    id: uuid.UUID,
    data: ExtractionFieldDecision,
    user: User = Depends(require_role(["OWNER", "CFO", "PM"])),
    db: Session = Depends(get_db),
):
    service = DocumentService(db)
    field = service.decide_extraction_field(user, id, data)
    db.commit()
    return ResponseEnvelope(
        data=ExtractionFieldRead(
            id=str(field.id),
            extraction_id=str(field.extraction_id),
            field_name=field.field_name,
            proposed_value=field.proposed_value,
            confidence=float(field.confidence),
            page_number=field.page_number,
            citation=field.citation,
            accepted_value=field.accepted_value,
            status=field.status,
            created_at=field.created_at.isoformat(),
        )
    )
