from datetime import UTC, datetime
from typing import Generic, TypeVar

from pydantic import BaseModel, Field

T = TypeVar("T")


class ResponseMeta(BaseModel):
    as_of: str = Field(default_factory=lambda: datetime.now(UTC).isoformat())
    data_quality: str | None = "PROVISIONAL"  # VERIFIED, PROVISIONAL, INCOMPLETE
    warnings: list[str] = Field(default_factory=list)
    next_cursor: str | None = None
    has_more: bool | None = None
    total: int | None = None


class ResponseEnvelope(BaseModel, Generic[T]):
    data: T
    meta: ResponseMeta = Field(default_factory=ResponseMeta)


class ErrorFieldDetail(BaseModel):
    path: str
    issue: str


class ErrorDetail(BaseModel):
    code: str
    message: str
    fields: list[ErrorFieldDetail] | None = None
    request_id: str | None = None


class ErrorEnvelope(BaseModel):
    error: ErrorDetail
