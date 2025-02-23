from sqlalchemy import Column, String, Integer, select
from .base import TimeStampedBase

class Configuration(TimeStampedBase):
    __tablename__ = "configuration"
    
    key = Column(String, primary_key=True)
    value = Column(String, nullable=False)

    # Default values
    DEFAULTS = {
        "max_concurrent_missiles_per_user": "2",
        "max_missiles_per_user_per_day": "10",
        "max_total_concurrent_missiles": "1000",
        "impact_display_hours": "24",
        "cleanup_days": "30"
    }

    @classmethod
    async def get_int(cls, db, key: str) -> int:
        """Get config value as integer, using default if not set"""
        result = await db.execute(
            select(cls).where(cls.key == key)
        )
        config = result.scalar_one_or_none()
        return int(config.value if config else cls.DEFAULTS[key]) 