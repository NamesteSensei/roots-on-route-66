"""Database model for plant documents."""

from datetime import datetime
from typing import Optional

from pydantic import BaseModel, Field


class Location(BaseModel):
    """Represent a plant location."""

    lat: float
    lng: float


class PlantModel(BaseModel):
    """Represent a plant or clipping stored in MongoDB."""

    id: Optional[str] = Field(default=None, alias="_id")
    name: str
    variety: Optional[str] = None
    owner_id: Optional[str] = None
    parent_plant_id: Optional[str] = None
    location: Optional[Location] = None
    location_name: Optional[str] = None
    location_history: list[Location] = Field(default_factory=list)
    status: str = "🌱 Propagating"
    quantity: int = 1
    generation: int = 0
    station_id: Optional[str] = None
    notes: Optional[str] = None
    image_url: Optional[str] = None
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)

    model_config = {
        "validate_by_name": True,
    }
