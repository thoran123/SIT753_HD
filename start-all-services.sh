
#!/bin/bash
echo "🚀 Starting all DevOps services..."

# Stop existing containers
docker stop sonarqube prometheus grafana || true
docker rm sonarqube prometheus grafana || true

# Start SonarQube (Code Quality)
echo "📊 Starting SonarQube..."
docker run -d --name sonarqube -p 9000:9000 sonarqube:latest

# Start Prometheus (Monitoring)
echo "📈 Starting Prometheus..."
docker run -d --name prometheus -p 9090:9090 \
  -v $(pwd)/monitoring/prometheus.yml:/etc/prometheus/prometheus.yml \
  prom/prometheus:latest

# Start Grafana (Dashboards)
echo "📉 Starting Grafana..."
docker run -d --name grafana -p 3003:3000 \
  -e "GF_SECURITY_ADMIN_PASSWORD=admin" \
  grafana/grafana:latest

echo "⏳ Waiting for services to start..."
sleep 60

echo "✅ All services started!"
echo "🔗 Access URLs:"
echo "   SonarQube: http://localhost:9000 (admin/admin)"
echo "   Prometheus: http://localhost:9090"
echo "   Grafana: http://localhost:3003 (admin/admin)"
