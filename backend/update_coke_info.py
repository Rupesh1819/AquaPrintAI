import os
import sys
from dotenv import load_dotenv

sys.path.insert(0, os.path.dirname(__file__))
load_dotenv(os.path.join(os.path.dirname(__file__), '..', '.env'))

from app.database import SessionLocal
from app.models.product import Product

def update_coke_info():
    db = SessionLocal()
    # Find Coca-Cola product
    product = db.query(Product).filter(Product.name.ilike('%Coca-Cola%')).first()
    
    if product:
        new_description = """**Coca-Cola Nutritional Information (per 100ml):**
- **Energy:** 180 kJ (2%)
- **Protein:** 0g (0%)
- **Fat:** 0g (0%)
- **Carbohydrates:** 10.6g (4%)
- **Total Sugars:** 10.6g
- **Sodium:** 12mg (1%)"""

        product.description = new_description
        db.commit()
        print(f"Successfully updated description for {product.name}")
    else:
        print("Coca-Cola product not found!")
        
    db.close()

if __name__ == "__main__":
    update_coke_info()
