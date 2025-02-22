from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession
from sqlalchemy.orm import declarative_base
from sqlalchemy.orm import sessionmaker
from .config import settings

# Create async engine
engine = create_async_engine(
    "sqlite+aiosqlite:///./app.db",
    echo=True,  # Set to False in production
)

# Create async session factory
AsyncSessionmaker = sessionmaker(
    engine,
    class_=AsyncSession,
    expire_on_commit=False,
)

# Create declarative base for models
Base = declarative_base()

# Dependency to get DB session
async def get_db():
    async with AsyncSessionmaker() as session:
        try:
            yield session
            await session.commit()
        except Exception:
            await session.rollback()
            raise 