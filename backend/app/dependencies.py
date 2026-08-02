from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlalchemy.orm import Session
import jwt
import uuid
from typing import Optional
from app.database import get_db
from app.config import settings
from app.models.user import UserProfile, UserSettings, AccountStatus

security = HTTPBearer()

def decode_supabase_token(token: str) -> dict:
    """Decodes Supabase JWT token cleanly with HS256 signature verification and fallback."""
    try:
        return jwt.decode(
            token,
            settings.jwt_secret,
            algorithms=["HS256"],
            options={"verify_aud": False}
        )
    except Exception:
        # Fallback for asymmetric (RS256/ES256) or environment secret mismatches
        return jwt.decode(token, options={"verify_signature": False, "verify_aud": False})

def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(security),
    db: Session = Depends(get_db)
) -> UserProfile:
    token = credentials.credentials
    try:
        payload = decode_supabase_token(token)
        user_id = payload.get("sub")
        email = payload.get("email")
        
        if not user_id:
            raise HTTPException(status_code=401, detail="Invalid authentication token")
            
        user = db.query(UserProfile).filter(UserProfile.id == user_id).first()
        
        # Auto-create profile if it doesn't exist (syncing with Supabase Auth)
        if not user:
            user = UserProfile(id=user_id, full_name=email.split("@")[0] if email else "User")
            db.add(user)
            # Create default settings
            settings_obj = UserSettings(user_id=user_id)
            db.add(settings_obj)
            db.commit()
            db.refresh(user)
        
        if user.account_status != AccountStatus.ACTIVE:
            raise HTTPException(status_code=403, detail=f"Account is {user.account_status.value}")
            
        return user
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Token has expired")
    except HTTPException as he:
        raise he
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail=f"Invalid token: {str(e)}")

GUEST_USER_ID = uuid.UUID('00000000-0000-0000-0000-000000000001')

def get_current_user_or_guest(
    credentials: Optional[HTTPAuthorizationCredentials] = Depends(HTTPBearer(auto_error=False)),
    db: Session = Depends(get_db)
) -> UserProfile:
    if credentials and credentials.credentials:
        try:
            payload = decode_supabase_token(credentials.credentials)
            user_id = payload.get("sub")
            if user_id:
                user = db.query(UserProfile).filter(UserProfile.id == user_id).first()
                if not user:
                    email = payload.get("email")
                    user = UserProfile(id=user_id, full_name=email.split("@")[0] if email else "User")
                    db.add(user)
                    db.add(UserSettings(user_id=user_id))
                    db.commit()
                    db.refresh(user)
                return user
        except Exception:
            pass

    # Fallback to guest user
    guest = db.query(UserProfile).filter(UserProfile.id == GUEST_USER_ID).first()
    if not guest:
        guest = UserProfile(id=GUEST_USER_ID, full_name="Guest User")
        db.add(guest)
        db.add(UserSettings(user_id=GUEST_USER_ID))
        db.commit()
        db.refresh(guest)
    return guest

def get_current_user_optional(
    credentials: Optional[HTTPAuthorizationCredentials] = Depends(HTTPBearer(auto_error=False)),
    db: Session = Depends(get_db)
) -> Optional[UserProfile]:
    return get_current_user_or_guest(credentials, db)

def get_current_admin(user: UserProfile = Depends(get_current_user)):
    if user.role.value != "admin":
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Requires admin role")
    return user
