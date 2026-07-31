from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.database import get_db
from app.dependencies import get_current_user
from app.models.user import UserProfile, UserSettings, AuthEvent, AuthEventType
from app.schemas.user import UserProfileSchema, UserProfileUpdate, UserSettingsUpdate, UserSettingsSchema

router = APIRouter(prefix="/auth", tags=["auth"])

@router.get("/profile", response_model=UserProfileSchema)
def get_profile(current_user: UserProfile = Depends(get_current_user), db: Session = Depends(get_db)):
    # The current_user is already fetched from the DB in the dependency
    # Let's attach settings manually or rely on relationship. We didn't setup relationship in SQLAlchemy, 
    # so we'll just fetch it.
    settings = db.query(UserSettings).filter(UserSettings.user_id == current_user.id).first()
    
    # We can return a dict or let Pydantic model_validate handle it by passing an object with a settings attribute.
    # We will attach it dynamically for the response schema.
    current_user.settings = settings
    return current_user

@router.patch("/profile", response_model=UserProfileSchema)
def update_profile(
    profile_update: UserProfileUpdate, 
    current_user: UserProfile = Depends(get_current_user), 
    db: Session = Depends(get_db)
):
    update_data = profile_update.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(current_user, key, value)
        
    db.commit()
    db.refresh(current_user)
    
    settings = db.query(UserSettings).filter(UserSettings.user_id == current_user.id).first()
    current_user.settings = settings
    return current_user

@router.patch("/settings", response_model=UserSettingsSchema)
def update_settings(
    settings_update: UserSettingsUpdate,
    current_user: UserProfile = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    settings = db.query(UserSettings).filter(UserSettings.user_id == current_user.id).first()
    if not settings:
        settings = UserSettings(user_id=current_user.id)
        db.add(settings)
        
    update_data = settings_update.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(settings, key, value)
        
    db.commit()
    db.refresh(settings)
    return settings

@router.post("/events", status_code=status.HTTP_201_CREATED)
def log_auth_event(
    event_type: AuthEventType,
    metadata_info: dict = None,
    current_user: UserProfile = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    event = AuthEvent(
        user_id=current_user.id,
        event_type=event_type,
        metadata_info=metadata_info or {}
    )
    db.add(event)
    db.commit()
    return {"message": "Event logged successfully"}
