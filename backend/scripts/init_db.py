import asyncio
import os
from pathlib import Path

# Add the parent directory to the Python path
import sys
sys.path.append(str(Path(__file__).parent.parent))

from app.core.database import engine
from app.models import Base
from app.models.config import Configuration
from sqlalchemy.ext.asyncio import AsyncSession

async def init_db():
    """Initialize database tables and default configuration"""
    # Drop all tables first
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.drop_all)
        print("Dropped all existing tables")
        
        # Create all tables
        await conn.run_sync(Base.metadata.create_all)
        print("Created all tables")

    # Initialize configuration with defaults
    async with AsyncSession(engine) as db:
        for key, value in Configuration.DEFAULTS.items():
            # Check if config exists
            result = await db.execute(
                f"SELECT value FROM configuration WHERE key = '{key}'"
            )
            if not result.scalar_one_or_none():
                # Create new config entry
                config = Configuration(key=key, value=value)
                db.add(config)
        
        await db.commit()
        print("Default configuration initialized")

if __name__ == "__main__":
    asyncio.run(init_db()) 