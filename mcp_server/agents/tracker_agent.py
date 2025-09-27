#!/usr/bin/env python3
"""
Student Progress Tracking Agent

This agent provides comprehensive analytics for student placement activities,
including application tracking, job recommendations, and skill gap analysis.
"""

import logging
import json
from typing import Dict, List, Optional, Any, Tuple
from dataclasses import dataclass
from datetime import datetime, timedelta
from collections import Counter, defaultdict
import asyncio

from sqlalchemy.orm import Session
from sqlalchemy import text, func, desc, and_, or_

logger = logging.getLogger(__name__)

@dataclass
class ApplicationStats:
    """Statistics for student applications"""
    total_applications: int
    pending_applications: int
    accepted_applications: int
    rejected_applications: int
    interview_applications: int
    success_rate: float
    average_match_score: float
    recent_activity_count: int
    last_application_date: Optional[str]

@dataclass
class SkillGapAnalysis:
    """Analysis of student skill gaps"""
    student_skills: List[str]
    market_demand_skills: List[Dict[str, Any]]
    missing_high_demand_skills: List[Dict[str, Any]]
    skill_match_percentage: float
    recommendations: List[str]

@dataclass
class JobRecommendation:
    """Job recommendation with reasoning"""
    job_id: str
    job_title: str
    company: str
    match_score: float
    matching_skills: List[str]
    missing_skills: List[str]
    recommendation_reason: str
    priority: str  # high, medium, low

@dataclass
class ProgressReport:
    """Comprehensive progress report"""
    student_id: str
    analysis_type: str
    generated_at: str
    application_stats: Optional[ApplicationStats]
    skill_gaps: Optional[SkillGapAnalysis]
    job_recommendations: Optional[List[JobRecommendation]]
    insights: List[str]
    next_steps: List[str]

