import asyncio
import sys
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
sys.path.append(".")  # Allow importing from parent directory

from app.core.database import async_engine, Base, get_db
from app.models.user import User

async def create_tables():
    """Create database tables if they don't exist"""
    async with async_engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)

async def list_users(db: AsyncSession):
    """Display all users in the database"""
    result = await db.execute(select(User))
    users = result.scalars().all()
    
    print("\nCurrent users:")
    print("-" * 80)
    print(f"{'Email':40} {'OAuth Provider':15} {'Admin':6}")
    print("-" * 80)
    for user in users:
        print(f"{user.email:40} {user.oauth_provider:15} {str(user.is_admin):6}")
    print("-" * 80 + "\n")

async def set_admin_status(email: str, is_admin: bool):
    """Set or clear admin status for a user"""
    async with async_engine.begin() as conn:
        async with AsyncSession(conn) as db:
            # Find user
            result = await db.execute(
                select(User).where(User.email == email)
            )
            user = result.scalar_one_or_none()
            
            if not user:
                print(f"Error: No user found with email {email}")
                return
            
            # Update admin status
            user.is_admin = is_admin
            await db.commit()
            
            action = "set as admin" if is_admin else "removed from admin"
            print(f"\nUser {email} {action}")
            
            # Show all users
            await list_users(db)

def print_usage():
    print("""
Usage: python -m scripts.manage_admin [command] [email]

Commands:
    add     Add admin privileges to user
    remove  Remove admin privileges from user
    list    List all users

Example:
    python -m scripts.manage_admin add user@example.com
    python -m scripts.manage_admin remove user@example.com
    python -m scripts.manage_admin list
    """)

async def main():
    # Create tables first
    await create_tables()
    
    if len(sys.argv) == 1 or sys.argv[1] in ['-h', '--help']:
        print_usage()
        return
        
    command = sys.argv[1].lower()
    
    if command == 'list':
        async with async_engine.begin() as conn:
            async with AsyncSession(conn) as db:
                await list_users(db)
        return
        
    if len(sys.argv) != 3:
        print("Error: Email required for add/remove commands")
        print_usage()
        return
        
    email = sys.argv[2]
    
    if command == 'add':
        await set_admin_status(email, True)
    elif command == 'remove':
        await set_admin_status(email, False)
    else:
        print(f"Unknown command: {command}")
        print_usage()

if __name__ == "__main__":
    asyncio.run(main()) 