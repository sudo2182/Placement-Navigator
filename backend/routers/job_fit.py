"""
Job Fit Analyzer Router
Compares user profile with job description to calculate fit score
"""
from fastapi import APIRouter, Depends, HTTPException, Form
from typing import Dict, Any, Optional
from sqlalchemy.orm import Session
from datetime import datetime

from backend.auth import get_current_user
from shared.models import get_db, User, Job
from backend.services.matching_service import MatchingService
from backend.services.simple_matching_service import SimpleMatchingService
from backend.routers.github import fetch_github_data, analyze_github_profile

router = APIRouter(prefix="/api/v1/job-fit", tags=["job-fit"])

# Initialize matching service
matching_service = MatchingService()
simple_service = SimpleMatchingService()

@router.post("/analyze")
async def analyze_job_fit(
    job_description: str = Form(..., description="Job description text"),
    job_id: Optional[int] = Form(None, description="Optional: Job ID if analyzing existing job"),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
) -> Dict[str, Any]:
    """
    Analyze job fit by comparing user profile with job description.
    
    Returns:
    - Fit score (0-100)
    - Matched skills with evidence
    - Missing skills with recommendations
    - GitHub signals (if username available)
    - Suggestions for improvement
    """
    try:
        # Get or create job object
        job = None
        if job_id:
            job = db.query(Job).filter(Job.id == job_id).first()
            if not job:
                raise HTTPException(status_code=404, detail="Job not found")
        else:
            # Create temporary job object from description
            from shared.models import Job
            job = Job(
                title="Analyzed Job",
                description=job_description,
                requirements=[],
                company="Unknown",
                location="Unknown",
                job_type="full-time"
            )
        
        # Get user profile
        profile_data = current_user.profile_data or {}
        user_skills = profile_data.get('skills', [])
        
        # Extract skills from JD
        jd_skills = _extract_skills_from_jd(job_description)
        
        # Calculate match score using matching service
        if job_id and job:
            # Use existing matching service
            matches_result = await matching_service.find_matches(
                job_id=job.id if job.id else 1,
                db=db,
                min_score=0.0,
                limit=1
            )
            
            # Find current user in matches
            user_match = None
            for match in matches_result.get('matches', []):
                if hasattr(match, 'student_id') and match.student_id == current_user.id:
                    user_match = match
                    break
                elif isinstance(match, dict) and match.get('student_id') == current_user.id:
                    user_match = match
                    break
            
            if user_match:
                fit_score = int((user_match.score if hasattr(user_match, 'score') else user_match.get('score', 0)) * 100)
                matched_skills = user_match.matched_skills if hasattr(user_match, 'matched_skills') else user_match.get('matched_skills', [])
            else:
                # Calculate manually
                fit_score = _calculate_simple_fit_score(user_skills, jd_skills)
                matched_skills = list(set(user_skills) & set(jd_skills))
        else:
            # Calculate simple fit score
            fit_score = _calculate_simple_fit_score(user_skills, jd_skills)
            matched_skills = list(set(user_skills) & set(jd_skills))
        
        # Get missing skills
        missing_skills = [s for s in jd_skills if s not in user_skills]
        
        # Try to get GitHub data if username available
        github_data = None
        github_username = profile_data.get('github', '').replace('https://github.com/', '').replace('github.com/', '').strip()
        if github_username:
            try:
                from backend.routers.github import fetch_github_data, analyze_github_profile
                github_raw = await fetch_github_data(github_username)
                github_data = analyze_github_profile(
                    github_raw['user'],
                    github_raw['repos'],
                    github_raw['events']
                )
            except Exception:
                # GitHub analysis failed, continue without it
                github_data = None
        
        # Generate recommendations
        recommendations = _generate_recommendations(
            matched_skills,
            missing_skills,
            fit_score,
            github_data
        )
        
        # Build response
        result = {
            "fit_score": fit_score,
            "summary": {
                "role": _extract_role_from_jd(job_description),
                "company": job.company if job and hasattr(job, 'company') else "Unknown",
                "extracted_skills": jd_skills[:15],  # Top 15 skills
                "requirements": _extract_requirements_from_jd(job_description)
            },
            "user_profile": {
                "name": f"{current_user.first_name} {current_user.last_name}".strip() or current_user.email,
                "skills": user_skills,
                "resume_highlights": _get_resume_highlights(profile_data),
                "github_signals": github_data.get('metrics', {}) if github_data else None
            },
            "matched_skills": [
                {
                    "skill": skill,
                    "evidence": _find_skill_evidence(skill, profile_data, github_data),
                    "weight": 0.25  # Default weight
                }
                for skill in matched_skills[:10]
            ],
            "missing_skills": [
                {
                    "skill": skill,
                    "action": _generate_skill_action(skill),
                    "impact": f"+{min(15, len(missing_skills) * 2)}%"
                }
                for skill in missing_skills[:10]
            ],
            "recommendations": recommendations,
            "analyzed_at": datetime.utcnow().isoformat()
        }
        
        return result
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Job fit analysis failed: {str(e)}")

