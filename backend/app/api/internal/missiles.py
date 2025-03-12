from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import select
from app.core.database import get_db
from app.models.missile import MissileResponse, Missile
from typing import List
from datetime import datetime, timedelta, UTC

router = APIRouter()

@router.get("", response_model=List[MissileResponse])
async def get_missiles(
    db: Session = Depends(get_db)
):
    """Get all missiles (no authentication required)"""
    # Calculate the cutoff time (120 hours before now)
    cutoff_time = datetime.now(UTC) - timedelta(hours=120)
    
    # Get missiles that haven't reached the cutoff time yet
    result = await db.execute(
        select(Missile).where(
            Missile.impact_time > cutoff_time
        )
    )
    missiles = result.scalars().all()
    return missiles 