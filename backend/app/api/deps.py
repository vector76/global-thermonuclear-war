from fastapi import Depends, HTTPException, Cookie
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.core.database import get_db
from app.core.auth import decode_access_token
from app.models.user import User

async def get_current_user(
    session: str = Cookie(None),
    db: AsyncSession = Depends(get_db)
):
    """Get current user from session cookie"""
    if not session:
        raise HTTPException(status_code=401, detail="Not authenticated")
    
    try:
        payload = decode_access_token(session)
        user_id = int(payload["sub"])
        
        # Get user from database
        stmt = select(User).where(User.id == user_id)
        result = await db.execute(stmt)
        user = result.scalar_one_or_none()
        
        if not user:
            raise HTTPException(status_code=401, detail="User not found")
            
        return user
    except Exception as e:
        raise HTTPException(status_code=401, detail="Invalid session") 