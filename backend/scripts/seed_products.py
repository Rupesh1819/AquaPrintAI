import sys
import os
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from sqlalchemy.orm import Session
from app.database import SessionLocal
from app.models.product import (
    ProductCategory, Manufacturer, Product, ProductWaterFootprint, 
    WaterFootprintType, SustainabilityScore, ConservationTip, 
    ProductAttribute, Tag, ProductTag, BarcodeMapping
)
from faker import Faker
import random
import uuid

fake = Faker()

CATEGORIES = [
    {"name": "Food & Beverages", "icon": "utensils"},
    {"name": "Apparel & Fashion", "icon": "shirt"},
    {"name": "Electronics", "icon": "smartphone"},
    {"name": "Home & Garden", "icon": "home"},
    {"name": "Beauty & Personal Care", "icon": "sparkles"}
]

TAGS = ["Vegan", "Organic", "Recycled", "Water-Intensive", "Eco-Friendly", "Fair Trade", "Locally Sourced"]

def generate_water_footprint(category_name):
    # Base litters per kg based on category
    if category_name == "Food & Beverages":
        return random.uniform(500, 15000)
    elif category_name == "Apparel & Fashion":
        return random.uniform(2000, 10000)
    elif category_name == "Electronics":
        return random.uniform(10000, 50000)
    else:
        return random.uniform(100, 5000)

def determine_eco_grade(total_water):
    if total_water < 1000: return "A"
    elif total_water < 3000: return "B"
    elif total_water < 6000: return "C"
    elif total_water < 10000: return "D"
    elif total_water < 20000: return "E"
    else: return "F"

def seed_db():
    db: Session = SessionLocal()
    
    try:
        print("Cleaning up old data...")
        db.query(Product).delete()
        db.query(ProductCategory).delete()
        db.query(Manufacturer).delete()
        db.query(Tag).delete()
        db.commit()

        print("Seeding Categories...")
        category_map = {}
        for c in CATEGORIES:
            cat = ProductCategory(name=c["name"], icon_url=c["icon"], description=fake.sentence())
            db.add(cat)
            db.commit()
            db.refresh(cat)
            category_map[cat.name] = cat.id

        print("Seeding Tags...")
        tag_map = {}
        for t in TAGS:
            tag = Tag(name=t)
            db.add(tag)
            db.commit()
            db.refresh(tag)
            tag_map[tag.name] = tag.id

        print("Seeding Manufacturers...")
        manufacturers = []
        for _ in range(50):
            m = Manufacturer(
                name=fake.company(),
                description=fake.catch_phrase(),
                website=fake.url(),
                country_of_origin=fake.country()
            )
            db.add(m)
            manufacturers.append(m)
        db.commit()
        for m in manufacturers: db.refresh(m)

        print("Seeding 500 Products...")
        products = []
        for i in range(500):
            cat_name = random.choice(list(category_map.keys()))
            m_id = random.choice(manufacturers).id
            
            p = Product(
                name=fake.ecommerce_name() if hasattr(fake, 'ecommerce_name') else f"{fake.word().capitalize()} {fake.word().capitalize()}",
                description=fake.text(),
                category_id=category_map[cat_name],
                manufacturer_id=m_id,
                unit="kg",
                is_verified=random.choice([True, False])
            )
            db.add(p)
            products.append((p, cat_name))

        db.commit()
        for p, _ in products: db.refresh(p)

        print("Seeding Footprints, Scores, Tags, and Barcodes...")
        for p, cat_name in products:
            # Water Footprint
            total_water = generate_water_footprint(cat_name)
            wf = ProductWaterFootprint(
                product_id=p.id,
                footprint_type=WaterFootprintType.TOTAL,
                amount=total_water,
                unit_reference="per kg"
            )
            db.add(wf)

            # Sustainability Score
            score = SustainabilityScore(
                product_id=p.id,
                eco_grade=determine_eco_grade(total_water),
                water_score=int(100 - min(100, (total_water/50000)*100)),
                overall_score=random.randint(40, 95)
            )
            db.add(score)

            # Tags
            num_tags = random.randint(1, 3)
            selected_tags = random.sample(list(tag_map.values()), num_tags)
            for tid in selected_tags:
                pt = ProductTag(product_id=p.id, tag_id=tid)
                db.add(pt)

            # Attributes
            attr = ProductAttribute(product_id=p.id, key="Origin", value=fake.country())
            db.add(attr)

            # Barcode
            bcode = BarcodeMapping(
                barcode=fake.ean13(),
                product_id=p.id,
                format="EAN13"
            )
            db.add(bcode)
            
            # Tips
            if random.random() > 0.5:
                tip = ConservationTip(
                    product_id=p.id,
                    tip_text=f"Consider using a reusable alternative instead of this {cat_name.lower()} item.",
                    impact_level=random.choice(["low", "medium", "high"])
                )
                db.add(tip)

        db.commit()
        print("Seeding Complete! Added 500 realistic products with full relationships.")

    except Exception as e:
        print(f"An error occurred: {e}")
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    seed_db()
