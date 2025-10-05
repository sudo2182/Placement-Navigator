# 🔗 Database Table Connections

## **Core User Connections**
**`users` table connects to:**
- `jobs` (posted_by) - TPO posts jobs
- `applications` (student_id) - Students apply for jobs
- `ai_matches` (student_id) - AI matches students to jobs
- `notifications` (student_id) - Students receive notifications
- `opt_out_forms` (student_id) - Students submit opt-out forms
- `course_registrations` (student_id) - Students register for courses
- `crash_courses` (faculty_id) - Faculty create courses
- `faculty_resources` (faculty_id) - Faculty upload resources
- `shortlists` (student_id) - Students get shortlisted
- `opt_out_forms` (reviewed_by) - TPO reviews opt-out forms

## **Job Management Connections**
**`jobs` table connects to:**
- `applications` (job_id) - Jobs receive applications
- `ai_matches` (job_id) - Jobs get AI matches
- `job_events` (job_id) - Jobs have scheduled events
- `shortlists` (job_id) - Jobs have shortlists
- `notifications` (related_job_id) - Jobs trigger notifications

## **Application Flow Connections**
**`applications` table connects to:**
- `users` (student_id) - Which student applied
- `jobs` (job_id) - Which job they applied for

## **AI System Connections**
**`ai_matches` table connects to:**
- `users` (student_id) - Which student was matched
- `jobs` (job_id) - Which job they were matched to

## **Recruitment Process Connections**
**`job_events` table connects to:**
- `jobs` (job_id) - Which job the event is for

**`shortlists` table connects to:**
- `jobs` (job_id) - Which job the shortlist is for
- `users` (student_id) - Which student was shortlisted

## **Student Services Connections**
**`opt_out_forms` table connects to:**
- `users` (student_id) - Which student submitted
- `users` (reviewed_by) - Which TPO reviewed it

**`course_registrations` table connects to:**
- `users` (student_id) - Which student registered
- `crash_courses` (course_id) - Which course they registered for

## **Faculty Services Connections**
**`crash_courses` table connects to:**
- `users` (faculty_id) - Which faculty created the course
- `course_registrations` (course_id) - Students who registered

**`faculty_resources` table connects to:**
- `users` (faculty_id) - Which faculty uploaded the resource

## **Communication Connections**
**`notifications` table connects to:**
- `users` (student_id) - Which student receives the notification
- `jobs` (related_job_id) - Which job the notification is about

**`bulletin_posts` table connects to:**
- `users` (posted_by) - Which user posted the bulletin

## **Key Connection Patterns:**
1. **Users are central** - Most tables connect to users
2. **Jobs drive recruitment** - Jobs connect to events, shortlists, applications
3. **Students have multiple paths** - Applications, courses, notifications, opt-out
4. **Faculty contribute** - Resources and courses
5. **Complete audit trail** - Every action is tracked through relationships
