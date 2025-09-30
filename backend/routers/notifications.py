from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List, Dict, Any
from datetime import datetime
import sys
sys.path.append('../')
from shared.enhanced_models import get_db, Notification, User, Job
from backend.auth import get_current_user, require_role
from pydantic import BaseModel

router = APIRouter(prefix="/notifications", tags=["notifications"])

class NotificationCreate(BaseModel):
    student_id: int
    title: str
    message: str
    type: str = "info"  # info, success, warning, error
    related_job_id: int = None

class NotificationResponse(BaseModel):
    id: int
    student_id: int
    title: str
    message: str
    type: str
    is_read: bool
    related_job_id: int = None
    created_at: datetime
    student: Dict[str, Any] = None
    related_job: Dict[str, Any] = None
    
    class Config:
        from_attributes = True

@router.post("/", response_model=NotificationResponse)
async def create_notification(
    notification: NotificationCreate,
    current_user: User = Depends(require_role(["tpo", "faculty"])),
    db: Session = Depends(get_db)
):
    """Create a new notification"""
    # Verify student exists
    student = db.query(User).filter(User.id == notification.student_id, User.role == "student").first()
    if not student:
        raise HTTPException(status_code=404, detail="Student not found")
    
    # Verify related job if provided
    if notification.related_job_id:
        job = db.query(Job).filter(Job.id == notification.related_job_id).first()
        if not job:
            raise HTTPException(status_code=404, detail="Related job not found")
    
    db_notification = Notification(**notification.dict())
    db.add(db_notification)
    db.commit()
    db.refresh(db_notification)
    
    return db_notification

@router.get("/", response_model=List[NotificationResponse])
async def list_notifications(
    is_read: bool = None,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """List notifications for current user"""
    query = db.query(Notification)
    
    # Students can only see their own notifications
    if current_user.role == "student":
        query = query.filter(Notification.student_id == current_user.id)
    elif current_user.role == "tpo":
        # TPO can see all notifications
        pass
    else:
        raise HTTPException(status_code=403, detail="Access denied")
    
    if is_read is not None:
        query = query.filter(Notification.is_read == is_read)
    
    notifications = query.order_by(Notification.created_at.desc()).all()
    return notifications

@router.get("/{notification_id}", response_model=NotificationResponse)
async def get_notification(
    notification_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get a specific notification"""
    notification = db.query(Notification).filter(Notification.id == notification_id).first()
    if not notification:
        raise HTTPException(status_code=404, detail="Notification not found")
    
    # Check access
    if current_user.role == "student" and notification.student_id != current_user.id:
        raise HTTPException(status_code=403, detail="Access denied")
    elif current_user.role not in ["tpo"]:
        raise HTTPException(status_code=403, detail="Access denied")
    
    return notification

@router.put("/{notification_id}/read")
async def mark_as_read(
    notification_id: int,
    current_user: User = Depends(require_role(["student"])),
    db: Session = Depends(get_db)
):
    """Mark a notification as read"""
    notification = db.query(Notification).filter(
        Notification.id == notification_id,
        Notification.student_id == current_user.id
    ).first()
    
    if not notification:
        raise HTTPException(status_code=404, detail="Notification not found")
    
    notification.is_read = True
    db.commit()
    
    return {"message": "Notification marked as read"}

@router.put("/read-all")
async def mark_all_as_read(
    current_user: User = Depends(require_role(["student"])),
    db: Session = Depends(get_db)
):
    """Mark all notifications as read for current user"""
    db.query(Notification).filter(
        Notification.student_id == current_user.id,
        Notification.is_read == False
    ).update({"is_read": True})
    
    db.commit()
    
    return {"message": "All notifications marked as read"}

@router.delete("/{notification_id}")
async def delete_notification(
    notification_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Delete a notification"""
    notification = db.query(Notification).filter(Notification.id == notification_id).first()
    if not notification:
        raise HTTPException(status_code=404, detail="Notification not found")
    
    # Check access
    if current_user.role == "student" and notification.student_id != current_user.id:
        raise HTTPException(status_code=403, detail="Access denied")
    elif current_user.role not in ["tpo"]:
        raise HTTPException(status_code=403, detail="Access denied")
    
    db.delete(notification)
    db.commit()
    
    return {"message": "Notification deleted successfully"}

@router.get("/stats/unread")
async def get_unread_count(
    current_user: User = Depends(require_role(["student"])),
    db: Session = Depends(get_db)
):
    """Get count of unread notifications for current user"""
    count = db.query(Notification).filter(
        Notification.student_id == current_user.id,
        Notification.is_read == False
    ).count()
    
    return {"unread_count": count}
