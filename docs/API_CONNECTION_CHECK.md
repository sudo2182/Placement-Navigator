# API CONNECTION CHECK REPORT

**Generated:** 2025-11-06T10:07:00.030109

## Results

### ✅ Environment Variable: DATABASE_URL

- **Status:** PASS
- **Message:** Set: True
- **Used in:** shared/models.py, backend/auth.py
- **Required:** Yes

### ❌ Environment Variable: JWT_SECRET_KEY

- **Status:** FAIL
- **Message:** Set: False
- **Used in:** backend/auth.py
- **Fix:** Set JWT_SECRET_KEY in .env file or environment
- **Required:** Yes

### ⚠️ Environment Variable: OPENAI_API_KEY

- **Status:** WARN
- **Message:** Set: False
- **Used in:** backend/services/matching_service.py

### ⚠️ Environment Variable: GITHUB_TOKEN

- **Status:** WARN
- **Message:** Set: False
- **Used in:** backend/routers/github.py

### ⚠️ Environment Variable: USE_MINIO

- **Status:** WARN
- **Message:** Set: False
- **Used in:** backend/services/storage_service.py

### ⚠️ Environment Variable: AWS_ACCESS_KEY_ID

- **Status:** WARN
- **Message:** Set: False
- **Used in:** backend/services/storage_service.py

### ⚠️ Environment Variable: AWS_SECRET_ACCESS_KEY

- **Status:** WARN
- **Message:** Set: False
- **Used in:** backend/services/storage_service.py

### ⚠️ Environment Variable: S3_BUCKET_NAME

- **Status:** WARN
- **Message:** Set: False
- **Used in:** backend/services/storage_service.py

### ❌ PostgreSQL Database

- **Status:** FAIL
- **Message:** Connection failed: Not an executable object: 'SELECT 1'
- **Used in:** shared/models.py
- **Fix:** Check DATABASE_URL in .env file. Ensure PostgreSQL is running.

### ⚠️ OpenAI API

- **Status:** WARN
- **Message:** OPENAI_API_KEY not set (optional)
- **Used in:** backend/services/matching_service.py
- **Fix:** Set OPENAI_API_KEY for AI-powered matching. System will use rule-based fallback.

### ⚠️ GitHub API

- **Status:** WARN
- **Message:** GITHUB_TOKEN not set (optional)
- **Used in:** backend/routers/github.py
- **Fix:** Set GITHUB_TOKEN for GitHub profile analysis. Create token at https://github.com/settings/tokens

### ⚠️ AWS S3 Storage

- **Status:** WARN
- **Message:** AWS credentials not set (optional)
- **Used in:** backend/services/storage_service.py
- **Fix:** Set AWS_ACCESS_KEY_ID, AWS_SECRET_ACCESS_KEY, AWS_REGION, S3_BUCKET_NAME for S3 uploads. Or set USE_MINIO=true for local storage.

### ✅ Backend API (Health)

- **Status:** PASS
- **Message:** Backend accessible at http://localhost:8000
- **Used in:** All API endpoints

## Environment Variables Required

### Required
- `DATABASE_URL` - PostgreSQL connection string
- `JWT_SECRET_KEY` - Secret for JWT token signing

### Optional (for enhanced features)
- `OPENAI_API_KEY` - For AI-powered matching (fallback available)
- `GITHUB_TOKEN` - For GitHub profile analysis
- `USE_MINIO=true` - For local storage (or use AWS S3)
- `MINIO_ENDPOINT`, `MINIO_ACCESS_KEY`, `MINIO_SECRET_KEY` - MinIO config
- `AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY`, `AWS_REGION` - AWS S3 config
- `S3_BUCKET_NAME` - Storage bucket name

