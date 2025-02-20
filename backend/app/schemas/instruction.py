from pydantic import BaseModel, Field
from datetime import datetime
from typing import Optional, Dict, Any

class InstructionBase(BaseModel):
    text: str = Field(..., min_length=1)
    status: str = Field(default="pending")

class InstructionCreate(InstructionBase):
    user_id: int

class InstructionUpdate(BaseModel):
    status: Optional[str] = None
    result: Optional[Dict[str, Any]] = None

class InstructionInDB(InstructionBase):
    id: int
    user_id: int
    result: Optional[Dict[str, Any]]
    created_at: datetime
    updated_at: Optional[datetime]

    class Config:
        from_attributes = True