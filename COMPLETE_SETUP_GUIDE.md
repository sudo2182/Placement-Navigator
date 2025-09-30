# 🚀 Complete Setup & Testing Guide - Placement Navigator with AI Resume Maker
================================================================================

This guide will walk you through setting up and testing your entire Placement Navigator project, including the new AI Resume Maker feature.

## 📋 Prerequisites

- Python 3.8+ installed
- Node.js 16+ installed
- PostgreSQL database running
- Git installed
- OpenAI API key (optional for testing - we have fallback)

## 🔧 Part 1: Environment Setup

### Step 1: Navigate to Project Directory
```bash
cd "c:\Users\akhil\Downloads\Placement-Navigator-main\Placement-Navigator-main"
```

### Step 2: Create Python Virtual Environment
```bash
# Create virtual environment
python -m venv venv

# Activate virtual environment (Windows)
venv\Scripts\activate

# Verify activation (you should see (venv) in your prompt)
```

### Step 3: Create Environment Configuration
Create a `.env` file in project root:

```bash
# Create .env file
New-Item -ItemType File -Path ".env"
```

Add the following content to `.env`:
```env
# Database Configuration
DATABASE_URL=postgresql://username:password@localhost:5432/placement_navigator

# Security
SECRET_KEY=your-super-secret-key-change-this-in-production
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30

# OpenAI Configuration (Optional - system works without it)
OPENAI_API_KEY=your-openai-api-key-here

# Application Settings
DEBUG=True
```

**Note**: Replace database credentials with your actual PostgreSQL setup.

## 🗄️ Part 2: Database Setup

### Step 4: Install PostgreSQL Dependencies
```bash
# Install psycopg2 for PostgreSQL
pip install psycopg2-binary

# Or if you have issues, try:
pip install psycopg2
```

### Step 5: Create Database
```sql
-- Connect to PostgreSQL and run:
CREATE DATABASE placement_navigator;
CREATE USER placement_user WITH PASSWORD 'your_password';
GRANT ALL PRIVILEGES ON DATABASE placement_navigator TO placement_user;
```

### Step 6: Initialize Database Tables
```bash
# From project root
python shared/models.py
```

You should see: "Database tables created successfully!"

## 🔙 Part 3: Backend Setup

### Step 7: Install Backend Dependencies
```bash
# Install main backend requirements
pip install -r backend/requirements.txt

# Install additional dependencies for AI Resume Maker
pip install openai>=1.0.0 python-dotenv>=1.0.0
```

### Step 8: Test Database Connection
```bash
# Test database connection
python -c "from shared.models import create_tables; create_tables(); print('✅ Database connection successful!')"
```

### Step 9: Start Backend Server
```bash
cd backend
uvicorn main:app --reload --host 127.0.0.1 --port 8000
```

You should see:
```
INFO:     Uvicorn running on http://127.0.0.1:8000 (Press CTRL+C to quit)
INFO:     Started reloader process
```

**Keep this terminal open** - Backend is now running on http://localhost:8000

## 🎨 Part 4: Frontend Setup

### Step 10: Open New Terminal for Frontend
```bash
# Open new PowerShell terminal
cd "c:\Users\akhil\Downloads\Placement-Navigator-main\Placement-Navigator-main\frontend"
```

### Step 11: Install Frontend Dependencies
```bash
npm install
```

### Step 12: Start Frontend Development Server
```bash
npm run dev
```

You should see:
```
  ▲ Next.js 14.x.x
  - Local:        http://localhost:3000
  - Ready in Xms
```

**Keep this terminal open** - Frontend is now running on http://localhost:3000

## 🧪 Part 5: Testing AI Resume Maker (Standalone)

### Step 13: Test Standalone Resume Maker
```bash
# Open third terminal in project root
cd "c:\Users\akhil\Downloads\Placement-Navigator-main\Placement-Navigator-main"

# Activate virtual environment
venv\Scripts\activate

# Test without OpenAI (uses template generation)
python test_resume_maker.py
```

