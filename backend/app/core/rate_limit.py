import threading
import time

from app.core.errors import RateLimitedException


class InMemoryRateLimiter:
    """
    In-memory rate limiter per client IP or user identifier.
    Limits requests to max_requests per window_seconds.
    """

    def __init__(self, max_requests: int = 600, window_seconds: int = 60):
        self.max_requests = max_requests
        self.window_seconds = window_seconds
        self._lock = threading.Lock()
        # key -> (count, reset_at)
        self._records: dict[str, tuple[int, float]] = {}

    def check(self, key: str):
        now = time.time()
        with self._lock:
            record = self._records.get(key)
            if not record or now >= record[1]:
                self._records[key] = (1, now + self.window_seconds)
                return
            count, reset_at = record
            if count >= self.max_requests:
                raise RateLimitedException(
                    f"Rate limit exceeded. Try again in {int(reset_at - now)} seconds."
                )
            self._records[key] = (count + 1, reset_at)


# Standard rate limiters as specified in api_spec.md
# Auth rate limiter: 60 requests per minute
auth_rate_limiter = InMemoryRateLimiter(max_requests=60, window_seconds=60)
# General API limiter: 600 requests per minute per user/IP
api_rate_limiter = InMemoryRateLimiter(max_requests=600, window_seconds=60)
