"""Business logic for plant operations."""

from datetime import datetime
from typing import Optional

from bson import ObjectId
from pymongo import ReturnDocument

from app.config.mongodb import plants_collection
from app.schemas.plant import (
    ClippingCreate,
    PlantCreate,
    PlantResponse,
    PlantUpdate,
    PLANT_STATUSES,
)


def _document_to_response(document: dict) -> PlantResponse:
    """Convert a MongoDB plant document into a response schema."""
    document["_id"] = str(document["_id"])

    if document.get("parent_plant_id"):
        document["parent_plant_id"] = str(document["parent_plant_id"])

    return PlantResponse(**document)


def _get_object_id(value: str) -> ObjectId:
    """Convert a string ID into a MongoDB ObjectId."""
    if not ObjectId.is_valid(value):
        raise ValueError("Invalid plant ID.")

    return ObjectId(value)


def _safe_quantity(value: Optional[int]) -> int:
    """Return a valid plant quantity with a minimum value of one."""
    if value is None:
        return 1

    return max(value, 1)


async def create_plant(data: PlantCreate) -> PlantResponse:
    """Create a new plant."""
    now = datetime.utcnow()
    document = data.model_dump(by_alias=False)
    document["quantity"] = _safe_quantity(document.get("quantity"))
    document["generation"] = 0
    document["status"] = "🌱 Rooting Up"
    document["location_history"] = []
    document["created_at"] = now
    document["updated_at"] = now

    result = await plants_collection.insert_one(document)
    saved = await plants_collection.find_one({"_id": result.inserted_id})

    return _document_to_response(saved)


async def create_clipping(data: ClippingCreate) -> PlantResponse:
    """Create a clipping from an existing parent plant."""
    parent_id = _get_object_id(data.parent_plant_id)
    parent = await plants_collection.find_one({"_id": parent_id})

    if not parent:
        raise ValueError("Parent plant not found.")

    now = datetime.utcnow()
    document = data.model_dump(exclude={"parent_plant_id"}, by_alias=False)
    document["name"] = document.get("name") or parent["name"]
    document["variety"] = document.get("variety") or parent.get("variety")
    document["owner_id"] = document.get("owner_id") or parent.get("owner_id")
    document["parent_plant_id"] = str(parent["_id"])
    document["location"] = document.get("location") or parent.get("location")
    document["location_name"] = (
        document.get("location_name") or parent.get("location_name")
    )
    document["quantity"] = _safe_quantity(document.get("quantity"))
    document["generation"] = parent.get("generation", 0) + 1
    document["status"] = "🌱 Rooting Up"
    document["location_history"] = parent.get("location_history", [])
    document["created_at"] = now
    document["updated_at"] = now

    result = await plants_collection.insert_one(document)
    saved = await plants_collection.find_one({"_id": result.inserted_id})

    return _document_to_response(saved)


async def get_plant(plant_id: str) -> Optional[PlantResponse]:
    """Get one plant by ID."""
    object_id = _get_object_id(plant_id)
    plant = await plants_collection.find_one({"_id": object_id})

    if not plant:
        return None

    return _document_to_response(plant)


async def get_plants_by_owner(owner_id: str) -> list[PlantResponse]:
    """Get all plants owned by a user."""
    cursor = plants_collection.find({"owner_id": owner_id})
    return [_document_to_response(document) async for document in cursor]


async def get_all_plants() -> list[PlantResponse]:
    """Get all plants."""
    cursor = plants_collection.find()
    return [_document_to_response(document) async for document in cursor]


async def get_lineage(plant_id: str) -> list[PlantResponse]:
    """Get parent lineage for a plant."""
    lineage: list[PlantResponse] = []
    current_id = plant_id

    while current_id:
        plant = await get_plant(current_id)

        if not plant:
            break

        lineage.insert(0, plant)
        current_id = plant.parent_plant_id

    return lineage


async def update_plant(
    plant_id: str,
    updates: PlantUpdate,
) -> Optional[PlantResponse]:
    """Update a plant by ID."""
    object_id = _get_object_id(plant_id)
    update_data = updates.model_dump(exclude_unset=True, by_alias=False)

    if "status" in update_data and update_data["status"] not in PLANT_STATUSES:
        raise ValueError("Invalid plant status.")

    if "quantity" in update_data:
        update_data["quantity"] = _safe_quantity(update_data["quantity"])

    if not update_data:
        return await get_plant(plant_id)

    update_data["updated_at"] = datetime.utcnow()

    updated = await plants_collection.find_one_and_update(
        {"_id": object_id},
        {"$set": update_data},
        return_document=ReturnDocument.AFTER,
    )

    if not updated:
        return None

    return _document_to_response(updated)


async def delete_plant(plant_id: str) -> None:
    """Delete a plant by ID."""
    object_id = _get_object_id(plant_id)
    await plants_collection.delete_one({"_id": object_id})
