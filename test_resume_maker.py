#!/usr/bin/env python3
"""
AI Resume Maker - Standalone Test Script
========================================

This script creates optimized, one-page resumes for students applying to specific jobs.
It matches student profiles to job requirements and generates tailored resumes.

Requirements:
- One page only
- Best skill/project/internship matches
- Mandatory fields: name, contact info, education
- Flexible content based on job requirements

Usage:
    python test_resume_maker.py
"""

import json
from typing import Dict, Any, List, Tuple
from datetime import datetime
import os
from dataclasses import dataclass
import re

# Mock OpenAI API - Replace with actual OpenAI integration later
class MockOpenAI:
    def __init__(self, api_key: str):
        self.api_key = api_key
    
    def chat_completions_create(self, model: str, messages: List[Dict], **kwargs) -> str:
        """Mock OpenAI API response - replace with actual openai.ChatCompletion.create"""
        # This would be replaced with actual OpenAI API call
        return """JOHN SMITH
Email: john.smith@email.com | Phone: +1-234-567-8900 | LinkedIn: linkedin.com/in/johnsmith | GitHub: github.com/johnsmith
Location: New York, NY | Age: 22

EDUCATION
Bachelor of Technology in Computer Science Engineering (2022-2025)
ABC University, New York | CGPA: 8.5/10
12th Grade: XYZ School, New York (2022) | Score: 92%
10th Grade: XYZ School, New York (2020) | Score: 90%

TECHNICAL SKILLS
Programming Languages: Python, Java, JavaScript, C++
Cloud Technologies: AWS EC2, S3, Lambda, Docker, Kubernetes
Databases: PostgreSQL, MongoDB
Tools & Frameworks: React, Node.js, FastAPI, Git

PROJECTS
E-Commerce Platform (2024)
• Built scalable e-commerce application using React frontend and Node.js backend
• Implemented secure payment integration with Stripe API
• Deployed on AWS with auto-scaling capabilities, serving 1000+ concurrent users

Cloud Infrastructure Automation (2024)
• Developed Infrastructure as Code using Terraform and AWS CloudFormation
• Automated CI/CD pipeline with GitHub Actions, reducing deployment time by 70%
• Implemented monitoring and alerting using CloudWatch and SNS

INTERNSHIPS
Software Development Intern - TechCorp (Jun-Aug 2024)
• Developed microservices architecture using Docker and Kubernetes
• Optimized database queries resulting in 40% performance improvement

CERTIFICATIONS
• AWS Certified Cloud Practitioner (2024)
• Google Cloud Associate Cloud Engineer (2024)

EXTRACURRICULAR ACTIVITIES
President, Computer Science Society | National Level Coding Competition Winner | Volunteer at Local Tech Meetups

LANGUAGES
English (Native), Spanish (Intermediate), French (Basic)"""

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

