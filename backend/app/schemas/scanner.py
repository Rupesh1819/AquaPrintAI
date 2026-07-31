from pydantic import BaseModel, Field
from typing import Optional, List, Any
from app.schemas.product import ProductDetailResponse

class BarcodeRequest(BaseModel):
    barcode: str = Field(..., description="The scanned barcode string")
    format: Optional[str] = Field(None, description="Barcode format e.g. EAN-13, UPC")

class ScannerResponse(BaseModel):
    success: bool = Field(..., description="Whether a product was successfully matched")
    product: Optional[ProductDetailResponse] = Field(None, description="The matched product details")
    confidence: float = Field(..., description="Confidence score between 0.0 and 1.0")
    requires_confirmation: bool = Field(..., description="True if confidence is below the automatic acceptance threshold")
    extracted_text: Optional[str] = Field(None, description="Text extracted from the image via OCR")
    labels: Optional[List[str]] = Field(None, description="Object labels extracted from the image via Vision API")
    message: Optional[str] = Field(None, description="Informational or error message")
