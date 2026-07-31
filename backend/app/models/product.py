from sqlalchemy import Column, String, Integer, Float, DateTime, Boolean, ForeignKey, Enum, JSON, Text, Index
from sqlalchemy.dialects.postgresql import UUID, TSVECTOR
from sqlalchemy.orm import relationship
import uuid
import enum
from datetime import datetime, timezone
from app.database import Base

class WaterFootprintType(str, enum.Enum):
    BLUE = "blue"
    GREEN = "green"
    GREY = "grey"
    TOTAL = "total"

class RecognitionType(str, enum.Enum):
    BARCODE = "barcode"
    OCR = "ocr"
    VISION = "vision"
    TEXT_SEARCH = "text_search"

class ProductCategory(Base):
    __tablename__ = "product_categories"
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    name = Column(String, unique=True, index=True, nullable=False)
    description = Column(Text, nullable=True)
    icon_url = Column(String, nullable=True)
    parent_id = Column(UUID(as_uuid=True), ForeignKey("product_categories.id"), nullable=True)

    products = relationship("Product", back_populates="category")

class Manufacturer(Base):
    __tablename__ = "manufacturers"
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    name = Column(String, unique=True, index=True, nullable=False)
    description = Column(Text, nullable=True)
    website = Column(String, nullable=True)
    country_of_origin = Column(String, nullable=True)

    products = relationship("Product", back_populates="manufacturer")

class Product(Base):
    __tablename__ = "products"
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    name = Column(String, index=True, nullable=False)
    description = Column(Text, nullable=True)
    category_id = Column(UUID(as_uuid=True), ForeignKey("product_categories.id"), nullable=False)
    manufacturer_id = Column(UUID(as_uuid=True), ForeignKey("manufacturers.id"), nullable=True)
    unit = Column(String, nullable=False, default="kg") # e.g. kg, liter, piece
    is_verified = Column(Boolean, default=False)
    search_vector = Column(TSVECTOR)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
    updated_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))

    __table_args__ = (
        Index('idx_product_name_trgm', 'name', postgresql_ops={'name': 'gin_trgm_ops'}, postgresql_using='gin'),
        Index('idx_product_search', 'search_vector', postgresql_using='gin'),
    )

    category = relationship("ProductCategory", back_populates="products")
    manufacturer = relationship("Manufacturer", back_populates="products")
    images = relationship("ProductImage", back_populates="product", cascade="all, delete-orphan")
    water_footprints = relationship("ProductWaterFootprint", back_populates="product", cascade="all, delete-orphan")
    sustainability_score = relationship("SustainabilityScore", back_populates="product", uselist=False, cascade="all, delete-orphan")
    attributes = relationship("ProductAttribute", back_populates="product", cascade="all, delete-orphan")

class ProductImage(Base):
    __tablename__ = "product_images"
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    product_id = Column(UUID(as_uuid=True), ForeignKey("products.id", ondelete="CASCADE"), nullable=False)
    url = Column(String, nullable=False)
    thumbnail_url = Column(String, nullable=True)
    blur_hash = Column(String, nullable=True)
    dominant_color = Column(String, nullable=True)
    is_primary = Column(Boolean, default=False)

    product = relationship("Product", back_populates="images")

class WaterFootprintSource(Base):
    __tablename__ = "water_footprint_sources"
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    name = Column(String, nullable=False) # e.g. "Water Footprint Network"
    url = Column(String, nullable=True)
    reliability_score = Column(Integer, default=5) # 1-10

    footprints = relationship("ProductWaterFootprint", back_populates="source")

class ProductWaterFootprint(Base):
    __tablename__ = "product_water_footprints"
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    product_id = Column(UUID(as_uuid=True), ForeignKey("products.id", ondelete="CASCADE"), nullable=False)
    footprint_type = Column(Enum(WaterFootprintType), nullable=False)
    amount = Column(Float, nullable=False) # In liters
    unit_reference = Column(String, nullable=False) # e.g. "per kg"
    source_id = Column(UUID(as_uuid=True), ForeignKey("water_footprint_sources.id"), nullable=True)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

    product = relationship("Product", back_populates="water_footprints")
    source = relationship("WaterFootprintSource", back_populates="footprints")

class WaterFootprintVersion(Base):
    __tablename__ = "water_footprint_versions"
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    footprint_id = Column(UUID(as_uuid=True), ForeignKey("product_water_footprints.id", ondelete="CASCADE"), nullable=False)
    amount = Column(Float, nullable=False)
    changed_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
    reason = Column(String, nullable=True)

class SustainabilityScore(Base):
    __tablename__ = "sustainability_scores"
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    product_id = Column(UUID(as_uuid=True), ForeignKey("products.id", ondelete="CASCADE"), unique=True, nullable=False)
    eco_grade = Column(String, nullable=False) # e.g. A, B, C, D, E, F
    co2_equivalent = Column(Float, nullable=True) # kg CO2
    water_score = Column(Integer, nullable=True) # 0-100
    overall_score = Column(Integer, nullable=True) # 0-100

    product = relationship("Product", back_populates="sustainability_score")

class ConservationTip(Base):
    __tablename__ = "conservation_tips"
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    product_id = Column(UUID(as_uuid=True), ForeignKey("products.id", ondelete="CASCADE"), nullable=True)
    category_id = Column(UUID(as_uuid=True), ForeignKey("product_categories.id", ondelete="CASCADE"), nullable=True)
    tip_text = Column(Text, nullable=False)
    impact_level = Column(String, default="medium") # low, medium, high

class BarcodeMapping(Base):
    __tablename__ = "barcode_mapping"
    barcode = Column(String, primary_key=True)
    product_id = Column(UUID(as_uuid=True), ForeignKey("products.id", ondelete="CASCADE"), nullable=False)
    format = Column(String, default="EAN13") # UPCA, EAN13, etc

class ProductAlternative(Base):
    __tablename__ = "product_alternatives"
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    product_id = Column(UUID(as_uuid=True), ForeignKey("products.id", ondelete="CASCADE"), nullable=False)
    alternative_product_id = Column(UUID(as_uuid=True), ForeignKey("products.id", ondelete="CASCADE"), nullable=False)
    water_saved = Column(Float, nullable=True)
    reason = Column(Text, nullable=True)

class Tag(Base):
    __tablename__ = "tags"
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    name = Column(String, unique=True, index=True, nullable=False)

class ProductTag(Base):
    __tablename__ = "product_tags"
    product_id = Column(UUID(as_uuid=True), ForeignKey("products.id", ondelete="CASCADE"), primary_key=True)
    tag_id = Column(UUID(as_uuid=True), ForeignKey("tags.id", ondelete="CASCADE"), primary_key=True)

class ProductAttribute(Base):
    __tablename__ = "product_attributes"
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    product_id = Column(UUID(as_uuid=True), ForeignKey("products.id", ondelete="CASCADE"), nullable=False)
    key = Column(String, nullable=False)
    value = Column(String, nullable=False)

    product = relationship("Product", back_populates="attributes")

class ScanHistory(Base):
    __tablename__ = "scan_history"
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("user_profiles.id", ondelete="SET NULL"), nullable=True)
    product_id = Column(UUID(as_uuid=True), ForeignKey("products.id", ondelete="SET NULL"), nullable=True)
    recognition_type = Column(Enum(RecognitionType), nullable=False)
    success = Column(Boolean, default=False)
    confidence_score = Column(Float, nullable=True) # 0 to 1
    input_data = Column(JSON, nullable=True) # e.g. barcode string, or image url, or OCR text
    processing_time_ms = Column(Integer, nullable=True)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

    product = relationship("Product")

