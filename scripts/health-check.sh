#!/bin/bash

# Health check script for Docker containers
PORT=${PORT:-3000}
HOST=${HOST:-localhost}

# Check if application is responding
if curl -f -s "http://${HOST}:${PORT}/api/health" > /dev/null; then
    echo "✅ Health check passed"
    exit 0
else
    echo "❌ Health check failed"
    exit 1
fi