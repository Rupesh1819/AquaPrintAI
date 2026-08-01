from sqlalchemy.orm import Session
from app.models.user import UserProfile, UserRole

def get_users(db: Session, skip: int = 0, limit: int = 50, search: str = None):
    query = db.query(UserProfile)
    
    if search:
        query = query.filter(
            (UserProfile.email.ilike(f"%{search}%")) |
            (UserProfile.full_name.ilike(f"%{search}%"))
        )
        
    users = query.offset(skip).limit(limit).all()
    total = query.count()
    
    return {
        "items": [{
            "id": str(u.id),
            "email": u.email,
            "full_name": u.full_name,
            "role": u.role.value,
            "status": u.status.value,
            "created_at": u.created_at.isoformat()
        } for u in users],
        "total": total
    }

def update_user_status(db: Session, user_id: str, status: str):
    user = db.query(UserProfile).filter(UserProfile.id == user_id).first()
    if user:
        user.status = status
        db.commit()
        return True
    return False

def update_user_role(db: Session, user_id: str, role: str):
    user = db.query(UserProfile).filter(UserProfile.id == user_id).first()
    if user:
        user.role = UserRole(role)
        db.commit()
        return True
    return False
