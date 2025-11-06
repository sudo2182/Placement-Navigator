from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form
from sqlalchemy.orm import Session
from typing import List, Dict, Any, Optional
from datetime import datetime
import sys
import os
sys.path.append('../')
from shared.enhanced_models import get_db, OptOutForm, User
from backend.auth import get_current_user, require_role
from backend.services.storage_service import storage_service
from pydantic import BaseModel

router = APIRouter(prefix="/opt-out", tags=["opt-out"])

class OptOutCreate(BaseModel):
    reason: str
    additional_info: str = None

class OptOutResponse(BaseModel):
    id: int
    student_id: int
    reason: str
    additional_info: str
    status: str
    submitted_at: datetime
    reviewed_at: datetime = None
    reviewed_by: int = None
    
    class Config:
        from_attributes = True

class OptOutReview(BaseModel):
    status: str  # approved, rejected
    notes: str = None

@router.post("/", response_model=OptOutResponse)
async def submit_opt_out(
    reason: str = Form(...),
    additional_info: Optional[str] = Form(None),
    file: Optional[UploadFile] = File(None),
    current_user: User = Depends(require_role(["student"])),
    db: Session = Depends(get_db)
):
    """Submit a placement opt-out form with optional PDF file upload"""
    # Check if student already has a pending or approved opt-out
    existing = db.query(OptOutForm).filter(
        OptOutForm.student_id == current_user.id,
        OptOutForm.status.in_(["pending", "approved"])
    ).first()
    
    if existing:
        raise HTTPException(status_code=400, detail="You already have a pending or approved opt-out request")
    
    # Handle file upload if provided
    file_path = None
    if file:
        # Validate file type
        if file.content_type != "application/pdf":
            raise HTTPException(status_code=400, detail="Only PDF files are accepted")
        
        # Read file content
        file_content = await file.read()
        
        # Generate file key
        file_key = f"opt-out/{current_user.id}/{datetime.utcnow().strftime('%Y%m%d_%H%M%S')}_{file.filename}"
        
        # Upload to storage
        if storage_service.upload_file(file_content, file_key, "application/pdf"):
            file_path = file_key
        else:
            raise HTTPException(status_code=500, detail="Failed to upload file")
    
    db_opt_out = OptOutForm(
        student_id=current_user.id,
        reason=reason,
        additional_info=additional_info,
        file_path=file_path
    )
    
    db.add(db_opt_out)
    db.commit()
    db.refresh(db_opt_out)
    
    return db_opt_out

@router.get("/", response_model=List[OptOutResponse])
async def list_opt_outs(
    status: str = None,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """List opt-out forms"""
    query = db.query(OptOutForm)
    
    # Students can only see their own, TPO can see all
    if current_user.role == "student":
        query = query.filter(OptOutForm.student_id == current_user.id)
    elif current_user.role not in ["tpo"]:
        raise HTTPException(status_code=403, detail="Access denied")
    
    if status:
        query = query.filter(OptOutForm.status == status)
    
    opt_outs = query.order_by(OptOutForm.submitted_at.desc()).all()
    return opt_outs

@router.get("/{opt_out_id}", response_model=OptOutResponse)
async def get_opt_out(
    opt_out_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get a specific opt-out form"""
    opt_out = db.query(OptOutForm).filter(OptOutForm.id == opt_out_id).first()
    if not opt_out:
        raise HTTPException(status_code=404, detail="Opt-out form not found")
    
    # Students can only see their own, TPO can see all
    if current_user.role == "student" and opt_out.student_id != current_user.id:
        raise HTTPException(status_code=403, detail="Access denied")
    elif current_user.role not in ["tpo"]:
        raise HTTPException(status_code=403, detail="Access denied")
    
    return opt_out

@router.put("/{opt_out_id}/review", response_model=OptOutResponse)
async def review_opt_out(
    opt_out_id: int,
    review: OptOutReview,
    current_user: User = Depends(require_role(["tpo"])),
    db: Session = Depends(get_db)
):
    """Review and approve/reject an opt-out form"""
    opt_out = db.query(OptOutForm).filter(OptOutForm.id == opt_out_id).first()
    if not opt_out:
        raise HTTPException(status_code=404, detail="Opt-out form not found")
    
    if opt_out.status != "pending":
        raise HTTPException(status_code=400, detail="Opt-out form has already been reviewed")
    
    opt_out.status = review.status
    opt_out.reviewed_at = datetime.utcnow()
    opt_out.reviewed_by = current_user.id
    
    if review.notes:
        opt_out.additional_info = f"{opt_out.additional_info}\n\nReview Notes: {review.notes}"
    
    db.commit()
    db.refresh(opt_out)
    
    return opt_out
