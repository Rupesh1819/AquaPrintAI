from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.database import get_db
from app.dependencies import get_current_user
from app.models.user import UserProfile, UserRole
from app.services.admin.dashboard_service import get_dashboard_metrics
from app.services.admin.user_service import get_users, update_user_status, update_user_role
from app.services.admin.product_service import get_admin_products, delete_product
from app.services.admin.audit_service import get_audit_logs, log_admin_action
from app.services.admin.settings_service import get_settings, update_settings
from typing import Dict, Any

router = APIRouter()

def require_admin(current_user: UserProfile = Depends(get_current_user)):
    if current_user.role not in [UserRole.ADMIN, UserRole.SUPER_ADMIN]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Insufficient permissions. Admin access required."
        )
    return current_user

@router.get("/dashboard")
def dashboard(admin: UserProfile = Depends(require_admin), db: Session = Depends(get_db)):
    return get_dashboard_metrics(db)

@router.get("/users")
def list_users(skip: int = 0, limit: int = 50, search: str = None, admin: UserProfile = Depends(require_admin), db: Session = Depends(get_db)):
    return get_users(db, skip, limit, search)

@router.patch("/users/{id}/status")
def change_user_status(id: str, new_status: str, admin: UserProfile = Depends(require_admin), db: Session = Depends(get_db)):
    if update_user_status(db, id, new_status):
        return {"status": "success"}
    raise HTTPException(status_code=404, detail="User not found")

@router.patch("/users/{id}/role")
def change_user_role(id: str, role: str, admin: UserProfile = Depends(require_admin), db: Session = Depends(get_db)):
    if admin.role != UserRole.SUPER_ADMIN:
        raise HTTPException(status_code=403, detail="Only Super Admins can change roles")
    if update_user_role(db, id, role):
        return {"status": "success"}
    raise HTTPException(status_code=404, detail="User not found")

@router.get("/products")
def list_products(skip: int = 0, limit: int = 50, search: str = None, admin: UserProfile = Depends(require_admin), db: Session = Depends(get_db)):
    return get_admin_products(db, skip, limit, search)

@router.delete("/products/{id}")
def remove_product(id: str, admin: UserProfile = Depends(require_admin), db: Session = Depends(get_db)):
    if delete_product(db, id):
        log_admin_action(db, str(admin.id), "delete_product", "product", id)
        return {"status": "success"}
    raise HTTPException(status_code=404, detail="Product not found")

@router.get("/audit")
def list_audit_logs(skip: int = 0, limit: int = 50, admin: UserProfile = Depends(require_admin), db: Session = Depends(get_db)):
    return get_audit_logs(db, skip, limit)

@router.get("/settings")
def retrieve_settings(admin: UserProfile = Depends(require_admin), db: Session = Depends(get_db)):
    return get_settings(db)

@router.patch("/settings")
def modify_settings(settings: Dict[str, Any], admin: UserProfile = Depends(require_admin), db: Session = Depends(get_db)):
    log_admin_action(db, str(admin.id), "update_settings", "system_settings", details=settings)
    return update_settings(db, settings, str(admin.id))
