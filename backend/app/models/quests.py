from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, Float, JSON
from sqlalchemy.sql import func
from app.db.base import Base

class Quest(Base):
    __tablename__ = "quests"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    game_profile_id = Column(Integer, ForeignKey("game_profiles.id"))
    quest_type = Column(String)  # e.g., "mining", "gardening", "combat"
    status = Column(String)  # active, completed, failed
    rewards = Column(JSON)  # Structured rewards data
    start_time = Column(DateTime(timezone=True))
    end_time = Column(DateTime(timezone=True))
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    