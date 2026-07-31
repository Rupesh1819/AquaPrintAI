import google.generativeai as genai
import os
import json
from typing import AsyncGenerator
from app.config import settings

GEMINI_API_KEY = getattr(settings, "gemini_api_key", os.environ.get("GEMINI_API_KEY"))
if GEMINI_API_KEY:
    genai.configure(api_key=GEMINI_API_KEY)
else:
    genai.configure(api_key="dummy_key_for_testing")

def get_comparison_model():
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
    return genai.GenerativeModel(
        model_name="gemini-1.5-flash",
        system_instruction=sys_prompt
    )

async def stream_comparison_summary(comparison_data: dict) -> AsyncGenerator[str, None]:
    try:
        model = get_comparison_model()
        
        # We simulate SSE format: data: <content>\n\n
        if GEMINI_API_KEY and GEMINI_API_KEY != "dummy_key_for_testing":
            response = model.generate_content(json.dumps(comparison_data), stream=True)
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
