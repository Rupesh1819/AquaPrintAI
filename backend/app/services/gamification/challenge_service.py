from sqlalchemy.orm import Session
from app.models.gamification import Challenge, ChallengeParticipation
from app.services.gamification.xp_service import award_xp
from datetime import datetime, timezone
import uuid

def get_active_challenges(db: Session, user_id: str):
    challenges = db.query(Challenge).filter(Challenge.is_active == True).all()
    
    result = []
    for c in challenges:
        part = db.query(ChallengeParticipation).filter(
            ChallengeParticipation.challenge_id == c.id,
            ChallengeParticipation.user_id == user_id
        ).first()
        
        result.append({
            "id": str(c.id),
            "title": c.title,
            "description": c.description,
            "target_count": c.target_count,
            "reward_xp": c.reward_xp,
            "difficulty": c.difficulty.value,
            "progress_count": part.progress_count if part else 0,
            "is_completed": part.is_completed if part else False,
            "is_joined": part is not None
        })
    return result

def join_challenge(db: Session, user_id: str, challenge_id: str):
    part = db.query(ChallengeParticipation).filter(
        ChallengeParticipation.challenge_id == challenge_id,
        ChallengeParticipation.user_id == user_id
    ).first()
    
    if not part:
        part = ChallengeParticipation(user_id=user_id, challenge_id=challenge_id)
        db.add(part)
        db.commit()
    return {"status": "success"}

def progress_challenge(db: Session, user_id: str, challenge_id: str, amount: int = 1):
    part = db.query(ChallengeParticipation).filter(
        ChallengeParticipation.challenge_id == challenge_id,
        ChallengeParticipation.user_id == user_id
    ).first()
    
    if not part or part.is_completed:
        return {"status": "ignored"}
        
    challenge = db.query(Challenge).get(challenge_id)
    if not challenge:
        return {"status": "not_found"}
        
    part.progress_count += amount
    
    if part.progress_count >= challenge.target_count:
        part.progress_count = challenge.target_count
        part.is_completed = True
        part.completed_at = datetime.now(timezone.utc)
        
        # Award XP automatically
        award_xp(db, user_id, challenge.reward_xp, f"completed_challenge_{challenge.title}")
        
    db.commit()
    return {"status": "success", "is_completed": part.is_completed, "progress": part.progress_count}
