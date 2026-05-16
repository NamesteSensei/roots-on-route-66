"""Database model for user documents."""

from datetime import datetime
from typing import Optional

from pydantic import BaseModel, EmailStr, Field


class UserModel(BaseModel):
    """Represent a user stored in MongoDB."""

    id: Optional[str] = Field(default=None, alias="_id")
    firebase_uid: Optional[str] = None
    name: str
    username: Optional[str] = None
    zip_code: Optional[str] = None
    email: EmailStr
    role: str = "user"
    auth_provider: str = "firebase"
    bio: Optional[str] = None
    profile_picture: Optional[str] = None
    reset_token: Optional[str] = None
    reset_token_expires_at: Optional[datetime] = None
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)

    class Config:
        """Pydantic model configuration."""

        allow_population_by_field_name = True
