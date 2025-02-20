from typing import Dict, Any, List, Tuple, Optional
import json
from sqlalchemy.orm import Session
from app.db.base import SessionLocal
from app.models.instruction import Instruction
from app.services.game_interface import GameInterface
from app.core.config import settings
import re
from datetime import datetime, timedelta

class AIProcessor:
    def __init__(self):
        self.command_patterns = {
            "quest": [
                "start quest", "begin quest", "go on quest", "quest for",
                "start farming", "start mining", "start gardening", "start fishing"
            ],
            "level_up": [
                "level up", "increase level", "gain experience", "train hero",
                "power up", "strengthen hero"
            ],
            "collect_rewards": [
                "collect rewards", "claim rewards", "get rewards", "harvest rewards",
                "gather rewards", "claim earnings"
            ],
            "check_status": [
                "check status", "show stats", "view hero", "hero status",
                "display stats", "show progress"
            ],
            "buy_items": [
                "buy item", "purchase item", "get item", "acquire item",
                "buy equipment", "purchase gear"
            ]
        }
        
        self.game_interface = GameInterface()
        self.optimization_weights = self._load_optimization_weights()

    def _load_optimization_weights(self) -> Dict[str, float]:
        """Load reinforcement learning weights for strategy optimization."""
        try:
            with open("app/data/optimization_weights.json", "r") as f:
                return json.load(f)
        except FileNotFoundError:
            return {
                "quest_success_rate": 0.4,
                "reward_efficiency": 0.3,
                "stamina_management": 0.2,
                "time_efficiency": 0.1
            }

    def parse_instruction(self, text: str, hero_status: Optional[Dict] = None) -> Tuple[str, Dict[str, Any]]:
        """
        Parse the instruction text with context awareness from hero status.
        """
        text = text.lower()
        
        # Identify command type
        command_type = self._identify_command_type(text)
        
        # Extract basic parameters
        params = self._extract_parameters(text, command_type)
        
        # Enhance parameters with context awareness
        if hero_status:
            params = self._enhance_with_context(params, command_type, hero_status)
        
        return command_type, params

    def _identify_command_type(self, text: str) -> str:
        """Identify the type of command from the instruction text."""
        for cmd, patterns in self.command_patterns.items():
            if any(pattern in text for pattern in patterns):
                return cmd
        return "unknown"

    def _extract_parameters(self, text: str, command_type: str) -> Dict[str, Any]:
        """Extract parameters with enhanced pattern matching."""
        params = {}
        
        if command_type == "quest":
            params.update(self._extract_quest_parameters(text))
        elif command_type == "level_up":
            params.update(self._extract_level_parameters(text))
        elif command_type == "buy_items":
            params.update(self._extract_item_parameters(text))
        
        # Extract any numerical quantities
        params.update(self._extract_numerical_params(text))
        
        return params

    def _extract_quest_parameters(self, text: str) -> Dict[str, Any]:
        """Extract quest-specific parameters."""
        params = {}
        
        # Quest types
        quest_types = {
            "mining": ["mining", "mine", "dig"],
            "gardening": ["gardening", "garden", "plant"],
            "fishing": ["fishing", "fish", "angle"],
            "combat": ["combat", "fight", "battle"]
        }
        
        for quest_type, patterns in quest_types.items():
            if any(pattern in text for pattern in patterns):
                params["quest_type"] = quest_type
                break
        
        # Extract duration
        duration_patterns = [
            r"(\d+)\s*(?:hour|hours|hr|hrs)",
            r"(\d+)\s*(?:minute|minutes|min|mins)"
        ]
        
        for pattern in duration_patterns:
            if match := re.search(pattern, text):
                value = int(match.group(1))
                if "minute" in pattern:
                    value = value / 60  # Convert to hours
                params["duration"] = value
                break
        
        return params

    def _extract_level_parameters(self, text: str) -> Dict[str, Any]:
        """Extract level-up specific parameters."""
        params = {}
        
        # Target level
        if level_match := re.search(r"to level (\d+)", text):
            params["target_level"] = int(level_match.group(1))
        
        # Skill focus
        skills = ["strength", "agility", "intelligence", "wisdom", "vitality"]
        for skill in skills:
            if skill in text:
                params["focus_skill"] = skill
                break
        
        return params

    def _enhance_with_context(
        self,
        params: Dict[str, Any],
        command_type: str,
        hero_status: Dict[str, Any]
    ) -> Dict[str, Any]:
        """Enhance parameters with context from hero status."""
        if command_type == "quest":
            # Adjust duration based on stamina
            if "duration" in params:
                max_duration = hero_status.get("stamina", 0) / 5  # Assume 5 stamina per hour
                params["duration"] = min(params["duration"], max_duration)
            
            # Suggest optimal quest type based on hero stats
            if "quest_type" not in params:
                params["quest_type"] = self._suggest_optimal_quest(hero_status)
        
        return params

    def _suggest_optimal_quest(self, hero_status: Dict[str, Any]) -> str:
        """Suggest optimal quest type based on hero stats and past performance."""
        stats = hero_status.get("stats", {})
        
        # Simple scoring system
        quest_scores = {
            "mining": stats.get("strength", 0) * 0.6 + stats.get("endurance", 0) * 0.4,
            "gardening": stats.get("wisdom", 0) * 0.7 + stats.get("intelligence", 0) * 0.3,
            "fishing": stats.get("agility", 0) * 0.5 + stats.get("luck", 0) * 0.5,
            "combat": stats.get("strength", 0) * 0.4 + stats.get("agility", 0) * 0.3 + stats.get("vitality", 0) * 0.3
        }
        
        return max(quest_scores.items(), key=lambda x: x[1])[0]

    async def execute_command(
        self,
        command_type: str,
        params: Dict[str, Any],
        user_id: int,
        hero_id: Optional[int] = None
    ) -> Dict[str, Any]:
        """Execute the command with error handling and optimization."""
        result = {
            "success": False,
            "message": "",
            "data": {},
            "optimization_info": {}
        }
        
        try:
            # Pre-execution checks
            if not await self._validate_execution_conditions(command_type, params, user_id):
                return {
                    "success": False,
                    "message": "Execution conditions not met",
                    "data": {"reason": "validation_failed"}
                }
            
            # Execute command with optimization
            result = await self._execute_optimized_command(command_type, params, user_id, hero_id)
            
            # Post-execution analysis
            if result["success"]:
                await self._update_optimization_weights(command_type, result["data"])
            
        except Exception as e:
            result["success"] = False
            result["message"] = f"Error executing command: {str(e)}"
            
        return result

    async def _validate_execution_conditions(
        self,
        command_type: str,
        params: Dict[str, Any],
        user_id: int
    ) -> bool:
        """Validate conditions before executing command."""
        try:
            # Check user authorization
            if not await self.game_interface.verify_user_access(user_id):
                return False
            
            # Check resource requirements
            if command_type == "quest":
                hero_status = await self.game_interface.get_hero_status(user_id)
                if hero_status["stamina"] < params.get("duration", 1) * 5:
                    return False
            
            return True
            
        except Exception:
            return False

    async def _execute_optimized_command(
        self,
        command_type: str,
        params: Dict[str, Any],
        user_id: int,
        hero_id: Optional[int]
    ) -> Dict[str, Any]:
        """Execute command with optimization strategies."""
        if command_type == "quest":
            return await self.game_interface.start_quest(
                user_id,
                params.get("quest_type", "mining"),
                params.get("duration", 1),
                optimization_params=self._get_optimization_params(command_type)
            )
        elif command_type == "level_up":
            return await self.game_interface.level_up_hero(
                user_id,
                params.get("target_level"),
                focus_skill=params.get("focus_skill")
            )
        elif command_type == "collect_rewards":
            return await self.game_interface.collect_rewards(user_id)
        elif command_type == "check_status":
            return await self.game_interface.get_hero_status(user_id)
        else:
            return {
                "success": False,
                "message": "Unknown command type",
                "data": {}
            }

    def _get_optimization_params(self, command_type: str) -> Dict[str, Any]:
        """Get optimization parameters based on learned weights."""
        return {
            "weights": self.optimization_weights,
            "strategy_adjustments": {
                "risk_tolerance": 0.7,
                "reward_focus": 0.8,
                "efficiency_priority": 0.6
            }
        }

    async def _update_optimization_weights(
        self,
        command_type: str,
        execution_data: Dict[str, Any]
    ) -> None:
        """Update optimization weights based on execution results."""
        if not execution_data:
            return
            
        # Calculate success metrics
        success_rate = execution_data.get("success_rate", 0)
        reward_efficiency = execution_data.get("reward_efficiency", 0)
        
        # Update weights
        learning_rate = 0.1
        self.optimization_weights["quest_success_rate"] += learning_rate * (success_rate - self.optimization_weights["quest_success_rate"])
        self.optimization_weights["reward_efficiency"] += learning_rate * (reward_efficiency - self.optimization_weights["reward_efficiency"])
        
        # Save updated weights
        try:
            with open("app/data/optimization_weights.json", "w") as f:
                json.dump(self.optimization_weights, f)
        except Exception:
            pass

