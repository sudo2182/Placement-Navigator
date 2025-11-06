# WORKSPACE STRUCTURE REORGANIZATION PLAN

## Current Status Analysis

### ✅ MCP Server Status
**MCP IS BEING USED!** 
- `simple_mcp_client.py` is actively used in:
  - `backend/routers/jobs.py` - For resume generation and batch processing
  - `backend/routers/analytics.py` - For student progress analytics
- `mcp_client.py` (full version) - NOT USED (only simple_mcp_client is used)

### 📁 Proposed Structure

```
Placement-Navigator/
├── backend/                    # Backend API (FastAPI)
│   ├── routers/               # API endpoints
│   ├── services/              # Business logic services
│   ├── alembic/               # Database migrations
│   ├── logs/                  # Application logs
│   ├── main.py                # Main application entry
│   ├── auth.py                # Authentication
│   ├── schemas.py             # Pydantic schemas
│   ├── requirements.txt       # Python dependencies
│   └── .env                   # Environment variables
│
├── frontend/                   # Frontend (Next.js)
│   ├── app/                   # Next.js app directory
│   ├── components/            # React components
│   ├── lib/                   # Utilities & API client
│   ├── store/                 # State management
│   └── package.json           # Node dependencies
│
├── shared/                     # Shared code (database models)
│   ├── models.py              # SQLAlchemy models
│   └── enhanced_models.py     # Enhanced models
│
├── mcp_server/                 # MCP Server (AI agents)
│   ├── agents/                # AI agents
│   ├── placement_server.py    # Full MCP server
│   └── simple_mcp_server.py   # Simplified MCP server (USED)
│
├── tests/                      # Test files
│   ├── test_integration.py
│   ├── test_matching.py
│   └── test_resume_upload.py
│
├── docs/                       # Documentation (NEW - to organize)
│   ├── API_CONNECTION_CHECK.md
│   ├── FINAL_STATUS.md
│   ├── IMPLEMENTATION_PROGRESS.md
│   ├── SYSTEM_REFORM_MAP.md
│   ├── SYSTEM_COMPLETE.md
│   ├── SUPABASE_ACCESS.md
│   ├── TABLE_CONNECTIONS.md
│   ├── TABLES_CONNECTION_SCRIPT.md
│   ├── TESTING_CHECKLIST.md
│   └── PROJECT_DESCRIPTION.md
│
├── scripts/                    # Utility scripts (NEW - to organize)
│   ├── seed_database.py
│   ├── migrate_database.py
│   ├── setup_postgresql.sh
│   ├── start_services.sh
│   ├── run_tests.sh
│   └── test_api_connectivity.py
│
├── archive/                    # Unused/old files (NEW - to organize)
│   ├── database_demo.py
│   ├── test_resume_maker.py
│   ├── production_resume_maker.py
│   ├── backend/main_minimal.py
│   ├── backend/test_auth.py
│   ├── backend/test_simple.py
│   ├── test_frontend.html
│   ├── quick_start.py
│   ├── start.bat
│   ├── package-lock.json (root)
│   ├── requirements.txt (root)
│   └── Placement-Navigator/ (duplicate folder?)
│
├── data/                       # Data files (NEW - to organize)
│   ├── Docs/
│   │   └── Darsh Iyer Resume.pdf
│   ├── resume_*.txt           # Resume examples
│   └── placement_navigator.db  # SQLite database (if exists)
│
├── README.md                   # Main README
└── .gitignore                  # Git ignore rules
```

---

## Files Analysis

### ✅ ACTIVE FILES (Keep as-is)

**Backend:**
- `backend/main.py` - Main application ✅
- `backend/auth.py` - Authentication ✅
- `backend/schemas.py` - Schemas ✅
- `backend/routers/*` - All routers ✅
- `backend/services/ats_service.py` ✅
- `backend/services/matching_service.py` ✅
- `backend/services/simple_mcp_client.py` ✅ **USED**
- `backend/services/storage_service.py` ✅
- `backend/services/pdf_extractor.py` ✅
- `backend/services/simple_matching_service.py` ✅

**Frontend:**
- All files in `frontend/` ✅

**Shared:**
- `shared/models.py` ✅
- `shared/enhanced_models.py` ✅

**MCP Server:**
- `mcp_server/simple_mcp_server.py` ✅ **USED**
- `mcp_server/agents/*` ✅ **USED**
- `mcp_server/placement_server.py` - Full server (not used, but keep)

**Tests:**
- `tests/*` ✅

---

### 📦 UNUSED FILES (Move to archive/)

1. **`database_demo.py`** - Demo script, not imported anywhere
2. **`test_resume_maker.py`** - Test script, not imported
3. **`production_resume_maker.py`** - Not imported
4. **`backend/main_minimal.py`** - Minimal version, not used
5. **`backend/test_auth.py`** - Test file, not in tests/
6. **`backend/test_simple.py`** - Test file, not in tests/
7. **`test_frontend.html`** - Old HTML test file
8. **`quick_start.py`** - Quick start script, not needed in production
9. **`start.bat`** - Windows batch file, not needed
10. **`package-lock.json`** (root) - Duplicate, should be in frontend/
11. **`requirements.txt`** (root) - Duplicate, should be in backend/
12. **`Placement-Navigator/`** - Duplicate folder? Need to check
13. **`landing-page/`** - Empty or unused folder?

---

### 📄 DOCUMENTATION FILES (Move to docs/)

All `.md` files except `README.md`:
- `API_CONNECTION_CHECK.md`
- `FINAL_STATUS.md`
- `IMPLEMENTATION_PROGRESS.md`
- `SYSTEM_REFORM_MAP.md`
- `SYSTEM_COMPLETE.md`
- `SUPABASE_ACCESS.md`
- `TABLE_CONNECTIONS.md`
- `TABLES_CONNECTION_SCRIPT.md`
- `TESTING_CHECKLIST.md`
- `PROJECT_DESCRIPTION.md`
- `backend/README_RESUME_UPLOAD.md`

---

### 🔧 UTILITY SCRIPTS (Move to scripts/)

- `seed_database.py`
- `migrate_database.py`
- `setup_postgresql.sh`
- `start_services.sh`
- `run_tests.sh`
- `backend/test_api_connectivity.py`

---

### 📂 DATA FILES (Move to data/)

- `Docs/` folder
- `resume_*.txt` files
- `placement_navigator.db` (if exists)

---

## MCP Server Status

### ✅ BEING USED:
- `backend/services/simple_mcp_client.py` - Used in jobs.py and analytics.py
- `mcp_server/simple_mcp_server.py` - Used by simple_mcp_client
- `mcp_server/agents/matching_agent.py` - Used by MCP server
- `mcp_server/agents/resume_agent.py` - Used by MCP server
- `mcp_server/agents/tracker_agent.py` - Used by MCP server

### ❌ NOT USED:
- `backend/services/mcp_client.py` - Full version, not imported anywhere
- `mcp_server/placement_server.py` - Full MCP server, not actively used

---

## Action Plan

1. Create `docs/` folder and move all .md files (except README.md)
2. Create `scripts/` folder and move utility scripts
3. Create `archive/` folder and move unused files
4. Create `data/` folder and move data files
5. Keep MCP server as-is (it's being used)
6. Clean up duplicate files

---

## Summary

**Total files to organize:** ~30 files
**MCP Status:** ✅ **ACTIVELY USED** (simple_mcp_client)
**Unused MCP files:** `mcp_client.py` (not imported)

