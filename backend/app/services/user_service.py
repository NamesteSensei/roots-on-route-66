"""Business logic for user operations."""

from datetime import datetime, timedelta
from typing import Optional

import bcrypt
import secrets
from bson import ObjectId
from pymongo import ReturnDocument

from app.config.mongodb import users_collection
from app.schemas.user import (
    PasswordResetComplete,
    PasswordResetRequest,
    UserChangePassword,
    UserCreate,
    UserLogin,
    UserResponse,
    UserUpdate,
)

RESET_TOKEN_EXPIRATION_MINUTES = 60


def _document_to_response(document: dict) -> UserResponse:
    """Convert a MongoDB user document into a response schema."""
    document["_id"] = str(document["_id"])
    return UserResponse(**document)


def _get_object_id(value: str) -> ObjectId:
    """Convert a string ID into a MongoDB ObjectId."""
    if not ObjectId.is_valid(value):
        raise ValueError("Invalid user ID.")
    return ObjectId(value)


def _hash_password(password: str) -> str:
    """Hash a plain-text password."""
    hashed = bcrypt.hashpw(password.encode("utf-8"), bcrypt.gensalt())
    return hashed.decode("utf-8")


def _verify_password(password: str, hashed_password: str) -> bool:
    """Verify a password against a stored hash."""
    return bcrypt.checkpw(
        password.encode("utf-8"),
        hashed_password.encode("utf-8"),
    )


async def create_user(user_data: UserCreate) -> UserResponse:
    """Create a new user."""
    existing_email = await users_collection.find_one({"email": user_data.email})
    if existing_email:
        raise ValueError("A user with this email already exists.")

    existing_username = await users_collection.find_one(
        {"username": user_data.username}
    )
    if existing_username:
        raise ValueError("A user with this username already exists.")

    now = datetime.utcnow()
    document = user_data.dict(exclude={"password"})
    document["password"] = _hash_password(user_data.password)
    document["role"] = "user"
    document["created_at"] = now
    document["updated_at"] = now

    result = await users_collection.insert_one(document)
    saved = await users_collection.find_one({"_id": result.inserted_id})

    return _document_to_response(saved)


async def authenticate_user(credentials: UserLogin) -> UserResponse:
    """Authenticate a user by email and password."""
    user = await users_collection.find_one({"email": credentials.email})

    if not user:
        raise ValueError("Invalid email or password.")

    if not _verify_password(credentials.password, user["password"]):
        raise ValueError("Invalid email or password.")

    return _document_to_response(user)


async def get_user(user_id: str) -> Optional[UserResponse]:
    """Get one user by ID."""
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


async def change_password(
    user_id: str,
    payload: UserChangePassword,
) -> None:
    """Change a user's password after checking the old password."""
    object_id = _get_object_id(user_id)
    user = await users_collection.find_one({"_id": object_id})

    if not user:
        raise ValueError("User not found.")

    if not _verify_password(payload.old_password, user["password"]):
        raise ValueError("Old password is incorrect.")

    await users_collection.update_one(
        {"_id": object_id},
        {
            "$set": {
                "password": _hash_password(payload.new_password),
                "updated_at": datetime.utcnow(),
            }
        },
    )


async def request_password_reset(payload: PasswordResetRequest) -> str:
    """Create a password reset token for a user."""
    user = await users_collection.find_one({"email": payload.email})

    if not user:
        raise ValueError("Email not found.")

    token = secrets.token_urlsafe(32)
    expires_at = datetime.utcnow() + timedelta(
        minutes=RESET_TOKEN_EXPIRATION_MINUTES
    )

    await users_collection.update_one(
        {"_id": user["_id"]},
        {
            "$set": {
                "reset_token": token,
                "reset_token_expires_at": expires_at,
                "updated_at": datetime.utcnow(),
            }
        },
    )

    return token


async def reset_password(payload: PasswordResetComplete) -> None:
    """Reset a user's password using a valid reset token."""
    now = datetime.utcnow()
    user = await users_collection.find_one(
        {
            "reset_token": payload.token,
            "reset_token_expires_at": {"$gt": now},
        }
    )

    if not user:
        raise ValueError("Invalid or expired reset token.")

    await users_collection.update_one(
        {"_id": user["_id"]},
        {
            "$set": {
                "password": _hash_password(payload.new_password),
                "updated_at": now,
            },
            "$unset": {
                "reset_token": "",
                "reset_token_expires_at": "",
            },
        },
    )


async def delete_user(user_id: str) -> None:
    """Delete a user by ID."""
    object_id = _get_object_id(user_id)
    await users_collection.delete_one({"_id": object_id})