Expected output:
```
🚀 AI Resume Maker - Test Script
==================================================
👨‍🎓 Student: John Smith
📧 Email: john.smith@email.com
💼 Total Projects: 5
🏢 Total Internships: 3
🏆 Total Certifications: 5

📋 Test 1: Generating resume for 'Cloud Engineer' at Amazon Web Services
✅ Resume generated successfully!
📄 Resume length: 2581 characters
💾 Resume saved to: resume_cloud_engineer_amazon_web_services.txt
```

### Step 14: Test Production OpenAI Version (Optional)
```bash
# If you have OpenAI API key, test production version
python production_resume_maker.py
```

This will test real OpenAI integration (if API key is set).

## 🔗 Part 6: Backend API Testing

### Step 15: Test Backend APIs
Open http://localhost:8000/docs in your browser to see Swagger documentation.

### Step 16: Create Test Data via API

#### Register Test Users:
```bash
curl -X POST "http://localhost:8000/auth/register" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "student@test.com",
    "password": "testpass123",
    "role": "student",
    "profile_data": {
      "name": "Test Student",
      "phone": "+1-555-0123",
      "age": 22,
      "skills": ["Python", "JavaScript", "React"],
      "projects": [
        {
          "title": "Web App",
          "description": "Built a web application",
          "technologies": ["React", "Node.js"],
          "year": "2024"
        }
      ]
    }
  }'
```

#### Register Employer:
```bash
curl -X POST "http://localhost:8000/auth/register" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "employer@test.com",
    "password": "testpass123",
    "role": "employer",
    "profile_data": {
      "company": "Test Company"
    }
  }'
```

### Step 17: Login and Get Token
```bash
curl -X POST "http://localhost:8000/auth/login" \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "username=student@test.com&password=testpass123"
```

Save the returned `access_token` for next steps.

### Step 18: Create Test Job
```bash
# Replace YOUR_TOKEN with the token from Step 17
curl -X POST "http://localhost:8000/jobs/" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "title": "Frontend Developer",
    "company": "Tech Corp",
    "description": "We are looking for a skilled Frontend Developer with React experience",
    "requirements": ["React", "JavaScript", "HTML", "CSS"],
    "salary_range": "$60,000 - $80,000",
    "location": "Remote",
    "job_type": "full-time"
  }'
```

### Step 19: Test AI Resume Generation
```bash
# Apply for the job (job_id will be 1 if it's your first job)
curl -X POST "http://localhost:8000/jobs/1/apply" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "cover_letter": "I am interested in this position"
  }'
```

Expected response:
```json
{
  "message": "Application submitted successfully",
  "application_id": 1,
  "ai_generated": true,
  "resume_preview": "TEST STUDENT\nEmail: student@test.com..."
}
```

## 🌐 Part 7: Frontend Testing

### Step 20: Test Frontend Application
1. Open http://localhost:3000 in your browser
2. You should see the Placement Navigator homepage
3. Try to register/login with the test accounts
4. Navigate through the application features

### Step 21: Test Job Application Flow
1. Login as student (`student@test.com` / `testpass123`)
2. Browse available jobs
3. Click "Apply" on a job
4. Verify AI resume generation works
5. Check generated resume content

## 🔧 Part 8: Integration Testing

### Step 22: Test MCP Server (Optional)
```bash
cd mcp_server
pip install -r requirements.txt
python placement_server.py
```

### Step 23: Run Unit Tests
```bash
# Run backend tests
cd tests
python -m pytest test_integration.py -v
python -m pytest test_matching.py -v
```

## 🐛 Part 9: Troubleshooting Common Issues

### Database Connection Issues:
```bash
# Check if PostgreSQL is running
Get-Service postgresql*

# Test connection manually
python -c "import psycopg2; conn = psycopg2.connect('postgresql://user:pass@localhost/db'); print('✅ Connected')"
```

