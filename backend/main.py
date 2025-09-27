from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import sys
import os
from dotenv import load_dotenv

# Load environment variables first
load_dotenv()

sys.path.append('../')
from shared.models import create_tables
from backend.routers import auth, jobs, analytics

# Create database tables
create_tables()

app = FastAPI(
    title="Career Navigator API",
    description="AI-powered university placement management system",
    version="1.0.0"
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "https://*.vercel.app"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(auth.router)
app.include_router(jobs.router)
app.include_router(analytics.router)

@app.get("/")
async def root():
    return {"message": "Career Navigator API is running!", "version": "1.0.0"}

@app.get("/health")
async def health_check():
    return {"status": "healthy", "service": "fastapi"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000, reload=True)