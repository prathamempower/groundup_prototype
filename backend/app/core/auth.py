import uuid

from fastapi import Cookie, Depends, Header, Request
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.core.errors import (
    ForbiddenException,
    NotFoundException,
    ProjectScopeDeniedException,
    UnauthenticatedException,
)
from app.core.security import decode_token
from app.db.models import Project, ProjectMember, User
from app.db.session import get_db


def get_token_from_request(
    request: Request,
    authorization: str | None = Header(None),
    access_token: str | None = Cookie(None),
) -> str:
    # Check Authorization header first
    if authorization and authorization.startswith("Bearer "):
        return authorization.split(" ", 1)[1]
    # Check httpOnly cookie second
    if access_token:
        return access_token
    raise UnauthenticatedException(message="Authentication credentials were not provided.")


def get_current_user(
    token: str = Depends(get_token_from_request),
    db: Session = Depends(get_db),
) -> User:
    try:
        payload = decode_token(token)
        if payload.get("type") != "access":
            raise UnauthenticatedException(message="Invalid token type.")
        user_id = uuid.UUID(payload.get("sub"))
    except Exception:
        raise UnauthenticatedException(message="Could not validate credentials.") from None

    user = db.get(User, user_id)
    if not user:
        raise UnauthenticatedException(message="User not found.")
    if not user.is_active:
        raise ForbiddenException(message="User account is inactive.")

    return user


def require_role(allowed_roles: list[str]):
    def role_checker(user: User = Depends(get_current_user)) -> User:
        if user.role not in allowed_roles:
            raise ForbiddenException(
                message=f"Action requires one of roles: {', '.join(allowed_roles)}"
            )
        return user

    return role_checker


def require_project_scope(
    pid: uuid.UUID,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> Project:
    project = db.get(Project, pid)
    if not project or project.organization_id != user.organization_id:
        # Out of scope records return 404
        raise NotFoundException(message="Project not found.")

    # Owners and CFOs have organization-wide access to all projects in the org
    if user.role in ["OWNER", "CFO"]:
        return project

    # Check project membership
    membership = db.scalars(
        select(ProjectMember).where(
            ProjectMember.project_id == pid,
            ProjectMember.user_id == user.id,
        )
    ).first()

    if not membership:
        raise ProjectScopeDeniedException(message="User does not have access to this project.")

    return project
