import uuid
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query, UploadFile, File
from sqlalchemy.orm import Session
from sqlalchemy import or_, func, text
from app.database import get_db
from app.models.product import (
    Product, ProductCategory, Manufacturer, ProductImage, 
    ProductWaterFootprint, SustainabilityScore, ProductAttribute, ProductAlternative
)
from app.schemas.product import (
    ProductCreate, ProductListResponse, ProductDetailResponse, 
    CategoryRead, ManufacturerRead, ProductImageRead, PaginatedProductsResponse
)
from app.dependencies import get_current_admin, get_current_user
from app.models.user import UserProfile, UserFavorite
from app.services.product.search_service import search_products, get_trending_products
from app.services.product.product_details import get_product_details
from supabase import create_client, Client
import os
import io

router = APIRouter()

def get_supabase() -> Client:
    url = os.getenv("SUPABASE_URL")
    key = os.getenv("SUPABASE_SERVICE_KEY")
    return create_client(url, key)

@router.get("/categories", response_model=List[CategoryRead])
def list_categories(db: Session = Depends(get_db)):
    """Retrieve all product categories."""
    return db.query(ProductCategory).all()

@router.get("/manufacturers", response_model=List[ManufacturerRead])
def list_manufacturers(db: Session = Depends(get_db)):
    """Retrieve all manufacturers."""
    return db.query(Manufacturer).all()

@router.get("/search")
def search_products_api(
    q: Optional[str] = None,
    category: Optional[str] = None,
    manufacturer: Optional[str] = None,
    min_score: Optional[int] = None,
    page: int = 1,
    size: int = 20,
    db: Session = Depends(get_db)
):
    """
    Search products using PostgreSQL Full-Text Search and Trigram similarity, plus filters.
    """
    items = search_products(db, q, category, manufacturer, min_score, page, size)
    return {
        "items": items,
        "page": page,
        "size": size
    }

@router.get("/trending")
def get_trending_products_api(limit: int = 10, db: Session = Depends(get_db)):
    """Retrieve trending products."""
    return get_trending_products(db, limit)

@router.get("/{product_id}/recommendations", response_model=List[ProductListResponse])
def get_recommendations(product_id: uuid.UUID, limit: int = 5, db: Session = Depends(get_db)):
    """Get alternative sustainable products or recommendations."""
    product = db.query(Product).filter(Product.id == product_id).first()
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
        
    alternatives = db.query(ProductAlternative).filter(ProductAlternative.product_id == product_id).limit(limit).all()
    alt_ids = [alt.alternative_product_id for alt in alternatives]
    
    if alt_ids:
        return db.query(Product).filter(Product.id.in_(alt_ids)).all()
    
    # Fallback to same category but better eco score
    return db.query(Product).join(SustainabilityScore).filter(
        Product.category_id == product.category_id,
        Product.id != product_id,
        SustainabilityScore.overall_score > 70
    ).limit(limit).all()

@router.get("/{product_id}")
def get_product(product_id: str, db: Session = Depends(get_db)):
    """Get full details of a specific product."""
    return get_product_details(db, product_id)

@router.post("/{product_id}/favorite")
def add_favorite(product_id: uuid.UUID, current_user: UserProfile = Depends(get_current_user), db: Session = Depends(get_db)):
    """Add a product to user favorites."""
    existing = db.query(UserFavorite).filter(UserFavorite.user_id == current_user.id, UserFavorite.product_id == product_id).first()
    if not existing:
        fav = UserFavorite(user_id=current_user.id, product_id=product_id)
        db.add(fav)
        db.commit()
    return {"status": "success"}

@router.delete("/{product_id}/favorite")
def remove_favorite(product_id: uuid.UUID, current_user: UserProfile = Depends(get_current_user), db: Session = Depends(get_db)):
    """Remove a product from user favorites."""
    fav = db.query(UserFavorite).filter(UserFavorite.user_id == current_user.id, UserFavorite.product_id == product_id).first()
    if fav:
        db.delete(fav)
        db.commit()
    return {"status": "success"}

@router.get("/user/favorites")
def list_favorites(current_user: UserProfile = Depends(get_current_user), db: Session = Depends(get_db)):
    """List user favorite products."""
    favs = db.query(UserFavorite).filter(UserFavorite.user_id == current_user.id).order_by(UserFavorite.created_at.desc()).all()
    res = []
    for f in favs:
        p = db.query(Product).filter(Product.id == f.product_id).first()
        if p:
            img = db.query(ProductImage).filter(ProductImage.product_id == p.id, ProductImage.is_primary == True).first()
            res.append({
                "id": str(p.id),
                "name": p.name,
                "image_url": img.url if img else None
            })
    return res

@router.post("/", response_model=ProductDetailResponse, dependencies=[Depends(get_current_admin)])
def create_product(product_in: ProductCreate, db: Session = Depends(get_db)):
    """Admin only: Create a new product."""
    product = Product(**product_in.model_dump())
    db.add(product)
    db.commit()
    db.refresh(product)
    return product

@router.post("/{product_id}/image", response_model=ProductImageRead, dependencies=[Depends(get_current_admin)])
async def upload_product_image(
    product_id: uuid.UUID,
    file: UploadFile = File(...),
    is_primary: bool = False,
    db: Session = Depends(get_db)
):
    """Admin only: Upload an image to Supabase Storage and link it to the product."""
    product = db.query(Product).filter(Product.id == product_id).first()
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
        
    supabase = get_supabase()
    file_bytes = await file.read()
    file_ext = file.filename.split('.')[-1]
    file_path = f"products/{product_id}/{uuid.uuid4()}.{file_ext}"
    
    res = supabase.storage.from_("product-images").upload(
        path=file_path, 
        file=file_bytes, 
        file_options={"content-type": file.content_type}
    )
    
    if res.error:
        raise HTTPException(status_code=500, detail=res.error.message)
        
    public_url = supabase.storage.from_("product-images").get_public_url(file_path)
    
    image = ProductImage(
        product_id=product_id,
        url=public_url,
        is_primary=is_primary
    )
    db.add(image)
    db.commit()
    db.refresh(image)
    return image
