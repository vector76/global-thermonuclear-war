from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
import uvicorn
from app.core import settings
from datetime import datetime
import json
from app.api.v1.missiles import router as missiles_router
from app.api.internal import router as internal_router
from app.api.v1.auth import router as auth_router

# Custom JSON encoder to ensure datetime objects include 'Z' suffix for UTC
class UTCDatetimeEncoder(json.JSONEncoder):
    def default(self, obj):
        if isinstance(obj, datetime):
            # Ensure the datetime has the 'Z' suffix to mark it as UTC
            return obj.isoformat().replace('+00:00', 'Z')
        return super().default(obj)

# Custom response class to use our encoder
class CustomJSONResponse(JSONResponse):
    def render(self, content) -> bytes:
        return json.dumps(
            content,
            ensure_ascii=False,
            allow_nan=False,
            indent=None,
            separators=(",", ":"),
            cls=UTCDatetimeEncoder,
        ).encode("utf-8")

# Create the main FastAPI app with public API documentation
app = FastAPI(
    title="Missile Launch API",
    description="Public API for missile launching and management",
    openapi_url="/api/v1/openapi.json",
    docs_url="/api/v1/docs",
    redoc_url="/api/v1/redoc",
    default_response_class=CustomJSONResponse
)

# Create a sub-application for internal routes with its own OpenAPI schema
internal_app = FastAPI(
    title="Internal API",
    description="Internal endpoints for the web interface",
    openapi_url="/openapi.json",  # Changed to root path since we're mounting at /api/internal
    docs_url="/docs",
    redoc_url="/redoc",
    default_response_class=CustomJSONResponse
)

# Configure CORS
origins = [
    "http://localhost:3000",
    "http://localhost:5173",  # Vite default
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

internal_app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(missiles_router, prefix="/api/v1/missiles")
app.include_router(auth_router, prefix="/api/v1", include_in_schema=False)  # Hide auth endpoints from docs
internal_app.include_router(internal_router)  # No prefix needed since we mount at /api/internal

# Mount the internal app under the main app
app.mount("/api/internal", internal_app)

if __name__ == "__main__":
    uvicorn.run("app.main:app", host="0.0.0.0", port=settings.PORT, reload=True)
