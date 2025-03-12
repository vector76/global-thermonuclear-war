from fastapi import APIRouter, Depends, HTTPException, Cookie
from fastapi.responses import JSONResponse
from fastapi.security import OAuth2AuthorizationCodeBearer
from sqlalchemy.ext.asyncio import AsyncSession
from app.core.database import get_db
from app.core.auth import create_access_token, get_google_oauth_client, decode_access_token
from app.models.user import User
from datetime import datetime, UTC
from app.core.config import settings
from sqlalchemy import select
import jwt

router = APIRouter(prefix="/auth")

GOOGLE_AUTH_URL = "https://accounts.google.com/o/oauth2/v2/auth"
GOOGLE_TOKEN_URL = "https://oauth2.googleapis.com/token"

@router.get("/login/google")
async def google_login():
    """Redirect to Google OAuth login"""
    oauth = get_google_oauth_client()
    authorization_url, state = oauth.authorization_url(
        GOOGLE_AUTH_URL,
        access_type="offline",
        prompt="consent",
    )
    return {"authorization_url": authorization_url}

@router.get("/google/callback")
async def google_callback(
    code: str,
    db: AsyncSession = Depends(get_db)
):
    """Handle Google OAuth callback"""
    oauth = get_google_oauth_client()
    try:
        token = oauth.fetch_token(
            GOOGLE_TOKEN_URL,
            code=code,
            client_secret=settings.GOOGLE_CLIENT_SECRET,
            include_client_id=True
        )
    except Warning:
        # Ignore scope change warnings
        pass
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))
    
    try:
        resp = oauth.get("https://www.googleapis.com/oauth2/v2/userinfo")
        userinfo = resp.json()
    except Exception as e:
        raise HTTPException(status_code=400, detail="Failed to get user info")
    
    # Find or create user
    user = await User.get_by_oauth(
        db,
        oauth_provider="google",
        oauth_id=userinfo["id"],
        email=userinfo["email"]
    )
    
    # Create JWT token
    access_token = create_access_token(user.id)
    
    # Create response with cookie and redirect
    response = JSONResponse({
        "status": "success",
        "redirect_url": f"{settings.BASE_URL}/"
    })
    response.set_cookie(
        key="session",
        value=access_token,
        httponly=True,
        secure=True,  # Set to True in production
        samesite="lax",
        max_age=259200  # Changed from 86400 (24 hours) to 259200 (72 hours)
    )
    response.headers["Location"] = f"{settings.BASE_URL}/"
    response.status_code = 307  # Temporary redirect
    
    return response

@router.post("/logout")
async def logout():
    """Clear session cookie"""
    response = JSONResponse({"status": "success"})
    response.delete_cookie(key="session")
    return response

@router.get("/me")
async def get_current_user(
    session: str = Cookie(None),
    db: AsyncSession = Depends(get_db)
):
    """Get current user info"""
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
            
        return {
            "email": user.email,
            "is_admin": user.is_admin,
            "oauth_provider": user.oauth_provider
        }
    except Exception as e:
        raise HTTPException(status_code=401, detail="Invalid session") 