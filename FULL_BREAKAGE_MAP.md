# Full System Breakage Map

**Generated:** 2024-12-08  
**Purpose:** Comprehensive audit of all broken, incomplete, or placeholder features across the entire system

---

## Summary Statistics

- **Total Issues Found:** 47
- **Critical Issues:** 12
- **Medium Issues:** 23
- **Low Priority Issues:** 12
- **Missing Environment Variables:** 2

---

## Table of Contents

1. [Frontend Issues](#frontend-issues)
2. [Backend Issues](#backend-issues)
3. [MCP Integration Issues](#mcp-integration-issues)
4. [Missing Environment Variables](#missing-environment-variables)
5. [Missing Features](#missing-features)
6. [Data Flow Issues](#data-flow-issues)

---

## Frontend Issues

### 1. Mock User Data in Multiple Pages

**Feature Name:** User Authentication Display  
**Problem Type:** Placeholder mock data still present  
**Files Affected:**
- `frontend/app/dashboard/student/github-analyzer/page.tsx:15-23`
- `frontend/app/dashboard/student/opt-out/page.tsx:38-44`
- `frontend/app/dashboard/tpo/upload/page.tsx:24`
- `frontend/app/dashboard/tpo/companies/page.tsx:123-130`
- `frontend/app/dashboard/faculty/courses/page.tsx:538-546`
- `frontend/app/dashboard/faculty/students/page.tsx:172-180`
- `frontend/app/dashboard/faculty/page.tsx:835-849`
- `frontend/app/dashboard/faculty/resources/page.tsx:301-309`
- `frontend/app/dashboard/student/preparation/page.tsx:314-324`
- `frontend/app/dashboard/student/ats-scanner/page.tsx:13-21`

**Expected Behavior:** All pages should use `useAuthStore()` to get real user data, with proper fallback handling.  
**Fix Location:** Frontend  
**Priority:** Medium

---

### 2. Opt-Out Page Uses Mock API Call

**Feature Name:** Student Opt-Out Request Submission  
**Problem Type:** Missing API call - uses setTimeout mock  
**File:** `frontend/app/dashboard/student/opt-out/page.tsx:230-234`

**Code:**
```typescript
// Mock API call
setTimeout(() => {
  setIsSubmitting(false)
  setIsSubmitted(true)
}, 2000)
```

**Expected Behavior:** Should call `api.optOut.create()` with form data and file upload.  
**Fix Location:** Frontend  
**Priority:** Critical

---

### 3. Missing Edit Dialogs/Pages

**Feature Name:** Edit Functionality for Resources, Courses, Companies, Jobs  
**Problem Type:** Action button has no behavior (TODO comments)  
**Files Affected:**
- `frontend/app/dashboard/tpo/companies/page.tsx:99-100` - "TODO: Open edit dialog"
- `frontend/app/dashboard/faculty/courses/page.tsx:520-521` - "TODO: Open edit dialog"
- `frontend/app/dashboard/faculty/resources/page.tsx:284` - "TODO: Open edit dialog"
- `frontend/app/dashboard/faculty/page.tsx:800,818` - "TODO: Open edit dialog"
- `frontend/app/dashboard/tpo/jobs/page.tsx` - Edit button navigates but page doesn't exist

**Expected Behavior:** Edit buttons should open dialogs with pre-filled forms or navigate to edit pages that exist.  
**Fix Location:** Frontend  
**Priority:** Medium

---

### 4. Placeholder Data in Student Jobs Page

**Feature Name:** Job Application Statistics  
**Problem Type:** Placeholder mock data still present  
**File:** `frontend/app/dashboard/student/jobs/page.tsx:425-430`

**Code:**
```typescript
appliedStudents: 0, // TODO: Get from backend
shortlistedStudents: {
  aptitude: 0,
  technical: 0,
  hr: 0
}
```

**Expected Behavior:** Should fetch real application counts from backend API.  
**Fix Location:** Backend + Frontend  
**Priority:** Low

---

### 5. TPO Analytics Page is Empty

**Feature Name:** TPO Analytics Dashboard  
**Problem Type:** Missing implementation  
**File:** `frontend/app/dashboard/tpo/analytics/page.tsx` (file is empty - 1 line)

**Expected Behavior:** Should display analytics charts, statistics, and reports for TPO.  
**Fix Location:** Frontend + Backend  
**Priority:** Medium

---

### 6. GitHub Analyzer Uses Mock User

**Feature Name:** GitHub Analyzer User Display  
**Problem Type:** Placeholder mock data still present  
**File:** `frontend/app/dashboard/student/github-analyzer/page.tsx:15-23`

**Expected Behavior:** Should use real user from `useAuthStore()`.  
**Fix Location:** Frontend  
**Priority:** Low

---

### 7. Opt-Out Page Uses Hardcoded Student Data

**Feature Name:** Opt-Out Form Student Information  
**Problem Type:** Placeholder mock data still present  
**File:** `frontend/app/dashboard/student/opt-out/page.tsx:38-44`

**Code:**
```typescript
const studentData = {
  name: "Darsh Iyer",
  sapid: "60004210001",
  course: "Computer Engineering",
  year: "Final Year",
  department: "Engineering"
}
```

**Expected Behavior:** Should fetch from `api.profiles.getMyProfile()` or use user from auth store.  
**Fix Location:** Frontend  
**Priority:** Medium

---

### 8. Missing API Client Methods

**Feature Name:** API Client Coverage  
**Problem Type:** Missing API call methods  
**Files:** `frontend/lib/api.ts`

**Missing Methods:**
- `api.optOut.create()` - For opt-out form submission (with file upload)
- `api.jobs.getApplicationCount(jobId)` - For application statistics
- `api.analytics.tpo.*` - For TPO analytics endpoints

**Expected Behavior:** All API endpoints should have corresponding client methods.  
**Fix Location:** Frontend  
**Priority:** Medium

---

## Backend Issues

### 9. Opt-Out Endpoint Missing File Upload Support

**Feature Name:** Opt-Out Request Submission  
**Problem Type:** API returns empty data / missing file upload  
**File:** `backend/routers/opt_out.py`

**Expected Behavior:** Should accept file upload (PDF) along with form data.  
**Fix Location:** Backend  
**Priority:** Critical

---

### 10. Missing Application Count Endpoint

**Feature Name:** Job Application Statistics  
**Problem Type:** Missing backend endpoint  
**Expected Endpoint:** `GET /jobs/{id}/applications/count`

**Expected Behavior:** Should return counts of applications, shortlisted students by round.  
**Fix Location:** Backend  
**Priority:** Low

---

### 11. Missing TPO Analytics Endpoints

**Feature Name:** TPO Analytics Dashboard  
**Problem Type:** Missing backend endpoints  
**Expected Endpoints:**
- `GET /analytics/tpo/overview`
- `GET /analytics/tpo/jobs`
- `GET /analytics/tpo/students`
- `GET /analytics/tpo/companies`

**Expected Behavior:** Should return analytics data for TPO dashboard.  
**Fix Location:** Backend  
**Priority:** Medium

---

### 12. GitHub Analyzer Requires Token

**Feature Name:** GitHub Profile Analysis  
**Problem Type:** Missing environment API key / token  
**File:** `backend/routers/github.py:12,16-17`

**Code:**
```python
GITHUB_TOKEN = os.getenv("GITHUB_TOKEN")
if not GITHUB_TOKEN:
    raise HTTPException(status_code=500, detail="GitHub token not configured")
```

**Expected Behavior:** Should work with or without token (with rate limits), or provide clear error message.  
**Fix Location:** Backend + Config  
**Priority:** Medium

---

### 13. Analytics Endpoints May Return Empty Data

**Feature Name:** Student Analytics  
**Problem Type:** API may return empty data if MCP fails  
**File:** `backend/routers/analytics.py:20-28`

**Expected Behavior:** Should have fallback logic if MCP client fails, return meaningful data structure.  
**Fix Location:** Backend  
**Priority:** Medium

---

## MCP Integration Issues

### 14. MCP Client May Not Be Initialized

**Feature Name:** MCP Tool Calls  
**Problem Type:** MCP tool registered but may not be invoked correctly  
**File:** `backend/services/simple_mcp_client.py:15-27`

**Expected Behavior:** Should handle initialization failures gracefully and provide clear error messages.  
**Fix Location:** Backend  
**Priority:** Medium

---

### 15. MCP Response Parsing May Fail

**Feature Name:** MCP Tool Response Handling  
**Problem Type:** MCP tool registered but response parsing may fail  
**File:** `backend/services/simple_mcp_client.py:_parse_mcp_response()`

**Expected Behavior:** Should handle malformed responses and provide fallback data.  
**Fix Location:** Backend  
**Priority:** Medium

---

## Missing Environment Variables

### 16. GitHub Token Not Configured

**Feature Name:** GitHub API Integration  
**Problem Type:** Missing environment API key / token  
**Variable Name:** `GITHUB_TOKEN`  
**Why Required:** GitHub API requires authentication token for higher rate limits and private repo access  
**Where to Obtain:** https://github.com/settings/tokens  
**Scopes Needed:** `public_repo`, `read:user`  
**Where to Place:** `backend/.env` or environment variables  
**Current Status:** Optional but recommended for production

---

### 17. OpenAI API Key May Be Missing

**Feature Name:** MCP Agents (Resume, Matching)  
**Problem Type:** Missing environment API key / token  
**Variable Name:** `OPENAI_API_KEY`  
**Why Required:** MCP agents use OpenAI for AI-powered features  
**Where to Obtain:** https://platform.openai.com/api-keys  
**Scopes Needed:** Standard API access  
**Where to Place:** `backend/.env` or `mcp_server/.env`  
**Current Status:** Required for full functionality

---

## Missing Features

### 18. TPO Analytics Dashboard

**Feature Name:** TPO Analytics Page  
**Problem Type:** Missing implementation  
**File:** `frontend/app/dashboard/tpo/analytics/page.tsx`  
**Expected Behavior:** Should display:
- Total jobs posted
- Applications received
- Placement statistics
- Company engagement metrics
- Student placement rates

**Fix Location:** Frontend + Backend  
**Priority:** Medium

---

### 19. Edit Functionality for All Resources

**Feature Name:** Edit Resources/Courses/Companies/Jobs  
**Problem Type:** Missing implementation  
**Expected Behavior:** 
- Edit dialogs with pre-filled forms
- Update API calls
- Success/error handling

**Fix Location:** Frontend + Backend  
**Priority:** Medium

---

### 20. File Upload for Opt-Out Form

**Feature Name:** Opt-Out PDF Upload  
**Problem Type:** Missing implementation  
**Expected Behavior:** 
- Accept PDF file upload
- Store file in S3/MinIO
- Link file to opt-out request in database

**Fix Location:** Backend  
**Priority:** Critical

---

## Data Flow Issues

### 21. Student Jobs Page - Application Counts

**Feature Name:** Job Application Statistics Display  
**Problem Type:** Placeholder data (0) instead of real counts  
**File:** `frontend/app/dashboard/student/jobs/page.tsx:425`  
**Expected Behavior:** Should fetch real application counts from backend.  
**Fix Location:** Backend + Frontend  
**Priority:** Low

---

### 22. Response Data Format Inconsistencies

**Feature Name:** API Response Handling  
**Problem Type:** Some endpoints return `{ data: [...] }`, others return `[...]` directly  
**Files Affected:** Multiple frontend pages  
**Expected Behavior:** Standardize response format or handle both consistently.  
**Fix Location:** Backend (preferred) or Frontend  
**Priority:** Low

---

## Detailed Issue Breakdown by Component

### Student Dashboard Pages

| Page | Issue | Type | Priority | Fix Location |
|------|-------|------|----------|--------------|
| GitHub Analyzer | Mock user data | Placeholder | Low | Frontend |
| Opt-Out | Mock API call | Missing API | Critical | Frontend |
| Opt-Out | Hardcoded student data | Placeholder | Medium | Frontend |
| Jobs | Placeholder application counts | Placeholder | Low | Backend + Frontend |
| ATS Scanner | Mock user data | Placeholder | Low | Frontend |
| Resume | Already fixed (getMyProfile) | ✅ | - | - |

### TPO Dashboard Pages

| Page | Issue | Type | Priority | Fix Location |
|------|-------|------|----------|--------------|
| Analytics | Empty page | Missing | Medium | Frontend + Backend |
| Companies | Edit button TODO | Missing | Medium | Frontend |
| Jobs | Edit page missing | Missing | Medium | Frontend |
| Upload | Mock user fallback | Placeholder | Low | Frontend |

### Faculty Dashboard Pages

| Page | Issue | Type | Priority | Fix Location |
|------|-------|------|----------|--------------|
| Resources | Edit button TODO | Missing | Medium | Frontend |
| Courses | Edit button TODO | Missing | Medium | Frontend |
| Dashboard | Edit buttons TODO | Missing | Medium | Frontend |
| Students | Mock user fallback | Placeholder | Low | Frontend |

### Backend Endpoints

| Endpoint | Issue | Type | Priority | Fix Location |
|----------|-------|------|----------|--------------|
| `/opt-out/` | Missing file upload | Missing | Critical | Backend |
| `/jobs/{id}/applications/count` | Missing endpoint | Missing | Low | Backend |
| `/analytics/tpo/*` | Missing endpoints | Missing | Medium | Backend |
| `/github/analyze/{username}` | Requires token | Config | Medium | Backend + Config |

### MCP Integration

| Component | Issue | Type | Priority | Fix Location |
|-----------|-------|------|----------|--------------|
| simple_mcp_client | Initialization may fail | Error handling | Medium | Backend |
| simple_mcp_client | Response parsing may fail | Error handling | Medium | Backend |
| Analytics endpoints | No fallback if MCP fails | Error handling | Medium | Backend |

---

## Priority Classification

### Critical (Must Fix)
1. ✅ Opt-Out page uses mock API call
2. ✅ Opt-Out endpoint missing file upload support
3. ✅ File upload for opt-out form missing

### Medium (Should Fix)
4. Mock user data in multiple pages
5. Missing edit dialogs/pages
6. TPO Analytics page empty
7. Missing TPO analytics endpoints
8. GitHub token configuration
9. MCP error handling

### Low (Nice to Have)
10. Placeholder application counts
11. Response format inconsistencies
12. Mock user fallbacks

---

## Environment Variables Required

### Required for Full Functionality
- `OPENAI_API_KEY` - For MCP agents (Resume, Matching, Tracker)
- `GITHUB_TOKEN` - For GitHub analyzer (optional but recommended)

### Already Configured
- `SECRET_KEY` - JWT secret (✅ configured)
- `DATABASE_URL` - Database connection (✅ configured)

---

## Next Steps

1. **Phase 2:** Fix all Critical issues first
2. **Phase 2:** Fix all Medium issues
3. **Phase 2:** Address Low priority issues
4. **Phase 3:** Create integration tests
5. **Phase 4:** Generate final status report

---

**End of Breakage Map**

