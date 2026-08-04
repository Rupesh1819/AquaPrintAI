import os
import json
import logging
from typing import AsyncGenerator
from fastapi import HTTPException
from groq import Groq
from app.config import settings
from app.services.ai.context_builder import build_retrieval_augmented_context
from app.services.ai.prompt_builder import build_system_prompt
from app.models.ai import AIMessage
from sqlalchemy.orm import Session

logger = logging.getLogger(__name__)

# Configure Groq (using API key from environment or settings)
GROQ_API_KEY = getattr(settings, "groq_api_key", os.environ.get("GROQ_API_KEY"))

try:
    if GROQ_API_KEY and GROQ_API_KEY != "dummy_key_for_testing":
        client = Groq(api_key=GROQ_API_KEY)
        print("Groq initialized successfully")
    else:
        # Fallback to default Groq init which checks os.environ
        client = Groq()
        print("Groq initialized using environment variable")
except Exception as e:
    client = None
    print(f"Groq initialization failed: {e}")

async def stream_chat_response(context: str, conversation_id, user_message: str, history: list) -> AsyncGenerator[str, None]:
    full_response = []
    try:
        # First SSE chunk: send metadata including the real DB conversation_id
        meta_data = json.dumps({"conversation_id": str(conversation_id)})
        yield meta_data

        # Build System Prompt
        system_prompt = build_system_prompt(context)
        
        if client:
            messages = [{"role": "system", "content": system_prompt}]
            for msg in history:
                role = "user" if msg.role == "user" else "assistant"
                messages.append({"role": role, "content": msg.content})
                
            messages.append({"role": "user", "content": user_message})
            
            try:
                response = client.chat.completions.create(
                    model="openai/gpt-oss-120b",
                    messages=messages,
                    temperature=1,
                    max_completion_tokens=2048,
                    top_p=1,
                    reasoning_effort="medium",
                    stream=True,
                    stop=None
                )
                
                for chunk in response:
                    content = chunk.choices[0].delta.content or ""
                    if content:
                        full_response.append(content)
                        data = json.dumps({"text": content})
                        yield data
            except Exception as model_err:
                logger.warning(f"Groq model failed in chat: {model_err}")
        else:
            # Mock streaming response for testing
            mock_text = f"This is a mock response. I see you asked: '{user_message}'. I am the AquaPrint AI."
            words = mock_text.split(" ")
            import asyncio
            for word in words:
                full_response.append(word + " ")
                data = json.dumps({"text": word + " "})
                yield data
                await asyncio.sleep(0.08)
                
    except Exception as e:
        logger.error(f"AI Streaming Error: {e}")
        error_data = json.dumps({"error": str(e)})
        yield error_data
    
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

    yield "[DONE]"
