import hashlib
import secrets
import uuid
from datetime import UTC, datetime, timedelta

from sqlalchemy import select
from sqlalchemy.orm import Session

from app.core.errors import (
    ForbiddenException,
    NotFoundException,
    UnauthenticatedException,
    ValidationFailedException,
)
from app.core.mailer import mailer
from app.core.security import (
    create_access_token,
    create_refresh_token,
    decode_token,
    hash_password,
    verify_password,
)
from app.db.audit import record_audit_event
from app.db.models import (
    Invitation,
    Organization,
    ProjectMember,
    User,
    generate_uuid,
    utc_now,
)
from app.modules.identity.permissions import get_role_permissions
from app.modules.identity.schemas import (
    AcceptInvitationRequest,
    InvitationCreate,
    ProjectMembershipRead,
    SignInRequest,
    SignUpRequest,
    UserRead,
)


class IdentityService:
    def __init__(self, db: Session):
        self.db = db

    def sign_up_owner(self, data: SignUpRequest) -> tuple[User, str, str]:
        # Check if email exists
        existing = self.db.scalars(select(User).where(User.email == data.email)).first()
        if existing:
            raise ValidationFailedException(message="A user with this email already exists.")

        # Create organization
        org = Organization(
            id=generate_uuid(),
            name=data.organization_name,
            created_at=utc_now(),
        )
        self.db.add(org)
        self.db.flush()

        # Create owner user
        owner = User(
            id=generate_uuid(),
            organization_id=org.id,
            email=data.email,
            hashed_password=hash_password(data.password),
            first_name=data.first_name,
            last_name=data.last_name,
            role="OWNER",
            is_active=True,
            created_at=utc_now(),
        )
        self.db.add(owner)
        self.db.flush()

        record_audit_event(
            db=self.db,
            organization_id=org.id,
            actor_id=owner.id,
            action="ORGANIZATION_AND_OWNER_CREATED",
            entity_type="Organization",
            entity_id=org.id,
            new_value={"org_name": org.name, "owner_email": owner.email},
            rationale="Initial account sign up",
        )

        access_token = create_access_token(
            {"sub": str(owner.id), "org_id": str(org.id), "role": owner.role}
        )
        refresh_token = create_refresh_token({"sub": str(owner.id)})

        return owner, access_token, refresh_token

    def sign_in(self, data: SignInRequest) -> tuple[User, str, str]:
        user = self.db.scalars(select(User).where(User.email == data.email)).first()
        if not user or not verify_password(data.password, user.hashed_password):
            raise UnauthenticatedException(message="Invalid email or password.")

        if not user.is_active:
            raise ForbiddenException(message="Account has been deactivated.")

        access_token = create_access_token(
            {"sub": str(user.id), "org_id": str(user.organization_id), "role": user.role}
        )
        refresh_token = create_refresh_token({"sub": str(user.id)})

        return user, access_token, refresh_token

    def refresh_session(self, refresh_token: str) -> tuple[User, str, str]:
        try:
            payload = decode_token(refresh_token)
            if payload.get("type") != "refresh":
                raise UnauthenticatedException(message="Invalid token type.")
            user_id = uuid.UUID(payload.get("sub"))
        except Exception:
            raise UnauthenticatedException(message="Invalid or expired refresh token.") from None

        user = self.db.get(User, user_id)
        if not user or not user.is_active:
            raise UnauthenticatedException(message="User not found or deactivated.")

        new_access = create_access_token(
            {"sub": str(user.id), "org_id": str(user.organization_id), "role": user.role}
        )
        new_refresh = create_refresh_token({"sub": str(user.id)})

        return user, new_access, new_refresh

    def get_user_profile(self, user: User) -> UserRead:
        memberships = self.db.scalars(
            select(ProjectMember).where(ProjectMember.user_id == user.id)
        ).all()
        membership_reads = [
            ProjectMembershipRead(project_id=str(m.project_id), role=m.role) for m in memberships
        ]
        perms = get_role_permissions(user.role)

        return UserRead(
            id=str(user.id),
            organization_id=str(user.organization_id),
            email=user.email,
            first_name=user.first_name,
            last_name=user.last_name,
            role=user.role,
            is_active=user.is_active,
            project_memberships=membership_reads,
            permissions=perms,
        )

    def create_invitation(self, inviter: User, data: InvitationCreate) -> tuple[Invitation, str]:
        if inviter.role != "OWNER":
            raise ForbiddenException(message="Only Owners can send invitations.")

        raw_token = secrets.token_urlsafe(32)
        token_hash = hashlib.sha256(raw_token.encode("utf-8")).hexdigest()

        project_id = uuid.UUID(data.project_id) if data.project_id else None

        invitation = Invitation(
            id=generate_uuid(),
            organization_id=inviter.organization_id,
            project_id=project_id,
            email=data.email,
            role=data.role.upper(),
            scope=data.scope.upper(),
            token_hash=token_hash,
            expires_at=datetime.now(UTC) + timedelta(days=data.expires_in_days),
            invited_by=inviter.id,
            created_at=utc_now(),
        )
        self.db.add(invitation)
        self.db.flush()

        record_audit_event(
            db=self.db,
            organization_id=inviter.organization_id,
            actor_id=inviter.id,
            action="INVITATION_CREATED",
            entity_type="Invitation",
            entity_id=invitation.id,
            new_value={
                "email": invitation.email,
                "role": invitation.role,
                "scope": invitation.scope,
            },
            rationale="Owner created invitation",
        )

        return invitation, raw_token

    def accept_invitation(
        self, raw_token: str, data: AcceptInvitationRequest
    ) -> tuple[User, str, str]:
        token_hash = hashlib.sha256(raw_token.encode("utf-8")).hexdigest()
        invitation = self.db.scalars(
            select(Invitation).where(Invitation.token_hash == token_hash)
        ).first()

        if not invitation:
            raise NotFoundException(message="Invitation not found.")

        now = datetime.now(UTC)
        if invitation.revoked_at:
            raise ValidationFailedException(message="Invitation has been revoked.")
        if invitation.accepted_at:
            raise ValidationFailedException(message="Invitation has already been accepted.")
        if invitation.expires_at < now:
            raise ValidationFailedException(message="Invitation has expired.")

        # Check existing user with this email
        user = self.db.scalars(select(User).where(User.email == invitation.email)).first()
        if user:
            # User already exists, update memberships
            user.first_name = data.first_name
            user.last_name = data.last_name
            user.hashed_password = hash_password(data.password)
            user.is_active = True
        else:
            user = User(
                id=generate_uuid(),
                organization_id=invitation.organization_id,
                email=invitation.email,
                hashed_password=hash_password(data.password),
                first_name=data.first_name,
                last_name=data.last_name,
                role=invitation.role,
                is_active=True,
                created_at=utc_now(),
            )
            self.db.add(user)
            self.db.flush()

        # If project_id is specified, create project membership
        if invitation.project_id:
            member = self.db.scalars(
                select(ProjectMember).where(
                    ProjectMember.project_id == invitation.project_id,
                    ProjectMember.user_id == user.id,
                )
            ).first()
            if not member:
                pm = ProjectMember(
                    id=generate_uuid(),
                    organization_id=invitation.organization_id,
                    project_id=invitation.project_id,
                    user_id=user.id,
                    role=invitation.role,
                    created_at=utc_now(),
                )
                self.db.add(pm)

        invitation.accepted_at = now
        self.db.flush()

        record_audit_event(
            db=self.db,
            organization_id=invitation.organization_id,
            actor_id=user.id,
            action="INVITATION_ACCEPTED",
            entity_type="User",
            entity_id=user.id,
            new_value={"email": user.email, "role": user.role},
            rationale="User accepted invitation",
        )

        access_token = create_access_token(
            {"sub": str(user.id), "org_id": str(user.organization_id), "role": user.role}
        )
        refresh_token = create_refresh_token({"sub": str(user.id)})

        return user, access_token, refresh_token

    def revoke_invitation(self, owner: User, invitation_id: uuid.UUID) -> Invitation:
        if owner.role != "OWNER":
            raise ForbiddenException(message="Only Owners can revoke invitations.")

        invitation = self.db.get(Invitation, invitation_id)
        if not invitation or invitation.organization_id != owner.organization_id:
            raise NotFoundException(message="Invitation not found.")

        invitation.revoked_at = utc_now()
        self.db.flush()

        record_audit_event(
            db=self.db,
            organization_id=owner.organization_id,
            actor_id=owner.id,
            action="INVITATION_REVOKED",
            entity_type="Invitation",
            entity_id=invitation.id,
            rationale="Owner revoked invitation",
        )

        return invitation

    def update_project_member(
        self, owner: User, project_id: uuid.UUID, user_id: uuid.UUID, new_role: str | None
    ):
        if owner.role != "OWNER":
            raise ForbiddenException(message="Only Owners can update project members.")

        member = self.db.scalars(
            select(ProjectMember).where(
                ProjectMember.project_id == project_id,
                ProjectMember.user_id == user_id,
            )
        ).first()

        if not member:
            raise NotFoundException(message="Project member not found.")

        if new_role is None or new_role.upper() == "REMOVE":
            self.db.delete(member)
            action = "PROJECT_MEMBER_REMOVED"
            new_val = None
        else:
            prev_role = member.role
            member.role = new_role.upper()
            action = "PROJECT_MEMBER_ROLE_CHANGED"
            new_val = {"role": member.role, "previous_role": prev_role}

        self.db.flush()

        record_audit_event(
            db=self.db,
            organization_id=owner.organization_id,
            actor_id=owner.id,
            action=action,
            entity_type="ProjectMember",
            entity_id=user_id,
            new_value=new_val,
            rationale="Owner modified project member access",
            project_id=project_id,
        )

    async def request_password_reset(self, email: str):
        user = self.db.scalars(select(User).where(User.email == email)).first()
        if not user:
            # Do not reveal email existence
            return

        reset_token = create_access_token(
            {"sub": str(user.id), "scope": "password_reset"}, expires_delta=timedelta(hours=1)
        )
        reset_link = f"/reset-password?token={reset_token}"
        await mailer.send_mail(
            to_email=user.email,
            subject="GroundUp AI - Password Reset Request",
            body=f"Hello {user.first_name},\n\nPlease use the following link to reset your password:\n{reset_link}\n",
        )

    def confirm_password_reset(self, token: str, new_password: str):
        try:
            payload = decode_token(token)
            if payload.get("scope") != "password_reset":
                raise ValidationFailedException(message="Invalid reset token.")
            user_id = uuid.UUID(payload.get("sub"))
        except Exception:
            raise ValidationFailedException(message="Invalid or expired reset token.") from None

        user = self.db.get(User, user_id)
        if not user or not user.is_active:
            raise NotFoundException(message="User not found.")

        user.hashed_password = hash_password(new_password)
        self.db.flush()

        record_audit_event(
            db=self.db,
            organization_id=user.organization_id,
            actor_id=user.id,
            action="PASSWORD_RESET_COMPLETED",
            entity_type="User",
            entity_id=user.id,
            rationale="User reset password via token",
        )
