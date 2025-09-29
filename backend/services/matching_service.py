"""
AI-Powered Job-Student Matching Service

This service provides intelligent job-student matching using OpenAI embeddings
for semantic similarity with rule-based fallback mechanisms.
"""

import logging
import os
import time
from datetime import datetime, timedelta
from typing import Dict, List, Optional, Tuple, Any
import asyncio
import json
import numpy as np
from dataclasses import dataclass

import openai
from sqlalchemy.orm import Session
from sqlalchemy import and_, or_

from shared.models import Job, User, AIMatch

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

@dataclass
class MatchResult:
    """Structured result for job-student matches"""
    student_id: int
    job_id: int
    score: float
    matched_skills: List[str]
    explanation: str
    method_used: str
    timestamp: datetime

class MatchingService:
    """
    AI-powered job-student matching service with semantic and rule-based matching
    """
    
    def __init__(self):
        """Initialize the matching service with OpenAI client and cache"""
        # Initialize OpenAI client with proper error handling
        try:
            self.openai_client = openai.OpenAI(api_key=os.getenv("OPENAI_API_KEY"))
        except TypeError:
            # Fallback for older versions of the OpenAI client
            openai.api_key = os.getenv("OPENAI_API_KEY")
            self.openai_client = openai
            
        self.embedding_cache = {}  # In-memory cache for embeddings
        self.cache_ttl = 3600  # 1 hour TTL
        logger.info("MatchingService initialized with OpenAI embeddings")
    
    async def find_matches(
        self, 
        job_id: int, 
        db: Session,
        min_score: float = 0.6, 
        limit: int = 50
    ) -> Dict[str, Any]:
        """
        Main entry point for finding job-student matches
        
        Args:
            job_id: ID of the job to match
            min_score: Minimum match score threshold
            db: Database session
            limit: Maximum number of matches to return
            
        Returns:
            Dictionary with matches, method used, and metadata
        """
        logger.info(f"Starting job matching for job_id={job_id}, min_score={min_score}")
        
        try:
            # Get job details
            job = db.query(Job).filter(Job.id == job_id).first()
            if not job:
                logger.error(f"Job {job_id} not found")
                return {
                    "matches": [],
                    "method_used": "none",
                    "error": "Job not found",
                    "timestamp": datetime.utcnow()
                }
            
            # Try semantic matching first
            try:
                logger.info("Attempting semantic matching with OpenAI embeddings")
                matches = await self._semantic_matching(job, min_score, db, limit)
                
                if matches:
                    logger.info(f"Semantic matching successful: {len(matches)} matches found")
                    return {
                        "matches": matches,
                        "method_used": "semantic",
                        "total_matches": len(matches),
                        "timestamp": datetime.utcnow()
                    }
                else:
                    logger.warning("Semantic matching returned no results, trying fallback")
                    
            except Exception as e:
                logger.error(f"Semantic matching failed: {str(e)}")
            
            # Fallback to rule-based matching
            logger.info("Using rule-based matching as fallback")
            matches = await self._simple_matching(job, min_score, db, limit)
            
            return {
                "matches": matches,
                "method_used": "rule_based",
                "total_matches": len(matches),
                "timestamp": datetime.utcnow()
            }
            
        except Exception as e:
            logger.error(f"Error in find_matches: {str(e)}")
            return {
                "matches": [],
                "method_used": "error",
                "error": str(e),
                "timestamp": datetime.utcnow()
            }
    
    async def _semantic_matching(
        self, 
        job: Job, 
        min_score: float, 
        db: Session,
        limit: int
    ) -> List[MatchResult]:
        """
        Perform embedding-based semantic matching
        
        Args:
            job: Job object to match against
            min_score: Minimum similarity score
            db: Database session
            limit: Maximum matches to return
            
        Returns:
            List of MatchResult objects
        """
        logger.info(f"Starting semantic matching for job: {job.title}")
        
        # Get job embedding
        job_text = self._create_job_text(job)
        job_embedding = await self._get_embedding(f"job_{job.id}", job_text)
        
        if job_embedding is None:
            logger.error("Failed to get job embedding")
            return []
        
        # Get all active students
        students = db.query(User).filter(
            and_(User.role == "student", User.is_active == True)
        ).all()
        
        matches = []
        logger.info(f"Evaluating {len(students)} students for semantic matching")
        
        for student in students:
            try:
                # Get student embedding
                student_text = self._create_student_text(student)
                student_embedding = await self._get_embedding(
                    f"student_{student.id}", 
                    student_text
                )
                
                if student_embedding is None:
                    continue
                
                # Calculate semantic similarity
                similarity = self._cosine_similarity(job_embedding, student_embedding)
                
                # Apply rule-based boost
                rule_boost = self._calculate_rule_score(student, job)
                final_score = min(1.0, similarity + (rule_boost * 0.2))  # 20% boost from rules
                
                if final_score >= min_score:
                    # Extract matched skills
                    matched_skills = self._extract_matched_skills(
                        student.profile_data.get('skills', []),
                        job.requirements
                    )
                    
                    explanation = (
                        f"Semantic similarity: {similarity:.3f}, "
                        f"Rule boost: {rule_boost:.3f}, "
                        f"Final score: {final_score:.3f}"
                    )
                    
                    match_result = MatchResult(
                        student_id=student.id,
                        job_id=job.id,
                        score=final_score,
                        matched_skills=matched_skills,
                        explanation=explanation,
                        method_used="semantic",
                        timestamp=datetime.utcnow()
                    )
                    
                    matches.append(match_result)
                    
                    # Store match in database
                    await self._store_match(
                        db, student.id, job.id, final_score, 
                        matched_skills, explanation
                    )
                    
            except Exception as e:
                logger.error(f"Error processing student {student.id}: {str(e)}")
                continue
        
        # Sort by score descending and limit results
        matches.sort(key=lambda x: x.score, reverse=True)
        matches = matches[:limit]
        
        logger.info(f"Semantic matching completed: {len(matches)} matches found")
        return matches
    
    async def _simple_matching(
        self, 
        job: Job, 
        min_score: float, 
        db: Session,
        limit: int
    ) -> List[MatchResult]:
        """
        Perform rule-based fallback matching
        
        Args:
            job: Job object to match against
            min_score: Minimum match score
            db: Database session
            limit: Maximum matches to return
            
        Returns:
            List of MatchResult objects
        """
        logger.info(f"Starting rule-based matching for job: {job.title}")
        
        # Get all active students
        students = db.query(User).filter(
            and_(User.role == "student", User.is_active == True)
        ).all()
        
        matches = []
        logger.info(f"Evaluating {len(students)} students for rule-based matching")
        
        for student in students:
            try:
                # Calculate detailed rule-based score
                score = self._calculate_detailed_rule_score(student, job)
                
                if score >= min_score:
                    # Extract matched skills
                    matched_skills = self._extract_matched_skills(
                        student.profile_data.get('skills', []),
                        job.requirements
                    )
                    
                    explanation = f"Rule-based matching score: {score:.3f}"
                    
                    match_result = MatchResult(
                        student_id=student.id,
                        job_id=job.id,
                        score=score,
                        matched_skills=matched_skills,
                        explanation=explanation,
                        method_used="rule_based",
                        timestamp=datetime.utcnow()
                    )
                    
                    matches.append(match_result)
                    
                    # Store match in database
                    await self._store_match(
                        db, student.id, job.id, score, 
                        matched_skills, explanation
                    )
                    
            except Exception as e:
                logger.error(f"Error processing student {student.id}: {str(e)}")
                continue
        
        # Sort by score descending and limit results
        matches.sort(key=lambda x: x.score, reverse=True)
        matches = matches[:limit]
        
        logger.info(f"Rule-based matching completed: {len(matches)} matches found")
        return matches
    
    async def _get_embedding(self, cache_key: str, text: str) -> Optional[List[float]]:
        """
        Get embedding for text with caching
        
        Args:
            cache_key: Unique key for caching
            text: Text to embed
            
        Returns:
            Embedding vector or None if failed
        """
        # Check cache first
        if cache_key in self.embedding_cache:
            cached_data = self.embedding_cache[cache_key]
            if time.time() - cached_data['timestamp'] < self.cache_ttl:
                logger.debug(f"Using cached embedding for {cache_key}")
                return cached_data['embedding']
            else:
                # Remove expired cache entry
                del self.embedding_cache[cache_key]
        
        try:
            logger.debug(f"Generating new embedding for {cache_key}")
            
            # Handle different versions of the OpenAI client
            try:
                # New OpenAI client version
                response = self.openai_client.embeddings.create(
                    model="text-embedding-3-small",
                    input=text
                )
                embedding = response.data[0].embedding
            except (AttributeError, TypeError):
                # Fallback for older versions
                response = self.openai_client.Embedding.create(
                    model="text-embedding-3-small",
                    input=text
                )
                embedding = response["data"][0]["embedding"]
            
            # Cache the embedding
            self.embedding_cache[cache_key] = {
                'embedding': embedding,
                'timestamp': time.time()
            }
            
            return embedding
            
        except Exception as e:
            logger.error(f"Failed to get embedding for {cache_key}: {str(e)}")
            return None
    
    def _cosine_similarity(self, vec1: List[float], vec2: List[float]) -> float:
        """
        Calculate cosine similarity between two vectors
        
        Args:
            vec1: First vector
            vec2: Second vector
            
        Returns:
            Cosine similarity score (0-1)
        """
        try:
            # Convert to numpy arrays
            v1 = np.array(vec1)
            v2 = np.array(vec2)
            
            # Calculate cosine similarity
            dot_product = np.dot(v1, v2)
            norm_v1 = np.linalg.norm(v1)
            norm_v2 = np.linalg.norm(v2)
            
            if norm_v1 == 0 or norm_v2 == 0:
                return 0.0
            
            similarity = dot_product / (norm_v1 * norm_v2)
            
            # Ensure result is between 0 and 1
            return max(0.0, min(1.0, similarity))
            
        except Exception as e:
            logger.error(f"Error calculating cosine similarity: {str(e)}")
            return 0.0
    
    def _create_job_text(self, job: Job) -> str:
        """
        Convert job data into text for embedding
        
        Args:
            job: Job object
            
        Returns:
            Formatted text representation
        """
        requirements_text = ""
        if job.requirements:
            if isinstance(job.requirements, list):
                requirements_text = " ".join(job.requirements)
            elif isinstance(job.requirements, str):
                requirements_text = job.requirements
        
        job_text = f"""
        Job Title: {job.title}
        Company: {job.company}
        Job Type: {job.job_type}
        Location: {job.location or 'Not specified'}
        Salary Range: {job.salary_range or 'Not specified'}
        Description: {job.description}
        Requirements: {requirements_text}
        """.strip()
        
        return job_text
    
    def _create_student_text(self, student: User) -> str:
        """
        Convert student profile into text for embedding
        
        Args:
            student: Student user object
            
        Returns:
            Formatted text representation
        """
        profile = student.profile_data or {}
        
        skills_text = ""
        if profile.get('skills'):
            skills_text = " ".join(profile['skills'])
        
        experience_text = ""
        if profile.get('experience'):
            experience_text = " ".join([exp.get('description', '') for exp in profile['experience']])
        
        education_text = ""
        if profile.get('education'):
            education_text = " ".join([
                f"{edu.get('degree', '')} {edu.get('field', '')} {edu.get('institution', '')}"
                for edu in profile['education']
            ])
        
        student_text = f"""
        Student Profile
        Skills: {skills_text}
        Education: {education_text}
        Experience: {experience_text}
        Bio: {profile.get('bio', '')}
        Interests: {' '.join(profile.get('interests', []))}
        """.strip()
        
        return student_text
    
    def _calculate_rule_score(self, student: User, job: Job) -> float:
        """
        Calculate rule-based boost score for semantic matching
        
        Args:
            student: Student user object
            job: Job object
            
        Returns:
            Rule-based score (0-1)
        """
        profile = student.profile_data or {}
        score = 0.0
        
        # Skill matching (40% weight)
        student_skills = [skill.lower() for skill in profile.get('skills', [])]
        job_requirements = []
        
        if job.requirements:
            if isinstance(job.requirements, list):
                job_requirements = [req.lower() for req in job.requirements]
            elif isinstance(job.requirements, str):
                job_requirements = [job.requirements.lower()]
        
        if student_skills and job_requirements:
            matched_skills = set(student_skills) & set(job_requirements)
            skill_score = len(matched_skills) / len(job_requirements)
            score += skill_score * 0.4
        
        # Education relevance (30% weight)
        education = profile.get('education', [])
        if education and job.requirements:
            for edu in education:
                field = edu.get('field', '').lower()
                degree = edu.get('degree', '').lower()
                
                for req in job_requirements:
                    if field in req or req in field or degree in req:
                        score += 0.3
                        break
        
        # Experience relevance (30% weight)
        experience = profile.get('experience', [])
        if experience:
            total_months = sum([exp.get('duration_months', 0) for exp in experience])
            if total_months > 0:
                # Scale experience score based on months (max 0.3 for 24+ months)
                exp_score = min(0.3, total_months / 24 * 0.3)
                score += exp_score
        
        return min(1.0, score)
    
    def _calculate_detailed_rule_score(self, student: User, job: Job) -> float:
        """
        Calculate detailed rule-based score for fallback matching
        
        Args:
            student: Student user object
            job: Job object
            
        Returns:
            Detailed rule-based score (0-1)
        """
        profile = student.profile_data or {}
        total_score = 0.0
        
        # Skills matching (50% weight)
        student_skills = [skill.lower().strip() for skill in profile.get('skills', [])]
        job_requirements = []
        
        if job.requirements:
            if isinstance(job.requirements, list):
                job_requirements = [req.lower().strip() for req in job.requirements]
            elif isinstance(job.requirements, str):
                job_requirements = [job.requirements.lower().strip()]
        
        if student_skills and job_requirements:
            matched_skills = set(student_skills) & set(job_requirements)
            partial_matches = 0
            
            # Check for partial skill matches
            for student_skill in student_skills:
                for job_req in job_requirements:
                    if student_skill in job_req or job_req in student_skill:
                        partial_matches += 1
                        break
            
            exact_match_score = len(matched_skills) / len(job_requirements) * 0.4
            partial_match_score = partial_matches / len(job_requirements) * 0.1
            total_score += exact_match_score + partial_match_score
        
        # Education matching (25% weight)
        education = profile.get('education', [])
        if education:
            education_score = 0.0
            for edu in education:
                field = edu.get('field', '').lower()
                degree = edu.get('degree', '').lower()
                gpa = edu.get('gpa', 0)
                
                # Field relevance
                for req in job_requirements:
                    if field and (field in req or req in field):
                        education_score += 0.15
                        break
                
                # GPA bonus
                if gpa >= 3.5:
                    education_score += 0.05
                elif gpa >= 3.0:
                    education_score += 0.03
                
                # Degree level bonus
                if 'master' in degree or 'phd' in degree:
                    education_score += 0.02
                
                break  # Consider only the highest education
            
            total_score += min(0.25, education_score)
        
        # Experience matching (20% weight)
        experience = profile.get('experience', [])
        if experience:
            exp_score = 0.0
            total_months = sum([exp.get('duration_months', 0) for exp in experience])
            
            # Duration score
            if total_months >= 24:
                exp_score += 0.15
            elif total_months >= 12:
                exp_score += 0.10
            elif total_months >= 6:
                exp_score += 0.05
            
            # Relevance score
            for exp in experience:
                description = exp.get('description', '').lower()
                for req in job_requirements:
                    if req in description:
                        exp_score += 0.05
                        break
            
            total_score += min(0.20, exp_score)
        
        # Profile completeness bonus (5% weight)
        completeness_score = 0.0
        if profile.get('bio'):
            completeness_score += 0.01
        if profile.get('skills'):
            completeness_score += 0.01
        if profile.get('education'):
            completeness_score += 0.01
        if profile.get('experience'):
            completeness_score += 0.01
        if profile.get('interests'):
            completeness_score += 0.01
        
        total_score += completeness_score
        
        return min(1.0, total_score)
    
    def _extract_matched_skills(
        self, 
        student_skills: List[str], 
        job_requirements: List[str]
    ) -> List[str]:
        """
        Find overlapping skills between student and job requirements
        
        Args:
            student_skills: List of student skills
            job_requirements: List of job requirements
            
        Returns:
            List of matched skills
        """
        if not student_skills or not job_requirements:
            return []
        
        # Normalize skills to lowercase
        student_skills_lower = [skill.lower().strip() for skill in student_skills]
        
        # Handle different requirement formats
        if isinstance(job_requirements, str):
            job_requirements = [job_requirements]
        
        job_requirements_lower = [req.lower().strip() for req in job_requirements]
        
        # Find exact matches
        exact_matches = list(set(student_skills_lower) & set(job_requirements_lower))
        
        # Find partial matches
        partial_matches = []
        for student_skill in student_skills_lower:
            for job_req in job_requirements_lower:
                if (student_skill in job_req or job_req in student_skill) and \
                   student_skill not in exact_matches and \
                   job_req not in partial_matches:
                    partial_matches.append(student_skill)
                    break
        
        # Return original case skills
        matched_skills = []
        all_matches = exact_matches + partial_matches
        
        for skill in student_skills:
            if skill.lower().strip() in all_matches:
                matched_skills.append(skill)
        
        return matched_skills
    
    async def _store_match(
        self, 
        db: Session, 
        student_id: int, 
        job_id: int, 
        score: float, 
        matched_skills: List[str],
        explanation: str = ""
    ) -> None:
        """
        Store match result in AIMatch table
        
        Args:
            db: Database session
            student_id: Student ID
            job_id: Job ID
            score: Match score
            matched_skills: List of matched skills
            explanation: Match explanation
        """
        try:
            # Check if match already exists
            existing_match = db.query(AIMatch).filter(
                and_(AIMatch.student_id == student_id, AIMatch.job_id == job_id)
            ).first()
            
            if existing_match:
                # Update existing match
                existing_match.match_score = score
                existing_match.matched_skills = matched_skills
                existing_match.explanation = explanation
                existing_match.created_at = datetime.utcnow()
                logger.debug(f"Updated existing match for student {student_id}, job {job_id}")
            else:
                # Create new match
                new_match = AIMatch(
                    student_id=student_id,
                    job_id=job_id,
                    match_score=score,
                    matched_skills=matched_skills,
                    explanation=explanation
                )
                db.add(new_match)
                logger.debug(f"Created new match for student {student_id}, job {job_id}")
            
            db.commit()
            
        except Exception as e:
            logger.error(f"Error storing match: {str(e)}")
            db.rollback()


# Global instance
matching_service = MatchingService()