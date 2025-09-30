#!/usr/bin/env python3
"""
Quick Start Script for Placement Navigator
==========================================

This script helps automate the initial setup and testing process.
Run this after following the manual setup steps in COMPLETE_SETUP_GUIDE.md

Usage:
    python quick_start.py
"""

import os
import sys
import subprocess
import time
import requests
import json

class Colors:
    GREEN = '\033[92m'
    RED = '\033[91m'
    YELLOW = '\033[93m'
    BLUE = '\033[94m'
    BOLD = '\033[1m'
    END = '\033[0m'

def print_step(step_num, description):
    print(f"\n{Colors.BLUE}{Colors.BOLD}Step {step_num}: {description}{Colors.END}")

def print_success(message):
    print(f"{Colors.GREEN}✅ {message}{Colors.END}")

def print_error(message):
    print(f"{Colors.RED}❌ {message}{Colors.END}")

def print_warning(message):
    print(f"{Colors.YELLOW}⚠️ {message}{Colors.END}")

def check_python_version():
    """Check if Python version is compatible"""
    if sys.version_info < (3, 8):
        print_error("Python 3.8+ is required")
        return False
    print_success(f"Python {sys.version.split()[0]} detected")
    return True

def check_dependencies():
    """Check if required dependencies are available"""
    print_step(1, "Checking System Dependencies")
    
    # Check Python
    if not check_python_version():
        return False
    
    # Check pip
    try:
        subprocess.run([sys.executable, "-m", "pip", "--version"], 
                      check=True, capture_output=True)
        print_success("pip available")
    except subprocess.CalledProcessError:
        print_error("pip not available")
        return False
    
    # Check Node.js (optional)
    try:
        result = subprocess.run(["node", "--version"], 
                              capture_output=True, text=True)
        if result.returncode == 0:
            print_success(f"Node.js {result.stdout.strip()} detected")
        else:
            print_warning("Node.js not found - frontend won't work")
    except FileNotFoundError:
        print_warning("Node.js not found - frontend won't work")
    
    return True

def setup_virtual_environment():
    """Create and activate virtual environment"""
    print_step(2, "Setting up Virtual Environment")
    
    venv_path = "venv"
    
    if not os.path.exists(venv_path):
        try:
            subprocess.run([sys.executable, "-m", "venv", venv_path], check=True)
            print_success("Virtual environment created")
        except subprocess.CalledProcessError as e:
            print_error(f"Failed to create virtual environment: {e}")
            return False
    else:
        print_success("Virtual environment already exists")
    
    return True

def install_python_dependencies():
    """Install Python dependencies"""
    print_step(3, "Installing Python Dependencies")
    
    # Get pip executable path
    if os.name == 'nt':  # Windows
        pip_path = os.path.join("venv", "Scripts", "pip")
    else:  # Linux/Mac
        pip_path = os.path.join("venv", "bin", "pip")
    
    # Install main requirements
    requirements_files = [
        "requirements.txt",
        "backend/requirements.txt"
    ]
    
    for req_file in requirements_files:
        if os.path.exists(req_file):
            try:
                subprocess.run([pip_path, "install", "-r", req_file], check=True)
                print_success(f"Installed dependencies from {req_file}")
            except subprocess.CalledProcessError as e:
                print_error(f"Failed to install from {req_file}: {e}")
                return False
        else:
            print_warning(f"{req_file} not found, skipping")
    
    # Install AI Resume Maker dependencies
    ai_deps = ["openai>=1.0.0", "python-dotenv>=1.0.0"]
    for dep in ai_deps:
        try:
            subprocess.run([pip_path, "install", dep], check=True)
            print_success(f"Installed {dep}")
        except subprocess.CalledProcessError as e:
            print_warning(f"Failed to install {dep}: {e}")
    
    return True

def create_env_file():
    """Create .env file with default configuration"""
    print_step(4, "Creating Environment Configuration")
    
    env_content = """# Database Configuration
DATABASE_URL=postgresql://username:password@localhost:5432/placement_navigator

# Security
SECRET_KEY=your-super-secret-key-change-this-in-production-immediately
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30

# OpenAI Configuration (Optional - system works without it)
# OPENAI_API_KEY=your-openai-api-key-here

# Application Settings
DEBUG=True
"""
    
    if not os.path.exists(".env"):
        with open(".env", "w") as f:
            f.write(env_content)
        print_success(".env file created with default configuration")
        print_warning("Please update DATABASE_URL with your actual database credentials")
    else:
        print_success(".env file already exists")
    
    return True

def test_database_connection():
    """Test database connection"""
    print_step(5, "Testing Database Connection")
    
    try:
        # Get python executable path
        if os.name == 'nt':  # Windows
            python_path = os.path.join("venv", "Scripts", "python")
        else:  # Linux/Mac
            python_path = os.path.join("venv", "bin", "python")
        
        # Try to create tables
        result = subprocess.run([
            python_path, "-c", 
            "from shared.models import create_tables; create_tables(); print('Database connection successful!')"
        ], capture_output=True, text=True, timeout=10)
        
        if result.returncode == 0:
            print_success("Database connection successful")
            return True
        else:
            print_error(f"Database connection failed: {result.stderr}")
            print_warning("Please check your DATABASE_URL in the .env file")
            return False
            
    except subprocess.TimeoutExpired:
        print_error("Database connection timed out")
        return False
    except Exception as e:
        print_error(f"Database test failed: {e}")
        return False

