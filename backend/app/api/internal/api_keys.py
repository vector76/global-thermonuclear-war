from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.models.api_key import ApiKey
from app.schemas.api_key import ApiKeyCreate, ApiKeyResponse
from app.crud.api_key import create_api_key, get_user_api_keys, delete_api_key
from app.api.deps import CurrentUser
from typing import List

router = APIRouter()

@router.post("", response_model=ApiKeyResponse)
async def create_key(
    key_create: ApiKeyCreate,
    current_user: CurrentUser,
    db: Session = Depends(get_db)
):
    """Create a new API key (session auth only)"""
    return await create_api_key(db, key_create, current_user.id)

@router.get("", response_model=List[ApiKeyResponse])
async def get_keys(
    current_user: CurrentUser,
    db: Session = Depends(get_db)
):
    """Get all API keys for the current user (session auth only)"""
    return await get_user_api_keys(db, current_user.id)

@router.delete("/{key_id}")
async def delete_key(
    key_id: int,
    current_user: CurrentUser,
    db: Session = Depends(get_db)
):
    """Delete an API key (session auth only)"""
    key = await ApiKey.get(db, key_id)
    if not key or key.user_id != current_user.id:
        raise HTTPException(status_code=404, detail="API key not found")
    await delete_api_key(db, key_id)
    return {"message": "API key deleted"} 