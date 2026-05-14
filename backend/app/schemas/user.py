"""Request and response schemas for user endpoints."""

from datetime import datetime
from typing import Optional

from pydantic import BaseModel, EmailStr, Field


class UserCreate(BaseModel):
    """Request schema for creating a user."""

    name: str
    username: str
    zip_code: str
    email: EmailStr
    password: str
    bio: Optional[str] = None
    profile_picture: Optional[str] = None


class UserLogin(BaseModel):
    """Request schema for logging in."""

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
    """Request schema for changing a password."""

    old_password: str
    new_password: str


class PasswordResetRequest(BaseModel):
    """Request schema for starting password reset."""

    email: EmailStr


class PasswordResetComplete(BaseModel):
    """Request schema for completing password reset."""

    token: str
    new_password: str


class UserResponse(BaseModel):
    """Safe user response schema."""

    id: str = Field(alias="_id")
    name: str
    username: str
    zip_code: str
    email: EmailStr
    role: str
    bio: Optional[str] = None
    profile_picture: Optional[str] = None
    created_at: datetime
    updated_at: datetime

    class Config:
        """Pydantic response configuration."""

        allow_population_by_field_name = True
