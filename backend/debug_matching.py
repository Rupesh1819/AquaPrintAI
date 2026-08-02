"""Debug the product matching logic."""
import os, sys
sys.path.insert(0, os.path.dirname(__file__))
from dotenv import load_dotenv
load_dotenv(os.path.join(os.path.dirname(__file__), '..', '.env'))

from app.database import SessionLocal
from app.models.product import Product
from sqlalchemy import func, text

db = SessionLocal()

# Test 1: Check if pg_trgm extension exists
try:
    result = db.execute(text("SELECT similarity('test', 'test')")).scalar()
    print(f"pg_trgm works: similarity={result}")
except Exception as e:
    print(f"pg_trgm ERROR: {e}")
    db.rollback()

# Test 2: Check default threshold
try:
    threshold = db.execute(text("SHOW pg_trgm.similarity_threshold")).scalar()
    print(f"Default pg_trgm threshold: {threshold}")
except Exception as e:
    print(f"Threshold check failed: {e}")
    db.rollback()

# Test 3: Try trigram with various search terms
test_terms = [
    "Coca Cola",
    "Coca-Cola",
    "coca cola classic",
    "COCA COLA",
    "pepsi",
    "bisleri",
    "water bottle",
    "mineral water",
]

for search in test_terms:
    try:
        db.execute(text("SET pg_trgm.similarity_threshold = 0.1"))
        results = db.query(
            Product, 
            func.similarity(Product.name, search).label('score')
        ).filter(
            Product.name.op('%')(search)
        ).order_by(text('score DESC')).limit(3).all()
        
        if results:
            print(f'\nMatches for "{search}":')
            for p, score in results:
                print(f"  {p.name} -> {score:.3f}")
        else:
            print(f'\nNO matches for "{search}"')
    except Exception as e:
        print(f'\nERROR for "{search}": {e}')
        db.rollback()

# Test 4: Also check with full-text search
print("\n--- Full-text search test ---")
for search in ["Coca Cola", "Pepsi", "Bisleri"]:
    try:
        results = db.query(Product).filter(
            Product.name.ilike(f"%{search.split()[0]}%")
        ).all()
        print(f'ILIKE "%{search.split()[0]}%": {len(results)} matches')
        for p in results[:3]:
            print(f"  {p.name}")
    except Exception as e:
        print(f"ILIKE error: {e}")
        db.rollback()

db.close()
