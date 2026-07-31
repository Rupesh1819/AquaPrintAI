import uuid
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database import get_db
from app.dependencies import get_current_user
from app.models.user import UserProfile
from app.services.analytics import (
    get_dashboard_summary, 
    get_activity_trends, 
    get_dashboard_charts, 
    get_dynamic_insights,
    get_dashboard_recommendations
)
from app.models.product import ScanHistory
from app.models.user import UserGoal

router = APIRouter()

@router.get("/summary")
def get_summary(current_user: UserProfile = Depends(get_current_user), db: Session = Depends(get_db)):
    return get_dashboard_summary(db, current_user.id)

@router.get("/activity")
def get_activity(current_user: UserProfile = Depends(get_current_user), db: Session = Depends(get_db)):
    return get_activity_trends(db, current_user.id)

@router.get("/charts")
def get_charts(current_user: UserProfile = Depends(get_current_user), db: Session = Depends(get_db)):
    return get_dashboard_charts(db, current_user.id)

@router.get("/insights")
def get_insights(current_user: UserProfile = Depends(get_current_user), db: Session = Depends(get_db)):
    return get_dynamic_insights(db, current_user.id)

@router.get("/recommendations")
def get_recommendations(current_user: UserProfile = Depends(get_current_user), db: Session = Depends(get_db)):
    return get_dashboard_recommendations(db, current_user.id)

@router.get("/recent-scans")
def get_recent_scans(current_user: UserProfile = Depends(get_current_user), db: Session = Depends(get_db)):
    scans = db.query(ScanHistory).filter(
        ScanHistory.user_id == current_user.id,
        ScanHistory.success == True
    ).order_by(ScanHistory.created_at.desc()).limit(10).all()
    
    res = []
    for s in scans:
        if s.product:
            res.append({
                "id": str(s.id),
                "product": {
                    "id": str(s.product.id),
                    "name": s.product.name,
                    "water_footprint_liters": s.product.water_footprint_liters,
                    "sustainability_score": s.product.sustainability_score
                },
                "confidence_score": s.confidence_score,
                "recognition_type": s.recognition_type.value,
                "created_at": s.created_at.isoformat()
            })
    return res

@router.get("/goals")
def get_goals(current_user: UserProfile = Depends(get_current_user), db: Session = Depends(get_db)):
    goals = db.query(UserGoal).filter(UserGoal.user_id == current_user.id).all()
    
    # If no goals exist, create some defaults for demo purposes
    if not goals:
        import datetime
        now = datetime.datetime.now(datetime.timezone.utc)
        default_goals = [
            UserGoal(user_id=current_user.id, goal_type="daily", target_water_saved=10.0, start_date=now, end_date=now + datetime.timedelta(days=1)),
            UserGoal(user_id=current_user.id, goal_type="weekly", target_water_saved=50.0, start_date=now, end_date=now + datetime.timedelta(days=7)),
            UserGoal(user_id=current_user.id, goal_type="monthly", target_water_saved=200.0, start_date=now, end_date=now + datetime.timedelta(days=30))
        ]
        db.add_all(default_goals)
        db.commit()
        goals = default_goals
        
    res = []
    for g in goals:
        res.append({
            "id": str(g.id),
            "goal_type": g.goal_type.value,
            "target_water_saved": g.target_water_saved,
            "current_water_saved": g.current_water_saved,
            "achieved": g.achieved,
            "start_date": g.start_date.isoformat(),
            "end_date": g.end_date.isoformat()
        })
    return res

@router.get("/export")
def export_analytics(format: str = "json", current_user: UserProfile = Depends(get_current_user), db: Session = Depends(get_db)):
    # Placeholder for exporting analytics as PDF and CSV
    # Return 501 Not Implemented or mock data depending on format
    return {"message": f"Export in {format} format is scheduled for a future milestone."}
