from pydantic_settings import BaseSettings

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

    class Config:
        case_sensitive = True
        env_file = ".env"

settings = Settings()
