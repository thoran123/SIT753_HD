#!/bin/bash
set -e

echo "🏗️  Starting build process..."

# Clean previous builds
rm -rf dist/ || true
rm -rf coverage/ || true

# Install dependencies
echo "📦 Installing dependencies..."
npm ci

# Run tests
echo "🧪 Running tests..."
npm test

# Build application
echo "🔨 Building application..."
npm run build

# Create Docker image
echo "🐳 Building Docker image..."
docker build -t sit753-app:latest .

echo "✅ Build completed successfully!"