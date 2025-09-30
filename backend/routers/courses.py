from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List, Dict, Any
from datetime import datetime, date
import sys
sys.path.append('../')
from shared.enhanced_models import get_db, CrashCourse, CourseRegistration, User
from backend.auth import get_current_user, require_role
from pydantic import BaseModel

router = APIRouter(prefix="/courses", tags=["courses"])

class CourseCreate(BaseModel):
    title: str
    description: str
    subject: str
    start_date: date
    end_date: date
    schedule: Dict[str, Any] = {}
    max_students: int = 50

class CourseResponse(BaseModel):
    id: int
    faculty_id: int
    title: str
    description: str
    subject: str
    start_date: date
    end_date: date
    schedule: Dict[str, Any]
    max_students: int
    current_enrollments: int
    is_active: bool
    created_at: datetime
    
    class Config:
        from_attributes = True

class CourseRegistrationResponse(BaseModel):
    id: int
    student_id: int
    course_id: int
    registration_date: datetime
    status: str
    completion_date: datetime = None
    
    class Config:
        from_attributes = True

@router.post("/", response_model=CourseResponse)
async def create_course(
    course: CourseCreate,
    current_user: User = Depends(require_role(["faculty"])),
    db: Session = Depends(get_db)
):
    """Create a new crash course"""
    db_course = CrashCourse(
        **course.dict(),
        faculty_id=current_user.id
    )
    
    db.add(db_course)
    db.commit()
    db.refresh(db_course)
    
    return db_course

@router.get("/", response_model=List[CourseResponse])
async def list_courses(
    faculty_id: int = None,
    subject: str = None,
    is_active: bool = True,
    db: Session = Depends(get_db)
):
    """List crash courses with optional filtering"""
    query = db.query(CrashCourse)
    
    if faculty_id:
        query = query.filter(CrashCourse.faculty_id == faculty_id)
    if subject:
        query = query.filter(CrashCourse.subject == subject)
    if is_active is not None:
        query = query.filter(CrashCourse.is_active == is_active)
    
    courses = query.order_by(CrashCourse.start_date).all()
    return courses

@router.get("/{course_id}", response_model=CourseResponse)
async def get_course(
    course_id: int,
    db: Session = Depends(get_db)
):
    """Get a specific course"""
    course = db.query(CrashCourse).filter(CrashCourse.id == course_id).first()
    if not course:
        raise HTTPException(status_code=404, detail="Course not found")
    
    return course

@router.put("/{course_id}", response_model=CourseResponse)
async def update_course(
    course_id: int,
    course: CourseCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Update a course"""
    db_course = db.query(CrashCourse).filter(CrashCourse.id == course_id).first()
    if not db_course:
        raise HTTPException(status_code=404, detail="Course not found")
    
    # Only author can update
    if db_course.faculty_id != current_user.id:
        raise HTTPException(status_code=403, detail="Access denied")
    
    for key, value in course.dict().items():
        setattr(db_course, key, value)
    
    db.commit()
    db.refresh(db_course)
    
    return db_course

@router.delete("/{course_id}")
async def delete_course(
    course_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Delete a course"""
    db_course = db.query(CrashCourse).filter(CrashCourse.id == course_id).first()
    if not db_course:
        raise HTTPException(status_code=404, detail="Course not found")
    
    # Only author can delete
    if db_course.faculty_id != current_user.id:
        raise HTTPException(status_code=403, detail="Access denied")
    
    db.delete(db_course)
    db.commit()
    
    return {"message": "Course deleted successfully"}

@router.post("/{course_id}/register", response_model=CourseRegistrationResponse)
async def register_for_course(
    course_id: int,
    current_user: User = Depends(require_role(["student"])),
    db: Session = Depends(get_db)
):
    """Register a student for a course"""
    # Check if course exists and is active
    course = db.query(CrashCourse).filter(CrashCourse.id == course_id, CrashCourse.is_active == True).first()
    if not course:
        raise HTTPException(status_code=404, detail="Course not found or inactive")
    
    # Check if already registered
    existing = db.query(CourseRegistration).filter(
        CourseRegistration.course_id == course_id,
        CourseRegistration.student_id == current_user.id
    ).first()
    
    if existing:
        raise HTTPException(status_code=400, detail="Already registered for this course")
    
    # Check if course is full
    if course.current_enrollments >= course.max_students:
        raise HTTPException(status_code=400, detail="Course is full")
    
    # Create registration
    registration = CourseRegistration(
        student_id=current_user.id,
        course_id=course_id
    )
    
    db.add(registration)
    
    # Update enrollment count
    course.current_enrollments += 1
    
    db.commit()
    db.refresh(registration)
    
    return registration

@router.get("/{course_id}/registrations", response_model=List[CourseRegistrationResponse])
async def get_course_registrations(
    course_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get course registrations (faculty can see all, students can see their own)"""
    course = db.query(CrashCourse).filter(CrashCourse.id == course_id).first()
    if not course:
        raise HTTPException(status_code=404, detail="Course not found")
    
    # Check access
    if current_user.role == "student":
        # Students can only see their own registrations
        registrations = db.query(CourseRegistration).filter(
            CourseRegistration.course_id == course_id,
            CourseRegistration.student_id == current_user.id
        ).all()
    elif current_user.role == "faculty":
        # Faculty can see all registrations for their courses
        if course.faculty_id != current_user.id:
            raise HTTPException(status_code=403, detail="Access denied")
        registrations = db.query(CourseRegistration).filter(
            CourseRegistration.course_id == course_id
        ).all()
    else:
        raise HTTPException(status_code=403, detail="Access denied")
    
    return registrations

@router.delete("/{course_id}/unregister")
async def unregister_from_course(
    course_id: int,
    current_user: User = Depends(require_role(["student"])),
    db: Session = Depends(get_db)
):
    """Unregister a student from a course"""
    registration = db.query(CourseRegistration).filter(
        CourseRegistration.course_id == course_id,
        CourseRegistration.student_id == current_user.id
    ).first()
    
    if not registration:
        raise HTTPException(status_code=404, detail="Registration not found")
    
    # Update enrollment count
    course = db.query(CrashCourse).filter(CrashCourse.id == course_id).first()
    if course:
        course.current_enrollments -= 1
    
    db.delete(registration)
    db.commit()
    
    return {"message": "Successfully unregistered from course"}
