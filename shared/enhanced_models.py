from sqlalchemy import create_engine, Column, Integer, String, Text, DateTime, ForeignKey, JSON, Boolean, Float, Date, Time, Enum
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker, relationship
from datetime import datetime, date, time
import os
from dotenv import load_dotenv
import enum

load_dotenv()

DATABASE_URL = os.getenv("DATABASE_URL")
engine = create_engine(DATABASE_URL)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

# Enums for better data integrity
class UserRole(enum.Enum):
    STUDENT = "student"
    TPO = "tpo"
    FACULTY = "faculty"
    EMPLOYER = "employer"

class JobStatus(enum.Enum):
    OPEN = "open"
    CLOSED = "closed"
    INTERVIEWS = "interviews"
    COMPLETED = "completed"

class ApplicationStatus(enum.Enum):
    SUBMITTED = "submitted"
    REVIEWED = "reviewed"
    SHORTLISTED = "shortlisted"
    REJECTED = "rejected"
    SELECTED = "selected"

class EventType(enum.Enum):
    TEST = "test"
    INTERVIEW = "interview"
    PRESENTATION = "presentation"
    GROUP_DISCUSSION = "group_discussion"

# Core User Management
class User(Base):
    __tablename__ = "users"
    
    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True, nullable=False)
    password_hash = Column(String, nullable=False)
    role = Column(Enum(UserRole), nullable=False)
    first_name = Column(String, nullable=False)
    last_name = Column(String, nullable=False)
    phone = Column(String)
    profile_data = Column(JSON, default={})  # Skills, projects, experience, etc.
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    posted_jobs = relationship("Job", back_populates="posted_by_user", foreign_keys="Job.posted_by")
    applications = relationship("Application", back_populates="student", foreign_keys="Application.student_id")
    opt_out_forms = relationship("OptOutForm", back_populates="student", foreign_keys="OptOutForm.student_id")
    course_registrations = relationship("CourseRegistration", back_populates="student", foreign_keys="CourseRegistration.student_id")
    created_courses = relationship("CrashCourse", back_populates="faculty", foreign_keys="CrashCourse.faculty_id")
    resources = relationship("FacultyResource", back_populates="faculty", foreign_keys="FacultyResource.faculty_id")
    notifications = relationship("Notification", back_populates="student", foreign_keys="Notification.student_id")
    reviewed_opt_outs = relationship("OptOutForm", back_populates="reviewer", foreign_keys="OptOutForm.reviewed_by")

# Job Management
class Job(Base):
    __tablename__ = "jobs"
    
    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, nullable=False)
    company = Column(String, nullable=False)
    description = Column(Text, nullable=False)
    requirements = Column(JSON, default=[])  # List of required skills/qualifications
    salary_range = Column(String)
    location = Column(String)
    job_type = Column(String, default="internship")  # internship, full-time, part-time
    status = Column(Enum(JobStatus), default=JobStatus.OPEN)
    deadline = Column(DateTime)
    posted_by = Column(Integer, ForeignKey('users.id'), nullable=False)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    posted_by_user = relationship("User", back_populates="posted_jobs", foreign_keys=[posted_by])
    applications = relationship("Application", back_populates="job")
    ai_matches = relationship("AIMatch", back_populates="job")
    events = relationship("JobEvent", back_populates="job")
    shortlists = relationship("Shortlist", back_populates="job")

# Application Management
class Application(Base):
    __tablename__ = "applications"
    
    id = Column(Integer, primary_key=True, index=True)
    student_id = Column(Integer, ForeignKey('users.id'), nullable=False)
    job_id = Column(Integer, ForeignKey('jobs.id'), nullable=False)
    resume_content = Column(Text)
    cover_letter = Column(Text)
    status = Column(Enum(ApplicationStatus), default=ApplicationStatus.SUBMITTED)
    ai_generated = Column(Boolean, default=False)
    applied_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    student = relationship("User", back_populates="applications", foreign_keys=[student_id])
    job = relationship("Job", back_populates="applications")

# AI Matching System
class AIMatch(Base):
    __tablename__ = "ai_matches"
    
    id = Column(Integer, primary_key=True, index=True)
    student_id = Column(Integer, ForeignKey('users.id'), nullable=False)
    job_id = Column(Integer, ForeignKey('jobs.id'), nullable=False)
    match_score = Column(Float, nullable=False)
    matched_skills = Column(JSON, default=[])
    explanation = Column(Text)
    created_at = Column(DateTime, default=datetime.utcnow)
    
    # Relationships
    student = relationship("User", foreign_keys=[student_id])
    job = relationship("Job", back_populates="ai_matches", foreign_keys=[job_id])

# Job Events (Tests, Interviews, etc.)
class JobEvent(Base):
    __tablename__ = "job_events"
    
    id = Column(Integer, primary_key=True, index=True)
    job_id = Column(Integer, ForeignKey('jobs.id'), nullable=False)
    event_type = Column(Enum(EventType), nullable=False)
    title = Column(String, nullable=False)
    description = Column(Text)
    event_date = Column(Date, nullable=False)
    event_time = Column(Time, nullable=False)
    location = Column(String)
    max_participants = Column(Integer)
    created_at = Column(DateTime, default=datetime.utcnow)
    
    # Relationships
    job = relationship("Job", back_populates="events")

