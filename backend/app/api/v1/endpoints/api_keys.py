from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from app.api import deps
from app.crud import api_key as api_key_crud
from app.schemas.api_key import ApiKey, ApiKeyCreate, ApiKeyResponse, ApiKeyPublicResponse
from app.models.user import User
from typing import List

router = APIRouter()

@router.post("/", response_model=ApiKeyResponse)
async def create_api_key(
    api_key: ApiKeyCreate,
    current_user: deps.CurrentUser,
    db: AsyncSession = Depends(deps.get_db)
):
    """Create a new API key for the current user.
    Returns the full key only once at creation time."""
    return await api_key_crud.create_api_key(db=db, api_key=api_key, user_id=current_user.id)

@router.get("/", response_model=List[ApiKeyPublicResponse])
async def list_api_keys(
    current_user: deps.CurrentUser,
    db: AsyncSession = Depends(deps.get_db)
):
    """List all API keys for the current user.
    Only returns truncated keys for security."""
    api_keys = await api_key_crud.get_user_api_keys(db=db, user_id=current_user.id)
    return [ApiKeyPublicResponse.from_api_key(key) for key in api_keys]

@router.post("/{api_key_id}/revoke")
async def revoke_api_key(
    api_key_id: int,
    current_user: deps.CurrentUser,
    db: AsyncSession = Depends(deps.get_db)
):
    """Revoke an API key."""
    success = await api_key_crud.revoke_api_key(db=db, api_key_id=api_key_id, user_id=current_user.id)
    if not success:
        raise HTTPException(status_code=404, detail="API key not found")
    return {"message": "API key revoked successfully"} 