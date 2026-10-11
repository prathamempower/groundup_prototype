from pathlib import Path

from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    PROJECT_NAME: str = "GroundUp AI API"
    VERSION: str = "0.1.0"
    API_V1_STR: str = "/api/v1"
    ENV: str = "development"
    DEBUG: bool = True

    # Database
    DATABASE_URL: str = (
        "postgresql+psycopg2://groundup:groundup_password@localhost:5436/groundup_db"
    )
    ASYNC_DATABASE_URL: str = (
        "postgresql+asyncpg://groundup:groundup_password@localhost:5436/groundup_db"
    )
    DB_ECHO: bool = False

    # Security
    SECRET_KEY: str = "groundup-dev-secret-key-change-in-production-min-32-chars-long"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60
    REFRESH_TOKEN_EXPIRE_DAYS: int = 7

    # CORS
    BACKEND_CORS_ORIGINS: list[str] = [
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        "http://localhost:8000",
        "http://127.0.0.1:8000",
    ]

    # File Storage
    STORAGE_DIR: str = str(Path(__file__).resolve().parent.parent.parent.parent / "storage_data")

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        case_sensitive=True,
        extra="ignore",
    )


settings = Settings()
