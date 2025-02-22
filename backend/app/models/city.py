from sqlalchemy import Column, String, Integer, Float
from .base import TimeStampedBase

class City(TimeStampedBase):
    __tablename__ = "cities"
    
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    country = Column(String, nullable=False)
    latitude = Column(Float, nullable=False)
    longitude = Column(Float, nullable=False)
    population = Column(Integer, nullable=True)
    metro_area = Column(String, nullable=True)
    alternative_names = Column(String, nullable=True)  # Comma-separated list 