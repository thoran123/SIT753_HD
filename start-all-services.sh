#!/bin/bash
echo "🚀 Starting all services for SIT753 HD Demo..."

# Stop existing containers
echo "Stopping existing services..."
docker stop prometheus grafana sonarqube || true
docker rm prometheus grafana sonarqube || true

# Stop Node.js apps
pkill -f "node server.js" || true

# Start Production App
echo "Starting production application..."
cd /path/to/your/SIT753_HD
NODE_ENV=production PORT=3002 node server.js &
echo "✅ Production app starting on http://localhost:3002"

# Start Monitoring Services
echo "Starting monitoring services..."

# Prometheus
docker run -d --name prometheus -p 9090:9090 prom/prometheus
echo "✅ Prometheus starting on http://localhost:9090"

# Grafana
docker run -d --name grafana -p 3003:3000 -e "GF_SECURITY_ADMIN_PASSWORD=admin" grafana/grafana
echo "✅ Grafana starting on http://localhost:3003 (admin/admin)"

# SonarQube
docker run -d --name sonarqube -p 9000:9000 sonarqube:latest
echo "✅ SonarQube starting on http://localhost:9000 (admin/admin)"

echo ""
echo "🎉 All services starting! Wait 2-3 minutes for full startup."
echo ""
echo "🌐 Access URLs:"
echo "   Production App: http://localhost:3002"
echo "   Grafana: http://localhost:3003 (admin/admin)"
echo "   Prometheus: http://localhost:9090"
echo "   SonarQube: http://localhost:9000 (admin/admin)"
echo ""
echo "⏳ Waiting for services to be ready..."
sleep 30

# Test services
echo "Testing services..."
curl -s http://localhost:3002/api/health && echo "✅ Production app healthy"
curl -s http://localhost:9090 >/dev/null && echo "✅ Prometheus accessible" || echo "⚠️ Prometheus starting..."
curl -s http://localhost:3003 >/dev/null && echo "✅ Grafana accessible" || echo "⚠️ Grafana starting..."
curl -s http://localhost:9000 >/dev/null && echo "✅ SonarQube accessible" || echo "⚠️ SonarQube starting..."

echo ""
echo "🎊 Demo setup complete! All services should be accessible."