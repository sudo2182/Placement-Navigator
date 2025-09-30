# Placement Navigator Database Schema Diagram

## Entity Relationship Diagram

```mermaid
erDiagram
    USERS {
        int id PK
        string email UK
        string password_hash
        enum role
        string first_name
        string last_name
        string phone
        json profile_data
        boolean is_active
        datetime created_at
        datetime updated_at
    }

    JOBS {
        int id PK
        string title
        string company
        text description
        json requirements
        string salary_range
        string location
        string job_type
        enum status
        datetime deadline
        int posted_by FK
        boolean is_active
        datetime created_at
        datetime updated_at
    }

    APPLICATIONS {
        int id PK
        int student_id FK
        int job_id FK
        text resume_content
        text cover_letter
        enum status
        boolean ai_generated
        datetime applied_at
        datetime updated_at
    }

    AI_MATCHES {
        int id PK
        int student_id FK
        int job_id FK
        float match_score
        json matched_skills
        text explanation
        datetime created_at
    }

    JOB_EVENTS {
        int id PK
        int job_id FK
        enum event_type
        string title
        text description
        date event_date
        time event_time
        string location
        int max_participants
        datetime created_at
    }

    SHORTLISTS {
        int id PK
        int job_id FK
        int student_id FK
        string round_name
        string status
        text notes
        datetime created_at
    }

    OPT_OUT_FORMS {
        int id PK
        int student_id FK
        text reason
        text additional_info
        string status
        datetime submitted_at
        datetime reviewed_at
        int reviewed_by FK
    }

    BULLETIN_POSTS {
        int id PK
        string title
        text content
        string post_type
        string target_audience
        int posted_by FK
        boolean is_active
        datetime created_at
        datetime updated_at
    }

    FACULTY_RESOURCES {
        int id PK
        int faculty_id FK
        string title
        text description
        string resource_type
        string file_path
        string external_url
        json tags
        boolean is_public
        datetime created_at
    }

    CRASH_COURSES {
        int id PK
        int faculty_id FK
        string title
        text description
        string subject
        date start_date
        date end_date
        json schedule
        int max_students
        int current_enrollments
        boolean is_active
        datetime created_at
    }

    COURSE_REGISTRATIONS {
        int id PK
        int student_id FK
        int course_id FK
        datetime registration_date
        string status
        datetime completion_date
    }

    AI_JOBS {
        int id PK
        string job_type
        int student_id FK
        int job_id FK
        string status
        json input_data
        json result_data
        text error_message
        datetime created_at
        datetime completed_at
    }

    NOTIFICATIONS {
        int id PK
        int student_id FK
        string title
        text message
        string type
        boolean is_read
        int related_job_id FK
        datetime created_at
    }

    %% User Relationships
    USERS ||--o{ JOBS : "posted_by"
    USERS ||--o{ APPLICATIONS : "student_id"
    USERS ||--o{ AI_MATCHES : "student_id"
    USERS ||--o{ SHORTLISTS : "student_id"
    USERS ||--o{ OPT_OUT_FORMS : "student_id"
    USERS ||--o{ COURSE_REGISTRATIONS : "student_id"
    USERS ||--o{ CRASH_COURSES : "faculty_id"
    USERS ||--o{ FACULTY_RESOURCES : "faculty_id"
    USERS ||--o{ BULLETIN_POSTS : "posted_by"
    USERS ||--o{ NOTIFICATIONS : "student_id"
    USERS ||--o{ AI_JOBS : "student_id"
    USERS ||--o{ OPT_OUT_FORMS : "reviewed_by"

    %% Job Relationships
    JOBS ||--o{ APPLICATIONS : "job_id"
    JOBS ||--o{ AI_MATCHES : "job_id"
    JOBS ||--o{ JOB_EVENTS : "job_id"
    JOBS ||--o{ SHORTLISTS : "job_id"
    JOBS ||--o{ AI_JOBS : "job_id"
    JOBS ||--o{ NOTIFICATIONS : "related_job_id"

    %% Course Relationships
    CRASH_COURSES ||--o{ COURSE_REGISTRATIONS : "course_id"
```

## Key Relationships Summary

### 1. User Management
- **Users** are the central entity with different roles (student, tpo, faculty, employer)
- **Profile Data** stored as JSON for flexible student information storage
- **One-to-Many** relationships with all user-generated content

### 2. Job Management Flow
```
TPO creates JOBS → Students submit APPLICATIONS → AI generates MATCHES → TPO creates EVENTS → TPO creates SHORTLISTS
```

### 3. Student Features
- **Applications**: Students apply for jobs
- **Opt-out Forms**: Students can opt out of placement process
- **Course Registrations**: Students enroll in crash courses
- **Notifications**: Students receive system notifications

### 4. Faculty Features
- **Crash Courses**: Faculty create special courses
- **Faculty Resources**: Faculty upload educational materials
- **Course Management**: Track student enrollments

### 5. AI-Powered Features
- **AI Matches**: AI system matches students with jobs
- **AI Jobs**: Track AI agent executions
- **Smart Notifications**: Context-aware notifications

## Data Flow Diagram

```mermaid
graph TD
    A[TPO] --> B[Create Jobs]
    B --> C[Students View Jobs]
    C --> D[AI Matching System]
    D --> E[Generate Matches]
    E --> F[Students Apply]
    F --> G[TPO Reviews Applications]
    G --> H[Create Shortlists]
    H --> I[Schedule Events]
    I --> J[Conduct Interviews]
    J --> K[Final Selection]
    
    L[Faculty] --> M[Create Courses]
    M --> N[Upload Resources]
    N --> O[Students Register]
    
    P[System] --> Q[Send Notifications]
    Q --> R[Update Status]
```

## Sample Data Statistics

| Table | Records | Description |
|-------|---------|-------------|
| Users | 8 | 1 TPO, 2 Faculty, 5 Students |
| Jobs | 5 | Various internships and full-time positions |
| Applications | 8 | Multiple applications per student |
| AI Matches | 5 | High-quality matches (0.75-0.95 score) |
| Job Events | 3 | Tests and interviews scheduled |
| Shortlists | 3 | Interview round selections |
| Opt-out Forms | 1 | Student opting out for higher studies |
| Bulletin Posts | 3 | System announcements |
| Faculty Resources | 3 | Educational materials |
| Crash Courses | 2 | ML and Web Development courses |
| Course Registrations | 5 | Student enrollments |
| Notifications | 5 | User-specific alerts |

## Database Features by Role

### TPO Features
- ✅ User Management (upload student/faculty lists)
- ✅ Job Posting & Management
- ✅ Recruitment Process Tracking
- ✅ Event Scheduling
- ✅ Shortlist Management
- ✅ Announcements & Bulletins

### Student Features
- ✅ Authentication & Profile Management
- ✅ Job Discovery & Application
- ✅ AI-Powered Job Matching
- ✅ Event Participation
- ✅ Placement Opt-out
- ✅ Course Registration
- ✅ Notification System

### Faculty Features
- ✅ Resource Sharing
- ✅ Crash Course Management
- ✅ Student Enrollment Tracking
- ✅ Educational Content Management

This comprehensive database design supports all the required features while maintaining data integrity and providing a solid foundation for the Placement Navigator system.
