"""Main FastAPI application for Roots on Route 66."""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles

from app.config.mongodb import create_indexes
from app.core.config import settings
from app.routes import media, plants, uploads, users

app = FastAPI(
    title=settings.app_name,
    version=settings.app_version,
    description="Production-ready API foundation for plant tracking.",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.allowed_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(users.router)
app.include_router(plants.router)
app.include_router(media.router)
app.include_router(uploads.router)


@app.on_event("startup")
async def startup_event() -> None:
    """Create database indexes when the API starts."""

    await create_indexes()


@app.get("/health")
async def health_check() -> dict[str, str]:
    """Return service health status for deployment checks."""

    return {"status": "healthy", "service": settings.app_name}


if settings.serve_frontend:
    app.mount(
        "/",
        StaticFiles(directory="../frontend", html=True),
        name="frontend",
    )
