import uuid
from sqlalchemy.orm import Session
from datetime import datetime, timezone
from app.models.user import UserProfile, UserGoal
from app.models.product import ScanHistory, Product, ProductAlternative
from app.services.analytics import get_dashboard_summary

def build_retrieval_augmented_context(db: Session, user_id: uuid.UUID) -> str:
    """Builds a condensed string context for the Gemini model from user DB data."""
    
    # 1. User Profile & Summary
    summary = get_dashboard_summary(db, user_id)
    profile = db.query(UserProfile).filter(UserProfile.id == user_id).first()
    
    # 2. Goals
    goals = db.query(UserGoal).filter(UserGoal.user_id == user_id, UserGoal.achieved == False).all()
    goals_text = "\n".join([f"- {g.goal_type.value}: {g.current_water_saved}/{g.target_water_saved}L saved" for g in goals]) if goals else "- No active goals"
    
    # 3. Recent Scans (last 5)
    recent_scans = db.query(ScanHistory).filter(
        ScanHistory.user_id == user_id, ScanHistory.success == True
    ).order_by(ScanHistory.created_at.desc()).limit(5).all()
    
    scans_text = []
    product_ids = []
    for s in recent_scans:
        if s.product:
            product_ids.append(s.product_id)
            scans_text.append(f"- {s.product.name} (Footprint: {s.product.water_footprint_liters}L, Eco Score: {s.product.sustainability_score})")
    
    scans_str = "\n".join(scans_text) if scans_text else "- No recent scans"
    
    # 4. Product Alternatives for recent scans
    alts_text = []
    if product_ids:
        alts = db.query(ProductAlternative).filter(ProductAlternative.source_product_id.in_(product_ids)).limit(3).all()
        for alt in alts:
            source = db.query(Product).filter(Product.id == alt.source_product_id).first()
            target = db.query(Product).filter(Product.id == alt.target_product_id).first()
            if source and target:
                alts_text.append(f"- Instead of {source.name}, recommend {target.name} (Footprint: {target.water_footprint_liters}L) because: {alt.reason}")
                
    alts_str = "\n".join(alts_text) if alts_text else "- No active alternatives available"
    
    # Construct Context String
    context = f"""
=== USER CONTEXT ===
Name: {profile.full_name if profile else 'User'}
Eco Level: {summary['eco_level']} ({summary['badge']})
Current Streak: {summary['current_streak']} days
Total Products Scanned: {summary['total_scanned']}
Estimated Lifetime Water Saved: {summary['estimated_water_saved']}L

=== USER GOALS ===
{goals_text}

=== RECENT SCAN HISTORY ===
{scans_str}

=== AVAILABLE SUSTAINABLE SWAPS ===
{alts_str}
"""
    return context.strip()
