import os
import json
import logging
from typing import AsyncGenerator
from google import genai
from app.config import settings

logger = logging.getLogger(__name__)

GEMINI_API_KEY = getattr(settings, "gemini_api_key", os.environ.get("GEMINI_API_KEY"))

try:
    if GEMINI_API_KEY and GEMINI_API_KEY != "dummy_key_for_testing":
        client = genai.Client(api_key=GEMINI_API_KEY)
    else:
        client = None
except Exception as e:
    client = None
    logger.error(f"Gemini initialization failed in comparison: {e}")

async def stream_comparison_summary(comparison_data: dict) -> AsyncGenerator[str, None]:
    sys_prompt = """You are the AquaPrint AI Sustainability Analyst.
Your task is to analyze a JSON payload comparing several products.
You must:
1. Explain WHY the winner is better in terms of sustainability and water footprint.
2. Discuss the trade-offs of the other products.
3. Quantify the environmental impact (mention water savings).
4. Give a clear long-term recommendation.

Be concise, educational, and format your response beautifully with Markdown (use bolding and bullet points).
Do not just say "Product A wins". Explain the 'Why'.
"""
    try:
        # We simulate SSE format: data: <content>\n\n
        if client:
            response = client.models.generate_content_stream(
                model="gemini-3.5-flash",
                contents=[json.dumps(comparison_data)],
                config=genai.types.GenerateContentConfig(
                    system_instruction=sys_prompt,
                )
            )
            for chunk in response:
                if chunk.text:
                    data = json.dumps({"text": chunk.text})
                    yield f"data: {data}\n\n"
        else:
            # Mock streaming response for testing
            mock_text = """**AI Comparison Analysis**\n\nThe winning product demonstrates a clear advantage in its total water footprint, significantly reducing the blue water consumption during manufacturing.\n\n**Trade-offs:**\nWhile the alternative products may have slightly better packaging, their raw material extraction costs heavily in green water.\n\n**Recommendation:**\nSwitching to the winner could save hundreds of liters annually!"""
            import asyncio
            words = mock_text.split(" ")
            for word in words:
                data = json.dumps({"text": word + " "})
                yield f"data: {data}\n\n"
                await asyncio.sleep(0.05)
                
    except Exception as e:
        error_data = json.dumps({"error": str(e)})
        yield f"data: {error_data}\n\n"
    
    yield "data: [DONE]\n\n"
