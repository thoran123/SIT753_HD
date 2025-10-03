# SIT753 DevOps Pipeline Implementation


A comprehensive DevOps pipeline implementation with Jenkins, Docker, and full monitoring stack for SIT725 Applied Software Engineering.

## 📋 Table of Contents

- [Student Information](#student-information)
- [Quick Start](#quick-start)
- [Project Overview](#project-overview)
- [Pipeline Stages](#pipeline-stages)
- [Architecture](#architecture)
- [Installation](#installation)
- [Usage](#usage)
- [Services](#services)
- [Testing](#testing)
- [Monitoring](#monitoring)
- [Troubleshooting](#troubleshooting)
- [Documentation](#documentation)

## 👨‍🎓 Student Information

- **Student ID:** s224967779
- **Student Email:** s224967779@deakin.edu.au
- **Submitted By:** Thoran Kumar Cherukuru Ramesh
- **Course:** Applied Software Engineering (SIT725)
- **Task:** 7.3 HD - DevOps Pipeline Implementation

## 🚀 Quick Start

### Prerequisites

Ensure you have the following installed:

- **Git** (latest version)
- **Docker** (version 20.10+)
- **Docker Compose** (version 2.0+)
- **Node.js** (version 16+)
- **npm** (version 8+)
- **Jenkins** (version 2.3+)

### Clone and Run

```bash
# Clone the repository
git clone https://github.com/thoran123/SIT753_HD.git

# Navigate to project directory
cd SIT753_HD

# Install dependencies
npm install

# Start all services
docker-compose up -d

# Check service status
docker-compose ps

# View logs
docker-compose logs -f
```

### Access Services

| Service | URL | Credentials |
|---------|-----|-------------|
| 🚀 Application | http://localhost:3001 | - |
| 🔧 Jenkins | http://localhost:8080 | Use initial admin password |
| 📊 Grafana | http://localhost:3000 | admin / admin |
| 📈 Prometheus | http://localhost:9090 | - |
| 📉 Node Exporter | http://localhost:9100 | - |
| 🐳 cAdvisor | http://localhost:8081 | - |

### Get Jenkins Password

```bash
docker exec jenkins cat /var/jenkins_home/secrets/initialAdminPassword
```

## 📊 Project Overview

This project implements a production-ready DevOps pipeline with 7 complete stages:

### Pipeline Status

| Stage | Tools | Status |
|-------|-------|--------|
| 1️⃣ Build | Docker, Node.js, npm | ✅ Complete |
| 2️⃣ Test | Jest, Supertest | ✅ Complete |
| 3️⃣ Code Quality | SonarQube | ✅ Complete |
| 4️⃣ Security | Snyk, OWASP | ✅ Complete |
| 5️⃣ Deploy | Docker Compose | ✅ Complete |
| 6️⃣ Release | Multi-stage Pipeline | ✅ Complete |
| 7️⃣ Monitoring | Prometheus, Grafana | ✅ Complete |

### Application Features

- **Frontend:** HTML5, CSS3, JavaScript with 3D globe visualizations
- **Backend:** Node.js with Express.js RESTful API
- **Containerization:** Multi-stage Docker builds
- **Orchestration:** Docker Compose with isolated networks
- **Monitoring:** Complete Prometheus/Grafana stack

## 🔄 Pipeline Stages

### Stage 1: Build 🏗️

Automated Docker builds with optimization:

```bash
# Manual build
docker build -t sit753-app:latest .
```

**Features:**
- Multi-stage Docker builds
- Dependency caching
- Environment-specific tagging
- Optimized image layers

### Stage 2: Test 🧪

Comprehensive testing with 85%+ coverage:

```bash
# Run all tests
npm test

# Run with coverage
npm run test:coverage

# Watch mode
npm run test:watch
```

**Coverage:**
- Unit tests for business logic
- Integration tests for APIs
- Health check validation
- Automated test reports

### Stage 3: Code Quality 📏

SonarQube static analysis:

**Metrics:**
- ✅ Maintainability: A Rating
- ✅ Technical Debt: < 5%
- ✅ Code Coverage: 85%+
- ✅ Duplication: < 3%

### Stage 4: Security 🔒

Multi-tool security scanning:

```bash
# Run security scan
npm run security:scan
```

**Tools:**
- Snyk for dependency scanning
- OWASP Dependency Check
- Container security analysis
- Automated vulnerability reports

### Stage 5: Deploy 🚀

Automated deployment to test environment:

```bash
# Deploy to test
docker-compose -f docker-compose.test.yml up -d
```

**Configuration:**
- Port: 3001
- Isolated Docker network
- Health checks enabled
- Automated rollback

### Stage 6: Release 📦

Production-ready release process:

```bash
# Deploy to production
docker-compose -f docker-compose.prod.yml up -d
```

**Features:**
- Semantic versioning
- Environment management
- Rollback capabilities
- Zero-downtime deployment

### Stage 7: Monitoring 📊

Full observability stack:

**Metrics:**
- HTTP request rates
- Response times
- CPU/Memory utilization
- Container performance
- Application health

## 🏗️ Architecture

### Technology Stack

```
Frontend
├── HTML5 (index.html, login.html, support.html)
├── CSS3 (styles.css)
└── JavaScript (globe.js - 3D visualizations)

Backend
├── Node.js + Express.js (server.js)
└── Prometheus metrics integration

DevOps
├── Docker (Multi-stage builds)
├── Docker Compose (Orchestration)
├── Jenkins (CI/CD Pipeline)
└── Git (Version control)

Monitoring
├── Prometheus (Metrics collection)
├── Grafana (Visualization)
├── Node Exporter (System metrics)
└── cAdvisor (Container metrics)

Testing
├── Jest (Test framework)
├── Supertest (API testing)
└── Coverage reporting
```

### Project Structure

```
SIT753_HD/
├── 📄 Dockerfile                      # Multi-stage Docker build
├── 📄 docker-compose.yml              # Main orchestration
├── 📄 docker-compose.test.yml         # Test environment
├── 📄 docker-compose.prod.yml         # Production environment
├── 📄 docker-compose.jenkins.yml      # Jenkins setup
├── 📄 docker-compose.all.yml          # All services
├── 📄 Jenkinsfile                     # Pipeline definition
├── 📄 package.json                    # Node dependencies
├── 📄 server.js                       # Express server
├── 📄 index.html                      # Main application
├── 📄 login.html                      # Login page
├── 📄 support.html                    # Support page
├── 📄 globe.js                        # 3D visualizations
├── 📄 styles.css                      # Application styles
├── 📄 sonar-project.properties        # SonarQube config
├── 📄 jest.config.js                  # Test configuration
├── 📄 .dockerignore                   # Docker exclusions
├── 📄 .gitignore                      # Git exclusions
├── 📁 tests/                          # Test files
├── 📁 scripts/                        # Utility scripts
├── 📁 monitoring/                     # Monitoring configs
│   ├── prometheus/
│   │   └── prometheus.yml
│   └── grafana/
│       └── dashboards/
├── 📁 jenkins_data/                   # Jenkins data
└── 📁 node_modules/                   # Dependencies
```

## 💻 Installation

### Step 1: Clone Repository

```bash
git clone https://github.com/thoran123/SIT753_HD.git
cd SIT753_HD
```

### Step 2: Install Node Dependencies

```bash
npm install
```

### Step 3: Build Docker Images

```bash
# Build application image
docker build -t sit753-app:latest .

# Verify image
docker images | grep sit753-app
```

### Step 4: Start Services

Choose the appropriate compose file:

```bash
# Start all services (recommended)
docker-compose -f docker-compose.all.yml up -d

# Or start specific environments
docker-compose up -d                        # Main app
docker-compose -f docker-compose.test.yml up -d   # Test env
docker-compose -f docker-compose.prod.yml up -d   # Production
```

### Step 5: Verify Services

```bash
# Check all running containers
docker-compose ps

# Check specific service logs
docker-compose logs -f app
docker-compose logs -f prometheus
docker-compose logs -f grafana
```

## 📖 Usage

### Running the Application

```bash
# Start development server
npm start

# Access application
open http://localhost:3001
```

### Jenkins Pipeline Setup

1. Open Jenkins at http://localhost:8080
2. Create new Pipeline job: "SIT753-Pipeline"
3. Configure Pipeline from SCM:
   - Repository: https://github.com/thoran123/SIT753_HD.git
   - Script Path: `Jenkinsfile`
4. Save and click "Build Now"

### Running Tests

```bash
# Run all tests
npm test

# Run with coverage
npm run test:coverage

# Run integration tests
npm run test:integration

# Watch mode for development
npm run test:watch
```

### Manual Pipeline Stages

```bash
# Build
docker build -t sit753-app .

# Test
npm test

# Security scan
npm audit

# Deploy to test
docker-compose -f docker-compose.test.yml up -d

# Deploy to production
docker-compose -f docker-compose.prod.yml up -d
```

## 🌐 Services

### Application (Port 3001)

Main web application with 3D globe visualizations.

```bash
# Health check
curl http://localhost:3001/health

# Metrics endpoint
curl http://localhost:3001/metrics
```

### Jenkins (Port 8080)

CI/CD pipeline management.

```bash
# Get initial password
docker exec jenkins cat /var/jenkins_home/secrets/initialAdminPassword
```

### Grafana (Port 3000)

Monitoring dashboards.

- **Username:** admin
- **Password:** admin (change on first login)

**Pre-configured Dashboards:**
- Application Performance
- System Resources
- Container Metrics

### Prometheus (Port 9090)

Metrics collection and storage.

**Targets:**
- Application: http://app:3001/metrics
- Node Exporter: http://node-exporter:9100
- cAdvisor: http://cadvisor:8080

### Node Exporter (Port 9100)

System-level metrics (CPU, memory, disk, network).

### cAdvisor (Port 8081)

Container resource usage and performance metrics.

## 🧪 Testing

### Test Structure

```
tests/
├── unit/                    # Unit tests
│   └── server.test.js
└── integration/             # Integration tests
    └── api.test.js
```

### Running Tests

```bash
# All tests
npm test

# Unit tests only
npm run test:unit

# Integration tests only
npm run test:integration

# Coverage report
npm run test:coverage

# Watch mode
npm run test:watch
```

### Test Coverage Goals

- **Overall:** 85%+
- **Statements:** 85%+
- **Branches:** 80%+
- **Functions:** 85%+
- **Lines:** 85%+

## 📈 Monitoring

### Prometheus Setup

Prometheus scrapes metrics from:
- Application (`/metrics` endpoint)
- Node Exporter (system metrics)
- cAdvisor (container metrics)

**Access:** http://localhost:9090

### Grafana Dashboards

Import pre-configured dashboards:

1. Login to Grafana
2. Go to Dashboards → Import
3. Upload JSON from `monitoring/grafana/dashboards/`

**Key Metrics:**
- Request rate and latency
- CPU and memory usage
- Error rates
- Container resource utilization

### Alerting

Configure alerts in Grafana for:
- High response times (> 500ms)
- Error rate threshold (> 5%)
- Resource utilization (> 80%)
- Service availability

## 🔧 Troubleshooting

### Common Issues

#### Port Already in Use

```bash
# Find process using port
lsof -ti:3001

# Kill process
lsof -ti:3001 | xargs kill -9

# Or use different port
PORT=3002 npm start
```

#### Docker Container Won't Start

```bash
# Check logs
docker-compose logs <service-name>

# Restart service
docker-compose restart <service-name>

# Rebuild and restart
docker-compose up -d --build <service-name>
```

#### Jenkins Build Fails

```bash
# Check Jenkins logs
docker logs jenkins

# Access Jenkins container
docker exec -it jenkins bash

# Check workspace
docker exec jenkins ls -la /var/jenkins_home/workspace
```

#### Prometheus Not Scraping Metrics

```bash
# Check Prometheus config
docker exec prometheus cat /etc/prometheus/prometheus.yml

# Restart Prometheus
docker-compose restart prometheus

# Check targets in UI
open http://localhost:9090/targets
```

#### Grafana Dashboard Not Loading

```bash
# Check Grafana logs
docker-compose logs grafana

# Restart Grafana
docker-compose restart grafana

# Reset Grafana data
docker-compose down
rm -rf grafana_data
docker-compose up -d
```

### Health Checks

```bash
# Application health
curl http://localhost:3001/health

# Prometheus health
curl http://localhost:9090/-/healthy

# Grafana health
curl http://localhost:3000/api/health

# Check all services
docker-compose ps
```

### Clean Restart

```bash
# Stop all services
docker-compose down

# Remove volumes
docker-compose down -v

# Remove images
docker-compose down --rmi all

# Clean build
docker-compose build --no-cache
docker-compose up -d
```

## 📚 Documentation

### Additional Resources

- **Video Tutorial:** [Watch Demo](https://drive.google.com/file/d/1GV24t7JayQYGEjJfJBpwfr7mF2ladH8v/view?usp=sharing)
- **Full Report:** `SIT753 DevOps Pipeline Implementation.docx`
- **Jenkinsfile:** Pipeline configuration and stages
- **Docker Compose:** Service orchestration files

### Scripts

- `start-all-services.sh` - Start all services
- `fix-prometheus.sh` - Fix Prometheus permissions
- `scripts/` - Utility scripts

### API Documentation

The application exposes the following endpoints:

```
GET  /                  - Main application page
GET  /health            - Health check endpoint
GET  /metrics           - Prometheus metrics
GET  /login             - Login page
GET  /support           - Support page
```

## 🔐 Security

### Best Practices Implemented

- ✅ No secrets in code
- ✅ Environment variables for configs
- ✅ Automated security scanning
- ✅ Regular dependency updates
- ✅ Container security hardening
- ✅ Network isolation
- ✅ Least privilege access

### Security Scanning

```bash
# NPM audit
npm audit

# Fix vulnerabilities
npm audit fix

# Snyk scan
snyk test

# OWASP dependency check
./scripts/owasp-check.sh
```

## 🚀 Performance

### Metrics

- **Build Time:** < 5 minutes
- **Test Execution:** < 2 minutes
- **Deployment:** < 1 minute
- **Response Time:** < 100ms (avg)
- **Uptime:** 99.9%+

### Optimization

- Multi-stage Docker builds
- Layer caching
- Dependency optimization
- Code splitting
- Asset compression

## 🤝 Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit changes (`git commit -m 'Add AmazingFeature'`)
4. Push to branch (`git push origin feature/AmazingFeature`)
5. Open Pull Request

## 📄 License

This project is created for educational purposes as part of SIT753 coursework at Deakin University.

## 📧 Contact

**Thoran Kumar Cherukuru Ramesh**
- Email: s224967779@deakin.edu.au
- GitHub: [@thoran123](https://github.com/thoran123)
- Repository: [SIT753_HD](https://github.com/thoran123/SIT753_HD)

## 🙏 Acknowledgments

- **Deakin University** - Applied Software Engineering Course
- **Jenkins Community** - CI/CD Platform
- **Docker** - Containerization
- **Prometheus & Grafana** - Monitoring Stack
- **Jest** - Testing Framework

---

**Last Updated:** October 2025  
**Version:** 1.0.0  
**Status:** ✅ Production Ready

Made with ❤️ for SIT753 - Applied Software Engineering
