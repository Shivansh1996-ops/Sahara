@echo off
REM Sahara AI Backend Startup Script for Windows

echo 🤖 Starting Sahara AI Backend...

REM Check if Python is installed
python --version >nul 2>&1
if errorlevel 1 (
    echo ❌ Python is not installed. Please install Python 3.8 or higher.
    pause
    exit /b 1
)

REM Install dependencies
echo 📦 Installing dependencies...
pip install -r requirements.txt

REM Start the Flask app
echo ✅ Starting Flask server on port 5000...
python app.py

pause
