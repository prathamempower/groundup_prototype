import logging

from fastapi import FastAPI, Request
from fastapi.exceptions import RequestValidationError
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from starlette.exceptions import HTTPException as StarletteHTTPException

from app.api.v1.router import api_v1_router
from app.core.config import settings
from app.core.envelope import (
    ErrorDetail,
    ErrorEnvelope,
    ErrorFieldDetail,
    ResponseEnvelope,
    ResponseMeta,
)
from app.core.errors import AppException
from app.core.middleware import RequestContextMiddleware

# Logging configuration
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s",
)

logger = logging.getLogger("groundup.main")

app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.VERSION,
    openapi_url=f"{settings.API_V1_STR}/openapi.json",
    docs_url=f"{settings.API_V1_STR}/docs",
    redoc_url=f"{settings.API_V1_STR}/redoc",
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.BACKEND_CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Request context and logging middleware
app.add_middleware(RequestContextMiddleware)


# Exception Handlers ensuring ErrorEnvelope format
@app.exception_handler(AppException)
async def app_exception_handler(request: Request, exc: AppException):
    req_id = getattr(request.state, "request_id", None)
    error_env = ErrorEnvelope(
        error=ErrorDetail(
            code=exc.code,
            message=exc.message,
            fields=exc.fields if exc.fields else None,
            request_id=req_id,
        )
    )
    return JSONResponse(status_code=exc.status_code, content=error_env.model_dump())


@app.exception_handler(RequestValidationError)
async def validation_exception_handler(request: Request, exc: RequestValidationError):
    req_id = getattr(request.state, "request_id", None)
    field_errors = []
    for err in exc.errors():
        loc = ".".join(str(part) for part in err.get("loc", []))
        field_errors.append(ErrorFieldDetail(path=loc, issue=err.get("msg", "invalid")))

    error_env = ErrorEnvelope(
        error=ErrorDetail(
            code="VALIDATION_FAILED",
            message="Request input validation failed.",
            fields=field_errors,
            request_id=req_id,
        )
    )
    return JSONResponse(status_code=400, content=error_env.model_dump())


@app.exception_handler(StarletteHTTPException)
async def http_exception_handler(request: Request, exc: StarletteHTTPException):
    req_id = getattr(request.state, "request_id", None)
    code = "NOT_FOUND" if exc.status_code == 404 else "INTERNAL_ERROR"
    error_env = ErrorEnvelope(
        error=ErrorDetail(
            code=code,
            message=str(exc.detail),
            request_id=req_id,
        )
    )
    return JSONResponse(status_code=exc.status_code, content=error_env.model_dump())


@app.exception_handler(Exception)
async def general_exception_handler(request: Request, exc: Exception):
    req_id = getattr(request.state, "request_id", None)
    logger.exception(f"Unhandled exception: {exc}")
    error_env = ErrorEnvelope(
        error=ErrorDetail(
            code="INTERNAL_ERROR",
            message="An unexpected server error occurred.",
            request_id=req_id,
        )
    )
    return JSONResponse(status_code=500, content=error_env.model_dump())


# Top-level health check for convenience
@app.get("/health", response_model=ResponseEnvelope[dict])
async def root_health():
    return ResponseEnvelope(
        data={"status": "healthy", "service": "groundup-api"},
        meta=ResponseMeta(data_quality="VERIFIED"),
    )


# Include API v1 routes
app.include_router(api_v1_router, prefix=settings.API_V1_STR)
