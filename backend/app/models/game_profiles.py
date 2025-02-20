from sqlalchemy import Column, Integer, String, Float, ForeignKey, DateTime, JSON
from sqlalchemy.sql import func
from app.db.base import Base

class GameProfile(Base):
    __tablename__ = "game_profiles"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    game_id = Column(String)  # e.g., "dfk", "heroes-of-nft"
    hero_id = Column(String)  # Game-specific hero identifier
    level = Column(Integer, default=1)
    experience = Column(Integer, default=0)
    stamina = Column(Float, default=100.0)
    stats = Column(JSON)  # Game-specific stats
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())