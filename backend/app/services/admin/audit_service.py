from sqlalchemy.orm import Session
from app.models.admin import AdminActionLog

def log_admin_action(db: Session, admin_id: str, action: str, target_resource: str = None, target_id: str = None, details: dict = None):
    log = AdminActionLog(
        admin_id=admin_id,
        action=action,
        target_resource=target_resource,
        target_id=target_id,
        details=details
    )
    db.add(log)
    db.commit()
    return log

def get_audit_logs(db: Session, skip: int = 0, limit: int = 50):
    logs = db.query(AdminActionLog).order_by(AdminActionLog.created_at.desc()).offset(skip).limit(limit).all()
    total = db.query(AdminActionLog).count()
    return {
        "items": [{
            "id": str(log.id),
            "admin_id": str(log.admin_id) if log.admin_id else None,
            "action": log.action,
            "target_resource": log.target_resource,
            "target_id": log.target_id,
            "details": log.details,
            "created_at": log.created_at.isoformat()
        } for log in logs],
        "total": total
    }
