from sqlalchemy import Column, String, Integer, ForeignKey, DateTime, Boolean
from .base import TimeStampedBase

class APIKey(TimeStampedBase):
    __tablename__ = "api_keys"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    key_id = Column(String, unique=True, index=True, nullable=False)
    key_hash = Column(String, nullable=False)
    description = Column(String, nullable=True)
    expires_at = Column(DateTime, nullable=True)
    is_revoked = Column(Boolean, default=False)
    last_used_at = Column(DateTime, nullable=True) 