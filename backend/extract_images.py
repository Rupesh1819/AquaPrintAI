import sys, os
sys.path.append(os.getcwd())
from app.database import SessionLocal
from app.models.product import Product, ProductImage

db = SessionLocal()
products = db.query(Product).all()
seen_urls = set()

md = '# Product Images\n\n'

for p in products:
    img = db.query(ProductImage).filter(ProductImage.product_id == p.id, ProductImage.is_primary == True).first()
    if not img:
        img = db.query(ProductImage).filter(ProductImage.product_id == p.id).first()
        
    if img and img.url and img.url not in seen_urls:
        seen_urls.add(img.url)
        md += f'### {p.name}\n![{p.name}]({img.url})\n\n'

with open(r'C:\Users\RUPESH SHETE\.gemini\antigravity-ide\brain\7fc06735-5f46-450b-bd10-0b917ff251a8\all_product_images.md', 'w', encoding='utf-8') as f:
    f.write(md)
