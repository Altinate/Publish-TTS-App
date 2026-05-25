#!/bin/bash
# deploy.sh
# Deployment script for the TTS Web Application

set -e

# Ensure we are operating from the project root
cd "$(dirname "$0")/.."

echo "Starting deployment process..."

# 1. Update repository (if using git)
if [ -d ".git" ]; then
    echo "Pulling latest changes from git..."
    git pull origin main
else
    echo "Warning: Not a git repository. Skipping git pull."
fi

# 2. Install dependencies in the frontend folder
echo "Installing production dependencies..."
cd frontend
npm install --production
cd ..

# 3. Create logs directory if it doesn't exist
mkdir -p logs

# 4. Reload or start PM2 process
echo "Applying PM2 configuration..."
if pm2 list | grep -q "tts-web-app"; then
    echo "Reloading tts-web-app gracefully..."
    pm2 reload ecosystem.config.js --env production
else
    echo "Starting tts-web-app..."
    pm2 start ecosystem.config.js --env production
fi

echo "Deployment complete! Saving PM2 state..."
pm2 save

echo "Process is now managed by PM2."
