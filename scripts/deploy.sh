#!/bin/bash
set -e

ENVIRONMENT=${1:-test}
COMPOSE_FILE="docker-compose.${ENVIRONMENT}.yml"

echo "🚀 Deploying to ${ENVIRONMENT} environment..."

# Check if compose file exists
if [ ! -f "$COMPOSE_FILE" ]; then
    echo "❌ Compose file $COMPOSE_FILE not found!"
    exit 1
fi

# Stop existing containers
echo "⏹️  Stopping existing containers..."
docker-compose -f "$COMPOSE_FILE" down || true

# Deploy new version
echo "🚀 Starting new containers..."
docker-compose -f "$COMPOSE_FILE" up -d

# Wait for application to start
echo "⏳ Waiting for application to start..."
sleep 30

# Health check
echo "🏥 Performing health check..."
if [ "$ENVIRONMENT" = "test" ]; then
    PORT=3001
elif [ "$ENVIRONMENT" = "prod" ]; then
    PORT=3002
else
    PORT=3000
fi

for i in {1..10}; do
    if curl -f "http://localhost:${PORT}/api/health"; then
        echo "✅ Deployment successful!"
        exit 0
    fi
    echo "⏳ Health check attempt $i/10..."
    sleep 10
done

echo "❌ Deployment failed - health check timeout"
docker-compose -f "$COMPOSE_FILE" logs
exit 1