from fastapi import APIRouter, Depends, HTTPException, BackgroundTasks
from sqlalchemy.orm import Session
from typing import List, Dict, Any
from datetime import datetime
import sys
sys.path.append('../')
from shared.models import get_db, Job, User, Application, AIMatch
from backend.auth import get_current_user, require_role
from backend.schemas import JobCreate, JobResponse, ApplicationCreate, ApplicationResponse, AIMatchResponse
from backend.services.mcp_client import mcp_client
from backend.services.matching_service import matching_service

router = APIRouter(prefix="/jobs", tags=["jobs"])

@router.post("/", response_model=JobResponse)
async def create_job(
    job: JobCreate,
    background_tasks: BackgroundTasks,
    current_user: User = Depends(require_role(["tpo", "employer"])),
    db: Session = Depends(get_db)
):
    """Create job and trigger AI matching"""
    db_job = Job(
        **job.dict(),
        posted_by=current_user.id
    )
    
    db.add(db_job)
    db.commit()
    db.refresh(db_job)
    
    # Trigger AI batch processing in background
    background_tasks.add_task(trigger_ai_matching, db_job.id)
    
    return db_job

@router.get("/", response_model=List[JobResponse])
async def list_jobs(
    skip: int = 0,
    limit: int = 50,
    db: Session = Depends(get_db)
):
    jobs = db.query(Job).filter(Job.is_active == True).offset(skip).limit(limit).all()
    return jobs

@router.get("/{job_id}", response_model=JobResponse)
async def get_job(job_id: int, db: Session = Depends(get_db)):
    job = db.query(Job).filter(Job.id == job_id, Job.is_active == True).first()
    if not job:
        raise HTTPException(status_code=404, detail="Job not found")
    return job

@router.get("/{job_id}/matches", response_model=List[AIMatchResponse])
async def get_job_matches(
    job_id: int,
    current_user: User = Depends(require_role(["tpo", "employer"])),
    db: Session = Depends(get_db)
):
    """Get AI-generated matches for a job"""
    
    # Verify job exists and user has access
    job = db.query(Job).filter(Job.id == job_id).first()
    if not job:
        raise HTTPException(status_code=404, detail="Job not found")
    
    if job.posted_by != current_user.id and current_user.role != "tpo":
        raise HTTPException(status_code=403, detail="Access denied")
    
    # Get AI matches from database
    matches = db.query(AIMatch).filter(
        AIMatch.job_id == job_id
    ).order_by(AIMatch.match_score.desc()).limit(20).all()
    
    return matches

@router.post("/{job_id}/find-matches")
async def trigger_job_matching(
    job_id: int,
    current_user: User = Depends(require_role(["tpo", "employer"])),
    db: Session = Depends(get_db)
) -> Dict[str, Any]:
    """
    Manually trigger AI matching for a job using the MatchingService
    
    This endpoint uses the MatchingService to find matches for a job using
    semantic matching with OpenAI embeddings and rule-based fallback.
    
    Returns:
        A structured response with matches, method used, and metadata
    """
    
    # Verify job exists and user has access
    job = db.query(Job).filter(Job.id == job_id).first()
    if not job:
        raise HTTPException(status_code=404, detail="Job not found")
    
    if job.posted_by != current_user.id and current_user.role != "tpo":
        raise HTTPException(status_code=403, detail="Access denied")
    
    try:
        # Use matching_service to find matches with fallback
        result = await matching_service.find_matches(
            job_id=job_id,
            db=db,
            min_score=0.3,
            limit=20
        )
        
        # Check if there was an error
        if "error" in result and result.get("method_used") == "error":
            raise HTTPException(
                status_code=500, 
                detail=f"Matching failed: {result.get('error', 'Unknown error')}"
            )
        
        # Return structured response
        return {
            "job_id": job_id,
            "matches_found": len(result.get("matches", [])),
            "method_used": result.get("method_used", "unknown"),
            "matches": result.get("matches", []),
            "timestamp": datetime.utcnow().isoformat()
        }
        
    except HTTPException:
        # Re-raise HTTP exceptions
        raise
    except Exception as e:
        # Handle any other exceptions
        raise HTTPException(status_code=500, detail=f"Matching failed: {str(e)}")

@router.post("/{job_id}/apply", response_model=ApplicationResponse)
async def apply_to_job_with_ai(
    job_id: int,
    application: ApplicationCreate,
    current_user: User = Depends(require_role(["student"])),
    db: Session = Depends(get_db)
):
    """Apply to job with AI-generated resume"""
    
    # Check if job exists
    job = db.query(Job).filter(Job.id == job_id).first()
    if not job:
        raise HTTPException(status_code=404, detail="Job not found")
    
    # Check if already applied
    existing = db.query(Application).filter(
        Application.student_id == current_user.id,
        Application.job_id == job_id
    ).first()
    
    if existing:
        raise HTTPException(status_code=400, detail="Already applied to this job")
    
    try:
        # Generate AI resume
        resume_result = await mcp_client.generate_tailored_resume(current_user.id, job_id)
        
        if resume_result.get("error"):
            # Fallback to basic application
            resume_content = f"Application for {job.title} at {job.company}\n\nGenerated resume not available."
            ai_generated = False
        else:
            resume_content = resume_result.get("resume_content", "AI-generated resume")
            ai_generated = True
        
        # Create application
        db_application = Application(
            student_id=current_user.id,
            job_id=job_id,
            cover_letter=application.cover_letter,
            resume_content=resume_content,
            ai_generated=ai_generated
        )
        
        db.add(db_application)
        db.commit()
        db.refresh(db_application)
        
        return ApplicationResponse.from_orm(db_application)
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Application failed: {str(e)}")

async def trigger_ai_matching(job_id: int):
    """Background task to trigger AI matching"""
    try:
        result = await mcp_client.batch_process_new_job(job_id)
        print(f"AI matching completed for job {job_id}: {result.get('matches_found', 0)} matches found")
    except Exception as e:
        print(f"Error in AI matching for job {job_id}: {e}")