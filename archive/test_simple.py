#!/usr/bin/env python3
"""
Simple FastAPI test to isolate the hanging issue
"""

from fastapi import FastAPI
import uvicorn

app = FastAPI()

@app.get("/")
async def root():
    return {"message": "Hello World", "status": "ok"}

@app.get("/health")
async def health():
    return {"status": "healthy"}

if __name__ == "__main__":
    print("Starting simple FastAPI server...")
    uvicorn.run(app, host="0.0.0.0", port=8001, log_level="info")
