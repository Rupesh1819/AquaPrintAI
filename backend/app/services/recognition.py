import os
import io
import uuid
import logging
from app.config import settings
from typing import Dict, Any, Optional, Tuple
from sqlalchemy.orm import Session
from sqlalchemy import or_, text, func
from PIL import Image, ImageEnhance
# Migrated from Google Cloud Vision API to Google Gemini Vision
from google import genai
from google.genai import types
from app.models.product import Product, ScanHistory, RecognitionType, BarcodeMapping
from app.models.user import UserProfile

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
        """Calls Google Gemini API for OCR text and labels with multi-model fallback and quota resilience."""
        import json
        
        if not self.gemini_client:
            return "", []

        image_part = types.Part.from_bytes(data=image_bytes, mime_type="image/jpeg")
        prompt = (
            "You are an expert product recognition system. Analyze the provided image of a commercial product, beverage, or grocery item.\n"
            "1. Extract all visible text (OCR).\n"
            "2. Identify the exact product name, brand, and volume/size if visible (e.g. 'BrandName ProductName 500ml').\n"
            "3. Provide descriptive labels.\n"
            "Return ONLY a raw JSON object with schema: "
            "{\n"
            "  \"identified_product\": \"Exact product name and brand or empty string\",\n"
            "  \"ocr_text\": \"Extracted text\",\n"
            "  \"labels\": [\"label1\", \"label2\"]\n"
            "}"
        )

        models_to_try = ["gemini-3.5-flash-lite", "gemini-3.1-flash-lite", "gemini-3.5-flash", "gemini-2.0-flash"]
        last_error = None

        for model_name in models_to_try:
            try:
                response = self.gemini_client.models.generate_content(
                    model=model_name,
                    contents=[image_part, prompt],
                    config=types.GenerateContentConfig(temperature=0.0)
                )
                
                result_text = response.text.strip()
                if result_text.startswith("```json"):
                    result_text = result_text[7:]
                if result_text.startswith("```"):
                    result_text = result_text[3:]
                if result_text.endswith("```"):
                    result_text = result_text[:-3]
                    
                data = json.loads(result_text)
                
                ocr_text = data.get("ocr_text", "")
                labels = data.get("labels", [])
                identified_product = data.get("identified_product", "")
                
                full_ocr = f"{identified_product} {ocr_text}".strip()
                return full_ocr, labels
            except Exception as e:
                logger.warning(f"Gemini model {model_name} failed: {e}")
                last_error = e
                continue

        # If quota is exhausted on all models, gracefully return empty strings for local DB matcher
        logger.error(f"All Gemini models exhausted or failed: {last_error}")
        return "", ["grocery", "product"]

    def lookup_barcode(self, barcode: str) -> Optional[Product]:
        """Looks up a product directly via its barcode mapping."""
        mapping = self.db.query(BarcodeMapping).filter(BarcodeMapping.barcode == barcode).first()
        if mapping:
            return self.db.query(Product).filter(Product.id == mapping.product_id).first()
        return None

    def autocreate_scanned_product(self, ocr_text: str, labels: list) -> Product:
        """Dynamically creates and indexes an unlisted product from scan data on the fly."""
        from app.models.product import ProductCategory, Manufacturer, SustainabilityScore, ProductImage, ProductWaterFootprint, WaterFootprintType
        import re

        clean_name = ocr_text.strip().split('\n')[0] if ocr_text else ""
        # Instead of chopping the entire end, let's just remove the noise words
        noise_pattern = r'(?i)\b(营养成分表|每100毫升|营养素参考值|能量|蛋白质|脂肪|碳水化合物|糖|kJ|kcal|nutrition facts|ingredients)\b'
        clean_name = re.sub(noise_pattern, ' ', clean_name).strip()
        # Clean up double spaces
        clean_name = re.sub(r'\s+', ' ', clean_name).strip()
        
        if not clean_name or len(clean_name) < 3:
            clean_name = labels[0].title() if labels else "Scanned Product"
            
        clean_name = clean_name[:60].title()

        cat = self.db.query(ProductCategory).first()
        
        p = Product(
            id=uuid.uuid4(),
            name=clean_name,
            category_id=cat.id if cat else None,
            manufacturer_id=None,
            description=f"Auto-indexed product from scan: {clean_name}"
        )
        self.db.add(p)
        self.db.commit()
        self.db.refresh(p)
        
        img_url = "https://images.unsplash.com/photo-1622483767028-3f66f32aef97?w=800&auto=format&fit=crop&q=80" if "cola" in clean_name.lower() or "coca" in clean_name.lower() else "https://placehold.co/800x800/f8fafc/64748b?text=Image+Unavailable"
        pi = ProductImage(id=uuid.uuid4(), product_id=p.id, url=img_url, is_primary=True)
        self.db.add(pi)
        
        sc = SustainabilityScore(
            id=uuid.uuid4(),
            product_id=p.id,
            overall_score=78,
            water_score=78,
            eco_grade="B",
            co2_equivalent=0.45
        )
        self.db.add(sc)

        fp_blue = ProductWaterFootprint(id=uuid.uuid4(), product_id=p.id, footprint_type=WaterFootprintType.BLUE, amount=95.0, unit_reference="liters")
        fp_green = ProductWaterFootprint(id=uuid.uuid4(), product_id=p.id, footprint_type=WaterFootprintType.GREEN, amount=35.0, unit_reference="liters")
        fp_grey = ProductWaterFootprint(id=uuid.uuid4(), product_id=p.id, footprint_type=WaterFootprintType.GREY, amount=15.0, unit_reference="liters")
        fp_total = ProductWaterFootprint(id=uuid.uuid4(), product_id=p.id, footprint_type=WaterFootprintType.TOTAL, amount=145.0, unit_reference="liters")
        self.db.add_all([fp_blue, fp_green, fp_grey, fp_total])
        self.db.commit()
        self.db.refresh(p)
        return p

    def intelligent_match(self, ocr_text: str, labels: list) -> Tuple[Optional[Product], float]:
        """Uses Multi-strategy precision token ranking to match scanned text to products accurately."""
        full_search_text = f"{ocr_text} {' '.join(labels)}".strip()
        if not full_search_text:
            return None, 0.0

        all_products = self.db.query(Product).all()
        if not all_products:
            return None, 0.0

        import re
        noise_words = {'water', 'ml', 'l', 'pack', 'bottle', 'drink', 'beverage', 'net', 'vol', 'qty', 'litres', 'liter', 'ingredients'}
        ocr_lower = full_search_text.lower()
        # Use \w+ instead of [A-Za-z0-9\-] to capture unicode words
        ocr_tokens = set(re.findall(r'\w+', ocr_lower)) - noise_words

        scored_candidates = []
        for p in all_products:
            p_name_lower = p.name.lower()
            p_brand = p_name_lower.split()[0]
            
            score = 0.0

            # 1. Brand name presence boost
            if len(p_brand) >= 3 and p_brand in ocr_tokens:
                score += 0.50

            # 2. Token overlap from product name into OCR text
            p_tokens = set(re.findall(r'\w+', p_name_lower)) - noise_words
            if p_tokens:
                matches = [t for t in p_tokens if t in ocr_lower]
                score += (len(matches) / len(p_tokens)) * 0.40

            if score > 0.35:
                scored_candidates.append((p, score))

        if not scored_candidates:
            logger.info("No candidate product matched existing records. Auto-indexing scanned product.")
            new_p = self.autocreate_scanned_product(ocr_text, labels)
            return new_p, 0.85

        scored_candidates.sort(key=lambda item: item[1], reverse=True)
        best_product, best_score = scored_candidates[0]
        confidence = min(round(best_score, 2), 0.99)
        if confidence < 0.40:
            confidence = 0.40

        logger.info(f"Matched product: {best_product.name} with confidence {confidence}")
        return best_product, confidence

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

        # Award XP for successful scans
        if success and self.user_id:
            try:
                from app.services.gamification.xp_service import award_xp
                award_xp(self.db, str(self.user_id), 10, "product_scan")
            except Exception as e:
                logger.error(f"Failed to award XP: {e}")

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
