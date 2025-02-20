# app/utils/monitoring.py
import logging
import json
import time
import uuid
from datetime import datetime
from typing import Dict, Any, Optional, List
import os
from app.core.config import settings
import traceback

class MonitoringUtils:
    def __init__(self):
        """Initialize monitoring and logging configuration."""
        # Configure basic logging
        log_format = '%(asctime)s - %(name)s - %(levelname)s - %(message)s'
        logging.basicConfig(
            level=getattr(logging, settings.LOG_LEVEL),
            format=log_format,
            handlers=[
                logging.FileHandler(settings.LOG_FILE),
                logging.StreamHandler()
            ]
        )
        
        self.logger = logging.getLogger("questmind")
        
        # Performance tracking
        self.timing_data = {}
        
        # Error tracking
        self.error_counts = {}
        self.error_samples = {}
        
        # Transaction tracking
        self.tx_statuses = {
            "pending": 0,
            "success": 0,
            "failed": 0
        }
        
        # Request tracking
        self.request_count = 0
        self.last_reset_time = time.time()
    
    def log_info(self, message: str, context: Optional[Dict[str, Any]] = None) -> None:
        """Log informational message with context."""
        if context:
            self.logger.info(f"{message} - Context: {json.dumps(context)}")
        else:
            self.logger.info(message)
    
    def log_warning(self, message: str, context: Optional[Dict[str, Any]] = None) -> None:
        """Log warning message with context."""
        if context:
            self.logger.warning(f"{message} - Context: {json.dumps(context)}")
        else:
            self.logger.warning(message)
    
    def log_error(
        self,
        error_type: str,
        message: str,
        context: Optional[Dict[str, Any]] = None
    ) -> str:
        """
        Log error message and track error statistics.
        Returns a unique error ID for reference.
        """
        error_id = str(uuid.uuid4())
        
        # Track error counts
        if error_type not in self.error_counts:
            self.error_counts[error_type] = 0
            self.error_samples[error_type] = []
        
        self.error_counts[error_type] += 1
        
        # Keep the last 10 samples of each error type
        if len(self.error_samples[error_type]) >= 10:
            self.error_samples[error_type].pop(0)
        
        error_details = {
            "error_id": error_id,
            "timestamp": datetime.utcnow().isoformat(),
            "message": message,
            "context": context or {},
            "stacktrace": traceback.format_exc()
        }
        
        self.error_samples[error_type].append(error_details)
        
        # Log the error
        error_json = json.dumps(error_details)
        self.logger.error(f"ERROR [{error_type}] {message} - ID: {error_id} - Details: {error_json}")
        
        return error_id
    
    def start_timer(self, operation_name: str) -> str:
        """Start timing an operation."""
        timer_id = f"{operation_name}_{uuid.uuid4()}"
        self.timing_data[timer_id] = {
            "start_time": time.time(),
            "operation": operation_name,
            "end_time": None,
            "duration": None
        }
        return timer_id
    
    def end_timer(self, timer_id: str, extra_data: Optional[Dict[str, Any]] = None) -> Dict[str, Any]:
        """End timing an operation and record metrics."""
        if timer_id not in self.timing_data:
            return {
                "success": False,
                "error": "Timer ID not found"
            }
        
        end_time = time.time()
        self.timing_data[timer_id]["end_time"] = end_time
        duration = end_time - self.timing_data[timer_id]["start_time"]
        self.timing_data[timer_id]["duration"] = duration
        
        if extra_data:
            self.timing_data[timer_id].update(extra_data)
        
        operation = self.timing_data[timer_id]["operation"]
        
        # Log the timing information
        self.logger.info(
            f"Operation '{operation}' completed in {duration:.3f}s - ID: {timer_id}"
        )
        
        return {
            "success": True,
            "operation": operation,
            "duration": duration,
            "timer_id": timer_id,
            "data": self.timing_data[timer_id]
        }
    
    def track_transaction(self, status: str) -> None:
        """Track transaction status counts."""
        if status in self.tx_statuses:
            self.tx_statuses[status] += 1
    
    def track_request(self) -> None:
        """Track API request count for rate limiting."""
        self.request_count += 1
        
        # Reset count if more than a minute has passed
        current_time = time.time()
        if current_time - self.last_reset_time > settings.RATE_LIMIT_PERIOD:
            self.request_count = 1
            self.last_reset_time = current_time
    
    def get_request_count(self) -> int:
        """Get current request count for rate limiting."""
        # Reset if needed
        current_time = time.time()
        if current_time - self.last_reset_time > settings.RATE_LIMIT_PERIOD:
            self.request_count = 0
            self.last_reset_time = current_time
        
        return self.request_count
    
    def check_rate_limit(self) -> bool:
        """Check if current request count exceeds rate limit."""
        return self.get_request_count() > settings.RATE_LIMIT_REQUESTS
    
    def get_error_stats(self) -> Dict[str, Any]:
        """Get error statistics for monitoring."""
        return {
            "error_counts": self.error_counts,
            "error_samples": {k: v[:5] for k, v in self.error_samples.items()},  # Return first 5 samples
            "total_errors": sum(self.error_counts.values())
        }
    
    def get_performance_stats(self) -> Dict[str, Any]:
        """Get performance statistics for monitoring."""
        operations = {}
        
        # Group timing data by operation
        for timer_id, data in self.timing_data.items():
            if data["duration"] is not None:
                op_name = data["operation"]
                if op_name not in operations:
                    operations[op_name] = {
                        "count": 0,
                        "total_duration": 0,
                        "max_duration": 0,
                        "min_duration": float('inf')
                    }
                
                operations[op_name]["count"] += 1
                operations[op_name]["total_duration"] += data["duration"]
                operations[op_name]["max_duration"] = max(operations[op_name]["max_duration"], data["duration"])
                operations[op_name]["min_duration"] = min(operations[op_name]["min_duration"], data["duration"])
        
        # Calculate averages
        for op_name, stats in operations.items():
            if stats["count"] > 0:
                stats["avg_duration"] = stats["total_duration"] / stats["count"]
            if stats["min_duration"] == float('inf'):
                stats["min_duration"] = 0
        
        return {
            "operations": operations,
            "tx_statuses": self.tx_statuses,
            "request_rate": self.request_count / settings.RATE_LIMIT_PERIOD
        }
    
    def clear_old_timing_data(self, max_age_seconds: int =