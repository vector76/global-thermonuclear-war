from fastapi import APIRouter
from app.api.internal import missiles, api_keys, config

router = APIRouter()

# No /api/internal prefix needed since we mount the entire app at that path
router.include_router(missiles.router, prefix="/missiles", tags=["internal-missiles"])
router.include_router(api_keys.router, prefix="/api-keys", tags=["internal-api-keys"])
router.include_router(config.router, prefix="/config", tags=["internal-config"]) 