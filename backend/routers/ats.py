from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form
from typing import Dict, Any, Optional
from sqlalchemy.orm import Session
from datetime import datetime
import os

from backend.auth import get_current_user
from shared.models import get_db, User
from backend.services.ats_service import ats_service
from backend.services.pdf_extractor import pdf_extractor

router = APIRouter(prefix="/api/v1/ats", tags=["ats"]) 

MAX_FILE_SIZE = 5 * 1024 * 1024  # 5MB

@router.post("/scan")
async def scan_resume(
    file: Optional[UploadFile] = File(None),
    text: Optional[str] = Form(None),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
) -> Dict[str, Any]:
    """
    Analyze a resume for ATS compatibility.
    Accepts either:
      - PDF file upload (multipart/form-data), or
      - Plain text (form field 'text')
    Returns score, sections, contact info, skills, and recommendations.
    """
    if not file and not text:
        raise HTTPException(status_code=400, detail="Provide a PDF file or resume text")

    # If PDF provided, validate and extract text
    if file:
        if not file.filename.lower().endswith(".pdf"):
            raise HTTPException(status_code=400, detail="Only PDF files are supported")
        if file.content_type != "application/pdf":
            raise HTTPException(status_code=400, detail="Invalid MIME type; expected application/pdf")
        content = await file.read()
        if len(content) == 0:
            raise HTTPException(status_code=400, detail="File is empty")
        if len(content) > MAX_FILE_SIZE:
            raise HTTPException(status_code=400, detail="File exceeds 5MB limit")
        if not pdf_extractor.validate_pdf(content):
            raise HTTPException(status_code=400, detail="Invalid PDF file")
        result = ats_service.analyze_pdf_bytes(content)
    else:
        # Analyze plain text
        plain = (text or "").strip()
        if not plain:
            raise HTTPException(status_code=400, detail="Text is empty")
        result = ats_service.analyze_text(plain)

    return {
        "analyzed_at": datetime.utcnow().isoformat(),
        "user_id": current_user.id,
        **result,
    }
