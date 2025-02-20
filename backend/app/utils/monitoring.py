import logging
from typing import Any, Dict
from datetime import datetime
import json
from app.core.config import settings

class MonitoringUtils:
    def __init__(self):
        self.logger = logging.getLogger("app_monitoring")
        self._setup_logging()

    def _setup_logging(self):
        """Setup logging configuration."""
        logging.basicConfig(
            level=settings.LOG_LEVEL,
            format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
            handlers=[
                logging.FileHandler(settings.LOG_FILE),
                logging.StreamHandler()
            ]
        )

    def log_instruction_execution(
        self,
        instruction_id: int,
        status: str,
        execution_time: float,
        details: Dict[str, Any]
    ):
        """Log instruction execution details."""
        log_entry = {
            "timestamp": datetime.utcnow().isoformat(),
            "instruction_id": instruction_id,
            "status": status,
            "execution_time": execution_time,
            "details": details
        }
        self.logger.info(f"Instruction execution: {json.dumps(log_entry)}")

    def log_error(
        self,
        error_type: str,
        error_message: str,
        context: Dict[str, Any]
    ):
        """Log error with context."""
        log_entry = {
            "timestamp": datetime.utcnow().isoformat(),
            "error_type": error_type,
            "error_message": error_message,
            "context": context
        }
        self.logger.error(f"Error occurred: {json.dumps(log_entry)}")