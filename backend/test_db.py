import sys
import os
from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent.parent
ENV_FILE = BASE_DIR / ".env"
print("Loading .env from:", ENV_FILE)
print("File exists:", ENV_FILE.exists())

from app.database import engine
from sqlalchemy import text

def main():
    try:
        with engine.connect() as conn:
            result = conn.execute(text("SELECT 1"))
            print("Successfully connected to the database!")
    except Exception as e:
        print("Database connection failed:", e)
        sys.exit(1)

if __name__ == "__main__":
    main()
