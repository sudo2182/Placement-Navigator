# Placement Navigator Database Documentation

## Overview
The Placement Navigator database is designed to support a comprehensive university placement management system with AI-powered features. The database handles user management, job postings, applications, AI matching, recruitment processes, and educational resources.

## Database Schema

### Core Tables

#### 1. Users Table
**Purpose**: Central user management for all system participants
- **Primary Key**: `id`
- **Key Fields**: `email`, `role`, `first_name`, `last_name`, `profile_data`
- **Roles**: `student`, `tpo`, `faculty`, `employer`
- **Profile Data**: JSON field storing skills, projects, experience, academic info

#### 2. Jobs Table
**Purpose**: Job posting and management
- **Primary Key**: `id`
- **Key Fields**: `title`, `company`, `description`, `requirements`, `status`
- **Status Options**: `open`, `closed`, `interviews`, `completed`
- **Requirements**: JSON array of required skills/qualifications

#### 3. Applications Table
**Purpose**: Student job applications tracking
- **Primary Key**: `id`
- **Foreign Keys**: `student_id` → Users, `job_id` → Jobs
- **Status Options**: `submitted`, `reviewed`, `shortlisted`, `rejected`, `selected`

### AI-Powered Features

#### 4. AI Matches Table
**Purpose**: Store AI-generated job-student matches
- **Primary Key**: `id`
- **Key Fields**: `match_score`, `matched_skills`, `explanation`
- **Score Range**: 0.0 to 1.0 (higher = better match)

#### 5. AI Jobs Table
**Purpose**: Track AI agent executions and results
- **Primary Key**: `id`
- **Job Types**: `matching`, `resume_gen`, `progress_tracking`
- **Status**: `pending`, `running`, `completed`, `failed`

### Recruitment Process Management

#### 6. Job Events Table
**Purpose**: Schedule and manage recruitment events
- **Primary Key**: `id`
- **Event Types**: `test`, `interview`, `presentation`, `group_discussion`
- **Key Fields**: `event_date`, `event_time`, `location`, `max_participants`

#### 7. Shortlists Table
**Purpose**: Track interview rounds and selections
- **Primary Key**: `id`
- **Key Fields**: `round_name`, `status`, `notes`
- **Status**: `shortlisted`, `selected`, `rejected`

### Student Features

#### 8. Opt-Out Forms Table
**Purpose**: Handle placement opt-out requests
- **Primary Key**: `id`
- **Key Fields**: `reason`, `status`, `reviewed_by`
- **Status**: `pending`, `approved`, `rejected`

#### 9. Course Registrations Table
**Purpose**: Track student enrollment in crash courses
- **Primary Key**: `id`
- **Status**: `registered`, `completed`, `dropped`

### Faculty Features

#### 10. Faculty Resources Table
**Purpose**: Store and manage educational resources
- **Primary Key**: `id`
- **Resource Types**: `document`, `video`, `link`
- **Key Fields**: `title`, `description`, `file_path`, `external_url`, `tags`

#### 11. Crash Courses Table
**Purpose**: Manage special courses offered by faculty
- **Primary Key**: `id`
- **Key Fields**: `title`, `description`, `start_date`, `end_date`, `schedule`
- **Schedule**: JSON field with days, time, location

### Communication & Notifications

#### 12. Bulletin Posts Table
**Purpose**: System-wide announcements and bulletins
- **Primary Key**: `id`
- **Post Types**: `announcement`, `hackathon`, `workshop`, `event`
- **Target Audience**: `all`, `students`, `faculty`, `specific_batch`

#### 13. Notifications Table
**Purpose**: User-specific notifications and alerts
- **Primary Key**: `id`
- **Types**: `info`, `success`, `warning`, `error`
- **Key Fields**: `title`, `message`, `is_read`, `related_job_id`

## Key Relationships

### User Relationships
- **Users** → **Jobs** (posted_by): TPO posts jobs
- **Users** → **Applications** (student_id): Students apply for jobs
- **Users** → **OptOutForm** (student_id): Students submit opt-out forms
- **Users** → **CourseRegistration** (student_id): Students enroll in courses
- **Users** → **CrashCourse** (faculty_id): Faculty create courses
- **Users** → **FacultyResource** (faculty_id): Faculty upload resources
- **Users** → **Notification** (student_id): Students receive notifications

### Job Relationships
- **Jobs** → **Applications** (job_id): Jobs receive applications
- **Jobs** → **AIMatch** (job_id): Jobs have AI matches
- **Jobs** → **JobEvent** (job_id): Jobs have scheduled events
- **Jobs** → **Shortlist** (job_id): Jobs have shortlisted candidates

