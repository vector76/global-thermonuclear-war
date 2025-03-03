from .base_class import Base
from .session import SessionLocal, engine

# Import all models here
from app.models.user import User
from app.models.api_key import ApiKey
from app.models.config import Configuration

# Create all tables
Base.metadata.create_all(bind=engine) 