ai_processor = AIProcessor()

async def process_instruction(instruction_id: int, instruction_text: str):
    """Process an instruction with full lifecycle management."""
    db = SessionLocal()
    try:
        instruction = db.query(Instruction).filter(
            Instruction.id == instruction_id
        ).first()
        
        if not instruction:
            return
        
        # Update status to processing
        instruction.status = "processing"
        instruction.started_at = datetime.utcnow()
        db.commit()
        
        # Get hero status for context
        hero_status = await ai_processor.game_interface.get_hero_status(
            instruction.user_id
        )
        
        # Parse and execute with context
        command_type, params = ai_processor.parse_instruction(
            instruction_text,
            hero_status
        )
        
        result = await ai_processor.execute_command(
            command_type,
            params,
            instruction.user_id,
            hero_status.get("hero_id")
        )
        
        # Update instruction with detailed result
        instruction.status = "completed" if result["success"] else "failed"
        instruction.completed_at = datetime.utcnow()
        instruction.result = result
        instruction.execution_time = (instruction.completed_at - instruction.started_at).total_seconds()
        db.commit()
        
    except Exception as e:
        instruction.status = "failed"
        instruction.completed_at = datetime.utcnow()
        instruction.result = {
            "success": False,
            "message": f"Error processing instruction: {str(e)}",
            "error_type": type(e).__name__
        }
        db.commit()
    
    finally:
        db.close()