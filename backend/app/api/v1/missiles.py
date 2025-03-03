from datetime import datetime, timedelta, UTC
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import select, func
from app.core.database import get_db
from app.models.missile import MissileCreate, MissileResponse, Missile
from app.models.config import Configuration
from app.crud.missile import create_missile
from app.api.deps import CurrentUserAnyAuth
import random
from typing import Dict, Union

router = APIRouter()

def random_coordinate():
    return {
        'latitude': random.uniform(-90, 90),
        'longitude': random.uniform(-180, 180)
    }

@router.get("/can-launch")
async def can_launch(
    current_user: CurrentUserAnyAuth,
    db: Session = Depends(get_db)
) -> Dict[str, Union[bool, str | None]]:
    """Check if a missile launch would succeed without actually launching.
    Only checks rate limits (concurrent missiles and daily limits).
    Returns true/false and a reason if false.
    
    This endpoint accepts both API key and session authentication."""
    
    try:
        # Get limits from config
        max_concurrent = await Configuration.get_int(db, "max_concurrent_missiles_per_user")
        max_per_day = await Configuration.get_int(db, "max_missiles_per_user_per_day")
        
        # Check concurrent missiles limit
        active_count = await Missile.count_active_for_user(db, current_user.id)
        if active_count >= max_concurrent:
            return {
                "can_launch": False,
                "reason": f"Maximum {max_concurrent} active missiles allowed per user. "
                         f"Currently have {active_count} in flight."
            }

        # Check daily limit
        today_start = datetime.now(UTC).replace(hour=0, minute=0, second=0, microsecond=0)
        daily_count = await db.execute(
            select(func.count()).select_from(Missile).where(
                Missile.user_id == current_user.id,
                Missile.launch_time >= today_start
            )
        )
        if daily_count.scalar_one() >= max_per_day:
            return {
                "can_launch": False,
                "reason": f"Maximum {max_per_day} missiles allowed per day"
            }

        # All checks passed
        return {
            "can_launch": True,
            "reason": None
        }
    except Exception as e:
        return {
            "can_launch": False,
            "reason": f"Internal error: {str(e)}"
        }

@router.post("/launch", response_model=MissileResponse)
async def launch_missile(
    target_latitude: float,
    target_longitude: float,
    current_user: CurrentUserAnyAuth,
    db: Session = Depends(get_db)
):
    """Launch a missile at specified coordinates.
    Accepts both API key and session authentication."""
    
    # Get limits from config
    max_concurrent = await Configuration.get_int(db, "max_concurrent_missiles_per_user")
    max_per_day = await Configuration.get_int(db, "max_missiles_per_user_per_day")
    
    # Check concurrent missiles limit
    active_count = await Missile.count_active_for_user(db, current_user.id)
    if active_count >= max_concurrent:
        raise HTTPException(
            status_code=429,
            detail=f"Maximum {max_concurrent} active missiles allowed per user. "
                  f"Currently have {active_count} in flight."
        )

    # Check daily limit
    today_start = datetime.now(UTC).replace(hour=0, minute=0, second=0, microsecond=0)
    daily_count = await db.execute(
        select(func.count()).select_from(Missile).where(
            Missile.user_id == current_user.id,
            Missile.launch_time >= today_start
        )
    )
    if daily_count.scalar_one() >= max_per_day:
        raise HTTPException(
            status_code=429,
            detail=f"Maximum {max_per_day} missiles allowed per day"
        )

    print(f"Launch request received: lat={target_latitude}, lon={target_longitude}")
    if not (-90 <= target_latitude <= 90) or not (-180 <= target_longitude <= 180):
        raise HTTPException(status_code=400, detail="Invalid coordinates")

    launch_pos = random_coordinate()
    launch_time = datetime.now(UTC)
    impact_time = launch_time + timedelta(minutes=15)

    missile = MissileCreate(
        user_id=current_user.id,
        launch_latitude=launch_pos['latitude'],
        launch_longitude=launch_pos['longitude'],
        target_latitude=target_latitude,
        target_longitude=target_longitude,
        target_string=f"{target_latitude},{target_longitude}",
        launch_time=launch_time,
        impact_time=impact_time
    )

    print("Creating missile:", missile)
    result = await create_missile(db, missile)
    print("Missile created:", result)
    return result 