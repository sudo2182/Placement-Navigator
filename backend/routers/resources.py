from fastapi import APIRouter, Depends, HTTPException, UploadFile, File
from sqlalchemy.orm import Session
from typing import List, Dict, Any, Optional
from datetime import datetime
import sys
import os
sys.path.append('../')
from shared.enhanced_models import get_db, FacultyResource, User
from backend.auth import get_current_user, require_role
from pydantic import BaseModel

router = APIRouter(prefix="/resources", tags=["resources"])

class ResourceCreate(BaseModel):
    title: str
    description: str = None
    resource_type: str  # document, video, link
    external_url: str = None
    tags: List[str] = []
    is_public: bool = True

class ResourceResponse(BaseModel):
    id: int
    faculty_id: int
    title: str
    description: str
    resource_type: str
    file_path: str = None
    external_url: str = None
    tags: List[str]
    is_public: bool
    created_at: datetime
    
    class Config:
        from_attributes = True

@router.post("/", response_model=ResourceResponse)
async def create_resource(
    resource: ResourceCreate,
    current_user: User = Depends(require_role(["faculty"])),
    db: Session = Depends(get_db)
):
    """Create a new faculty resource"""
    db_resource = FacultyResource(
        **resource.dict(),
        faculty_id=current_user.id
    )
    
    db.add(db_resource)
    db.commit()
    db.refresh(db_resource)
    
    return db_resource

@router.post("/upload")
async def upload_resource_file(
    file: UploadFile = File(...),
    title: str = None,
    description: str = None,
    resource_type: str = "document",
    tags: str = "",
    current_user: User = Depends(require_role(["faculty"])),
    db: Session = Depends(get_db)
):
    """Upload a file resource"""
    # Create uploads directory if it doesn't exist
    upload_dir = "uploads/resources"
    os.makedirs(upload_dir, exist_ok=True)
    
    # Generate unique filename
    file_extension = os.path.splitext(file.filename)[1]
    unique_filename = f"{current_user.id}_{datetime.now().strftime('%Y%m%d_%H%M%S')}{file_extension}"
    file_path = os.path.join(upload_dir, unique_filename)
    
    # Save file
    with open(file_path, "wb") as buffer:
        content = await file.read()
        buffer.write(content)
    
    # Create resource record
    db_resource = FacultyResource(
        faculty_id=current_user.id,
        title=title or file.filename,
        description=description,
        resource_type=resource_type,
        file_path=file_path,
        tags=tags.split(",") if tags else [],
        is_public=True
    )
    
    db.add(db_resource)
    db.commit()
    db.refresh(db_resource)
    
    return {
        "message": "File uploaded successfully",
        "resource": db_resource
    }

@router.get("/", response_model=List[ResourceResponse])
async def list_resources(
    faculty_id: int = None,
    resource_type: str = None,
    is_public: bool = True,
    db: Session = Depends(get_db)
):
    """List faculty resources with optional filtering"""
    query = db.query(FacultyResource)
    
    if faculty_id:
        query = query.filter(FacultyResource.faculty_id == faculty_id)
    if resource_type:
        query = query.filter(FacultyResource.resource_type == resource_type)
    if is_public is not None:
        query = query.filter(FacultyResource.is_public == is_public)
    
    resources = query.order_by(FacultyResource.created_at.desc()).all()
    return resources

@router.get("/{resource_id}", response_model=ResourceResponse)
async def get_resource(
    resource_id: int,
    db: Session = Depends(get_db)
):
    """Get a specific resource"""
    resource = db.query(FacultyResource).filter(FacultyResource.id == resource_id).first()
    if not resource:
        raise HTTPException(status_code=404, detail="Resource not found")
    
    return resource

@router.put("/{resource_id}", response_model=ResourceResponse)
async def update_resource(
    resource_id: int,
    resource: ResourceCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Update a resource"""
    db_resource = db.query(FacultyResource).filter(FacultyResource.id == resource_id).first()
    if not db_resource:
        raise HTTPException(status_code=404, detail="Resource not found")
    
    # Only author can update
    if db_resource.faculty_id != current_user.id:
        raise HTTPException(status_code=403, detail="Access denied")
    
    for key, value in resource.dict().items():
        setattr(db_resource, key, value)
    
    db.commit()
    db.refresh(db_resource)
    
    return db_resource

@router.delete("/{resource_id}")
async def delete_resource(
    resource_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Delete a resource"""
    db_resource = db.query(FacultyResource).filter(FacultyResource.id == resource_id).first()
    if not db_resource:
        raise HTTPException(status_code=404, detail="Resource not found")
    
    # Only author can delete
    if db_resource.faculty_id != current_user.id:
        raise HTTPException(status_code=403, detail="Access denied")
    
    # Delete file if it exists
    if db_resource.file_path and os.path.exists(db_resource.file_path):
        os.remove(db_resource.file_path)
    
    db.delete(db_resource)
    db.commit()
    
    return {"message": "Resource deleted successfully"}