class AIResumeMaker:
    """AI-powered resume maker that generates tailored resumes for job applications"""
    
    def __init__(self, openai_api_key: str = None):
        self.openai_client = MockOpenAI(openai_api_key or "mock-key")
        self.config = ResumeConfig()
    
    def generate_resume(self, student_profile: Dict[str, Any], job_posting: Dict[str, Any]) -> str:
        """
        Main function to generate a tailored resume
        
        Args:
            student_profile: Student's complete profile data
            job_posting: Job posting details and requirements
            
        Returns:
            Formatted resume as string
        """
        # Step 1: Extract and prioritize relevant content
        matched_content = self._match_profile_to_job(student_profile, job_posting)
        
        # Step 2: Ensure mandatory fields are included
        mandatory_fields = self._extract_mandatory_fields(student_profile)
        
        # Step 3: Generate resume using AI
        resume_content = self._generate_ai_resume(
            mandatory_fields, 
            matched_content, 
            job_posting
        )
        
        return resume_content
    
    def _match_profile_to_job(self, student_profile: Dict[str, Any], job_posting: Dict[str, Any]) -> Dict[str, Any]:
        """Match student profile elements to job requirements"""
        
        # Extract job requirements
        job_skills = set()
        job_technologies = set()
        job_keywords = set()
        
        # Parse job description and requirements
        job_text = f"{job_posting['title']} {job_posting['description']} {' '.join(job_posting.get('requirements', []))}"
        job_text_lower = job_text.lower()
        
        # Common technical skills and tools
        all_skills = student_profile.get('skills', [])
        all_technologies = student_profile.get('technologies', [])
        
        # Score and rank skills based on job relevance
        relevant_skills = self._score_and_rank_skills(all_skills + all_technologies, job_text_lower)
        
        # Score and rank projects
        relevant_projects = self._score_and_rank_projects(
            student_profile.get('projects', []), 
            job_text_lower
        )
        
        # Score and rank internships
        relevant_internships = self._score_and_rank_internships(
            student_profile.get('internships', []), 
            job_text_lower
        )
        
        # Score and rank certifications
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
        """Score skills based on relevance to job and return ranked list"""
        scored_skills = []
        
        for skill in skills:
            score = 0
            skill_lower = skill.lower()
            
            # Direct mention in job text
            if skill_lower in job_text:
                score += 10
            
            # Partial match
            for word in skill_lower.split():
                if word in job_text:
                    score += 3
            
            # Technology category scoring
            if any(tech in skill_lower for tech in ['python', 'java', 'javascript', 'c++', 'c#']):
                score += 2
            if any(tech in skill_lower for tech in ['aws', 'azure', 'gcp', 'cloud']):
                score += 2
            if any(tech in skill_lower for tech in ['react', 'angular', 'vue', 'node']):
                score += 2
            
            scored_skills.append((skill, score))
        
        # Sort by score (descending) and return skill names
        scored_skills.sort(key=lambda x: x[1], reverse=True)
        return [skill for skill, score in scored_skills if score > 0]
    
    def _score_and_rank_projects(self, projects: List[Dict], job_text: str) -> List[Dict]:
        """Score projects based on relevance to job"""
        scored_projects = []
        
        for project in projects:
            score = 0
            project_text = f"{project.get('title', '')} {project.get('description', '')} {' '.join(project.get('technologies', []))}"
            project_text_lower = project_text.lower()
            
            # Technology stack match
            for word in project_text_lower.split():
                if word in job_text:
                    score += 3
            
            # Project impact scoring
            if any(metric in project_text_lower for metric in ['users', 'performance', 'scalable', 'optimization']):
                score += 5
            
            scored_projects.append((project, score))
        
        # Sort by score and return projects
        scored_projects.sort(key=lambda x: x[1], reverse=True)
        return [project for project, score in scored_projects if score > 0]
    
    def _score_and_rank_internships(self, internships: List[Dict], job_text: str) -> List[Dict]:
        """Score internships based on relevance to job"""
        scored_internships = []
        
        for internship in internships:
            score = 0
            internship_text = f"{internship.get('company', '')} {internship.get('role', '')} {internship.get('description', '')}"
            internship_text_lower = internship_text.lower()
            
            # Role relevance
            for word in internship_text_lower.split():
                if word in job_text:
                    score += 3
            
            # Company size/reputation (basic heuristic)
            if any(term in internship_text_lower for term in ['tech', 'software', 'engineer', 'developer']):
                score += 2
            
            scored_internships.append((internship, score))
        
        scored_internships.sort(key=lambda x: x[1], reverse=True)
        return [internship for internship, score in scored_internships if score > 0]
    
    def _score_and_rank_certifications(self, certifications: List[Dict], job_text: str) -> List[Dict]:
        """Score certifications based on relevance to job"""
        scored_certs = []
        
        for cert in certifications:
            score = 0
            cert_text = f"{cert.get('name', '')} {cert.get('issuer', '')}"
            cert_text_lower = cert_text.lower()
            
            # Direct relevance to job
            for word in cert_text_lower.split():
                if word in job_text:
                    score += 5
            
            # High-value certifications
            if any(provider in cert_text_lower for provider in ['aws', 'google', 'microsoft', 'cisco']):
                score += 3
            
            scored_certs.append((cert, score))
        
        scored_certs.sort(key=lambda x: x[1], reverse=True)
        return [cert for cert, score in scored_certs if score > 0]
    
    def _extract_mandatory_fields(self, student_profile: Dict[str, Any]) -> Dict[str, Any]:
        """Extract mandatory resume fields that must always be included"""
        education = student_profile.get('education', {})
        
        return {
            'name': student_profile.get('name', 'Student Name'),
            'email': student_profile.get('email', 'email@example.com'),
            'phone': student_profile.get('phone', '+1-000-000-0000'),
            'linkedin': student_profile.get('linkedin', ''),
            'github': student_profile.get('github', ''),
            'age': student_profile.get('age', 22),
            'location': student_profile.get('location', ''),
            
            # Education (mandatory)
            'education': {
                'current_degree': education.get('current_degree', 'Bachelor of Technology'),
                'major': education.get('major', 'Computer Science'),
                'university': education.get('university', 'University Name'),
                'graduation_year': education.get('graduation_year', 2025),
                'cgpa': education.get('cgpa', '8.0'),
                'grade_12': education.get('grade_12', {}),
                'grade_10': education.get('grade_10', {})
            },
            
            # Static fields
            'extracurricular': student_profile.get('extracurricular', []),
            'languages': student_profile.get('languages', [])
        }
    
    def _generate_ai_resume(self, mandatory_fields: Dict, matched_content: Dict, job_posting: Dict) -> str:
        """Generate resume using AI with structured prompts"""
        
        # Create structured prompt for OpenAI
        prompt = self._create_resume_prompt(mandatory_fields, matched_content, job_posting)
        
        # For now, return the mock response
        # In actual implementation, replace with:
        # response = self.openai_client.chat.completions.create(
        #     model="gpt-4",
        #     messages=[{"role": "user", "content": prompt}],
        #     max_tokens=1500,
        #     temperature=0.3
        # )
        # return response.choices[0].message.content
        
        return self._format_resume_from_data(mandatory_fields, matched_content, job_posting)
    
    def _create_resume_prompt(self, mandatory_fields: Dict, matched_content: Dict, job_posting: Dict) -> str:
        """Create structured prompt for OpenAI API"""
        
        prompt = f"""
Create a professional, one-page resume for a student applying to the following job:

JOB POSTING:
Title: {job_posting['title']}
Company: {job_posting['company']}
Requirements: {', '.join(job_posting.get('requirements', []))}
Description: {job_posting['description'][:500]}...

STUDENT INFORMATION:
Name: {mandatory_fields['name']}
Contact: {mandatory_fields['email']} | {mandatory_fields['phone']}
LinkedIn: {mandatory_fields.get('linkedin', 'N/A')}
GitHub: {mandatory_fields.get('github', 'N/A')}

EDUCATION:
{mandatory_fields['education']['current_degree']} in {mandatory_fields['education']['major']}
{mandatory_fields['education']['university']} (Graduating: {mandatory_fields['education']['graduation_year']})
CGPA: {mandatory_fields['education']['cgpa']}/10

RELEVANT SKILLS TO HIGHLIGHT:
{', '.join(matched_content['skills'])}

TOP PROJECTS TO INCLUDE:
{json.dumps(matched_content['projects'][:self.config.max_projects], indent=2)}

INTERNSHIPS TO INCLUDE:
{json.dumps(matched_content['internships'][:self.config.max_internships], indent=2)}

CERTIFICATIONS:
{json.dumps(matched_content['certifications'], indent=2)}

REQUIREMENTS:
1. MUST fit on exactly one page
2. Use professional formatting
3. Emphasize skills and experiences most relevant to the job
4. Include all mandatory fields
5. Quantify achievements where possible
6. Use action verbs and impact metrics
7. Maintain ATS-friendly format

Format the resume in clean, professional text format suitable for copying into documents.
"""
        return prompt
    
    def _format_resume_from_data(self, mandatory_fields: Dict, matched_content: Dict, job_posting: Dict) -> str:
        """Format resume directly from structured data (fallback method)"""
        
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
        if mandatory_fields.get('age'):
            contact_info.append(f"Age: {mandatory_fields['age']}")
        
        resume += " | ".join(contact_info) + "\n\n"
        
        # Education
        resume += "EDUCATION\n"
        edu = mandatory_fields['education']
        resume += f"{edu['current_degree']} in {edu['major']} ({edu.get('start_year', 'Current')}-{edu['graduation_year']})\n"
        resume += f"{edu['university']} | CGPA: {edu['cgpa']}/10\n"
        
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
            # Group skills by category for better presentation
            prog_languages = [s for s in skills if any(lang in s.lower() for lang in ['python', 'java', 'javascript', 'c++', 'c#', 'go', 'rust'])]
            cloud_tools = [s for s in skills if any(cloud in s.lower() for cloud in ['aws', 'azure', 'gcp', 'docker', 'kubernetes'])]
            other_tools = [s for s in skills if s not in prog_languages and s not in cloud_tools]
            
            if prog_languages:
                resume += f"Programming Languages: {', '.join(prog_languages[:self.config.max_programming_languages])}\n"
            if cloud_tools:
                resume += f"Cloud & DevOps: {', '.join(cloud_tools)}\n"
            if other_tools:
                resume += f"Tools & Frameworks: {', '.join(other_tools)}\n"
        
        resume += "\n"
        
        # Projects
        projects = matched_content.get('projects', [])
        if projects:
            resume += "PROJECTS\n"
            for project in projects[:self.config.max_projects]:
                resume += f"{project.get('title', 'Project Title')} ({project.get('year', '2024')})\n"
                description = project.get('description', 'Project description not available.')
                # Format description as bullet points
                resume += f"• {description}\n"
                if project.get('technologies'):
                    resume += f"• Technologies: {', '.join(project['technologies'])}\n"
                resume += "\n"
        
        # Internships
        internships = matched_content.get('internships', [])
        if internships:
            resume += "INTERNSHIPS\n"
            for internship in internships[:self.config.max_internships]:
                title = f"{internship.get('role', 'Intern')} - {internship.get('company', 'Company Name')}"
                duration = internship.get('duration', 'Duration not specified')
                resume += f"{title} ({duration})\n"
                if internship.get('description'):
                    resume += f"• {internship['description']}\n"
                resume += "\n"
        
        # Certifications
        certifications = matched_content.get('certifications', [])
        if certifications:
            resume += "CERTIFICATIONS\n"
            for cert in certifications:
                cert_line = f"• {cert.get('name', 'Certification Name')}"
                if cert.get('issuer'):
                    cert_line += f" - {cert['issuer']}"
                if cert.get('year'):
                    cert_line += f" ({cert['year']})"
                resume += cert_line + "\n"
            resume += "\n"
        
        # Extracurricular Activities
        if mandatory_fields.get('extracurricular'):
            resume += "EXTRACURRICULAR ACTIVITIES\n"
            activities = mandatory_fields['extracurricular']
            if isinstance(activities, list):
                resume += " | ".join(activities) + "\n\n"
            else:
                resume += f"{activities}\n\n"
        
        # Languages
        if mandatory_fields.get('languages'):
            resume += "LANGUAGES\n"
            languages = mandatory_fields['languages']
            if isinstance(languages, list):
                resume += ", ".join(languages) + "\n"
            else:
                resume += f"{languages}\n"
        
        return resume


