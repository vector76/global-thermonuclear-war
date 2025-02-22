from sqlalchemy import Column, String, Integer
from .base import TimeStampedBase

class Configuration(TimeStampedBase):
    __tablename__ = "configurations"
    
    id = Column(Integer, primary_key=True, index=True)
    key = Column(String, unique=True, index=True, nullable=False)
    value = Column(String, nullable=False) 