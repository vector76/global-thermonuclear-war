from typing import Annotated, Optional
from fastapi import Depends, HTTPException, Security, Cookie
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.core.database import get_db
from app.core.auth import decode_access_token
from app.models.user import User
from app.models.session import Session
from app.crud import api_key as api_key_crud
from datetime import datetime, UTC

security = HTTPBearer(auto_error=False)

async def get_current_user(
    session: str | None = Cookie(None),
    db: AsyncSession = Depends(get_db)
) -> User | None:
    """Get the current user from session cookie."""
    if not session:
        return None
    
    try:
        # Decode JWT token
        payload = decode_access_token(session)
        user_id = int(payload["sub"])
        
        # Get user from database
        stmt = select(User).where(User.id == user_id)
        result = await db.execute(stmt)
        user = result.scalar_one_or_none()
        
        if not user:
            return None
            
        return user
    except:
        return None

async def get_user_from_api_key(
    auth: HTTPAuthorizationCredentials | None = Security(security),
    db: AsyncSession = Depends(get_db)
) -> User | None:
    """Validate API key and return associated user."""
    if not auth:
        return None
        
    # Get API key from database
    db_key = await api_key_crud.get_api_key_by_key(db, auth.credentials)
    if not db_key or db_key.is_revoked:
        return None
        
    # Update last_used_at
    await api_key_crud.update_last_used(db, db_key)
    
    # Return the associated user
    return await db.get(User, db_key.user_id)

async def get_current_user_any_auth(
    session_user: User | None = Depends(get_current_user),
    api_key_user: User | None = Depends(get_user_from_api_key),
    db: AsyncSession = Depends(get_db)
) -> User:
    """Allow either session or API key authentication."""
    user = session_user or api_key_user
    if not user:
        raise HTTPException(
            status_code=401,
            detail="Not authenticated. Provide either session cookie or API key."
        )
    return user

# For session-only endpoints
async def get_current_user_session_only(
    user: User | None = Depends(get_current_user),
) -> User:
    """Only allow session-based authentication."""
    if not user:
        raise HTTPException(
            status_code=401,
            detail="Not authenticated. Session cookie required."
        )
    return user

# Type alias for dependency injection
CurrentUser = Annotated[User, Depends(get_current_user_session_only)]
CurrentUserAnyAuth = Annotated[User, Depends(get_current_user_any_auth)] 