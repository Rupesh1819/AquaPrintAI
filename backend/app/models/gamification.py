from sqlalchemy import Column, String, Integer, DateTime, ForeignKey, Boolean, Enum
from sqlalchemy.dialects.postgresql import UUID
from datetime import datetime, timezone
import uuid
import enum
from app.database import Base

class ChallengeDifficulty(str, enum.Enum):
    EASY = "easy"
    MEDIUM = "medium"
    HARD = "hard"

class Challenge(Base):
    __tablename__ = "challenges"
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    title = Column(String, nullable=False)
    description = Column(String, nullable=False)
    target_count = Column(Integer, nullable=False) # e.g., 5 products
    reward_xp = Column(Integer, nullable=False)
    difficulty = Column(Enum(ChallengeDifficulty), default=ChallengeDifficulty.EASY)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

class ChallengeParticipation(Base):
    __tablename__ = "challenge_participations"
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("user_profiles.id", ondelete="CASCADE"), nullable=False)
    challenge_id = Column(UUID(as_uuid=True), ForeignKey("challenges.id", ondelete="CASCADE"), nullable=False)
    progress_count = Column(Integer, default=0)
    is_completed = Column(Boolean, default=False)
    completed_at = Column(DateTime, nullable=True)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

class Badge(Base):
    __tablename__ = "badges"
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    name = Column(String, nullable=False, unique=True)
    description = Column(String, nullable=False)
    icon_url = Column(String, nullable=True)
    category = Column(String, nullable=False) # e.g., Scanner, AI, Community

class UserBadge(Base):
    __tablename__ = "user_badges"
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("user_profiles.id", ondelete="CASCADE"), nullable=False)
    badge_id = Column(UUID(as_uuid=True), ForeignKey("badges.id", ondelete="CASCADE"), nullable=False)
    unlocked_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

class XPTransaction(Base):
    __tablename__ = "xp_transactions"
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("user_profiles.id", ondelete="CASCADE"), nullable=False)
    amount = Column(Integer, nullable=False)
    source = Column(String, nullable=False) # e.g., "challenge_completion", "daily_login"
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

class LeaderboardEntry(Base):
    __tablename__ = "leaderboard_entries"
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("user_profiles.id", ondelete="CASCADE"), nullable=False)
    period = Column(String, nullable=False) # 'weekly', 'monthly', 'all_time'
    total_xp = Column(Integer, default=0)
    water_saved_liters = Column(Integer, default=0)
    updated_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))
