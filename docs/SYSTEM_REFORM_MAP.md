# SYSTEM REFORM MAP
## Complete List of Hardcoded/Mocked Data to Replace

**Generated:** 2024-12-08  
**Purpose:** Upgrade from prototype to production-ready system

---

## 1. FRONTEND HARDCODED DATA

### 1.1 ATS Scanner Page
**File:** `frontend/app/dashboard/student/ats-scanner/page.tsx`
- **Lines:** 37-116
- **What's Hardcoded:**
  - `setTimeout()` mock delay (line 42)
  - Hardcoded score: `mockScore = 85` (line 43)
  - Hardcoded recommendations array (lines 47-52)
  - Hardcoded improvements array (lines 53-58)
  - Hardcoded extracted resume data (name, email, phone, skills, education, experience, projects, certifications) (lines 59-113)
- **What Should Replace It:**
  - Call `/api/v1/ats/scan` endpoint with uploaded file
  - Use real ATS service response
- **Service/Endpoint:** `POST /api/v1/ats/scan` (already exists)
- **Difficulty:** Easy
- **Status:** Endpoint exists, needs frontend wiring

---

### 1.2 Job Fit Analyzer Page
**File:** `frontend/app/dashboard/student/job-fit/page.tsx`
- **Lines:** 19-122
- **What's Hardcoded:**
  - `mockUser` object (lines 19-27)
  - `setTimeout()` mock delay (line 44)
  - Hardcoded `summary` object (role, company, skills, requirements) (lines 45-59)
  - Hardcoded `adityaProfile` (resume highlights, GitHub signals, skills) (lines 61-84)
  - Hardcoded `matched` and `missing` skills arrays (lines 87-97)
  - Hardcoded `fitScore = 78` (line 99)
  - Hardcoded `recommendations` array (lines 101-117)
- **What Should Replace It:**
  - Call new `/api/v1/job-fit/analyze` endpoint with JD text
  - Use matching_service to compare user profile + GitHub data with JD
  - Return real match scores, skill gaps, recommendations
- **Service/Endpoint:** Create `POST /api/v1/job-fit/analyze`
- **Difficulty:** Medium
- **Status:** Needs new endpoint + service integration

---

### 1.3 TPO Upload Page
**File:** `frontend/app/dashboard/tpo/upload/page.tsx`
- **Lines:** 40-444
- **What's Hardcoded:**
  - Massive `demoData` array with 20+ hardcoded student records (lines 41-444)
  - Each record has: sapid, name, branch, email, cgpa, backlogs, year, status, phone, city, skills, internships, linkedin, github, portfolio, resume, placementStatus, graduationYear
- **What Should Replace It:**
  - Load from database: `GET /api/v1/students/` or `/api/v1/profiles/`
  - Parse CSV uploads and store in database
- **Service/Endpoint:** Use existing `/api/v1/profiles/` endpoints
- **Difficulty:** Easy
- **Status:** Backend exists, needs frontend wiring

---

### 1.4 Student Jobs Page
**File:** `frontend/app/dashboard/student/jobs/page.tsx`
- **Lines:** 38-146
- **What's Hardcoded:**
  - `jobsData` array with 3 hardcoded jobs (Microsoft, Google, Amazon) (lines 39-146)
  - `studentData` object with hardcoded cgpa, branch, backlogs (lines 149-154)
- **What Should Replace It:**
  - Call `GET /api/v1/jobs/` to fetch real jobs
  - Get student profile from `GET /api/v1/profiles/me`
  - Calculate eligibility using real backend logic
- **Service/Endpoint:** `GET /api/v1/jobs/` (exists)
- **Difficulty:** Easy
- **Status:** Backend exists, needs frontend wiring

---

### 1.5 TPO Dashboard Jobs
**File:** `frontend/app/dashboard/tpo/jobs/page.tsx`
- **Lines:** 25-65
- **What's Hardcoded:**
  - `initialJobs` array with 3 hardcoded jobs (lines 25-65)
- **What Should Replace It:**
  - Call `GET /api/v1/jobs/` filtered by TPO role
- **Service/Endpoint:** `GET /api/v1/jobs/` (exists)
- **Difficulty:** Easy
- **Status:** Backend exists, needs frontend wiring

---

### 1.6 TPO Main Dashboard
**File:** `frontend/app/dashboard/tpo/page.tsx`
- **Lines:** 56-123
- **What's Hardcoded:**
  - `jobPostings` array with 3 hardcoded jobs (lines 56-123)
  - Mock functions with `setTimeout()` delays (lines 185-186, 457-458)
- **What Should Replace It:**
  - Call `GET /api/v1/jobs/` for job postings
  - Real API calls for create/update/delete operations
- **Service/Endpoint:** Use existing jobs endpoints
- **Difficulty:** Easy
- **Status:** Backend exists, needs frontend wiring

---

### 1.7 Student Preparation Page
**File:** `frontend/app/dashboard/student/preparation/page.tsx`
- **Lines:** 40-170
- **What's Hardcoded:**
  - `resourcesData` array with 4 hardcoded resources (lines 41-94)
  - `crashCoursesData` array with hardcoded courses (lines 96-170)
