from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from app.db.base import get_db
from app.models.quest import Quest
from app.schemas.quest import QuestCreate, QuestUpdate, QuestInDB
from app.core.security import oauth2_scheme
from app.services.quest_manager import start_quest, complete_quest

router = APIRouter()

@router.post("/", response_model=QuestInDB)
async def create_quest(
    quest: QuestCreate,
    db: Session = Depends(get_db),
    token: str = Depends(oauth2_scheme)
):
    """Start a new quest."""
    db_quest = await start_quest(db, quest)
    return db_quest

@router.get("/", response_model=List[QuestInDB])
async def get_quests(
    skip: int = 0,
    limit: int = 10,
    db: Session = Depends(get_db),
    token: str = Depends(oauth2_scheme)
):
    """Get list of quests."""
    quests = db.query(Quest).offset(skip).limit(limit).all()
    return quests

@router.put("/{quest_id}/complete", response_model=QuestInDB)
async def complete_quest_endpoint(
    quest_id: int,
    db: Session = Depends(get_db),
    token: str = Depends(oauth2_scheme)
):
    """Complete a quest and collect rewards."""
    quest = await complete_quest(db, quest_id)
    if not quest:
        raise HTTPException(status_code=404, detail="Quest not found")
    return quest