from datetime import datetime, timedelta, UTC
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import select, func
from app.core.database import get_db
from app.models.missile import MissileCreate, MissileResponse, Missile
from app.models.config import Configuration
from app.crud.missile import create_missile
from app.api.deps import CurrentUserAnyAuth
from app.core.trajectory import calculate_launch_point
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
) -> Dict[str, Union[bool, str | None, int]]:
    """Check if a missile launch would succeed without actually launching.
    Only checks rate limits (concurrent missiles and daily limits).
    Returns true/false, a reason if false, and number of allowed launches remaining.
    
    This endpoint accepts both API key and session authentication."""
    
    try:
        # Get limits from config
        max_concurrent = await Configuration.get_int(db, "max_concurrent_missiles_per_user")
        max_per_day = await Configuration.get_int(db, "max_missiles_per_user_per_day")
        
        # Check concurrent missiles limit
        active_count = await Missile.count_active_for_user(db, current_user.id)
        concurrent_remaining = max_concurrent - active_count

        # Check daily limit
        today_start = datetime.now(UTC).replace(hour=0, minute=0, second=0, microsecond=0)
        daily_count = await db.execute(
            select(func.count()).select_from(Missile).where(
                Missile.user_id == current_user.id,
                Missile.launch_time >= today_start
            )
        )
        daily_remaining = max_per_day - daily_count.scalar_one()

        # Calculate number allowed (minimum of remaining daily and concurrent limits)
        num_allowed = max(0, min(concurrent_remaining, daily_remaining))

        if concurrent_remaining <= 0:
            return {
                "can_launch": False,
                "reason": f"Maximum {max_concurrent} active missiles allowed per user. "
                         f"Currently have {active_count} in flight.",
                "num_allowed": 0
            }

        if daily_remaining <= 0:
            return {
                "can_launch": False,
                "reason": f"Maximum {max_per_day} missiles allowed per day",
                "num_allowed": 0
            }

        # All checks passed
        return {
            "can_launch": True,
            "reason": None,
            "num_allowed": num_allowed
        }
    except Exception as e:
        return {
            "can_launch": False,
            "reason": f"Internal error: {str(e)}",
            "num_allowed": 0
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

    # Calculate launch point and impact time
    launch_time = datetime.now(UTC)
    launch_result = calculate_launch_point(target_latitude, target_longitude, launch_time)

    missile = MissileCreate(
        user_id=current_user.id,
        launch_latitude=launch_result["launch_latitude"],
        launch_longitude=launch_result["launch_longitude"],
        target_latitude=target_latitude,
        target_longitude=target_longitude,
        target_string=f"{target_latitude},{target_longitude}",
        launch_time=launch_time,
        impact_time=launch_result["impact_time"]
    )

    print("Creating missile:", missile)
    result = await create_missile(db, missile)
    print("Missile created:", result)
    return result 