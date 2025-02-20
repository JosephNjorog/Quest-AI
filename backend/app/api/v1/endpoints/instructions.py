from fastapi import APIRouter, Depends, HTTPException, BackgroundTasks
from sqlalchemy.orm import Session
from typing import List
from app.db.base import get_db
from app.models.instruction import Instruction
from app.schemas.instruction import InstructionCreate, InstructionUpdate, InstructionInDB
from app.core.security import oauth2_scheme
from app.services.ai_processor import process_instruction

router = APIRouter()

@router.post("/", response_model=InstructionInDB)
async def create_instruction(
    instruction: InstructionCreate,
    background_tasks: BackgroundTasks,
    db: Session = Depends(get_db),
    token: str = Depends(oauth2_scheme)
):
    """Create a new instruction and process it asynchronously."""
    db_instruction = Instruction(**instruction.model_dump())
    db.add(db_instruction)
    db.commit()
    db.refresh(db_instruction)
    
    # Process instruction in background
    background_tasks.add_task(
        process_instruction,
        db_instruction.id,
        db_instruction.text
    )
    
    return db_instruction

@router.get("/", response_model=List[InstructionInDB])
async def get_instructions(
    skip: int = 0,
    limit: int = 10,
    db: Session = Depends(get_db),
    token: str = Depends(oauth2_scheme)
):
    """Get list of instructions."""
    instructions = db.query(Instruction).offset(skip).limit(limit).all()
    return instructions

@router.get("/{instruction_id}", response_model=InstructionInDB)
async def get_instruction(
    instruction_id: int,
    db: Session = Depends(get_db),
    token: str = Depends(oauth2_scheme)
):
    """Get specific instruction by ID."""
    instruction = db.query(Instruction).filter(Instruction.id == instruction_id).first()
    if not instruction:
        raise HTTPException(status_code=404, detail="Instruction not found")
    return instruction
