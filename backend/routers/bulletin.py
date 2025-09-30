from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List, Dict, Any
from datetime import datetime
import sys
sys.path.append('../')
from shared.enhanced_models import get_db, BulletinPost, User
from backend.auth import get_current_user, require_role
from pydantic import BaseModel

router = APIRouter(prefix="/bulletin", tags=["bulletin"])

class BulletinCreate(BaseModel):
    title: str
    content: str
    post_type: str = "announcement"
    target_audience: str = "all"

class BulletinResponse(BaseModel):
    id: int
    title: str
    content: str
    post_type: str
    target_audience: str
    posted_by: int
    is_active: bool
    created_at: datetime
    updated_at: datetime
    
    class Config:
        from_attributes = True

@router.post("/", response_model=BulletinResponse)
async def create_bulletin_post(
    post: BulletinCreate,
    current_user: User = Depends(require_role(["tpo", "faculty"])),
    db: Session = Depends(get_db)
):
    """Create a new bulletin post"""
    db_post = BulletinPost(
        **post.dict(),
        posted_by=current_user.id
    )
    
    db.add(db_post)
    db.commit()
    db.refresh(db_post)
    
    return db_post

@router.get("/", response_model=List[BulletinResponse])
async def list_bulletin_posts(
    post_type: str = None,
    target_audience: str = None,
    is_active: bool = True,
    db: Session = Depends(get_db)
):
    """List bulletin posts with optional filtering"""
    query = db.query(BulletinPost)
    
    if post_type:
        query = query.filter(BulletinPost.post_type == post_type)
    if target_audience:
        query = query.filter(BulletinPost.target_audience == target_audience)
    if is_active is not None:
        query = query.filter(BulletinPost.is_active == is_active)
    
    posts = query.order_by(BulletinPost.created_at.desc()).all()
    return posts

@router.get("/{post_id}", response_model=BulletinResponse)
async def get_bulletin_post(
    post_id: int,
    db: Session = Depends(get_db)
):
    """Get a specific bulletin post"""
    post = db.query(BulletinPost).filter(BulletinPost.id == post_id).first()
    if not post:
        raise HTTPException(status_code=404, detail="Bulletin post not found")
    
    return post

@router.put("/{post_id}", response_model=BulletinResponse)
async def update_bulletin_post(
    post_id: int,
    post: BulletinCreate,
    current_user: User = Depends(require_role(["tpo", "faculty"])),
    db: Session = Depends(get_db)
):
    """Update a bulletin post"""
    db_post = db.query(BulletinPost).filter(BulletinPost.id == post_id).first()
    if not db_post:
        raise HTTPException(status_code=404, detail="Bulletin post not found")
    
    # Only author or TPO can update
    if db_post.posted_by != current_user.id and current_user.role != "tpo":
        raise HTTPException(status_code=403, detail="Access denied")
    
    for key, value in post.dict().items():
        setattr(db_post, key, value)
    
    db_post.updated_at = datetime.utcnow()
    db.commit()
    db.refresh(db_post)
    
    return db_post

@router.delete("/{post_id}")
async def delete_bulletin_post(
    post_id: int,
    current_user: User = Depends(require_role(["tpo", "faculty"])),
    db: Session = Depends(get_db)
):
    """Delete a bulletin post"""
    db_post = db.query(BulletinPost).filter(BulletinPost.id == post_id).first()
    if not db_post:
        raise HTTPException(status_code=404, detail="Bulletin post not found")
    
    # Only author or TPO can delete
    if db_post.posted_by != current_user.id and current_user.role != "tpo":
        raise HTTPException(status_code=403, detail="Access denied")
    
    db.delete(db_post)
    db.commit()
    
    return {"message": "Bulletin post deleted successfully"}
