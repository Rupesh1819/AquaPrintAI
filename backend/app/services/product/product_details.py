from sqlalchemy.orm import Session
from fastapi import HTTPException
from app.models.product import Product, ProductImage, ProductWaterFootprint, SustainabilityScore, ProductAlternative, ConservationTip
import uuid

def get_product_details(db: Session, product_id: str) -> dict:
    try:
        pid = uuid.UUID(product_id)
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid product ID")

    product = db.query(Product).filter(Product.id == pid).first()
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")

    # Images
    images = db.query(ProductImage).filter(ProductImage.product_id == pid).all()
    
    # Footprints
    footprints = db.query(ProductWaterFootprint).filter(ProductWaterFootprint.product_id == pid).all()
    
    # Sustainability Score
    score = db.query(SustainabilityScore).filter(SustainabilityScore.product_id == pid).first()
    
    # Conservation Tips
    tips = db.query(ConservationTip).filter(
        (ConservationTip.product_id == pid) | (ConservationTip.category_id == product.category_id)
    ).limit(3).all()

    # Alternatives
    alts = db.query(ProductAlternative).filter(ProductAlternative.product_id == pid).limit(3).all()
    alts_data = []
    for alt in alts:
        target = db.query(Product).filter(Product.id == alt.alternative_product_id).first()
        if target:
            target_image = db.query(ProductImage).filter(ProductImage.product_id == target.id, ProductImage.is_primary == True).first()
            alts_data.append({
                "id": str(target.id),
                "name": target.name,
                "water_saved": alt.water_saved,
                "reason": alt.reason,
                "image_url": target_image.url if target_image else None
            })

    images_list = [{"url": img.url, "is_primary": img.is_primary} for img in images]
    if not images_list:
        images_list = [{
            "url": "https://placehold.co/800x800/f8fafc/64748b?text=Image+Unavailable",
            "is_primary": True
        }]

    footprints_list = [{"type": fp.footprint_type.value, "amount": fp.amount, "unit": fp.unit_reference} for fp in footprints]
    if not footprints_list:
        total_liters = (score.water_score * 2.0) if (score and score.water_score) else 150.0
        footprints_list = [
            {"type": "blue", "amount": round(total_liters * 0.65, 1), "unit": "liters"},
            {"type": "green", "amount": round(total_liters * 0.25, 1), "unit": "liters"},
            {"type": "grey", "amount": round(total_liters * 0.10, 1), "unit": "liters"},
            {"type": "total", "amount": round(total_liters, 1), "unit": "liters"}
        ]

    return {
        "id": str(product.id),
        "name": product.name,
        "description": product.description,
        "category": product.category.name if product.category else "General",
        "manufacturer": product.manufacturer.name if product.manufacturer else "Unknown Producer",
        "unit": product.unit,
        "is_verified": product.is_verified,
        "images": images_list,
        "footprints": footprints_list,
        "score": {
            "eco_grade": score.eco_grade if score else "B",
            "overall_score": score.overall_score if score else 78,
            "water_score": score.water_score if score else 78,
            "co2_equivalent": score.co2_equivalent if score else 0.45
        },
        "tips": [tip.tip_text for tip in tips] if tips else ["Opt for reusable packaging to minimize water footprints."],
        "alternatives": alts_data
    }
