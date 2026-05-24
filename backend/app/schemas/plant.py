"""Pydantic schemas for plant and clipping data."""

from datetime import datetime
from typing import Optional

from pydantic import BaseModel, Field


PLANT_STATUSES: list[str] = [
    "🌱 Propagating",
    "🌿 Establishing",
    "🍃 Vining Strong",
    "🪴 Canopy Filling",
    "🥔 Tuber Building",
    "🍠 Harvest Ready",
    "🎉 Harvested",
]


class Location(BaseModel):
    """Represent a latitude and longitude pair."""

    lat: float
    lng: float


class PlantCreate(BaseModel):
    """Request schema for creating a new plant."""

    name: str
    variety: Optional[str] = None
    owner_id: Optional[str] = None
    parent_plant_id: Optional[str] = Field(default=None, alias="parentPlantId")
    location: Optional[Location] = None
    location_name: Optional[str] = None
    notes: Optional[str] = None
    quantity: Optional[int] = None

    model_config = {
        "populate_by_name": True,
    }


class ClippingCreate(BaseModel):
    """Request schema for creating a clipping from an existing plant."""

    parent_plant_id: str = Field(alias="parentPlantId")
    name: Optional[str] = None
    variety: Optional[str] = None
    owner_id: Optional[str] = None
    location: Optional[Location] = None
    location_name: Optional[str] = None
    quantity: Optional[int] = None

    model_config = {
        "populate_by_name": True,
    }


class PlantUpdate(BaseModel):
    """Request schema for updating an existing plant."""

    name: Optional[str] = None
    variety: Optional[str] = None
    owner_id: Optional[str] = None
    parent_plant_id: Optional[str] = Field(default=None, alias="parentPlantId")
    location: Optional[Location] = None
    location_name: Optional[str] = None
    status: Optional[str] = None
    quantity: Optional[int] = None
    notes: Optional[str] = None

    model_config = {
        "populate_by_name": True,
    }


class PlantResponse(BaseModel):
    """Response schema for plant documents."""

    id: str = Field(alias="_id")
    name: str
    variety: Optional[str] = None
    owner_id: Optional[str] = None
    parent_plant_id: Optional[str] = Field(default=None, alias="parentPlantId")
    location: Optional[Location] = None
    location_name: Optional[str] = None
    location_history: list[Location] = Field(default_factory=list)
    status: str
    quantity: int
    generation: int
    station_id: Optional[str] = None
    notes: Optional[str] = None
    image_url: Optional[str] = None
    created_at: datetime
    updated_at: datetime

    model_config = {
        "populate_by_name": True,
    }
