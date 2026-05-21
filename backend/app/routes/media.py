"""API routes for community media posts."""

from typing import Any

from fastapi import APIRouter, Depends, HTTPException, status

from app.dependencies.auth import get_current_firebase_user
from app.schemas.media import MediaCreate, MediaResponse
from app.services import media_service, user_service

router = APIRouter(prefix="/media", tags=["media"])


async def _get_current_mongo_user(firebase_user: dict[str, Any]):
    """Return the MongoDB user profile connected to a Firebase user."""

    current_user = await user_service.get_user_by_firebase_uid(
        firebase_user["uid"]
    )

    if not current_user:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="User profile must be synced before sharing media.",
        )

    return current_user


@router.get("/", response_model=list[MediaResponse])
async def read_all_media_posts() -> list[MediaResponse]:
    """Read all community media posts."""

    return await media_service.get_all_media_posts()


@router.post(
    "/",
    response_model=MediaResponse,
    status_code=status.HTTP_201_CREATED,
)
async def create_media_post(
    media: MediaCreate,
    firebase_user: dict[str, Any] = Depends(get_current_firebase_user),
) -> MediaResponse:
    """Create a community media post."""

    current_user = await _get_current_mongo_user(firebase_user)

    return await media_service.create_media_post(
        data=media,
        owner_id=current_user.id,
        owner_name=current_user.name,
        owner_profile_picture=current_user.profile_picture,
    )


@router.delete("/{media_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_media_post(
    media_id: str,
    firebase_user: dict[str, Any] = Depends(get_current_firebase_user),
) -> None:
    """Delete one owned media post."""

    current_user = await _get_current_mongo_user(firebase_user)

    try:
        media = await media_service.get_media_post(media_id)
    except ValueError as error:
        raise HTTPException(status_code=400, detail=str(error)) from error

    if not media:
        raise HTTPException(status_code=404, detail="Media post not found.")

    if media.owner_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You can only delete your own media posts.",
        )

    deleted = await media_service.delete_media_post(media_id)

    if not deleted:
        raise HTTPException(status_code=404, detail="Media post not found.")
