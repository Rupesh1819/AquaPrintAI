from pydantic import BaseModel, ConfigDict
from uuid import UUID
from datetime import datetime
from typing import Optional, Any
from app.models.user import UserRole, AccountStatus

class UserSettingsSchema(BaseModel):
    theme: str
    preferred_language: str
    daily_hydration_goal_ml: int
    dietary_preference: Optional[str]

    model_config = ConfigDict(from_attributes=True)

class UserProfileSchema(BaseModel):
    id: UUID
    full_name: Optional[str]
    avatar_url: Optional[str]
    region_code: Optional[str]
    country: Optional[str]
    language: str
    level: int
    total_points: int
    water_saving_goal: int
    role: UserRole
    account_status: AccountStatus
    notification_preferences: Any
    joined_date: datetime
    last_login: Optional[datetime]
    
    settings: Optional[UserSettingsSchema] = None

    model_config = ConfigDict(from_attributes=True)

class UserProfileUpdate(BaseModel):
    full_name: Optional[str] = None
    avatar_url: Optional[str] = None
    region_code: Optional[str] = None
    country: Optional[str] = None
    language: Optional[str] = None
    water_saving_goal: Optional[int] = None
    notification_preferences: Optional[Any] = None

class UserSettingsUpdate(BaseModel):
    theme: Optional[str] = None
    preferred_language: Optional[str] = None
    daily_hydration_goal_ml: Optional[int] = None
    dietary_preference: Optional[str] = None
