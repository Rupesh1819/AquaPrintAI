from sqlalchemy.orm import Session
from sqlalchemy import func
from app.models.user import UserProfile
from app.models.product import Product
from app.models.product import ScanHistory
from app.models.ai import AIConversation

def get_dashboard_metrics(db: Session):
    total_users = db.query(UserProfile).count()
    active_users = db.query(UserProfile).filter(UserProfile.status == "active").count()
    
    total_products = db.query(Product).count()
    
    total_scans = db.query(ScanHistory).count()
    total_ai_requests = db.query(AIConversation).count()
    
    return {
        "total_users": total_users,
        "active_users": active_users,
        "total_products": total_products,
        "total_scans": total_scans,
        "ai_requests": total_ai_requests,
        "system_health": "Healthy",
        "average_sustainability_score": 75 # placeholder
    }
