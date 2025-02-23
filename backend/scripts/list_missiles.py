import asyncio
import sys
from datetime import datetime, UTC
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
sys.path.append(".")  # Allow importing from parent directory

from app.core.database import engine, Base
from app.models.missile import Missile

async def list_missiles(db: AsyncSession):
    """Display all missiles in the database"""
    result = await db.execute(select(Missile))
    missiles = result.scalars().all()
    
    now = datetime.now(UTC)
    print(f"\nCurrent time (UTC): {now.strftime('%Y-%m-%d %H:%M:%S')}")
    
    if not missiles:
        print("\nNo missiles in database.")
        return
        
    print("\nMissiles in database:")
    print("-" * 120)  # Widened for new column
    print(f"{'ID':4} {'User':4} {'Launch (UTC)':20} {'Impact (UTC)':20} "
          f"{'Launch From':30} {'Target':30} {'Status':8}")
    print("-" * 120)
    
    for missile in missiles:
        launch_pos = f"{missile.launch_latitude:.2f}, {missile.launch_longitude:.2f}"
        target = f"{missile.target_latitude:.2f}, {missile.target_longitude:.2f}"
        impact_time = missile.impact_time if missile.impact_time.tzinfo else missile.impact_time.replace(tzinfo=UTC)
        status = "ACTIVE" if impact_time > now else "IMPACT"
        
        print(f"{missile.id:4} {missile.user_id:4} "
              f"{missile.launch_time.strftime('%Y-%m-%d %H:%M:%S'):20} "
              f"{missile.impact_time.strftime('%Y-%m-%d %H:%M:%S'):20} "
              f"{launch_pos:30} {target:30} {status:8}")
    print("-" * 120 + "\n")

async def main():
    async with engine.begin() as conn:
        async with AsyncSession(engine) as db:
            await list_missiles(db)

if __name__ == "__main__":
    asyncio.run(main()) 