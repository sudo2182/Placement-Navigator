from pydantic import BaseModel, EmailStr
from typing import List, Optional, Dict, Any
from datetime import datetime

class UserBase(BaseModel):
    email: EmailStr
    role: str

class UserCreate(UserBase):
    password: str
    profile_data: Dict[str, Any] = {}

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class UserResponse(UserBase):
    id: int
    profile_data: Dict[str, Any]
    is_active: bool
    created_at: datetime
    
    class Config:
        from_attributes = True

class Token(BaseModel):
    access_token: str
    token_type: str
    user: UserResponse

class JobBase(BaseModel):
    title: str
    company: str
    description: str
    requirements: List[str]
    salary_range: Optional[str] = None
    location: Optional[str] = None
    job_type: str = "internship"
    deadline: Optional[datetime] = None

class JobCreate(JobBase):
    pass

class JobResponse(JobBase):
    id: int
    posted_by: int
    is_active: bool
    created_at: datetime
    
    class Config:
        from_attributes = True

class ApplicationCreate(BaseModel):
    job_id: int
    cover_letter: Optional[str] = None

class ApplicationResponse(BaseModel):
    id: int
    student_id: int
    job_id: int
    status: str
    ai_generated: bool
    applied_at: datetime
    job: JobResponse
    
    class Config:
        from_attributes = True

class AIMatchResponse(BaseModel):
    id: int
    student_id: int
    job_id: int
    match_score: float
    matched_skills: List[str]
    explanation: str
    job: JobResponse
    
    class Config:
        from_attributes = True