"""Cloudinary configuration for Roots on Route 66."""

import os

import cloudinary


def configure_cloudinary() -> None:
    """Configure Cloudinary using environment variables."""

    cloud_name = os.getenv("CLOUDINARY_CLOUD_NAME")
    api_key = os.getenv("CLOUDINARY_API_KEY")
    api_secret = os.getenv("CLOUDINARY_API_SECRET")

    if not cloud_name or not api_key or not api_secret:
        raise RuntimeError("Cloudinary environment variables are not configured.")

    cloudinary.config(
        cloud_name=cloud_name,
        api_key=api_key,
        api_secret=api_secret,
        secure=True,
    )
