from sqlalchemy import create_engine, Column, Integer, String, Text, DateTime, ForeignKey, JSON, Boolean, Float
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker, relationship
from datetime import datetime
import os
from dotenv import load_dotenv

load_dotenv()

DATABASE_URL = os.getenv("DATABASE_URL")
engine = create_engine(DATABASE_URL)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

class User(Base):
    __tablename__ = "users"
    
    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True, nullable=False)
    password_hash = Column(String, nullable=False)
    role = Column(String, nullable=False)  # student, tpo, faculty, employer
    profile_data = Column(JSON, default={})
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    posted_jobs = relationship("Job", back_populates="posted_by_user", foreign_keys="Job.posted_by")
    applications = relationship("Application", back_populates="student", foreign_keys="Application.student_id")

class Job(Base):
    __tablename__ = "jobs"
    
    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, nullable=False)
    company = Column(String, nullable=False)
    description = Column(Text, nullable=False)
    requirements = Column(JSON, default=[])
    salary_range = Column(String)
    location = Column(String)
    job_type = Column(String, default="internship")  # internship, full-time
    deadline = Column(DateTime)
    posted_by = Column(Integer, ForeignKey('users.id'), nullable=False)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    
    # Relationships
    posted_by_user = relationship("User", back_populates="posted_jobs", foreign_keys=[posted_by])
    applications = relationship("Application", back_populates="job")
    ai_matches = relationship("AIMatch", back_populates="job")

class Application(Base):
    __tablename__ = "applications"
    
    id = Column(Integer, primary_key=True, index=True)
    student_id = Column(Integer, ForeignKey('users.id'), nullable=False)
    job_id = Column(Integer, ForeignKey('jobs.id'), nullable=False)
    resume_content = Column(Text)
    cover_letter = Column(Text)
    status = Column(String, default="submitted")  # submitted, reviewed, shortlisted, rejected, selected
    ai_generated = Column(Boolean, default=False)
    applied_at = Column(DateTime, default=datetime.utcnow)
    
    # Relationships
    student = relationship("User", back_populates="applications", foreign_keys=[student_id])
    job = relationship("Job", back_populates="applications")

class AIMatch(Base):
    """Store AI-generated job matches"""
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

class AIJob(Base):
    """Track AI agent executions"""
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
    print("Database tables created successfully!")