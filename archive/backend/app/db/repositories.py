import uuid
from typing import Generic, TypeVar

from sqlalchemy import select
from sqlalchemy.orm import Session

from app.db.base import Base

ModelType = TypeVar("ModelType", bound=Base)


class BaseRepository(Generic[ModelType]):
    def __init__(self, model: type[ModelType], db: Session):
        self.model = model
        self.db = db

    def get_by_id(self, id: uuid.UUID) -> ModelType | None:
        return self.db.get(self.model, id)

    def list(self, limit: int = 50, offset: int = 0) -> list[ModelType]:
        stmt = select(self.model).limit(limit).offset(offset)
        return list(self.db.scalars(stmt).all())

    def create(self, obj: ModelType) -> ModelType:
        self.db.add(obj)
        self.db.flush()
        return obj

    def update(self, obj: ModelType) -> ModelType:
        self.db.flush()
        return obj

    def delete(self, obj: ModelType) -> None:
        self.db.delete(obj)
        self.db.flush()
