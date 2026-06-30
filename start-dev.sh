#!/bin/bash


trap 'kill 0' SIGINT

echo "🚀 Setting up SwasthAI Development Environment..."


echo "🐍 Installing Python Backend Dependencies..."
if [ -f "backend/requirements.txt" ]; then
    pip install -r backend/requirements.txt
else
    echo "⚠️  Warning: backend/requirements.txt not found!"
fi

echo "🐍 Starting Python Backend..."

(cd backend && /opt/anaconda3/envs/swasth-ai/bin/python main.py) &


echo "📦 Installing Next.js Frontend Dependencies..."

(cd frontend && npm install)

echo "🌍 App is ready! Access it here:"
echo "👉 http://localhost:3000"
echo ""

echo "⚛️  Starting Next.js Frontend..."

(cd frontend && npm run dev)


wait
