import os
import json
import time
from datetime import datetime, timedelta
from typing import Dict, Any, List, Optional
from collections import defaultdict

from ..utils.logger import get_logger

logger = get_logger(__name__)

class AnalyticsService:
    def __init__(self):
        """Initialize the analytics service"""
        self.analytics_dir = "./data/analytics"
        os.makedirs(self.analytics_dir, exist_ok=True)
        
    def track_event(self, event_type: str, event_data: Dict[str, Any]) -> bool:
        """
        Track a single analytics event
        
        Args:
            event_type: Type of event (quest_started, quest_completed, ai_decision, etc.)
            event_data: Dictionary of event details
            
        Returns:
            bool: Success status
        """
        try:
            event = {
                "event_id": event_data.get("id", str(time.time())),
                "event_type": event_type,
                "timestamp": event_data.get("timestamp", int(time.time())),
                "data": event_data
            }
            
            # Store event by type
            event_file = f"{self.analytics_dir}/{event_type}.jsonl"
            with open(event_file, "a") as f:
                f.write(json.dumps(event) + "\n")
                
            # If user_id is available, store user-specific event
            if "user_id" in event_data:
                user_dir = f"{self.analytics_dir}/users/{event_data['user_id']}"
                os.makedirs(user_dir, exist_ok=True)
                
                user_event_file = f"{user_dir}/{event_type}.jsonl"
                with open(user_event_file, "a") as f:
                    f.write(json.dumps(event) + "\n")
            
            return True
        except Exception as e:
            logger.error(f"Failed to track event: {str(e)}")
            return False
    
    def get_events(self, event_type: str, start_time: int = None, 
                  end_time: int = None, limit: int = 100) -> List[Dict[str, Any]]:
        """
        Get events of a specific type with optional time filtering
        
        Args:
            event_type: Type of events to retrieve
            start_time: Optional unix timestamp for start of range
            end_time: Optional unix timestamp for end of range
            limit: Maximum number of events to return
            
        Returns:
            List of event dictionaries
        """
        events = []
        try:
            event_file = f"{self.analytics_dir}/{event_type}.jsonl"
            if not os.path.exists(event_file):
                return events
                
            with open(event_file, "r") as f:
                for line in f:
                    event = json.loads(line)
                    event_time = event.get("timestamp", 0)
                    
                    # Apply time filters if provided
                    if start_time and event_time < start_time:
                        continue
                    if end_time and event_time > end_time:
                        continue
                        
                    events.append(event)
                    if len(events) >= limit:
                        break
            
            # Sort by timestamp descending (most recent first)
            events.sort(key=lambda x: x.get("timestamp", 0), reverse=True)
            return events
        except Exception as e:
            logger.error(f"Failed to get events: {str(e)}")
            return []
    
    def get_user_events(self, user_id: str, event_type: Optional[str] = None, 
                       limit: int = 50) -> List[Dict[str, Any]]:
        """
        Get events for a specific user
        
        Args:
            user_id: ID of the user
            event_type: Optional event type filter
            limit: Maximum number of events to return
            
        Returns:
            List of event dictionaries
        """
        events = []
        try:
            user_dir = f"{self.analytics_dir}/users/{user_id}"
            if not os.path.exists(user_dir):
                return events
                
            if event_type:
                # Get events of specific type
                event_file = f"{user_dir}/{event_type}.jsonl"
                if os.path.exists(event_file):
                    with open(event_file, "r") as f:
                        for line in f:
                            events.append(json.loads(line))
                            if len(events) >= limit:
                                break
            else:
                # Get all event types
                for filename in os.listdir(user_dir):
                    if filename.endswith(".jsonl"):
                        with open(f"{user_dir}/{filename}", "r") as f:
                            for line in f:
                                events.append(json.loads(line))
                                
                # Sort and limit
                events.sort(key=lambda x: x.get("timestamp", 0), reverse=True)
                events = events[:limit]
            
            return events
        except Exception as e:
            logger.error(f"Failed to get user events: {str(e)}")
            return []
    
    def calculate_game_metrics(self, game_id: str, 
                              time_period: str = "last_week") -> Dict[str, Any]:
        """
        Calculate metrics for a specific game
        
        Args:
            game_id: Identifier for the game (e.g., 'defi_kingdoms')
            time_period: Time period for analysis ('today', 'last_week', 'last_month')
            
        Returns:
            Dictionary of metrics
        """
        try:
            # Determine time range
            now = int(time.time())
            if time_period == "today":
                start_time = int(datetime.now().replace(hour=0, minute=0, second=0).timestamp())
            elif time_period == "last_week":
                start_time = int((datetime.now() - timedelta(days=7)).timestamp())
            elif time_period == "last_month":
                start_time = int((datetime.now() - timedelta(days=30)).timestamp())
            else:
                start_time = 0
                
            # Get relevant events
            quest_starts = self.get_events(f"{game_id}_quest_started", start_time=start_time, limit=1000)
            quest_completes = self.get_events(f"{game_id}_quest_completed", start_time=start_time, limit=1000)
            rewards_collected = self.get_events(f"{game_id}_rewards_collected", start_time=start_time, limit=1000)
            
            # Calculate metrics
            total_quests = len(quest_starts)
            completed_quests = len(quest_completes)
            completion_rate = completed_quests / total_quests if total_quests > 0 else 0
            
            # Aggregate rewards
            total_rewards = defaultdict(float)
            for event in rewards_collected:
                rewards = event.get("data", {}).get("rewards", {})
                for token, amount in rewards.items():
                    # Convert to float to handle numeric rewards
                    if isinstance(amount, (int, float, str)):
                        try:
                            total_rewards[token] += float(amount)
                        except (ValueError, TypeError):
                            pass
            
            # Calculate quest type distribution
            quest_types = defaultdict(int)
            for event in quest_starts:
                quest_type = event.get("data", {}).get("quest_type")
                if quest_type:
                    quest_types[quest_type] += 1
            
