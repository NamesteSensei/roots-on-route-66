"""Centralized application settings for Roots on Route 66."""

import os
from dataclasses import dataclass, field

from dotenv import load_dotenv

load_dotenv()


def _split_csv(value: str) -> list[str]:
    """Split a comma-separated environment variable into clean values."""
    return [item.strip() for item in value.split(",") if item.strip()]


@dataclass(frozen=True)
class Settings:
    """Application settings loaded from environment variables."""

    app_name: str = "Roots on Route 66 API"
    app_version: str = "0.2.0"
    serve_frontend: bool = field(
        default_factory=lambda: os.getenv(
            "SERVE_FRONTEND", "false"
        ).lower() == "true"
    )

    mongodb_uri: str = field(
        default_factory=lambda: (
            os.getenv("MONGODB_URI")
            or os.getenv("MONGO_URI")
            or "mongodb://localhost:27017"
        )
    )
    mongodb_db_name: str = field(
        default_factory=lambda: (
            os.getenv("MONGODB_DB_NAME")
            or os.getenv("DATABASE_NAME")
            or "roots_on_route_66"
        )
    )

    allowed_origins: list[str] = field(
        default_factory=lambda: _split_csv(
            os.getenv(
                "ALLOWED_ORIGINS",
                "http://localhost:5500,http://127.0.0.1:5500",
            )
        )
    )

    firebase_service_account_json: str = field(
        default_factory=lambda: os.getenv("FIREBASE_SERVICE_ACCOUNT_JSON", "")
    )

    cloudinary_cloud_name: str = field(
        default_factory=lambda: os.getenv("CLOUDINARY_CLOUD_NAME", "")
    )
    cloudinary_api_key: str = field(
        default_factory=lambda: os.getenv("CLOUDINARY_API_KEY", "")
    )
    cloudinary_api_secret: str = field(
        default_factory=lambda: os.getenv("CLOUDINARY_API_SECRET", "")
    )


settings = Settings()
