import base64
import json
from typing import Any, TypeVar

from pydantic import BaseModel, Field

T = TypeVar("T")


class CursorParams(BaseModel):
    limit: int = Field(default=50, ge=1, le=100)
    cursor: str | None = None
    sort: str | None = "-created_at"


class FilterParams(BaseModel):
    status: str | None = None
    from_date: str | None = Field(default=None, alias="from")
    to_date: str | None = Field(default=None, alias="to")
    q: str | None = None


def encode_cursor(data: dict[str, Any]) -> str:
    serialized = json.dumps(data)
    return base64.urlsafe_b64encode(serialized.encode("utf-8")).decode("utf-8")


def decode_cursor(cursor_str: str) -> dict[str, Any] | None:
    if not cursor_str:
        return None
    try:
        raw = base64.urlsafe_b64decode(cursor_str.encode("utf-8")).decode("utf-8")
        return json.loads(raw)
    except Exception:
        return None


def paginate_items(
    items: list[T],
    limit: int,
    get_cursor_val_fn: Any,
) -> tuple[list[T], str | None, bool]:
    has_more = len(items) > limit
    paginated_items = items[:limit]
    next_cursor = None
    if has_more and paginated_items:
        last_item = paginated_items[-1]
        next_cursor = encode_cursor({"val": str(get_cursor_val_fn(last_item))})
    return paginated_items, next_cursor, has_more
