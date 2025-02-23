from .auth import router
from fastapi import APIRouter
from .missiles import router as missiles_router

__all__ = ["router"]

router = APIRouter()
router.include_router(missiles_router, prefix="/missiles", tags=["missiles"]) 