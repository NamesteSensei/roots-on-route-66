"""Upload routes for images stored in Cloudinary."""

from typing import Any

import cloudinary.uploader
from fastapi import APIRouter, Depends, File, HTTPException, UploadFile, status

from app.config.cloudinary_config import configure_cloudinary
from app.dependencies.auth import get_current_firebase_user

router = APIRouter(prefix="/uploads", tags=["uploads"])


@router.post("/image")
async def upload_image(
    image: UploadFile = File(...),
    current_user: dict[str, Any] = Depends(get_current_firebase_user),
) -> dict[str, str]:
    """Upload an image to Cloudinary and return its secure URL."""

    if not image.content_type or not image.content_type.startswith("image/"):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Only image uploads are allowed.",
        )

    configure_cloudinary()

    try:
        upload_result = cloudinary.uploader.upload(
            image.file,
            folder="roots-on-route-66",
            resource_type="image",
            overwrite=False,
        )
    except Exception as exc:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Image upload failed: {exc}",
        ) from exc

    secure_url = upload_result.get("secure_url")
    public_id = upload_result.get("public_id")

    if not secure_url or not public_id:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Cloudinary did not return upload details.",
        )

    return {
        "secure_url": secure_url,
        "public_id": public_id,
    }
