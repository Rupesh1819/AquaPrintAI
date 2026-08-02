from pydantic import BaseModel, Field, HttpUrl, UUID4, ConfigDict
from typing import List, Optional, Dict, Any
from datetime import datetime
from enum import Enum
from app.models.product import WaterFootprintType

# -----------------
# Tags
# -----------------
class TagBase(BaseModel):
    name: str = Field(..., description="The name of the tag")

class TagRead(TagBase):
    id: UUID4
    model_config = ConfigDict(from_attributes=True)

# -----------------
# Categories
# -----------------
class CategoryBase(BaseModel):
    name: str = Field(..., description="The name of the category")
    description: Optional[str] = Field(None, description="Detailed description of the category")
    icon_url: Optional[str] = Field(None, description="URL to the category icon")
    parent_id: Optional[UUID4] = Field(None, description="ID of the parent category if nested")

class CategoryRead(CategoryBase):
    id: UUID4
    model_config = ConfigDict(from_attributes=True)

# -----------------
# Manufacturers
# -----------------
class ManufacturerBase(BaseModel):
    name: str = Field(..., description="The name of the manufacturer or brand")
    description: Optional[str] = Field(None, description="About the manufacturer")
    website: Optional[HttpUrl] = Field(None, description="Official website")
    country_of_origin: Optional[str] = Field(None, description="Origin country")

class ManufacturerRead(ManufacturerBase):
    id: UUID4
    model_config = ConfigDict(from_attributes=True)

# -----------------
# Sustainability & Footprints
# -----------------
class SustainabilityScoreRead(BaseModel):
    id: UUID4
    eco_grade: str = Field(..., description="Eco grade (e.g. A, B, C, D, E)")
    co2_equivalent: Optional[float] = Field(None, description="CO2 equivalent in kg")
    water_score: Optional[int] = Field(None, ge=0, le=100, description="Score from 0 to 100")
    overall_score: Optional[int] = Field(None, ge=0, le=100, description="Score from 0 to 100")

    model_config = ConfigDict(from_attributes=True)

class WaterFootprintSourceRead(BaseModel):
    id: UUID4
    name: str
    url: Optional[HttpUrl]
    reliability_score: int

    model_config = ConfigDict(from_attributes=True)

class ProductWaterFootprintRead(BaseModel):
    id: UUID4
    footprint_type: WaterFootprintType
    amount: float = Field(..., description="Amount of water used in liters")
    unit_reference: str = Field(..., description="Unit reference e.g., 'per kg'")
    source: Optional[WaterFootprintSourceRead] = None
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)

# -----------------
# Images & Attributes
# -----------------
class ProductImageRead(BaseModel):
    id: UUID4
    url: str
    thumbnail_url: Optional[str]
    blur_hash: Optional[str]
    dominant_color: Optional[str]
    is_primary: bool

    model_config = ConfigDict(from_attributes=True)

class ProductAttributeRead(BaseModel):
    id: UUID4
    key: str
    value: str

    model_config = ConfigDict(from_attributes=True)

# -----------------
# Products
# -----------------
class ProductBase(BaseModel):
    name: str = Field(..., description="The official product name", min_length=2, max_length=255)
    description: Optional[str] = Field(None, description="Detailed product description")
    category_id: UUID4 = Field(..., description="ID of the associated category")
    manufacturer_id: Optional[UUID4] = Field(None, description="ID of the manufacturer")
    unit: str = Field("kg", description="Unit of measurement for the product (e.g., kg, liter, piece)")

class ProductCreate(ProductBase):
    pass

class ProductUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    category_id: Optional[UUID4] = None
    manufacturer_id: Optional[UUID4] = None
    unit: Optional[str] = None
    is_verified: Optional[bool] = None

class ProductListResponse(ProductBase):
    id: UUID4
    is_verified: bool
    created_at: datetime
    images: List[ProductImageRead] = []
    
    model_config = ConfigDict(from_attributes=True)

class ProductDetailResponse(ProductListResponse):
    updated_at: datetime
    category: Optional[CategoryRead] = None
    manufacturer: Optional[ManufacturerRead] = None
    water_footprints: List[ProductWaterFootprintRead] = []
    sustainability_score: Optional[SustainabilityScoreRead] = None
    attributes: List[ProductAttributeRead] = []

    model_config = ConfigDict(from_attributes=True)

class PaginatedProductsResponse(BaseModel):
    items: List[ProductListResponse]
    total: int
    page: int
    size: int
    pages: int
