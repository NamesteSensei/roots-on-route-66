"""Request and response schemas for user endpoints."""

from datetime import datetime
from typing import Optional

from pydantic import BaseModel, EmailStr, Field


class UserCreate(BaseModel):
    """Request schema for creating a local user profile."""

    name: str
    username: Optional[str] = None
    zip_code: Optional[str] = None
    email: EmailStr
    bio: Optional[str] = None
    profile_picture: Optional[str] = None


class UserLogin(BaseModel):
    """Legacy login schema retained for backward compatibility."""

    email: EmailStr
    password: str


class UserUpdate(BaseModel):
    """Request schema for updating a user profile."""

    name: Optional[str] = None
    username: Optional[str] = None
    zip_code: Optional[str] = None
    bio: Optional[str] = None
    profile_picture: Optional[str] = None


class UserChangePassword(BaseModel):
    """Legacy schema retained while Firebase handles password auth."""

    old_password: str
    new_password: str


class PasswordResetRequest(BaseModel):
    """Legacy schema retained while Firebase handles password reset."""

    email: EmailStr


class PasswordResetComplete(BaseModel):
    """Legacy schema retained while Firebase handles password reset."""

    token: str
    new_password: str


class FirebaseUserSync(BaseModel):
    """Request schema for syncing Firebase users into MongoDB."""

    name: Optional[str] = None
    username: Optional[str] = None
    zip_code: Optional[str] = None
    bio: Optional[str] = None
    profile_picture: Optional[str] = None


class UserResponse(BaseModel):
    """Safe user response schema."""

    id: str = Field(alias="_id")
    firebase_uid: Optional[str] = None
    name: str
    username: Optional[str] = None
    zip_code: Optional[str] = None
    email: EmailStr
    role: str
    auth_provider: str = "firebase"
    bio: Optional[str] = None
    profile_picture: Optional[str] = None
    created_at: datetime
    updated_at: datetime

    model_config = {
        "validate_by_name": True,
    }
