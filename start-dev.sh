#!/bin/bash

# Function to kill all processes when you press Ctrl+C
trap 'kill 0' SIGINT

echo "🚀 Starting SwasthAI Development Environment..."

# 1. Start Python Backend in the background
# (Assumes main.py is in the 'backend' folder as recommended. 
# If it is in the root, remove 'cd backend &&')
echo "🐍 Starting Python Backend..."
(cd backend && python main.py) &

# 2. Start Next.js Frontend
echo "⚛️  Starting Next.js Frontend..."
npm run dev

# Keep script running to maintain processes
wait