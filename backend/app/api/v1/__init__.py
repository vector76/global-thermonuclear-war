from fastapi import APIRouter
from .missiles import router as missiles_router

router = APIRouter()
router.include_router(missiles_router, prefix="/missiles", tags=["missiles"])

__all__ = ["router"] 