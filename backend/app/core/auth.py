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


def get_effective_role(
    user: User,
    project_id: uuid.UUID | None,
    db: Session,
) -> str:
    """
    Rule of truth: role comes from project_members for the ACTIVE project (not a single role on the user).
    If no project is specified or user has no specific project membership, falls back to user.role.
    Admin is treated as Owner permission.
    """
    if not project_id:
        return "OWNER" if user.role.upper() == "ADMIN" else user.role.upper()

    membership = db.scalars(
        select(ProjectMember).where(
            ProjectMember.project_id == project_id,
            ProjectMember.user_id == user.id,
        )
    ).first()

    if membership:
        m_role = membership.role.upper()
        return "OWNER" if m_role == "ADMIN" else m_role

    # Org-level Owner/Admin acting on project defaults to OWNER if member or creator
    if user.role.upper() in ["OWNER", "ADMIN"]:
        return "OWNER"

    return user.role.upper()


def require_role(allowed_roles: list[str]):
    # Normalize ADMIN to OWNER in allowed_roles
    normalized_allowed = set(r.upper() for r in allowed_roles)
    if "OWNER" in normalized_allowed:
        normalized_allowed.add("ADMIN")

    def role_checker(
        request: Request,
        user: User = Depends(get_current_user),
        db: Session = Depends(get_db),
    ) -> User:
        # Check if project ID is in path params or query params or header
        pid_val = request.path_params.get("pid") or request.headers.get("x-project-id") or request.query_params.get("project_id")
        project_uuid: uuid.UUID | None = None
        if pid_val:
            try:
                project_uuid = uuid.UUID(str(pid_val))
            except ValueError:
                pass

        if project_uuid:
            # Verify project exists and belongs to user organization
            project = db.get(Project, project_uuid)
            if not project or project.organization_id != user.organization_id:
                raise NotFoundException(message="Project not found.")

            # Verify membership: every user must be a member or org OWNER/ADMIN
            membership = db.scalars(
                select(ProjectMember).where(
                    ProjectMember.project_id == project_uuid,
                    ProjectMember.user_id == user.id,
                )
            ).first()
            if not membership and user.role.upper() not in ["OWNER", "ADMIN"]:
                raise NotFoundException(message="Project not found.")

        effective_role = get_effective_role(user, project_uuid, db)
        if effective_role not in normalized_allowed:
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

    # Check project membership
    membership = db.scalars(
        select(ProjectMember).where(
            ProjectMember.project_id == pid,
            ProjectMember.user_id == user.id,
        )
    ).first()

    if not membership and user.role.upper() not in ["OWNER", "ADMIN"]:
        # Cross-project access returns 404
        raise NotFoundException(message="Project not found.")

    return project

