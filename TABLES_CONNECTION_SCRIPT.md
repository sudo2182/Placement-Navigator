# 🎯 Database Tables & Connections - 2 Minute Script

## **Opening (20 seconds)**
*"I'll show you our database structure - 12 tables that work together to manage the entire placement process. Let me explain how they connect."*

## **Core Tables (40 seconds)**
*"Main tables:*

**Users Table (10 seconds)**
- Stores TPO, Faculty, and Students
- Each user has role, skills, and profile data
- Primary key: user_id

**Jobs Table (10 seconds)**
- Job postings with status, requirements, deadlines
- Created by TPO users
- Primary key: job_id

**Applications Table (10 seconds)**
- Links students to jobs they applied for
- Foreign keys: student_id → users, job_id → jobs
- Tracks application status

**AI Matches Table (10 seconds)**
- Stores AI-generated job matches with scores
- Links students to compatible jobs
- Includes match percentage and matched skills"

## **Supporting Tables (40 seconds)**
*"Additional tables:*

**Job Events (10 seconds)**
- Tests, interviews scheduled for jobs
- Links to jobs table via job_id
- Includes date, time, location

**Shortlists (10 seconds)**
- Students selected for interview rounds
- Links to jobs and users
- Tracks selection status

**Notifications (10 seconds)**
- Real-time updates for students
- Links to users via user_id
- Includes message, type, read status

**Opt-out Forms (10 seconds)**
- Students opting out of placement
- Links to users, reviewed by TPO
- Includes reason and approval status"

## **Table Connections (30 seconds)**
*"How they connect:*
- Users connect to Applications, Notifications, Opt-out Forms
- Jobs connect to Applications, Events, Shortlists, AI Matches
- Complete audit trail from user action to final outcome
- Every relationship properly defined with foreign keys"

## **Closing (10 seconds)**
*"This creates a complete ecosystem where every action is tracked, every relationship is maintained, and the entire placement process is managed efficiently."*

---

## 🎤 **Visual Aids (Show on Screen):**
1. **Table Structure** (30 seconds)
2. **Foreign Key Relationships** (30 seconds)
3. **Sample Data Connections** (30 seconds)
4. **Complete Flow Diagram** (30 seconds)

**Total: 2 minutes** - Focused on tables and connections! 🚀
