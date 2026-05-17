"""Authentication dependencies for protected API routes."""
from typing import Any

from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer

from app.config.firebase import verify_firebase_token

bearer_scheme = HTTPBearer(auto_error=False)

async def get_current_firebase_user(
    credentials: HTTPAuthorizationCredentials | None = Depends(bearer_scheme),
) -> dict[str, Any]:
    """
    Return the current Firebase user from a Bearer token.

    Raises HTTP 401 if the token is missing, scheme is wrong, or verification fails.
    """
    if credentials is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Missing authorization token.",
        )

    if credentials.scheme.lower() != "bearer":
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid authorization scheme.",
        )

    try:
        return verify_firebase_token(credentials.credentials)
    except ValueError as error:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired Firebase token.",
        ) from error

async def get_current_firebase_uid(
    current_user: dict[str, Any] = Depends(get_current_firebase_user),
) -> str:
    """
    Return the Firebase UID for the authenticated user.

    Raises HTTP 401 if UID is missing from token.
    """
    firebase_uid = current_user.get("uid")
    if not firebase_uid:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Firebase UID missing from token.",
        )
    return firebase_uid
