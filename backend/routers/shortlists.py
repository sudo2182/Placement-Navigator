from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List, Dict, Any
from datetime import datetime
import sys
sys.path.append('../')
from shared.enhanced_models import get_db, Shortlist, Job, User
from backend.auth import get_current_user, require_role
from pydantic import BaseModel

router = APIRouter(prefix="/shortlists", tags=["shortlists"])

class ShortlistCreate(BaseModel):
    job_id: int
    student_id: int
    round_name: str
    status: str = "shortlisted"
    notes: str = None

class ShortlistResponse(BaseModel):
    id: int
    job_id: int
    student_id: int
    round_name: str
    status: str
    notes: str
    created_at: datetime
    job: Dict[str, Any] = None
    student: Dict[str, Any] = None
    
    class Config:
        from_attributes = True

@router.post("/", response_model=ShortlistResponse)
async def create_shortlist(
    shortlist: ShortlistCreate,
    current_user: User = Depends(require_role(["tpo", "employer"])),
    db: Session = Depends(get_db)
):
    """Add a student to shortlist for a job"""
    # Verify job exists and user has access
    job = db.query(Job).filter(Job.id == shortlist.job_id).first()
    if not job:
        raise HTTPException(status_code=404, detail="Job not found")
    
    if job.posted_by != current_user.id and current_user.role != "tpo":
        raise HTTPException(status_code=403, detail="Access denied")
    
    # Verify student exists
    student = db.query(User).filter(User.id == shortlist.student_id, User.role == "student").first()
    if not student:
        raise HTTPException(status_code=404, detail="Student not found")
    
    # Check if already shortlisted
    existing = db.query(Shortlist).filter(
        Shortlist.job_id == shortlist.job_id,
        Shortlist.student_id == shortlist.student_id,
        Shortlist.round_name == shortlist.round_name
    ).first()
    
    if existing:
        raise HTTPException(status_code=400, detail="Student already shortlisted for this round")
    
    db_shortlist = Shortlist(**shortlist.dict())
    db.add(db_shortlist)
    db.commit()
    db.refresh(db_shortlist)
    
    return db_shortlist

@router.get("/", response_model=List[ShortlistResponse])
async def list_shortlists(
    job_id: int = None,
    student_id: int = None,
    round_name: str = None,
    db: Session = Depends(get_db)
):
    """List shortlists with optional filtering"""
    query = db.query(Shortlist)
    
    if job_id:
        query = query.filter(Shortlist.job_id == job_id)
    if student_id:
        query = query.filter(Shortlist.student_id == student_id)
    if round_name:
        query = query.filter(Shortlist.round_name == round_name)
    
    shortlists = query.order_by(Shortlist.created_at.desc()).all()
    return shortlists

@router.get("/{shortlist_id}", response_model=ShortlistResponse)
async def get_shortlist(
    shortlist_id: int,
    db: Session = Depends(get_db)
):
    """Get a specific shortlist entry"""
    shortlist = db.query(Shortlist).filter(Shortlist.id == shortlist_id).first()
    if not shortlist:
        raise HTTPException(status_code=404, detail="Shortlist not found")
    
    return shortlist

@router.put("/{shortlist_id}", response_model=ShortlistResponse)
async def update_shortlist(
    shortlist_id: int,
    shortlist: ShortlistCreate,
    current_user: User = Depends(require_role(["tpo", "employer"])),
    db: Session = Depends(get_db)
):
    """Update a shortlist entry"""
    db_shortlist = db.query(Shortlist).filter(Shortlist.id == shortlist_id).first()
    if not db_shortlist:
        raise HTTPException(status_code=404, detail="Shortlist not found")
    
    # Verify job access
    job = db.query(Job).filter(Job.id == db_shortlist.job_id).first()
    if job.posted_by != current_user.id and current_user.role != "tpo":
        raise HTTPException(status_code=403, detail="Access denied")
    
    for key, value in shortlist.dict().items():
        setattr(db_shortlist, key, value)
    
    db.commit()
    db.refresh(db_shortlist)
    
    return db_shortlist

@router.delete("/{shortlist_id}")
async def delete_shortlist(
    shortlist_id: int,
    current_user: User = Depends(require_role(["tpo", "employer"])),
    db: Session = Depends(get_db)
):
    """Remove a student from shortlist"""
    db_shortlist = db.query(Shortlist).filter(Shortlist.id == shortlist_id).first()
    if not db_shortlist:
        raise HTTPException(status_code=404, detail="Shortlist not found")
    
    # Verify job access
    job = db.query(Job).filter(Job.id == db_shortlist.job_id).first()
    if job.posted_by != current_user.id and current_user.role != "tpo":
        raise HTTPException(status_code=403, detail="Access denied")
    
    db.delete(db_shortlist)
    db.commit()
    
    return {"message": "Student removed from shortlist successfully"}
