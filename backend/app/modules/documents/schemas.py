from pydantic import BaseModel, Field


class DocumentRead(BaseModel):
    id: str
    organization_id: str
    project_id: str | None = None
    storage_key: str
    sha256: str
    original_filename: str
    mime_type: str
    document_type: str
    document_date: str | None = None
    source_system: str
    ingestion_status: str
    duplicate_of_document_id: str | None = None
    uploaded_by: str
    uploaded_at: str

    model_config = {"from_attributes": True}


class UploadUrlRequest(BaseModel):
    filename: str = Field(min_length=1, max_length=255)
    content_type: str
    size_bytes: int
    project_id: str | None = None


class UploadUrlResponse(BaseModel):
    document_id: str
    upload_url: str
    storage_key: str
    method: str = "PUT"
    headers: dict[str, str] = Field(default_factory=dict)


class ConfirmUploadRequest(BaseModel):
    sha256: str | None = None


class ExtractionFieldRead(BaseModel):
    id: str
    extraction_id: str
    field_name: str
    proposed_value: str
    confidence: float
    page_number: int | None = None
    citation: str | None = None
    accepted_value: str | None = None
    status: str
    created_at: str

    model_config = {"from_attributes": True}


class ExtractionFieldDecision(BaseModel):
    decision: str  # ACCEPT, EDIT, REJECT
    accepted_value: str | None = None
    rationale: str | None = None


class DocumentMarkRequest(BaseModel):
    mark: str  # DUPLICATE, MISFILED, IRRELEVANT, NOT_APPLICABLE
    rationale: str | None = None


class DocumentAssignProjectRequest(BaseModel):
    project_id: str


class ManualEntryRequest(BaseModel):
    field_name: str
    value: str
    notes: str | None = None
    rationale: str | None = None


class DownloadUrlResponse(BaseModel):
    download_url: str
    expires_in_seconds: int = 3600