# Calculate average quest duration
            quest_durations = []
            quest_start_times = {}
            
            # Map start times by quest_id
            for event in quest_starts:
                quest_id = event.get("data", {}).get("quest_id")
                if quest_id:
                    quest_start_times[quest_id] = event.get("timestamp", 0)
            
            # Calculate duration for completed quests
            for event in quest_completes:
                quest_id = event.get("data", {}).get("quest_id")
                if quest_id and quest_id in quest_start_times:
                    start_time = quest_start_times[quest_id]
                    end_time = event.get("timestamp", 0)
                    if end_time > start_time:
                        duration = end_time - start_time
                        quest_durations.append(duration)
            
            avg_duration = sum(quest_durations) / len(quest_durations) if quest_durations else 0
            
            return {
                "time_period": time_period,
                "total_quests": total_quests,
                "completed_quests": completed_quests,
                "completion_rate": completion_rate,
                "avg_quest_duration_seconds": avg_duration,
                "quest_type_distribution": dict(quest_types),
                "total_rewards": dict(total_rewards)
            }
        except Exception as e:
            logger.error(f"Failed to calculate game metrics: {str(e)}")
            return {"error": str(e)}
    
    def calculate_user_performance(self, user_id: str, 
                                  game_id: str = None) -> Dict[str, Any]:
        """
        Calculate performance metrics for a specific user
        
        Args:
            user_id: ID of the user
            game_id: Optional game identifier to filter metrics
            
        Returns:
            Dictionary of performance metrics
        """
        try:
            # Get all user quest events
            quest_filter = f"{game_id}_quest_completed" if game_id else None
            completed_quests = self.get_user_events(user_id, event_type=quest_filter, limit=500)
            
            # Calculate total rewards
            rewards = defaultdict(float)
            total_xp = 0
            
            for event in completed_quests:
                # Extract rewards from each completed quest
                quest_rewards = event.get("data", {}).get("rewards", {})
                for token, amount in quest_rewards.items():
                    try:
                        # Handle different reward formats
                        if isinstance(amount, (int, float)):
                            rewards[token] += amount
                        elif isinstance(amount, str) and amount.replace('.', '', 1).isdigit():
                            rewards[token] += float(amount)
                    except (ValueError, TypeError):
                        pass
                
                # Track XP gains
                xp_gain = event.get("data", {}).get("xp_gained", 0)
                if xp_gain:
                    total_xp += xp_gain
            
            # Calculate efficiency (rewards per quest)
            quest_count = len(completed_quests)
            efficiency = {
                token: amount / quest_count if quest_count > 0 else 0 
                for token, amount in rewards.items()
            }
            
            # Get AI success rate
            ai_decisions = self.get_user_events(user_id, event_type="ai_decision", limit=1000)
            total_decisions = len(ai_decisions)
            successful_decisions = sum(1 for d in ai_decisions if d.get("data", {}).get("success", False))
            ai_success_rate = successful_decisions / total_decisions if total_decisions > 0 else 0
            
            # Calculate activity trends (quests per day for last 7 days)
            now = datetime.now()
            daily_activity = defaultdict(int)
            
            for quest in completed_quests:
                timestamp = quest.get("timestamp", 0)
                quest_date = datetime.fromtimestamp(timestamp).strftime("%Y-%m-%d")
                daily_activity[quest_date] += 1
            
            # Ensure we have entries for all days in the last week
            activity_trend = []
            for i in range(7):
                date = (now - timedelta(days=i)).strftime("%Y-%m-%d")
                activity_trend.append({
                    "date": date,
                    "quests_completed": daily_activity.get(date, 0)
                })
            
            return {
                "user_id": user_id,
                "game_id": game_id,
                "total_quests_completed": quest_count,
                "total_rewards": dict(rewards),
                "total_xp_gained": total_xp,
                "rewards_per_quest": efficiency,
                "ai_success_rate": ai_success_rate,
                "daily_activity": sorted(activity_trend, key=lambda x: x["date"])
            }
        except Exception as e:
            logger.error(f"Failed to calculate user performance: {str(e)}")
            return {"error": str(e)}
    
    def get_ai_performance_metrics(self, time_period: str = "last_week") -> Dict[str, Any]:
        """
        Get metrics on AI agent performance
        
        Args:
            time_period: Time period for analysis ('today', 'last_week', 'last_month')
            
        Returns:
            Dictionary of AI performance metrics
        """
        try:
            # Determine time range
            now = int(time.time())
            if time_period == "today":
                start_time = int(datetime.now().replace(hour=0, minute=0, second=0).timestamp())
            elif time_period == "last_week":
                start_time = int((datetime.now() - timedelta(days=7)).timestamp())
            elif time_period == "last_month":
                start_time = int((datetime.now() - timedelta(days=30)).timestamp())
            else:
                start_time = 0
            
            # Get AI decision events
            decisions = self.get_events("ai_decision", start_time=start_time, limit=10000)
            
            # Calculate success rate
            total_decisions = len(decisions)
            successful_decisions = sum(1 for d in decisions if d.get("data", {}).get("success", False))
            
            # Group by intent type
            intent_success = defaultdict(lambda: {"total": 0, "success": 0})
            
            for decision in decisions:
                intent = decision.get("data", {}).get("intent", "unknown")
                is_success = decision.get("data", {}).get("success", False)
                
                intent_success[intent]["total"] += 1
                if is_success:
                    intent_success[intent]["success"] += 1
            
            # Calculate success rate by intent
            intent_metrics = {}
            for intent, counts in intent_success.items():
                success_rate = counts["success"] / counts["total"] if counts["total"] > 0 else 0
                intent_metrics[intent] = {
                    "total_requests": counts["total"],
                    "successful": counts["success"],
                    "success_rate": success_rate
                }
            
            # Calculate average processing time
            processing_times = [
                d.get("data", {}).get("processing_time_ms", 0) 
                for d in decisions
                if "processing_time_ms" in d.get("data", {})
            ]
            
            avg_processing_time = sum(processing_times) / len(processing_times) if processing_times else 0
            
            return {
                "time_period": time_period,
                "total_decisions": total_decisions,
                "successful_decisions": successful_decisions,
                "overall_success_rate": successful_decisions / total_decisions if total_decisions > 0 else 0,
                "intent_metrics": intent_metrics,
                "avg_processing_time_ms": avg_processing_time
            }
        except Exception as e:
            logger.error(f"Failed to get AI performance metrics: {str(e)}")
            return {"error": str(e)}