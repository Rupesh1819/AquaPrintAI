from sqlalchemy.orm import Session
from app.models.gamification import XPTransaction, LeaderboardEntry
from datetime import datetime, timezone

def calculate_level(total_xp: int) -> int:
    """Simple curve: Level = 1 + (XP / 500)"""
    return 1 + (total_xp // 500)

def calculate_progress(total_xp: int) -> dict:
    level = calculate_level(total_xp)
    current_level_xp = total_xp % 500
    return {
        "level": level,
        "current_xp": current_level_xp,
        "next_level_xp": 500,
        "progress_percentage": round((current_level_xp / 500) * 100)
    }

def award_xp(db: Session, user_id: str, amount: int, source: str) -> dict:
    # 1. Create transaction
    tx = XPTransaction(user_id=user_id, amount=amount, source=source)
    db.add(tx)
    
    # 2. Update LeaderboardEntries (All Time)
    entry = db.query(LeaderboardEntry).filter(
        LeaderboardEntry.user_id == user_id, 
        LeaderboardEntry.period == "all_time"
    ).first()
    
    if not entry:
        entry = LeaderboardEntry(user_id=user_id, period="all_time", total_xp=0)
        db.add(entry)
        
    entry.total_xp += amount
    db.commit()
    
    return calculate_progress(entry.total_xp)
