from fastapi import APIRouter

from app.core.envelope import ResponseEnvelope, ResponseMeta

router = APIRouter()


@router.get("/health", response_model=ResponseEnvelope[dict])
async def health_check():
    return ResponseEnvelope(
        data={"status": "healthy", "service": "groundup-api"},
        meta=ResponseMeta(data_quality="VERIFIED"),
    )
