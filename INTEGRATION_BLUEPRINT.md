# AI Resume Maker - FastAPI Integration Blueprint
# ================================================

## Overview
This document outlines how to integrate the tested AI Resume Maker logic into your existing FastAPI application's `/jobs/{job_id}/apply` endpoint.

## Integration Steps

### 1. Install Required Dependencies

Add to your `backend/requirements.txt`:
```
openai>=1.0.0
python-dotenv>=1.0.0
```

### 2. Environment Configuration

Add to your `.env` file:
```
OPENAI_API_KEY= #open ai key here
```

### 3. Create Resume Service Module

Create `backend/services/resume_service.py`:

```python
import openai
import os
from typing import Dict, Any, List
from sqlalchemy.orm import Session
from shared.models import User, Job, Application

class AIResumeService:
    def __init__(self):
        openai.api_key = os.getenv("OPENAI_API_KEY")
        self.config = {
            'max_projects': 3,
            'min_projects': 1, 
            'max_internships': 2,
            'min_internships': 0,
            'max_programming_languages': 4,
            'min_programming_languages': 2
        }
    
    def generate_resume_for_application(
        self, 
        db: Session, 
        student_id: int, 
        job_id: int
    ) -> str:
        """
        Generate tailored resume for job application
        
        Args:
            db: Database session
            student_id: ID of applying student  
            job_id: ID of job being applied to
            
        Returns:
            Generated resume content as string
        """
        
        # Fetch student profile from database
        student = db.query(User).filter(User.id == student_id).first()
        if not student:
            raise ValueError(f"Student with id {student_id} not found")
        
        # Fetch job posting from database  
        job = db.query(Job).filter(Job.id == job_id).first()
        if not job:
            raise ValueError(f"Job with id {job_id} not found")
        
        # Convert database models to the format expected by resume maker
        student_profile = self._convert_user_to_profile(student)
        job_posting = self._convert_job_to_posting(job)
        
        # Generate resume using the tested logic
        return self._generate_tailored_resume(student_profile, job_posting)
    
    def _convert_user_to_profile(self, user: User) -> Dict[str, Any]:
        """Convert User database model to profile dict for resume generation"""
        profile_data = user.profile_data or {}
        
        return {
            'name': profile_data.get('name', 'Student Name'),
            'email': user.email,
            'phone': profile_data.get('phone', ''),
            'linkedin': profile_data.get('linkedin', ''),
            'github': profile_data.get('github', ''),
            'age': profile_data.get('age', 22),
            'location': profile_data.get('location', ''),
            'education': profile_data.get('education', {}),
            'skills': profile_data.get('skills', []),
            'technologies': profile_data.get('technologies', []),
            'projects': profile_data.get('projects', []),
            'internships': profile_data.get('internships', []), 
            'certifications': profile_data.get('certifications', []),
            'extracurricular': profile_data.get('extracurricular', []),
            'languages': profile_data.get('languages', [])
        }
    
    def _convert_job_to_posting(self, job: Job) -> Dict[str, Any]:
        """Convert Job database model to posting dict for resume generation"""
        return {
            'id': job.id,
            'title': job.title,
            'company': job.company,
            'description': job.description,
            'requirements': job.requirements or [],
            'salary_range': job.salary_range,
            'location': job.location,
            'job_type': job.job_type
        }
    
    def _generate_tailored_resume(
        self, 
        student_profile: Dict[str, Any], 
        job_posting: Dict[str, Any]
    ) -> str:
        """
        Core resume generation logic - copy from test_resume_maker.py
        Replace the AIResumeMaker class methods here
        """
        # Copy the entire logic from AIResumeMaker class in test_resume_maker.py
        # This includes:
        # - _match_profile_to_job()
        # - _extract_mandatory_fields() 
        # - _generate_ai_resume()
        # - All scoring and ranking methods
        
        # For brevity, showing structure only - copy full implementation
        matched_content = self._match_profile_to_job(student_profile, job_posting)
        mandatory_fields = self._extract_mandatory_fields(student_profile)
        
        return self._create_openai_resume(mandatory_fields, matched_content, job_posting)
    
    def _create_openai_resume(
        self, 
        mandatory_fields: Dict, 
        matched_content: Dict, 
        job_posting: Dict
    ) -> str:
        """Generate resume using OpenAI API"""
        
        prompt = f"""
Create a professional, one-page resume for a student applying to:

JOB: {job_posting['title']} at {job_posting['company']}
REQUIREMENTS: {', '.join(job_posting.get('requirements', []))}

STUDENT INFO:
Name: {mandatory_fields['name']}
Email: {mandatory_fields['email']} | Phone: {mandatory_fields['phone']}
Education: {mandatory_fields['education']}

RELEVANT SKILLS: {', '.join(matched_content['skills'])}
TOP PROJECTS: {matched_content['projects'][:3]}
INTERNSHIPS: {matched_content['internships'][:2]}
CERTIFICATIONS: {matched_content['certifications']}

Requirements:
- Exactly ONE page
- Professional ATS-friendly format
- Emphasize job-relevant content
- Include quantified achievements
- Use action verbs

Return clean, formatted resume text.
"""

        try:
            response = openai.ChatCompletion.create(
                model="gpt-4",
                messages=[{"role": "user", "content": prompt}],
                max_tokens=1500,
                temperature=0.3
            )
            return response.choices[0].message.content
        except Exception as e:
            # Fallback to template-based generation if OpenAI fails
            return self._create_template_resume(mandatory_fields, matched_content, job_posting)
```

