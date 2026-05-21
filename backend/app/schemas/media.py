"""Pydantic schemas for community media posts."""

from datetime import datetime
from typing import Optional

from pydantic import BaseModel, Field


class MediaCreate(BaseModel):
    """Request schema for creating a media post."""

    plant_id: str
    plant_name: Optional[str] = None
    caption: str
    media_type: str = "image"
    secure_url: str
    public_id: str


class MediaResponse(BaseModel):
    """Response schema for media post documents."""

    id: str = Field(alias="_id")
    owner_id: str
    owner_name: str
    owner_profile_picture: Optional[str] = None
    plant_id: str
    plant_name: Optional[str] = None
    caption: str
    media_type: str
    secure_url: str
    public_id: str
    created_at: datetime
    updated_at: datetime

    model_config = {
        "populate_by_name": True,
    }
