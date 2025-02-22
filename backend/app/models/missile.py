from sqlalchemy import Column, String, Integer, Float, ForeignKey, DateTime
from .base import TimeStampedBase

class Missile(TimeStampedBase):
    __tablename__ = "missiles"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    
    # Launch details
    launch_latitude = Column(Float, nullable=False)
    launch_longitude = Column(Float, nullable=False)
    launch_time = Column(DateTime, nullable=False)
    
    # Target details
    target_string = Column(String, nullable=False)  # Original input
    target_latitude = Column(Float, nullable=False)
    target_longitude = Column(Float, nullable=False)
    impact_time = Column(DateTime, nullable=False) 