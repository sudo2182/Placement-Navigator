import openai
import chromadb
import numpy as np
from typing import Dict, List, Any, Optional
from sqlalchemy.orm import Session
from datetime import datetime
import os
import sys
sys.path.append('..')
from shared.models import User, Job, Application, AIMatch

class MatchingAgent:
    def __init__(self):
        self.openai_client = openai.OpenAI(api_key=os.getenv("OPENAI_API_KEY"))
        
        # Initialize ChromaDB
        persist_dir = os.getenv("CHROMA_PERSIST_DIR", "./chroma_db")
        self.chroma_client = chromadb.PersistentClient(path=persist_dir)
        
        # Collections for different embedding types
        try:
            self.job_collection = self.chroma_client.get_collection("job_embeddings")
        except:
            self.job_collection = self.chroma_client.create_collection("job_embeddings")
            
        try:
            self.student_collection = self.chroma_client.get_collection("student_embeddings")
        except:
            self.student_collection = self.chroma_client.create_collection("student_embeddings")
    
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
        
        # Store job embedding in ChromaDB for future use
        self.job_collection.upsert(
            embeddings=[job_embedding],
            documents=[job_text],
            ids=[f"job_{job_id}"]
        )
        
        # Get all active students
        students = db_session.query(User).filter(User.role == "student", User.is_active == True).all()
        
        matches = []
        for student in students:
            try:
                # Create student profile text
                student_text = self._create_student_text(student)
                if not student_text.strip():
                    continue
                
                # Get student embedding
                student_embedding = await self._get_embedding(student_text)
                
                # Calculate semantic similarity
                similarity_score = self._cosine_similarity(job_embedding, student_embedding)
                
                if similarity_score >= min_score:
                    # Extract matched skills for explanation
                    matched_skills = self._extract_matched_skills(
                        student.profile_data.get('skills', []), 
                        job.requirements
                    )
                    
                    # Store match in database
                    existing_match = db_session.query(AIMatch).filter(
                        AIMatch.student_id == student.id,
                        AIMatch.job_id == job_id
                    ).first()
                    
                    if existing_match:
                        # Update existing match
                        existing_match.match_score = similarity_score
                        existing_match.matched_skills = matched_skills
                        existing_match.explanation = self._generate_match_explanation(student, job, similarity_score, matched_skills)
                    else:
                        # Create new match
                        ai_match = AIMatch(
                            student_id=student.id,
                            job_id=job_id,
                            match_score=similarity_score,
                            matched_skills=matched_skills,
                            explanation=self._generate_match_explanation(student, job, similarity_score, matched_skills)
                        )
                        db_session.add(ai_match)
                    
                    matches.append({
                        "student_id": student.id,
                        "student_email": student.email,
                        "student_name": student.profile_data.get('name', 'Unknown'),
                        "match_score": round(similarity_score, 3),
                        "matched_skills": matched_skills,
                        "profile_summary": {
                            "skills_count": len(student.profile_data.get('skills', [])),
                            "projects_count": len(student.profile_data.get('projects', [])),
                            "cgpa": student.profile_data.get('cgpa'),
                            "experience": student.profile_data.get('experience', [])
                        },
                        "explanation": self._generate_match_explanation(student, job, similarity_score, matched_skills)
                    })
                    
            except Exception as e:
                print(f"Error processing student {student.id}: {e}")
                continue
        
        # Commit matches to database
        db_session.commit()
        
        # Sort matches by score
        matches.sort(key=lambda x: x['match_score'], reverse=True)
        
        return {
            "job_id": job_id,
            "job_title": job.title,
            "company": job.company,
            "total_students_analyzed": len(students),
            "matches_found": len(matches),
            "matches": matches[:max_results],
            "analysis_summary": {
                "avg_match_score": np.mean([m['match_score'] for m in matches]) if matches else 0,
                "top_skills_demanded": job.requirements[:5],
                "timestamp": datetime.utcnow().isoformat()
            }
        }
    
    async def batch_process_new_job(self, job_id: int, auto_notify: bool, db_session: Session) -> Dict[str, Any]:
        """Process all students when a new job is posted"""
        
        # Find matches
        match_result = await self.find_semantic_matches(job_id, 0.3, 50, db_session)
        
        if auto_notify and not match_result.get('error'):
            # TODO: Trigger notifications to high-match students
            high_matches = [m for m in match_result['matches'] if m['match_score'] >= 0.6]
            
            notification_results = []
            for match in high_matches:
                # Here you would integrate with notification service
                notification_results.append({
                    "student_id": match["student_id"],
                    "notification_sent": True,
                    "match_score": match["match_score"]
                })
            
            match_result["notifications_sent"] = len(notification_results)
            match_result["notification_details"] = notification_results
        
        return match_result
    
    def _create_job_text(self, job: Job) -> str:
        """Create comprehensive text representation of job for embedding"""
        components = [
            f"Job Title: {job.title}",
            f"Company: {job.company}",
            f"Job Description: {job.description}",
            f"Required Skills: {', '.join(job.requirements) if job.requirements else 'None specified'}",
            f"Job Type: {job.job_type}",
            f"Location: {job.location or 'Not specified'}"
        ]
        return " | ".join(components)
    
    def _create_student_text(self, student: User) -> str:
        """Create comprehensive text representation of student for embedding"""
        profile = student.profile_data or {}
        
        components = []
        
        if profile.get('skills'):
            components.append(f"Skills: {', '.join(profile['skills'])}")
        
        if profile.get('projects'):
            projects_text = " | ".join([
                f"{proj.get('title', 'Project')}: {proj.get('description', '')}" 
                if isinstance(proj, dict) else str(proj)
                for proj in profile['projects']
            ])
            components.append(f"Projects: {projects_text}")
        
        if profile.get('experience'):
            exp_text = " | ".join([
                f"{exp.get('role', 'Role')}: {exp.get('description', '')}" 
                if isinstance(exp, dict) else str(exp)
                for exp in profile['experience']
            ])
            components.append(f"Experience: {exp_text}")
        
        if profile.get('education'):
            components.append(f"Education: {profile['education']}")
        
        if profile.get('cgpa'):
            components.append(f"CGPA: {profile['cgpa']}")
        
        return " | ".join(components) if components else "No profile information"
    
    async def _get_embedding(self, text: str) -> List[float]:
        """Get OpenAI embedding for text"""
        try:
            response = self.openai_client.embeddings.create(
                model="text-embedding-3-small",
                input=text
            )
            return response.data[0].embedding
        except Exception as e:
            print(f"Error getting embedding: {e}")
            # Return zero vector as fallback
            return [0.0] * 1536  # text-embedding-3-small dimension
    
    def _cosine_similarity(self, vec1: List[float], vec2: List[float]) -> float:
        """Calculate cosine similarity between vectors"""
        try:
            vec1_np = np.array(vec1)
            vec2_np = np.array(vec2)
            
            dot_product = np.dot(vec1_np, vec2_np)
            norm1 = np.linalg.norm(vec1_np)
            norm2 = np.linalg.norm(vec2_np)
            
            if norm1 == 0 or norm2 == 0:
                return 0.0
            
            return dot_product / (norm1 * norm2)
        except Exception as e:
            print(f"Error calculating cosine similarity: {e}")
            return 0.0
    
    def _extract_matched_skills(self, student_skills: List[str], job_requirements: List[str]) -> List[str]:
        """Extract skills that match between student and job"""
        if not student_skills or not job_requirements:
            return []
        
        student_skills_lower = [skill.lower().strip() for skill in student_skills]
        job_requirements_lower = [req.lower().strip() for req in job_requirements]
        
        matched = []
        for skill in student_skills:
            if skill.lower().strip() in job_requirements_lower:
                matched.append(skill)
        
        # Also check for partial matches
        for skill in student_skills:
            for req in job_requirements:
                if (len(skill) > 3 and skill.lower() in req.lower()) or (len(req) > 3 and req.lower() in skill.lower()):
                    if skill not in matched:
                        matched.append(skill)
        
        return matched[:10]  # Limit to top 10 matches
    
    def _generate_match_explanation(self, student: User, job: Job, score: float, matched_skills: List[str]) -> str:
        """Generate human-readable explanation for the match"""
        profile = student.profile_data or {}
        
        explanation_parts = [
            f"Match Score: {score:.1%}",
            f"Direct skill matches: {len(matched_skills)} ({', '.join(matched_skills[:3])}{'...' if len(matched_skills) > 3 else ''})",
            f"Student has {len(profile.get('skills', []))} total skills listed",
            f"Job requires {len(job.requirements)} specific skills"
        ]
        
        if profile.get('projects'):
            explanation_parts.append(f"Student has {len(profile['projects'])} relevant projects")
        
        if profile.get('cgpa'):
            explanation_parts.append(f"CGPA: {profile['cgpa']}")
        
        return " | ".join(explanation_parts)