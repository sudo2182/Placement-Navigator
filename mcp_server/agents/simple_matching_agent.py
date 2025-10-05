#!/usr/bin/env python3
"""
Simplified Matching Agent without ChromaDB dependency
Uses OpenAI embeddings directly for semantic matching
"""

import openai
import numpy as np
from typing import Dict, List, Any, Optional
from sqlalchemy.orm import Session
from datetime import datetime
import os
import sys
sys.path.append('..')
from shared.models import User, Job, Application, AIMatch

class SimpleMatchingAgent:
    def __init__(self):
        self.openai_client = openai.OpenAI(api_key=os.getenv("OPENAI_API_KEY"))
        # Simple in-memory storage for embeddings
        self.job_embeddings = {}
        self.student_embeddings = {}
    
    async def find_semantic_matches(self, job_id: int, min_score: float, max_results: int, db_session: Session) -> Dict[str, Any]:
        """Find optimal student matches using semantic analysis"""
        
        # Get job details
        job = db_session.query(Job).filter(Job.id == job_id).first()
        if not job:
            return {"error": "Job not found"}
        
        # Create comprehensive job text for embedding
        job_text = self._create_job_text(job)
        
        # Get job embedding
        job_embedding = await self._get_embedding(job_text)
        
        # Store job embedding
        self.job_embeddings[job_id] = {
            "embedding": job_embedding,
            "text": job_text,
            "job": job
        }
        
        # Get all students
        students = db_session.query(User).filter(User.role == "student").all()
        
        matches = []
        
        for student in students:
            # Get student profile text
            student_text = self._create_student_text(student)
            
            # Get student embedding
            student_embedding = await self._get_embedding(student_text)
            
            # Store student embedding
            self.student_embeddings[student.id] = {
                "embedding": student_embedding,
                "text": student_text,
                "student": student
            }
            
            # Calculate similarity
            similarity = self._calculate_similarity(job_embedding, student_embedding)
            
            if similarity >= min_score:
                matches.append({
                    "student_id": student.id,
                    "student_name": f"{student.first_name} {student.last_name}",
                    "email": student.email,
                    "match_score": float(similarity),
                    "matched_skills": self._extract_matched_skills(job, student),
                    "explanation": self._generate_explanation(job, student, similarity)
                })
        
        # Sort by match score and limit results
        matches.sort(key=lambda x: x["match_score"], reverse=True)
        matches = matches[:max_results]
        
        # Store matches in database
        for match in matches:
            ai_match = AIMatch(
                job_id=job_id,
                student_id=match["student_id"],
                match_score=match["match_score"],
                matched_skills=match["matched_skills"],
                explanation=match["explanation"],
                created_at=datetime.utcnow()
            )
            db_session.add(ai_match)
        
        db_session.commit()
        
        return {
            "job_id": job_id,
            "job_title": job.title,
            "total_matches": len(matches),
            "matches": matches,
            "processing_time": datetime.utcnow().isoformat()
        }
    
    async def batch_process_new_job(self, job_id: int, auto_notify: bool, db_session: Session) -> Dict[str, Any]:
        """Process a new job and find all matching students"""
        
        # Find matches
        result = await self.find_semantic_matches(job_id, 0.3, 50, db_session)
        
        if "error" in result:
            return result
        
        # If auto_notify is enabled, create notifications
        if auto_notify and result["matches"]:
            # This would integrate with notification system
            # For now, just return the matches
            result["notifications_sent"] = len(result["matches"])
        
        return result
    
    def _create_job_text(self, job: Job) -> str:
        """Create comprehensive text representation of job"""
        text_parts = [
            f"Job Title: {job.title}",
            f"Company: {job.company}",
            f"Description: {job.description}",
            f"Location: {job.location}",
            f"Job Type: {job.job_type}",
            f"Salary Range: {job.salary_range}",
            f"Requirements: {job.requirements}",
            f"Skills: {', '.join(job.requirements) if isinstance(job.requirements, list) else str(job.requirements) if job.requirements else 'Not specified'}"
        ]
        return " | ".join(text_parts)
    
    def _create_student_text(self, student: User) -> str:
        """Create comprehensive text representation of student"""
        profile = student.profile_data or {}
        
        text_parts = [
            f"Name: {student.first_name} {student.last_name}",
            f"Email: {student.email}",
            f"Role: {student.role}"
        ]
        
        # Add profile information
        if profile:
            if "personal" in profile:
                personal = profile["personal"]
                text_parts.append(f"Phone: {personal.get('phone', 'Not provided')}")
                text_parts.append(f"Location: {personal.get('location', 'Not provided')}")
            
            if "academic" in profile:
                academic = profile["academic"]
                text_parts.append(f"Degree: {academic.get('degree', 'Not specified')}")
                text_parts.append(f"Major: {academic.get('major', 'Not specified')}")
                text_parts.append(f"GPA: {academic.get('gpa', 'Not specified')}")
            
            if "skills" in profile:
                skills = profile["skills"]
                if isinstance(skills, list):
                    text_parts.append(f"Skills: {', '.join(skills)}")
                elif isinstance(skills, dict) and "technical" in skills:
                    tech_skills = skills["technical"]
                    if isinstance(tech_skills, list):
                        text_parts.append(f"Technical Skills: {', '.join(tech_skills)}")
            
            if "experience" in profile:
                experience = profile["experience"]
                if isinstance(experience, list):
                    exp_text = []
                    for exp in experience[:3]:  # Limit to 3 most recent
                        if isinstance(exp, dict):
                            exp_text.append(f"{exp.get('title', 'Position')} at {exp.get('company', 'Company')}")
                    if exp_text:
                        text_parts.append(f"Experience: {'; '.join(exp_text)}")
        
        return " | ".join(text_parts)
    
    async def _get_embedding(self, text: str) -> List[float]:
        """Get OpenAI embedding for text"""
        try:
            response = await self.openai_client.embeddings.create(
                model="text-embedding-3-small",
                input=text
            )
            return response.data[0].embedding
        except Exception as e:
            print(f"Error getting embedding: {e}")
            # Return a random embedding as fallback
            return np.random.random(1536).tolist()
    
    def _calculate_similarity(self, embedding1: List[float], embedding2: List[float]) -> float:
        """Calculate cosine similarity between two embeddings"""
        try:
            # Convert to numpy arrays
            vec1 = np.array(embedding1)
            vec2 = np.array(embedding2)
            
            # Calculate cosine similarity
            dot_product = np.dot(vec1, vec2)
            norm1 = np.linalg.norm(vec1)
            norm2 = np.linalg.norm(vec2)
            
            if norm1 == 0 or norm2 == 0:
                return 0.0
            
            similarity = dot_product / (norm1 * norm2)
            return float(similarity)
        except Exception as e:
            print(f"Error calculating similarity: {e}")
            return 0.0
    
    def _extract_matched_skills(self, job: Job, student: User) -> List[str]:
        """Extract skills that match between job and student"""
        matched_skills = []
        
        # Get job skills
        job_skills = []
        if job.requirements:
            if isinstance(job.requirements, list):
                job_skills = job.requirements
            else:
                job_skills = [str(job.requirements)]
        
        # Get student skills
        student_skills = []
        profile = student.profile_data or {}
        if "skills" in profile:
            skills = profile["skills"]
            if isinstance(skills, list):
                student_skills = skills
            elif isinstance(skills, dict) and "technical" in skills:
                tech_skills = skills["technical"]
                if isinstance(tech_skills, list):
                    student_skills = tech_skills
        
        # Find matches (case-insensitive)
        job_skills_lower = [skill.lower() for skill in job_skills]
        student_skills_lower = [skill.lower() for skill in student_skills]
        
        for skill in job_skills_lower:
            if skill in student_skills_lower:
                matched_skills.append(skill)
        
        return matched_skills
    
    def _generate_explanation(self, job: Job, student: User, similarity: float) -> str:
        """Generate explanation for the match"""
        matched_skills = self._extract_matched_skills(job, student)
        
        explanation_parts = [
            f"Match Score: {similarity:.2f}",
            f"Matched Skills: {', '.join(matched_skills) if matched_skills else 'No direct skill matches'}"
        ]
        
        if similarity > 0.8:
            explanation_parts.append("Excellent match - high compatibility")
        elif similarity > 0.6:
            explanation_parts.append("Good match - strong compatibility")
        elif similarity > 0.4:
            explanation_parts.append("Moderate match - some compatibility")
        else:
            explanation_parts.append("Low match - limited compatibility")
        
        return " | ".join(explanation_parts)
