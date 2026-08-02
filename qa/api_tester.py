import os
import sys
import time
import json
import requests
import jwt
from datetime import datetime, timedelta
from sqlalchemy import create_engine, inspect

# Load env file manually for script
env_path = os.path.join(os.path.dirname(__file__), '../.env')
env_vars = {}
if os.path.exists(env_path):
    with open(env_path, 'r') as f:
        for line in f:
            line = line.strip()
            if line and not line.startswith('#'):
                if '=' in line:
                    key, val = line.split('=', 1)
                    env_vars[key] = val.strip('"').strip("'")

API_URL = "http://localhost:8000/api/v1"
JWT_SECRET = env_vars.get("JWT_SECRET", "dummy_secret")
DB_URL = env_vars.get("DATABASE_URL", "")

results = {
    "db_verification": {},
    "api_verification": {},
    "gemini_verification": {}
}

# 1. DB Verification
try:
    engine = create_engine(DB_URL)
    inspector = inspect(engine)
    tables = inspector.get_table_names()
    results["db_verification"]["tables_exist"] = True
    results["db_verification"]["tables"] = tables
    
    # Check FKs
    fks = []
    for table in tables:
        t_fks = inspector.get_foreign_keys(table)
        fks.extend([fk['constrained_columns'] for fk in t_fks])
    results["db_verification"]["has_foreign_keys"] = len(fks) > 0
    results["db_verification"]["status"] = "PASS"
except Exception as e:
    results["db_verification"]["status"] = "FAIL"
    results["db_verification"]["error"] = str(e)

# 2. API Verification
def generate_token(role="authenticated"):
    payload = {
        "sub": "00000000-0000-0000-0000-000000000001",
        "aud": "authenticated",
        "role": role,
        "exp": datetime.utcnow() + timedelta(hours=1)
    }
    return jwt.encode(payload, JWT_SECRET, algorithm="HS256")

try:
    # Test Missing JWT (using a route that requires auth)
    r = requests.get(f"{API_URL}/gamification/profile/progress")
    results["api_verification"]["missing_jwt_401"] = (r.status_code == 401)
    
    # Test Invalid JWT
    r = requests.get(f"{API_URL}/gamification/profile/progress", headers={"Authorization": "Bearer INVALID"})
    results["api_verification"]["invalid_jwt_401"] = (r.status_code == 401)
    
    # Test User on Admin Route (Assuming POST to product image requires admin)
    user_token = generate_token(role="authenticated")
    r = requests.post(f"{API_URL}/products/test-id/image", headers={"Authorization": f"Bearer {user_token}"})
    results["api_verification"]["user_on_admin_403"] = (r.status_code in [403, 401])
    
    # Test Admin token on Admin Route
    admin_token = generate_token(role="admin")
    r = requests.post(f"{API_URL}/products/test-id/image", headers={"Authorization": f"Bearer {admin_token}"})
    results["api_verification"]["admin_on_admin_not_403"] = (r.status_code not in [403, 401])
except Exception as e:
    results["api_verification"]["error"] = str(e)

# 3. Gemini Verification
try:
    # Trigger AI summary via POST
    r = requests.post(f"{API_URL}/comparison/ai-summary", json={"product_ids": []}, stream=True)
    chunks = []
    for chunk in r.iter_content(chunk_size=1024):
        if chunk:
            chunks.append(chunk.decode('utf-8'))
    
    combined = "".join(chunks)
    if "data: " in combined:
        results["gemini_verification"]["sse_format_correct"] = True
        if "mock response" in combined.lower() or "mock" in combined.lower():
            results["gemini_verification"]["status"] = "FAIL (MOCK RETURNED)"
        else:
            results["gemini_verification"]["status"] = "PASS"
    else:
        results["gemini_verification"]["status"] = "FAIL (NO SSE)"
except Exception as e:
    results["gemini_verification"]["status"] = "FAIL"
    results["gemini_verification"]["error"] = str(e)

with open(os.path.join(os.path.dirname(__file__), 'api_results.json'), 'w') as f:
    json.dump(results, f, indent=2)

print("API Tester completed.")
