pipeline {
    agent {
        docker {
            image 'edgardobenavidesl/node-java-sonar-docker:latest'
            args '-v /var/run/docker.sock:/var/run/docker.sock --network devnet'
            reuseNode true
        }
    }

    environment {
        IMAGE_NAME = "edgardobenavidesl/backend-test"
        BUILD_TAG = "${new Date().format('yyyyMMddHHmmss')}"
        SONAR_HOST_URL = "http://sonarqube:9000"
        NEXUS_IP = "172.20.0.4"   // IP del contenedor Nexus en la red devnet
        NEXUS_PORT = "8082"
    }

    stages {

        stage('Checkout SCM') {
            steps {
                checkout scm
            }
        }

        stage('Instalación de dependencias') {
            steps {
                sh '''
                    echo "Installing dependencies..."
                    npm ci
                '''
            }
        }

        stage('Ejecución de pruebas automatizadas') {
            steps {
                sh '''
                    echo "Running tests with coverage..."
                    npm run test:cov

                    echo "Normalizing coverage paths for SonarQube..."
                    sed -i 's|SF:.*/src|SF:src|g' coverage/lcov.info
                    sed -i 's|\\\\|/|g' coverage/lcov.info
                '''
            }
        }

        stage('Construcción de aplicación') {
            steps {
                sh 'npm run build'
            }
        }

        stage('SonarQube Analysis') {
            steps {
                withSonarQubeEnv('SonarQube') {
                    sh '''
                        echo "Running SonarQube analysis..."
                        sonar-scanner \
                            -Dsonar.projectKey=backend-test \
                            -Dsonar.sources=src \
                            -Dsonar.tests=src \
                            -Dsonar.test.inclusions=**/*.spec.ts \
                            -Dsonar.javascript.lcov.reportPaths=coverage/lcov.info \
                            -Dsonar.exclusions=node_modules/**,dist/** \
                            -Dsonar.coverage.exclusions=**/*.spec.ts \
                            -Dsonar.host.url=${SONAR_HOST_URL} \
                            -Dsonar.login=${SONAR_AUTH_TOKEN}
                    '''
                }
            }
        }

        stage('Quality Gate') {
            steps {
                script {
                    timeout(time: 2, unit: 'MINUTES') {
                        echo "Checking SonarQube Quality Gate..."
                        def qg = waitForQualityGate abortPipeline: true
                        if (qg.status != "OK") {
                            error "Quality Gate failed: ${qg.status}"
                        }
                    }
                }
            }
        }

        stage('Docker Build & Push') {
            steps {
                withCredentials([usernamePassword(credentialsId: 'nexus-credentials', usernameVariable: 'NEXUS_USER', passwordVariable: 'NEXUS_PASSWORD')]) {
                    sh """
                        echo 'Building Docker image...'
                        docker build -t backend-test:latest .

                        echo 'Login to Nexus...'
                        echo \$NEXUS_PASSWORD | docker login http://${NEXUS_IP}:${NEXUS_PORT} -u \$NEXUS_USER --password-stdin

                        docker tag backend-test:latest ${NEXUS_IP}:${NEXUS_PORT}/dockerreponexus/backend-test:latest
                        docker push ${NEXUS_IP}:${NEXUS_PORT}/dockerreponexus/backend-test:latest
                    """
                }
            }
        }

    }

    post {
        always {
            sh 'docker logout http://${NEXUS_IP}:${NEXUS_PORT} || true'
        }
    }
}
