#!/usr/bin/env python3
"""
Database Seeding Script for Placement Navigator
Creates comprehensive sample data for demonstration purposes
"""

import sys
import os
from datetime import datetime, date, time, timedelta
from sqlalchemy.orm import Session
from sqlalchemy import create_engine
from dotenv import load_dotenv

# Add the shared directory to the path
sys.path.append(os.path.join(os.path.dirname(__file__), 'shared'))

from enhanced_models import (
    Base, User, Job, Application, AIMatch, JobEvent, Shortlist, 
    OptOutForm, BulletinPost, FacultyResource, CrashCourse, 
    CourseRegistration, AIJob, Notification,
    UserRole, JobStatus, ApplicationStatus, EventType
)

load_dotenv()

def create_sample_data():
    """Create comprehensive sample data for the Placement Navigator system"""
    
    # Database connection
    DATABASE_URL = os.getenv("DATABASE_URL")
    engine = create_engine(DATABASE_URL)
    Base.metadata.create_all(bind=engine)
    
    with Session(engine) as db:
        print("🌱 Starting database seeding...")
        
        # Clear existing data
        print("🧹 Clearing existing data...")
        db.query(Notification).delete()
        db.query(CourseRegistration).delete()
        db.query(CrashCourse).delete()
        db.query(FacultyResource).delete()
        db.query(BulletinPost).delete()
        db.query(OptOutForm).delete()
        db.query(Shortlist).delete()
        db.query(JobEvent).delete()
        db.query(AIMatch).delete()
        db.query(Application).delete()
        db.query(Job).delete()
        db.query(User).delete()
        db.commit()
        
        # 1. Create Users
        print("👥 Creating users...")
        users_data = [
            # TPO
            {
                "email": "tpo@university.edu",
                "password_hash": "hashed_password_tpo",
                "role": UserRole.TPO,
                "first_name": "Dr. Sarah",
                "last_name": "Johnson",
                "phone": "+1-555-0101",
                "profile_data": {
                    "department": "Training & Placement",
                    "experience_years": 15,
                    "specialization": "Career Development"
                }
            },
            # Faculty Members
            {
                "email": "prof.smith@university.edu",
                "password_hash": "hashed_password_faculty1",
                "role": UserRole.FACULTY,
                "first_name": "Prof. Michael",
                "last_name": "Smith",
                "phone": "+1-555-0102",
                "profile_data": {
                    "department": "Computer Science",
                    "designation": "Associate Professor",
                    "specialization": "Machine Learning, Data Science",
                    "experience_years": 12
                }
            },
            {
                "email": "prof.davis@university.edu",
                "password_hash": "hashed_password_faculty2",
                "role": UserRole.FACULTY,
                "first_name": "Prof. Emily",
                "last_name": "Davis",
                "phone": "+1-555-0103",
                "profile_data": {
                    "department": "Information Technology",
                    "designation": "Assistant Professor",
                    "specialization": "Web Development, Database Systems",
                    "experience_years": 8
                }
            },
            # Students
            {
                "email": "john.doe@student.university.edu",
                "password_hash": "hashed_password_student1",
                "role": UserRole.STUDENT,
                "first_name": "John",
                "last_name": "Doe",
                "phone": "+1-555-0201",
                "profile_data": {
                    "student_id": "CS2021001",
                    "batch": "2021",
                    "branch": "Computer Science",
                    "cgpa": 8.5,
                    "skills": ["Python", "JavaScript", "React", "Node.js", "Machine Learning"],
                    "projects": [
                        {
                            "title": "E-commerce Platform",
                            "description": "Full-stack web application",
                            "technologies": ["React", "Node.js", "MongoDB"]
                        }
                    ],
                    "experience": [
                        {
                            "company": "TechCorp Internship",
                            "position": "Software Developer Intern",
                            "duration": "3 months",
                            "description": "Developed web applications"
                        }
                    ]
                }
            },
            {
                "email": "jane.smith@student.university.edu",
                "password_hash": "hashed_password_student2",
                "role": UserRole.STUDENT,
                "first_name": "Jane",
                "last_name": "Smith",
                "phone": "+1-555-0202",
                "profile_data": {
                    "student_id": "IT2021002",
                    "batch": "2021",
                    "branch": "Information Technology",
                    "cgpa": 9.2,
                    "skills": ["Java", "Spring Boot", "MySQL", "AWS", "Docker"],
                    "projects": [
                        {
                            "title": "Cloud Management System",
                            "description": "AWS-based application",
                            "technologies": ["Java", "Spring Boot", "AWS"]
                        }
                    ]
                }
            },
            {
                "email": "alex.johnson@student.university.edu",
                "password_hash": "hashed_password_student3",
                "role": UserRole.STUDENT,
                "first_name": "Alex",
                "last_name": "Johnson",
                "phone": "+1-555-0203",
                "profile_data": {
                    "student_id": "CS2021003",
                    "batch": "2021",
                    "branch": "Computer Science",
                    "cgpa": 7.8,
                    "skills": ["C++", "Data Structures", "Algorithms", "Python"],
                    "projects": [
                        {
                            "title": "Algorithm Visualizer",
                            "description": "Interactive sorting algorithm visualizer",
                            "technologies": ["C++", "OpenGL"]
                        }
                    ]
                }
            },
            {
                "email": "sarah.wilson@student.university.edu",
                "password_hash": "hashed_password_student4",
                "role": UserRole.STUDENT,
                "first_name": "Sarah",
                "last_name": "Wilson",
                "phone": "+1-555-0204",
                "profile_data": {
                    "student_id": "IT2021004",
                    "batch": "2021",
                    "branch": "Information Technology",
                    "cgpa": 8.9,
                    "skills": ["Python", "Django", "PostgreSQL", "React", "Machine Learning"],
                    "projects": [
                        {
                            "title": "AI Chatbot",
                            "description": "NLP-based customer service chatbot",
                            "technologies": ["Python", "TensorFlow", "NLTK"]
                        }
                    ]
                }
            },
            {
                "email": "mike.brown@student.university.edu",
                "password_hash": "hashed_password_student5",
                "role": UserRole.STUDENT,
                "first_name": "Mike",
                "last_name": "Brown",
                "phone": "+1-555-0205",
                "profile_data": {
                    "student_id": "CS2021005",
                    "batch": "2021",
                    "branch": "Computer Science",
                    "cgpa": 6.5,
                    "skills": ["Java", "Android Development", "Firebase"],
                    "projects": [
                        {
                            "title": "Mobile Task Manager",
                            "description": "Android app for task management",
                            "technologies": ["Java", "Android Studio", "SQLite"]
                        }
                    ]
                }
            }
        ]
        
        users = []
        for user_data in users_data:
            user = User(**user_data)
            db.add(user)
            users.append(user)
        
        db.commit()
        print(f"✅ Created {len(users)} users")
        
        # Get user references
        tpo = db.query(User).filter(User.role == UserRole.TPO).first()
        faculty1 = db.query(User).filter(User.email == "prof.smith@university.edu").first()
        faculty2 = db.query(User).filter(User.email == "prof.davis@university.edu").first()
        students = db.query(User).filter(User.role == UserRole.STUDENT).all()
        
        # 2. Create Jobs
        print("💼 Creating jobs...")
        jobs_data = [
            {
                "title": "Software Development Intern",
                "company": "TechCorp Solutions",
                "description": "Join our dynamic team as a software development intern. Work on cutting-edge projects using modern technologies.",
                "requirements": ["Python", "JavaScript", "React", "Node.js", "Git"],
                "salary_range": "$15-20/hour",
                "location": "San Francisco, CA",
                "job_type": "internship",
                "status": JobStatus.OPEN,
                "deadline": datetime.now() + timedelta(days=30),
                "posted_by": tpo.id
            },
            {
                "title": "Full Stack Developer",
                "company": "InnovateTech",
                "description": "We're looking for a passionate full-stack developer to join our growing team. Work on exciting web applications.",
                "requirements": ["Java", "Spring Boot", "React", "PostgreSQL", "AWS"],
                "salary_range": "$70,000-90,000",
                "location": "New York, NY",
                "job_type": "full-time",
                "status": JobStatus.OPEN,
                "deadline": datetime.now() + timedelta(days=45),
                "posted_by": tpo.id
            },
            {
                "title": "Data Science Intern",
                "company": "DataInsights Inc",
                "description": "Exciting opportunity for data science enthusiasts. Work with large datasets and machine learning models.",
                "requirements": ["Python", "Machine Learning", "SQL", "Statistics", "Pandas"],
                "salary_range": "$18-22/hour",
                "location": "Remote",
                "job_type": "internship",
                "status": JobStatus.INTERVIEWS,
                "deadline": datetime.now() + timedelta(days=20),
                "posted_by": tpo.id
            },
            {
                "title": "Mobile App Developer",
                "company": "AppCraft Studios",
                "description": "Create amazing mobile experiences for iOS and Android platforms.",
                "requirements": ["React Native", "JavaScript", "iOS", "Android", "Firebase"],
                "salary_range": "$60,000-80,000",
                "location": "Austin, TX",
                "job_type": "full-time",
                "status": JobStatus.OPEN,
                "deadline": datetime.now() + timedelta(days=60),
                "posted_by": tpo.id
            },
            {
                "title": "Cloud Engineer Intern",
                "company": "CloudScale Technologies",
                "description": "Learn cloud technologies and work on scalable infrastructure projects.",
                "requirements": ["AWS", "Docker", "Kubernetes", "Python", "Linux"],
                "salary_range": "$16-20/hour",
                "location": "Seattle, WA",
                "job_type": "internship",
                "status": JobStatus.CLOSED,
                "deadline": datetime.now() - timedelta(days=5),
                "posted_by": tpo.id
            }
        ]
        
        jobs = []
        for job_data in jobs_data:
            job = Job(**job_data)
            db.add(job)
            jobs.append(job)
        
        db.commit()
        print(f"✅ Created {len(jobs)} jobs")
        
        # 3. Create Applications
        print("📝 Creating applications...")
        applications_data = [
            {"student_id": students[0].id, "job_id": jobs[0].id, "status": ApplicationStatus.SUBMITTED},
            {"student_id": students[0].id, "job_id": jobs[1].id, "status": ApplicationStatus.SHORTLISTED},
            {"student_id": students[1].id, "job_id": jobs[1].id, "status": ApplicationStatus.SUBMITTED},
            {"student_id": students[1].id, "job_id": jobs[2].id, "status": ApplicationStatus.SHORTLISTED},
            {"student_id": students[2].id, "job_id": jobs[0].id, "status": ApplicationStatus.REJECTED},
            {"student_id": students[3].id, "job_id": jobs[2].id, "status": ApplicationStatus.SUBMITTED},
            {"student_id": students[3].id, "job_id": jobs[3].id, "status": ApplicationStatus.SUBMITTED},
            {"student_id": students[4].id, "job_id": jobs[3].id, "status": ApplicationStatus.SUBMITTED}
        ]
        
        for app_data in applications_data:
            application = Application(**app_data)
            db.add(application)
        
        db.commit()
        print(f"✅ Created {len(applications_data)} applications")
        
        # 4. Create AI Matches
        print("🤖 Creating AI matches...")
        ai_matches_data = [
            {"student_id": students[0].id, "job_id": jobs[0].id, "match_score": 0.92, "matched_skills": ["Python", "JavaScript", "React", "Node.js"]},
            {"student_id": students[1].id, "job_id": jobs[1].id, "match_score": 0.88, "matched_skills": ["Java", "Spring Boot", "AWS"]},
            {"student_id": students[3].id, "job_id": jobs[2].id, "match_score": 0.95, "matched_skills": ["Python", "Machine Learning", "Pandas"]},
            {"student_id": students[0].id, "job_id": jobs[1].id, "match_score": 0.75, "matched_skills": ["JavaScript", "React"]},
            {"student_id": students[1].id, "job_id": jobs[2].id, "match_score": 0.82, "matched_skills": ["Python", "SQL"]}
        ]
        
        for match_data in ai_matches_data:
            ai_match = AIMatch(**match_data)
            db.add(ai_match)
        
        db.commit()
        print(f"✅ Created {len(ai_matches_data)} AI matches")
        
        # 5. Create Job Events
        print("📅 Creating job events...")
        events_data = [
            {
                "job_id": jobs[2].id,  # Data Science Intern
                "event_type": EventType.TEST,
                "title": "Technical Aptitude Test",
                "description": "Online test covering Python, Statistics, and Machine Learning concepts",
                "event_date": date.today() + timedelta(days=7),
                "event_time": time(10, 0),
                "location": "Computer Lab A",
                "max_participants": 50
            },
            {
                "job_id": jobs[2].id,
                "event_type": EventType.INTERVIEW,
                "title": "Technical Interview Round 1",
                "description": "Technical interview focusing on data science concepts and projects",
                "event_date": date.today() + timedelta(days=14),
                "event_time": time(14, 0),
                "location": "Interview Room 1",
                "max_participants": 20
            },
            {
                "job_id": jobs[1].id,  # Full Stack Developer
                "event_type": EventType.INTERVIEW,
                "title": "Technical Interview",
                "description": "Full-stack development interview with coding challenges",
                "event_date": date.today() + timedelta(days=10),
                "event_time": time(15, 30),
                "location": "Conference Room B",
                "max_participants": 15
            }
        ]
        
        for event_data in events_data:
            event = JobEvent(**event_data)
            db.add(event)
        
        db.commit()
        print(f"✅ Created {len(events_data)} job events")
        
        # 6. Create Shortlists
        print("📋 Creating shortlists...")
        shortlists_data = [
            {"job_id": jobs[1].id, "student_id": students[0].id, "round_name": "Technical Interview", "status": "shortlisted"},
            {"job_id": jobs[2].id, "student_id": students[1].id, "round_name": "Technical Test", "status": "shortlisted"},
            {"job_id": jobs[2].id, "student_id": students[3].id, "round_name": "Technical Test", "status": "shortlisted"}
        ]
        
        for shortlist_data in shortlists_data:
            shortlist = Shortlist(**shortlist_data)
            db.add(shortlist)
        
        db.commit()
        print(f"✅ Created {len(shortlists_data)} shortlists")
        
        # 7. Create Opt-Out Forms
        print("📄 Creating opt-out forms...")
        opt_out_data = [
            {
                "student_id": students[4].id,  # Mike Brown
                "reason": "Pursuing higher studies (MS in Computer Science)",
                "additional_info": "Planning to apply for graduate programs in the US",
                "status": "approved"
            }
        ]
        
        for opt_out in opt_out_data:
            form = OptOutForm(**opt_out)
            db.add(form)
        
        db.commit()
        print(f"✅ Created {len(opt_out_data)} opt-out forms")
        
        # 8. Create Bulletin Posts
        print("📢 Creating bulletin posts...")
        bulletin_data = [
            {
                "title": "Annual Hackathon 2024 - Registration Open!",
                "content": "Join our annual hackathon with exciting prizes and networking opportunities. Registration deadline: March 15, 2024.",
                "post_type": "hackathon",
                "target_audience": "students",
                "posted_by": tpo.id
            },
            {
                "title": "Career Guidance Workshop",
                "content": "Interactive workshop on resume building and interview preparation. Date: March 20, 2024 at 2:00 PM.",
                "post_type": "workshop",
                "target_audience": "students",
                "posted_by": tpo.id
            },
            {
                "title": "New Job Postings Available",
                "content": "Check out the latest job opportunities from top companies. Apply before the deadlines!",
                "post_type": "announcement",
                "target_audience": "students",
                "posted_by": tpo.id
            }
        ]
        
        for bulletin in bulletin_data:
            post = BulletinPost(**bulletin)
            db.add(post)
        
        db.commit()
        print(f"✅ Created {len(bulletin_data)} bulletin posts")
        
        # 9. Create Faculty Resources
        print("📚 Creating faculty resources...")
        resources_data = [
            {
                "faculty_id": faculty1.id,
                "title": "Machine Learning Fundamentals",
                "description": "Comprehensive guide to machine learning concepts and algorithms",
                "resource_type": "document",
                "file_path": "/resources/ml_fundamentals.pdf",
                "tags": ["machine learning", "AI", "algorithms"],
                "is_public": True
            },
            {
                "faculty_id": faculty1.id,
                "title": "Python for Data Science",
                "description": "Video tutorial series on Python programming for data science",
                "resource_type": "video",
                "external_url": "https://youtube.com/playlist/python-data-science",
                "tags": ["python", "data science", "programming"],
                "is_public": True
            },
            {
                "faculty_id": faculty2.id,
                "title": "Web Development Best Practices",
                "description": "Guide to modern web development practices and frameworks",
                "resource_type": "document",
                "file_path": "/resources/web_dev_best_practices.pdf",
                "tags": ["web development", "best practices", "frameworks"],
                "is_public": True
            }
        ]
        
        for resource_data in resources_data:
            resource = FacultyResource(**resource_data)
            db.add(resource)
        
        db.commit()
        print(f"✅ Created {len(resources_data)} faculty resources")
        
        # 10. Create Crash Courses
        print("🎓 Creating crash courses...")
        courses_data = [
            {
                "faculty_id": faculty1.id,
                "title": "Machine Learning Crash Course",
                "description": "Intensive 4-week course covering ML algorithms, implementation, and real-world applications",
                "subject": "Machine Learning",
                "start_date": date.today() + timedelta(days=7),
                "end_date": date.today() + timedelta(days=35),
                "schedule": {
                    "days": ["Monday", "Wednesday", "Friday"],
                    "time": "3:00 PM - 5:00 PM",
                    "location": "Lab 201"
                },
                "max_students": 30,
                "current_enrollments": 0
            },
            {
                "faculty_id": faculty2.id,
                "title": "Full-Stack Web Development",
                "description": "Comprehensive course on modern web development using React and Node.js",
                "subject": "Web Development",
                "start_date": date.today() + timedelta(days=14),
                "end_date": date.today() + timedelta(days=56),
                "schedule": {
                    "days": ["Tuesday", "Thursday"],
                    "time": "2:00 PM - 4:00 PM",
                    "location": "Lab 202"
                },
                "max_students": 25,
                "current_enrollments": 0
            }
        ]
        
        courses = []
        for course_data in courses_data:
            course = CrashCourse(**course_data)
            db.add(course)
            courses.append(course)
        
        db.commit()
        print(f"✅ Created {len(courses)} crash courses")
        
        # 11. Create Course Registrations
        print("📝 Creating course registrations...")
        registrations_data = [
            {"student_id": students[0].id, "course_id": courses[0].id, "status": "registered"},
            {"student_id": students[1].id, "course_id": courses[0].id, "status": "registered"},
            {"student_id": students[3].id, "course_id": courses[0].id, "status": "registered"},
            {"student_id": students[0].id, "course_id": courses[1].id, "status": "registered"},
            {"student_id": students[1].id, "course_id": courses[1].id, "status": "registered"}
        ]
        
        for reg_data in registrations_data:
            registration = CourseRegistration(**reg_data)
            db.add(registration)
        
        # Update course enrollment counts
        for course in courses:
            course.current_enrollments = len([r for r in registrations_data if r["course_id"] == course.id])
        
        db.commit()
        print(f"✅ Created {len(registrations_data)} course registrations")
        
        # 12. Create Notifications
        print("🔔 Creating notifications...")
        notifications_data = [
            {"student_id": students[0].id, "title": "New Job Match!", "message": "You have a 92% match with Software Development Intern at TechCorp Solutions", "type": "success", "related_job_id": jobs[0].id},
            {"student_id": students[1].id, "title": "Application Status Update", "message": "Your application for Full Stack Developer has been shortlisted for interview", "type": "info", "related_job_id": jobs[1].id},
            {"student_id": students[2].id, "title": "Application Update", "message": "Your application for Software Development Intern was not selected for this round", "type": "warning", "related_job_id": jobs[0].id},
            {"student_id": students[3].id, "title": "Course Registration Confirmed", "message": "You have successfully registered for Machine Learning Crash Course", "type": "success"},
            {"student_id": students[0].id, "title": "Interview Scheduled", "message": "Your technical interview for Data Science Intern is scheduled for next week", "type": "info", "related_job_id": jobs[2].id}
        ]
        
        for notif_data in notifications_data:
            notification = Notification(**notif_data)
            db.add(notification)
        
        db.commit()
        print(f"✅ Created {len(notifications_data)} notifications")
        
        print("\n🎉 Database seeding completed successfully!")
        print("\n📊 Summary:")
        print(f"   👥 Users: {len(users)}")
        print(f"   💼 Jobs: {len(jobs)}")
        print(f"   📝 Applications: {len(applications_data)}")
        print(f"   🤖 AI Matches: {len(ai_matches_data)}")
        print(f"   📅 Job Events: {len(events_data)}")
        print(f"   📋 Shortlists: {len(shortlists_data)}")
        print(f"   📄 Opt-out Forms: {len(opt_out_data)}")
        print(f"   📢 Bulletin Posts: {len(bulletin_data)}")
        print(f"   📚 Faculty Resources: {len(resources_data)}")
        print(f"   🎓 Crash Courses: {len(courses)}")
        print(f"   📝 Course Registrations: {len(registrations_data)}")
        print(f"   🔔 Notifications: {len(notifications_data)}")

if __name__ == "__main__":
    create_sample_data()
