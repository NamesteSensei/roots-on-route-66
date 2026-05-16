"""API routes for plant operations."""

from typing import Any

from fastapi import APIRouter, Depends, HTTPException, status

from app.dependencies.auth import get_current_firebase_user
from app.schemas.plant import ClippingCreate, PlantCreate, PlantResponse, PlantUpdate
from app.services import plant_service, user_service

router = APIRouter(prefix="/plants", tags=["plants"])


async def _get_current_mongo_user_id(firebase_user: dict[str, Any]) -> str:
    """Return the MongoDB user ID connected to a Firebase user."""
    current_user = await user_service.get_user_by_firebase_uid(
        firebase_user["uid"]
    )

    if not current_user:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="User profile must be synced before tracking plants.",
        )

    return current_user.id


@router.post(
    "/",
    response_model=PlantResponse,
    status_code=status.HTTP_201_CREATED,
)
async def create_plant(
    plant: PlantCreate,
    firebase_user: dict[str, Any] = Depends(get_current_firebase_user),
) -> PlantResponse:
    """Create a new plant for the current authenticated user."""
    owner_id = await _get_current_mongo_user_id(firebase_user)
    plant.owner_id = owner_id

    return await plant_service.create_plant(plant)


@router.post(
    "/clippings",
    response_model=PlantResponse,
    status_code=status.HTTP_201_CREATED,
)
async def create_clipping(
    clipping: ClippingCreate,
    firebase_user: dict[str, Any] = Depends(get_current_firebase_user),
) -> PlantResponse:
    """Create a clipping from a parent plant."""
    owner_id = await _get_current_mongo_user_id(firebase_user)
    clipping.owner_id = owner_id

    try:
        return await plant_service.create_clipping(clipping)
    except ValueError as error:
        raise HTTPException(status_code=400, detail=str(error)) from error


@router.get("/", response_model=list[PlantResponse])
async def read_all_plants() -> list[PlantResponse]:
    """Read all public plants."""
    return await plant_service.get_all_plants()


@router.get("/owner/{owner_id}", response_model=list[PlantResponse])
async def read_plants_by_owner(owner_id: str) -> list[PlantResponse]:
    """Read plants owned by one user."""
    return await plant_service.get_plants_by_owner(owner_id)


@router.get("/{plant_id}/lineage", response_model=list[PlantResponse])
async def read_plant_lineage(plant_id: str) -> list[PlantResponse]:
    """Read plant lineage."""
    try:
        return await plant_service.get_lineage(plant_id)
    except ValueError as error:
        raise HTTPException(status_code=400, detail=str(error)) from error


@router.get("/{plant_id}", response_model=PlantResponse)
async def read_plant(plant_id: str) -> PlantResponse:
    """Read one plant by ID."""
    try:
        plant = await plant_service.get_plant(plant_id)
    except ValueError as error:
        raise HTTPException(status_code=400, detail=str(error)) from error

    if not plant:
        raise HTTPException(status_code=404, detail="Plant not found.")

    return plant


@router.patch("/{plant_id}", response_model=PlantResponse)
async def update_plant(
    plant_id: str,
    updates: PlantUpdate,
    firebase_user: dict[str, Any] = Depends(get_current_firebase_user),
) -> PlantResponse:
    """Update one plant by ID."""
    owner_id = await _get_current_mongo_user_id(firebase_user)
    existing_plant = await plant_service.get_plant(plant_id)

    if not existing_plant:
        raise HTTPException(status_code=404, detail="Plant not found.")

    if existing_plant.owner_id != owner_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You can only update your own plants.",
        )

    try:
        plant = await plant_service.update_plant(plant_id, updates)
    except ValueError as error:
        raise HTTPException(status_code=400, detail=str(error)) from error

    if not plant:
        raise HTTPException(status_code=404, detail="Plant not found.")

    return plant


@router.delete("/{plant_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_plant(
    plant_id: str,
    firebase_user: dict[str, Any] = Depends(get_current_firebase_user),
) -> None:
    """Delete one plant by ID."""
    owner_id = await _get_current_mongo_user_id(firebase_user)
    existing_plant = await plant_service.get_plant(plant_id)

    if not existing_plant:
        return

    if existing_plant.owner_id != owner_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You can only delete your own plants.",
        )

    await plant_service.delete_plant(plant_id)
