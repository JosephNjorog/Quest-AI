from pydantic import BaseModel, Field
from datetime import datetime
from typing import Optional, Dict, Any

class QuestBase(BaseModel):
    quest_type: str
    status: str = Field(default="active")
    rewards: Dict[str, Any] = Field(default_factory=dict)
    start_time: datetime
    end_time: datetime

class QuestCreate(QuestBase):
    user_id: int
    game_profile_id: int

class QuestUpdate(BaseModel):
    status: Optional[str] = None
    rewards: Optional[Dict[str, Any]] = None
    end_time: Optional[datetime] = None

class QuestInDB(QuestBase):
    id: int
    user_id: int
    game_profile_id: int
    created_at: datetime
    updated_at: Optional[datetime]

    class Config:
        from_attributes = True