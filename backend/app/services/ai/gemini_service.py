import os
import json
import logging
from typing import AsyncGenerator
from fastapi import HTTPException
from google import genai
from app.config import settings
from app.services.ai.context_builder import build_retrieval_augmented_context
from app.services.ai.prompt_builder import build_system_prompt
from app.models.ai import AIMessage
from sqlalchemy.orm import Session

logger = logging.getLogger(__name__)

# Configure Gemini (using API key from environment or settings)
GEMINI_API_KEY = getattr(settings, "gemini_api_key", os.environ.get("GEMINI_API_KEY"))

try:
    if GEMINI_API_KEY and GEMINI_API_KEY != "dummy_key_for_testing":
        client = genai.Client(api_key=GEMINI_API_KEY)
        print("Gemini initialized successfully")
    else:
        client = None
        print("Gemini initialization failed: Invalid or dummy API key provided.")
except Exception as e:
    client = None
    print(f"Gemini initialization failed: {e}")

async def stream_chat_response(context: str, conversation_id, user_message: str, history: list) -> AsyncGenerator[str, None]:
    full_response = []
    try:
        # First SSE chunk: send metadata including the real DB conversation_id
        meta_data = json.dumps({"conversation_id": str(conversation_id)})
        yield f"data: {meta_data}\n\n"

        # Build System Prompt
        system_prompt = build_system_prompt(context)
        
        if client:
            # Convert DB history to Gemini history format
            contents = []
            for msg in history:
                role = "user" if msg.role == "user" else "model"
                contents.append({"role": role, "parts": [{"text": msg.content}]})
                
            contents.append({"role": "user", "parts": [{"text": user_message}]})
            
            models_to_try = ["gemini-3.5-flash-lite", "gemini-3.1-flash-lite", "gemini-3.5-flash", "gemini-2.0-flash"]
            response = None
            for model_name in models_to_try:
                try:
                    response = client.models.generate_content_stream(
                        model=model_name,
                        contents=contents,
                        config=genai.types.GenerateContentConfig(
                            system_instruction=system_prompt,
                            temperature=0.7
                        )
                    )
                    break
                except Exception as model_err:
                    logger.warning(f"Model {model_name} failed in chat: {model_err}")
                    continue
            
            if response:
                for chunk in response:
                    if chunk.text:
                        full_response.append(chunk.text)
                        data = json.dumps({"text": chunk.text})
                        yield f"data: {data}\n\n"
        else:
            # Mock streaming response for testing
            mock_text = f"This is a mock response. I see you asked: '{user_message}'. I am the AquaPrint AI."
            words = mock_text.split(" ")
            import asyncio
            for word in words:
                full_response.append(word + " ")
                data = json.dumps({"text": word + " "})
                yield f"data: {data}\n\n"
                await asyncio.sleep(0.08)
                
    except Exception as e:
        logger.error(f"AI Streaming Error: {e}")
        error_data = json.dumps({"error": str(e)})
        yield f"data: {error_data}\n\n"
    
    # Save model message to DB
    if full_response:
        try:
            from app.database import SessionLocal
            db_save = SessionLocal()
            model_msg = AIMessage(conversation_id=conversation_id, role="model", content="".join(full_response))
            db_save.add(model_msg)
            db_save.commit()
            db_save.close()
        except Exception as e:
            logger.error(f"Failed to save model message: {e}")

    yield "data: [DONE]\n\n"