# Shortlists for Interview Rounds
class Shortlist(Base):
    __tablename__ = "shortlists"
    
    id = Column(Integer, primary_key=True, index=True)
    job_id = Column(Integer, ForeignKey('jobs.id'), nullable=False)
    student_id = Column(Integer, ForeignKey('users.id'), nullable=False)
    round_name = Column(String, nullable=False)  # "Round 1", "Technical Interview", etc.
    status = Column(String, default="shortlisted")  # shortlisted, selected, rejected
    notes = Column(Text)
    created_at = Column(DateTime, default=datetime.utcnow)
    
    # Relationships
    job = relationship("Job", back_populates="shortlists")
    student = relationship("User", foreign_keys=[student_id])

# Placement Opt-Out Forms
class OptOutForm(Base):
    __tablename__ = "opt_out_forms"
    
    id = Column(Integer, primary_key=True, index=True)
    student_id = Column(Integer, ForeignKey('users.id'), nullable=False)
    reason = Column(Text, nullable=False)
    additional_info = Column(Text)
    status = Column(String, default="pending")  # pending, approved, rejected
    submitted_at = Column(DateTime, default=datetime.utcnow)
    reviewed_at = Column(DateTime)
    reviewed_by = Column(Integer, ForeignKey('users.id'))
    
    # Relationships
    student = relationship("User", back_populates="opt_out_forms", foreign_keys=[student_id])
    reviewer = relationship("User", back_populates="reviewed_opt_outs", foreign_keys=[reviewed_by])

# Bulletin Posts (Announcements)
class BulletinPost(Base):
    __tablename__ = "bulletin_posts"
    
    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, nullable=False)
    content = Column(Text, nullable=False)
    post_type = Column(String, default="announcement")  # announcement, hackathon, event, etc.
    target_audience = Column(String, default="all")  # all, students, faculty, specific_batch
    posted_by = Column(Integer, ForeignKey('users.id'), nullable=False)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    author = relationship("User", foreign_keys=[posted_by])

# Faculty Resources
class FacultyResource(Base):
    __tablename__ = "faculty_resources"
    
    id = Column(Integer, primary_key=True, index=True)
    faculty_id = Column(Integer, ForeignKey('users.id'), nullable=False)
    title = Column(String, nullable=False)
    description = Column(Text)
    resource_type = Column(String, nullable=False)  # document, video, link, etc.
    file_path = Column(String)  # Path to uploaded file
    external_url = Column(String)  # For external links
    tags = Column(JSON, default=[])  # List of tags for categorization
    is_public = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    
    # Relationships
    faculty = relationship("User", back_populates="resources", foreign_keys=[faculty_id])

# Crash Courses
class CrashCourse(Base):
    __tablename__ = "crash_courses"
    
    id = Column(Integer, primary_key=True, index=True)
    faculty_id = Column(Integer, ForeignKey('users.id'), nullable=False)
    title = Column(String, nullable=False)
    description = Column(Text, nullable=False)
    subject = Column(String, nullable=False)
    start_date = Column(Date, nullable=False)
    end_date = Column(Date, nullable=False)
    schedule = Column(JSON, default={})  # Weekly schedule details
    max_students = Column(Integer, default=50)
    current_enrollments = Column(Integer, default=0)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    
    # Relationships
    faculty = relationship("User", back_populates="created_courses", foreign_keys=[faculty_id])
    registrations = relationship("CourseRegistration", back_populates="course")

# Course Registrations
class CourseRegistration(Base):
    __tablename__ = "course_registrations"
    
    id = Column(Integer, primary_key=True, index=True)
    student_id = Column(Integer, ForeignKey('users.id'), nullable=False)
    course_id = Column(Integer, ForeignKey('crash_courses.id'), nullable=False)
    registration_date = Column(DateTime, default=datetime.utcnow)
    status = Column(String, default="registered")  # registered, completed, dropped
    completion_date = Column(DateTime)
    
    # Relationships
    student = relationship("User", back_populates="course_registrations", foreign_keys=[student_id])
    course = relationship("CrashCourse", back_populates="registrations")

# AI Job Tracking
class AIJob(Base):
    __tablename__ = "ai_jobs"
    
    id = Column(Integer, primary_key=True, index=True)
    job_type = Column(String, nullable=False)  # matching, resume_gen, progress_tracking
    student_id = Column(Integer, ForeignKey('users.id'), nullable=True)
    job_id = Column(Integer, ForeignKey('jobs.id'), nullable=True)
    status = Column(String, default="pending")  # pending, running, completed, failed
    input_data = Column(JSON, default={})
    result_data = Column(JSON, default={})
    error_message = Column(Text)
    created_at = Column(DateTime, default=datetime.utcnow)
    completed_at = Column(DateTime)

# Notifications
class Notification(Base):
    __tablename__ = "notifications"
    
    id = Column(Integer, primary_key=True, index=True)
    student_id = Column(Integer, ForeignKey('users.id'), nullable=False)
    title = Column(String, nullable=False)
    message = Column(Text, nullable=False)
    type = Column(String, default="info")  # info, success, warning, error
    is_read = Column(Boolean, default=False)
    related_job_id = Column(Integer, ForeignKey('jobs.id'), nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    
    # Relationships
    student = relationship("User", back_populates="notifications", foreign_keys=[student_id])
    related_job = relationship("Job", foreign_keys=[related_job_id])

# Database utility functions
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

def create_tables():
    Base.metadata.create_all(bind=engine)

if __name__ == "__main__":
    create_tables()
    print("Enhanced database tables created successfully!")
