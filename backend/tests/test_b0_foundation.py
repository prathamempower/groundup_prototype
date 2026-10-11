import pytest
from httpx import ASGITransport, AsyncClient

from app.core.errors import VersionConflictException
from app.core.idempotency import idempotency_store
from app.main import app


@pytest.mark.asyncio
async def test_health_endpoints():
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as client:
        # Root health
        response = await client.get("/health")
        assert response.status_code == 200
        data = response.json()
        assert data["data"]["status"] == "healthy"
        assert data["meta"]["data_quality"] == "VERIFIED"
        assert "X-Request-ID" in response.headers

        # API v1 health
        v1_resp = await client.get("/api/v1/health")
        assert v1_resp.status_code == 200
        v1_data = v1_resp.json()
        assert v1_data["data"]["status"] == "healthy"


@pytest.mark.asyncio
async def test_error_envelope_404():
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as client:
        response = await client.get("/api/v1/non-existent-endpoint")
        assert response.status_code == 404
        data = response.json()
        assert "error" in data
        assert data["error"]["code"] == "NOT_FOUND"
        assert "request_id" in data["error"]


def test_idempotency_store():
    key = "test-idempotency-key-1"
    payload = {"account": "123", "amount": 5000}
    response_data = {"status": "success", "id": "abc"}

    # Initially empty
    assert idempotency_store.get(key, payload) is None

    # Set record
    idempotency_store.set(key, payload, 200, response_data)

    # Lookup with same payload returns match
    result = idempotency_store.get(key, payload)
    assert result is not None
    status_code, body = result
    assert status_code == 200
    assert body["status"] == "success"

    # Lookup with different payload returns None (conflict / mismatch)
    diff_payload = {"account": "123", "amount": 9999}
    assert idempotency_store.get(key, diff_payload) is None


def test_cursor_pagination():
    from app.core.pagination import decode_cursor, paginate_items

    items = [{"id": f"item_{i}"} for i in range(10)]
    paginated, cursor, has_more = paginate_items(
        items, limit=5, get_cursor_val_fn=lambda x: x["id"]
    )

    assert len(paginated) == 5
    assert has_more is True
    assert cursor is not None

    decoded = decode_cursor(cursor)
    assert decoded["val"] == "item_4"


def test_if_match_concurrency_support():
    # Demonstrating If-Match optimistic concurrency check logic
    current_version = 2
    if_match_header = "1"

    # If client sends stale version, error is raised
    with pytest.raises(VersionConflictException) as exc_info:
        if int(if_match_header) != current_version:
            raise VersionConflictException("Version conflict")
    assert exc_info.value.code == "VERSION_CONFLICT"
    assert exc_info.value.status_code == 409
