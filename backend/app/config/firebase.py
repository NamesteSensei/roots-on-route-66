"""Firebase Admin SDK configuration.

This module initializes Firebase Admin once and exposes a helper for
verifying Firebase ID tokens sent from the frontend.
"""

import json
import os
from functools import lru_cache
from typing import Any

import firebase_admin
from firebase_admin import auth, credentials


@lru_cache
def initialize_firebase_app() -> firebase_admin.App:
    """Initialize and return the Firebase Admin app.

    The service account JSON is read from FIREBASE_SERVICE_ACCOUNT_JSON.
    In local development, this can come from a .env file.
    In Cloud Run, this should come from an environment variable or Secret
    Manager.

    Returns:
        The initialized Firebase Admin app.

    Raises:
        RuntimeError: If Firebase service account config is missing.
    """
    existing_apps = firebase_admin._apps  # pylint: disable=protected-access

    if existing_apps:
        return firebase_admin.get_app()

    service_account_json = os.getenv("FIREBASE_SERVICE_ACCOUNT_JSON")

    if not service_account_json:
        raise RuntimeError("FIREBASE_SERVICE_ACCOUNT_JSON is not configured.")

    service_account_info = json.loads(service_account_json)
    credential = credentials.Certificate(service_account_info)

    return firebase_admin.initialize_app(credential)


def verify_firebase_token(id_token: str) -> dict[str, Any]:
    """Verify a Firebase ID token.

    Args:
        id_token: Firebase ID token from the frontend.

    Returns:
        Decoded Firebase token claims.

    Raises:
        ValueError: If token verification fails.
    """
    initialize_firebase_app()

    try:
        return auth.verify_id_token(id_token)
    except Exception as error:
        raise ValueError("Invalid Firebase ID token.") from error
