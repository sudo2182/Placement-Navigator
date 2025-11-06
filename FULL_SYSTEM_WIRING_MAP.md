# Full System Wiring Map

**Generated:** 2024-12-08  
**Status:** In Progress - Comprehensive Fix Required

---

## Executive Summary

This document catalogs all hardcoded data, dead buttons, placeholder sections, and missing API integrations across the entire codebase. Each issue is tracked with file path, line numbers, description, required fix, and dependencies.

**Total Issues Found:** 50+  
**Critical Issues:** 35+  
**Estimated Fix Time:** 4-6 hours

---

## Table of Contents

1. [TPO Dashboard Pages](#tpo-dashboard-pages)
2. [Faculty Dashboard Pages](#faculty-dashboard-pages)
3. [Student Dashboard Pages](#student-dashboard-pages)
4. [Missing Backend Endpoints](#missing-backend-endpoints)
5. [Dead Buttons](#dead-buttons)
6. [Hardcoded Data](#hardcoded-data)
7. [Placeholder Sections](#placeholder-sections)

---

## TPO Dashboard Pages

### 1. TPO Main Dashboard (`frontend/app/dashboard/tpo/page.tsx`)

#### Issue 1.1: Hardcoded Job Postings
- **File:** `frontend/app/dashboard/tpo/page.tsx`
- **Lines:** 56-123
- **Problem:** `jobPostings` array is hardcoded with 3 mock jobs
- **Required Fix:**
  - Replace with `api.jobs.list()` call in `useEffect`
  - Add loading/error states
  - Transform backend response to match UI format
- **Dependencies:** `api.jobs.list()` exists ✅
- **Priority:** HIGH

#### Issue 1.2: JobPostingForm Submit Handler
- **File:** `frontend/app/dashboard/tpo/page.tsx`
- **Lines:** 181-207
- **Problem:** `handleSubmit` shows alert instead of calling API
- **Required Fix:**
  - Replace `setTimeout` + `alert` with `api.jobs.create(formData)`
  - Add error handling
  - Refresh job list after success
- **Dependencies:** `api.jobs.create()` exists ✅
- **Priority:** HIGH

#### Issue 1.3: StudentDataUpload Handler
- **File:** `frontend/app/dashboard/tpo/page.tsx`
- **Lines:** 449-463
- **Problem:** `handleUpload` shows alert instead of uploading file
- **Required Fix:**
  - Create `api.profiles.bulkUpload()` method
  - Create backend endpoint `POST /profiles/bulk-upload`
  - Handle CSV/Excel parsing
- **Dependencies:** Need new backend endpoint
- **Priority:** MEDIUM

#### Issue 1.4: Hardcoded Stats
- **File:** `frontend/app/dashboard/tpo/page.tsx`
- **Lines:** 773-820
- **Problem:** Stats calculated from hardcoded `jobPostings` array
- **Required Fix:**
  - Calculate from real API data
  - Or create stats endpoint `GET /analytics/tpo/stats`
- **Dependencies:** Jobs API or stats endpoint
- **Priority:** MEDIUM

#### Issue 1.5: Mock TPO Data
- **File:** `frontend/app/dashboard/tpo/page.tsx`
- **Lines:** 47-53
- **Problem:** `tpoData` object is hardcoded
- **Required Fix:**
  - Fetch from `api.profiles.me()` or use auth store
- **Dependencies:** Profile API exists ✅
- **Priority:** LOW

#### Issue 1.6: Dead Buttons in Job Cards
- **File:** `frontend/app/dashboard/tpo/page.tsx`
- **Lines:** 733-745
- **Problem:** View, Edit, Delete buttons have no handlers
- **Required Fix:**
  - View: Navigate to job detail page or open dialog
  - Edit: Open edit dialog with job data
  - Delete: Call `api.jobs.delete(id)` with confirmation
- **Dependencies:** Navigation, dialog components, delete API
- **Priority:** HIGH

#### Issue 1.7: Roadmap Status Update
- **File:** `frontend/app/dashboard/tpo/page.tsx`
- **Lines:** 575-583
- **Problem:** `updateRoadmapStatus` and `uploadShortlist` show alerts
- **Required Fix:**
  - Create `api.jobEvents.update()` for status updates
  - Create `api.shortlists.upload()` for shortlist uploads
- **Dependencies:** Job events API exists ✅, Shortlists API exists ✅
- **Priority:** HIGH

---

### 2. TPO Jobs Page (`frontend/app/dashboard/tpo/jobs/page.tsx`)

#### Issue 2.1: Hardcoded Jobs Array
- **File:** `frontend/app/dashboard/tpo/jobs/page.tsx`
- **Lines:** 25-65
- **Problem:** `initialJobs` array is hardcoded
- **Required Fix:**
  - Replace with `api.jobs.list()` in `useEffect`
  - Add loading/error states
- **Dependencies:** `api.jobs.list()` exists ✅
- **Priority:** HIGH

#### Issue 2.2: Create Job Dialog
- **File:** `frontend/app/dashboard/tpo/jobs/page.tsx`
- **Lines:** 91-144
- **Problem:** Dialog form has no submit handler - "Publish" button does nothing
- **Required Fix:**
  - Add form state and `onSubmit` handler
  - Call `api.jobs.create()` on submit
  - Close dialog and refresh list
- **Dependencies:** `api.jobs.create()` exists ✅
- **Priority:** HIGH

#### Issue 2.3: Dead Action Buttons
- **File:** `frontend/app/dashboard/tpo/jobs/page.tsx`
- **Lines:** 223-226
- **Problem:** View, Edit, Close buttons have no onClick handlers
- **Required Fix:**
  - View: Navigate to `/dashboard/tpo/jobs/${job.id}` or open detail dialog
  - Edit: Open edit dialog prefilled with job data
  - Close: Call `api.jobs.update(id, {is_active: false})` or delete
- **Dependencies:** Navigation, update/delete API
- **Priority:** HIGH

#### Issue 2.4: Hardcoded Stats
- **File:** `frontend/app/dashboard/tpo/jobs/page.tsx`
- **Lines:** 236-257
- **Problem:** Stats calculated from hardcoded `jobs` state
- **Required Fix:**
  - Calculate from real API data (already fixed if jobs are fetched)
- **Dependencies:** Jobs API
- **Priority:** LOW (fixed when jobs are fetched)

---

### 3. TPO Upload Page (`frontend/app/dashboard/tpo/upload/page.tsx`)

#### Issue 3.1: Hardcoded Demo Data
- **File:** `frontend/app/dashboard/tpo/upload/page.tsx`
- **Lines:** 41-444
- **Problem:** `demoData` array with 10+ hardcoded students
- **Required Fix:**
  - Remove `demoData` constant
  - Load from API or show empty state
- **Dependencies:** Profiles API
- **Priority:** HIGH

#### Issue 3.2: Process Upload Handler
- **File:** `frontend/app/dashboard/tpo/upload/page.tsx`
- **Lines:** 460-473
- **Problem:** `processUpload` shows `demoData` instead of uploading
- **Required Fix:**
  - Create `api.profiles.bulkUpload(file)` method
  - Create backend endpoint `POST /profiles/bulk-upload`
  - Parse CSV and create/update users
- **Dependencies:** New backend endpoint needed
- **Priority:** HIGH

#### Issue 3.3: Download Template Button
- **File:** `frontend/app/dashboard/tpo/upload/page.tsx`
- **Lines:** 504
- **Problem:** Shows alert instead of downloading template
- **Required Fix:**
  - Generate CSV template and trigger download
  - Or serve from backend `GET /profiles/template`
- **Dependencies:** Template generation
- **Priority:** LOW

#### Issue 3.4: Students Loading Fallback
- **File:** `frontend/app/dashboard/tpo/upload/page.tsx`
- **Lines:** 476-493
- **Problem:** On API error, falls back to `demoData`
- **Required Fix:**
  - Show error message instead
  - Remove `demoData` fallback
- **Dependencies:** Error handling
- **Priority:** MEDIUM

---

### 4. TPO Companies Page (`frontend/app/dashboard/tpo/companies/page.tsx`)

#### Issue 4.1: Hardcoded Companies
- **File:** `frontend/app/dashboard/tpo/companies/page.tsx`
- **Lines:** 15-19
- **Problem:** `initialCompanies` array is hardcoded
- **Required Fix:**
  - Create `api.companies.list()` method
  - Create backend endpoint `GET /companies/`
  - Create Company model in database
- **Dependencies:** New companies feature needed
- **Priority:** MEDIUM

#### Issue 4.2: Add Company Dialog
- **File:** `frontend/app/dashboard/tpo/companies/page.tsx`
- **Lines:** 31-67
- **Problem:** "Save" button has no handler - does nothing
- **Required Fix:**
  - Add form state and submit handler
  - Create `api.companies.create()` method
  - Create backend endpoint `POST /companies/`
- **Dependencies:** New companies feature needed
- **Priority:** MEDIUM

#### Issue 4.3: Search/Filter Buttons
- **File:** `frontend/app/dashboard/tpo/companies/page.tsx`
- **Lines:** 73-87
- **Problem:** Search and Filter inputs don't filter anything (filtering is client-side but data is static)
- **Required Fix:**
  - Implement filtering once data is from API
- **Dependencies:** Companies API
- **Priority:** LOW

---

## Faculty Dashboard Pages

### 5. Faculty Main Dashboard (`frontend/app/dashboard/faculty/page.tsx`)

#### Issue 5.1: Hardcoded Faculty Data
- **File:** `frontend/app/dashboard/faculty/page.tsx`
- **Lines:** 44-53
- **Problem:** `facultyData` object is hardcoded
- **Required Fix:**
  - Fetch from `api.profiles.me()` or use auth store
- **Dependencies:** Profile API exists ✅
- **Priority:** LOW

#### Issue 5.2: Hardcoded Resources
- **File:** `frontend/app/dashboard/faculty/page.tsx`
- **Lines:** 56-77
- **Problem:** `postedResources` array is hardcoded
- **Required Fix:**
  - Replace with `api.resources.list(facultyId)` in `useEffect`
- **Dependencies:** `api.resources.list()` exists ✅
- **Priority:** HIGH

#### Issue 5.3: Hardcoded Courses
- **File:** `frontend/app/dashboard/faculty/page.tsx`
- **Lines:** 80-103
- **Problem:** `scheduledCourses` array is hardcoded
- **Required Fix:**
  - Replace with `api.courses.list(facultyId)` in `useEffect`
- **Dependencies:** `api.courses.list()` exists ✅
- **Priority:** HIGH

#### Issue 5.4: ResourceForm Submit
- **File:** `frontend/app/dashboard/faculty/page.tsx`
- **Lines:** 152-168
- **Problem:** Shows alert instead of calling API
- **Required Fix:**
  - Call `api.resources.create(formData)`
  - Refresh resources list
- **Dependencies:** `api.resources.create()` exists ✅
- **Priority:** HIGH

#### Issue 5.5: CourseSchedulerForm Submit
- **File:** `frontend/app/dashboard/faculty/page.tsx`
- **Lines:** 274-298
- **Problem:** Shows alert instead of calling API
- **Required Fix:**
  - Call `api.courses.create(formData)`
  - Refresh courses list
- **Dependencies:** `api.courses.create()` exists ✅
- **Priority:** HIGH

#### Issue 5.6: Resource Edit/Delete Buttons
- **File:** `frontend/app/dashboard/faculty/page.tsx`
- **Lines:** 546-551
- **Problem:** Edit and Delete buttons have no handlers
- **Required Fix:**
  - Edit: Open edit dialog with resource data
  - Delete: Call `api.resources.delete(id)` with confirmation
- **Dependencies:** `api.resources.update()` and `delete()` exist ✅
- **Priority:** HIGH

#### Issue 5.7: RegisteredStudentsModal
- **File:** `frontend/app/dashboard/faculty/page.tsx`
- **Lines:** 450-516
- **Problem:** Hardcoded `registeredStudents` array
- **Required Fix:**
  - Replace with `api.courses.getRegistrations(courseId)`
- **Dependencies:** `api.courses.getRegistrations()` exists ✅
- **Priority:** HIGH

#### Issue 5.8: Export Student List
- **File:** `frontend/app/dashboard/faculty/page.tsx`
- **Lines:** 458-461
- **Problem:** Shows alert instead of exporting
- **Required Fix:**
  - Generate CSV from student data and trigger download
- **Dependencies:** CSV generation
- **Priority:** LOW

---

### 6. Faculty Students Page (`frontend/app/dashboard/faculty/students/page.tsx`)

#### Issue 6.1: Hardcoded Courses
- **File:** `frontend/app/dashboard/faculty/students/page.tsx`
- **Lines:** 22-26
- **Problem:** `courses` array is hardcoded
- **Required Fix:**
  - Replace with `api.courses.list(facultyId)`
- **Dependencies:** `api.courses.list()` exists ✅
- **Priority:** HIGH

#### Issue 6.2: Hardcoded Students
- **File:** `frontend/app/dashboard/faculty/students/page.tsx`
- **Lines:** 28-34
- **Problem:** `allStudents` array is hardcoded
- **Required Fix:**
  - Replace with `api.courses.getRegistrations(courseId)` when course selected
- **Dependencies:** `api.courses.getRegistrations()` exists ✅
- **Priority:** HIGH

#### Issue 6.3: Export List Button
- **File:** `frontend/app/dashboard/faculty/students/page.tsx`
- **Lines:** 47-49
- **Problem:** Shows alert instead of exporting
- **Required Fix:**
  - Generate CSV and trigger download
- **Dependencies:** CSV generation
- **Priority:** LOW

#### Issue 6.4: Mail All Button
- **File:** `frontend/app/dashboard/faculty/students/page.tsx`
- **Lines:** 51-53
- **Problem:** Shows alert instead of opening mail composer
- **Required Fix:**
  - Open mailto link with all student emails
- **Dependencies:** Mailto link generation
- **Priority:** LOW

---

## Student Dashboard Pages

### 7. Student Preparation Page (`frontend/app/dashboard/student/preparation/page.tsx`)

#### Issue 7.1: Hardcoded Resources
- **File:** `frontend/app/dashboard/student/preparation/page.tsx`
- **Lines:** 41-94
- **Problem:** `initialResourcesData` array is hardcoded
- **Status:** ⚠️ **PARTIALLY FIXED** - Code exists to fetch from API but initial data still hardcoded
- **Required Fix:**
  - Remove `initialResourcesData` constant
  - Ensure `useEffect` properly fetches and displays API data
- **Dependencies:** `api.resources.list()` exists ✅
- **Priority:** MEDIUM

#### Issue 7.2: Hardcoded Courses
- **File:** `frontend/app/dashboard/student/preparation/page.tsx`
- **Lines:** 97-170
- **Problem:** `initialCoursesData` array is hardcoded
- **Status:** ⚠️ **PARTIALLY FIXED** - Code exists to fetch from API but initial data still hardcoded
- **Required Fix:**
  - Remove `initialCoursesData` constant
  - Ensure `useEffect` properly fetches and displays API data
- **Dependencies:** `api.courses.list()` exists ✅
- **Priority:** MEDIUM

---

## Missing Backend Endpoints

### 8. Companies Endpoints

#### Issue 8.1: No Companies Router
- **Problem:** No backend router for companies
- **Required Fix:**
  - Create `backend/routers/companies.py`
  - Implement `GET /companies/`, `POST /companies/`, `PUT /companies/{id}`, `DELETE /companies/{id}`
  - Create Company model in `shared/models.py`
  - Register router in `backend/main.py`
- **Dependencies:** Database migration
- **Priority:** MEDIUM

### 9. Bulk Upload Endpoint

#### Issue 9.1: No Bulk Upload Endpoint
- **Problem:** No endpoint for CSV/Excel bulk student upload
- **Required Fix:**
  - Create `POST /profiles/bulk-upload` endpoint
  - Parse CSV/Excel file
  - Create/update users in batch
  - Return upload results
- **Dependencies:** CSV/Excel parsing library (pandas or csv)
- **Priority:** MEDIUM

### 10. Job Update/Delete Endpoints

#### Issue 10.1: Job Update Endpoint
- **Problem:** `PUT /jobs/{id}` may not exist or not support all fields
- **Required Fix:**
  - Verify `backend/routers/jobs.py` has update endpoint
  - Ensure it supports `is_active` flag for closing jobs
- **Dependencies:** Jobs router
- **Priority:** HIGH

#### Issue 10.2: Job Delete Endpoint
- **Problem:** `DELETE /jobs/{id}` may not exist
- **Required Fix:**
  - Verify `backend/routers/jobs.py` has delete endpoint
  - Ensure proper authorization (TPO only)
- **Dependencies:** Jobs router
- **Priority:** HIGH

---

## Dead Buttons Summary

| Page | Button | Line | Status | Fix Required |
|------|--------|------|--------|--------------|
| TPO Dashboard | View Details | 733 | ❌ Dead | Navigate or open dialog |
| TPO Dashboard | Edit | 737 | ❌ Dead | Open edit dialog |
| TPO Dashboard | Delete | 742 | ❌ Dead | Call `api.jobs.delete(id)` |
| TPO Jobs | View | 223 | ❌ Dead | Navigate to detail |
| TPO Jobs | Edit | 224 | ❌ Dead | Open edit dialog |
| TPO Jobs | Close | 225 | ❌ Dead | Call `api.jobs.update(id, {is_active: false})` |
| TPO Jobs | Publish | 139 | ❌ Dead | Submit form to `api.jobs.create()` |
| TPO Companies | Save | 63 | ❌ Dead | Submit form to `api.companies.create()` |
| Faculty Dashboard | Edit Resource | 546 | ❌ Dead | Open edit dialog |
| Faculty Dashboard | Delete Resource | 549 | ❌ Dead | Call `api.resources.delete(id)` |
| Faculty Dashboard | Export List | 484 | ❌ Dead | Generate and download CSV |

---

## Hardcoded Data Summary

| Page | Data Type | Lines | Status |
|------|-----------|-------|--------|
| TPO Dashboard | Job Postings | 56-123 | ❌ Hardcoded |
| TPO Dashboard | TPO Data | 47-53 | ❌ Hardcoded |
| TPO Jobs | Jobs Array | 25-65 | ❌ Hardcoded |
| TPO Upload | Demo Data | 41-444 | ❌ Hardcoded |
| TPO Companies | Companies | 15-19 | ❌ Hardcoded |
| Faculty Dashboard | Faculty Data | 44-53 | ❌ Hardcoded |
| Faculty Dashboard | Resources | 56-77 | ❌ Hardcoded |
| Faculty Dashboard | Courses | 80-103 | ❌ Hardcoded |
| Faculty Dashboard | Registered Students | 452-456 | ❌ Hardcoded |
| Faculty Students | Courses | 22-26 | ❌ Hardcoded |
| Faculty Students | Students | 28-34 | ❌ Hardcoded |
| Student Preparation | Resources | 41-94 | ⚠️ Partially Fixed |
| Student Preparation | Courses | 97-170 | ⚠️ Partially Fixed |

---

## Priority Fix Order

### Phase 1: Critical (High Priority)
1. TPO Jobs page - Wire jobs list and create job
2. TPO Dashboard - Wire job list and create job form
3. Faculty Dashboard - Wire resources and courses
4. TPO Upload - Remove demo data fallback

### Phase 2: Important (Medium Priority)
5. TPO Companies - Create companies feature
6. TPO Upload - Create bulk upload endpoint
7. All Edit/Delete buttons - Wire handlers
8. Student Preparation - Remove hardcoded initial data

### Phase 3: Polish (Low Priority)
9. Export functionality - CSV generation
10. Mail functionality - Mailto links
11. Template downloads - File generation
12. Mock user data - Fetch from auth store

---

## Testing Requirements

After fixes, verify:
- [ ] All buttons perform real actions
- [ ] All data comes from API
- [ ] Loading states show during API calls
- [ ] Error states show on API failures
- [ ] Empty states show when no data
- [ ] Success feedback shows after mutations
- [ ] Data refreshes after create/update/delete

---

**End of Wiring Map**

