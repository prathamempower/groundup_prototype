import os
from pathlib import Path
from typing import BinaryIO

from app.core.config import settings
from app.storage.base import StorageBackend


class LocalStorageBackend(StorageBackend):
    def __init__(self, base_dir: str | None = None):
        self.base_dir = Path(base_dir or settings.STORAGE_DIR)
        self.base_dir.mkdir(parents=True, exist_ok=True)

    def _resolve_path(self, storage_key: str) -> Path:
        return self.base_dir / storage_key

    async def save_file(self, file_obj: BinaryIO, storage_key: str, content_type: str) -> str:
        target_path = self._resolve_path(storage_key)
        target_path.parent.mkdir(parents=True, exist_ok=True)
        with open(target_path, "wb") as f:
            f.write(file_obj.read())
        return storage_key

    async def get_file(self, storage_key: str) -> bytes | None:
        target_path = self._resolve_path(storage_key)
        if not target_path.exists():
            return None
        with open(target_path, "rb") as f:
            return f.read()

    async def delete_file(self, storage_key: str) -> bool:
        target_path = self._resolve_path(storage_key)
        if target_path.exists():
            os.remove(target_path)
            return True
        return False

    async def generate_download_url(self, storage_key: str, expires_in_seconds: int = 3600) -> str:
        # In local development, points to the documents download endpoint
        return f"{settings.API_V1_STR}/documents/{storage_key}/download"


local_storage = LocalStorageBackend()
