#!/bin/bash
set -e

echo "🚀 Starting deployment..."

# Kill any existing processes
echo "🛑 Stopping existing processes..."
pkill -f "node.*server.js" || true
pkill -f "PORT=3001" || true
sleep 2

# Check if port is clear
echo "🔍 Checking port 3001..."
if lsof -i :3001 > /dev/null 2>&1; then
    echo "❌ Port 3001 is still in use"
    lsof -i :3001
    exit 1
fi

# Verify files and dependencies
echo "📁 Verifying setup..."
if [ ! -f "server.js" ]; then
    echo "❌ server.js not found!"
    exit 1
fi

if [ ! -d "node_modules" ]; then
    echo "📦 Installing dependencies..."
    npm install
fi

# Start server with detailed logging
echo "🚀 Starting server..."
NODE_ENV=test PORT=3001 node server.js > test-server.log 2>&1 &
SERVER_PID=$!
echo $SERVER_PID > test-server.pid

echo "📝 Server PID: $SERVER_PID"

# Wait and check if process is running
sleep 3
if ! ps -p $SERVER_PID > /dev/null; then
    echo "❌ Server process died!"
    echo "=== Server Log ==="
    cat test-server.log
    exit 1
fi

echo "✅ Server process is running"

# Health check with retries
echo "🏥 Performing health check..."
for i in {1..10}; do
    echo "Attempt $i/10..."
    
    # Check if process is still alive
    if ! ps -p $SERVER_PID > /dev/null; then
        echo "❌ Server died during startup"
        cat test-server.log
        exit 1
    fi
    
    # Try health check
    if curl -f -s -m 5 http://localhost:3001/api/health > /dev/null 2>&1; then
        echo "✅ Health check passed!"
        echo "✅ Deployment successful!"
        
        # Show final status
        echo "=== Server Status ==="
        curl -s http://localhost:3001/api/health | jq . || curl -s http://localhost:3001/api/health
        exit 0
    fi
    
    sleep 3
done

echo "❌ Health check failed after 10 attempts"
echo "=== Server Log ==="
cat test-server.log
echo "=== Process Status ==="
ps aux | grep node
exit 1
