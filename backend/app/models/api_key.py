from sqlalchemy import Column, Integer, String, DateTime, Boolean, ForeignKey, select
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
from app.core.database import Base
from datetime import datetime, UTC

class ApiKey(Base):
    __tablename__ = "api_keys"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    key = Column(String, unique=True, index=True, nullable=False)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(UTC))
    last_used_at = Column(DateTime(timezone=True), nullable=True)
    is_revoked = Column(Boolean, default=False)

    user = relationship("User", back_populates="api_keys")

    @classmethod
    async def get(cls, db, api_key_id: int):
        """Get an API key by ID."""
        result = await db.execute(select(cls).where(cls.id == api_key_id))
        return result.scalar_one_or_none() 