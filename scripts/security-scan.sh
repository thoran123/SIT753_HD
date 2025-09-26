#!/bin/bash
set -e

echo "🔒 Running security scans..."

# NPM Audit
echo "📦 Running npm audit..."
npm audit --audit-level high --json > npm-audit.json || true

# Snyk scan (if token available)
if [ ! -z "$SNYK_TOKEN" ]; then
    echo "🔍 Running Snyk scan..."
    snyk auth $SNYK_TOKEN
    snyk test --json > snyk-results.json || true
    snyk monitor || true
else
    echo "⚠️  Snyk token not available, skipping Snyk scan"
fi

# Docker image scan with Trivy
echo "🐳 Running container security scan..."
docker run --rm -v /var/run/docker.sock:/var/run/docker.sock \
  -v $PWD:/tmp/.cache/ aquasec/trivy:latest image \
  --format json --output /tmp/.cache/trivy-results.json \
  sit753-app:latest || true

echo "✅ Security scans completed!"

# Display summary
echo "📊 Security Scan Summary:"
if [ -f "npm-audit.json" ]; then
    echo "- NPM Audit results saved to npm-audit.json"
fi
if [ -f "snyk-results.json" ]; then
    echo "- Snyk results saved to snyk-results.json"
fi
if [ -f "trivy-results.json" ]; then
    echo "- Trivy results saved to trivy-results.json"
fi