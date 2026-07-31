from fastapi import APIRouter, Depends, HTTPException, Body
from sqlalchemy.orm import Session
from app.database import get_db
from app.dependencies import get_current_user
from app.models.user import UserProfile
from app.models.ai import AIConversation, AIMessage
from sse_starlette.sse import EventSourceResponse
from app.services.ai.gemini_service import stream_chat_response
import uuid

router = APIRouter()

@router.get("/history")
def get_conversations(current_user: UserProfile = Depends(get_current_user), db: Session = Depends(get_db)):
    conversations = db.query(AIConversation).filter(AIConversation.user_id == current_user.id).order_by(AIConversation.updated_at.desc()).all()
    return [{"id": str(c.id), "title": c.title, "updated_at": c.updated_at.isoformat()} for c in conversations]

@router.get("/history/{conversation_id}")
def get_messages(conversation_id: uuid.UUID, current_user: UserProfile = Depends(get_current_user), db: Session = Depends(get_db)):
    conv = db.query(AIConversation).filter(AIConversation.id == conversation_id, AIConversation.user_id == current_user.id).first()
    if not conv:
        raise HTTPException(status_code=404, detail="Conversation not found")
        
    messages = db.query(AIMessage).filter(AIMessage.conversation_id == conversation_id).order_by(AIMessage.timestamp.asc()).all()
    return [{"id": str(m.id), "role": m.role, "content": m.content, "timestamp": m.timestamp.isoformat()} for m in messages]

@router.post("/chat")
def chat(
    message: str = Body(..., embed=True),
    conversation_id: str = Body(None, embed=True),
    current_user: UserProfile = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    if not conversation_id:
        # Create new conversation
        conv = AIConversation(user_id=current_user.id, title=message[:30] + "...")
        db.add(conv)
        db.commit()
        db.refresh(conv)
        conv_id = conv.id
    else:
        try:
            conv_id = uuid.UUID(conversation_id)
            conv = db.query(AIConversation).filter(AIConversation.id == conv_id, AIConversation.user_id == current_user.id).first()
            if not conv:
                raise HTTPException(status_code=404, detail="Conversation not found")
        except ValueError:
            raise HTTPException(status_code=400, detail="Invalid conversation ID format")

    # Save user message
    user_msg = AIMessage(conversation_id=conv_id, role="user", content=message)
    db.add(user_msg)
    
    # Retrieve history for context window (last 10 messages)
    history = db.query(AIMessage).filter(AIMessage.conversation_id == conv_id).order_by(AIMessage.timestamp.asc()).all()[-10:]
    
    db.commit()

    # The actual saving of the model's message happens on the frontend completing, 
    # but for true robustness we'd save it here in a background task after the stream ends.
    # We will simulate stream returning for now.
    
    return EventSourceResponse(stream_chat_response(db, current_user.id, conv_id, message, history))
