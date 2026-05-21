"""Business logic for user operations."""

from datetime import datetime
import re
from typing import Any, Optional

from bson import ObjectId
from pymongo import ReturnDocument

from app.config.mongodb import users_collection
from app.schemas.user import FirebaseUserSync, UserResponse, UserUpdate


def _document_to_response(document: dict[str, Any]) -> UserResponse:
    """Convert a MongoDB user document into a response schema."""

    document["_id"] = str(document["_id"])
    return UserResponse(**document)


def _get_object_id(value: str) -> ObjectId:
    """Convert a string ID into a MongoDB ObjectId."""

    if not ObjectId.is_valid(value):
        raise ValueError("Invalid user ID.")

    return ObjectId(value)


def _normalize_username(value: Optional[str]) -> Optional[str]:
    """Normalize a username or return None when it is blank."""

    if not value:
        return None

    username = value.strip().lower()
    username = re.sub(r"[^a-z0-9_]", "_", username)
    username = re.sub(r"_+", "_", username)
    username = username.strip("_")

    return username or None


async def _build_unique_username(
    preferred_username: Optional[str],
    email: str,
    firebase_uid: str,
    current_user_id: Optional[ObjectId] = None,
) -> str:
    """Build a unique username for a Firebase-authenticated user."""

    base_username = (
        _normalize_username(preferred_username)
        or _normalize_username(email.split("@")[0])
        or f"grower_{firebase_uid[:8].lower()}"
    )

    username = base_username
    counter = 1

    while True:
        existing = await users_collection.find_one({"username": username})

        if not existing:
            return username

        if current_user_id and existing.get("_id") == current_user_id:
            return username

        username = f"{base_username}_{counter}"
        counter += 1


def _remove_empty_values(data: dict[str, Any]) -> dict[str, Any]:
    """Remove empty string values from profile update data."""

    cleaned = {}

    for key, value in data.items():
        if isinstance(value, str) and not value.strip():
            continue

        cleaned[key] = value

    return cleaned


async def sync_firebase_user(
    firebase_claims: dict[str, Any],
    profile_data: FirebaseUserSync,
) -> UserResponse:
    """Create or update a MongoDB profile for a Firebase user."""

    firebase_uid = firebase_claims["uid"]
    email = firebase_claims.get("email")

    if not email:
        raise ValueError("Firebase account does not include an email.")

    now = datetime.utcnow()
    existing_user = await users_collection.find_one(
        {"firebase_uid": firebase_uid}
    )

    update_data = profile_data.dict(exclude_unset=True)
    update_data = _remove_empty_values(update_data)

    fallback_name = firebase_claims.get("name") or email.split("@")[0]
    profile_picture = firebase_claims.get("picture")

    if existing_user and not update_data.get("profile_picture"):
        update_data.pop("profile_picture", None)

    if existing_user:
        current_user_id = existing_user["_id"]

        preferred_username = update_data.pop(
            "username",
            existing_user.get("username"),
        )

        update_data["username"] = await _build_unique_username(
            preferred_username=preferred_username,
            email=email,
            firebase_uid=firebase_uid,
            current_user_id=current_user_id,
        )

        update_data["updated_at"] = now

        if profile_picture and not existing_user.get("profile_picture"):
            update_data["profile_picture"] = profile_picture

        updated = await users_collection.find_one_and_update(
            {"firebase_uid": firebase_uid},
            {"$set": update_data},
            return_document=ReturnDocument.AFTER,
        )

        return _document_to_response(updated)

    username = await _build_unique_username(
        preferred_username=update_data.pop("username", None),
        email=email,
        firebase_uid=firebase_uid,
    )

    document = {
        "firebase_uid": firebase_uid,
        "name": update_data.pop("name", fallback_name),
        "username": username,
        "zip_code": update_data.pop("zip_code", None),
        "email": email,
        "role": "user",
        "auth_provider": firebase_claims.get("firebase", {}).get(
            "sign_in_provider",
            "firebase",
        ),
        "bio": update_data.pop("bio", None),
        "profile_picture": update_data.pop(
            "profile_picture",
            profile_picture,
        ),
        "created_at": now,
        "updated_at": now,
    }

    result = await users_collection.insert_one(document)
    saved = await users_collection.find_one({"_id": result.inserted_id})

    return _document_to_response(saved)


async def get_user_by_firebase_uid(
    firebase_uid: str,
) -> Optional[UserResponse]:
    """Get a user profile by Firebase UID."""

    user = await users_collection.find_one({"firebase_uid": firebase_uid})

    if not user:
        return None

    return _document_to_response(user)


async def get_user(user_id: str) -> Optional[UserResponse]:
    """Get one user by MongoDB ID."""

    object_id = _get_object_id(user_id)
    user = await users_collection.find_one({"_id": object_id})

    if not user:
        return None

    return _document_to_response(user)


async def update_user(
    user_id: str,
    updates: UserUpdate,
) -> Optional[UserResponse]:
    """Update a user's editable profile fields."""

    object_id = _get_object_id(user_id)
    update_data = updates.dict(exclude_unset=True)
    update_data = _remove_empty_values(update_data)

    if "username" in update_data:
        current_user = await users_collection.find_one({"_id": object_id})

        if not current_user:
            return None

        update_data["username"] = await _build_unique_username(
            preferred_username=update_data["username"],
            email=current_user["email"],
            firebase_uid=current_user.get("firebase_uid", str(object_id)),
            current_user_id=object_id,
        )

    if not update_data:
        return await get_user(user_id)

    update_data["updated_at"] = datetime.utcnow()

    updated = await users_collection.find_one_and_update(
        {"_id": object_id},
        {"$set": update_data},
        return_document=ReturnDocument.AFTER,
    )

    if not updated:
        return None

    return _document_to_response(updated)


async def delete_user(user_id: str) -> None:
    """Delete a user profile by MongoDB ID."""

    object_id = _get_object_id(user_id)
    await users_collection.delete_one({"_id": object_id})
