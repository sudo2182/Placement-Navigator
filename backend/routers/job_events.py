from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List, Dict, Any
from datetime import datetime, date, time
import sys
sys.path.append('../')
from shared.enhanced_models import get_db, JobEvent, Job, User
from backend.auth import get_current_user, require_role
from pydantic import BaseModel
from datetime import date, time

router = APIRouter(prefix="/job-events", tags=["job-events"])

class JobEventCreate(BaseModel):
    job_id: int
    event_type: str
    title: str
    description: str = None
    event_date: date
    event_time: time
    location: str = None
    max_participants: int = None

class JobEventResponse(BaseModel):
    id: int
    job_id: int
    event_type: str
    title: str
    description: str
    event_date: date
    event_time: time
    location: str
    max_participants: int
    created_at: datetime
    
    class Config:
        from_attributes = True

@router.post("/", response_model=JobEventResponse)
async def create_job_event(
    event: JobEventCreate,
    current_user: User = Depends(require_role(["tpo", "employer"])),
    db: Session = Depends(get_db)
):
    """Create a new job event (test, interview, etc.)"""
    # Verify job exists and user has access
    job = db.query(Job).filter(Job.id == event.job_id).first()
    if not job:
        raise HTTPException(status_code=404, detail="Job not found")
    
    if job.posted_by != current_user.id and current_user.role != "tpo":
        raise HTTPException(status_code=403, detail="Access denied")
    
    db_event = JobEvent(**event.dict())
    db.add(db_event)
    db.commit()
    db.refresh(db_event)
    
    return db_event

@router.get("/", response_model=List[JobEventResponse])
async def list_job_events(
    job_id: int = None,
    db: Session = Depends(get_db)
):
    """List job events, optionally filtered by job_id"""
    query = db.query(JobEvent)
    
    if job_id:
        query = query.filter(JobEvent.job_id == job_id)
    
    events = query.order_by(JobEvent.event_date, JobEvent.event_time).all()
    return events

@router.get("/{event_id}", response_model=JobEventResponse)
async def get_job_event(
    event_id: int,
    db: Session = Depends(get_db)
):
    """Get a specific job event"""
    event = db.query(JobEvent).filter(JobEvent.id == event_id).first()
    if not event:
        raise HTTPException(status_code=404, detail="Job event not found")
    
    return event

@router.put("/{event_id}", response_model=JobEventResponse)
async def update_job_event(
    event_id: int,
    event: JobEventCreate,
    current_user: User = Depends(require_role(["tpo", "employer"])),
    db: Session = Depends(get_db)
):
    """Update a job event"""
    db_event = db.query(JobEvent).filter(JobEvent.id == event_id).first()
    if not db_event:
        raise HTTPException(status_code=404, detail="Job event not found")
    
    # Verify job access
    job = db.query(Job).filter(Job.id == db_event.job_id).first()
    if job.posted_by != current_user.id and current_user.role != "tpo":
        raise HTTPException(status_code=403, detail="Access denied")
    
    for key, value in event.dict().items():
        setattr(db_event, key, value)
    
    db.commit()
    db.refresh(db_event)
    
    return db_event

@router.delete("/{event_id}")
async def delete_job_event(
    event_id: int,
    current_user: User = Depends(require_role(["tpo", "employer"])),
    db: Session = Depends(get_db)
):
    """Delete a job event"""
    db_event = db.query(JobEvent).filter(JobEvent.id == event_id).first()
    if not db_event:
        raise HTTPException(status_code=404, detail="Job event not found")
    
    # Verify job access
    job = db.query(Job).filter(Job.id == db_event.job_id).first()
    if job.posted_by != current_user.id and current_user.role != "tpo":
        raise HTTPException(status_code=403, detail="Access denied")
    
    db.delete(db_event)
    db.commit()
    
    return {"message": "Job event deleted successfully"}
