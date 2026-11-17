import os
import shutil
from abc import ABC, abstractmethod
from pathlib import Path
from typing import BinaryIO
from app.core.config import settings

class StorageProvider(ABC):
    @abstractmethod
    def save_file(self, file_obj: BinaryIO, filename: str) -> str:
        """Save a file and return its storage path or identifier."""
        pass

    @abstractmethod
    def get_file(self, file_path: str) -> bytes:
        """Retrieve file bytes."""
        pass

    @abstractmethod
    def delete_file(self, file_path: str) -> bool:
        """Delete a file."""
        pass

class LocalFileStorage(StorageProvider):
    def __init__(self, base_dir: str = settings.UPLOAD_DIR):
        self.base_dir = Path(base_dir)
        self.base_dir.mkdir(parents=True, exist_ok=True)

    def save_file(self, file_obj: BinaryIO, filename: str) -> str:
        safe_filename = Path(filename).name
        target_path = self.base_dir / safe_filename
        
        # Avoid collisions if file already exists with same name
        counter = 1
        stem = target_path.stem
        suffix = target_path.suffix
        while target_path.exists():
            target_path = self.base_dir / f"{stem}_{counter}{suffix}"
            counter += 1

        with open(target_path, "wb") as buffer:
            shutil.copyfileobj(file_obj, buffer)

        return str(target_path)

    def get_file(self, file_path: str) -> bytes:
        path = Path(file_path)
        if not path.is_absolute():
            path = self.base_dir / file_path
        with open(path, "rb") as f:
            return f.read()

    def delete_file(self, file_path: str) -> bool:
        path = Path(file_path)
        if not path.is_absolute():
            path = self.base_dir / file_path
        if path.exists():
            path.unlink()
            return True
        return False

# Global storage instance
storage = LocalFileStorage()
