from sqlalchemy import Column, Integer, DateTime
from datetime import datetime, UTC
from app.core.database import Base

class TimeStampedBase(Base):
    """Abstract base class with timestamp columns"""
    __abstract__ = True
    
    created_at = Column(DateTime, default=lambda: datetime.now(UTC), nullable=False)
    updated_at = Column(DateTime, default=lambda: datetime.now(UTC), onupdate=lambda: datetime.now(UTC), nullable=False) 