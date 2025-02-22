from sqlalchemy import Column, String, Integer, Boolean
from .base import TimeStampedBase

class User(TimeStampedBase):
    __tablename__ = "users"
    
    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True, nullable=False)
    oauth_provider = Column(String, nullable=False)  # "google" or "github"
    oauth_id = Column(String, nullable=False)
    is_admin = Column(Boolean, default=False)
    daily_launch_limit = Column(Integer, default=10)
    concurrent_missile_limit = Column(Integer, default=3) 