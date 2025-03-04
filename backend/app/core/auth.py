from datetime import datetime, timedelta, UTC
import jwt
from requests_oauthlib import OAuth2Session
from app.core.config import settings
from fastapi import HTTPException

def get_google_oauth_client():
    oauth = OAuth2Session(
        settings.GOOGLE_CLIENT_ID,
        scope=[
            "openid",
            "https://www.googleapis.com/auth/userinfo.email",
            "https://www.googleapis.com/auth/userinfo.profile",
        ],
        redirect_uri=settings.REDIRECT_URI
    )
    return oauth

def create_access_token(user_id: int) -> str:
    expire = datetime.now(UTC) + timedelta(hours=1)
    return jwt.encode(
        {
            "sub": str(user_id),
            "exp": expire
        },
        settings.JWT_SECRET,
        algorithm="HS256"
    )

def decode_access_token(token: str) -> dict:
    try:
        payload = jwt.decode(
            token,
            settings.JWT_SECRET,
            algorithms=["HS256"]
        )
        return payload
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Token expired")
    except jwt.JWTError:
        raise HTTPException(status_code=401, detail="Invalid token") 