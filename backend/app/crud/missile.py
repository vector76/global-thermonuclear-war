from datetime import datetime, timedelta, UTC
from typing import List, Optional
from sqlalchemy.orm import Session
from app.models.missile import MissileCreate, Missile, City

async def create_missile(db: Session, missile: MissileCreate) -> Missile:
    db_missile = Missile(**missile.model_dump())
    db.add(db_missile)
    await db.commit()
    await db.refresh(db_missile)
    return db_missile

def get_active_missiles(db: Session) -> List[Missile]:
    return db.query(Missile)\
        .filter(Missile.impact_time > datetime.now(UTC))\
        .all()

def get_recent_impacts(db: Session, hours: int = 24) -> List[Missile]:
    cutoff = datetime.now(UTC) - timedelta(hours=hours)
    return db.query(Missile)\
        .filter(Missile.impact_time <= datetime.now(UTC))\
        .filter(Missile.impact_time > cutoff)\
        .all()

def get_city_by_name(db: Session, name: str, country: Optional[str] = None) -> Optional[City]:
    query = db.query(City).filter(City.name.ilike(f"%{name}%"))
    if country:
        query = query.filter(City.country.ilike(f"%{country}%"))
    return query.first() 