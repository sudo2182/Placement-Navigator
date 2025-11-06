from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List, Dict, Any, Optional
from datetime import datetime
import sys
sys.path.append('../')
from shared.models import get_db, Company, User
from backend.auth import get_current_user, require_role
from pydantic import BaseModel

router = APIRouter(prefix="/companies", tags=["companies"])

class CompanyCreate(BaseModel):
    name: str
    website: Optional[str] = None
    description: Optional[str] = None
    sector: Optional[str] = None
    hq_location: Optional[str] = None
    point_of_contact: Optional[str] = None

class CompanyResponse(BaseModel):
    id: int
    name: str
    website: Optional[str] = None
    description: Optional[str] = None
    sector: Optional[str] = None
    hq_location: Optional[str] = None
    point_of_contact: Optional[str] = None
    created_at: datetime
    updated_at: datetime
    
    class Config:
        from_attributes = True

@router.post("/", response_model=CompanyResponse)
async def create_company(
    company: CompanyCreate,
    current_user: User = Depends(require_role(["tpo", "employer"])),
    db: Session = Depends(get_db)
):
    """Create a new company"""
    db_company = Company(**company.dict())
    db.add(db_company)
    db.commit()
    db.refresh(db_company)
    return db_company

@router.get("/", response_model=List[CompanyResponse])
async def list_companies(
    sector: Optional[str] = None,
    db: Session = Depends(get_db)
):
    """List all companies with optional filtering"""
    query = db.query(Company)
    
    if sector:
        query = query.filter(Company.sector == sector)
    
    companies = query.order_by(Company.name).all()
    
    # Add active drives count (would need job relationship)
    # For now, return as-is
    return companies

@router.get("/{company_id}", response_model=CompanyResponse)
async def get_company(
    company_id: int,
    db: Session = Depends(get_db)
):
    """Get a specific company"""
    company = db.query(Company).filter(Company.id == company_id).first()
    if not company:
        raise HTTPException(status_code=404, detail="Company not found")
    return company

@router.put("/{company_id}", response_model=CompanyResponse)
async def update_company(
    company_id: int,
    company: CompanyCreate,
    current_user: User = Depends(require_role(["tpo", "employer"])),
    db: Session = Depends(get_db)
):
    """Update a company"""
    db_company = db.query(Company).filter(Company.id == company_id).first()
    if not db_company:
        raise HTTPException(status_code=404, detail="Company not found")
    
    for key, value in company.dict().items():
        setattr(db_company, key, value)
    
    db.commit()
    db.refresh(db_company)
    return db_company

@router.delete("/{company_id}")
async def delete_company(
    company_id: int,
    current_user: User = Depends(require_role(["tpo", "employer"])),
    db: Session = Depends(get_db)
):
    """Delete a company"""
    db_company = db.query(Company).filter(Company.id == company_id).first()
    if not db_company:
        raise HTTPException(status_code=404, detail="Company not found")
    
    db.delete(db_company)
    db.commit()
    return {"message": "Company deleted successfully"}

