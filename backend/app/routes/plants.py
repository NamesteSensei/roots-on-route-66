"""API routes for plant operations."""

from fastapi import APIRouter, HTTPException, status

from app.schemas.plant import ClippingCreate, PlantCreate, PlantResponse, PlantUpdate
from app.services import plant_service

router = APIRouter(prefix="/plants", tags=["plants"])


@router.post(
    "/",
    response_model=PlantResponse,
    status_code=status.HTTP_201_CREATED,
)
async def create_plant(plant: PlantCreate) -> PlantResponse:
    """Create a new plant."""
    return await plant_service.create_plant(plant)


@router.post(
    "/clippings",
    response_model=PlantResponse,
    status_code=status.HTTP_201_CREATED,
)
async def create_clipping(clipping: ClippingCreate) -> PlantResponse:
    """Create a clipping from a parent plant."""
    try:
        return await plant_service.create_clipping(clipping)
    except ValueError as error:
        raise HTTPException(status_code=400, detail=str(error)) from error


@router.get("/", response_model=list[PlantResponse])
async def read_all_plants() -> list[PlantResponse]:
    """Read all plants."""
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
) -> PlantResponse:
    """Update one plant by ID."""
    try:
        plant = await plant_service.update_plant(plant_id, updates)
    except ValueError as error:
        raise HTTPException(status_code=400, detail=str(error)) from error

    if not plant:
        raise HTTPException(status_code=404, detail="Plant not found.")

    return plant


@router.delete("/{plant_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_plant(plant_id: str) -> None:
    """Delete one plant by ID."""
    try:
        await plant_service.delete_plant(plant_id)
    except ValueError as error:
        raise HTTPException(status_code=400, detail=str(error)) from error
