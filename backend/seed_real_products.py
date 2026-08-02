"""Seed real product names into the database for scanner testing."""
import sys
import os
sys.path.insert(0, os.path.dirname(__file__))

from dotenv import load_dotenv
load_dotenv(os.path.join(os.path.dirname(__file__), '..', '.env'))

from app.database import SessionLocal
from app.models.product import Product, ProductCategory, Manufacturer, ProductWaterFootprint, WaterFootprintType, SustainabilityScore
import uuid

db = SessionLocal()

# First, get or create categories
def get_or_create_category(name, description=""):
    cat = db.query(ProductCategory).filter(ProductCategory.name == name).first()
    if not cat:
        cat = ProductCategory(name=name, description=description)
        db.add(cat)
        db.commit()
        db.refresh(cat)
    return cat

def get_or_create_manufacturer(name, country=""):
    mfr = db.query(Manufacturer).filter(Manufacturer.name == name).first()
    if not mfr:
        mfr = Manufacturer(name=name, country_of_origin=country)
        db.add(mfr)
        db.commit()
        db.refresh(mfr)
    return mfr

# Categories
cat_beverage = get_or_create_category("Beverages", "Drinks and liquid refreshments")
cat_water = get_or_create_category("Water", "Bottled and packaged water")
cat_snacks = get_or_create_category("Snacks", "Chips, biscuits, and snack foods")
cat_dairy = get_or_create_category("Dairy", "Milk and dairy products")
cat_food = get_or_create_category("Food", "Packaged food items")

# Manufacturers
mfr_coca = get_or_create_manufacturer("Coca-Cola", "USA")
mfr_pepsi = get_or_create_manufacturer("PepsiCo", "USA")
mfr_nestle = get_or_create_manufacturer("Nestle", "Switzerland")
mfr_danone = get_or_create_manufacturer("Danone", "France")
mfr_mondelez = get_or_create_manufacturer("Mondelez", "USA")
mfr_redbull = get_or_create_manufacturer("Red Bull", "Austria")
mfr_monster = get_or_create_manufacturer("Monster Beverage", "USA")
mfr_unilever = get_or_create_manufacturer("Unilever", "UK")
mfr_parle = get_or_create_manufacturer("Parle", "India")
mfr_parle_agro = get_or_create_manufacturer("Parle Agro", "India")
mfr_amul = get_or_create_manufacturer("Amul", "India")
mfr_bisleri = get_or_create_manufacturer("Bisleri", "India")