### Process Flow
1. **TPO** creates **Jobs**
2. **Students** submit **Applications**
3. **AI System** generates **AI Matches**
4. **TPO** creates **Job Events** (tests, interviews)
5. **TPO** creates **Shortlists** for interview rounds
6. **Faculty** create **Crash Courses** and upload **Resources**
7. **Students** register for **Courses**
8. **System** sends **Notifications** for updates

## Sample Data Overview

The database is populated with realistic sample data including:

### Users (8 total)
- **1 TPO**: Dr. Sarah Johnson
- **2 Faculty**: Prof. Michael Smith (CS), Prof. Emily Davis (IT)
- **5 Students**: John Doe, Jane Smith, Alex Johnson, Sarah Wilson, Mike Brown

### Jobs (5 total)
- Software Development Intern (TechCorp)
- Full Stack Developer (InnovateTech)
- Data Science Intern (DataInsights)
- Mobile App Developer (AppCraft)
- Cloud Engineer Intern (CloudScale)

### Applications (8 total)
- Multiple applications per student
- Various statuses (submitted, shortlisted, rejected)

### AI Matches (5 total)
- High match scores (0.75-0.95)
- Detailed skill matching

### Events (3 total)
- Technical tests and interviews
- Scheduled with dates and locations

### Additional Data
- **Shortlists**: 3 entries for interview rounds
- **Opt-out Forms**: 1 student opting out for higher studies
- **Bulletin Posts**: 3 announcements (hackathon, workshop, jobs)
- **Faculty Resources**: 3 educational resources
- **Crash Courses**: 2 courses (ML, Web Development)
- **Course Registrations**: 5 student enrollments
- **Notifications**: 5 user notifications

## Database Features

### 1. TPO Features
- **User Management**: Upload and manage student/faculty lists
- **Job Management**: Create, edit, delete job postings
- **Recruitment Tracking**: Update job status, create shortlists, schedule events
- **Announcements**: Post bulletins and announcements

### 2. Student Features
- **Authentication**: Login with email/password
- **Profile Management**: Update skills, projects, experience
- **Job Discovery**: View available jobs and AI matches
- **Application Tracking**: Submit applications, view status
- **Event Participation**: View and attend job events
- **Opt-out Process**: Submit placement opt-out forms
- **Course Enrollment**: Register for crash courses

### 3. Faculty Features
- **Resource Sharing**: Upload educational materials
- **Course Management**: Create and manage crash courses
- **Student Tracking**: View course enrollments

### 4. AI-Powered Features
- **Smart Matching**: AI matches students with suitable jobs
- **Resume Generation**: AI-assisted resume creation
- **Progress Tracking**: Monitor student development

## Technical Implementation

### Database Engine
- **PostgreSQL** with SQLAlchemy ORM
- **Connection**: Environment variable `DATABASE_URL`
- **Migrations**: Alembic for schema versioning

### Data Types
- **JSON Fields**: Flexible data storage for profiles, requirements, schedules
- **Enums**: Type-safe status and role management
- **Timestamps**: Automatic creation and update tracking
- **Foreign Keys**: Referential integrity with cascade options

### Performance Considerations
- **Indexes**: Primary keys and frequently queried fields
- **Relationships**: Optimized with proper foreign key constraints
- **JSON Queries**: Efficient querying of JSON fields for AI matching

## Usage Examples

### Querying AI Matches
```sql
SELECT u.first_name, u.last_name, j.title, j.company, am.match_score
FROM ai_matches am
JOIN users u ON am.student_id = u.id
JOIN jobs j ON am.job_id = j.id
WHERE am.match_score > 0.8
ORDER BY am.match_score DESC;
```

### Finding Active Jobs
```sql
SELECT j.title, j.company, j.deadline, COUNT(a.id) as application_count
FROM jobs j
LEFT JOIN applications a ON j.id = a.job_id
WHERE j.status = 'open' AND j.is_active = true
GROUP BY j.id, j.title, j.company, j.deadline;
```

### Student Course Enrollments
```sql
SELECT u.first_name, u.last_name, cc.title, cr.status
FROM course_registrations cr
JOIN users u ON cr.student_id = u.id
JOIN crash_courses cc ON cr.course_id = cc.id
WHERE cr.status = 'registered';
```

This database design provides a comprehensive foundation for the Placement Navigator system, supporting all required features while maintaining data integrity and performance.
