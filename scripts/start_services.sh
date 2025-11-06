#!/bin/bash

# Script to start both backend and frontend services
# Created for Placement-Navigator project

echo "===== Starting Placement Navigator Services ====="

# Start backend server in the background
echo "Starting backend server..."
cd backend && uvicorn main:app --reload --port 8000 &
BACKEND_PID=$!
echo "Backend server started with PID: $BACKEND_PID"

# Give the backend a moment to start
sleep 3

# Start frontend server
echo "Starting frontend server..."
cd frontend && npm run dev

# This part will only execute if the frontend server stops
echo "Frontend server stopped. Cleaning up..."

# Kill the backend server if it's still running
if ps -p $BACKEND_PID > /dev/null; then
    echo "Stopping backend server (PID: $BACKEND_PID)..."
    kill $BACKEND_PID
fi

echo "===== All services stopped ====="