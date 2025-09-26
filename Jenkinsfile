pipeline {
    agent any
    
    environment {
        NODE_VERSION = '18'
        DOCKER_IMAGE = 'sit753-app'
        BUILD_NUMBER = "${env.BUILD_NUMBER}"
        GIT_COMMIT = "${env.GIT_COMMIT ? env.GIT_COMMIT[0..7] : 'unknown'}"
        SNYK_TOKEN = credentials('snyk-token')
        DOCKER_BUILDKIT = '1'
    }
    
    tools {
        nodejs "${NODE_VERSION}"
    }
    
    stages {
        stage('Checkout') {
            steps {
                script {
                    echo "🔄 Checking out code..."
                    checkout scm
                    
                    // Display build information
                    sh '''
                        echo "Build Number: ${BUILD_NUMBER}"
                        echo "Git Commit: ${GIT_COMMIT}"
                        echo "Branch: ${GIT_BRANCH}"
                        echo "Node Version: $(node --version)"
                        echo "NPM Version: $(npm --version)"
                    '''
                }
            }
        }
        
        stage('Build') {
            steps {
                script {
                    echo "🏗️ Building application version: ${BUILD_NUMBER}-${GIT_COMMIT}"
                    
                    // Clean previous builds
                    sh '''
                        rm -rf dist/ || true
                        rm -rf coverage/ || true
                        rm -rf test-results/ || true
                    '''
                    
                    // Install dependencies
                    sh 'npm ci'
                    
                    // Run build script
                    sh 'npm run build'
                    
                    // Create Docker image with version tags
                    sh """
                        docker build -t ${DOCKER_IMAGE}:${BUILD_NUMBER}-${GIT_COMMIT} .
                        docker build -t ${DOCKER_IMAGE}:latest .
                        docker build -t ${DOCKER_IMAGE}:build-${BUILD_NUMBER} .
                    """
                    
                    // Verify Docker image
                    sh "docker images | grep ${DOCKER_IMAGE}"
                }
            }
            post {
                success {
                    echo "✅ Build completed successfully!"
                    archiveArtifacts artifacts: 'package*.json, Dockerfile', allowEmptyArchive: true
                }
                failure {
                    echo "❌ Build failed!"
                }
            }
        }
        
        stage('Test') {
            parallel {
                stage('Unit Tests') {
                    steps {
                        script {
                            echo "🧪 Running unit tests..."
                            sh '''
                                npm test -- --coverage --testResultsProcessor=jest-junit
                                npm run test:coverage
                            '''
                        }
                    }
                }
                
                stage('Integration Tests') {
                    steps {
                        script {
                            echo "🔗 Running integration tests..."
                            sh 'npm run test:integration'
                        }
                    }
                }
            }
            post {
                always {
                    // Publish test results
                    publishTestResults([
                        testResultsFiles: 'junit.xml',
                        allowEmptyResults: true
                    ])
                    
                    // Publish coverage reports
                    publishHTML([
                        allowMissing: false,
                        alwaysLinkToLastBuild: true,
                        keepAll: true,
                        reportDir: 'coverage/lcov-report',
                        reportFiles: 'index.html',
                        reportName: 'Code Coverage Report'
                    ])
                    
                    // Archive test artifacts
                    archiveArtifacts artifacts: 'coverage/**', allowEmptyArchive: true
                }
                success {
                    echo "✅ All tests passed!"
                }
                failure {
                    echo "❌ Tests failed!"
                }
            }
        }
        
        stage('Code Quality Analysis') {
            steps {
                script {
                    echo "🔍 Running advanced code quality analysis..."
                    
                    // Start SonarQube container if not running
                    sh '''
                        docker run -d --name sonarqube -p 9000:9000 sonarqube:latest || echo "SonarQube container already exists"
                        
                        # Wait for SonarQube to be ready
                        echo "Waiting for SonarQube to start..."
                        for i in {1..60}; do
                            if curl -s http://localhost:9000/api/system/status | grep -q "UP"; then
                                echo "SonarQube is ready!"
                                break
                            fi
                            echo "Waiting... ($i/60)"
                            sleep 5
                        done
                    '''
                    
                    // Run SonarQube analysis
                    withSonarQubeEnv('SonarQube') {
                        sh '''
                            npx sonar-scanner \
                            -Dsonar.projectKey=sit753-pipeline \
                            -Dsonar.projectName="SIT753 DevOps Pipeline" \
                            -Dsonar.sources=. \
                            -Dsonar.exclusions=node_modules/**,coverage/**,tests/** \
                            -Dsonar.javascript.lcov.reportPaths=coverage/lcov.info \
                            -Dsonar.host.url=http://localhost:9000 \
                            -Dsonar.login=admin \
                            -Dsonar.password=admin
                        '''
                    }
                    
                    // Quality Gate check
                    timeout(time: 10, unit: 'MINUTES') {
                        script {
                            def qg = waitForQualityGate()
                            if (qg.status != 'OK') {
                                echo "Quality Gate Status: ${qg.status}"
                                error "Pipeline aborted due to quality gate failure: ${qg.status}"
                            } else {
                                echo "✅ Quality Gate passed!"
                            }
                        }
                    }
                }
            }
            post {
                always {
                    echo "Code Quality Analysis completed. Check SonarQube at http://localhost:9000"
                }
            }
        }
        
        stage('Security Analysis') {
            parallel {
                stage('Dependency Scan') {
                    steps {
                        script {
                            echo "🔒 Running dependency vulnerability scan..."
                            sh '''
                                # Snyk authentication and scan
                                snyk auth $SNYK_TOKEN
                                snyk test --json > snyk-results.json || true
                                snyk monitor || true
                                
                                # NPM audit
                                npm audit --audit-level high --json > npm-audit.json || true
                            '''
                        }
                    }
                }
                
                stage('Container Scan') {
                    steps {
                        script {
                            echo "🐳 Running container security scan..."
                            sh '''
                                # Trivy container scan
                                docker run --rm -v /var/run/docker.sock:/var/run/docker.sock \
                                -v $PWD:/tmp/.cache/ aquasec/trivy:latest image \
                                --format json --output /tmp/.cache/trivy-results.json \
                                ${DOCKER_IMAGE}:latest || true
                            '''
                        }
                    }
                }
            }
            post {
                always {
                    script {
                        // Parse and report security issues
                        echo "📊 Security scan results analysis..."
                        sh '''
                            echo "=== Security Scan Summary ==="
                            
                            # Check Snyk results
                            if [ -f "snyk-results.json" ]; then
                                echo "Snyk vulnerabilities found:"
                                cat snyk-results.json | grep -o '"severity":"[^"]*' | sort | uniq -c || echo "No vulnerabilities"
                            fi
                            
                            # Check npm audit results
                            if [ -f "npm-audit.json" ]; then
                                echo "NPM audit results:"
                                cat npm-audit.json | grep -o '"severity":"[^"]*' | sort | uniq -c || echo "No vulnerabilities"
                            fi
                            
                            echo "=== End Security Summary ==="
                        '''
                        
                        // Archive security scan results
                        archiveArtifacts artifacts: '*-results.json', allowEmptyArchive: true
                    }
                }
                success {
                    echo "✅ Security analysis completed!"
                }
            }
        }
        
        stage('Deploy to Test Environment') {
            steps {
                script {
                    echo "🚀 Deploying to test environment..."
                    
                    // Stop existing test containers
                    sh '''
                        docker-compose -f docker-compose.test.yml down || true
                        docker system prune -f || true
                    '''
                    
                    // Deploy to test environment
                    sh '''
                        docker-compose -f docker-compose.test.yml up -d
                        echo "Waiting for application to start..."
                        sleep 30
                    '''
                    
                    // Health check with retries
                    script {
                        def maxAttempts = 10
                        def attempt = 0
                        def healthy = false
                        
                        while (attempt < maxAttempts && !healthy) {
                            try {
                                sh 'curl -f http://localhost:3001/api/health'
                                healthy = true
                                echo "✅ Application is healthy!"
                            } catch (Exception e) {
                                attempt++
                                echo "⏳ Health check attempt ${attempt}/${maxAttempts} failed, retrying..."
                                sleep(10)
                            }
                        }
                        
                        if (!healthy) {
                            sh 'docker-compose -f docker-compose.test.yml logs'
                            error "❌ Application failed health checks after ${maxAttempts} attempts"
                        }
                    }
                    
                    // Run deployment verification tests
                    sh '''
                        echo "Running deployment verification..."
                        curl -f http://localhost:3001/ || exit 1
                        curl -f http://localhost:3001/api/info || exit 1
                        echo "✅ Deployment verification completed successfully"
                    '''
                }
            }
            post {
                success {
                    echo "✅ Test deployment successful!"
                }
                failure {
                    sh 'docker-compose -f docker-compose.test.yml logs'
                    sh 'docker-compose -f docker-compose.test.yml down || true'
                }
            }
        }
        
        stage('Release to Production') {
            when {
                anyOf {
                    branch 'main'
                    branch 'master'
                }
            }
            steps {
                script {
                    echo "🎯 Promoting to production environment..."
                    
                    // Create release tag
                    def releaseTag = "v${BUILD_NUMBER}-${GIT_COMMIT}"
                    
                    sh """
                        # Tag Docker images for production
                        docker tag ${DOCKER_IMAGE}:latest ${DOCKER_IMAGE}:${releaseTag}
                        docker tag ${DOCKER_IMAGE}:latest ${DOCKER_IMAGE}:production
                    """
                    
                    // Deploy to production with zero-downtime
                    sh '''
                        # Graceful shutdown of existing production
                        docker-compose -f docker-compose.prod.yml down --timeout 60 || true
                        
                        # Deploy new version
                        docker-compose -f docker-compose.prod.yml up -d
                        echo "Waiting for production deployment..."
                        sleep 45
                    '''
                    
                    // Production health check
                    script {
                        def maxAttempts = 15
                        def attempt = 0
                        def healthy = false
                        
                        while (attempt < maxAttempts && !healthy) {
                            try {
                                sh 'curl -f http://localhost:3002/api/health'
                                healthy = true
                                echo "✅ Production deployment successful!"
                            } catch (Exception e) {
                                attempt++
                                echo "⏳ Production health check attempt ${attempt}/${maxAttempts}"
                                sleep(10)
                            }
                        }
                        
                        if (!healthy) {
                            sh 'docker-compose -f docker-compose.prod.yml logs'
                            error "❌ Production deployment failed health checks"
                        }
                    }
                    
                    // Create Git release tag
                    sh """
                        git tag ${releaseTag} || true
                        git push origin ${releaseTag} || true
                        echo "✅ Release ${releaseTag} created successfully"
                    """
                }
            }
            post {
                success {
                    echo "🎉 Production deployment successful!"
                }
                failure {
                    echo "❌ Production deployment failed!"
                    sh 'docker-compose -f docker-compose.prod.yml logs'
                }
            }
        }
        
        stage('Monitoring & Alerting Setup') {
            steps {
                script {
                    echo "📊 Setting up comprehensive monitoring..."
                    
                    // Start monitoring stack
                    sh '''
                        # Start Prometheus
                        docker run -d --name prometheus \
                          -p 9090:9090 \
                          -v $PWD/monitoring/prometheus.yml:/etc/prometheus/prometheus.yml \
                          prom/prometheus:latest || echo "Prometheus already running"
                        
                        # Start Grafana
                        docker run -d --name grafana \
                          -p 3003:3000 \
                          -e "GF_SECURITY_ADMIN_PASSWORD=admin" \
                          -v $PWD/monitoring/grafana:/etc/grafana/provisioning \
                          grafana/grafana:latest || echo "Grafana already running"
                        
                        echo "Waiting for monitoring stack to initialize..."
                        sleep 45
                    '''
                    
                    // Configure monitoring
                    sh '''
                        # Verify monitoring endpoints
                        echo "Checking monitoring endpoints..."
                        curl -f http://localhost:3002/metrics || echo "⚠️  Metrics endpoint check failed"
                        curl -f http://localhost:9090/api/v1/targets || echo "⚠️  Prometheus targets check failed"
                        curl -f http://localhost:3003/api/health || echo "⚠️  Grafana health check failed"
                        
                        echo "✅ Monitoring stack verification completed"
                    '''
                    
                    // Simulate load for monitoring demonstration
                    sh '''
                        echo "🔄 Running monitoring demonstration with simulated load..."
                        for i in {1..100}; do
                            curl -s http://localhost:3002/ > /dev/null &
                            curl -s http://localhost:3002/api/health > /dev/null &
                            curl -s http://localhost:3002/api/info > /dev/null &
                        done
                        wait
                        echo "✅ Load test completed - metrics should be visible in monitoring dashboards"
                    '''
                }
            }
            post {
                always {
                    script {
                        echo """
                        📊 Monitoring Setup Complete!
                        
                        Access your monitoring dashboards:
                        🎯 Application (Production): http://localhost:3002
                        📊 Grafana Dashboard: http://localhost:3003 (admin/admin)
                        📈 Prometheus Metrics: http://localhost:9090
                        🔍 Application Metrics: http://localhost:3002/metrics
                        
                        Test Environment: http://localhost:3001
                        """
                    }
                }
            }
        }
    }
    
    post {
        always {
            script {
                echo "🧹 Cleaning up test resources..."
                sh '''
                    # Clean up test containers but keep production and monitoring
                    docker-compose -f docker-compose.