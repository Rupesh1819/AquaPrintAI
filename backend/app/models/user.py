from sqlalchemy import Column, String, Integer, Float, DateTime, Boolean, ForeignKey, Enum, JSON
from sqlalchemy.dialects.postgresql import UUID
import uuid
import enum
from datetime import datetime, timezone
from app.database import Base

class UserRole(str, enum.Enum):
    SUPER_ADMIN = "super_admin"
    ADMIN = "admin"
    MODERATOR = "moderator"
    USER = "user"

class AccountStatus(str, enum.Enum):
    ACTIVE = "active"
    SUSPENDED = "suspended"
    BANNED = "banned"

class AuthEventType(str, enum.Enum):
    SIGN_UP = "sign_up"
    SIGN_IN = "sign_in"
    SIGN_OUT = "sign_out"
    PASSWORD_RESET = "password_reset"
    EMAIL_VERIFICATION = "email_verification"
    GUEST_LOGIN = "guest_login"
    GOOGLE_LOGIN = "google_login"

class UserProfile(Base):
    __tablename__ = "user_profiles"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4, comment="References Supabase auth.users")
    full_name = Column(String, nullable=True)
    avatar_url = Column(String, nullable=True)
    region_code = Column(String, nullable=True)
    country = Column(String, nullable=True)
    language = Column(String, default="en")
    
    level = Column(Integer, default=1)
    total_points = Column(Integer, default=0)
    current_streak = Column(Integer, default=0)
    sustainability_badge = Column(String, nullable=True)
    water_saving_goal = Column(Integer, default=0, comment="Daily goal in ml")
    
    role = Column(Enum(UserRole), default=UserRole.USER)
    account_status = Column(Enum(AccountStatus), default=AccountStatus.ACTIVE)
    notification_preferences = Column(JSON, default=dict)
    
    joined_date = Column(DateTime, default=lambda: datetime.now(timezone.utc))
    last_login = Column(DateTime, nullable=True)
    updated_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))

class UserSettings(Base):
    __tablename__ = "user_settings"

    user_id = Column(UUID(as_uuid=True), ForeignKey("user_profiles.id", ondelete="CASCADE"), primary_key=True)
    theme = Column(String, default="system")
    preferred_language = Column(String, default="en")
    daily_hydration_goal_ml = Column(Integer, default=2000)
    dietary_preference = Column(String, nullable=True)
    avatar_url = Column(String, nullable=True)
    role = Column(Enum(UserRole), default=UserRole.USER, nullable=False)
    updated_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))

class AuthEvent(Base):
    __tablename__ = "auth_events"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("user_profiles.id", ondelete="CASCADE"), nullable=False)
    event_type = Column(Enum(AuthEventType), nullable=False)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
    metadata_info = Column(JSON, default=dict)

class GoalType(str, enum.Enum):
    DAILY = "daily"
    WEEKLY = "weekly"
    MONTHLY = "monthly"

class UserGoal(Base):
    __tablename__ = "user_goals"
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("user_profiles.id", ondelete="CASCADE"), nullable=False)
    goal_type = Column(Enum(GoalType), nullable=False)
    target_water_saved = Column(Float, nullable=False, default=100.0) # in liters
    current_water_saved = Column(Float, nullable=False, default=0.0)
    start_date = Column(DateTime, nullable=False)
    end_date = Column(DateTime, nullable=False)
    achieved = Column(Boolean, default=False)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
    updated_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))

class UserFavorite(Base):
    __tablename__ = "user_favorites"
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("user_profiles.id", ondelete="CASCADE"), nullable=False)
    product_id = Column(UUID(as_uuid=True), ForeignKey("products.id", ondelete="CASCADE"), nullable=False)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
