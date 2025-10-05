from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import Dict, Any, Optional, List
from pydantic import BaseModel
import sys
sys.path.append('../')
from shared.models import get_db, User
from backend.auth import get_current_user, require_role

router = APIRouter(prefix="/profiles", tags=["profiles"])

class ProfileUpdate(BaseModel):
    personal: Optional[Dict[str, Any]] = None
    academic: Optional[Dict[str, Any]] = None
    internships: Optional[list] = None
    projects: Optional[list] = None
    skills: Optional[Dict[str, Any]] = None
    achievements: Optional[list] = None
    certifications: Optional[list] = None

class ProfileResponse(BaseModel):
    id: int
    email: str
    role: str
    profile_data: Dict[str, Any]
    is_active: bool
    created_at: str
    updated_at: str
    
    class Config:
        from_attributes = True

@router.get("/me", response_model=ProfileResponse)
async def get_my_profile(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get current user's profile data"""
    return current_user

@router.put("/me", response_model=ProfileResponse)
async def update_my_profile(
    profile_update: ProfileUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Update current user's profile data"""
    
    # Get current profile data
    current_profile = current_user.profile_data or {}
    
    # Update profile data with new information
    updated_profile = current_profile.copy()
    
    if profile_update.personal is not None:
        updated_profile["personal"] = profile_update.personal
    
    if profile_update.academic is not None:
        updated_profile["academic"] = profile_update.academic
    
    if profile_update.internships is not None:
        updated_profile["internships"] = profile_update.internships
    
    if profile_update.projects is not None:
        updated_profile["projects"] = profile_update.projects
    
    if profile_update.skills is not None:
        updated_profile["skills"] = profile_update.skills
    
    if profile_update.achievements is not None:
        updated_profile["achievements"] = profile_update.achievements
    
    if profile_update.certifications is not None:
        updated_profile["certifications"] = profile_update.certifications
    
    # Update user in database
    current_user.profile_data = updated_profile
    db.commit()
    db.refresh(current_user)
    
    return current_user

@router.get("/{user_id}", response_model=ProfileResponse)
async def get_user_profile(
    user_id: int,
    current_user: User = Depends(require_role(["tpo", "faculty"])),
    db: Session = Depends(get_db)
):
    """Get a specific user's profile (TPO/Faculty only)"""
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    return user

@router.get("/", response_model=List[ProfileResponse])
async def list_profiles(
    role: Optional[str] = None,
    current_user: User = Depends(require_role(["tpo", "faculty"])),
    db: Session = Depends(get_db)
):
    """List all user profiles (TPO/Faculty only)"""
    query = db.query(User)
    
    if role:
        query = query.filter(User.role == role)
    
    users = query.all()
    return users
