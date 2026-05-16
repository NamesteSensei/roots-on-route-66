"""API routes for user operations."""

from typing import Any

from fastapi import APIRouter, Depends, HTTPException, status

from app.dependencies.auth import get_current_firebase_user
from app.schemas.user import FirebaseUserSync, UserResponse, UserUpdate
from app.services import user_service

router = APIRouter(prefix="/users", tags=["users"])


@router.post("/sync", response_model=UserResponse)
async def sync_current_user(
    profile_data: FirebaseUserSync,
    firebase_user: dict[str, Any] = Depends(get_current_firebase_user),
) -> UserResponse:
    """Create or update the current Firebase user's MongoDB profile."""
    try:
        return await user_service.sync_firebase_user(
            firebase_claims=firebase_user,
            profile_data=profile_data,
        )
    except ValueError as error:
        raise HTTPException(status_code=400, detail=str(error)) from error


@router.get("/me", response_model=UserResponse)
async def read_current_user(
    firebase_user: dict[str, Any] = Depends(get_current_firebase_user),
) -> UserResponse:
    """Read the current authenticated user's profile."""
    user = await user_service.get_user_by_firebase_uid(firebase_user["uid"])

    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User profile not found. Call /users/sync first.",
        )

    return user


@router.get("/{user_id}", response_model=UserResponse)
async def read_user(user_id: str) -> UserResponse:
    """Read one public user profile by MongoDB ID."""
    try:
        user = await user_service.get_user(user_id)
    except ValueError as error:
        raise HTTPException(status_code=400, detail=str(error)) from error

    if not user:
        raise HTTPException(status_code=404, detail="User not found.")

    return user


@router.patch("/me", response_model=UserResponse)
async def update_current_user(
    updates: UserUpdate,
    firebase_user: dict[str, Any] = Depends(get_current_firebase_user),
) -> UserResponse:
    """Update the current authenticated user's profile."""
    current_user = await user_service.get_user_by_firebase_uid(
        firebase_user["uid"]
    )

    if not current_user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User profile not found.",
        )

    try:
        updated = await user_service.update_user(current_user.id, updates)
    except ValueError as error:
        raise HTTPException(status_code=400, detail=str(error)) from error

    if not updated:
        raise HTTPException(status_code=404, detail="User not found.")

    return updated


@router.delete("/me", status_code=status.HTTP_204_NO_CONTENT)
async def delete_current_user(
    firebase_user: dict[str, Any] = Depends(get_current_firebase_user),
) -> None:
    """Delete the current authenticated user's local profile."""
    current_user = await user_service.get_user_by_firebase_uid(
        firebase_user["uid"]
    )

    if not current_user:
        return

    await user_service.delete_user(current_user.id)
