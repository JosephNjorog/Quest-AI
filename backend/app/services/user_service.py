import os
import uuid
import json
import time
from typing import Dict, Any, Optional, List

from ..models.user import User
from ..models.preferences import UserPreferences
from ..utils.logger import get_logger

logger = get_logger(__name__)

class UserService:
    def __init__(self, db_connection_string: str = None):
        """Initialize the user service"""
        self.db_connection = db_connection_string
        # In-memory storage - in production use a database
        self._users: Dict[str, User] = {}
        self._user_preferences: Dict[str, UserPreferences] = {}
        self._sessions: Dict[str, Dict[str, Any]] = {}
        
        # Load existing users if any (for demo purposes)
        self._load_users()
    
    def _load_users(self):
        """Load existing users from file (for demo purposes)"""
        try:
            if os.path.exists("./data/users.json"):
                with open("./data/users.json", "r") as f:
                    users_data = json.load(f)
                    for user_id, user_data in users_data.items():
                        self._users[user_id] = User(**user_data)
                        
            if os.path.exists("./data/preferences.json"):
                with open("./data/preferences.json", "r") as f:
                    prefs_data = json.load(f)
                    for user_id, pref_data in prefs_data.items():
                        self._user_preferences[user_id] = UserPreferences(**pref_data)
        except Exception as e:
            logger.error(f"Failed to load users: {str(e)}")
    
    def _save_users(self):
        """Save users to file (for demo purposes)"""
        try:
            os.makedirs("./data", exist_ok=True)
            
            with open("./data/users.json", "w") as f:
                users_data = {uid: user.dict() for uid, user in self._users.items()}
                json.dump(users_data, f, indent=2)
                
            with open("./data/preferences.json", "w") as f:
                prefs_data = {uid: pref.dict() for uid, pref in self._user_preferences.items()}
                json.dump(prefs_data, f, indent=2)
        except Exception as e:
            logger.error(f"Failed to save users: {str(e)}")
    
    def create_user(self, username: str, email: str, wallet_address: str) -> User:
        """Create a new user"""
        user_id = str(uuid.uuid4())
        user = User(
            id=user_id,
            username=username,
            email=email,
            wallet_addresses=[wallet_address],
            created_at=int(time.time()),
            verified=False
        )
        
        # Create default preferences
        default_prefs = UserPreferences(
            user_id=user_id,
            game_preferences={
                "defi_kingdoms": {
                    "default_hero": None,
                    "auto_quest_stamina_threshold": 20,
                    "preferred_quest_types": ["mining", "fishing", "foraging"]
                }
            },
            notification_preferences={
                "email_notifications": True,
                "quest_completed_notifications": True,
                "low_resources_alerts": True
            },
            risk_tolerance="medium",
            automation_settings={
                "max_daily_transactions": 10,
                "max_gas_price_gwei": 50,
                "auto_compound_rewards": True
            }
        )
        
        self._users[user_id] = user
        self._user_preferences[user_id] = default_prefs
        
        # Save changes
        self._save_users()
        
        return user
    
    def get_user(self, user_id: str) -> Optional[User]:
        """Get a user by ID"""
        return self._users.get(user_id)
    
    def get_user_by_wallet(self, wallet_address: str) -> Optional[User]:
        """Get a user by wallet address"""
        for user in self._users.values():
            if wallet_address in user.wallet_addresses:
                return user
        return None
    
    def update_user(self, user_id: str, **kwargs) -> Optional[User]:
        """Update user information"""
        user = self.get_user(user_id)
        if not user:
            return None
            
        for key, value in kwargs.items():
            if hasattr(user, key):
                setattr(user, key, value)
        
        # Save changes
        self._save_users()
        
        return user
    
    def add_wallet_to_user(self, user_id: str, wallet_address: str) -> bool:
        """Add a wallet address to a user"""
        user = self.get_user(user_id)
        if not user:
            return False
            
        if wallet_address not in user.wallet_addresses:
            user.wallet_addresses.append(wallet_address)
            self._save_users()
            
        return True
    
    def get_user_preferences(self, user_id: str) -> Optional[UserPreferences]:
        """Get user preferences"""
        return self._user_preferences.get(user_id)
    
    def update_user_preferences(self, user_id: str, **kwargs) -> Optional[UserPreferences]:
        """Update user preferences"""
        prefs = self.get_user_preferences(user_id)
        if not prefs:
            return None
            
        for key, value in kwargs.items():
            if hasattr(prefs, key):
                setattr(prefs, key, value)
        
        # Save changes
        self._save_users()
        
        return prefs
    
    def create_session(self, user_id: str) -> str:
        """Create a new session for a user"""
        session_id = str(uuid.uuid4())
        self._sessions[session_id] = {
            "user_id": user_id,
            "created_at": int(time.time()),
            "expires_at": int(time.time() + 86400),  # 24 hour expiry
            "last_active": int(time.time())
        }
        return session_id
    
    def validate_session(self, session_id: str) -> Optional[str]:
        """Validate a session and return user_id if valid"""
        session = self._sessions.get(session_id)
        if not session:
            return None
            
        if session["expires_at"] < int(time.time()):
            # Session expired
            del self._sessions[session_id]
            return None
            
        # Update last active time
        session["last_active"] = int(time.time())
        return session["user_id"]
    
    def end_session(self, session_id: str) -> bool:
        """End a session"""
        if session_id in self._sessions:
            del self._sessions[session_id]
            return True
        return False
    
    def track_user_activity(self, user_id: str, activity_type: str, details: Dict[str, Any]) -> bool:
        """Track user activity"""
        try:
            activity = {
                "user_id": user_id,
                "activity_type": activity_type,
                "timestamp": int(time.time()),
                "details": details
            }
            
            # In production, log to database
            os.makedirs("./data/activity_logs", exist_ok=True)
            
            with open(f"./data/activity_logs/{user_id}.jsonl", "a") as f:
                f.write(json.dumps(activity) + "\n")
                
            return True
        except Exception as e:
            logger.error(f"Failed to track user activity: {str(e)}")
            return False
    
    def get_user_activity(self, user_id: str, limit: int = 50) -> List[Dict[str, Any]]:
        """Get user activity history"""
        activities = []
        try:
            log_file = f"./data/activity_logs/{user_id}.jsonl"
            if os.path.exists(log_file):
                with open(log_file, "r") as f:
                    for line in f:
                        activities.append(json.loads(line))
                        if len(activities) >= limit:
                            break
                            
            # Return most recent first
            return sorted(activities, key=lambda x: x["timestamp"], reverse=True)
        except Exception as e:
            logger.error(f"Failed to get user activity: {str(e)}")
            return []