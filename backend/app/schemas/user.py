from pydantic import BaseModel, Field
from datetime import datetime
from typing import Optional

class UserBase(BaseModel):
    wallet_address: str = Field(..., description="Ethereum wallet address")

class UserCreate(UserBase):
    pass

class UserUpdate(UserBase):
    is_active: Optional[bool] = None

class UserInDB(UserBase):
    id: int
    nonce: str
    is_active: bool
    created_at: datetime
    updated_at: Optional[datetime]

    class Config:
        from_attributes = True
