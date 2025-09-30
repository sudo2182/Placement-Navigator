#!/usr/bin/env python3
"""
Database Migration Script for Placement Navigator
Updates existing database schema to match enhanced models
"""

import sys
import os
from sqlalchemy import create_engine, text
from dotenv import load_dotenv

load_dotenv()

def migrate_database():
    """Migrate the existing database to the new schema"""
    
    DATABASE_URL = os.getenv("DATABASE_URL")
    engine = create_engine(DATABASE_URL)
    
    print("🔄 Starting database migration...")
    
    with engine.connect() as conn:
        # Start a transaction
        trans = conn.begin()
        
        try:
            # 1. Add new columns to users table
            print("📝 Adding new columns to users table...")
            
            # Check if columns exist before adding
            result = conn.execute(text("""
                SELECT column_name 
                FROM information_schema.columns 
                WHERE table_name = 'users' AND column_name = 'first_name'
            """))
            
            if not result.fetchone():
                conn.execute(text("ALTER TABLE users ADD COLUMN first_name VARCHAR"))
                conn.execute(text("ALTER TABLE users ADD COLUMN last_name VARCHAR"))
                conn.execute(text("ALTER TABLE users ADD COLUMN phone VARCHAR"))
                print("✅ Added first_name, last_name, phone columns")
            else:
                print("ℹ️  first_name column already exists, skipping...")
            
            # 2. Create new tables
            print("📋 Creating new tables...")
            
            # Create job_events table
            conn.execute(text("""
                CREATE TABLE IF NOT EXISTS job_events (
                    id SERIAL PRIMARY KEY,
                    job_id INTEGER REFERENCES jobs(id),
                    event_type VARCHAR NOT NULL,
                    title VARCHAR NOT NULL,
                    description TEXT,
                    event_date DATE NOT NULL,
                    event_time TIME NOT NULL,
                    location VARCHAR,
                    max_participants INTEGER,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                )
            """))
            print("✅ Created job_events table")
            
            # Create shortlists table
            conn.execute(text("""
                CREATE TABLE IF NOT EXISTS shortlists (
                    id SERIAL PRIMARY KEY,
                    job_id INTEGER REFERENCES jobs(id),
                    student_id INTEGER REFERENCES users(id),
                    round_name VARCHAR NOT NULL,
                    status VARCHAR DEFAULT 'shortlisted',
                    notes TEXT,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                )
            """))
            print("✅ Created shortlists table")
            
            # Create opt_out_forms table
            conn.execute(text("""
                CREATE TABLE IF NOT EXISTS opt_out_forms (
                    id SERIAL PRIMARY KEY,
                    student_id INTEGER REFERENCES users(id),
                    reason TEXT NOT NULL,
                    additional_info TEXT,
                    status VARCHAR DEFAULT 'pending',
                    submitted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    reviewed_at TIMESTAMP,
                    reviewed_by INTEGER REFERENCES users(id)
                )
            """))
            print("✅ Created opt_out_forms table")
            
            # Create bulletin_posts table
            conn.execute(text("""
                CREATE TABLE IF NOT EXISTS bulletin_posts (
                    id SERIAL PRIMARY KEY,
                    title VARCHAR NOT NULL,
                    content TEXT NOT NULL,
                    post_type VARCHAR DEFAULT 'announcement',
                    target_audience VARCHAR DEFAULT 'all',
                    posted_by INTEGER REFERENCES users(id),
                    is_active BOOLEAN DEFAULT TRUE,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                )
            """))
            print("✅ Created bulletin_posts table")
            
            # Create faculty_resources table
            conn.execute(text("""
                CREATE TABLE IF NOT EXISTS faculty_resources (
                    id SERIAL PRIMARY KEY,
                    faculty_id INTEGER REFERENCES users(id),
                    title VARCHAR NOT NULL,
                    description TEXT,
                    resource_type VARCHAR NOT NULL,
                    file_path VARCHAR,
                    external_url VARCHAR,
                    tags JSON,
                    is_public BOOLEAN DEFAULT TRUE,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                )
            """))
            print("✅ Created faculty_resources table")
            
            # Create crash_courses table
            conn.execute(text("""
                CREATE TABLE IF NOT EXISTS crash_courses (
                    id SERIAL PRIMARY KEY,
                    faculty_id INTEGER REFERENCES users(id),
                    title VARCHAR NOT NULL,
                    description TEXT NOT NULL,
                    subject VARCHAR NOT NULL,
                    start_date DATE NOT NULL,
                    end_date DATE NOT NULL,
                    schedule JSON,
                    max_students INTEGER DEFAULT 50,
                    current_enrollments INTEGER DEFAULT 0,
                    is_active BOOLEAN DEFAULT TRUE,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                )
            """))
            print("✅ Created crash_courses table")
            
            # Create course_registrations table
            conn.execute(text("""
                CREATE TABLE IF NOT EXISTS course_registrations (
                    id SERIAL PRIMARY KEY,
                    student_id INTEGER REFERENCES users(id),
                    course_id INTEGER REFERENCES crash_courses(id),
                    registration_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    status VARCHAR DEFAULT 'registered',
                    completion_date TIMESTAMP
                )
            """))
            print("✅ Created course_registrations table")
            
            # 3. Update existing tables
            print("🔧 Updating existing tables...")
            
            # Add status column to jobs table if it doesn't exist
            result = conn.execute(text("""
                SELECT column_name 
                FROM information_schema.columns 
                WHERE table_name = 'jobs' AND column_name = 'status'
            """))
            
            if not result.fetchone():
                conn.execute(text("ALTER TABLE jobs ADD COLUMN status VARCHAR DEFAULT 'open'"))
                print("✅ Added status column to jobs table")
            else:
                print("ℹ️  status column already exists in jobs table")
            
            # Add updated_at column to jobs table if it doesn't exist
            result = conn.execute(text("""
                SELECT column_name 
                FROM information_schema.columns 
                WHERE table_name = 'jobs' AND column_name = 'updated_at'
            """))
            
            if not result.fetchone():
                conn.execute(text("ALTER TABLE jobs ADD COLUMN updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP"))
                print("✅ Added updated_at column to jobs table")
            else:
                print("ℹ️  updated_at column already exists in jobs table")
            
            # Add updated_at column to applications table if it doesn't exist
            result = conn.execute(text("""
                SELECT column_name 
                FROM information_schema.columns 
                WHERE table_name = 'applications' AND column_name = 'updated_at'
            """))
            
            if not result.fetchone():
                conn.execute(text("ALTER TABLE applications ADD COLUMN updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP"))
                print("✅ Added updated_at column to applications table")
            else:
                print("ℹ️  updated_at column already exists in applications table")
            
            # Commit the transaction
            trans.commit()
            print("🎉 Database migration completed successfully!")
            
        except Exception as e:
            # Rollback on error
            trans.rollback()
            print(f"❌ Migration failed: {str(e)}")
            raise

if __name__ == "__main__":
    migrate_database()
