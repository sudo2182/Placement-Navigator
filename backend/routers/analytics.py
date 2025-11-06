from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import Dict, Any
from sqlalchemy import func
from datetime import datetime, timedelta
import sys
sys.path.append('../')
from shared.models import get_db, User, Job, Company, Application
from backend.auth import get_current_user, require_role
from backend.services.simple_mcp_client import simple_mcp_client

router = APIRouter(prefix="/analytics", tags=["analytics"])

@router.get("/student/progress")
async def get_student_progress(
    current_user: User = Depends(require_role(["student"])),
    db: Session = Depends(get_db)
) -> Dict[str, Any]:
    """Get AI-powered progress analysis for current student"""
    
    try:
        result = await simple_mcp_client.analyze_student_progress(
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
        result = await simple_mcp_client.analyze_student_progress(
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
        result = await simple_mcp_client.analyze_student_progress(
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
        result = await simple_mcp_client.analyze_student_progress(
            student_id,
            "progress"
        )
        
        return result
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Progress analysis failed: {str(e)}")

@router.get("/tpo/overview")
async def get_tpo_overview(
    current_user: User = Depends(require_role(["tpo"])),
    db: Session = Depends(get_db)
) -> Dict[str, Any]:
    """Get TPO dashboard overview statistics"""
    try:
        # Total jobs
        total_jobs = db.query(Job).count()
        active_jobs = db.query(Job).filter(Job.is_active == True).count()
        
        # Total applications
        total_applications = db.query(Application).count()
        
        # Total companies
        total_companies = db.query(Company).count()
        
        # Recent activity (last 30 days)
        thirty_days_ago = datetime.utcnow() - timedelta(days=30)
        recent_jobs = db.query(Job).filter(Job.created_at >= thirty_days_ago).count()
        recent_applications = db.query(Application).filter(Application.applied_at >= thirty_days_ago).count()
        
        return {
            "total_jobs": total_jobs,
            "active_jobs": active_jobs,
            "total_applications": total_applications,
            "total_companies": total_companies,
            "recent_jobs": recent_jobs,
            "recent_applications": recent_applications
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Analytics failed: {str(e)}")

@router.get("/tpo/jobs")
async def get_tpo_job_analytics(
    current_user: User = Depends(require_role(["tpo"])),
    db: Session = Depends(get_db)
) -> Dict[str, Any]:
    """Get job posting analytics"""
    try:
        jobs = db.query(Job).all()
        
        # Jobs by status
        active_count = sum(1 for j in jobs if j.is_active)
        inactive_count = len(jobs) - active_count
        
        # Jobs by type
        job_types = {}
        for job in jobs:
            job_type = job.job_type or "full-time"
            job_types[job_type] = job_types.get(job_type, 0) + 1
        
        # Applications per job
        applications_per_job = []
        for job in jobs:
            app_count = db.query(Application).filter(Application.job_id == job.id).count()
            applications_per_job.append({
                "job_id": job.id,
                "job_title": job.title,
                "applications": app_count
            })
        
        return {
            "total_jobs": len(jobs),
            "active_jobs": active_count,
            "inactive_jobs": inactive_count,
            "jobs_by_type": job_types,
            "applications_per_job": sorted(applications_per_job, key=lambda x: x["applications"], reverse=True)[:10]
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Job analytics failed: {str(e)}")

@router.get("/tpo/students")
async def get_tpo_student_analytics(
    current_user: User = Depends(require_role(["tpo"])),
    db: Session = Depends(get_db)
) -> Dict[str, Any]:
    """Get student placement analytics"""
    try:
        # Total students
        total_students = db.query(User).filter(User.role == "student").count()
        
        # Students with applications
        students_with_apps = db.query(func.count(func.distinct(Application.student_id))).scalar() or 0
        
        # Applications by student
        applications_by_student = db.query(
            Application.student_id,
            func.count(Application.id).label('app_count')
        ).group_by(Application.student_id).all()
        
        return {
            "total_students": total_students,
            "students_with_applications": students_with_apps,
            "students_without_applications": total_students - students_with_apps,
            "average_applications_per_student": round(students_with_apps / total_students * 100, 2) if total_students > 0 else 0,
            "top_applicants": [
                {"student_id": s[0], "applications": s[1]} 
                for s in sorted(applications_by_student, key=lambda x: x[1], reverse=True)[:10]
            ]
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Student analytics failed: {str(e)}")

@router.get("/tpo/companies")
async def get_tpo_company_analytics(
    current_user: User = Depends(require_role(["tpo"])),
    db: Session = Depends(get_db)
) -> Dict[str, Any]:
    """Get company engagement analytics"""
    try:
        companies = db.query(Company).all()
        
        # Companies by sector
        sectors = {}
        for company in companies:
            sector = company.sector or "Other"
            sectors[sector] = sectors.get(sector, 0) + 1
        
        # Jobs per company
        jobs_per_company = []
        for company in companies:
            # Note: Job model doesn't have company_id, so we'll use company name matching
            job_count = db.query(Job).filter(Job.company == company.name).count()
            jobs_per_company.append({
                "company_id": company.id,
                "company_name": company.name,
                "jobs": job_count
            })
        
        return {
            "total_companies": len(companies),
            "companies_by_sector": sectors,
            "jobs_per_company": sorted(jobs_per_company, key=lambda x: x["jobs"], reverse=True)
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Company analytics failed: {str(e)}")
