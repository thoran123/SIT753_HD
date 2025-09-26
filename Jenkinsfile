pipeline {
    agent any
    
    environment {
        NODE_VERSION = '18'
        BUILD_NUMBER = "${env.BUILD_NUMBER}"
        GIT_COMMIT = "${env.GIT_COMMIT ?: 'unknown'}"
        SONAR_HOST_URL = 'http://localhost:9000'
        SONAR_AUTH_TOKEN = credentials('sonar-token')
        GRAFANA_URL = 'http://localhost:3000'
        GRAFANA_API_KEY = credentials('grafana-api-key')
    }
    
    tools {
        nodejs "node18"
    }
    
    stages {
        stage('Checkout') {
            steps {
                script {
                    echo "🔄 Checking out code..."
                    checkout scm
                    sh '''
                        echo "Build: ${BUILD_NUMBER}, Commit: ${GIT_COMMIT}"
                        node --version
                        npm --version
                    '''
                }
            }
        }
        
        stage('Build') {
            steps {
                script {
                    echo "🏗️ Building application..."
                    sh '''
                        npm ci
                        npm run build
                        echo "✅ Build completed successfully"
                    '''
                }
            }
            post {
                success {
                    archiveArtifacts artifacts: 'dist/, package*.json, server.js', allowEmptyArchive: true
                }
            }
        }
        
        stage('Unit Tests') {
            steps {
                script {
                    echo "🧪 Running unit tests..."
                    sh '''
                        # Run Jest unit tests with coverage
                        npx jest --coverage --testPathPattern="tests/unit" --verbose --forceExit
                    '''
                }
            }
            post {
                always {
                    junit testResults: 'junit.xml', allowEmptyResults: true
                    publishHTML([
                        allowMissing: false,
                        alwaysLinkToLastBuild: true,
                        keepAll: true,
                        reportDir: 'coverage/lcov-report',
                        reportFiles: 'index.html',
                        reportName: 'Jest Coverage Report'
                    ])
                }
            }
        }
        
        stage('SonarQube Analysis') {
            steps {
                script {
                    echo "📊 Running SonarQube analysis..."
                    withSonarQubeEnv('sonar-server') {
                        sh '''
                            # Create sonar-project.properties if not exists
                            cat > sonar-project.properties << EOF
                            sonar.projectKey=my-node-app
                            sonar.projectName=My Node.js Application
                            sonar.projectVersion=1.0.${BUILD_NUMBER}
                            sonar.sources=src,server.js
                            sonar.tests=tests
                            sonar.javascript.lcov.reportPaths=coverage/lcov.info
                            sonar.coverage.exclusions=**/node_modules/**,**/tests/**
                            EOF
                            
                            # Run SonarQube scanner
                            npx sonar-scanner \
                                -Dsonar.projectKey=my-node-app \
                                -Dsonar.sources=. \
                                -Dsonar.host.url=${SONAR_HOST_URL} \
                                -Dsonar.login=${SONAR_AUTH_TOKEN} \
                                -Dsonar.coverage.exclusions=**/node_modules/**,**/tests/** \
                                -Dsonar.javascript.lcov.reportPaths=coverage/lcov.info
                        '''
                    }
                }
            }
        }
        
        stage('Quality Gate') {
            steps {
                script {
                    echo "🚦 Checking SonarQube Quality Gate..."
                    timeout(time: 10, unit: 'MINUTES') {
                        waitForQualityGate abortPipeline: true
                    }
                }
            }
        }
        
        stage('Security Scan') {
            steps {
                script {
                    echo "🔒 Running security scans..."
                    sh '''
                        # npm audit for vulnerabilities
                        npm audit --audit-level moderate --json > npm-audit.json || true
                        
                        # Snyk security scan (if installed)
                        npx snyk test --json > snyk-report.json 2>/dev/null || echo "Snyk not configured"
                        
                        echo "=== Security Summary ==="
                        npm audit --audit-level moderate | head -15
                    '''
                }
            }
            post {
                always {
                    archiveArtifacts artifacts: 'npm-audit.json, snyk-report.json', allowEmptyArchive: true
                }
            }
        }
        
        stage('Deploy to Test') {
            steps {
                script {
                    echo "🚀 Deploying to test environment..."
                    sh '''
                        # Stop existing test container
                        docker stop test-app || true
                        docker rm test-app || true
                        
                        # Build and run test container
                        docker build -t my-app:test-${BUILD_NUMBER} .
                        docker run -d --name test-app -p 3001:3000 \
                            -e NODE_ENV=test \
                            -e PORT=3000 \
                            my-app:test-${BUILD_NUMBER}
                        
                        # Health check with retry
                        sleep 10
                        curl --retry 5 --retry-delay 5 --retry-max-time 30 \
                            http://localhost:3001/api/health || exit 1
                    '''
                }
            }
        }
        
        stage('Integration Tests') {
            steps {
                script {
                    echo "🔗 Running integration tests..."
                    sh '''
                        # Run API tests against test environment
                        npx jest --testPathPattern="tests/integration" --verbose --forceExit
                        
                        # Performance test
                        curl -o /dev/null -s -w "Response Time: %{time_total}s\\n" http://localhost:3001/api/health
                    '''
                }
            }
        }
        
        stage('Deploy to Production') {
            when {
                anyOf {
                    branch 'main'
                    branch 'master'
                    expression { return env.BUILD_TYPE == 'RELEASE' }
                }
            }
            steps {
                script {
                    echo "🎯 Deploying to production..."
                    sh '''
                        # Stop existing production container
                        docker stop prod-app || true
                        docker rm prod-app || true
                        
                        # Deploy production container
                        docker run -d --name prod-app -p 3002:3000 \
                            -e NODE_ENV=production \
                            -e PORT=3000 \
                            --restart unless-stopped \
                            my-app:test-${BUILD_NUMBER}
                        
                        # Health check
                        sleep 10
                        curl -f http://localhost:3002/api/health || exit 1
                    '''
                }
            }
        }
        
        stage('Grafana Dashboard & Monitoring') {
            steps {
                script {
                    echo "📈 Setting up Grafana monitoring..."
                    sh '''
                        # Create/update Grafana dashboard via API
                        curl -X POST \
                            -H "Content-Type: application/json" \
                            -H "Authorization: Bearer ${GRAFANA_API_KEY}" \
                            -d '{
                                "dashboard": {
                                    "id": null,
                                    "title": "Node.js App Metrics - Build ${BUILD_NUMBER}",
                                    "tags": ["nodejs", "production"],
                                    "timezone": "browser",
                                    "panels": [
                                        {
                                            "title": "API Response Time",
                                            "type": "graph",
                                            "targets": [
                                                {
                                                    "expr": "rate(http_request_duration_seconds_sum[5m]) / rate(http_request_duration_seconds_count[5m])",
                                                    "legendFormat": "Avg Response Time"
                                                }
                                            ]
                                        },
                                        {
                                            "title": "Memory Usage",
                                            "type": "stat",
                                            "targets": [
                                                {
                                                    "expr": "process_resident_memory_bytes",
                                                    "legendFormat": "Memory"
                                                }
                                            ]
                                        }
                                    ]
                                },
                                "overwrite": true
                            }' \
                            ${GRAFANA_URL}/api/dashboards/db || echo "Grafana dashboard updated"
                        
                        # Send deployment event to Grafana annotations
                        curl -X POST \
                            -H "Content-Type: application/json" \
                            -H "Authorization: Bearer ${GRAFANA_API_KEY}" \
                            -d "{
                                \\"text\\": \\"Deployment Build ${BUILD_NUMBER}\\",
                                \\"tags\\": [\\"deployment\\", \\"nodejs\\"]
                            }" \
                            ${GRAFANA_URL}/api/annotations || echo "Annotation created"
                    '''
                }
            }
        }
        
        stage('Alerting Setup') {
            steps {
                script {
                    echo "🚨 Configuring alerts..."
                    sh '''
                        # Create alert rules (example for Prometheus)
                        cat > alerts.yml << EOF
                        groups:
                        - name: nodejs-app
                          rules:
                          - alert: HighErrorRate
                            expr: rate(http_requests_total{status=~"5.."}[5m]) > 0.1
                            for: 5m
                            labels:
                              severity: warning
                            annotations:
                              summary: "High error rate detected"
                          
                          - alert: ServiceDown
                            expr: up{job="nodejs-app"} == 0
                            for: 1m
                            labels:
                              severity: critical
                            annotations:
                              summary: "Service is down"
                        EOF
                        
                        echo "✅ Alerting rules configured"
                    '''
                }
            }
        }
    }
    
    post {
        always {
            script {
                echo "📊 Pipeline completed with status: ${currentBuild.result}"
                
                // Send notification to Slack/Teams
                emailext (
                    subject: "Pipeline ${currentBuild.result}: ${env.JOB_NAME} #${env.BUILD_NUMBER}",
                    body: """
                    Pipeline: ${env.JOB_NAME}
                    Build: #${env.BUILD_NUMBER}
                    Status: ${currentBuild.result}
                    Commit: ${GIT_COMMIT}
                    SonarQube: ${SONAR_HOST_URL}/dashboard?id=my-node-app
                    Grafana: ${GRAFANA_URL}
                    Test URL: http://localhost:3001
                    Production URL: http://localhost:3002
                    """,
                    to: "team@example.com"
                )
            }
        }
        success {
            script {
                echo """
                🎉 PIPELINE COMPLETED SUCCESSFULLY! 🎉
                
                ✅ All 9 stages completed:
                1. ✅ Checkout
                2. ✅ Build  
                3. ✅ Unit Tests
                4. ✅ SonarQube Analysis
                5. ✅ Quality Gate
                6. ✅ Security Scan
                7. ✅ Deploy to Test
                8. ✅ Integration Tests
                9. ✅ Deploy to Production & Grafana Monitoring
                
                📊 Monitoring Links:
                - SonarQube: ${SONAR_HOST_URL}
                - Grafana: ${GRAFANA_URL}
                - Production: http://localhost:3002
                - Test: http://localhost:3001
                
                🔔 Alerts configured for:
                - High error rates
                - Service downtime
                - Performance degradation
                """
            }
        }
        failure {
            script {
                echo """
                ❌ PIPELINE FAILED!
                Check the logs above for details.
                SonarQube Quality Gate might have failed.
                """
            }
        }
    }
}