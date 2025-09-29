from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import Dict, Any
import sys
sys.path.append('../')
from shared.models import get_db, User
from backend.auth import get_current_user, require_role
from backend.services.mcp_client import mcp_client

router = APIRouter(prefix="/analytics", tags=["analytics"])

@router.get("/student/progress")
async def get_student_progress(
    current_user: User = Depends(require_role(["student"])),
    db: Session = Depends(get_db)
) -> Dict[str, Any]:
    """Get AI-powered progress analysis for current student"""
    
    try:
        result = await mcp_client.analyze_student_progress(
            current_user.id,
            "progress"
        )
        
        return result
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Progress analysis failed: {str(e)}")

@router.get("/student/recommendations")
async def get_job_recommendations(
    current_user: User = Depends(require_role(["student"])),
    db: Session = Depends(get_db)
) -> Dict[str, Any]:
    """Get AI-powered job recommendations"""
    
    try:
        result = await mcp_client.analyze_student_progress(
            current_user.id,
            "recommendations"
        )
        
        return result
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Recommendations failed: {str(e)}")

@router.get("/student/skill-gaps")
async def get_skill_gap_analysis(
    current_user: User = Depends(require_role(["student"])),
    db: Session = Depends(get_db)
) -> Dict[str, Any]:
    """Get AI-powered skill gap analysis"""
    
    try:
        result = await mcp_client.analyze_student_progress(
            current_user.id,
            "skill_gaps"
        )
        
        return result
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Skill analysis failed: {str(e)}")

@router.get("/student/{student_id}/progress")
async def get_any_student_progress(
    student_id: int,
    current_user: User = Depends(require_role(["tpo", "faculty"])),
    db: Session = Depends(get_db)
) -> Dict[str, Any]:
    """Get progress analysis for any student (TPO/Faculty only)"""
    
    try:
        result = await mcp_client.analyze_student_progress(
            student_id,
            "progress"
        )
        
        return result
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Progress analysis failed: {str(e)}")