# ============================================================================
# MOCK DATA FOR TESTING
# ============================================================================

def create_mock_student_profile() -> Dict[str, Any]:
    """Create comprehensive mock student profile matching your database structure"""
    return {
        # Basic Info (Mandatory)
        "name": "John Smith",
        "email": "john.smith@email.com",
        "phone": "+1-234-567-8900",
        "linkedin": "linkedin.com/in/johnsmith",
        "github": "github.com/johnsmith",
        "age": 22,
        "location": "New York, NY",
        
        # Education (Mandatory)
        "education": {
            "current_degree": "Bachelor of Technology in Computer Science Engineering",
            "major": "Computer Science Engineering",
            "university": "ABC University, New York",
            "start_year": 2022,
            "graduation_year": 2025,
            "cgpa": "8.5",
            "grade_12": {
                "school": "XYZ School, New York",
                "year": 2022,
                "percentage": "92",
                "board": "CBSE"
            },
            "grade_10": {
                "school": "XYZ School, New York", 
                "year": 2020,
                "percentage": "90",
                "board": "CBSE"
            }
        },
        
        # Skills (Variable - to be filtered based on job)
        "skills": [
            "Python", "Java", "JavaScript", "C++", "Go", "Rust", "TypeScript",
            "React", "Node.js", "Express.js", "Django", "Flask", "FastAPI",
            "AWS", "Docker", "Kubernetes", "Jenkins", "Git", "Linux",
            "PostgreSQL", "MongoDB", "Redis", "MySQL",
            "Machine Learning", "TensorFlow", "PyTorch", "Pandas", "NumPy"
        ],
        
        # Technologies (Variable - to be filtered)
        "technologies": [
            "AWS EC2", "AWS S3", "AWS Lambda", "AWS RDS", "AWS CloudFormation",
            "Docker", "Kubernetes", "Jenkins", "GitHub Actions", "Terraform",
            "React", "Next.js", "Vue.js", "Angular", "Node.js", "Express.js",
            "PostgreSQL", "MongoDB", "Redis", "Elasticsearch",
            "Microservices", "RESTful APIs", "GraphQL", "WebSockets"
        ],
        
        # Projects (Variable - max 3, min 1)
        "projects": [
            {
                "title": "E-Commerce Platform",
                "description": "Built scalable e-commerce application using React frontend and Node.js backend with secure payment integration using Stripe API. Deployed on AWS with auto-scaling capabilities, serving 1000+ concurrent users.",
                "technologies": ["React", "Node.js", "Express.js", "PostgreSQL", "AWS", "Stripe API"],
                "year": "2024",
                "github": "github.com/johnsmith/ecommerce-platform",
                "live_demo": "https://ecommerce-demo.com"
            },
            {
                "title": "Cloud Infrastructure Automation",
                "description": "Developed Infrastructure as Code using Terraform and AWS CloudFormation. Automated CI/CD pipeline with GitHub Actions, reducing deployment time by 70%. Implemented monitoring and alerting using CloudWatch and SNS.",
                "technologies": ["Terraform", "AWS CloudFormation", "GitHub Actions", "AWS CloudWatch", "Python"],
                "year": "2024",
                "github": "github.com/johnsmith/cloud-automation"
            },
            {
                "title": "Machine Learning Stock Predictor",
                "description": "Built ML model using Python and TensorFlow to predict stock prices with 85% accuracy. Implemented real-time data processing pipeline using Apache Kafka and deployed model using Docker containers.",
                "technologies": ["Python", "TensorFlow", "Apache Kafka", "Docker", "Pandas", "NumPy"],
                "year": "2023",
                "github": "github.com/johnsmith/ml-stock-predictor"
            },
            {
                "title": "Real-time Chat Application",
                "description": "Developed real-time chat application using WebSockets with React frontend and Node.js backend. Implemented message encryption and file sharing capabilities with 99.9% uptime.",
                "technologies": ["React", "Node.js", "WebSockets", "Socket.IO", "MongoDB"],
                "year": "2023",
                "github": "github.com/johnsmith/chat-app"
            },
            {
                "title": "Mobile Task Management App",
                "description": "Created cross-platform mobile app using React Native with offline synchronization and push notifications. Integrated with REST APIs and implemented secure user authentication.",
                "technologies": ["React Native", "Node.js", "MongoDB", "Firebase", "JWT"],
                "year": "2023",
                "github": "github.com/johnsmith/task-app"
            }
        ],
        
        # Internships (Variable - max 2, min 0)
        "internships": [
            {
                "company": "TechCorp Inc.",
                "role": "Software Development Intern",
                "duration": "Jun-Aug 2024",
                "location": "San Francisco, CA",
                "description": "Developed microservices architecture using Docker and Kubernetes. Optimized database queries resulting in 40% performance improvement. Collaborated with senior developers on high-traffic web applications."
            },
            {
                "company": "CloudSolutions Ltd.",
                "role": "Cloud Engineering Intern", 
                "duration": "Jan-May 2024",
                "location": "Remote",
                "description": "Assisted in migrating legacy applications to AWS cloud infrastructure. Implemented automated backup and disaster recovery solutions. Gained experience with DevOps practices and CI/CD pipelines."
            },
            {
                "company": "StartupXYZ",
                "role": "Full Stack Developer Intern",
                "duration": "Jun-Aug 2023", 
                "location": "New York, NY",
                "description": "Built full-stack web applications using MERN stack. Implemented user authentication and authorization systems. Participated in agile development process and daily standups."
            }
        ],
        
        # Certifications (Variable - relevant ones will be selected)
        "certifications": [
            {
                "name": "AWS Certified Cloud Practitioner",
                "issuer": "Amazon Web Services",
                "year": "2024",
                "credential_id": "AWS-CCP-2024-001"
            },
            {
                "name": "Google Cloud Associate Cloud Engineer",
                "issuer": "Google Cloud",
                "year": "2024",
                "credential_id": "GCP-ACE-2024-001"
            },
            {
                "name": "Microsoft Azure Fundamentals",
                "issuer": "Microsoft",
                "year": "2023",
                "credential_id": "AZ-900-2023-001"
            },
            {
                "name": "Docker Certified Associate",
                "issuer": "Docker Inc.",
                "year": "2024",
                "credential_id": "DCA-2024-001"
            },
            {
                "name": "Kubernetes Application Developer",
                "issuer": "Cloud Native Computing Foundation",
                "year": "2024",
                "credential_id": "CKAD-2024-001"
            }
        ],
        
        # Static fields (always included)
        "extracurricular": [
            "President, Computer Science Society",
            "National Level Coding Competition Winner", 
            "Volunteer at Local Tech Meetups",
            "Member of IEEE Computer Society"
        ],
        
        "languages": [
            "English (Native)",
            "Spanish (Intermediate)", 
            "French (Basic)"
        ]
    }

