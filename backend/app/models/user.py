"""Database model for user documents."""

from datetime import datetime
from typing import Optional

from pydantic import BaseModel, EmailStr, Field


class UserModel(BaseModel):
    """Represent a user stored in MongoDB."""

    id: Optional[str] = Field(default=None, alias="_id")
    name: str
    username: str
    zip_code: str
    email: EmailStr
    password: str
    role: str = "user"
    bio: Optional[str] = None
    profile_picture: Optional[str] = None
    reset_token: Optional[str] = None
    reset_token_expires_at: Optional[datetime] = None
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)

    class Config:
        """Pydantic model configuration."""

        allow_population_by_field_name = True
