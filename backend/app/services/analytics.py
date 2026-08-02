from sqlalchemy.orm import Session
from sqlalchemy import func, text
import uuid
from datetime import datetime, timedelta, timezone
from typing import Dict, Any, List

from app.models.user import UserProfile, UserGoal
from app.models.product import ScanHistory, Product, ProductCategory, Manufacturer, ProductAlternative

def get_dashboard_summary(db: Session, user_id: uuid.UUID) -> Dict[str, Any]:
    # Total Scanned
    total_scans = db.query(ScanHistory).filter(ScanHistory.user_id == user_id, ScanHistory.success == True).count()
    
    # Calculate water saved based on scanned products against a hypothetical baseline (e.g., 50L avg)
    scans = db.query(ScanHistory).filter(ScanHistory.user_id == user_id, ScanHistory.success == True).all()
    estimated_water_saved = sum(
        max(0, 50.0 - (scan.product.water_footprint_liters or 50.0)) 
        for scan in scans if scan.product
    )
    
    # Average Sustainability Score
    from app.models.product import SustainabilityScore
    avg_score_query = db.query(func.avg(SustainabilityScore.overall_score)).join(
        Product, Product.id == SustainabilityScore.product_id
    ).join(
        ScanHistory, ScanHistory.product_id == Product.id
    ).filter(ScanHistory.user_id == user_id, ScanHistory.success == True).scalar()
    
    avg_score = float(avg_score_query) if avg_score_query is not None else 0.0
    
    # User Profile logic
    profile = db.query(UserProfile).filter(UserProfile.id == user_id).first()
    
    return {
        "total_scanned": total_scans,
        "estimated_water_saved": round(estimated_water_saved, 2),
        "average_sustainability_score": round(avg_score, 1),
        "current_streak": profile.current_streak if profile else 0,
        "eco_level": profile.level if profile else 1,
        "xp": profile.total_points if profile else 0,
        "badge": profile.sustainability_badge if profile else "Newcomer",
        "first_name": profile.full_name.split()[0] if profile and profile.full_name else "Eco Warrior"
    }

def get_activity_trends(db: Session, user_id: uuid.UUID) -> Dict[str, List[Any]]:
    # Weekly activity
    now = datetime.now(timezone.utc)
    week_ago = now - timedelta(days=7)
    
    scans = db.query(ScanHistory).filter(
        ScanHistory.user_id == user_id, 
        ScanHistory.created_at >= week_ago,
        ScanHistory.success == True
    ).all()
    
    # Group by day
    days = { (now - timedelta(days=i)).strftime('%Y-%m-%d'): 0 for i in range(7) }
    for scan in scans:
        day_str = scan.created_at.strftime('%Y-%m-%d')
        if day_str in days:
            days[day_str] += 1
            
    weekly_activity = [{"date": k, "scans": v} for k, v in sorted(days.items())]
    
    return {
        "weekly_activity": weekly_activity
    }

def get_dashboard_charts(db: Session, user_id: uuid.UUID) -> Dict[str, Any]:
    # Category Distribution
    category_counts = db.query(
        ProductCategory.name, func.count(ScanHistory.id).label('count')
    ).join(Product, Product.category_id == ProductCategory.id)\
     .join(ScanHistory, ScanHistory.product_id == Product.id)\
     .filter(ScanHistory.user_id == user_id, ScanHistory.success == True)\
     .group_by(ProductCategory.name).all()
     
    cat_distribution = [{"name": r[0], "value": r[1]} for r in category_counts]
    
    # Manufacturer Distribution
    mfg_counts = db.query(
        Manufacturer.name, func.count(ScanHistory.id).label('count')
    ).join(Product, Product.manufacturer_id == Manufacturer.id)\
     .join(ScanHistory, ScanHistory.product_id == Product.id)\
     .filter(ScanHistory.user_id == user_id, ScanHistory.success == True)\
     .group_by(Manufacturer.name).all()
     
    mfg_distribution = [{"name": r[0], "value": r[1]} for r in mfg_counts]
    
    return {
        "categories": cat_distribution,
        "manufacturers": mfg_distribution
    }

def get_dynamic_insights(db: Session, user_id: uuid.UUID) -> List[Dict[str, str]]:
    insights = []
    
    summary = get_dashboard_summary(db, user_id)
    charts = get_dashboard_charts(db, user_id)
    
    if summary["total_scanned"] == 0:
        insights.append({
            "type": "info",
            "title": "Welcome to AquaPrint AI!",
            "message": "Scan your first product to see its water footprint and begin tracking your impact."
        })
        return insights
        
    if summary["current_streak"] >= 3:
        insights.append({
            "type": "success",
            "title": "On a Roll!",
            "message": f"You're on a {summary['current_streak']}-day scanning streak. Keep it up!"
        })
        
    if charts["categories"]:
        top_cat = max(charts["categories"], key=lambda x: x["value"])
        insights.append({
            "type": "insight",
            "title": "Category Insight",
            "message": f"{top_cat['name']} products make up the largest share of your recent scans."
        })
        
    return insights

def get_dashboard_recommendations(db: Session, user_id: uuid.UUID) -> List[Any]:
    # Find recent scans with alternatives
    recent_scans = db.query(ScanHistory).filter(
        ScanHistory.user_id == user_id, ScanHistory.success == True
    ).order_by(ScanHistory.created_at.desc()).limit(10).all()
    
    recent_product_ids = [s.product_id for s in recent_scans if s.product_id]
    
    if not recent_product_ids:
        return []
        
    alternatives = db.query(ProductAlternative).filter(
        ProductAlternative.product_id.in_(recent_product_ids)
    ).limit(5).all()
    
    recs = []
    for alt in alternatives:
        target = db.query(Product).filter(Product.id == alt.alternative_product_id).first()
        source = db.query(Product).filter(Product.id == alt.product_id).first()
        if target and source:
            recs.append({
                "source_product": {"id": str(source.id), "name": source.name},
                "recommended_product": {"id": str(target.id), "name": target.name},
                "reason": alt.reason,
            })
            
    return recs
