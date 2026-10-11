from typing import Any

from fastapi import HTTPException, status

from app.core.envelope import ErrorFieldDetail


class AppException(HTTPException):
    def __init__(
        self,
        status_code: int,
        code: str,
        message: str,
        fields: list[ErrorFieldDetail] | None = None,
        headers: dict[str, Any] | None = None,
    ):
        super().__init__(status_code=status_code, detail=message, headers=headers)
        self.code = code
        self.message = message
        self.fields = fields or []


# 400 Bad Request
class ValidationFailedException(AppException):
    def __init__(
        self, message: str = "Validation failed", fields: list[ErrorFieldDetail] | None = None
    ):
        super().__init__(status.HTTP_400_BAD_REQUEST, "VALIDATION_FAILED", message, fields)


class AllocationNotBalancedException(AppException):
    def __init__(self, message: str = "Allocation does not balance to source amount"):
        super().__init__(status.HTTP_400_BAD_REQUEST, "ALLOCATION_NOT_BALANCED", message)


class InvalidStateTransitionException(AppException):
    def __init__(
        self,
        message: str = "Invalid state transition",
        fields: list[ErrorFieldDetail] | None = None,
    ):
        super().__init__(status.HTTP_400_BAD_REQUEST, "INVALID_STATE_TRANSITION", message, fields)


# 401 Unauthorized
class UnauthenticatedException(AppException):
    def __init__(self, message: str = "Authentication required"):
        super().__init__(status.HTTP_401_UNAUTHORIZED, "UNAUTHENTICATED", message)


# 403 Forbidden
class ForbiddenException(AppException):
    def __init__(self, message: str = "Access forbidden"):
        super().__init__(status.HTTP_403_FORBIDDEN, "FORBIDDEN", message)


class ProjectScopeDeniedException(AppException):
    def __init__(self, message: str = "Project scope denied"):
        super().__init__(status.HTTP_403_FORBIDDEN, "PROJECT_SCOPE_DENIED", message)


class ReadinessGateBlockedException(AppException):
    def __init__(self, message: str = "Readiness gate blocked"):
        super().__init__(status.HTTP_403_FORBIDDEN, "READINESS_GATE_BLOCKED", message)


# 404 Not Found
class NotFoundException(AppException):
    def __init__(self, message: str = "Resource not found"):
        super().__init__(status.HTTP_404_NOT_FOUND, "NOT_FOUND", message)


# 409 Conflict
class VersionConflictException(AppException):
    def __init__(self, message: str = "Version conflict: resource has been modified"):
        super().__init__(status.HTTP_409_CONFLICT, "VERSION_CONFLICT", message)


class DuplicateDocumentException(AppException):
    def __init__(self, message: str = "Duplicate document detected"):
        super().__init__(status.HTTP_409_CONFLICT, "DUPLICATE_DOCUMENT", message)


class AlreadyApprovedException(AppException):
    def __init__(self, message: str = "Resource is already approved and immutable"):
        super().__init__(status.HTTP_409_CONFLICT, "ALREADY_APPROVED", message)


class PeriodAlreadyReconciledException(AppException):
    def __init__(self, message: str = "Statement period has already been reconciled"):
        super().__init__(status.HTTP_409_CONFLICT, "PERIOD_ALREADY_RECONCILED", message)


# 422 Unprocessable Entity
class AccountNotMappedException(AppException):
    def __init__(self, message: str = "Financial account is not mapped"):
        super().__init__(status.HTTP_422_UNPROCESSABLE_ENTITY, "ACCOUNT_NOT_MAPPED", message)


class CoverageGapException(AppException):
    def __init__(self, message: str = "Coverage gap detected"):
        super().__init__(status.HTTP_422_UNPROCESSABLE_ENTITY, "COVERAGE_GAP", message)


class ContingencyExceededException(AppException):
    def __init__(self, message: str = "Requested amount exceeds available contingency"):
        super().__init__(status.HTTP_422_UNPROCESSABLE_ENTITY, "CONTINGENCY_EXCEEDED", message)


class DrawNotFundableException(AppException):
    def __init__(
        self,
        message: str = "Funding total is below the lender threshold for this draw.",
        fields: list[ErrorFieldDetail] | None = None,
    ):
        super().__init__(status.HTTP_422_UNPROCESSABLE_ENTITY, "DRAW_NOT_FUNDABLE", message, fields)


# 429 Rate Limited
class RateLimitedException(AppException):
    def __init__(self, message: str = "Rate limit exceeded"):
        super().__init__(status.HTTP_429_TOO_MANY_REQUESTS, "RATE_LIMITED", message)
