from fastapi import APIRouter, Depends, HTTPException, Body
from sqlalchemy.orm import Session
from app.database import get_db
from app.dependencies import get_current_user
from app.models.user import UserProfile
from app.models.comparison import ComparisonSession
from app.services.comparison.comparison_service import get_comparison_data
from app.services.comparison.savings_calculator import calculate_water_savings
from app.services.comparison.comparison_ai import stream_comparison_summary
from sse_starlette.sse import EventSourceResponse
from typing import List
import uuid

router = APIRouter()

@router.post("/compare")
def compare_products(
    product_ids: List[str] = Body(..., embed=True),
    db: Session = Depends(get_db)
):
    """Generate comparison data for 2 to 4 products."""
    data = get_comparison_data(db, product_ids)
    
    # Calculate savings if there's a winner
    winner_id = data["winner_id"]
    winner_water = 0
    others_water = []
    
    for p in data["products"]:
        if p["id"] == winner_id:
            winner_water = p.get("total_water_liters", 0)
        else:
            others_water.append(p.get("total_water_liters", 0))
            
    avg_others = sum(others_water) / len(others_water) if others_water else 0
    savings = calculate_water_savings(winner_water, avg_others)
    
    data["savings"] = savings
    return data

@router.post("/save")
def save_comparison_session(
    product_ids: List[str] = Body(...),
    winner_id: str = Body(...),
    savings: float = Body(...),
    current_user: UserProfile = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Save the comparison to history."""
    try:
        w_id = uuid.UUID(winner_id) if winner_id else None
    except ValueError:
        w_id = None
        
    session = ComparisonSession(
        user_id=current_user.id,
        compared_products=product_ids,
        selected_winner=w_id,
        estimated_water_saved=savings
    )
    db.add(session)
    db.commit()
    db.refresh(session)
    return {"status": "success", "session_id": str(session.id)}

@router.get("/history")
def get_comparison_history(current_user: UserProfile = Depends(get_current_user), db: Session = Depends(get_db)):
    """Retrieve user comparison history."""
    sessions = db.query(ComparisonSession).filter(ComparisonSession.user_id == current_user.id).order_by(ComparisonSession.created_at.desc()).all()
    return [{
        "id": str(s.id),
        "products": s.compared_products,
        "winner_id": str(s.selected_winner) if s.selected_winner else None,
        "water_saved": s.estimated_water_saved,
        "date": s.created_at.isoformat()
    } for s in sessions]

@router.post("/ai-summary")
def get_ai_summary(
    comparison_data: dict = Body(...),
):
    """Stream an AI summary based on comparison JSON."""
    return EventSourceResponse(stream_comparison_summary(comparison_data))
