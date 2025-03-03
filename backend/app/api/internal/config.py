from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.core.database import get_db
from app.models import Configuration
from app.api.deps import CurrentUser

router = APIRouter()

@router.get("/{key}")
async def get_config(
    key: str,
    current_user: CurrentUser,
    db: AsyncSession = Depends(get_db)
):
    """Get configuration value (session auth only)"""
    query = select(Configuration).where(Configuration.key == key)
    result = await db.execute(query)
    config = result.scalar_one_or_none()
    if config:
        return {"key": config.key, "value": config.value}
    return {"error": "Configuration not found"}

@router.post("")
async def set_config(
    key: str,
    value: str,
    current_user: CurrentUser,
    db: AsyncSession = Depends(get_db)
):
    """Set configuration value (session auth only)"""
    config = Configuration(key=key, value=value)
    db.add(config)
    await db.commit()
    return {"key": key, "value": value} 