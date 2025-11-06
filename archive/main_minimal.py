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

# Add handlers
logger.addHandler(console_handler)

# Log startup
logger.info("Starting Career Navigator API")

sys.path.append('../')

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
    return {
        "status": "healthy",
        "service": "fastapi",
        "version": "2.0.0",
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
        "main_minimal:app", 
        host="0.0.0.0", 
        port=port, 
        reload=True,
        log_level="info"
    )
