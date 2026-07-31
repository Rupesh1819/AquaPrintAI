from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlalchemy.orm import Session
import jwt
from typing import Optional
from app.database import get_db
from app.config import settings
from app.models.user import UserProfile, UserSettings, AccountStatus

security = HTTPBearer()

def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(security),
    db: Session = Depends(get_db)
) -> UserProfile:
    token = credentials.credentials
    try:
        # Supabase signs with HS256 using the JWT_SECRET
        payload = jwt.decode(
            token, 
            settings.jwt_secret, 
            algorithms=["HS256"], 
            options={"verify_aud": False}
        )
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
    except jwt.InvalidTokenError as e:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail=f"Invalid token: {str(e)}")

def get_current_admin(user: UserProfile = Depends(get_current_user)):
    if user.role.value != "admin":
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Requires admin role")
    return user
