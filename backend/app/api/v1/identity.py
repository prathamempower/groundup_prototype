import hashlib
import uuid
from datetime import UTC, datetime

from fastapi import APIRouter, Cookie, Depends, Request, Response
from sqlalchemy.orm import Session

from app.core.auth import get_current_user, require_role
from app.core.envelope import ResponseEnvelope
from app.core.errors import NotFoundException
from app.core.rate_limit import auth_rate_limiter
from app.db.models import Invitation, Organization, Project, ProjectMember, User
from app.db.session import get_db
from app.modules.identity.schemas import (
    AcceptInvitationRequest,
    InvitationBulkCreate,
    InvitationCreate,
    InvitationRead,
    OrganizationCreate,
    OrganizationRead,
    OrganizationUpdate,
    PasswordResetConfirm,
    PasswordResetRequest,
    ProjectMemberUpdate,
    SignInRequest,
    SignUpRequest,
    TokenResponse,
    UserRead,
)
from app.modules.identity.service import IdentityService

from sqlalchemy import select

router = APIRouter()


@router.post("/auth/signup", response_model=ResponseEnvelope[UserRead])
async def signup(
    data: SignUpRequest, request: Request, response: Response, db: Session = Depends(get_db)
):
    auth_rate_limiter.check(request.client.host if request.client else "unknown")
    service = IdentityService(db)
    user, access_token, refresh_token = service.sign_up_owner(data)
    db.commit()

    # Keep the owner session across browser restarts while retaining short-lived access tokens.
    response.set_cookie(
        key="access_token", value=access_token, httponly=True, samesite="lax",
        path="/", max_age=60 * 60,
    )
    response.set_cookie(
        key="refresh_token", value=refresh_token, httponly=True, samesite="lax",
        path="/", max_age=7 * 24 * 60 * 60,
    )

    profile = service.get_user_profile(user)
    return ResponseEnvelope(data=profile)


@router.post("/auth/signin", response_model=ResponseEnvelope[UserRead])
async def signin(
    data: SignInRequest, request: Request, response: Response, db: Session = Depends(get_db)
):
    auth_rate_limiter.check(request.client.host if request.client else "unknown")
    service = IdentityService(db)
    user, access_token, refresh_token = service.sign_in(data)

    # Set httpOnly cookies
    cookie_lifetime = 7 * 24 * 60 * 60 if data.remember_me else None
    response.set_cookie(
        key="access_token", value=access_token, httponly=True, samesite="lax",
        path="/", max_age=60 * 60 if data.remember_me else None,
    )
    response.set_cookie(
        key="refresh_token", value=refresh_token, httponly=True, samesite="lax",
        path="/", max_age=cookie_lifetime,
    )

    profile = service.get_user_profile(user)
    return ResponseEnvelope(data=profile)


@router.post("/auth/signout", response_model=ResponseEnvelope[dict])
async def signout(response: Response):
    response.delete_cookie(key="access_token", path="/")
    response.delete_cookie(key="refresh_token", path="/")
    return ResponseEnvelope(data={"status": "signed_out"})


@router.post("/auth/refresh", response_model=ResponseEnvelope[TokenResponse])
async def refresh_token_endpoint(
    request: Request,
    response: Response,
    refresh_token: str = Cookie(None),
    db: Session = Depends(get_db),
):
    service = IdentityService(db)
    _, new_access, new_refresh = service.refresh_session(refresh_token)

    response.set_cookie(key="access_token", value=new_access, httponly=True, samesite="lax", path="/")
    response.set_cookie(key="refresh_token", value=new_refresh, httponly=True, samesite="lax", path="/")

    return ResponseEnvelope(data=TokenResponse(access_token=new_access))


@router.post("/auth/password-reset/request", response_model=ResponseEnvelope[dict])
async def password_reset_request(data: PasswordResetRequest, db: Session = Depends(get_db)):
    service = IdentityService(db)
    await service.request_password_reset(data.email)
    return ResponseEnvelope(
        data={"message": "If the email is registered, reset instructions were dispatched."}
    )


@router.post("/auth/password-reset/confirm", response_model=ResponseEnvelope[dict])
async def password_reset_confirm(data: PasswordResetConfirm, db: Session = Depends(get_db)):
    service = IdentityService(db)
    service.confirm_password_reset(data.token, data.new_password)
    db.commit()
    return ResponseEnvelope(data={"message": "Password has been successfully updated."})


# ==========================================
# /me (CURRENT USER PROFILE)
# ==========================================


