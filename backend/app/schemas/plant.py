"""
Pydantic schemas for plant and clipping data.
These schemas define the shape of incoming requests and outgoing responses.
"""

from datetime import datetime
from typing import Optional, List

from pydantic import BaseModel, Field

# A canonical list of valid statuses.  Keeping this here allows both the service
# layer and the API clients to agree on acceptable values.
PLANT_STATUSES: list[str] = [
    "🌱 Propagating",
    "🌿 Growing Strong",
    "🌸 Flowering",
    "🍠 Ready to Harvest",
    "🎉 Harvested",
]

class Location(BaseModel):
    """Represents a latitude/longitude pair."""
    lat: float
    lng: float

class PlantCreate(BaseModel):
    """
    Schema for creating a new plant.  Quantity is optional here because the
    service layer sets it to at least 1 if omitted.
    """
    name: str
    variety: Optional[str] = None
    owner_id: Optional[str] = None
    parent_plant_id: Optional[str] = Field(None, alias="parentPlantId")
    location: Optional[Location] = None
    location_name: Optional[str] = None
    notes: Optional[str] = None
    quantity: Optional[int] = None

class ClippingCreate(BaseModel):
    """
    Schema for creating a clipping from an existing parent plant.  The caller
    must provide the parent’s ID.  Other fields default to the parent’s data
    if omitted.
    """
    parent_plant_id: str = Field(alias="parentPlantId")
    name: Optional[str] = None
    variety: Optional[str] = None
    owner_id: Optional[str] = None
    location: Optional[Location] = None
    location_name: Optional[str] = None
    quantity: Optional[int] = None

class PlantUpdate(BaseModel):
    """
    Schema for updating an existing plant.  All fields are optional so that
    PATCH requests can include only the values to change.
    """
    name: Optional[str] = None
    variety: Optional[str] = None
    owner_id: Optional[str] = None
    parent_plant_id: Optional[str] = Field(None, alias="parentPlantId")
    location: Optional[Location] = None
    location_name: Optional[str] = None
    status: Optional[str] = None
    quantity: Optional[int] = None
    notes: Optional[str] = None

class PlantResponse(BaseModel):
    """
    Schema returned by the API for plant documents.  The `_id` field from MongoDB
    is exposed as `id`, and timestamps are included for tracking.
    """
    id: str = Field(alias="_id")
    name: str
    variety: Optional[str] = None
    owner_id: Optional[str] = None
    parent_plant_id: Optional[str] = Field(None, alias="parentPlantId")
    location: Optional[Location] = None
    location_name: Optional[str] = None
    location_history: List[Location] = []
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
