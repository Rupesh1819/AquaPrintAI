"""Seed realistic product images for all products in the database."""
import sys
import os
sys.path.insert(0, os.path.dirname(__file__))

from dotenv import load_dotenv
load_dotenv(os.path.join(os.path.dirname(__file__), '..', '.env'))

from app.database import SessionLocal
from app.models.product import Product, ProductImage

db = SessionLocal()

# High quality product image mappings by brand/keyword
IMAGE_MAPPINGS = {
    "coca-cola": "https://images.unsplash.com/photo-1622483767028-3f66f32aef97?w=800&auto=format&fit=crop&q=80",
    "pepsi": "https://images.unsplash.com/photo-1553456558-aff63285bdd1?w=800&auto=format&fit=crop&q=80",
    "water": "https://images.unsplash.com/photo-1548839140-29a749e1bc4e?w=800&auto=format&fit=crop&q=80",
    "dasani": "https://images.unsplash.com/photo-1548839140-29a749e1bc4e?w=800&auto=format&fit=crop&q=80",
    "aquafina": "https://images.unsplash.com/photo-1560023907-5f339617ea30?w=800&auto=format&fit=crop&q=80",
    "evian": "https://images.unsplash.com/photo-1523362628745-0c100150b504?w=800&auto=format&fit=crop&q=80",
    "sprite": "https://images.unsplash.com/photo-1625772299848-391b6a87d7b3?w=800&auto=format&fit=crop&q=80",
    "fanta": "https://images.unsplash.com/photo-1624517452488-04869289c4ca?w=800&auto=format&fit=crop&q=80",
    "red bull": "https://images.unsplash.com/photo-1622543925917-763c34d1a86e?w=800&auto=format&fit=crop&q=80",
    "monster": "https://images.unsplash.com/photo-1622543925917-763c34d1a86e?w=800&auto=format&fit=crop&q=80",
    "juice": "https://images.unsplash.com/photo-1613478223719-2ab802602423?w=800&auto=format&fit=crop&q=80",
    "tropicana": "https://images.unsplash.com/photo-1613478223719-2ab802602423?w=800&auto=format&fit=crop&q=80",
    "chips": "https://images.unsplash.com/photo-1566478989037-eec170784d0b?w=800&auto=format&fit=crop&q=80",
    "lay's": "https://images.unsplash.com/photo-1566478989037-eec170784d0b?w=800&auto=format&fit=crop&q=80",
    "doritos": "https://images.unsplash.com/photo-1566478989037-eec170784d0b?w=800&auto=format&fit=crop&q=80",
    "chocolate": "https://images.unsplash.com/photo-1549007994-cb92caebd54b?w=800&auto=format&fit=crop&q=80",
    "kitkat": "https://images.unsplash.com/photo-1549007994-cb92caebd54b?w=800&auto=format&fit=crop&q=80",
    "cadbury": "https://images.unsplash.com/photo-1549007994-cb92caebd54b?w=800&auto=format&fit=crop&q=80",
    "milk": "https://images.unsplash.com/photo-1550583724-b2692b85b150?w=800&auto=format&fit=crop&q=80",
    "amul": "https://images.unsplash.com/photo-1550583724-b2692b85b150?w=800&auto=format&fit=crop&q=80",
    "coffee": "https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?w=800&auto=format&fit=crop&q=80",
    "tea": "https://images.unsplash.com/photo-1576092768241-dec231879fc3?w=800&auto=format&fit=crop&q=80",
}

DEFAULT_BEVERAGE_IMAGE = "https://images.unsplash.com/photo-1622483767028-3f66f32aef97?w=800&auto=format&fit=crop&q=80"
DEFAULT_SNACK_IMAGE = "https://images.unsplash.com/photo-1566478989037-eec170784d0b?w=800&auto=format&fit=crop&q=80"
DEFAULT_PRODUCT_IMAGE = "https://images.unsplash.com/photo-1548839140-29a749e1bc4e?w=800&auto=format&fit=crop&q=80"

products = db.query(Product).all()
added_count = 0

for product in products:
    # Check if product already has an image
    existing_img = db.query(ProductImage).filter(ProductImage.product_id == product.id).first()
    if existing_img:
        continue
        
    p_name_lower = product.name.lower()
    selected_url = None
    
    for key, url in IMAGE_MAPPINGS.items():
        if key in p_name_lower:
            selected_url = url
            break
            
    if not selected_url:
        if any(w in p_name_lower for w in ["drink", "cola", "beverage", "juice"]):
            selected_url = DEFAULT_BEVERAGE_IMAGE
        elif any(w in p_name_lower for w in ["snack", "cookie", "biscuit", "chip"]):
            selected_url = DEFAULT_SNACK_IMAGE
        else:
            selected_url = DEFAULT_PRODUCT_IMAGE
            
    img = ProductImage(
        product_id=product.id,
        url=selected_url,
        is_primary=True
    )
    db.add(img)
    added_count += 1

db.commit()
db.close()

print(f"Successfully added images for {added_count} products!")