@router.get("/me", response_model=ResponseEnvelope[UserRead])
async def get_me(user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    service = IdentityService(db)
    profile = service.get_user_profile(user)
    return ResponseEnvelope(data=profile)


# ==========================================
# ORGANIZATIONS (OWNER ONLY)
# ==========================================


@router.post("/organizations", response_model=ResponseEnvelope[OrganizationRead])
async def create_organization(
    data: OrganizationCreate,
    owner: User = Depends(require_role(["OWNER"])),
    db: Session = Depends(get_db),
):
    org = Organization(name=data.name)
    db.add(org)
    db.commit()
    return ResponseEnvelope(
        data=OrganizationRead(id=str(org.id), name=org.name, created_at=org.created_at.isoformat())
    )


@router.get("/organizations/{id}", response_model=ResponseEnvelope[OrganizationRead])
async def get_organization(
    id: uuid.UUID,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    if user.organization_id != id:
        raise NotFoundException(message="Organization not found.")
    org = db.get(Organization, id)
    if not org:
        raise NotFoundException(message="Organization not found.")
    return ResponseEnvelope(
        data=OrganizationRead(id=str(org.id), name=org.name, created_at=org.created_at.isoformat())
    )


@router.patch("/organizations/{id}", response_model=ResponseEnvelope[OrganizationRead])
async def update_organization(
    id: uuid.UUID,
    data: OrganizationUpdate,
    owner: User = Depends(require_role(["OWNER"])),
    db: Session = Depends(get_db),
):
    if owner.organization_id != id:
        raise NotFoundException(message="Organization not found.")
    org = db.get(Organization, id)
    if not org:
        raise NotFoundException(message="Organization not found.")
    if data.name:
        org.name = data.name
    db.commit()
    return ResponseEnvelope(
        data=OrganizationRead(id=str(org.id), name=org.name, created_at=org.created_at.isoformat())
    )


# ==========================================
# INVITATIONS
# ==========================================


@router.get("/invitations/{token}", response_model=ResponseEnvelope[dict])
async def get_invitation_by_token(token: str, db: Session = Depends(get_db)):
    token_hash = hashlib.sha256(token.encode("utf-8")).hexdigest()
    invitation = db.scalars(
        select(Invitation).where(Invitation.token_hash == token_hash)
    ).first()
    if not invitation:
        raise NotFoundException(message="Invitation not found.")

    organization = db.get(Organization, invitation.organization_id)
    project = db.get(Project, invitation.project_id) if invitation.project_id else None
    status = "PENDING"
    if invitation.revoked_at:
        status = "REVOKED"
    elif invitation.accepted_at:
        status = "ACCEPTED"
    else:
        expires_at = invitation.expires_at
        if expires_at.tzinfo is None:
            expires_at = expires_at.replace(tzinfo=UTC)
        if expires_at < datetime.now(UTC):
            status = "EXPIRED"

    return ResponseEnvelope(data={
        "id": str(invitation.id),
        "organization_id": str(invitation.organization_id),
        "organization_name": organization.name if organization else "Organization",
        "project_id": str(invitation.project_id) if invitation.project_id else None,
        "project_name": project.name if project else None,
        "email": invitation.email,
        "role": invitation.role,
        "scope": invitation.scope,
        "expires_at": invitation.expires_at.isoformat(),
        "status": status,
    })


@router.get("/invitations", response_model=ResponseEnvelope[list[InvitationRead]])
async def list_invitations(
    owner: User = Depends(require_role(["OWNER"])),
    db: Session = Depends(get_db),
):
    invitations = db.scalars(
        select(Invitation)
        .where(Invitation.organization_id == owner.organization_id)
        .order_by(Invitation.created_at.desc())
    ).all()
    results = []
    for invitation in invitations:
        organization = db.get(Organization, invitation.organization_id)
        project = db.get(Project, invitation.project_id) if invitation.project_id else None
        inviter = db.get(User, invitation.invited_by)
        status = "PENDING"
        if invitation.revoked_at:
            status = "REVOKED"
        elif invitation.accepted_at:
            status = "ACCEPTED"
        else:
            expiry = invitation.expires_at
            if expiry.tzinfo is None:
                expiry = expiry.replace(tzinfo=UTC)
            if expiry < datetime.now(UTC):
                status = "EXPIRED"
        results.append(InvitationRead(
            id=str(invitation.id),
            organization_id=str(invitation.organization_id),
            project_id=str(invitation.project_id) if invitation.project_id else None,
            email=invitation.email,
            role=invitation.role,
            scope=invitation.scope,
            expires_at=invitation.expires_at.isoformat(),
            invited_by=f"{inviter.first_name} {inviter.last_name}" if inviter else "Organization owner",
            organization_name=organization.name if organization else None,
            project_name=project.name if project else None,
            status=status,
        ))
    return ResponseEnvelope(data=results)


@router.post("/invitations", response_model=ResponseEnvelope[InvitationRead])
async def create_invitation_endpoint(
    data: InvitationCreate,
    owner: User = Depends(require_role(["OWNER"])),
    db: Session = Depends(get_db),
):
    service = IdentityService(db)
    inv, raw_token = service.create_invitation(owner, data)
    db.commit()

    inv_read = InvitationRead(
        id=str(inv.id),
        organization_id=str(inv.organization_id),
        project_id=str(inv.project_id) if inv.project_id else None,
        email=inv.email,
        role=inv.role,
        scope=inv.scope,
        expires_at=inv.expires_at.isoformat(),
        invited_by=str(inv.invited_by),
        invitation_url=f"/auth/invite/{raw_token}",
        organization_name=db.get(Organization, inv.organization_id).name,
        project_name=db.get(Project, inv.project_id).name if inv.project_id else None,
    )
    return ResponseEnvelope(data=inv_read)


@router.post("/invitations/bulk", response_model=ResponseEnvelope[list[InvitationRead]])
async def create_bulk_invitations(
    data: InvitationBulkCreate,
    owner: User = Depends(require_role(["OWNER"])),
    db: Session = Depends(get_db),
):
    service = IdentityService(db)
    results = []
    for item in data.invitations:
        inv, raw_token = service.create_invitation(owner, item)
        results.append(
            InvitationRead(
                id=str(inv.id),
                organization_id=str(inv.organization_id),
                project_id=str(inv.project_id) if inv.project_id else None,
                email=inv.email,
                role=inv.role,
                scope=inv.scope,
                expires_at=inv.expires_at.isoformat(),
                invited_by=str(inv.invited_by),
                invitation_url=f"/auth/invite/{raw_token}",
                organization_name=db.get(Organization, inv.organization_id).name,
                project_name=db.get(Project, inv.project_id).name if inv.project_id else None,
            )
        )
    db.commit()
    return ResponseEnvelope(data=results)


@router.get("/projects/{pid}/team", response_model=ResponseEnvelope[list[dict]])
async def list_project_team(
    pid: uuid.UUID,
    owner: User = Depends(require_role(["OWNER"])),
    db: Session = Depends(get_db),
):
    project = db.get(Project, pid)
    if not project or project.organization_id != owner.organization_id:
        raise NotFoundException(message="Project not found.")
    members = db.execute(
        select(ProjectMember, User)
        .join(User, User.id == ProjectMember.user_id)
        .where(ProjectMember.project_id == pid)
        .order_by(ProjectMember.created_at)
    ).all()
    return ResponseEnvelope(data=[
        {
            "id": str(member.user_id),
            "project_id": str(member.project_id),
            "name": f"{user.first_name} {user.last_name}",
            "email": user.email,
            "role": member.role,
            "title": member.role,
            "company": "",
            "avatarInitials": f"{user.first_name[:1]}{user.last_name[:1]}",
            "status": "ACTIVE" if user.is_active else "REVOKED",
            "added_at": member.created_at.isoformat(),
            "scope": "PROJECT",
        }
        for member, user in members
    ])


@router.post("/invitations/{token}/accept", response_model=ResponseEnvelope[UserRead])
async def accept_invitation_endpoint(
    token: str,
    data: AcceptInvitationRequest,
    response: Response,
    db: Session = Depends(get_db),
):
    service = IdentityService(db)
    user, access_token, refresh_token = service.accept_invitation(token, data)
    db.commit()

    response.set_cookie(key="access_token", value=access_token, httponly=True, samesite="lax")
    response.set_cookie(key="refresh_token", value=refresh_token, httponly=True, samesite="lax")

    profile = service.get_user_profile(user)
    return ResponseEnvelope(data=profile)


@router.post("/invitations/{id}/revoke", response_model=ResponseEnvelope[dict])
async def revoke_invitation_endpoint(
    id: uuid.UUID,
    owner: User = Depends(require_role(["OWNER"])),
    db: Session = Depends(get_db),
):
    service = IdentityService(db)
    service.revoke_invitation(owner, id)
    db.commit()
    return ResponseEnvelope(data={"status": "revoked"})


# ==========================================
# PROJECT MEMBERSHIP MANAGEMENT (OWNER ONLY)
# ==========================================


@router.patch("/projects/{pid}/members/{uid}", response_model=ResponseEnvelope[dict])
async def update_project_member_endpoint(
    pid: uuid.UUID,
    uid: uuid.UUID,
    data: ProjectMemberUpdate,
    owner: User = Depends(require_role(["OWNER"])),
    db: Session = Depends(get_db),
):
    service = IdentityService(db)
    service.update_project_member(owner, pid, uid, data.role)
    db.commit()
    return ResponseEnvelope(data={"status": "updated"})
