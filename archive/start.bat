@echo off
REM Placement Navigator - Windows Quick Start Script
REM ================================================

echo.
echo ========================================
echo 🚀 Placement Navigator Quick Start
echo ========================================
echo.

REM Check if Python is installed
python --version >nul 2>&1
if errorlevel 1 (
    echo ❌ Python is not installed or not in PATH
    echo Please install Python 3.8+ from https://python.org
    pause
    exit /b 1
)

echo ✅ Python detected
echo.

REM Create virtual environment
if not exist "venv" (
    echo 📦 Creating virtual environment...
    python -m venv venv
    if errorlevel 1 (
        echo ❌ Failed to create virtual environment
        pause
        exit /b 1
    )
    echo ✅ Virtual environment created
) else (
    echo ✅ Virtual environment already exists
)

echo.

REM Activate virtual environment and run quick start
echo 🔧 Running automated setup...
echo.

call venv\Scripts\activate.bat
python quick_start.py

echo.
echo ========================================
echo 📖 For detailed instructions, see:
echo    COMPLETE_SETUP_GUIDE.md
echo ========================================
echo.

pause