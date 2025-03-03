from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession
from sqlalchemy.orm import sessionmaker, declarative_base
from app.core.config import settings

# Create declarative base
Base = declarative_base()

# Create async SQLite engine
engine = create_async_engine(
    settings.DATABASE_URL,
    echo=settings.DEBUG,  # Only enable SQL logging in debug mode
)

# Create async session factory
AsyncSessionLocal = sessionmaker(
    engine,
    class_=AsyncSession,
    expire_on_commit=False
)

async def get_db():
    async with AsyncSessionLocal() as session:
        try:
            yield session
        finally:
            await session.close() 