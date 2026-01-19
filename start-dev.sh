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

(cd backend && python main.py) &


echo "📦 Installing Next.js Frontend Dependencies..."

npm install

echo "🌍 App is ready! Access it here:"
echo "👉 http://localhost:3000"
echo ""

echo "⚛️  Starting Next.js Frontend..."

npm run dev


wait
