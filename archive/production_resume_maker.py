#!/usr/bin/env python3
"""
AI Resume Maker - Production Version with Real OpenAI Integration
===============================================================

This version includes real OpenAI API integration for production use.
Make sure to set your OPENAI_API_KEY environment variable.

Usage:
    export OPENAI_API_KEY="your-api-key-here"
    python production_resume_maker.py
"""

import openai
import json
from typing import Dict, Any, List, Tuple
from datetime import datetime
import os
from dataclasses import dataclass
import re
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

@dataclass
class ResumeConfig:
    """Configuration for resume generation constraints"""
    max_projects: int = 3
    min_projects: int = 1
    max_internships: int = 2
    min_internships: int = 0
    max_programming_languages: int = 4
    min_programming_languages: int = 2
    target_length: str = "one_page"
    openai_model: str = "gpt-4"
    max_tokens: int = 1500
    temperature: float = 0.3

class ProductionAIResumeMaker:
    """Production AI-powered resume maker with real OpenAI integration"""
    
    def __init__(self, openai_api_key: str = None):
        # Initialize OpenAI client
        openai.api_key = openai_api_key or os.getenv("OPENAI_API_KEY")
        if not openai.api_key:
            raise ValueError("OpenAI API key is required. Set OPENAI_API_KEY environment variable.")
        
        self.config = ResumeConfig()
    
    def generate_resume(self, student_profile: Dict[str, Any], job_posting: Dict[str, Any]) -> str:
        """
        Main function to generate a tailored resume using OpenAI
        
        Args:
            student_profile: Student's complete profile data
            job_posting: Job posting details and requirements
            
        Returns:
            Formatted resume as string
        """
        try:
            # Step 1: Extract and prioritize relevant content
            matched_content = self._match_profile_to_job(student_profile, job_posting)
            
            # Step 2: Ensure mandatory fields are included
            mandatory_fields = self._extract_mandatory_fields(student_profile)
            
            # Step 3: Generate resume using OpenAI
            resume_content = self._generate_openai_resume(
                mandatory_fields, 
                matched_content, 
                job_posting
            )
            
            return resume_content
            
        except Exception as e:
            print(f"⚠️ OpenAI generation failed: {e}")
            print("🔄 Falling back to template-based generation...")
            
            # Fallback to template-based generation
            matched_content = self._match_profile_to_job(student_profile, job_posting)
            mandatory_fields = self._extract_mandatory_fields(student_profile)
            return self._generate_template_resume(mandatory_fields, matched_content, job_posting)
    
    def _match_profile_to_job(self, student_profile: Dict[str, Any], job_posting: Dict[str, Any]) -> Dict[str, Any]:
        """Match student profile elements to job requirements"""
        
        # Parse job text for keyword matching
        job_text = f"{job_posting['title']} {job_posting['description']} {' '.join(job_posting.get('requirements', []))}"
        job_text_lower = job_text.lower()
        
        # Score and rank different components
        relevant_skills = self._score_and_rank_skills(
            student_profile.get('skills', []) + student_profile.get('technologies', []), 
            job_text_lower
        )
        
        relevant_projects = self._score_and_rank_projects(
            student_profile.get('projects', []), 
            job_text_lower
        )
        
        relevant_internships = self._score_and_rank_internships(
            student_profile.get('internships', []), 
            job_text_lower
        )
        
        relevant_certifications = self._score_and_rank_certifications(
            student_profile.get('certifications', []), 
            job_text_lower
        )
        
        return {
            'skills': relevant_skills[:self.config.max_programming_languages],
            'projects': relevant_projects[:self.config.max_projects],
            'internships': relevant_internships[:self.config.max_internships],
            'certifications': relevant_certifications
        }
    
    def _score_and_rank_skills(self, skills: List[str], job_text: str) -> List[str]:
        """Score skills based on relevance to job"""
        scored_skills = []
        
        for skill in skills:
            score = 0
            skill_lower = skill.lower()
            
            # Direct mention gets highest score
            if skill_lower in job_text:
                score += 10
            
            # Partial matches
            for word in skill_lower.split():
                if word in job_text and len(word) > 2:  # Ignore short words
                    score += 3
            
            # Category-based scoring
            tech_categories = {
                'programming': ['python', 'java', 'javascript', 'c++', 'c#', 'go', 'rust', 'typescript'],
                'cloud': ['aws', 'azure', 'gcp', 'cloud', 'docker', 'kubernetes'],
                'web': ['react', 'angular', 'vue', 'node', 'express', 'django', 'flask'],
                'database': ['sql', 'postgresql', 'mongodb', 'redis', 'mysql'],
                'ml': ['tensorflow', 'pytorch', 'machine learning', 'ai', 'data science']
            }
            
            for category, keywords in tech_categories.items():
                if any(keyword in skill_lower for keyword in keywords):
                    score += 2
            
            if score > 0:
                scored_skills.append((skill, score))
        
        # Sort by score (descending)
        scored_skills.sort(key=lambda x: x[1], reverse=True)
        return [skill for skill, score in scored_skills]
    
    def _score_and_rank_projects(self, projects: List[Dict], job_text: str) -> List[Dict]:
        """Score projects based on relevance to job"""
        scored_projects = []
        
        for project in projects:
            score = 0
            project_text = f"{project.get('title', '')} {project.get('description', '')} {' '.join(project.get('technologies', []))}"
            project_text_lower = project_text.lower()
            
            # Technology stack alignment
            for word in project_text_lower.split():
                if word in job_text and len(word) > 2:
                    score += 3
            
            # Impact indicators
            impact_keywords = ['users', 'performance', 'scalable', 'optimization', 'automated', 'efficiency', '%']
            for keyword in impact_keywords:
                if keyword in project_text_lower:
                    score += 5
            
            # Recent projects get bonus
            current_year = datetime.now().year
            project_year = int(project.get('year', current_year))
            if project_year >= current_year - 1:
                score += 2
            
            if score > 0:
                scored_projects.append((project, score))
        
        scored_projects.sort(key=lambda x: x[1], reverse=True)
        return [project for project, score in scored_projects]
    
    def _score_and_rank_internships(self, internships: List[Dict], job_text: str) -> List[Dict]:
        """Score internships based on relevance to job"""
        scored_internships = []
        
        for internship in internships:
            score = 0
            internship_text = f"{internship.get('company', '')} {internship.get('role', '')} {internship.get('description', '')}"
            internship_text_lower = internship_text.lower()
            
            # Role and description relevance
            for word in internship_text_lower.split():
                if word in job_text and len(word) > 2:
                    score += 3
            
            # Tech industry bonus
            tech_indicators = ['tech', 'software', 'engineer', 'developer', 'startup', 'saas']
            for indicator in tech_indicators:
                if indicator in internship_text_lower:
                    score += 2
            
            if score > 0:
                scored_internships.append((internship, score))
        
        scored_internships.sort(key=lambda x: x[1], reverse=True)
        return [internship for internship, score in scored_internships]
    
    def _score_and_rank_certifications(self, certifications: List[Dict], job_text: str) -> List[Dict]:
        """Score certifications based on relevance to job"""
        scored_certs = []
        
        for cert in certifications:
            score = 0
            cert_text = f"{cert.get('name', '')} {cert.get('issuer', '')}"
            cert_text_lower = cert_text.lower()
            
            # Direct relevance
            for word in cert_text_lower.split():
                if word in job_text and len(word) > 2:
                    score += 5
            
            # High-value certification providers
            prestigious_providers = ['aws', 'google', 'microsoft', 'cisco', 'oracle', 'salesforce']
            for provider in prestigious_providers:
                if provider in cert_text_lower:
                    score += 3
            
            # Recent certifications get bonus
            current_year = datetime.now().year
            cert_year = int(cert.get('year', current_year))
            if cert_year >= current_year - 2:
                score += 1
            
            if score > 0:
                scored_certs.append((cert, score))
        
        scored_certs.sort(key=lambda x: x[1], reverse=True)
        return [cert for cert, score in scored_certs]
    
    def _extract_mandatory_fields(self, student_profile: Dict[str, Any]) -> Dict[str, Any]:
        """Extract mandatory resume fields"""
        education = student_profile.get('education', {})
        
        return {
            'name': student_profile.get('name', 'Student Name'),
            'email': student_profile.get('email', 'email@example.com'),
            'phone': student_profile.get('phone', '+1-000-000-0000'),
            'linkedin': student_profile.get('linkedin', ''),
            'github': student_profile.get('github', ''),
            'age': student_profile.get('age', 22),
            'location': student_profile.get('location', ''),
            'education': education,
            'extracurricular': student_profile.get('extracurricular', []),
            'languages': student_profile.get('languages', [])
        }
    
    def _generate_openai_resume(self, mandatory_fields: Dict, matched_content: Dict, job_posting: Dict) -> str:
        """Generate resume using OpenAI API"""
        
        prompt = self._create_detailed_prompt(mandatory_fields, matched_content, job_posting)
        
        try:
            response = openai.ChatCompletion.create(
                model=self.config.openai_model,
                messages=[
                    {
                        "role": "system", 
                        "content": "You are an expert resume writer specializing in creating ATS-friendly, one-page resumes for technical roles. Focus on quantified achievements and relevant keywords."
                    },
                    {
                        "role": "user", 
                        "content": prompt
                    }
                ],
                max_tokens=self.config.max_tokens,
                temperature=self.config.temperature
            )
            
            resume_content = response.choices[0].message.content.strip()
            
            # Validate and clean the response
            return self._validate_and_clean_resume(resume_content)
            
        except openai.error.RateLimitError:
            raise Exception("OpenAI rate limit exceeded. Please try again later.")
        except openai.error.AuthenticationError:
            raise Exception("Invalid OpenAI API key.")
        except openai.error.InvalidRequestError as e:
            raise Exception(f"Invalid request to OpenAI: {e}")
        except Exception as e:
            raise Exception(f"OpenAI API error: {e}")
    
    def _create_detailed_prompt(self, mandatory_fields: Dict, matched_content: Dict, job_posting: Dict) -> str:
        """Create comprehensive prompt for OpenAI"""
        
        prompt = f"""Create a professional, ATS-friendly, one-page resume for the following job application.

JOB DETAILS:
Position: {job_posting['title']}
Company: {job_posting['company']}
Job Type: {job_posting.get('job_type', 'full-time')}
Location: {job_posting.get('location', 'Not specified')}

KEY REQUIREMENTS:
{chr(10).join(['• ' + req for req in job_posting.get('requirements', [])])}

JOB DESCRIPTION EXCERPT:
{job_posting['description'][:800]}...

STUDENT INFORMATION:
Name: {mandatory_fields['name']}
Contact: {mandatory_fields['email']} | {mandatory_fields['phone']}
LinkedIn: {mandatory_fields.get('linkedin', 'Not provided')}
GitHub: {mandatory_fields.get('github', 'Not provided')}
Location: {mandatory_fields.get('location', 'Not specified')}

EDUCATION:
{json.dumps(mandatory_fields['education'], indent=2)}

TOP RELEVANT SKILLS (prioritize these):
{', '.join(matched_content['skills'])}

MOST RELEVANT PROJECTS (include up to 3):
{json.dumps(matched_content['projects'][:3], indent=2)}

RELEVANT INTERNSHIPS (include up to 2):
{json.dumps(matched_content['internships'][:2], indent=2)}

RELEVANT CERTIFICATIONS:
{json.dumps(matched_content['certifications'], indent=2)}

EXTRACURRICULAR ACTIVITIES:
{mandatory_fields.get('extracurricular', [])}

LANGUAGES:
{mandatory_fields.get('languages', [])}

RESUME REQUIREMENTS:
1. MUST fit on exactly one page when printed
2. Use clean, professional formatting with clear sections
3. Include ALL mandatory contact and education information
4. Emphasize skills and experiences most relevant to the job requirements
5. Use strong action verbs (Built, Developed, Implemented, Optimized, etc.)
6. Include quantified achievements where possible (percentages, numbers, metrics)
7. Make it ATS-friendly (avoid tables, graphics, unusual formatting)
8. Prioritize recent and relevant experiences
9. Use consistent formatting and bullet points
10. Include relevant keywords from the job posting naturally

FORMATTING GUIDELINES:
- Name at the top in larger font
- Contact information on one line below name
- Clear section headers: EDUCATION, TECHNICAL SKILLS, PROJECTS, EXPERIENCE/INTERNSHIPS, CERTIFICATIONS
- Use bullet points for descriptions
- Keep descriptions concise but impactful
- Ensure proper spacing and readability

Generate the complete resume in plain text format, ready for copying into a document."""
        
        return prompt
    
    def _validate_and_clean_resume(self, resume_content: str) -> str:
        """Validate and clean the generated resume"""
        
        # Remove any markdown formatting that might cause issues
        resume_content = re.sub(r'\*\*(.*?)\*\*', r'\1', resume_content)  # Remove bold
        resume_content = re.sub(r'\*(.*?)\*', r'\1', resume_content)      # Remove italics
        
        # Ensure proper line breaks
        resume_content = re.sub(r'\n{3,}', '\n\n', resume_content)       # Max 2 line breaks
        
        # Clean up any extra whitespace
        lines = [line.strip() for line in resume_content.split('\n')]
        resume_content = '\n'.join(lines)
        
        return resume_content.strip()
    
    def _generate_template_resume(self, mandatory_fields: Dict, matched_content: Dict, job_posting: Dict) -> str:
        """Fallback template-based resume generation"""
        
        # This is a copy of the template generation from the test script
        # Header
        resume = f"{mandatory_fields['name'].upper()}\n"
        contact_info = [
            f"Email: {mandatory_fields['email']}",
            f"Phone: {mandatory_fields['phone']}"
        ]
        if mandatory_fields.get('linkedin'):
            contact_info.append(f"LinkedIn: {mandatory_fields['linkedin']}")
        if mandatory_fields.get('github'):
            contact_info.append(f"GitHub: {mandatory_fields['github']}")
        if mandatory_fields.get('location'):
            contact_info.append(f"Location: {mandatory_fields['location']}")
        
        resume += " | ".join(contact_info) + "\n\n"
        
        # Education
        resume += "EDUCATION\n"
        edu = mandatory_fields['education']
        if edu:
            degree = edu.get('current_degree', 'Bachelor of Technology')
            major = edu.get('major', 'Computer Science')
            university = edu.get('university', 'University Name')
            grad_year = edu.get('graduation_year', '2025')
            cgpa = edu.get('cgpa', '8.0')
            
            resume += f"{degree} in {major} (Graduating: {grad_year})\n"
            resume += f"{university} | CGPA: {cgpa}/10\n"
            
            if edu.get('grade_12'):
                grade_12 = edu['grade_12']
                resume += f"12th Grade: {grade_12.get('school', 'School Name')} ({grade_12.get('year', '2022')}) | Score: {grade_12.get('percentage', '85')}%\n"
            
            if edu.get('grade_10'):
                grade_10 = edu['grade_10']
                resume += f"10th Grade: {grade_10.get('school', 'School Name')} ({grade_10.get('year', '2020')}) | Score: {grade_10.get('percentage', '85')}%\n"
        
        resume += "\n"
        
        # Technical Skills
        resume += "TECHNICAL SKILLS\n"
        skills = matched_content.get('skills', [])
        if skills:
            resume += f"Programming & Technologies: {', '.join(skills[:self.config.max_programming_languages])}\n"
        resume += "\n"
        
        # Projects
        projects = matched_content.get('projects', [])
        if projects:
            resume += "PROJECTS\n"
            for project in projects[:self.config.max_projects]:
                title = project.get('title', 'Project Title')
                year = project.get('year', '2024')
                description = project.get('description', 'Project description not available.')
                
                resume += f"{title} ({year})\n"
                resume += f"• {description}\n"
                
                if project.get('technologies'):
                    resume += f"• Technologies: {', '.join(project['technologies'])}\n"
                resume += "\n"
        
        # Internships
        internships = matched_content.get('internships', [])
        if internships:
            resume += "EXPERIENCE\n"
            for internship in internships[:self.config.max_internships]:
                role = internship.get('role', 'Intern')
                company = internship.get('company', 'Company Name')
                duration = internship.get('duration', 'Duration not specified')
                description = internship.get('description', '')
                
                resume += f"{role} - {company} ({duration})\n"
                if description:
                    resume += f"• {description}\n"
                resume += "\n"
        
        # Certifications
        certifications = matched_content.get('certifications', [])
        if certifications:
            resume += "CERTIFICATIONS\n"
            for cert in certifications:
                name = cert.get('name', 'Certification Name')
                issuer = cert.get('issuer', '')
                year = cert.get('year', '')
                
                cert_line = f"• {name}"
                if issuer:
                    cert_line += f" - {issuer}"
                if year:
                    cert_line += f" ({year})"
                resume += cert_line + "\n"
            resume += "\n"
        
        # Additional sections
        if mandatory_fields.get('extracurricular'):
            resume += "EXTRACURRICULAR ACTIVITIES\n"
            activities = mandatory_fields['extracurricular']
            if isinstance(activities, list):
                resume += " | ".join(activities) + "\n\n"
            else:
                resume += f"{activities}\n\n"
        
        if mandatory_fields.get('languages'):
            resume += "LANGUAGES\n"
            languages = mandatory_fields['languages']
            if isinstance(languages, list):
                resume += ", ".join(languages) + "\n"
            else:
                resume += f"{languages}\n"
        
        return resume