def create_mock_job_postings() -> List[Dict[str, Any]]:
    """Create various job postings for testing"""
    return [
        {
            "id": 1,
            "title": "Cloud Engineer",
            "company": "Amazon Web Services",
            "description": "We are seeking a talented Cloud Engineer to join our team. The ideal candidate will have experience with AWS services, containerization technologies like Docker and Kubernetes, and infrastructure automation. You will be responsible for designing, implementing, and maintaining scalable cloud infrastructure solutions. Experience with Terraform, CloudFormation, and CI/CD pipelines is highly valued.",
            "requirements": [
                "Experience with AWS services (EC2, S3, Lambda, RDS)",
                "Knowledge of containerization (Docker, Kubernetes)", 
                "Infrastructure as Code (Terraform, CloudFormation)",
                "CI/CD pipeline experience",
                "Linux system administration",
                "Python or Go programming skills",
                "Strong problem-solving abilities"
            ],
            "salary_range": "$80,000 - $120,000",
            "location": "Seattle, WA",
            "job_type": "full-time",
            "posted_by": 1
        },
        {
            "id": 2,
            "title": "Full Stack Developer",
            "company": "TechStartup Inc.",
            "description": "Join our dynamic startup as a Full Stack Developer! You'll work on cutting-edge web applications using modern technologies. We need someone proficient in React, Node.js, and database technologies. Experience with microservices architecture and RESTful APIs is essential. You'll collaborate with cross-functional teams to deliver high-quality software solutions.",
            "requirements": [
                "Proficiency in JavaScript, React, Node.js",
                "Experience with REST APIs and microservices",
                "Database knowledge (PostgreSQL, MongoDB)",
                "Version control with Git",
                "Agile development experience",
                "Strong communication skills"
            ],
            "salary_range": "$70,000 - $100,000",
            "location": "Austin, TX",
            "job_type": "full-time",
            "posted_by": 2
        },
        {
            "id": 3,
            "title": "Machine Learning Engineer Intern",
            "company": "AI Research Labs",
            "description": "Exciting internship opportunity for ML enthusiasts! You'll work on real-world machine learning projects using Python, TensorFlow, and PyTorch. Experience with data preprocessing, model training, and deployment is preferred. You'll contribute to research projects and gain hands-on experience with MLOps practices.",
            "requirements": [
                "Strong Python programming skills",
                "Experience with TensorFlow or PyTorch",
                "Knowledge of machine learning algorithms",
                "Data preprocessing and analysis skills",
                "Statistics and mathematics background",
                "Research mindset and curiosity"
            ],
            "salary_range": "$25/hour",
            "location": "San Francisco, CA",
            "job_type": "internship",
            "posted_by": 3
        }
    ]


