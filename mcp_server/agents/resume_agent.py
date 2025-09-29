#!/usr/bin/env python3
"""
Resume Generation Agent

This agent uses OpenAI GPT-3.5-turbo to generate tailored resumes for students
based on their profiles and specific job requirements.
"""

import logging
import json
import re
from typing import Dict, List, Optional, Any, Tuple
from dataclasses import dataclass
from datetime import datetime
import asyncio
import os

import openai
from sqlalchemy.orm import Session
from sqlalchemy import text

logger = logging.getLogger(__name__)

@dataclass
class ResumeContext:
    """Context data for resume generation"""
    student_name: str
    student_email: str
    student_phone: Optional[str]
    student_profile: Dict[str, Any]
    job_title: str
    job_description: str
    job_requirements: List[str]
    company_name: str
    target_skills: List[str]
    student_skills: List[str]
    student_experience: List[Dict[str, Any]]
    student_education: List[Dict[str, Any]]
    student_projects: List[Dict[str, Any]]

@dataclass
class ResumeAnalysis:
    """Analysis results for generated resume"""
    ats_score: float
    keyword_match_score: float
    matched_keywords: List[str]
    missing_keywords: List[str]
    suggestions: List[str]
    overall_quality: str

class ResumeAgent:
    """AI-powered resume generation agent"""
    
    def __init__(self, openai_api_key: str):
        """Initialize the resume agent with OpenAI API key"""
        self.openai_client = openai.OpenAI(api_key=openai_api_key)
        self.model = "gpt-3.5-turbo"
        
    async def generate_tailored_resume(self, student_id: str, job_id: str, 
                                     format_type: str, db_session: Session) -> Dict[str, Any]:
        """
        Generate AI-tailored resume for a student and specific job
        
        Args:
            student_id: ID of the student
            job_id: ID of the job
            format_type: 'text' or 'json'
            db_session: SQLAlchemy database session
            
        Returns:
            Dict containing resume content and metadata
        """
        try:
            # Fetch student and job data
            student = await self._fetch_student_data(student_id, db_session)
            job = await self._fetch_job_data(job_id, db_session)
            
            if not student or not job:
                raise ValueError("Student or job not found")
            
            # Prepare context for resume generation
            context = await self._prepare_resume_context(student, job)
            
            # Generate resume based on format type
            if format_type.lower() == 'json':
                resume_content = await self._generate_structured_resume(context)
            else:
                resume_content = await self._generate_text_resume(context)
            
            # Analyze the generated resume
            analysis = await self._analyze_generated_resume(resume_content, job)
            
            return {
                'resume_content': resume_content,
                'format_type': format_type,
                'analysis': analysis,
                'generated_at': datetime.utcnow().isoformat(),
                'student_id': student_id,
                'job_id': job_id
            }
            
        except Exception as e:
            logger.error(f"Error generating resume: {e}")
            # Fallback to basic resume generation
            return await self._generate_fallback_resume(student_id, job_id, format_type, db_session)
    
    async def _fetch_student_data(self, student_id: str, db_session: Session) -> Optional[Dict[str, Any]]:
        """Fetch student data from database"""
        try:
            # Query student data using raw SQL for flexibility
            query = text("""
                SELECT id, email, profile_data, created_at
                FROM users 
                WHERE id = :student_id AND role = 'student'
            """)
            
            result = db_session.execute(query, {"student_id": student_id}).fetchone()
            
            if result:
                return {
                    'id': result.id,
                    'email': result.email,
                    'profile_data': result.profile_data or {},
                    'created_at': result.created_at
                }
            return None
            
        except Exception as e:
            logger.error(f"Error fetching student data: {e}")
            return None
    
    async def _fetch_job_data(self, job_id: str, db_session: Session) -> Optional[Dict[str, Any]]:
        """Fetch job data from database"""
        try:
            query = text("""
                SELECT id, title, description, requirements, company, location, salary_range
                FROM jobs 
                WHERE id = :job_id
            """)
            
            result = db_session.execute(query, {"job_id": job_id}).fetchone()
            
            if result:
                return {
                    'id': result.id,
                    'title': result.title,
                    'description': result.description,
                    'requirements': result.requirements or [],
                    'company': result.company,
                    'location': result.location,
                    'salary_range': result.salary_range
                }
            return None
            
        except Exception as e:
            logger.error(f"Error fetching job data: {e}")
            return None
    
    async def _prepare_resume_context(self, student: Dict[str, Any], job: Dict[str, Any]) -> ResumeContext:
        """Prepare relevant profile and job information for resume generation"""
        
        profile_data = student.get('profile_data', {})
        
        # Extract student information
        student_name = profile_data.get('name', 'Student Name')
        student_email = student.get('email', '')
        student_phone = profile_data.get('phone', '')
        
        # Extract skills
        student_skills = profile_data.get('skills', [])
        if isinstance(student_skills, str):
            student_skills = [skill.strip() for skill in student_skills.split(',')]
        
        # Extract experience
        student_experience = profile_data.get('experience', [])
        if not isinstance(student_experience, list):
            student_experience = []
        
        # Extract education
        student_education = profile_data.get('education', [])
        if not isinstance(student_education, list):
            student_education = []
        
        # Extract projects
        student_projects = profile_data.get('projects', [])
        if not isinstance(student_projects, list):
            student_projects = []
        
        # Extract job requirements
        job_requirements = job.get('requirements', [])
        if isinstance(job_requirements, str):
            job_requirements = [req.strip() for req in job_requirements.split(',')]
        
        # Extract target skills from job description and requirements
        target_skills = self._extract_skills_from_job(job)
        
        return ResumeContext(
            student_name=student_name,
            student_email=student_email,
            student_phone=student_phone,
            student_profile=profile_data,
            job_title=job.get('title', ''),
            job_description=job.get('description', ''),
            job_requirements=job_requirements,
            company_name=job.get('company', ''),
            target_skills=target_skills,
            student_skills=student_skills,
            student_experience=student_experience,
            student_education=student_education,
            student_projects=student_projects
        )
    
    def _extract_skills_from_job(self, job: Dict[str, Any]) -> List[str]:
        """Extract key skills and technologies from job description"""
        text = f"{job.get('title', '')} {job.get('description', '')} {' '.join(job.get('requirements', []))}"
        
        # Common technical skills and keywords
        skill_patterns = [
            r'\b(?:Python|Java|JavaScript|C\+\+|C#|Ruby|PHP|Go|Rust|Swift|Kotlin)\b',
            r'\b(?:React|Angular|Vue|Django|Flask|Spring|Express|Laravel)\b',
            r'\b(?:SQL|MySQL|PostgreSQL|MongoDB|Redis|Elasticsearch)\b',
            r'\b(?:AWS|Azure|GCP|Docker|Kubernetes|Jenkins|Git)\b',
            r'\b(?:Machine Learning|AI|Data Science|Analytics|Statistics)\b',
            r'\b(?:Agile|Scrum|DevOps|CI/CD|Testing|QA)\b'
        ]
        
        skills = []
        for pattern in skill_patterns:
            matches = re.findall(pattern, text, re.IGNORECASE)
            skills.extend(matches)
        
        return list(set(skills))[:15]  # Return unique skills, max 15
    
    async def _generate_text_resume(self, context: ResumeContext) -> str:
        """Generate ATS-friendly text resume"""
        prompt = self._create_resume_prompt(context, 'text')
        
        try:
            response = self.openai_client.chat.completions.create(
                model=self.model,
                messages=[
                    {
                        "role": "system",
                        "content": "You are an expert resume writer specializing in ATS-friendly resumes for students and new graduates. Create professional, keyword-optimized resumes that highlight relevant skills and experiences."
                    },
                    {
                        "role": "user",
                        "content": prompt
                    }
                ],
                max_tokens=2000,
                temperature=0.7
            )
            
            return response.choices[0].message.content.strip()
            
        except Exception as e:
            logger.error(f"Error generating text resume with OpenAI: {e}")
            return self._generate_fallback_text_resume(context)
    
    async def _generate_structured_resume(self, context: ResumeContext) -> Dict[str, Any]:
        """Generate structured JSON resume"""
        prompt = self._create_resume_prompt(context, 'json')
        
        try:
            response = self.openai_client.chat.completions.create(
                model=self.model,
                messages=[
                    {
                        "role": "system",
                        "content": "You are an expert resume writer. Generate structured resume data in JSON format with proper sections and formatting. Ensure the JSON is valid and well-structured."
                    },
                    {
                        "role": "user",
                        "content": prompt
                    }
                ],
                max_tokens=2500,
                temperature=0.7
            )
            
            content = response.choices[0].message.content.strip()
            
            # Try to parse JSON response
            try:
                return json.loads(content)
            except json.JSONDecodeError:
                # Extract JSON from response if wrapped in markdown
                json_match = re.search(r'```json\n(.*?)\n```', content, re.DOTALL)
                if json_match:
                    return json.loads(json_match.group(1))
                else:
                    raise ValueError("Invalid JSON response")
            
        except Exception as e:
            logger.error(f"Error generating structured resume with OpenAI: {e}")
            return self._generate_fallback_structured_resume(context)
    
    def _create_resume_prompt(self, context: ResumeContext, format_type: str) -> str:
        """Build prompt for GPT based on context and format type"""
        
        base_prompt = f"""
Create a tailored resume for {context.student_name} applying for the position of {context.job_title} at {context.company_name}.

STUDENT INFORMATION:
- Name: {context.student_name}
- Email: {context.student_email}
- Phone: {context.student_phone or 'Not provided'}
- Skills: {', '.join(context.student_skills)}

JOB REQUIREMENTS:
- Position: {context.job_title}
- Company: {context.company_name}
- Key Requirements: {', '.join(context.job_requirements)}
- Target Skills: {', '.join(context.target_skills)}

STUDENT EXPERIENCE:
{self._format_experience_for_prompt(context.student_experience)}

STUDENT EDUCATION:
{self._format_education_for_prompt(context.student_education)}

STUDENT PROJECTS:
{self._format_projects_for_prompt(context.student_projects)}

INSTRUCTIONS:
1. Highlight skills and experiences most relevant to the job requirements
2. Use keywords from the job description naturally throughout the resume
3. Emphasize achievements and quantifiable results where possible
4. Ensure ATS-friendly formatting
5. Keep the resume concise but comprehensive
6. Tailor the summary/objective to the specific role
"""

        if format_type == 'json':
            base_prompt += """

OUTPUT FORMAT: Return a valid JSON object with the following structure:
{
    "personal_info": {
        "name": "string",
        "email": "string",
        "phone": "string",
        "summary": "string"
    },
    "skills": ["skill1", "skill2", ...],
    "experience": [
        {
            "title": "string",
            "company": "string",
            "duration": "string",
            "description": "string",
            "achievements": ["achievement1", "achievement2", ...]
        }
    ],
    "education": [
        {
            "degree": "string",
            "institution": "string",
            "year": "string",
            "gpa": "string (optional)"
        }
    ],
    "projects": [
        {
            "name": "string",
            "description": "string",
            "technologies": ["tech1", "tech2", ...],
            "achievements": ["achievement1", "achievement2", ...]
        }
    ]
}
"""
        else:
            base_prompt += """

OUTPUT FORMAT: Return a clean, ATS-friendly text resume with clear sections:
- Header (Name, Contact Info)
- Professional Summary
- Skills
- Experience
- Education
- Projects (if applicable)

Use standard formatting with clear section headers and bullet points.
"""

        return base_prompt
    
    def _format_experience_for_prompt(self, experience: List[Dict[str, Any]]) -> str:
        """Format experience data for prompt"""
        if not experience:
            return "No professional experience listed"
        
        formatted = []
        for exp in experience:
            title = exp.get('title', 'Position')
            company = exp.get('company', 'Company')
            duration = exp.get('duration', 'Duration not specified')
            description = exp.get('description', 'No description provided')
            formatted.append(f"- {title} at {company} ({duration}): {description}")
        
        return '\n'.join(formatted)
    
    def _format_education_for_prompt(self, education: List[Dict[str, Any]]) -> str:
        """Format education data for prompt"""
        if not education:
            return "Education information not provided"
        
        formatted = []
        for edu in education:
            degree = edu.get('degree', 'Degree')
            institution = edu.get('institution', 'Institution')
            year = edu.get('year', 'Year not specified')
            gpa = edu.get('gpa', '')
            gpa_text = f" (GPA: {gpa})" if gpa else ""
            formatted.append(f"- {degree} from {institution} ({year}){gpa_text}")
        
        return '\n'.join(formatted)
    
    def _format_projects_for_prompt(self, projects: List[Dict[str, Any]]) -> str:
        """Format projects data for prompt"""
        if not projects:
            return "No projects listed"
        
        formatted = []
        for project in projects:
            name = project.get('name', 'Project')
            description = project.get('description', 'No description provided')
            technologies = project.get('technologies', [])
            tech_text = f" (Technologies: {', '.join(technologies)})" if technologies else ""
            formatted.append(f"- {name}: {description}{tech_text}")
        
        return '\n'.join(formatted)
    
    async def _analyze_generated_resume(self, resume_content: Any, job: Dict[str, Any]) -> ResumeAnalysis:
        """Evaluate resume quality including keywords and ATS score"""
        
        # Convert resume to text for analysis
        if isinstance(resume_content, dict):
            text_content = self._extract_text_from_structured_resume(resume_content)
        else:
            text_content = str(resume_content)
        
        # Extract job keywords
        job_text = f"{job.get('title', '')} {job.get('description', '')} {' '.join(job.get('requirements', []))}"
        job_keywords = self._extract_keywords(job_text)
        
        # Extract resume keywords
        resume_keywords = self._extract_keywords(text_content)
        
        # Calculate matches
        matched_keywords = list(set(job_keywords) & set(resume_keywords))
        missing_keywords = list(set(job_keywords) - set(resume_keywords))
        
        # Calculate scores
        keyword_match_score = len(matched_keywords) / len(job_keywords) if job_keywords else 0
        ats_score = self._calculate_ats_score(text_content)
        
        # Generate suggestions
        suggestions = self._generate_resume_suggestions(keyword_match_score, ats_score, missing_keywords)
        
        # Determine overall quality
        overall_score = (keyword_match_score + ats_score) / 2
        if overall_score >= 0.8:
            overall_quality = "Excellent"
        elif overall_score >= 0.6:
            overall_quality = "Good"
        elif overall_score >= 0.4:
            overall_quality = "Fair"
        else:
            overall_quality = "Needs Improvement"
        
        return ResumeAnalysis(
            ats_score=ats_score,
            keyword_match_score=keyword_match_score,
            matched_keywords=matched_keywords,
            missing_keywords=missing_keywords,
            suggestions=suggestions,
            overall_quality=overall_quality
        )
    
    def _extract_text_from_structured_resume(self, resume_dict: Dict[str, Any]) -> str:
        """Extract text content from structured resume for analysis"""
        text_parts = []
        
        # Personal info
        if 'personal_info' in resume_dict:
            personal = resume_dict['personal_info']
            text_parts.append(personal.get('summary', ''))
        
        # Skills
        if 'skills' in resume_dict:
            text_parts.extend(resume_dict['skills'])
        
        # Experience
        if 'experience' in resume_dict:
            for exp in resume_dict['experience']:
                text_parts.append(exp.get('description', ''))
                text_parts.extend(exp.get('achievements', []))
        
        # Projects
        if 'projects' in resume_dict:
            for project in resume_dict['projects']:
                text_parts.append(project.get('description', ''))
                text_parts.extend(project.get('technologies', []))
        
        return ' '.join(text_parts)
    
    def _extract_keywords(self, text: str) -> List[str]:
        """Extract important keywords from text"""
        # Simple keyword extraction - can be enhanced with NLP
        words = re.findall(r'\b[A-Za-z]{3,}\b', text.lower())
        
        # Filter out common words
        stop_words = {'the', 'and', 'for', 'are', 'but', 'not', 'you', 'all', 'can', 'had', 'her', 'was', 'one', 'our', 'out', 'day', 'get', 'has', 'him', 'his', 'how', 'man', 'new', 'now', 'old', 'see', 'two', 'way', 'who', 'boy', 'did', 'its', 'let', 'put', 'say', 'she', 'too', 'use'}
        
        keywords = [word for word in words if word not in stop_words and len(word) > 3]
        
        # Return unique keywords
        return list(set(keywords))[:50]  # Limit to 50 keywords
    
    def _calculate_ats_score(self, text: str) -> float:
        """Calculate ATS-friendliness score"""
        score = 0.0
        
        # Check for standard sections
        sections = ['experience', 'education', 'skills', 'summary', 'objective']
        for section in sections:
            if section.lower() in text.lower():
                score += 0.15
        
        # Check for bullet points or structured format
        if '•' in text or '-' in text or '*' in text:
            score += 0.1
        
        # Check for contact information
        if '@' in text:  # Email
            score += 0.1
        
        # Check for dates (experience/education)
        if re.search(r'\b\d{4}\b', text):  # Year format
            score += 0.1
        
        # Penalize for special characters that might confuse ATS
        special_chars = len(re.findall(r'[^\w\s\-\.\@\(\)]', text))
        if special_chars > 10:
            score -= 0.1
        
        return min(1.0, max(0.0, score))
    
    def _generate_resume_suggestions(self, keyword_score: float, ats_score: float, 
                                   missing_keywords: List[str]) -> List[str]:
        """Generate suggestions for resume improvement"""
        suggestions = []
        
        if keyword_score < 0.5:
            suggestions.append("Include more relevant keywords from the job description")
        
        if ats_score < 0.6:
            suggestions.append("Improve ATS-friendliness by using standard section headers and bullet points")
        
        if missing_keywords:
            top_missing = missing_keywords[:5]
            suggestions.append(f"Consider adding these relevant keywords: {', '.join(top_missing)}")
        
        if keyword_score < 0.3:
            suggestions.append("Tailor your experience descriptions to better match the job requirements")
        
        if ats_score < 0.4:
            suggestions.append("Use a simpler format with clear section headers and avoid special characters")
        
        return suggestions
    
    def _generate_fallback_text_resume(self, context: ResumeContext) -> str:
        """Generate basic text resume when AI fails"""
        return f"""
{context.student_name}
{context.student_email}
{context.student_phone or ''}

OBJECTIVE
Seeking the position of {context.job_title} at {context.company_name} to utilize my skills and contribute to the organization's success.

SKILLS
{', '.join(context.student_skills)}

EDUCATION
{self._format_education_for_prompt(context.student_education)}

EXPERIENCE
{self._format_experience_for_prompt(context.student_experience)}

PROJECTS
{self._format_projects_for_prompt(context.student_projects)}
"""
    
    def _generate_fallback_structured_resume(self, context: ResumeContext) -> Dict[str, Any]:
        """Generate basic structured resume when AI fails"""
        return {
            "personal_info": {
                "name": context.student_name,
                "email": context.student_email,
                "phone": context.student_phone or "",
                "summary": f"Motivated candidate seeking {context.job_title} position"
            },
            "skills": context.student_skills,
            "experience": context.student_experience,
            "education": context.student_education,
            "projects": context.student_projects
        }
    
    async def _generate_fallback_resume(self, student_id: str, job_id: str, 
                                      format_type: str, db_session: Session) -> Dict[str, Any]:
        """Generate fallback resume when main generation fails"""
        try:
            student = await self._fetch_student_data(student_id, db_session)
            job = await self._fetch_job_data(job_id, db_session)
            
            if student and job:
                context = await self._prepare_resume_context(student, job)
                
                if format_type.lower() == 'json':
                    resume_content = self._generate_fallback_structured_resume(context)
                else:
                    resume_content = self._generate_fallback_text_resume(context)
                
                return {
                    'resume_content': resume_content,
                    'format_type': format_type,
                    'analysis': None,
                    'generated_at': datetime.utcnow().isoformat(),
                    'student_id': student_id,
                    'job_id': job_id,
                    'fallback': True
                }
        except Exception as e:
            logger.error(f"Fallback resume generation failed: {e}")
        
        return {
            'error': 'Resume generation failed',
            'student_id': student_id,
            'job_id': job_id,
            'generated_at': datetime.utcnow().isoformat()
        }

# Example usage
async def main():
    """Example usage of the resume agent"""
    api_key = os.getenv('OPENAI_API_KEY')
    if not api_key:
        print("Please set OPENAI_API_KEY environment variable")
        return
    
    agent = ResumeAgent(api_key)
    
    # This would typically be called with actual database session and IDs
    print("Resume Agent initialized successfully")
    print("Use generate_tailored_resume() method with actual student_id, job_id, and db_session")

if __name__ == "__main__":
    asyncio.run(main())