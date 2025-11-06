"""
Resume Upload Router
Handles PDF resume uploads, text extraction, and storage
"""
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File
from sqlalchemy.orm import Session
from typing import Dict, Any
from datetime import datetime
import sys
import os
import uuid
import logging

sys.path.append('../')
from shared.models import get_db, ResumeUpload, User
from backend.auth import get_current_user
from backend.services.storage_service import storage_service
from backend.services.pdf_extractor import pdf_extractor

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api/v1/resumes", tags=["resumes"])

# Constants
MAX_FILE_SIZE = 5 * 1024 * 1024  # 5MB in bytes
ALLOWED_MIME_TYPES = ["application/pdf"]
ALLOWED_EXTENSIONS = [".pdf"]

@router.post("/upload")
async def upload_resume(
    file: UploadFile = File(...),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
) -> Dict[str, Any]:
    """
    Upload a PDF resume, extract text, and store in S3/MinIO
    
    Requirements:
    - Only accepts .pdf files
    - Max size: 5MB
    - Validates MIME type (application/pdf)
    - Extracts text using PyMuPDF
    - Stores file in S3 bucket 'resumes/'
    - Saves record to resume_uploads table
    
    Returns:
        {
            "upload_id": "<uuid>",
            "file_key": "<string>",
            "chars": <int>,
            "pages": <int>
        }
    """
    
    # Validate file extension
    if not file.filename:
        raise HTTPException(status_code=400, detail="Filename is required")
    
    file_extension = os.path.splitext(file.filename.lower())[1]
    if file_extension not in ALLOWED_EXTENSIONS:
        raise HTTPException(
            status_code=400,
            detail=f"Invalid file type. Only {', '.join(ALLOWED_EXTENSIONS)} files are allowed."
        )
    
    # Validate MIME type
    if file.content_type not in ALLOWED_MIME_TYPES:
        raise HTTPException(
            status_code=400,
            detail=f"Invalid MIME type. Expected application/pdf, got {file.content_type}"
        )
    
    # Read file content
    try:
        file_content = await file.read()
    except Exception as e:
        logger.error(f"Failed to read file: {str(e)}")
        raise HTTPException(status_code=400, detail="Failed to read file")
    
    # Validate file size
    file_size = len(file_content)
    if file_size > MAX_FILE_SIZE:
        raise HTTPException(
            status_code=400,
            detail=f"File size exceeds maximum allowed size of {MAX_FILE_SIZE / (1024*1024):.1f}MB"
        )
    
    if file_size == 0:
        raise HTTPException(status_code=400, detail="File is empty")
    
    # Validate PDF format
    if not pdf_extractor.validate_pdf(file_content):
        raise HTTPException(status_code=400, detail="Invalid PDF file")
    
    # Generate unique file key
    upload_id = str(uuid.uuid4())
    file_key = f"resumes/{current_user.id}/{upload_id}{file_extension}"
    
    # Extract text from PDF
    parsed_text, char_count, page_count = pdf_extractor.extract_text(file_content)
    
    # Log extraction time (already logged in pdf_extractor)
    if not parsed_text:
        logger.warning(f"PDF extraction returned empty text for upload {upload_id}. File may be scanned.")
        # Don't fail - return empty text as per requirements
    
    # Upload to S3/MinIO
    upload_success = storage_service.upload_file(
        file_content=file_content,
        file_key=file_key,
        content_type="application/pdf"
    )
    
    if not upload_success:
        logger.error(f"Failed to upload file to storage for upload {upload_id}")
        raise HTTPException(status_code=500, detail="Failed to upload file to storage")
    
    # Save record to database
    try:
        db_upload = ResumeUpload(
            id=upload_id,
            user_id=current_user.id,
            file_key=file_key,
            parsed_text=parsed_text if parsed_text else "",  # Store empty string if no text
            uploaded_at=datetime.utcnow()
        )
        
        db.add(db_upload)
        db.commit()
        db.refresh(db_upload)
        
        logger.info(f"Resume uploaded successfully: upload_id={upload_id}, user_id={current_user.id}, pages={page_count}, chars={char_count}")
        
        return {
            "upload_id": upload_id,
            "file_key": file_key,
            "chars": char_count,
            "pages": page_count
        }
        
    except Exception as e:
        logger.error(f"Failed to save upload record to database: {str(e)}")
        # Try to cleanup uploaded file
        storage_service.delete_file(file_key)
        db.rollback()
        raise HTTPException(status_code=500, detail="Failed to save upload record")


