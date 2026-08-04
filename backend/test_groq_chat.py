import asyncio
import httpx
import json

async def test_chat():
    async with httpx.AsyncClient() as client:
        print("Sending chat request...")
        response = await client.post(
            "http://localhost:8000/api/v1/ai/chat",
            json={"message": "Hello Groq! Are you working?"},
            timeout=30.0
        )
        print(f"Status Code: {response.status_code}")
        
        async for line in response.aiter_lines():
            if line:
                print(line)

if __name__ == "__main__":
    asyncio.run(test_chat())