class TrackerAgent:
    """AI-powered student progress tracking and analytics agent"""
    
    def __init__(self):
        """Initialize the tracker agent"""
        self.logger = logging.getLogger(__name__)
        
    async def analyze_student_progress(self, student_id: str, analysis_type: str, 
                                     db_session: Session) -> Dict[str, Any]:
        """
        Main entry point for student progress analysis
        
        Args:
            student_id: ID of the student to analyze
            analysis_type: Type of analysis ('full', 'applications', 'recommendations', 'skills')
            db_session: SQLAlchemy database session
            
        Returns:
            Comprehensive progress report as dictionary
        """
        try:
            self.logger.info(f"Starting progress analysis for student {student_id}, type: {analysis_type}")
            
            # Validate student exists
            student = await self._fetch_student_data(student_id, db_session)
            if not student:
                return {
                    'error': 'Student not found',
                    'student_id': student_id,
                    'generated_at': datetime.utcnow().isoformat()
                }
            
            # Initialize report components
            application_stats = None
            skill_gaps = None
            job_recommendations = None
            insights = []
            next_steps = []
            
            # Perform analysis based on type
            if analysis_type in ['full', 'applications']:
                application_stats = await self._analyze_application_progress(student_id, db_session)
                insights.extend(self._generate_application_insights(application_stats))
                next_steps.extend(self._generate_application_next_steps(application_stats))
            
            if analysis_type in ['full', 'recommendations']:
                job_recommendations = await self._generate_job_recommendations(student_id, db_session)
                insights.extend(self._generate_recommendation_insights(job_recommendations))
                next_steps.extend(self._generate_recommendation_next_steps(job_recommendations))
            
            if analysis_type in ['full', 'skills']:
                skill_gaps = await self._analyze_skill_gaps(student_id, db_session)
                insights.extend(self._generate_skill_insights(skill_gaps))
                next_steps.extend(self._generate_skill_next_steps(skill_gaps))
            
            # Create comprehensive report
            report = ProgressReport(
                student_id=student_id,
                analysis_type=analysis_type,
                generated_at=datetime.utcnow().isoformat(),
                application_stats=application_stats,
                skill_gaps=skill_gaps,
                job_recommendations=job_recommendations,
                insights=insights,
                next_steps=next_steps
            )
            
            return self._serialize_report(report)
            
        except Exception as e:
            self.logger.error(f"Error analyzing student progress: {e}")
            return {
                'error': f'Analysis failed: {str(e)}',
                'student_id': student_id,
                'analysis_type': analysis_type,
                'generated_at': datetime.utcnow().isoformat()
            }
    
    async def _fetch_student_data(self, student_id: str, db_session: Session) -> Optional[Dict[str, Any]]:
        """Fetch student data from database"""
        try:
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
            self.logger.error(f"Error fetching student data: {e}")
            return None
    
    async def _analyze_application_progress(self, student_id: str, db_session: Session) -> ApplicationStats:
        """
        Analyze student's application history and progress
        
        Returns comprehensive application statistics and trends
        """
        try:
            # Fetch application data with AI matches
            applications_query = text("""
                SELECT a.id, a.status, a.applied_at, a.job_id,
                       j.title as job_title, j.company,
                       am.match_score, am.confidence_score
                FROM applications a
                JOIN jobs j ON a.job_id = j.id
                LEFT JOIN ai_matches am ON am.student_id = a.student_id AND am.job_id = a.job_id
                WHERE a.student_id = :student_id
                ORDER BY a.applied_at DESC
            """)
            
            applications = db_session.execute(applications_query, {"student_id": student_id}).fetchall()
            
            if not applications:
                return ApplicationStats(
                    total_applications=0,
                    pending_applications=0,
                    accepted_applications=0,
                    rejected_applications=0,
                    interview_applications=0,
                    success_rate=0.0,
                    average_match_score=0.0,
                    recent_activity_count=0,
                    last_application_date=None
                )
            
            # Calculate statistics
            total_applications = len(applications)
            status_counts = Counter([app.status for app in applications])
            
            pending_applications = status_counts.get('pending', 0)
            accepted_applications = status_counts.get('accepted', 0)
            rejected_applications = status_counts.get('rejected', 0)
            interview_applications = status_counts.get('interview', 0)
            
            # Calculate success rate (accepted + interview / total)
            successful_applications = accepted_applications + interview_applications
            success_rate = (successful_applications / total_applications) * 100 if total_applications > 0 else 0
            
            # Calculate average match score
            match_scores = [app.match_score for app in applications if app.match_score is not None]
            average_match_score = sum(match_scores) / len(match_scores) if match_scores else 0.0
            
            # Count recent activity (last 30 days)
            thirty_days_ago = datetime.utcnow() - timedelta(days=30)
            recent_activity_count = sum(1 for app in applications 
                                      if app.applied_at and app.applied_at >= thirty_days_ago)
            
            # Get last application date
            last_application_date = applications[0].applied_at.isoformat() if applications else None
            
            return ApplicationStats(
                total_applications=total_applications,
                pending_applications=pending_applications,
                accepted_applications=accepted_applications,
                rejected_applications=rejected_applications,
                interview_applications=interview_applications,
                success_rate=success_rate,
                average_match_score=average_match_score,
                recent_activity_count=recent_activity_count,
                last_application_date=last_application_date
            )
            
        except Exception as e:
            self.logger.error(f"Error analyzing application progress: {e}")
            return ApplicationStats(0, 0, 0, 0, 0, 0.0, 0.0, 0, None)
    
    async def _generate_job_recommendations(self, student_id: str, db_session: Session) -> List[JobRecommendation]:
        """
        Generate job recommendations based on AI matches that student hasn't applied to
        
        Returns prioritized list of job recommendations
        """
        try:
            # Fetch AI matches for jobs the student hasn't applied to
            recommendations_query = text("""
                SELECT am.job_id, am.match_score, am.confidence_score, am.matching_skills, am.skill_gaps,
                       j.title, j.company, j.description, j.requirements, j.location, j.salary_range
                FROM ai_matches am
                JOIN jobs j ON am.job_id = j.id
                LEFT JOIN applications a ON a.student_id = am.student_id AND a.job_id = am.job_id
                WHERE am.student_id = :student_id 
                AND a.id IS NULL  -- Student hasn't applied to this job
                AND am.match_score >= 0.3  -- Minimum match threshold
                ORDER BY am.match_score DESC, am.confidence_score DESC
                LIMIT 20
            """)
            
            matches = db_session.execute(recommendations_query, {"student_id": student_id}).fetchall()
            
            recommendations = []
            
            for match in matches:
                # Parse skills data
                matching_skills = self._parse_skills_data(match.matching_skills)
                missing_skills = self._parse_skills_data(match.skill_gaps)
                
                # Determine priority based on match score
                if match.match_score >= 0.8:
                    priority = "high"
                elif match.match_score >= 0.6:
                    priority = "medium"
                else:
                    priority = "low"
                
                # Generate recommendation reason
                reason = self._generate_recommendation_reason(match, matching_skills, missing_skills)
                
                recommendation = JobRecommendation(
                    job_id=match.job_id,
                    job_title=match.title,
                    company=match.company,
                    match_score=match.match_score,
                    matching_skills=matching_skills,
                    missing_skills=missing_skills,
                    recommendation_reason=reason,
                    priority=priority
                )
                
                recommendations.append(recommendation)
            
            # Sort by priority and match score
            priority_order = {"high": 3, "medium": 2, "low": 1}
            recommendations.sort(key=lambda x: (priority_order[x.priority], x.match_score), reverse=True)
            
            return recommendations[:10]  # Return top 10 recommendations
            
        except Exception as e:
            self.logger.error(f"Error generating job recommendations: {e}")
            return []
    
    async def _analyze_skill_gaps(self, student_id: str, db_session: Session) -> SkillGapAnalysis:
        """
        Analyze student's skill gaps compared to market demand
        
        Returns comprehensive skill gap analysis with recommendations
        """
        try:
            # Fetch student skills
            student = await self._fetch_student_data(student_id, db_session)
            if not student:
                return SkillGapAnalysis([], [], [], 0.0, [])
            
            profile_data = student.get('profile_data', {})
            student_skills = profile_data.get('skills', [])
            if isinstance(student_skills, str):
                student_skills = [skill.strip() for skill in student_skills.split(',')]
            
            # Analyze market demand from job requirements
            market_demand_query = text("""
                SELECT j.requirements, j.title, j.company, COUNT(*) as job_count
                FROM jobs j
                WHERE j.created_at >= :recent_date
                GROUP BY j.requirements, j.title, j.company
                ORDER BY job_count DESC
                LIMIT 100
            """)
            
            recent_date = datetime.utcnow() - timedelta(days=90)  # Last 3 months
            jobs = db_session.execute(market_demand_query, {"recent_date": recent_date}).fetchall()
            
            # Extract and count skills from job requirements
            skill_demand = Counter()
            for job in jobs:
                if job.requirements:
                    if isinstance(job.requirements, list):
                        job_skills = job.requirements
                    else:
                        job_skills = [skill.strip() for skill in str(job.requirements).split(',')]
                    
                    for skill in job_skills:
                        if skill and len(skill.strip()) > 2:
                            skill_demand[skill.strip().lower()] += job.job_count
            
            # Get top market demand skills
            market_demand_skills = [
                {"skill": skill, "demand_count": count, "demand_percentage": (count / len(jobs)) * 100}
                for skill, count in skill_demand.most_common(20)
            ]
            
            # Find missing high-demand skills
            student_skills_lower = [skill.lower() for skill in student_skills]
            missing_high_demand_skills = [
                skill_data for skill_data in market_demand_skills[:10]
                if skill_data["skill"] not in student_skills_lower
            ]
            
            # Calculate skill match percentage
            matching_skills_count = sum(1 for skill_data in market_demand_skills[:10]
                                      if skill_data["skill"] in student_skills_lower)
            skill_match_percentage = (matching_skills_count / min(10, len(market_demand_skills))) * 100
            
            # Generate recommendations
            recommendations = self._generate_skill_recommendations(
                student_skills, missing_high_demand_skills, skill_match_percentage
            )
            
            return SkillGapAnalysis(
                student_skills=student_skills,
                market_demand_skills=market_demand_skills,
                missing_high_demand_skills=missing_high_demand_skills,
                skill_match_percentage=skill_match_percentage,
                recommendations=recommendations
            )
            
        except Exception as e:
            self.logger.error(f"Error analyzing skill gaps: {e}")
            return SkillGapAnalysis([], [], [], 0.0, [])
    
    def _parse_skills_data(self, skills_data: Any) -> List[str]:
        """Parse skills data from various formats"""
        if not skills_data:
            return []
        
        if isinstance(skills_data, list):
            return skills_data
        elif isinstance(skills_data, str):
            try:
                # Try to parse as JSON
                parsed = json.loads(skills_data)
                if isinstance(parsed, list):
                    return parsed
            except json.JSONDecodeError:
                # Parse as comma-separated string
                return [skill.strip() for skill in skills_data.split(',') if skill.strip()]
        
        return []
    
    def _generate_recommendation_reason(self, match: Any, matching_skills: List[str], 
                                      missing_skills: List[str]) -> str:
        """Generate human-readable recommendation reason"""
        reasons = []
        
        if match.match_score >= 0.8:
            reasons.append("Excellent skill match")
        elif match.match_score >= 0.6:
            reasons.append("Good skill alignment")
        else:
            reasons.append("Potential growth opportunity")
        
        if matching_skills:
            top_skills = matching_skills[:3]
            reasons.append(f"Strong in: {', '.join(top_skills)}")
        
        if missing_skills and len(missing_skills) <= 2:
            reasons.append(f"Minor skill gaps: {', '.join(missing_skills)}")
        elif missing_skills:
            reasons.append("Some skill development needed")
        
        return ". ".join(reasons)
    
    def _generate_skill_recommendations(self, student_skills: List[str], 
                                     missing_skills: List[Dict[str, Any]], 
                                     match_percentage: float) -> List[str]:
        """Generate skill development recommendations"""
        recommendations = []
        
        if match_percentage < 30:
            recommendations.append("Focus on developing core technical skills to improve job market competitiveness")
        elif match_percentage < 60:
            recommendations.append("Good foundation - consider adding specialized skills to stand out")
        else:
            recommendations.append("Strong skill set - focus on advanced or emerging technologies")
        
        if missing_skills:
            top_missing = missing_skills[:3]
            skill_names = [skill["skill"] for skill in top_missing]
            recommendations.append(f"High-priority skills to learn: {', '.join(skill_names)}")
        
        if len(student_skills) < 5:
            recommendations.append("Expand your skill portfolio to increase job opportunities")
        
        recommendations.append("Consider obtaining relevant certifications to validate your skills")
        recommendations.append("Build projects that demonstrate your skills in real-world scenarios")
        
        return recommendations
    
    def _generate_application_insights(self, stats: ApplicationStats) -> List[str]:
        """Generate insights from application statistics"""
        insights = []
        
        if stats.total_applications == 0:
            insights.append("No applications submitted yet - start applying to build your track record")
            return insights
        
        if stats.success_rate >= 20:
            insights.append(f"Strong success rate of {stats.success_rate:.1f}% - your applications are well-targeted")
        elif stats.success_rate >= 10:
            insights.append(f"Moderate success rate of {stats.success_rate:.1f}% - consider refining your approach")
        else:
            insights.append(f"Low success rate of {stats.success_rate:.1f}% - review and improve application strategy")
        
        if stats.average_match_score >= 0.7:
            insights.append("Applying to well-matched positions - good job targeting")
        elif stats.average_match_score >= 0.5:
            insights.append("Decent job matching - consider focusing on higher-match opportunities")
        else:
            insights.append("Low average match scores - focus on jobs that better align with your skills")
        
        if stats.recent_activity_count == 0:
            insights.append("No recent applications - maintain consistent application activity")
        elif stats.recent_activity_count >= 5:
            insights.append("High application activity - good momentum")
        
        return insights
    
    def _generate_application_next_steps(self, stats: ApplicationStats) -> List[str]:
        """Generate next steps from application analysis"""
        next_steps = []
        
        if stats.total_applications == 0:
            next_steps.append("Start by applying to 3-5 jobs that match your skills")
            next_steps.append("Use the job recommendation system to find suitable positions")
        
        if stats.success_rate < 10:
            next_steps.append("Review and improve your resume and cover letters")
            next_steps.append("Focus on jobs with higher AI match scores")
        
        if stats.recent_activity_count == 0:
            next_steps.append("Set a goal to apply to 2-3 jobs per week")
        
        if stats.pending_applications > 0:
            next_steps.append(f"Follow up on {stats.pending_applications} pending applications")
        
        return next_steps
    
    def _generate_recommendation_insights(self, recommendations: List[JobRecommendation]) -> List[str]:
        """Generate insights from job recommendations"""
        insights = []
        
        if not recommendations:
            insights.append("No new job recommendations available - check back later for new opportunities")
            return insights
        
        high_priority = sum(1 for rec in recommendations if rec.priority == "high")
        if high_priority > 0:
            insights.append(f"{high_priority} high-priority job matches found - these are excellent opportunities")
        
        avg_match_score = sum(rec.match_score for rec in recommendations) / len(recommendations)
        if avg_match_score >= 0.7:
            insights.append("Strong overall job matches available - good alignment with your profile")
        
        return insights
    
    def _generate_recommendation_next_steps(self, recommendations: List[JobRecommendation]) -> List[str]:
        """Generate next steps from job recommendations"""
        next_steps = []
        
        if not recommendations:
            next_steps.append("Update your profile to get better job recommendations")
            return next_steps
        
        high_priority = [rec for rec in recommendations if rec.priority == "high"]
        if high_priority:
            next_steps.append(f"Apply to {min(3, len(high_priority))} high-priority job matches immediately")
        
        next_steps.append("Review job requirements and tailor your applications accordingly")
        next_steps.append("Research companies before applying to personalize your approach")
        
        return next_steps
    
    def _generate_skill_insights(self, skill_gaps: SkillGapAnalysis) -> List[str]:
        """Generate insights from skill gap analysis"""
        insights = []
        
        if skill_gaps.skill_match_percentage >= 70:
            insights.append("Strong skill alignment with market demand")
        elif skill_gaps.skill_match_percentage >= 40:
            insights.append("Moderate skill alignment - room for strategic improvement")
        else:
            insights.append("Significant skill gaps identified - focus on skill development")
        
        if skill_gaps.missing_high_demand_skills:
            top_missing = skill_gaps.missing_high_demand_skills[:2]
            skills = [skill["skill"] for skill in top_missing]
            insights.append(f"High-demand skills you're missing: {', '.join(skills)}")
        
        return insights
    
    def _generate_skill_next_steps(self, skill_gaps: SkillGapAnalysis) -> List[str]:
        """Generate next steps from skill gap analysis"""
        next_steps = []
        
        if skill_gaps.missing_high_demand_skills:
            next_steps.append("Prioritize learning the top 2-3 missing high-demand skills")
            next_steps.append("Look for online courses or certifications in these areas")
        
        next_steps.append("Build projects that demonstrate your existing skills")
        next_steps.append("Update your profile with any new skills you acquire")
        
        return next_steps
    
    def _serialize_report(self, report: ProgressReport) -> Dict[str, Any]:
        """Convert report to JSON-serializable dictionary"""
        result = {
            'student_id': report.student_id,
            'analysis_type': report.analysis_type,
            'generated_at': report.generated_at,
            'insights': report.insights,
            'next_steps': report.next_steps
        }
        
        if report.application_stats:
            result['application_stats'] = {
                'total_applications': report.application_stats.total_applications,
                'pending_applications': report.application_stats.pending_applications,
                'accepted_applications': report.application_stats.accepted_applications,
                'rejected_applications': report.application_stats.rejected_applications,
                'interview_applications': report.application_stats.interview_applications,
                'success_rate': report.application_stats.success_rate,
                'average_match_score': report.application_stats.average_match_score,
                'recent_activity_count': report.application_stats.recent_activity_count,
                'last_application_date': report.application_stats.last_application_date
            }
        
        if report.skill_gaps:
            result['skill_gaps'] = {
                'student_skills': report.skill_gaps.student_skills,
                'market_demand_skills': report.skill_gaps.market_demand_skills,
                'missing_high_demand_skills': report.skill_gaps.missing_high_demand_skills,
                'skill_match_percentage': report.skill_gaps.skill_match_percentage,
                'recommendations': report.skill_gaps.recommendations
            }
        
        if report.job_recommendations:
            result['job_recommendations'] = [
                {
                    'job_id': rec.job_id,
                    'job_title': rec.job_title,
                    'company': rec.company,
                    'match_score': rec.match_score,
                    'matching_skills': rec.matching_skills,
                    'missing_skills': rec.missing_skills,
                    'recommendation_reason': rec.recommendation_reason,
                    'priority': rec.priority
                }
                for rec in report.job_recommendations
            ]
        
        return result

# Example usage
async def main():
    """Example usage of the tracker agent"""
    agent = TrackerAgent()
    
    # This would typically be called with actual database session and student ID
    print("Tracker Agent initialized successfully")
    print("Use analyze_student_progress() method with actual student_id and db_session")

if __name__ == "__main__":
    asyncio.run(main())