REAL_PRODUCTS = [
    {"name": "Coca-Cola Classic 500ml", "cat": cat_beverage, "mfr": mfr_coca, "blue": 10.0, "green": 130.0, "grey": 29.0, "total": 169.0, "score": 4.2},
    {"name": "Pepsi Cola 500ml", "cat": cat_beverage, "mfr": mfr_pepsi, "blue": 12.0, "green": 135.0, "grey": 28.0, "total": 175.0, "score": 4.0},
    {"name": "Dasani Purified Water 1L", "cat": cat_water, "mfr": mfr_coca, "blue": 1.0, "green": 0.3, "grey": 0.2, "total": 1.5, "score": 8.5},
    {"name": "Aquafina Purified Water 1L", "cat": cat_water, "mfr": mfr_pepsi, "blue": 1.2, "green": 0.4, "grey": 0.2, "total": 1.8, "score": 8.3},
    {"name": "Nestle Pure Life Water 500ml", "cat": cat_water, "mfr": mfr_nestle, "blue": 0.9, "green": 0.3, "grey": 0.2, "total": 1.4, "score": 8.6},
    {"name": "Sprite Lemon Lime 500ml", "cat": cat_beverage, "mfr": mfr_coca, "blue": 9.0, "green": 128.0, "grey": 28.0, "total": 165.0, "score": 4.5},
    {"name": "Fanta Orange 500ml", "cat": cat_beverage, "mfr": mfr_coca, "blue": 15.0, "green": 140.0, "grey": 25.0, "total": 180.0, "score": 3.8},
    {"name": "Red Bull Energy Drink 250ml", "cat": cat_beverage, "mfr": mfr_redbull, "blue": 8.0, "green": 80.0, "grey": 17.0, "total": 105.0, "score": 5.0},
    {"name": "Monster Energy Drink 500ml", "cat": cat_beverage, "mfr": mfr_monster, "blue": 16.0, "green": 160.0, "grey": 34.0, "total": 210.0, "score": 3.5},
    {"name": "Tropicana Orange Juice 1L", "cat": cat_beverage, "mfr": mfr_pepsi, "blue": 35.0, "green": 450.0, "grey": 75.0, "total": 560.0, "score": 3.0},
    {"name": "Minute Maid Apple Juice 500ml", "cat": cat_beverage, "mfr": mfr_coca, "blue": 30.0, "green": 380.0, "grey": 70.0, "total": 480.0, "score": 3.2},
    {"name": "Evian Natural Spring Water 1L", "cat": cat_water, "mfr": mfr_danone, "blue": 0.8, "green": 0.2, "grey": 0.2, "total": 1.2, "score": 8.8},
    {"name": "Bisleri Mineral Water 1L", "cat": cat_water, "mfr": mfr_bisleri, "blue": 1.0, "green": 0.4, "grey": 0.2, "total": 1.6, "score": 8.4},
    {"name": "Kinley Water 1L", "cat": cat_water, "mfr": mfr_coca, "blue": 1.0, "green": 0.3, "grey": 0.2, "total": 1.5, "score": 8.5},
    {"name": "Mountain Dew 500ml", "cat": cat_beverage, "mfr": mfr_pepsi, "blue": 11.0, "green": 132.0, "grey": 27.0, "total": 170.0, "score": 4.1},
    {"name": "7UP Lemon Lime 500ml", "cat": cat_beverage, "mfr": mfr_pepsi, "blue": 9.0, "green": 125.0, "grey": 26.0, "total": 160.0, "score": 4.6},
    {"name": "Limca Lemon 500ml", "cat": cat_beverage, "mfr": mfr_coca, "blue": 8.0, "green": 122.0, "grey": 25.0, "total": 155.0, "score": 4.7},
    {"name": "Thumbs Up Cola 500ml", "cat": cat_beverage, "mfr": mfr_coca, "blue": 11.0, "green": 133.0, "grey": 28.0, "total": 172.0, "score": 4.1},
    {"name": "Maaza Mango Drink 500ml", "cat": cat_beverage, "mfr": mfr_coca, "blue": 25.0, "green": 280.0, "grey": 45.0, "total": 350.0, "score": 3.3},
    {"name": "Frooti Mango Drink 500ml", "cat": cat_beverage, "mfr": mfr_parle_agro, "blue": 24.0, "green": 270.0, "grey": 46.0, "total": 340.0, "score": 3.4},
    {"name": "Lay's Classic Potato Chips 150g", "cat": cat_snacks, "mfr": mfr_pepsi, "blue": 15.0, "green": 140.0, "grey": 30.0, "total": 185.0, "score": 3.9},
    {"name": "Doritos Nacho Cheese 150g", "cat": cat_snacks, "mfr": mfr_pepsi, "blue": 18.0, "green": 150.0, "grey": 32.0, "total": 200.0, "score": 3.7},
    {"name": "Oreo Chocolate Cookies 150g", "cat": cat_snacks, "mfr": mfr_mondelez, "blue": 22.0, "green": 220.0, "grey": 48.0, "total": 290.0, "score": 3.3},
    {"name": "KitKat Chocolate Bar 50g", "cat": cat_snacks, "mfr": mfr_nestle, "blue": 10.0, "green": 90.0, "grey": 20.0, "total": 120.0, "score": 5.2},
    {"name": "Cadbury Dairy Milk Chocolate 100g", "cat": cat_snacks, "mfr": mfr_mondelez, "blue": 100.0, "green": 1400.0, "grey": 200.0, "total": 1700.0, "score": 2.0},
    {"name": "Amul Milk 1L", "cat": cat_dairy, "mfr": mfr_amul, "blue": 86.0, "green": 863.0, "grey": 72.0, "total": 1020.0, "score": 2.8},
    {"name": "Nescafe Classic Coffee 100g", "cat": cat_beverage, "mfr": mfr_nestle, "blue": 70.0, "green": 950.0, "grey": 100.0, "total": 1120.0, "score": 2.5},
    {"name": "Lipton Green Tea 100g", "cat": cat_beverage, "mfr": mfr_unilever, "blue": 50.0, "green": 740.0, "grey": 80.0, "total": 870.0, "score": 3.0},
    {"name": "Parle-G Biscuits 250g", "cat": cat_snacks, "mfr": mfr_parle, "blue": 35.0, "green": 350.0, "grey": 70.0, "total": 455.0, "score": 3.5},
    {"name": "Maggi Instant Noodles 70g", "cat": cat_food, "mfr": mfr_nestle, "blue": 40.0, "green": 350.0, "grey": 70.0, "total": 460.0, "score": 3.4},
]

added = 0
skipped = 0

for p in REAL_PRODUCTS:
    existing = db.query(Product).filter(Product.name == p['name']).first()
    if existing:
        skipped += 1
        print(f"  SKIP: {p['name']} (already exists)")
        continue
    
    product = Product(
        name=p["name"],
        category_id=p["cat"].id,
        manufacturer_id=p["mfr"].id,
        description=f"Water footprint analysis for {p['name']}.",
    )
    db.add(product)
    db.commit()
    db.refresh(product)
    
    # Add water footprint records
    for ft, amount in [
        (WaterFootprintType.BLUE, p["blue"]),
        (WaterFootprintType.GREEN, p["green"]),
        (WaterFootprintType.GREY, p["grey"]),
        (WaterFootprintType.TOTAL, p["total"]),
    ]:
        wf = ProductWaterFootprint(
            product_id=product.id,
            footprint_type=ft,
            amount=amount,
            unit_reference="per unit",
        )
        db.add(wf)
    
    # Add sustainability score
    score_100 = int(p["score"] * 10)  # Convert 0-10 scale to 0-100
    grade = "A" if score_100 >= 80 else "B" if score_100 >= 60 else "C" if score_100 >= 40 else "D" if score_100 >= 20 else "F"
    ss = SustainabilityScore(
        product_id=product.id,
        overall_score=score_100,
        water_score=score_100,
        eco_grade=grade,
    )
    db.add(ss)
    
    db.commit()
    added += 1
    print(f"  ADD: {p['name']}")

db.close()
print(f"\nDone. Added {added} real products. Skipped {skipped} duplicates.")
