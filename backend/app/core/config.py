from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    API_V1_STR: str = "/api/v1"
    PROJECT_NAME: str = "My FastAPI App"
    PORT: int = 5200
    
    # OAuth settings
    GOOGLE_CLIENT_ID: str
    GOOGLE_CLIENT_SECRET: str
    JWT_SECRET: str

    class Config:
        case_sensitive = True
        env_file = ".env"

settings = Settings()
