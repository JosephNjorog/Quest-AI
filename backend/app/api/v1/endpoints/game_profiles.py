from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from app.db.base import get_db
from app.models.game_profile import GameProfile
from app.schemas.game_profile import GameProfileCreate, GameProfileUpdate, GameProfileInDB
from app.core.security import oauth2_scheme

router = APIRouter()

@router.post("/", response_model=GameProfileInDB)
async def create_game_profile(
    profile: GameProfileCreate,
    db: Session = Depends(get_db),
    token: str = Depends(oauth2_scheme)
):
    """Create a new game profile."""
    db_profile = GameProfile(**profile.model_dump())
    db.add(db_profile)
    db.commit()
    db.refresh(db_profile)
    return db_profile

@router.get("/", response_model=List[GameProfileInDB])
async def get_game_profiles(
    skip: int = 0,
    limit: int = 10,
    db: Session = Depends(get_db),
    token: str = Depends(oauth2_scheme)
):
    """Get list of game profiles."""
    profiles = db.query(GameProfile).offset(skip).limit(limit).all()
    return profiles

@router.put("/{profile_id}", response_model=GameProfileInDB)
async def update_game_profile(
    profile_id: int,
    profile_update: GameProfileUpdate,
    db: Session = Depends(get_db),
    token: str = Depends(oauth2_scheme)
):
    """Update a game profile."""
    db_profile = db.query(GameProfile).filter(GameProfile.id == profile_id).first()
    if not db_profile:
        raise HTTPException(status_code=404, detail="Profile not found")
    
    for field, value in profile_update.model_dump(exclude_unset=True).items():
        setattr(db_profile, field, value)
    
    db.commit()
    db.refresh(db_profile)
    return db_profile