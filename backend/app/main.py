"""Main FastAPI application for Roots on Route 66."""

import os

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.config.mongodb import create_indexes
from app.routes import plants, users

APP_NAME = "Roots on Route 66 API"
APP_VERSION = "0.2.0"


def get_allowed_origins() -> list[str]:
    """Return allowed frontend origins for CORS."""
    origins = os.getenv("ALLOWED_ORIGINS", "")

    if not origins:
        return ["http://localhost:5500", "http://127.0.0.1:5500"]

    return [origin.strip() for origin in origins.split(",") if origin.strip()]


app = FastAPI(
    title=APP_NAME,
    version=APP_VERSION,
    description="Production-ready API foundation for plant tracking.",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=get_allowed_origins(),
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(users.router)
app.include_router(plants.router)


@app.on_event("startup")
async def startup_event() -> None:
    """Create database indexes when the API starts."""
    await create_indexes()


@app.get("/")
async def read_root() -> dict[str, str]:
    """Return a basic API welcome message."""
    return {"message": "Roots on Route 66 API is running."}


@app.get("/health")
async def health_check() -> dict[str, str]:
    """Return service health status for deployment checks."""
    return {"status": "healthy", "service": APP_NAME}
