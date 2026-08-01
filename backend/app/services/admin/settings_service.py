from sqlalchemy.orm import Session
from app.models.admin import SystemSettings
from typing import Dict, Any

def get_settings(db: Session) -> Dict[str, Any]:
    settings = db.query(SystemSettings).all()
    # Return as key-value pairs
    return {s.key: s.value for s in settings}

def update_settings(db: Session, settings_dict: Dict[str, Any], admin_id: str):
    for k, v in settings_dict.items():
        setting = db.query(SystemSettings).filter(SystemSettings.key == k).first()
        if not setting:
            setting = SystemSettings(key=k, value=v, updated_by=admin_id)
            db.add(setting)
        else:
            setting.value = v
            setting.updated_by = admin_id
    db.commit()
    return get_settings(db)
