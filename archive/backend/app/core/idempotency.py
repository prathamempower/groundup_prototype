import hashlib
import json
import threading
from typing import Any


# Thread-safe in-memory cache for idempotency keys.
# In a distributed multi-worker setup, Redis or PostgreSQL table can back this interface.
class IdempotencyStore:
    def __init__(self):
        self._lock = threading.Lock()
        self._store: dict[str, tuple[str, int, dict[str, Any]]] = {}

    def _hash_payload(self, payload: Any) -> str:
        serialized = json.dumps(payload, sort_keys=True, default=str)
        return hashlib.sha256(serialized.encode("utf-8")).hexdigest()

    def get(self, key: str, payload: Any) -> tuple[int, dict[str, Any]] | None:
        payload_hash = self._hash_payload(payload)
        with self._lock:
            record = self._store.get(key)
            if record:
                stored_hash, status_code, response_body = record
                if stored_hash == payload_hash:
                    return status_code, response_body
                else:
                    # Key reused with different payload
                    return None
            return None

    def set(self, key: str, payload: Any, status_code: int, response_body: dict[str, Any]):
        payload_hash = self._hash_payload(payload)
        with self._lock:
            self._store[key] = (payload_hash, status_code, response_body)


idempotency_store = IdempotencyStore()
