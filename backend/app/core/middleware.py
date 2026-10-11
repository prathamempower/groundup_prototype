import logging
import re
import time
import uuid
from collections.abc import Callable

from fastapi import Request, Response
from starlette.middleware.base import BaseHTTPMiddleware

logger = logging.getLogger("groundup.access")

# Sensitive fields redaction pattern
SENSITIVE_PATTERNS = [
    re.compile(r'("password"\s*:\s*)"[^"]*"', re.IGNORECASE),
    re.compile(r'("token"\s*:\s*)"[^"]*"', re.IGNORECASE),
    re.compile(r'("secret"\s*:\s*)"[^"]*"', re.IGNORECASE),
    re.compile(r'("account_number"\s*:\s*)"[^"]*"', re.IGNORECASE),
    re.compile(r'("routing_number"\s*:\s*)"[^"]*"', re.IGNORECASE),
]


def redact_sensitive_str(text: str) -> str:
    redacted = text
    for pattern in SENSITIVE_PATTERNS:
        redacted = pattern.sub(r'\1"[REDACTED]"', redacted)
    return redacted


class RequestContextMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request: Request, call_next: Callable) -> Response:
        # Request ID header handling
        request_id = request.headers.get("X-Request-ID") or f"req_{uuid.uuid4().hex[:8]}"
        request.state.request_id = request_id

        start_time = time.perf_counter()

        response = await call_next(request)

        process_time_ms = (time.perf_counter() - start_time) * 1000.0

        # Set X-Request-ID on response
        response.headers["X-Request-ID"] = request_id

        logger.info(
            f"method={request.method} path={request.url.path} status={response.status_code} "
            f"duration_ms={process_time_ms:.2f} request_id={request_id}"
        )

        return response