# Test the production version
if __name__ == "__main__":
    print("🚀 Production AI Resume Maker - OpenAI Integration Test")
    print("=" * 60)
    
    # Check for API key
    api_key = os.getenv("OPENAI_API_KEY")
    if not api_key:
        print("❌ Error: OPENAI_API_KEY environment variable not set")
        print("Please set your OpenAI API key:")
        print("export OPENAI_API_KEY='your-api-key-here'")
        exit(1)
    
    print(f"✅ OpenAI API Key found: {api_key[:8]}...")
    
    # Use the same mock data from the test script
    from test_resume_maker import create_mock_student_profile, create_mock_job_postings
    
    try:
        # Initialize with production settings
        resume_maker = ProductionAIResumeMaker(api_key)
        
        # Test with one job posting
        student_profile = create_mock_student_profile()
        job_postings = create_mock_job_postings()
        
        print(f"\n👨‍🎓 Testing with student: {student_profile['name']}")
        
        # Test Cloud Engineer position
        job = job_postings[0]  # Cloud Engineer
        print(f"🎯 Generating resume for: {job['title']} at {job['company']}")
        print("⏳ Calling OpenAI API...")
        
        resume = resume_maker.generate_resume(student_profile, job)
        
        print("✅ OpenAI resume generation successful!")
        print(f"📄 Resume length: {len(resume)} characters")
        
        # Save the OpenAI-generated resume
        with open("openai_generated_resume.txt", "w", encoding="utf-8") as f:
            f.write(resume)
        
        print("\n📋 OPENAI-GENERATED RESUME:")
        print("=" * 80)
        print(resume)
        print("=" * 80)
        
        print("\n💾 Resume saved to: openai_generated_resume.txt")
        print("\n🎉 Production test completed successfully!")
        
    except Exception as e:
        print(f"❌ Error: {e}")
        print("\n🔄 This would fallback to template generation in production.")