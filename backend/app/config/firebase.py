"""Firebase Admin SDK configuration for Roots on Route 66."""
import json
import os
from typing import Any

import firebase_admin
from firebase_admin import auth, credentials

def initialize_firebase_app() -> firebase_admin.App:
    """
    Initialize and return the Firebase Admin app.

    Uses environment variable FIREBASE_SERVICE_ACCOUNT_JSON to
    read credentials as a JSON string. Raises if missing or invalid.
    """
    if firebase_admin._apps:  # pylint: disable=protected-access
        return firebase_admin.get_app()

    service_account_json = os.getenv("FIREBASE_SERVICE_ACCOUNT_JSON")
    if not service_account_json:
        raise RuntimeError("FIREBASE_SERVICE_ACCOUNT_JSON is not configured.")

    try:
        service_account_info = json.loads(service_account_json)
    except json.JSONDecodeError as error:
        raise RuntimeError("FIREBASE_SERVICE_ACCOUNT_JSON is invalid JSON.") from error

    credential = credentials.Certificate(service_account_info)
    return firebase_admin.initialize_app(credential)

def verify_firebase_token(id_token: str) -> dict[str, Any]:
    """
    Verify a Firebase ID token and return decoded token claims.

    Raises ValueError if verification fails.
    """
    initialize_firebase_app()
    try:
        return auth.verify_id_token(id_token)
    except Exception as error:  # broad except is fine here; underlying library raises multiple types
        raise ValueError("Invalid Firebase ID token.") from error
