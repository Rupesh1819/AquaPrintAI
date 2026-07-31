from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.database import get_db
from app.dependencies import get_current_user
from app.models.user import UserProfile
from app.models.gamification import LeaderboardEntry
from app.services.gamification.challenge_service import get_active_challenges, join_challenge, progress_challenge
from app.services.gamification.badge_service import get_user_badges, award_badge, initialize_default_badges
from app.services.gamification.leaderboard_service import get_leaderboard
from app.services.gamification.xp_service import calculate_progress

router = APIRouter()

@router.on_event("startup")
def on_startup():
    from app.database import SessionLocal
    db = SessionLocal()
    try:
        initialize_default_badges(db)
    finally:
        db.close()

@router.get("/profile/progress")
def get_progress(current_user: UserProfile = Depends(get_current_user), db: Session = Depends(get_db)):
    # Calculate user's total xp
    entry = db.query(LeaderboardEntry).filter(
        LeaderboardEntry.user_id == current_user.id, 
        LeaderboardEntry.period == "all_time"
    ).first()
    total_xp = entry.total_xp if entry else 0
    return calculate_progress(total_xp)

@router.get("/challenges")
def list_challenges(current_user: UserProfile = Depends(get_current_user), db: Session = Depends(get_db)):
    return get_active_challenges(db, str(current_user.id))

@router.post("/challenges/{id}/join")
def join_a_challenge(id: str, current_user: UserProfile = Depends(get_current_user), db: Session = Depends(get_db)):
    return join_challenge(db, str(current_user.id), id)

@router.post("/challenges/{id}/complete")
def complete_challenge(id: str, current_user: UserProfile = Depends(get_current_user), db: Session = Depends(get_db)):
    # Fast track completion for demo/offline sync
    return progress_challenge(db, str(current_user.id), id, amount=999)

@router.get("/badges")
def list_badges(current_user: UserProfile = Depends(get_current_user), db: Session = Depends(get_db)):
    return get_user_badges(db, str(current_user.id))

@router.post("/badges/award")
def award_a_badge(badge_name: str, current_user: UserProfile = Depends(get_current_user), db: Session = Depends(get_db)):
    return award_badge(db, str(current_user.id), badge_name)

@router.get("/leaderboard")
def get_global_leaderboard(period: str = "all_time", db: Session = Depends(get_db)):
    return get_leaderboard(db, period)