def _extract_skills_from_jd(jd_text: str) -> list:
    """Extract skills from job description text"""
    # Common tech skills
    skill_keywords = [
        "Python", "Java", "JavaScript", "TypeScript", "C++", "Go", "Rust",
        "React", "Vue", "Angular", "Node.js", "Express", "Django", "Flask", "FastAPI",
        "PostgreSQL", "MySQL", "MongoDB", "Redis", "SQL",
        "AWS", "Azure", "GCP", "Docker", "Kubernetes", "Terraform",
        "TensorFlow", "PyTorch", "scikit-learn", "Pandas", "NumPy",
        "Git", "GitHub", "CI/CD", "Jenkins", "Linux"
    ]
    
    jd_lower = jd_text.lower()
    found_skills = []
    
    for skill in skill_keywords:
        if skill.lower() in jd_lower:
            found_skills.append(skill)
    
    return list(set(found_skills))

def _extract_role_from_jd(jd_text: str) -> str:
    """Extract job role/title from JD"""
    # Look for common patterns
    lines = jd_text.split('\n')
    for line in lines[:5]:
        if any(keyword in line.lower() for keyword in ['engineer', 'developer', 'scientist', 'analyst', 'manager']):
            return line.strip()
    return "Software Engineer"  # Default

def _extract_requirements_from_jd(jd_text: str) -> list:
    """Extract requirements from JD"""
    requirements = []
    lines = jd_text.split('\n')
    
    for line in lines:
        line_lower = line.lower().strip()
        if any(keyword in line_lower for keyword in ['required', 'must have', 'should have', 'experience', 'knowledge']):
            if len(line.strip()) > 20:  # Filter out short lines
                requirements.append(line.strip())
    
    return requirements[:5]  # Return top 5

def _calculate_simple_fit_score(user_skills: list, jd_skills: list) -> int:
    """Calculate simple fit score (0-100)"""
    if not jd_skills:
        return 50  # Default if no skills extracted
    
    matched = set(user_skills) & set(jd_skills)
    match_ratio = len(matched) / len(jd_skills)
    
    # Score out of 100
    base_score = int(match_ratio * 100)
    
    # Boost if user has many skills
    if len(user_skills) > len(jd_skills):
        base_score = min(100, base_score + 10)
    
    return max(0, min(100, base_score))

def _get_resume_highlights(profile_data: dict) -> list:
    """Extract resume highlights from profile"""
    highlights = []
    
    # From experience
    for exp in profile_data.get('experience', [])[:3]:
        if isinstance(exp, dict):
            title = exp.get('title', '')
            company = exp.get('company', '')
            if title or company:
                highlights.append(f"{title} at {company}".strip())
    
    # From projects
    for proj in profile_data.get('projects', [])[:2]:
        if isinstance(proj, dict):
            title = proj.get('title', '')
            if title:
                highlights.append(f"Project: {title}")
    
    return highlights[:4]

def _find_skill_evidence(skill: str, profile_data: dict, github_data: dict = None) -> str:
    """Find evidence of skill in profile or GitHub"""
    evidence_parts = []
    
    # Check profile skills
    if skill in profile_data.get('skills', []):
        evidence_parts.append("Listed in skills")
    
    # Check experience
    for exp in profile_data.get('experience', []):
        if isinstance(exp, dict):
            desc = exp.get('description', '').lower()
            if skill.lower() in desc:
                evidence_parts.append(f"Used in {exp.get('title', 'role')}")
                break
    
    # Check GitHub
    if github_data:
        for repo in github_data.get('repos', [])[:5]:
            if skill.lower() in repo.get('name', '').lower() or skill.lower() in repo.get('description', '').lower():
                evidence_parts.append(f"GitHub repo: {repo.get('name', '')}")
                break
    
    return "; ".join(evidence_parts) if evidence_parts else "Found in profile"

def _generate_skill_action(skill: str) -> str:
    """Generate action item for missing skill"""
    actions = {
        "Python": "Complete a Python project or tutorial; add to GitHub",
        "React": "Build a React app; deploy to GitHub Pages",
        "AWS": "Complete AWS certification or deploy a project",
        "Docker": "Containerize an existing project",
        "TensorFlow": "Complete a TensorFlow tutorial or course"
    }
    
    return actions.get(skill, f"Learn {skill} through courses or projects; add to portfolio")

def _generate_recommendations(matched: list, missing: list, score: int, github_data: dict = None) -> list:
    """Generate improvement recommendations"""
    recommendations = []
    
    if score < 60:
        recommendations.append({
            "title": "Expand Core Skills",
            "detail": f"Focus on learning {len(missing)} missing skills to improve fit",
            "github_suggestion": "Complete projects using missing technologies"
        })
    
    if missing:
        top_missing = missing[0] if missing else None
        if top_missing:
            recommendations.append({
                "title": f"Learn {top_missing.get('skill', 'key skills')}",
                "detail": _generate_skill_action(top_missing.get('skill', '')),
                "github_suggestion": f"Create a project showcasing {top_missing.get('skill', '')}"
            })
    
    if not github_data or github_data.get('metrics', {}).get('recent_commits', 0) < 5:
        recommendations.append({
            "title": "Increase GitHub Activity",
            "detail": "Regular commits and quality repositories strengthen your profile",
            "github_suggestion": "Commit daily to existing projects or start new ones"
        })
    
    return recommendations[:3]

