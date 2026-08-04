import os
import sys
from dotenv import load_dotenv

sys.path.insert(0, os.path.dirname(__file__))
load_dotenv(os.path.join(os.path.dirname(__file__), '..', '.env'))

from app.database import SessionLocal
from app.models.product import Product, ProductImage

REAL_IMAGE_MAPPINGS = {
    "coca-cola": "https://upload.wikimedia.org/wikipedia/commons/thumb/e/e8/Coca-Cola_bottle_transparent.png/430px-Coca-Cola_bottle_transparent.png",
    "pepsi": "https://upload.wikimedia.org/wikipedia/commons/thumb/0/0f/Pepsi_logo_2014.svg/640px-Pepsi_logo_2014.svg.png",
    "dasani": "https://upload.wikimedia.org/wikipedia/commons/thumb/1/1a/Dasani_Water.jpg/640px-Dasani_Water.jpg",
    "aquafina": "https://upload.wikimedia.org/wikipedia/commons/thumb/4/4c/Aquafina_logo.svg/640px-Aquafina_logo.svg.png",
    "sprite": "https://upload.wikimedia.org/wikipedia/commons/thumb/c/c5/Sprite_can.png/640px-Sprite_can.png",
    "fanta": "https://upload.wikimedia.org/wikipedia/commons/thumb/6/67/Fanta_logo.svg/640px-Fanta_logo.svg.png",
    "red bull": "https://upload.wikimedia.org/wikipedia/en/thumb/f/fa/Red_Bull_Energy_Drink_can.png/300px-Red_Bull_Energy_Drink_can.png",
    "monster": "https://upload.wikimedia.org/wikipedia/commons/thumb/6/6b/Monster_Energy_logo.svg/640px-Monster_Energy_logo.svg.png",
    "tropicana": "https://upload.wikimedia.org/wikipedia/commons/thumb/7/7b/Tropicana_Logo.svg/640px-Tropicana_Logo.svg.png",
    "lay's": "https://upload.wikimedia.org/wikipedia/commons/thumb/c/c8/Lay%27s_logo.svg/640px-Lay%27s_logo.svg.png",
    "doritos": "https://upload.wikimedia.org/wikipedia/en/thumb/e/ee/Doritos_Logo_2013.svg/640px-Doritos_Logo_2013.svg.png",
    "maggi": "https://upload.wikimedia.org/wikipedia/commons/thumb/e/e4/Maggi_logo.svg/640px-Maggi_logo.svg.png",
    "evian": "https://upload.wikimedia.org/wikipedia/commons/thumb/a/ab/Evian_logo.svg/640px-Evian_logo.svg.png",
    "mountain dew": "https://upload.wikimedia.org/wikipedia/commons/thumb/9/91/Mountain_Dew_logo.svg/640px-Mountain_Dew_logo.svg.png",
    "7up": "https://upload.wikimedia.org/wikipedia/commons/thumb/7/77/7Up_logo.svg/640px-7Up_logo.svg.png",
    "limca": "https://upload.wikimedia.org/wikipedia/en/thumb/8/87/Limca_logo.svg/640px-Limca_logo.svg.png",
    "thumbs up": "https://upload.wikimedia.org/wikipedia/en/thumb/0/07/Thums_Up_logo.svg/640px-Thums_Up_logo.svg.png",
    "minute maid": "https://upload.wikimedia.org/wikipedia/commons/thumb/c/cd/Minute_Maid_logo.svg/640px-Minute_Maid_logo.svg.png",
    "bisleri": "https://upload.wikimedia.org/wikipedia/commons/thumb/1/1d/Bisleri_Logo.svg/640px-Bisleri_Logo.svg.png",
    "kinley": "https://upload.wikimedia.org/wikipedia/commons/thumb/0/0f/Kinley_logo.svg/640px-Kinley_logo.svg.png"
}

def update_images():
    db = SessionLocal()
    products = db.query(Product).all()
    updated = 0
    
    for product in products:
        p_name_lower = product.name.lower()
        selected_url = None
        
        for key, url in REAL_IMAGE_MAPPINGS.items():
            if key in p_name_lower:
                selected_url = url
                break
                
        if selected_url:
            existing_img = db.query(ProductImage).filter(ProductImage.product_id == product.id).first()
            if existing_img:
                existing_img.url = selected_url
                updated += 1
            else:
                new_img = ProductImage(product_id=product.id, url=selected_url, is_primary=True)
                db.add(new_img)
                updated += 1
                
    db.commit()
    db.close()
    print(f"Successfully updated images for {updated} major products!")

if __name__ == "__main__":
    update_images()
