#!/usr/bin/env python3
"""
Database Demo Script for Placement Navigator
Demonstrates database relationships and sample queries
"""

import sys
import os
from sqlalchemy import create_engine, text
from dotenv import load_dotenv

load_dotenv()

def demo_database():
    """Demonstrate database relationships and sample data"""
    
    DATABASE_URL = os.getenv("DATABASE_URL")
    engine = create_engine(DATABASE_URL)
    
    print("🎯 Placement Navigator Database Demo")
    print("=" * 50)
    
    with engine.connect() as conn:
        
        # 1. User Overview
        print("\n👥 USER OVERVIEW")
        print("-" * 30)
        result = conn.execute(text("""
            SELECT role, COUNT(*) as count, 
                   STRING_AGG(first_name || ' ' || last_name, ', ') as names
            FROM users 
            GROUP BY role
            ORDER BY role
        """))
        
        for row in result:
            print(f"{row.role.upper()}: {row.count} users")
            print(f"  Names: {row.names}")
            print()
        
        # 2. Job Postings
        print("💼 JOB POSTINGS")
        print("-" * 30)
        result = conn.execute(text("""
            SELECT j.title, j.company, j.job_type, j.status, j.deadline,
                   u.first_name || ' ' || u.last_name as posted_by
            FROM jobs j
            JOIN users u ON j.posted_by = u.id
            ORDER BY j.created_at DESC
        """))
        
        for row in result:
            print(f"📋 {row.title} at {row.company}")
            print(f"   Type: {row.job_type} | Status: {row.status}")
            print(f"   Deadline: {row.deadline} | Posted by: {row.posted_by}")
            print()
        
        # 3. Student Applications
        print("📝 STUDENT APPLICATIONS")
        print("-" * 30)
        result = conn.execute(text("""
            SELECT u.first_name || ' ' || u.last_name as student_name,
                   j.title as job_title,
                   j.company,
                   a.status,
                   a.applied_at
            FROM applications a
            JOIN users u ON a.student_id = u.id
            JOIN jobs j ON a.job_id = j.id
            ORDER BY a.applied_at DESC
        """))
        
        for row in result:
            print(f"👤 {row.student_name} applied for {row.job_title} at {row.company}")
            print(f"   Status: {row.status} | Applied: {row.applied_at}")
            print()
        
        # 4. AI Matches
        print("🤖 AI-POWERED JOB MATCHES")
        print("-" * 30)
        result = conn.execute(text("""
            SELECT u.first_name || ' ' || u.last_name as student_name,
                   j.title as job_title,
                   j.company,
                   am.match_score,
                   am.matched_skills
            FROM ai_matches am
            JOIN users u ON am.student_id = u.id
            JOIN jobs j ON am.job_id = j.id
            ORDER BY am.match_score DESC
        """))
        
        for row in result:
            print(f"🎯 {row.student_name} → {row.job_title} at {row.company}")
            print(f"   Match Score: {row.match_score:.2f} ({row.match_score*100:.0f}%)")
            print(f"   Matched Skills: {row.matched_skills}")
            print()
        
        # 5. Job Events
        print("📅 SCHEDULED JOB EVENTS")
        print("-" * 30)
        result = conn.execute(text("""
            SELECT je.event_type, je.title, je.event_date, je.event_time, je.location,
                   j.title as job_title, j.company
            FROM job_events je
            JOIN jobs j ON je.job_id = j.id
            ORDER BY je.event_date, je.event_time
        """))
        
        for row in result:
            print(f"📅 {row.title} ({row.event_type})")
            print(f"   Job: {row.job_title} at {row.company}")
            print(f"   Date: {row.event_date} at {row.event_time}")
            print(f"   Location: {row.location}")
            print()
        
        # 6. Shortlists
        print("📋 INTERVIEW SHORTLISTS")
        print("-" * 30)
        result = conn.execute(text("""
            SELECT s.round_name, s.status,
                   u.first_name || ' ' || u.last_name as student_name,
                   j.title as job_title, j.company
            FROM shortlists s
            JOIN users u ON s.student_id = u.id
            JOIN jobs j ON s.job_id = j.id
            ORDER BY j.title, s.round_name
        """))
        
        for row in result:
            print(f"🎯 {row.student_name} - {row.job_title} at {row.company}")
            print(f"   Round: {row.round_name} | Status: {row.status}")
            print()
        
        # 7. Opt-out Forms
        print("📄 PLACEMENT OPT-OUT FORMS")
        print("-" * 30)
        result = conn.execute(text("""
            SELECT u.first_name || ' ' || u.last_name as student_name,
                   of.reason, of.status, of.submitted_at
            FROM opt_out_forms of
            JOIN users u ON of.student_id = u.id
        """))
        
        for row in result:
            print(f"👤 {row.student_name}")
            print(f"   Reason: {row.reason}")
            print(f"   Status: {row.status} | Submitted: {row.submitted_at}")
            print()
        
        # 8. Bulletin Posts
        print("📢 BULLETIN POSTS & ANNOUNCEMENTS")
        print("-" * 30)
        result = conn.execute(text("""
            SELECT bp.title, bp.post_type, bp.target_audience,
                   u.first_name || ' ' || u.last_name as posted_by,
                   bp.created_at
            FROM bulletin_posts bp
            JOIN users u ON bp.posted_by = u.id
            ORDER BY bp.created_at DESC
        """))
        
        for row in result:
            print(f"📢 {row.title}")
            print(f"   Type: {row.post_type} | Audience: {row.target_audience}")
            print(f"   Posted by: {row.posted_by} | Date: {row.created_at}")
            print()
        
        # 9. Faculty Resources
        print("📚 FACULTY RESOURCES")
        print("-" * 30)
        result = conn.execute(text("""
            SELECT fr.title, fr.resource_type, fr.tags,
                   u.first_name || ' ' || u.last_name as faculty_name
            FROM faculty_resources fr
            JOIN users u ON fr.faculty_id = u.id
            ORDER BY fr.created_at DESC
        """))
        
        for row in result:
            print(f"📚 {row.title}")
            print(f"   Type: {row.resource_type} | Faculty: {row.faculty_name}")
            print(f"   Tags: {row.tags}")
            print()
        
        # 10. Crash Courses
        print("🎓 CRASH COURSES")
        print("-" * 30)
        result = conn.execute(text("""
            SELECT cc.title, cc.subject, cc.start_date, cc.end_date,
                   cc.current_enrollments, cc.max_students,
                   u.first_name || ' ' || u.last_name as faculty_name
            FROM crash_courses cc
            JOIN users u ON cc.faculty_id = u.id
            ORDER BY cc.start_date
        """))
        
        for row in result:
            print(f"🎓 {row.title} ({row.subject})")
            print(f"   Faculty: {row.faculty_name}")
            print(f"   Duration: {row.start_date} to {row.end_date}")
            print(f"   Enrollment: {row.current_enrollments}/{row.max_students}")
            print()
        
        # 11. Course Registrations
        print("📝 COURSE REGISTRATIONS")
        print("-" * 30)
        result = conn.execute(text("""
            SELECT u.first_name || ' ' || u.last_name as student_name,
                   cc.title as course_title,
                   cr.status, cr.registration_date
            FROM course_registrations cr
            JOIN users u ON cr.student_id = u.id
            JOIN crash_courses cc ON cr.course_id = cc.id
            ORDER BY cr.registration_date DESC
        """))
        
        for row in result:
            print(f"👤 {row.student_name} registered for {row.course_title}")
            print(f"   Status: {row.status} | Date: {row.registration_date}")
            print()
        
        # 12. Notifications
        print("🔔 NOTIFICATIONS")
        print("-" * 30)
        result = conn.execute(text("""
            SELECT u.first_name || ' ' || u.last_name as student_name,
                   n.title, n.message, n.type, n.is_read,
                   j.title as related_job
            FROM notifications n
            JOIN users u ON n.student_id = u.id
            LEFT JOIN jobs j ON n.related_job_id = j.id
            ORDER BY n.created_at DESC
        """))
        
        for row in result:
            print(f"🔔 {row.student_name}: {row.title}")
            print(f"   Message: {row.message}")
            print(f"   Type: {row.type} | Read: {row.is_read}")
            if row.related_job:
                print(f"   Related Job: {row.related_job}")
            print()
        
        # 13. Database Statistics
        print("📊 DATABASE STATISTICS")
        print("-" * 30)
        
        tables = [
            'users', 'jobs', 'applications', 'ai_matches', 'job_events',
            'shortlists', 'opt_out_forms', 'bulletin_posts', 'faculty_resources',
            'crash_courses', 'course_registrations', 'notifications'
        ]
        
        for table in tables:
            result = conn.execute(text(f"SELECT COUNT(*) as count FROM {table}"))
            count = result.fetchone().count
            print(f"📋 {table}: {count} records")
        
        print("\n🎉 Database demo completed!")
        print("\n💡 Key Features Demonstrated:")
        print("   ✅ Multi-role user management (TPO, Faculty, Students)")
        print("   ✅ Job posting and application tracking")
        print("   ✅ AI-powered job matching with scores")
        print("   ✅ Recruitment process management (events, shortlists)")
        print("   ✅ Student placement opt-out system")
        print("   ✅ Faculty resource sharing and crash courses")
        print("   ✅ System-wide announcements and notifications")
        print("   ✅ Comprehensive data relationships and integrity")

if __name__ == "__main__":
    demo_database()
