import os
import sys
from dotenv import load_dotenv

# Ensure env is loaded before importing routers/models
load_dotenv()
# Force SQLite for local dev to avoid psycopg2 requirement
os.environ["DATABASE_URL"] = os.getenv("DATABASE_URL", "sqlite:///./dev.db") or "sqlite:///./dev.db"

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import logging
from datetime import datetime

# Initialize FastAPI
app = FastAPI(
    title="Career Navigator API",
    description="AI-powered university placement management system",
    version="2.0.0",
    docs_url="/api/docs",
    redoc_url="/api/redoc",
    openapi_url="/api/openapi.json"
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://localhost:3001", "https://*.vercel.app"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Import routers AFTER env setup
from backend.routers import ats
from backend.routers import auth as auth_router

# Create tables for SQLite on startup
try:
    sys.path.append("../")
    from shared.models import create_tables
    create_tables()
except Exception as e:
    logging.getLogger("career_navigator").warning(f"DB initialization skipped: {e}")

@app.get("/")
async def root():
    return {
        "name": "Career Navigator API",
        "version": "2.0.0",
        "description": "AI-powered university placement management system",
        "features": [
            "AI-powered job matching",
            "Resume generation and customization",
            "Student progress analytics",
            "Secure authentication",
            "Job posting and application management"
        ],
        "documentation": "/api/docs",
        "status": "online",
        "timestamp": datetime.now().isoformat()
    }

@app.get("/health")
async def health_check():
    return {
        "status": "healthy",
        "service": "fastapi",
        "version": "2.0.0",
        "timestamp": datetime.now().isoformat(),
        "environment": os.getenv("ENVIRONMENT", "development")
    }

# Include routers
app.include_router(ats.router)
app.include_router(auth_router.router)

if __name__ == "__main__":
    import uvicorn
    port = int(os.getenv("PORT", 8000))
    uvicorn.run("main_minimal:app", host="0.0.0.0", port=port, reload=True, log_level="info")
