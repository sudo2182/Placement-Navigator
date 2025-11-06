from fastapi import APIRouter, Depends, HTTPException, UploadFile, File
from sqlalchemy.orm import Session
from typing import Dict, Any, Optional, List
from pydantic import BaseModel
import sys
import csv
import io
sys.path.append('../')
from shared.models import get_db, User
from backend.auth import get_current_user, require_role, get_password_hash
from datetime import datetime

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

class BulkUploadResult(BaseModel):
    total: int
    imported: int
    duplicates: int
    errors: int
    results: List[Dict[str, Any]]

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

@router.post("/bulk-upload", response_model=BulkUploadResult)
async def bulk_upload_students(
    file: UploadFile = File(...),
    current_user: User = Depends(require_role(["tpo"])),
    db: Session = Depends(get_db)
):
    """Bulk upload students from CSV/Excel file"""
    if not file.filename.endswith(('.csv', '.xlsx', '.xls')):
        raise HTTPException(status_code=400, detail="Only CSV and Excel files are supported")
    
    content = await file.read()
    
    # Parse CSV
    try:
        csv_content = content.decode('utf-8')
        csv_reader = csv.DictReader(io.StringIO(csv_content))
        rows = list(csv_reader)
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Failed to parse CSV: {str(e)}")
    
    results = []
    imported = 0
    duplicates = 0
    errors = 0
    
    for row in rows:
        try:
            # Extract data from CSV row
            email = row.get('email', '').strip()
            sapid = row.get('sapid', '').strip()
            name = row.get('name', '').strip()
            branch = row.get('branch', '').strip()
            cgpa = row.get('cgpa', '').strip()
            backlogs = row.get('backlogs', '0').strip()
            year = row.get('year', '').strip()
            phone = row.get('phone', '').strip()
            city = row.get('city', '').strip()
            skills = row.get('skills', '').strip()
            internships = row.get('internships', '').strip()
            
            if not email:
                errors += 1
                results.append({
                    "sapid": sapid or "N/A",
                    "name": name or "N/A",
                    "status": "error",
                    "message": "Email is required"
                })
                continue
            
            # Check if user already exists
            existing = db.query(User).filter(User.email == email).first()
            if existing:
                duplicates += 1
                results.append({
                    "sapid": sapid or "N/A",
                    "name": name or existing.email,
                    "status": "duplicate",
                    "message": "User already exists"
                })
                continue
            
            # Create profile data
            profile_data = {
                "academic": {
                    "sapid": sapid,
                    "branch": branch,
                    "cgpa": float(cgpa) if cgpa else None,
                    "backlogs": int(backlogs) if backlogs else 0,
                    "year": year
                },
                "personal": {
                    "first_name": name.split()[0] if name else "",
                    "last_name": " ".join(name.split()[1:]) if name and len(name.split()) > 1 else "",
                    "phone": phone,
                    "city": city
                },
                "skills": skills.split(',') if skills else [],
                "internships": internships.split(',') if internships else []
            }
            
            # Create user
            # Generate default password (should be changed on first login)
            password_hash = get_password_hash("Student@123")
            
            new_user = User(
                email=email,
                password_hash=password_hash,
                role="student",
                profile_data=profile_data,
                is_active=True
            )
            
            db.add(new_user)
            db.commit()
            db.refresh(new_user)
            
            imported += 1
            results.append({
                "sapid": sapid or "N/A",
                "name": name or email,
                "status": "imported",
                "message": "Successfully imported"
            })
            
        except Exception as e:
            errors += 1
            results.append({
                "sapid": row.get('sapid', 'N/A'),
                "name": row.get('name', 'N/A'),
                "status": "error",
                "message": f"Error: {str(e)}"
            })
    
    return {
        "total": len(rows),
        "imported": imported,
        "duplicates": duplicates,
        "errors": errors,
        "results": results
    }
