from pydantic import BaseModel, Field
from datetime import datetime
from typing import Optional, Dict, Any

class GameProfileBase(BaseModel):
    game_id: str
    hero_id: str
    level: int = Field(default=1, ge=1)
    experience: int = Field(default=0, ge=0)
    stamina: float = Field(default=100.0, ge=0.0, le=100.0)
    stats: Dict[str, Any] = Field(default_factory=dict)

class GameProfileCreate(GameProfileBase):
    user_id: int

class GameProfileUpdate(BaseModel):
    level: Optional[int] = Field(None, ge=1)
    experience: Optional[int] = Field(None, ge=0)
    stamina: Optional[float] = Field(None, ge=0.0, le=100.0)
    stats: Optional[Dict[str, Any]] = None

class GameProfileInDB(GameProfileBase):
    id: int
    user_id: int
    created_at: datetime
    updated_at: Optional[datetime]

    class Config:
        from_attributes = True