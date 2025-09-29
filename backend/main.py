from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
import sys
import os
import time
import logging
from logging.handlers import RotatingFileHandler
import json
from datetime import datetime
from typing import Dict, Any
from dotenv import load_dotenv

# Load environment variables first
load_dotenv()

# Setup structured logging
log_dir = os.path.join(os.path.dirname(__file__), "logs")
os.makedirs(log_dir, exist_ok=True)

# Configure logger
logger = logging.getLogger("career_navigator")
logger.setLevel(logging.INFO)

# Console handler
console_handler = logging.StreamHandler()
console_handler.setLevel(logging.INFO)
console_format = logging.Formatter('%(asctime)s - %(name)s - %(levelname)s - %(message)s')
console_handler.setFormatter(console_format)

# File handler with rotation
file_handler = RotatingFileHandler(
    os.path.join(log_dir, "api.log"),
    maxBytes=10485760,  # 10MB
    backupCount=5
)
file_handler.setLevel(logging.INFO)
file_format = logging.Formatter('%(asctime)s - %(name)s - %(levelname)s - %(message)s')
file_handler.setFormatter(file_format)

# Add handlers
logger.addHandler(console_handler)
logger.addHandler(file_handler)

# Log startup
logger.info("Starting Career Navigator API")

sys.path.append('../')
from shared.models import create_tables
from backend.routers import auth, jobs, analytics

# Create database tables
try:
    create_tables()
    logger.info("Database tables created/verified successfully")
except Exception as e:
    logger.error(f"Error creating database tables: {str(e)}")
    raise

# Performance monitoring middleware
class PerformanceMiddleware:
    async def __call__(self, request: Request, call_next):
        start_time = time.time()
        
        # Process the request
        response = await call_next(request)
        
        # Calculate processing time
        process_time = time.time() - start_time
        
        # Log request details
        log_data = {
            "timestamp": datetime.now().isoformat(),
            "method": request.method,
            "path": request.url.path,
            "client": request.client.host if request.client else "unknown",
            "process_time_ms": round(process_time * 1000, 2),
            "status_code": response.status_code
        }
        
        # Log as JSON for structured logging
        logger.info(f"Request processed: {json.dumps(log_data)}")
        
        # Add processing time header
        response.headers["X-Process-Time"] = str(process_time)
        
        return response

# Initialize FastAPI with updated version
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
    allow_origins=["http://localhost:3000", "https://*.vercel.app"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Add performance monitoring middleware
app.add_middleware(PerformanceMiddleware)

# Include routers
app.include_router(auth.router)
app.include_router(jobs.router)
app.include_router(analytics.router)

@app.get("/")
async def root() -> Dict[str, Any]:
    """
    Root endpoint providing information about the API
    """
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
async def health_check() -> Dict[str, Any]:
    """
    Health check endpoint for monitoring
    """
    # Check AI services availability
    ai_available = True
    try:
        # Simple check for AI services - in a real app, you might ping the MCP server
        if not os.getenv("OPENAI_API_KEY"):
            ai_available = False
    except Exception:
        ai_available = False
    
    return {
        "status": "healthy",
        "service": "fastapi",
        "version": "2.0.0",
        "ai_services": "available" if ai_available else "unavailable",
        "timestamp": datetime.now().isoformat(),
        "environment": os.getenv("ENVIRONMENT", "development")
    }

if __name__ == "__main__":
    import uvicorn
    
    # Get port from environment or use default
    port = int(os.getenv("PORT", 8000))
    
    # Log startup configuration
    logger.info(f"Starting uvicorn server on port {port}")
    
    # Run the application
    uvicorn.run(
        "main:app", 
        host="0.0.0.0", 
        port=port, 
        reload=True,
        log_level="info"
    )