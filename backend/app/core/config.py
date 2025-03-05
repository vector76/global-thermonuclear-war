from pydantic_settings import BaseSettings
from typing import List

class Settings(BaseSettings):
    API_V1_STR: str = "/api/v1"
    PROJECT_NAME: str = "Global Thermonuclear War"
    PORT: int = 5200
    DATABASE_URL: str = "sqlite+aiosqlite:///./app.db"
    DEBUG: bool = False  # Default to False for production
    
    # OAuth settings
    GOOGLE_CLIENT_ID: str
    GOOGLE_CLIENT_SECRET: str
    JWT_SECRET: str
    REDIRECT_URI: str = "http://localhost:5200/api/v1/auth/google/callback"
    
    # CORS settings
    CORS_ORIGINS: List[str] = ["http://localhost:3000", "http://localhost:5173"]
    BASE_URL: str = "http://localhost:5200"  # Used for constructing redirect URIs

    class Config:
        case_sensitive = True
        env_file = ".env"

settings = Settings()
