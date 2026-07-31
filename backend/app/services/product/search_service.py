from sqlalchemy.orm import Session
from sqlalchemy import or_, desc, asc
from app.models.product import Product, ProductCategory, Manufacturer, SustainabilityScore, ProductImage
from typing import List, Optional

def search_products(
    db: Session,
    query: Optional[str] = None,
    category_id: Optional[str] = None,
    manufacturer_id: Optional[str] = None,
    min_score: Optional[int] = None,
    page: int = 1,
    limit: int = 20
) -> List[dict]:
    # Start base query
    q = db.query(Product).join(SustainabilityScore, isouter=True).join(ProductCategory, isouter=True).join(Manufacturer, isouter=True)
    
    # 1. Full-Text and Trigram filtering
    if query:
        # Check barcode exact match first
        q = q.filter(
            or_(
                Product.name.ilike(f"%{query}%"),
                Product.description.ilike(f"%{query}%"),
                ProductCategory.name.ilike(f"%{query}%"),
                Manufacturer.name.ilike(f"%{query}%")
            )
        )
    
    # 2. Dynamic Filtering
    if category_id:
        q = q.filter(Product.category_id == category_id)
        
    if manufacturer_id:
        q = q.filter(Product.manufacturer_id == manufacturer_id)
        
    if min_score is not None:
        q = q.filter(SustainabilityScore.overall_score >= min_score)
        
    # 3. Sorting (Popularity / Score)
    q = q.order_by(desc(SustainabilityScore.overall_score).nulls_last())
    
    # 4. Pagination
    products = q.offset((page - 1) * limit).limit(limit).all()
    
    # Format Response
    res = []
    for p in products:
        image = db.query(ProductImage).filter(ProductImage.product_id == p.id, ProductImage.is_primary == True).first()
        res.append({
            "id": str(p.id),
            "name": p.name,
            "category": p.category.name if p.category else "Unknown",
            "manufacturer": p.manufacturer.name if p.manufacturer else "Unknown",
            "eco_grade": p.sustainability_score.eco_grade if p.sustainability_score else "N/A",
            "overall_score": p.sustainability_score.overall_score if p.sustainability_score else 0,
            "image_url": image.url if image else None
        })
        
    return res

def get_trending_products(db: Session, limit: int = 10) -> List[dict]:
    # Placeholder trending logic based on score
    products = db.query(Product).join(SustainabilityScore).order_by(desc(SustainabilityScore.overall_score)).limit(limit).all()
    res = []
    for p in products:
        image = db.query(ProductImage).filter(ProductImage.product_id == p.id, ProductImage.is_primary == True).first()
        res.append({
            "id": str(p.id),
            "name": p.name,
            "category": p.category.name if p.category else "Unknown",
            "manufacturer": p.manufacturer.name if p.manufacturer else "Unknown",
            "eco_grade": p.sustainability_score.eco_grade if p.sustainability_score else "N/A",
            "overall_score": p.sustainability_score.overall_score if p.sustainability_score else 0,
            "image_url": image.url if image else None
        })
    return res
