"""Cloudinary configuration for Roots on Route 66."""

import cloudinary

from app.core.config import settings


def configure_cloudinary() -> None:
    """Configure Cloudinary using environment variables."""

    if (
        not settings.cloudinary_cloud_name
        or not settings.cloudinary_api_key
        or not settings.cloudinary_api_secret
    ):
        raise RuntimeError("Cloudinary environment variables are not configured.")

    cloudinary.config(
        cloud_name=settings.cloudinary_cloud_name,
        api_key=settings.cloudinary_api_key,
        api_secret=settings.cloudinary_api_secret,
        secure=True,
    )
