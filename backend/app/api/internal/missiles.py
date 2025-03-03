from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import select
from app.core.database import get_db
from app.models.missile import MissileResponse, Missile
from typing import List

router = APIRouter()

@router.get("", response_model=List[MissileResponse])
async def get_missiles(
    db: Session = Depends(get_db)
):
    """Get all missiles (no authentication required)"""
    result = await db.execute(select(Missile))
    missiles = result.scalars().all()
    return missiles 