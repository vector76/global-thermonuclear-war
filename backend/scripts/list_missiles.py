import asyncio
import sys
from datetime import datetime, UTC, timedelta
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
sys.path.append(".")  # Allow importing from parent directory

from app.core.database import engine, Base
from app.models.missile import Missile

# Configurable impact duration in minutes
IMPACT_DURATION_MINUTES = 60

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
        
        # Ensure times have timezone info
        launch_time = missile.launch_time if missile.launch_time.tzinfo else missile.launch_time.replace(tzinfo=UTC)
        impact_time = missile.impact_time if missile.impact_time.tzinfo else missile.impact_time.replace(tzinfo=UTC)
        
        # Calculate expiration time (impact time + duration)
        expiration_time = impact_time + timedelta(minutes=IMPACT_DURATION_MINUTES)
        
        # Determine missile state based on current time and launch/impact times
        if now < launch_time:
            status = "PENDING"
        elif now < impact_time:
            status = "ACTIVE"
        elif now < expiration_time:
            status = "IMPACT"
        else:
            status = "EXPIRED"
        
        print(f"{missile.id:4} {missile.user_id:4} "
              f"{launch_time.strftime('%Y-%m-%d %H:%M:%S'):20} "
              f"{impact_time.strftime('%Y-%m-%d %H:%M:%S'):20} "
              f"{launch_pos:30} {target:30} {status:8}")
    print("-" * 120 + "\n")

async def main():
    async with engine.begin() as conn:
        async with AsyncSession(engine) as db:
            await list_missiles(db)

if __name__ == "__main__":
    asyncio.run(main()) 