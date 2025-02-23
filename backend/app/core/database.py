from sqlalchemy.ext.asyncio import AsyncSession, create_async_engine
from sqlalchemy.orm import declarative_base
from typing import AsyncGenerator
import os

SQLALCHEMY_DATABASE_URL = "sqlite+aiosqlite:///./test.db"

# Create async engine
async_engine = create_async_engine(
    SQLALCHEMY_DATABASE_URL,
    connect_args={"check_same_thread": False}  # Needed for SQLite
)

# Create declarative base
Base = declarative_base()

# Session dependency
async def get_db() -> AsyncGenerator[AsyncSession, None]:
    async with AsyncSession(async_engine) as session:
        yield session 