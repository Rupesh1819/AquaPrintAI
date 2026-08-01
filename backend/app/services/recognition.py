import os
import io
import uuid
import logging
from typing import Dict, Any, Optional, Tuple
from sqlalchemy.orm import Session
from sqlalchemy import or_, text, func
from PIL import Image, ImageEnhance
# Migrated from Google Cloud Vision API to Google Gemini Vision
from google import genai
from google.genai import types
from app.models.product import Product, ScanHistory, RecognitionType, BarcodeMapping

logger = logging.getLogger(__name__)

class RecognitionPipelineManager:
    def __init__(self, db: Session, user_id: Optional[uuid.UUID] = None):
        self.db = db
        self.user_id = user_id
        # Initialize Gemini Client
        gemini_key = getattr(settings, "gemini_api_key", os.environ.get("GEMINI_API_KEY"))
        if gemini_key and gemini_key != "dummy_key_for_testing" and gemini_key != "your-gemini-api-key-here":
            try:
                self.gemini_client = genai.Client(api_key=gemini_key)
            except Exception as e:
                logger.warning(f"Gemini Client not initialized properly: {e}")
                self.gemini_client = None
        else:
            self.gemini_client = None

    def preprocess_image(self, file_bytes: bytes) -> bytes:
        """Optimizes the image for the Vision API by resizing, compressing, and contrasting."""
        try:
            img = Image.open(io.BytesIO(file_bytes))
            # Convert to RGB if necessary (e.g. RGBA)
            if img.mode != 'RGB':
                img = img.convert('RGB')
                
            # Resize if too large (Google Vision handles up to a certain size, but smaller is faster)
            max_size = (1200, 1200)
            img.thumbnail(max_size, Image.Resampling.LANCZOS)
            
            # Optional Contrast Enhancement
            enhancer = ImageEnhance.Contrast(img)
            img = enhancer.enhance(1.2)
            
            output = io.BytesIO()
            img.save(output, format='JPEG', quality=85)
            return output.getvalue()
        except Exception as e:
            logger.error(f"Image preprocessing failed: {e}")
            return file_bytes # Fallback to original

    def extract_vision_data(self, image_bytes: bytes) -> Tuple[str, list]:
        """Calls Google Gemini API for OCR text and labels (Replaces Google Cloud Vision)."""
        import json
        
        if not self.gemini_client:
            return "", []
            
        try:
            # Prepare image for Gemini
            image_part = types.Part.from_bytes(data=image_bytes, mime_type="image/jpeg")
            
            # Create a precise prompt to simulate Cloud Vision text and label detection
            prompt = (
                "You are an image analysis system replacing Google Cloud Vision. "
                "Analyze the provided image and extract any visible text (OCR). "
                "Also, generate a list of descriptive labels for the image content (e.g. 'bottle', 'water', 'receipt', 'nutrition label'). "
                "You must return ONLY a raw JSON object with the following schema: "
                "{\n"
                "  \"ocr_text\": \"Extracted text here, or empty string if no text is found\",\n"
                "  \"labels\": [\"label1\", \"label2\", \"label3\"]\n"
                "}\n"
                "Do not include markdown formatting or backticks around the JSON."
            )
            
            response = self.gemini_client.models.generate_content(
                model="gemini-2.5-flash",
                contents=[image_part, prompt],
                config=types.GenerateContentConfig(
                    temperature=0.0
                )
            )
            
            result_text = response.text.strip()
            
            # Clean up potential markdown formatting if Gemini includes it despite instructions
            if result_text.startswith("```json"):
                result_text = result_text[7:]
            if result_text.startswith("```"):
                result_text = result_text[3:]
            if result_text.endswith("```"):
                result_text = result_text[:-3]
                
            data = json.loads(result_text)
            
            ocr_text = data.get("ocr_text", "")
            labels = data.get("labels", [])
            
            return ocr_text, labels
        except Exception as e:
            logger.error(f"Google Gemini Vision API call failed: {e}")
            return "", []

    def lookup_barcode(self, barcode: str) -> Optional[Product]:
        """Looks up a product directly via its barcode mapping."""
        mapping = self.db.query(BarcodeMapping).filter(BarcodeMapping.barcode == barcode).first()
        if mapping:
            return self.db.query(Product).filter(Product.id == mapping.product_id).first()
        return None

    def intelligent_match(self, ocr_text: str, labels: list) -> Tuple[Optional[Product], float]:
        """Uses Full-Text Search and Trigrams to match text and labels to products."""
        # Clean text
        search_terms = " ".join([ocr_text] + labels).replace('\n', ' ').strip()
        if not search_terms:
            return None, 0.0
            
        # Try finding a product via pg_trgm similarity
        # We query the highest similarity score
        query = self.db.query(
            Product,
            func.similarity(Product.name, search_terms).label("sim_score")
        ).filter(
            Product.name.op("%")(search_terms) | Product.search_vector.op("@@")(func.plainto_tsquery(search_terms))
        ).order_by(text("sim_score DESC")).first()
        
        if query:
            product, score = query
            # Normalizing score: standard trigram similarity is 0-1
            # We add weight if full-text search also matches (optional advanced logic)
            confidence = min(score + 0.1, 1.0)
            return product, confidence
            
        return None, 0.0

    def record_history(self, product_id: Optional[uuid.UUID], r_type: RecognitionType, success: bool, confidence: float, input_data: dict):
        """Records the scan outcome in the scan_history table."""
        history = ScanHistory(
            user_id=self.user_id,
            product_id=product_id,
            recognition_type=r_type,
            success=success,
            confidence_score=confidence,
            input_data=input_data
        )
        self.db.add(history)
        self.db.commit()

    def process_barcode(self, barcode: str) -> Dict[str, Any]:
        product = self.lookup_barcode(barcode)
        success = product is not None
        confidence = 1.0 if success else 0.0
        
        self.record_history(
            product_id=product.id if product else None,
            r_type=RecognitionType.BARCODE,
            success=success,
            confidence=confidence,
            input_data={"barcode": barcode}
        )
        
        return {
            "success": success,
            "product": product,
            "confidence": confidence,
            "requires_confirmation": False
        }

    def process_image(self, file_bytes: bytes) -> Dict[str, Any]:
        # 1. Preprocess
        optimized_bytes = self.preprocess_image(file_bytes)
        
        # 2. Vision OCR & Labels
        ocr_text, labels = self.extract_vision_data(optimized_bytes)
        
        if not ocr_text and not labels:
            self.record_history(None, RecognitionType.VISION, False, 0.0, {"error": "No text or labels extracted"})
            return {"success": False, "product": None, "confidence": 0.0, "requires_confirmation": True}
            
        # 3. Intelligent Match
        product, confidence = self.intelligent_match(ocr_text, labels)
        success = product is not None
        
        # Determine if confirmation is needed (threshold < 70%)
        requires_confirmation = confidence < 0.70 if success else True
        
        self.record_history(
            product_id=product.id if product else None,
            r_type=RecognitionType.VISION,
            success=success,
            confidence=confidence,
            input_data={"ocr": ocr_text, "labels": labels}
        )
        
        return {
            "success": success,
            "product": product,
            "confidence": confidence,
            "requires_confirmation": requires_confirmation,
            "extracted_text": ocr_text,
            "labels": labels
        }
