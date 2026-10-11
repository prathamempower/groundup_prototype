from pydantic import BaseModel, EmailStr, Field


# Organization schemas
class OrganizationCreate(BaseModel):
    name: str = Field(min_length=1, max_length=255)


class OrganizationRead(BaseModel):
    id: str
    name: str
    created_at: str

    model_config = {"from_attributes": True}


class OrganizationUpdate(BaseModel):
    name: str | None = Field(default=None, min_length=1, max_length=255)


# User & Auth schemas
class SignUpRequest(BaseModel):
    organization_name: str = Field(min_length=1, max_length=255)
    email: EmailStr
    password: str = Field(min_length=8)
    first_name: str = Field(min_length=1, max_length=100)
    last_name: str = Field(min_length=1, max_length=100)


class SignInRequest(BaseModel):
    email: EmailStr
    password: str
    remember_me: bool = False


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"


class ProjectMembershipRead(BaseModel):
    project_id: str
    role: str

    model_config = {"from_attributes": True}


class UserRead(BaseModel):
    id: str
    organization_id: str
    email: str
    first_name: str
    last_name: str
    role: str
    is_active: bool
    project_memberships: list[ProjectMembershipRead] = Field(default_factory=list)
    permissions: list[str] = Field(default_factory=list)

    model_config = {"from_attributes": True}


# Invitation schemas
class InvitationCreate(BaseModel):
    email: EmailStr
    role: str  # OWNER, CFO, PM, GC, INVESTOR
    project_id: str | None = None
    scope: str = "ORGANIZATION"  # ORGANIZATION or PROJECT
    expires_in_days: int = 7


class InvitationBulkCreate(BaseModel):
    invitations: list[InvitationCreate]


class InvitationRead(BaseModel):
    id: str
    organization_id: str
    project_id: str | None = None
    email: str
    role: str
    scope: str
    expires_at: str
    accepted_at: str | None = None
    revoked_at: str | None = None
    invited_by: str
    invitation_url: str | None = None
    organization_name: str | None = None
    project_name: str | None = None
    status: str = "PENDING"

    model_config = {"from_attributes": True}


class AcceptInvitationRequest(BaseModel):
    first_name: str = Field(min_length=1, max_length=100)
    last_name: str = Field(min_length=1, max_length=100)
    password: str = Field(min_length=8)


# Password reset schemas
class PasswordResetRequest(BaseModel):
    email: EmailStr


class PasswordResetConfirm(BaseModel):
    token: str
    new_password: str = Field(min_length=8)


# Project Member Update
class ProjectMemberUpdate(BaseModel):
    role: str | None = None  # If None or "REMOVE", removes member from project
