from pydantic_settings import BaseSettings
from typing import Optional, Dict, Any, List
import os
from functools import lru_cache

class Settings(BaseSettings):
    # API Configuration
    API_V1_STR: str = "/api/v1"
    PROJECT_NAME: str = "QuestMind AI Gaming Agent"
    
    # Security
    SECRET_KEY: str = os.getenv("SECRET_KEY", "your-secret-key-here")
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24 * 8  # 8 days
    
    # Blockchain Configuration
    WEB3_PROVIDER_URI: str = os.getenv(
        "WEB3_PROVIDER_URI",
        "https://api.avax.network/ext/bc/C/rpc"
    )
    CHAIN_ID: int = 43114  # Avalanche C-Chain
    
    # Game Contract Addresses
    CONTRACT_ADDRESSES: Dict[str, str] = {
        "hero": os.getenv("HERO_CONTRACT_ADDRESS", ""),
        "quest": os.getenv("QUEST_CONTRACT_ADDRESS", ""),
        "item": os.getenv("ITEM_CONTRACT_ADDRESS", "")
    }
    
    # Database
    POSTGRES_SERVER: str = os.getenv("POSTGRES_SERVER", "localhost")
    POSTGRES_USER: str = os.getenv("POSTGRES_USER", "postgres")
    POSTGRES_PASSWORD: str = os.getenv("POSTGRES_PASSWORD", "")
    POSTGRES_DB: str = os.getenv("POSTGRES_DB", "questmind")
    SQLALCHEMY_DATABASE_URI: Optional[str] = None
    
    # Redis Configuration
    REDIS_HOST: str = os.getenv("REDIS_HOST", "localhost")
    REDIS_PORT: int = int(os.getenv("REDIS_PORT", 6379))
    REDIS_PASSWORD: Optional[str] = os.getenv("REDIS_PASSWORD")
    
    # Logging
    LOG_LEVEL: str = os.getenv("LOG_LEVEL", "INFO")
    LOG_FILE: str = "app.log"
    
    # Game Configuration
    MAX_QUEST_DURATION: int = 24  # hours
    MIN_QUEST_DURATION: int = 1  # hour
    QUEST_TYPES: List[str] = ["mining", "gardening", "fishing", "combat"]
    
    # AI Configuration
    MAX_INSTRUCTION_LENGTH: int = 500
    INSTRUCTION_TIMEOUT: int = 300  # seconds
    
    # Performance
    MAX_CONCURRENT_EXECUTIONS: int = 50
    RATE_LIMIT_REQUESTS: int = 100
    RATE_LIMIT_PERIOD: int = 60  # seconds
    
    class Config:
        case_sensitive = True
        env_file = ".env"

    def __init__(self, **data: Any):
        super().__init__(**data)
        self.SQLALCHEMY_DATABASE_URI = (
            f"postgresql://{self.POSTGRES_USER}:{self.POSTGRES_PASSWORD}"
            f"@{self.POSTGRES_SERVER}/{self.POSTGRES_DB}"
        )

@lru_cache()
def get_settings() -> Settings:
    """Create cached settings instance."""
    return Settings()

settings = get_settings()