from sqlalchemy.orm import Session
from app.models.gamification import Badge, UserBadge
from datetime import datetime, timezone
import uuid

def initialize_default_badges(db: Session):
    default_badges = [
        {"name": "First Scan", "description": "Scan your very first product.", "category": "Scanner", "icon_url": "scan_icon"},
        {"name": "Eco Explorer", "description": "View 10 different products.", "category": "Learning", "icon_url": "explorer_icon"},
        {"name": "Water Saver", "description": "Choose a product that saves water.", "category": "Sustainability", "icon_url": "water_icon"},
        {"name": "AI Learner", "description": "Ask the AI Assistant a question.", "category": "AI", "icon_url": "ai_icon"},
        {"name": "Comparison Expert", "description": "Use the Comparison Engine.", "category": "Comparison", "icon_url": "compare_icon"}
    ]
    
    from sqlalchemy.exc import IntegrityError
    for b in default_badges:
        exists = db.query(Badge).filter(Badge.name == b["name"]).first()
        if not exists:
            badge = Badge(**b)
            db.add(badge)
            try:
                db.commit()
            except IntegrityError:
                db.rollback()

def get_user_badges(db: Session, user_id: str):
    # Returns all badges, marking which ones the user has unlocked
    all_badges = db.query(Badge).all()
    user_badges = {ub.badge_id: ub for ub in db.query(UserBadge).filter(UserBadge.user_id == user_id).all()}
    
    result = []
    for b in all_badges:
        unlocked = b.id in user_badges
        result.append({
            "id": str(b.id),
            "name": b.name,
            "description": b.description,
            "category": b.category,
            "icon_url": b.icon_url,
            "is_unlocked": unlocked,
            "unlocked_at": user_badges[b.id].unlocked_at.isoformat() if unlocked else None
        })
    return result

def award_badge(db: Session, user_id: str, badge_name: str):
    badge = db.query(Badge).filter(Badge.name == badge_name).first()
    if not badge:
        return {"status": "not_found"}
        
    exists = db.query(UserBadge).filter(UserBadge.user_id == user_id, UserBadge.badge_id == badge.id).first()
    if not exists:
        ub = UserBadge(user_id=user_id, badge_id=badge.id)
        db.add(ub)
        db.commit()
        return {"status": "awarded", "badge": badge.name}
    return {"status": "already_owned"}
