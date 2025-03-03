from sqlalchemy import Column, String, Integer, Boolean, select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import relationship
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

    # Relationships
    api_keys = relationship("ApiKey", back_populates="user", cascade="all, delete-orphan")

    @classmethod
    async def get_by_oauth(
        cls,
        db: AsyncSession,
        oauth_provider: str,
        oauth_id: str,
        email: str
    ) -> "User":
        """Get or create user by OAuth credentials"""
        stmt = select(cls).where(
            (cls.oauth_provider == oauth_provider) & 
            (cls.oauth_id == oauth_id)
        )
        result = await db.execute(stmt)
        user = result.scalar_one_or_none()
        
        if not user:
            user = cls(
                email=email,
                oauth_provider=oauth_provider,
                oauth_id=oauth_id
            )
            db.add(user)
            await db.commit()
            await db.refresh(user)
        
        return user 