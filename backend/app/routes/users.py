"""API routes for user operations."""

from fastapi import APIRouter, HTTPException, status

from app.schemas.user import (
    PasswordResetComplete,
    PasswordResetRequest,
    UserChangePassword,
    UserCreate,
    UserLogin,
    UserResponse,
    UserUpdate,
)
from app.services import user_service

router = APIRouter(prefix="/users", tags=["users"])


@router.post(
    "/register",
    response_model=UserResponse,
    status_code=status.HTTP_201_CREATED,
)
async def register_user(user: UserCreate) -> UserResponse:
    """Register a new user."""
    try:
        return await user_service.create_user(user)
    except ValueError as error:
        raise HTTPException(status_code=400, detail=str(error)) from error


@router.post("/login", response_model=UserResponse)
async def login_user(credentials: UserLogin) -> UserResponse:
    """Log in an existing user."""
    try:
        return await user_service.authenticate_user(credentials)
    except ValueError as error:
        raise HTTPException(status_code=401, detail=str(error)) from error


@router.get("/{user_id}", response_model=UserResponse)
async def read_user(user_id: str) -> UserResponse:
    """Read one user by ID."""
    try:
        user = await user_service.get_user(user_id)
    except ValueError as error:
        raise HTTPException(status_code=400, detail=str(error)) from error

    if not user:
        raise HTTPException(status_code=404, detail="User not found.")

    return user


@router.patch("/{user_id}", response_model=UserResponse)
async def update_user(user_id: str, updates: UserUpdate) -> UserResponse:
    """Update one user by ID."""
    try:
        user = await user_service.update_user(user_id, updates)
    except ValueError as error:
        raise HTTPException(status_code=400, detail=str(error)) from error

    if not user:
        raise HTTPException(status_code=404, detail="User not found.")

    return user


@router.post(
    "/{user_id}/change-password",
    status_code=status.HTTP_204_NO_CONTENT,
)
async def change_password(
    user_id: str,
    payload: UserChangePassword,
) -> None:
    """Change a user's password."""
    try:
        await user_service.change_password(user_id, payload)
    except ValueError as error:
        raise HTTPException(status_code=400, detail=str(error)) from error


@router.post("/reset-password/request")
async def request_password_reset(
    payload: PasswordResetRequest,
) -> dict[str, str]:
    """Request a password reset token."""
    try:
        token = await user_service.request_password_reset(payload)
    except ValueError as error:
        raise HTTPException(status_code=400, detail=str(error)) from error

    return {"reset_token": token}


@router.post(
    "/reset-password/complete",
    status_code=status.HTTP_204_NO_CONTENT,
)
async def complete_password_reset(payload: PasswordResetComplete) -> None:
    """Complete a password reset."""
    try:
        await user_service.reset_password(payload)
    except ValueError as error:
        raise HTTPException(status_code=400, detail=str(error)) from error


@router.delete("/{user_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_user(user_id: str) -> None:
    """Delete one user by ID."""
    try:
        await user_service.delete_user(user_id)
    except ValueError as error:
        raise HTTPException(status_code=400, detail=str(error)) from error