def test_ai_resume_maker():
    """Test the standalone AI Resume Maker"""
    print_step(6, "Testing AI Resume Maker")
    
    try:
        # Get python executable path
        if os.name == 'nt':  # Windows
            python_path = os.path.join("venv", "Scripts", "python")
        else:  # Linux/Mac
            python_path = os.path.join("venv", "bin", "python")
        
        print("Running AI Resume Maker test (this may take a moment)...")
        result = subprocess.run([python_path, "test_resume_maker.py"], 
                              capture_output=True, text=True, timeout=60)
        
        if result.returncode == 0:
            print_success("AI Resume Maker test completed successfully")
            
            # Check if resume files were created
            resume_files = [f for f in os.listdir(".") if f.startswith("resume_") and f.endswith(".txt")]
            if resume_files:
                print_success(f"Generated {len(resume_files)} test resume files")
            
            return True
        else:
            print_error(f"AI Resume Maker test failed: {result.stderr}")
            return False
            
    except subprocess.TimeoutExpired:
        print_error("AI Resume Maker test timed out")
        return False
    except Exception as e:
        print_error(f"AI Resume Maker test failed: {e}")
        return False

def start_backend_server():
    """Start the backend server"""
    print_step(7, "Starting Backend Server")
    
    try:
        # Get python executable path
        if os.name == 'nt':  # Windows
            python_path = os.path.join("venv", "Scripts", "python")
        else:  # Linux/Mac
            python_path = os.path.join("venv", "bin", "python")
        
        # Start uvicorn server in background
        print("Starting backend server on http://localhost:8000")
        print_warning("Server will run in background. Press Ctrl+C to stop this script.")
        
        os.chdir("backend")
        subprocess.run([python_path, "-m", "uvicorn", "main:app", "--reload", 
                       "--host", "127.0.0.1", "--port", "8000"])
        
    except KeyboardInterrupt:
        print("\n" + Colors.YELLOW + "Server stopped." + Colors.END)
    except Exception as e:
        print_error(f"Failed to start backend server: {e}")
        return False

def test_backend_api():
    """Test backend API endpoints"""
    print_step(8, "Testing Backend API")
    
    # Wait a moment for server to start
    time.sleep(3)
    
    try:
        # Test health endpoint
        response = requests.get("http://localhost:8000/docs", timeout=5)
        if response.status_code == 200:
            print_success("Backend API is responding")
            print_success("Swagger docs available at http://localhost:8000/docs")
            return True
        else:
            print_error(f"Backend API returned status {response.status_code}")
            return False
    except requests.exceptions.RequestException as e:
        print_error(f"Backend API test failed: {e}")
        print_warning("Make sure the backend server is running")
        return False

def display_next_steps():
    """Display next steps for the user"""
    print(f"\n{Colors.GREEN}{Colors.BOLD}🎉 Setup completed successfully!{Colors.END}\n")
    
    print(f"{Colors.BOLD}Next Steps:{Colors.END}")
    print("1. Update your .env file with actual database credentials")
    print("2. If you have an OpenAI API key, add it to the .env file")
    print("3. Start the backend server:")
    print(f"   {Colors.BLUE}cd backend && python -m uvicorn main:app --reload{Colors.END}")
    print("4. In a new terminal, start the frontend:")
    print(f"   {Colors.BLUE}cd frontend && npm install && npm run dev{Colors.END}")
    print("5. Open http://localhost:3000 in your browser")
    print("6. Open http://localhost:8000/docs for API documentation")
    
    print(f"\n{Colors.BOLD}Test Files Created:{Colors.END}")
    resume_files = [f for f in os.listdir(".") if f.startswith("resume_") and f.endswith(".txt")]
    for file in resume_files:
        print(f"   📄 {file}")
    
    print(f"\n{Colors.BOLD}Troubleshooting:{Colors.END}")
    print("- Check COMPLETE_SETUP_GUIDE.md for detailed instructions")
    print("- Check terminal output for error messages")
    print("- Verify all dependencies are installed")
    print("- Make sure PostgreSQL is running")

def main():
    """Main setup function"""
    print(f"{Colors.BOLD}{Colors.BLUE}")
    print("=" * 60)
    print("🚀 Placement Navigator - Quick Start Setup")
    print("=" * 60)
    print(f"{Colors.END}")
    
    # Run setup steps
    steps = [
        check_dependencies,
        setup_virtual_environment,
        install_python_dependencies,
        create_env_file,
        test_database_connection,
        test_ai_resume_maker,
    ]
    
    for step_func in steps:
        if not step_func():
            print_error("Setup failed. Please check the errors above.")
            print_warning("See COMPLETE_SETUP_GUIDE.md for manual setup instructions.")
            return False
    
    display_next_steps()
    
    # Ask if user wants to start backend server
    try:
        response = input(f"\n{Colors.BOLD}Start backend server now? (y/n): {Colors.END}")
        if response.lower() in ['y', 'yes']:
            start_backend_server()
    except KeyboardInterrupt:
        print(f"\n{Colors.YELLOW}Setup completed. Run backend manually when ready.{Colors.END}")
    
    return True

if __name__ == "__main__":
    main()