### 4. Update Job Application Router

Modify `backend/routers/jobs.py`:

```python
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from shared.models import get_db, Application, Job, User
from backend.services.resume_service import AIResumeService
from backend.auth import get_current_user

router = APIRouter()

@router.post("/jobs/{job_id}/apply")
async def apply_for_job(
    job_id: int,
    cover_letter: str = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Apply for a job with AI-generated resume"""
    
    # Check if job exists
    job = db.query(Job).filter(Job.id == job_id).first()
    if not job:
        raise HTTPException(status_code=404, detail="Job not found")
    
    # Check if already applied
    existing_app = db.query(Application).filter(
        Application.student_id == current_user.id,
        Application.job_id == job_id
    ).first()
    if existing_app:
        raise HTTPException(status_code=400, detail="Already applied to this job")
    
    try:
        # Generate AI resume
        resume_service = AIResumeService()
        ai_resume = resume_service.generate_resume_for_application(
            db, current_user.id, job_id
        )
        
        # Create application record
        application = Application(
            student_id=current_user.id,
            job_id=job_id,
            resume_content=ai_resume,
            cover_letter=cover_letter,
            ai_generated=True,
            status="submitted"
        )
        
        db.add(application)
        db.commit()
        db.refresh(application)
        
        return {
            "message": "Application submitted successfully",
            "application_id": application.id,
            "ai_generated": True,
            "resume_preview": ai_resume[:500] + "..." if len(ai_resume) > 500 else ai_resume
        }
        
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Resume generation failed: {str(e)}")

@router.get("/applications/{application_id}/resume")  
async def get_application_resume(
    application_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get the generated resume for an application"""
    
    application = db.query(Application).filter(
        Application.id == application_id,
        Application.student_id == current_user.id
    ).first()
    
    if not application:
        raise HTTPException(status_code=404, detail="Application not found")
    
    return {
        "resume_content": application.resume_content,
        "ai_generated": application.ai_generated,
        "applied_at": application.applied_at
    }
```

### 5. Frontend Integration

Update your React components to handle AI resume generation:

```typescript
// In your job application component
const applyForJob = async (jobId: number, coverLetter?: string) => {
  setIsGenerating(true);
  
  try {
    const response = await fetch(`/api/jobs/${jobId}/apply`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ cover_letter: coverLetter })
    });
    
    if (response.ok) {
      const result = await response.json();
      
      // Show success message with resume preview
      setNotification({
        type: 'success',
        message: `Application submitted! AI resume generated successfully.`,
        resumePreview: result.resume_preview
      });
      
    } else {
      throw new Error('Application failed');
    }
  } catch (error) {
    setNotification({
      type: 'error', 
      message: 'Failed to submit application. Please try again.'
    });
  } finally {
    setIsGenerating(false);
  }
};
```

### 6. Database Schema Updates (if needed)

Ensure your `Application` table supports the resume content:

```sql
-- Add if not exists
ALTER TABLE applications ADD COLUMN resume_content TEXT;
ALTER TABLE applications ADD COLUMN ai_generated BOOLEAN DEFAULT FALSE;
```

### 7. Testing in Production

1. **Test with Real Data**: Use actual student profiles from your database
2. **Monitor Performance**: Track resume generation time and success rates
3. **A/B Testing**: Compare AI-generated vs manual resumes
4. **Feedback Loop**: Collect employer feedback on resume quality

### 8. Advanced Features to Add Later

- **Resume Templates**: Multiple formatting options
- **Industry Customization**: Different styles for different industries  
- **Skills Gap Analysis**: Highlight missing skills for jobs
- **Resume Optimization**: Iterative improvement based on application success
- **Bulk Generation**: Generate resumes for multiple jobs at once

## Error Handling

```python
class ResumeGenerationError(Exception):
    """Custom exception for resume generation failures"""
    pass

# In your service
try:
    resume = generate_resume(...)
except openai.error.RateLimitError:
    # Fallback to template-based generation
    resume = generate_template_resume(...)
except Exception as e:
    logging.error(f"Resume generation failed: {e}")
    raise ResumeGenerationError("Unable to generate resume at this time")
```

## Performance Considerations

- **Caching**: Cache generated resumes for similar job types
- **Background Jobs**: Use Celery for long-running resume generation
- **Rate Limiting**: Implement limits on resume generation per user
- **Async Processing**: Use async/await for OpenAI API calls

## Security Notes  

- **API Key Security**: Store OpenAI key in environment variables
- **Data Privacy**: Ensure student data is handled securely
- **Content Validation**: Sanitize generated resume content
- **Access Control**: Verify user permissions for job applications

This integration maintains the tested logic while seamlessly incorporating it into your existing FastAPI application structure.