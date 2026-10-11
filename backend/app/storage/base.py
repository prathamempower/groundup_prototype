from abc import ABC, abstractmethod
from typing import BinaryIO


class StorageBackend(ABC):
    @abstractmethod
    async def save_file(self, file_obj: BinaryIO, storage_key: str, content_type: str) -> str:
        """Saves a file stream to storage and returns its storage key."""
        pass

    @abstractmethod
    async def get_file(self, storage_key: str) -> bytes | None:
        """Retrieves raw file bytes by storage key."""
        pass

    @abstractmethod
    async def delete_file(self, storage_key: str) -> bool:
        """Deletes a file by storage key."""
        pass

    @abstractmethod
    async def generate_download_url(self, storage_key: str, expires_in_seconds: int = 3600) -> str:
        """Generates a signed or accessible download URL."""
        pass
