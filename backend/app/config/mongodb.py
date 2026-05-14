"""MongoDB connection and index setup for Roots on Route 66."""

import os

from motor.motor_asyncio import AsyncIOMotorClient
from pymongo import ASCENDING, TEXT

MONGO_URI = os.getenv("MONGO_URI", "mongodb://localhost:27017")
DATABASE_NAME = os.getenv("DATABASE_NAME", "roots_on_route_66")

client = AsyncIOMotorClient(MONGO_URI)
database = client[DATABASE_NAME]

users_collection = database["users"]
plants_collection = database["plants"]
logs_collection = database["logs"]


async def create_indexes() -> None:
    """Create MongoDB indexes required by the application."""
    await users_collection.create_index(
        [("email", ASCENDING)],
        unique=True,
        name="unique_user_email",
    )

    await users_collection.create_index(
        [("username", ASCENDING)],
        unique=True,
        name="unique_username",
        sparse=True,
    )

    await users_collection.create_index(
        [("reset_token", ASCENDING)],
        name="user_reset_token",
        sparse=True,
    )

    await plants_collection.create_index(
        [("owner_id", ASCENDING)],
        name="plant_owner_id",
    )

    await plants_collection.create_index(
        [("parent_plant_id", ASCENDING)],
        name="plant_parent_id",
        sparse=True,
    )

    await plants_collection.create_index(
        [("name", TEXT), ("variety", TEXT), ("location_name", TEXT)],
        name="plant_text_search",
    )

    await logs_collection.create_index(
        [("created_at", ASCENDING)],
        name="log_created_at",
    )
