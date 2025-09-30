"""
Simple Job-Student Matching Service (No AI Dependencies)

This service provides basic job-student matching using rule-based logic
without requiring ChromaDB or OpenAI dependencies.
"""

import logging
from datetime import datetime
from typing import Dict, List, Optional, Any
from sqlalchemy.orm import Session
from sqlalchemy import and_, or_

from shared.models import Job, User, AIMatch

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class SimpleMatchingService:
    """
    Simple job-student matching service using rule-based logic
    """
    
    def __init__(self):
        """Initialize the simple matching service"""
        logger.info("SimpleMatchingService initialized (no AI dependencies)")
    
    async def find_matches(
        self, 
        job_id: int, 
        db: Session,
        min_score: float = 0.6, 
        limit: int = 50
    ) -> Dict[str, Any]:
        """
        Find job-student matches using simple rule-based logic
        
        Args:
            job_id: ID of the job to match
            min_score: Minimum match score threshold
            db: Database session
            limit: Maximum number of matches to return
            
        Returns:
            Dictionary with matches, method used, and metadata
        """
        logger.info(f"Starting simple job matching for job_id={job_id}")
        
        try:
            # Get job details
            job = db.query(Job).filter(Job.id == job_id).first()
            if not job:
                return {"error": "Job not found", "matches": []}
            
            # Get all active students
            students = db.query(User).filter(
                User.role == "student", 
                User.is_active == True
            ).all()
            
            matches = []
            
            for student in students:
                try:
                    # Calculate match score using simple rules
                    match_score = self._calculate_simple_match_score(job, student)
                    
                    if match_score >= min_score:
                        # Extract matched skills
                        matched_skills = self._extract_matched_skills(
                            student.profile_data.get('skills', []), 
                            job.requirements
                        )
                        
                        # Generate explanation
                        explanation = self._generate_simple_explanation(
                            student, job, match_score, matched_skills
                        )
                        
                        # Store match in database
                        existing_match = db.query(AIMatch).filter(
                            AIMatch.student_id == student.id,
                            AIMatch.job_id == job_id
                        ).first()
                        
                        if existing_match:
                            # Update existing match
                            existing_match.match_score = match_score
                            existing_match.matched_skills = matched_skills
                            existing_match.explanation = explanation
                        else:
                            # Create new match
                            ai_match = AIMatch(
                                student_id=student.id,
                                job_id=job_id,
                                match_score=match_score,
                                matched_skills=matched_skills,
                                explanation=explanation
                            )
                            db.add(ai_match)
                        
                        matches.append({
                            "student_id": student.id,
                            "student_name": student.profile_data.get('name', 'Unknown'),
                            "student_email": student.email,
                            "match_score": match_score,
                            "matched_skills": matched_skills,
                            "explanation": explanation
                        })
                        
                except Exception as e:
                    logger.error(f"Error processing student {student.id}: {str(e)}")
                    continue
            
            # Sort matches by score (highest first)
            matches.sort(key=lambda x: x['match_score'], reverse=True)
            
            # Limit results
            matches = matches[:limit]
            
            # Commit database changes
            db.commit()
            
            result = {
                "job_id": job_id,
                "job_title": job.title,
                "matches_found": len(matches),
                "matches": matches,
                "method_used": "simple_rule_based",
                "timestamp": datetime.now().isoformat()
            }
            
            logger.info(f"Simple matching completed for job {job_id}: {len(matches)} matches found")
            return result
            
        except Exception as e:
            logger.error(f"Error in simple matching: {str(e)}")
            db.rollback()
            return {"error": str(e), "matches": []}
    
    def _calculate_simple_match_score(self, job: Job, student: User) -> float:
        """
        Calculate match score using simple rule-based logic
        
        Args:
            job: Job object
            student: User object (student)
            
        Returns:
            Match score between 0.0 and 1.0
        """
        score = 0.0
        max_score = 0.0
        
        # Get student skills and profile data
        student_skills = student.profile_data.get('skills', [])
        student_major = student.profile_data.get('major', '').lower()
        student_experience = student.profile_data.get('experience_level', 'entry')
        
        # Job requirements matching (40% weight)
        if job.requirements:
            job_requirements = job.requirements if isinstance(job.requirements, list) else []
            matched_skills = [skill for skill in student_skills if skill.lower() in [req.lower() for req in job_requirements]]
            if job_requirements:
                skill_match_ratio = len(matched_skills) / len(job_requirements)
                score += skill_match_ratio * 0.4
                max_score += 0.4
        
        # Job type matching (20% weight)
        if job.job_type:
            preferred_job_types = student.profile_data.get('preferred_job_types', [])
            if job.job_type in preferred_job_types:
                score += 0.2
            max_score += 0.2
        
        # Experience level matching (20% weight)
        if job.experience_level:
            if job.experience_level == student_experience:
                score += 0.2
            elif job.experience_level == 'entry' and student_experience in ['entry', 'mid']:
                score += 0.1  # Partial match
            max_score += 0.2
        
        # Location matching (10% weight)
        if job.location:
            preferred_locations = student.profile_data.get('preferred_locations', [])
            if any(loc.lower() in job.location.lower() for loc in preferred_locations):
                score += 0.1
            max_score += 0.1
        
        # Major/field matching (10% weight)
        if job.title and student_major:
            # Simple keyword matching for major relevance
            tech_keywords = ['computer', 'software', 'engineering', 'technology', 'data', 'ai', 'machine learning']
            if any(keyword in student_major for keyword in tech_keywords):
                if any(keyword in job.title.lower() for keyword in tech_keywords):
                    score += 0.1
            max_score += 0.1
        
        # Normalize score
        if max_score > 0:
            return min(score / max_score, 1.0)
        else:
            return 0.0
    
    def _extract_matched_skills(self, student_skills: List[str], job_requirements: List[str]) -> List[str]:
        """
        Extract skills that match between student and job requirements
        
        Args:
            student_skills: List of student skills
            job_requirements: List of job requirements
            
        Returns:
            List of matched skills
        """
        if not student_skills or not job_requirements:
            return []
        
        matched_skills = []
        for skill in student_skills:
            for requirement in job_requirements:
                if skill.lower() in requirement.lower() or requirement.lower() in skill.lower():
                    matched_skills.append(skill)
                    break
        
        return matched_skills
    
    def _generate_simple_explanation(
        self, 
        student: User, 
        job: Job, 
        match_score: float, 
        matched_skills: List[str]
    ) -> str:
        """
        Generate a simple explanation for the match
        
        Args:
            student: Student user object
            job: Job object
            match_score: Calculated match score
            matched_skills: List of matched skills
            
        Returns:
            Explanation string
        """
        student_name = student.profile_data.get('name', 'Student')
        
        if match_score >= 0.8:
            quality = "excellent"
        elif match_score >= 0.6:
            quality = "good"
        elif match_score >= 0.4:
            quality = "fair"
        else:
            quality = "basic"
        
        explanation = f"{student_name} has a {quality} match for {job.title} at {job.company}. "
        
        if matched_skills:
            explanation += f"Matched skills: {', '.join(matched_skills)}. "
        
        explanation += f"Overall match score: {match_score:.2f}."
        
        return explanation