- **What Should Replace It:**
  - Call `GET /api/v1/resources/` for resources
  - Call `GET /api/v1/courses/` for courses
- **Service/Endpoint:** Both exist
- **Difficulty:** Easy
- **Status:** Backend exists, needs frontend wiring

---

### 1.8 Student Dashboard Main Page
**File:** `frontend/app/dashboard/student/page.tsx`
- **Lines:** 456-562
- **What's Hardcoded:**
  - `mockUser` object (lines 456-462)
  - Uses hardcoded user data instead of real auth
- **What Should Replace It:**
  - Use `useAuthStore()` to get real logged-in user
  - Remove mockUser, use `user` from auth store
- **Service/Endpoint:** Auth store already exists
- **Difficulty:** Easy
- **Status:** Just needs auth store integration

---

### 1.9 Auth Store Bypass
**File:** `frontend/store/auth.ts` and `frontend/src/store/auth.ts`
- **Lines:** 30-40
- **What's Hardcoded:**
  - Login function creates `dummyUser` and bypasses backend (lines 30-40)
  - Uses `'dev-bypass'` token instead of real JWT
- **What Should Replace It:**
  - Call `POST /api/v1/auth/login` with email/password
  - Store real JWT token from response
  - Use real user data from backend
- **Service/Endpoint:** `POST /api/v1/auth/login` (exists)
- **Difficulty:** Easy
- **Status:** Backend exists, remove bypass

---

## 2. BACKEND HARDCODED/MOCKED DATA

### 2.1 Matching Service (Partially Implemented)
**File:** `backend/services/matching_service.py`
- **Status:** Real implementation exists but may have fallback to simple matching
- **What's Hardcoded:**
  - Falls back to `SimpleMatchingService` if OpenAI not available
  - Simple matching uses rule-based scoring (not semantic)
- **What Should Replace It:**
  - Ensure OpenAI API key is configured (optional)
  - Use semantic embeddings when available
  - Keep rule-based fallback (this is acceptable)
- **Service:** Already implemented, needs OPENAI_API_KEY env var
- **Difficulty:** Easy (just needs env var)
- **Status:** Functional, optional enhancement

---

### 2.2 GitHub Analyzer
**File:** `backend/routers/github.py`
- **Status:** Fully implemented, needs GITHUB_TOKEN
- **What's Hardcoded:** Nothing
- **What's Needed:**
  - `GITHUB_TOKEN` environment variable
  - Real GitHub API calls (already implemented)
- **Service:** Fully functional, needs token
- **Difficulty:** Easy (just needs token)
- **Status:** Ready, needs GITHUB_TOKEN

---

### 2.3 ATS Service
**File:** `backend/services/ats_service.py`
- **Status:** Just created, fully local
- **What's Hardcoded:** Nothing (uses local heuristics)
- **What's Needed:** Nothing (works without API keys)
- **Service:** Fully functional
- **Difficulty:** N/A
- **Status:** ✅ Complete

---

### 2.4 Storage Service
**File:** `backend/services/storage_service.py`
- **Status:** Implemented, needs S3/MinIO config
- **What's Hardcoded:** Nothing
- **What's Needed:**
  - For AWS S3: `AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY`, `AWS_REGION`, `S3_BUCKET_NAME`
  - For MinIO: `USE_MINIO=true`, `MINIO_ENDPOINT`, `MINIO_ACCESS_KEY`, `MINIO_SECRET_KEY`, `S3_BUCKET_NAME`
- **Service:** Fully functional, needs config
- **Difficulty:** Easy (just needs env vars)
- **Status:** Ready, needs storage config

---

## 3. MISSING SERVICES/ENDPOINTS

### 3.1 Job Fit Analyzer Endpoint
**File:** `backend/routers/job_fit.py` (to be created)
- **What's Missing:**
  - `POST /api/v1/job-fit/analyze` endpoint
  - Takes JD text + user_id
  - Calls matching_service to compare user profile with JD
  - Returns fit score, matched/missing skills, recommendations
- **What Should Replace It:**
  - Create new router file
  - Integrate with matching_service
  - Use GitHub analyzer if username available
- **Service/Endpoint:** To be created
- **Difficulty:** Medium
- **Status:** ❌ Not created

---

### 3.2 Resume Parser Service
**File:** `backend/services/resume_parser.py` (to be created)
- **What's Missing:**
  - Structured resume extraction (name, email, education, skills, experience, projects)
  - Currently only extracts raw text via pdf_extractor
  - Need to parse structured JSON from text
- **What Should Replace It:**
  - Create resume_parser.py
  - Use regex + heuristics for local parsing (no API key needed)
  - Optional: Use OpenAI/Gemini for better extraction if API key available
- **Service:** To be created
- **Difficulty:** Medium
- **Status:** ❌ Not created

---

### 3.3 PDF Report Generator
**File:** `backend/services/pdf_report_generator.py` (to be created)
- **What's Missing:**
  - Generate downloadable PDF reports for:
    - ATS scan results
    - Job fit analysis
    - Resume feedback
