"""Business logic for community media posts."""

from datetime import datetime
from typing import Any, Optional

from bson import ObjectId

from app.config.mongodb import media_collection
from app.schemas.media import MediaCreate, MediaResponse


def _document_to_response(document: dict[str, Any]) -> MediaResponse:
    """Convert a MongoDB media document into a response schema."""

    document["_id"] = str(document["_id"])
    return MediaResponse(**document)


def _get_object_id(value: str) -> ObjectId:
    """Convert a string ID into a MongoDB ObjectId."""

    if not ObjectId.is_valid(value):
        raise ValueError("Invalid media ID.")

    return ObjectId(value)


async def create_media_post(
    data: MediaCreate,
    owner_id: str,
    owner_name: str,
    owner_profile_picture: Optional[str] = None,
) -> MediaResponse:
    """Create a media post metadata record."""

    now = datetime.utcnow()
    document = data.model_dump()
    document["owner_id"] = owner_id
    document["owner_name"] = owner_name
    document["owner_profile_picture"] = owner_profile_picture
    document["created_at"] = now
    document["updated_at"] = now

    result = await media_collection.insert_one(document)
    saved = await media_collection.find_one({"_id": result.inserted_id})

    return _document_to_response(saved)


async def get_all_media_posts() -> list[MediaResponse]:
    """Return all media posts newest first."""

    cursor = media_collection.find().sort("created_at", -1)
    return [_document_to_response(document) async for document in cursor]


async def get_media_post(media_id: str) -> Optional[MediaResponse]:
    """Return one media post by ID."""

    object_id = _get_object_id(media_id)
    document = await media_collection.find_one({"_id": object_id})

    if not document:
        return None

    return _document_to_response(document)


async def delete_media_post(media_id: str) -> bool:
    """Delete a media post metadata record."""

    object_id = _get_object_id(media_id)
    result = await media_collection.delete_one({"_id": object_id})

    return result.deleted_count == 1
