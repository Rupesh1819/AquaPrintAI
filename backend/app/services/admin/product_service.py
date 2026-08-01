from sqlalchemy.orm import Session
from app.models.product import Product

def get_admin_products(db: Session, skip: int = 0, limit: int = 50, search: str = None):
    query = db.query(Product)
    
    if search:
        query = query.filter(
            (Product.name.ilike(f"%{search}%")) |
            (Product.barcode.ilike(f"%{search}%"))
        )
        
    products = query.offset(skip).limit(limit).all()
    total = query.count()
    
    return {
        "items": [{
            "id": str(p.id),
            "name": p.name,
            "barcode": p.barcode,
            "category": p.category,
            "manufacturer": p.manufacturer,
            "water_footprint_liters": p.water_footprint_liters,
            "sustainability_score": p.sustainability_score
        } for p in products],
        "total": total
    }

def delete_product(db: Session, product_id: str):
    p = db.query(Product).filter(Product.id == product_id).first()
    if p:
        db.delete(p)
        db.commit()
        return True
    return False
