from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.models.api_key import ApiKey
from app.schemas.api_key import ApiKeyCreate, ApiKeyResponse
from datetime import datetime, UTC
import secrets

async def create_api_key(db: AsyncSession, api_key: ApiKeyCreate, user_id: int) -> ApiKeyResponse:
    # Generate a random API key
    key = secrets.token_urlsafe(32)
    db_api_key = ApiKey(
        key=key,
        name=api_key.name,
        user_id=user_id
    )
    db.add(db_api_key)
    await db.commit()
    await db.refresh(db_api_key)
    return ApiKeyResponse.model_validate(db_api_key)

async def get_user_api_keys(db: AsyncSession, user_id: int) -> list[ApiKeyResponse]:
    result = await db.execute(
        select(ApiKey).where(ApiKey.user_id == user_id)
    )
    db_keys = result.scalars().all()
    
    # Convert to response models
    return [ApiKeyResponse.model_validate(db_key) for db_key in db_keys]

async def delete_api_key(db: AsyncSession, api_key_id: int) -> bool:
    """Delete an API key by ID."""
    result = await db.execute(
        select(ApiKey).where(ApiKey.id == api_key_id)
    )
    api_key = result.scalar_one_or_none()
    if api_key:
        await db.delete(api_key)
        await db.commit()
        return True
    return False

async def get_api_key_by_key(db: AsyncSession, key: str) -> ApiKey | None:
    result = await db.execute(
        select(ApiKey).where(ApiKey.key == key)
    )
    return result.scalar_one_or_none()

async def update_last_used(db: AsyncSession, api_key: ApiKey) -> None:
    """Update the last_used_at timestamp of an API key."""
    api_key.last_used_at = datetime.now(UTC)
    await db.commit() 