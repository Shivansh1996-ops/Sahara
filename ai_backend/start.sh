#!/bin/bash

# Sahara AI Backend Startup Script

echo "🤖 Starting Sahara AI Backend..."

# Check if Python is installed
if ! command -v python3 &> /dev/null; then
    echo "❌ Python 3 is not installed. Please install Python 3.8 or higher."
    exit 1
fi

# Check if pip is installed
if ! command -v pip3 &> /dev/null; then
    echo "❌ pip3 is not installed. Please install pip3."
    exit 1
fi

# Install dependencies
echo "📦 Installing dependencies..."
pip3 install -r requirements.txt

# Start the Flask app
echo "✅ Starting Flask server on port 5000..."
python3 app.py
