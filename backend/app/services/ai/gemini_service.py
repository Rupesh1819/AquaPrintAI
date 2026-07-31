import google.generativeai as genai
import os
import json
from typing import AsyncGenerator
from fastapi import HTTPException
from app.config import settings
from app.services.ai.context_builder import build_retrieval_augmented_context
from app.services.ai.prompt_builder import build_system_prompt
from app.models.ai import AIMessage
from sqlalchemy.orm import Session

# Configure Gemini (using API key from environment or settings)
GEMINI_API_KEY = getattr(settings, "gemini_api_key", os.environ.get("GEMINI_API_KEY"))
if GEMINI_API_KEY:
    genai.configure(api_key=GEMINI_API_KEY)
else:
    # Dummy configuration for testing without key
    genai.configure(api_key="dummy_key_for_testing")

def get_chat_model(system_instruction: str):
    return genai.GenerativeModel(
        model_name="gemini-1.5-flash",
        system_instruction=system_instruction
    )

async def stream_chat_response(db: Session, user_id, conversation_id, user_message: str, history: list) -> AsyncGenerator[str, None]:
    try:
        # Build Context
        context = build_retrieval_augmented_context(db, user_id)
        system_prompt = build_system_prompt(context)
        
        model = get_chat_model(system_prompt)
        
        # Convert DB history to Gemini history format
        gemini_history = []
        for msg in history:
            role = "user" if msg.role == "user" else "model"
            gemini_history.append({"role": role, "parts": [msg.content]})
            
        chat = model.start_chat(history=gemini_history)
        
        # We simulate SSE format: data: <content>\n\n
        if GEMINI_API_KEY and GEMINI_API_KEY != "dummy_key_for_testing":
            response = chat.send_message(user_message, stream=True)
            for chunk in response:
                if chunk.text:
                    # SSE format
                    data = json.dumps({"text": chunk.text})
                    yield f"data: {data}\n\n"
        else:
            # Mock streaming response for testing
            words = f"This is a mock response. I see you asked: '{user_message}'. I am the AquaPrint AI.".split(" ")
            import asyncio
            for word in words:
                data = json.dumps({"text": word + " "})
                yield f"data: {data}\n\n"
                await asyncio.sleep(0.1)
                
    except Exception as e:
        error_data = json.dumps({"error": str(e)})
        yield f"data: {error_data}\n\n"
    
    yield "data: [DONE]\n\n"