def main():
    """Main function to test the AI Resume Maker"""
    print("🚀 AI Resume Maker - Test Script")
    print("=" * 50)
    
    # Initialize the AI Resume Maker
    resume_maker = AIResumeMaker()
    
    # Create mock data
    student_profile = create_mock_student_profile()
    job_postings = create_mock_job_postings()
    
    print(f"👨‍🎓 Student: {student_profile['name']}")
    print(f"📧 Email: {student_profile['email']}")
    print(f"🎓 Education: {student_profile['education']['current_degree']}")
    print(f"💼 Total Projects: {len(student_profile['projects'])}")
    print(f"🏢 Total Internships: {len(student_profile['internships'])}")
    print(f"🏆 Total Certifications: {len(student_profile['certifications'])}")
    print()
    
    # Test resume generation for each job posting
    for i, job in enumerate(job_postings, 1):
        print(f"📋 Test {i}: Generating resume for '{job['title']}' at {job['company']}")
        print("-" * 50)
        
        try:
            # Generate tailored resume
            resume = resume_maker.generate_resume(student_profile, job)
            
            print("✅ Resume generated successfully!")
            print(f"📄 Resume length: {len(resume)} characters")
            print()
            
            # Save resume to file for manual review
            filename = f"resume_{job['title'].lower().replace(' ', '_')}_{job['company'].lower().replace(' ', '_')}.txt"
            with open(filename, 'w', encoding='utf-8') as f:
                f.write(resume)
            print(f"💾 Resume saved to: {filename}")
            
            # Display resume preview
            print("\n📋 RESUME PREVIEW:")
            print("=" * 80)
            print(resume)
            print("=" * 80)
            print()
            
        except Exception as e:
            print(f"❌ Error generating resume: {str(e)}")
            print()
    
    print("🎉 Testing completed!")
    print("\n📝 Next Steps:")
    print("1. Review generated resumes for quality and formatting")
    print("2. Test with different student profiles")
    print("3. Integrate OpenAI API for production use")
    print("4. Add the tested logic to FastAPI /jobs/{job_id}/apply endpoint")


if __name__ == "__main__":
    main()