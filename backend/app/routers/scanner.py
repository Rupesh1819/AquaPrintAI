import uuid
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File
from sqlalchemy.orm import Session
from app.database import get_db
from app.dependencies import get_current_user_optional
from app.models.user import UserProfile
from app.schemas.scanner import BarcodeRequest, ScannerResponse
from app.services.recognition import RecognitionPipelineManager
import time

router = APIRouter()

@router.post("/barcode", response_model=ScannerResponse)
def scan_barcode(
    request: BarcodeRequest,
    current_user: UserProfile = Depends(get_current_user_optional),
    db: Session = Depends(get_db)
):
    """
    Look up a product via barcode. Follows the matching sequence:
    Local Cache (handled in frontend) -> Supabase (here) -> External (placeholder)
    """
    start_time = time.time()
    user_id = current_user.id if current_user else None
    manager = RecognitionPipelineManager(db=db, user_id=user_id)
    
    try:
        result = manager.process_barcode(request.barcode)
        processing_time = int((time.time() - start_time) * 1000)
        
        # We manually update the processing time in the history if needed
        # The manager handles the history creation natively
        
        return ScannerResponse(
            success=result["success"],
            product=result["product"],
            confidence=result["confidence"],
            requires_confirmation=result["requires_confirmation"],
            message="Product found via Barcode" if result["success"] else "Product not found for barcode."
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/image", response_model=ScannerResponse)
async def scan_image(
    file: UploadFile = File(...),
    current_user: UserProfile = Depends(get_current_user_optional),
    db: Session = Depends(get_db)
):
    """
    Process an image using OCR, Label Detection, and Intelligent Matching.
    """
    start_time = time.time()
    user_id = current_user.id if current_user else None
    manager = RecognitionPipelineManager(db=db, user_id=user_id)
    
    file_bytes = await file.read()
    
    try:
        result = manager.process_image(file_bytes)
        
        return ScannerResponse(
            success=result["success"],
            product=result["product"],
            confidence=result["confidence"],
            requires_confirmation=result["requires_confirmation"],
            extracted_text=result.get("extracted_text"),
            labels=result.get("labels"),
            message="Product recognized from image." if result["success"] else "Could not confidently identify product."
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