- **What Should Replace It:**
  - Create pdf_report_generator.py
  - Use ReportLab or pdfkit
  - Generate formatted PDFs with scores, recommendations, extracted data
- **Service:** To be created
- **Difficulty:** Medium
- **Status:** ❌ Not created

---

## 4. API ENDPOINTS NEEDING FRONTEND INTEGRATION

### 4.1 ATS Scanner
- **Endpoint:** `POST /api/v1/ats/scan` ✅ Exists
- **Frontend File:** `frontend/app/dashboard/student/ats-scanner/page.tsx`
- **Status:** Needs frontend wiring

### 4.2 Jobs List
- **Endpoint:** `GET /api/v1/jobs/` ✅ Exists
- **Frontend Files:** 
  - `frontend/app/dashboard/student/jobs/page.tsx`
  - `frontend/app/dashboard/tpo/jobs/page.tsx`
  - `frontend/app/dashboard/tpo/page.tsx`
- **Status:** Needs frontend wiring

### 4.3 Profiles/Students
- **Endpoint:** `GET /api/v1/profiles/` ✅ Exists
- **Frontend File:** `frontend/app/dashboard/tpo/upload/page.tsx`
- **Status:** Needs frontend wiring

### 4.4 Resources
- **Endpoint:** `GET /api/v1/resources/` ✅ Exists
- **Frontend File:** `frontend/app/dashboard/student/preparation/page.tsx`
- **Status:** Needs frontend wiring

### 4.5 Courses
- **Endpoint:** `GET /api/v1/courses/` ✅ Exists
- **Frontend File:** `frontend/app/dashboard/student/preparation/page.tsx`
- **Status:** Needs frontend wiring

### 4.6 GitHub Analyzer
- **Endpoint:** `GET /api/v1/github/analyze/{username}` ✅ Exists
- **Frontend File:** `frontend/app/dashboard/student/github-analyzer/page.tsx`
- **Status:** Needs frontend wiring

---

## 5. ENVIRONMENT VARIABLES REQUIRED

### 5.1 Database
- `DATABASE_URL` - PostgreSQL connection string
- **Where Used:** `shared/models.py`, `backend/auth.py`
- **Status:** ✅ Configured

### 5.2 Authentication
- `JWT_SECRET_KEY` - Secret for JWT token signing
- **Where Used:** `backend/auth.py`
- **Status:** ✅ Configured

### 5.3 OpenAI (Optional)
- `OPENAI_API_KEY` - For AI-powered matching and resume parsing
- **Where Used:** `backend/services/matching_service.py`
- **Status:** Optional, has fallback

### 5.4 GitHub (Optional)
- `GITHUB_TOKEN` - Personal Access Token for GitHub API
- **Where Used:** `backend/routers/github.py`
- **Status:** Optional, endpoint fails gracefully if missing

### 5.5 Storage (Optional)
**AWS S3:**
- `AWS_ACCESS_KEY_ID`
- `AWS_SECRET_ACCESS_KEY`
- `AWS_REGION`
- `S3_BUCKET_NAME`

**Or MinIO (Local):**
- `USE_MINIO=true`
- `MINIO_ENDPOINT`
- `MINIO_ACCESS_KEY`
- `MINIO_SECRET_KEY`
- `MINIO_REGION`
- `S3_BUCKET_NAME`

- **Where Used:** `backend/services/storage_service.py`
- **Status:** Optional, uploads fail gracefully if missing

---

## 6. SUMMARY BY PRIORITY

### High Priority (Core Features)
1. ✅ ATS Scanner endpoint - **DONE**, needs frontend wiring
2. ❌ Job Fit Analyzer endpoint - **NOT CREATED**, needs implementation
3. ✅ Jobs list endpoint - **EXISTS**, needs frontend wiring
4. ✅ Auth login - **EXISTS**, remove bypass in frontend

### Medium Priority (Data Sources)
5. ✅ Profiles/Students - **EXISTS**, needs frontend wiring
6. ✅ Resources - **EXISTS**, needs frontend wiring
7. ✅ Courses - **EXISTS**, needs frontend wiring
8. ✅ GitHub Analyzer - **EXISTS**, needs frontend wiring

### Low Priority (Enhancements)
9. ❌ Resume Parser Service - **NOT CREATED**, optional enhancement
10. ❌ PDF Report Generator - **NOT CREATED**, optional feature
11. ⚠️ Matching Service - **EXISTS**, needs OPENAI_API_KEY for full power
12. ⚠️ Storage Service - **EXISTS**, needs S3/MinIO config for uploads

---

## 7. DIFFICULTY ASSESSMENT

- **Easy:** Frontend wiring to existing endpoints (8 files)
- **Medium:** Create Job Fit Analyzer endpoint (1 endpoint)
- **Medium:** Create Resume Parser service (optional)
- **Medium:** Create PDF Report Generator (optional)
- **Easy:** Environment variable configuration (documentation)

---

**Next Steps:**
1. Wire frontend to existing endpoints (Easy)
2. Create Job Fit Analyzer endpoint (Medium)
3. Test E2E flows (Easy)
4. Create optional services (Medium)

