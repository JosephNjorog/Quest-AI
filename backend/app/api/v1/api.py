from fastapi import APIRouter
from app.api.v1.endpoints import auth, users, instructions, quests, game_profiles

api_router = APIRouter()

api_router.include_router(auth.router, prefix="/auth", tags=["authentication"])
api_router.include_router(users.router, prefix="/users", tags=["users"])
api_router.include_router(instructions.router, prefix="/instructions", tags=["instructions"])
api_router.include_router(quests.router, prefix="/quests", tags=["quests"])
api_router.include_router(game_profiles.router, prefix="/game-profiles", tags=["game-profiles"])