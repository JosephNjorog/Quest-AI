from typing import Any, Dict, List, Optional
import re
from pydantic import BaseModel, validator
from datetime import datetime, timedelta

class ValidationUtils:
    @staticmethod
    def validate_wallet_address(address: str) -> bool:
        """Validate Ethereum wallet address format."""
        if not address:
            return False
        return bool(re.match(r'^0x[a-fA-F0-9]{40}$', address))

    @staticmethod
    def validate_transaction_hash(tx_hash: str) -> bool:
        """Validate transaction hash format."""
        if not tx_hash:
            return False
        return bool(re.match(r'^0x[a-fA-F0-9]{64}$', tx_hash))

    @staticmethod
    def validate_instruction_text(text: str) -> bool:
        """Validate instruction text."""
        if not text or len(text.strip()) < 5:
            return False
        return len(text) <= 500  # Maximum instruction length

    @staticmethod
    def validate_game_parameters(params: Dict[str, Any]) -> Dict[str, str]:
        """Validate game-specific parameters."""
        errors = {}
        
        # Validate quest duration
        if 'duration' in params:
            duration = params['duration']
            if not isinstance(duration, (int, float)) or duration <= 0 or duration > 24:
                errors['duration'] = 'Duration must be between 0 and 24 hours'

        # Validate quest type
        if 'quest_type' in params:
            valid_types = {'mining', 'gardening', 'fishing', 'combat'}
            if params['quest_type'] not in valid_types:
                errors['quest_type'] = f'Quest type must be one of: {", ".join(valid_types)}'

        return errors