from sqlalchemy import Column, String, Integer, Float, ForeignKey, DateTime, select, func
from .base import TimeStampedBase
from datetime import datetime, UTC
from pydantic import BaseModel, Field
from typing import Optional

class MissileBase(BaseModel):
    launch_latitude: float = Field(..., ge=-90, le=90)
    launch_longitude: float = Field(..., ge=-180, le=180)
    target_latitude: float = Field(..., ge=-90, le=90)
    target_longitude: float = Field(..., ge=-180, le=180)
    target_string: str

class MissileCreate(MissileBase):
    user_id: int
    launch_time: datetime
    impact_time: datetime

class Missile(MissileBase):
    id: int
    user_id: int
    launch_time: datetime
    impact_time: datetime
    created_at: datetime

    @property
    def is_active(self) -> bool:
        return self.impact_time > datetime.utcnow()

    class Config:
        from_attributes = True

class CityBase(BaseModel):
    name: str
    country: str
    latitude: float = Field(..., ge=-90, le=90)
    longitude: float = Field(..., ge=-180, le=180)
    population: Optional[int] = None

class City(CityBase):
    id: int
    created_at: datetime

    class Config:
        from_attributes = True

class Missile(TimeStampedBase):
    __tablename__ = "missiles"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    
    # Launch details
    launch_latitude = Column(Float, nullable=False)
    launch_longitude = Column(Float, nullable=False)
    launch_time = Column(DateTime(timezone=True), nullable=False)
    
    # Target details
    target_string = Column(String, nullable=False)  # Original input
    target_latitude = Column(Float, nullable=False)
    target_longitude = Column(Float, nullable=False)
    impact_time = Column(DateTime(timezone=True), nullable=False)

    @classmethod
    async def count_active_for_user(cls, db, user_id: int) -> int:
        """Count missiles in flight for a given user"""
        result = await db.execute(
            select(func.count()).select_from(cls).where(
                cls.user_id == user_id,
                cls.impact_time > datetime.now(UTC)
            )
        )
        return result.scalar_one() 