### Port Already in Use:
```bash
# Kill process on port 8000
netstat -ano | findstr :8000
taskkill /PID <PID_NUMBER> /F

# Kill process on port 3000
netstat -ano | findstr :3000
taskkill /PID <PID_NUMBER> /F
```

### OpenAI API Issues:
- If no API key: System automatically falls back to template generation
- If invalid API key: Check the key in `.env` file
- If rate limit: Wait and try again, or use template fallback

### Module Import Errors:
```bash
# Make sure virtual environment is activated
venv\Scripts\activate

# Install missing dependencies
pip install -r requirements.txt
pip install -r backend/requirements.txt
```

## ✅ Part 10: Verification Checklist

### Backend Verification:
- [ ] Database tables created successfully
- [ ] Backend server running on port 8000
- [ ] Swagger docs accessible at http://localhost:8000/docs
- [ ] User registration/login working
- [ ] Job creation working
- [ ] AI resume generation working (check logs)

### Frontend Verification:
- [ ] Frontend server running on port 3000
- [ ] Can access homepage at http://localhost:3000
- [ ] User registration/login forms working
- [ ] Job listings displaying
- [ ] Application process functional

### AI Resume Maker Verification:
- [ ] Standalone test script runs successfully
- [ ] Resume files generated in project directory
- [ ] API endpoint `/jobs/{id}/apply` returns AI-generated resume
- [ ] Fallback to template generation works without OpenAI
- [ ] Generated resumes fit one-page constraint

## 🎯 Part 11: Testing Different Scenarios

### Test Scenario 1: Cloud Engineer Application
1. Create job posting for "Cloud Engineer" with AWS requirements
2. Create student profile with AWS skills and cloud projects
3. Apply for job and verify resume emphasizes cloud experience

### Test Scenario 2: Frontend Developer Application
1. Create job posting for "Frontend Developer" with React requirements
2. Apply with student profile having React projects
3. Verify resume highlights frontend skills

### Test Scenario 3: No OpenAI Key
1. Remove or comment out `OPENAI_API_KEY` in `.env`
2. Apply for jobs and verify template generation works
3. Check that resumes are still professional and relevant

## 📊 Part 12: Performance Testing

### Load Testing (Optional):
```bash
# Install Apache Bench
# Test API endpoints
ab -n 100 -c 10 http://localhost:8000/jobs/

# Test resume generation
ab -n 10 -c 2 -H "Authorization: Bearer YOUR_TOKEN" -p post_data.json -T application/json http://localhost:8000/jobs/1/apply
```

## 🔄 Part 13: Development Workflow

### Daily Development:
1. Activate virtual environment: `venv\Scripts\activate`
2. Start backend: `cd backend && uvicorn main:app --reload`
3. Start frontend: `cd frontend && npm run dev`
4. Make changes and test
5. Run tests: `python -m pytest tests/`

### Adding New Features:
1. Test AI Resume Maker changes: `python test_resume_maker.py`
2. Test backend changes via Swagger docs
3. Test frontend changes in browser
4. Run integration tests

## 🎉 Success Indicators

If everything is working correctly, you should see:

1. ✅ Backend API running with Swagger docs
2. ✅ Frontend React app running smoothly  
3. ✅ Database tables created and populated
4. ✅ User registration/login functional
5. ✅ Job posting and application system working
6. ✅ AI Resume Maker generating tailored resumes
7. ✅ Resume files being created and saved
8. ✅ Fallback system working without OpenAI

Your Placement Navigator with AI Resume Maker is now fully operational! 🚀

## 📞 Getting Help

If you encounter issues:
1. Check the terminal outputs for error messages
2. Verify all dependencies are installed
3. Ensure database is running and accessible
4. Check that all required environment variables are set
5. Try the standalone AI Resume Maker first to isolate issues
6. Check the generated log files in `backend/logs/`

The system is designed to be robust with fallbacks, so even if some components fail, the core functionality should still work.