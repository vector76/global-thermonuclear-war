from fastapi import FastAPI, Depends
from fastapi.middleware.cors import CORSMiddleware
import uvicorn
from sqlalchemy.ext.asyncio import AsyncSession
from app.core import settings
from app.core.database import get_db
from app.models import Configuration
from sqlalchemy import select

app = FastAPI(title=settings.PROJECT_NAME)

# Update CORS middleware to match React's port
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5100"],  # React frontend
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
async def root():
    return {"message": "Hello World"}

@app.get("/api/health")
async def health_check():
    return {"status": "healthy"}

@app.get("/api/config/{key}")
async def get_config(key: str, db: AsyncSession = Depends(get_db)):
    """Test endpoint to verify database operations"""
    query = select(Configuration).where(Configuration.key == key)
    result = await db.execute(query)
    config = result.scalar_one_or_none()
    if config:
        return {"key": config.key, "value": config.value}
    return {"error": "Configuration not found"}

@app.post("/api/config")
async def set_config(key: str, value: str, db: AsyncSession = Depends(get_db)):
    """Test endpoint to set configuration values"""
    config = Configuration(key=key, value=value)
    db.add(config)
    await db.commit()
    return {"key": key, "value": value}

if __name__ == "__main__":
    uvicorn.run("app.main:app", host="0.0.0.0", port=settings.PORT, reload=True)
