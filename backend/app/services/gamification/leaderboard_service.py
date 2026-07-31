from sqlalchemy.orm import Session
from app.models.gamification import LeaderboardEntry
from app.models.user import UserProfile

def get_leaderboard(db: Session, period: str = "all_time", limit: int = 50):
    entries = db.query(LeaderboardEntry, UserProfile).join(
        UserProfile, LeaderboardEntry.user_id == UserProfile.id
    ).filter(
        LeaderboardEntry.period == period
    ).order_by(LeaderboardEntry.total_xp.desc()).limit(limit).all()
    
    result = []
    for rank, (entry, profile) in enumerate(entries, 1):
        result.append({
            "rank": rank,
            "user_id": str(profile.id),
            "display_name": profile.full_name or "Anonymous Eco-Warrior",
            "avatar_url": profile.avatar_url,
            "total_xp": entry.total_xp,
            "level": 1 + (entry.total_xp // 500)
        })
    return result
