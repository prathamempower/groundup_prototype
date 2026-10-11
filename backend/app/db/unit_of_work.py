from collections.abc import Generator

from sqlalchemy.orm import Session

from app.db.session import SessionLocal


class UnitOfWork:
    def __init__(self, session_factory=SessionLocal):
        self.session_factory = session_factory
        self.db: Session = None

    def __enter__(self):
        self.db = self.session_factory()
        return self

    def __exit__(self, exc_type, exc_val, exc_tb):
        if exc_type:
            self.rollback()
        self.db.close()

    def commit(self):
        self.db.commit()

    def rollback(self):
        self.db.rollback()


def get_uow() -> Generator[UnitOfWork, None, None]:
    uow = UnitOfWork()
    with uow:
        yield uow
