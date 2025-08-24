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
    }

    stages {

        stage('Checkout') {
            steps {
                checkout scm
            }
        }

        stage('Install Dependencies & Test') {
            steps {
                sh '''
                    echo "Installing dependencies..."
                    npm ci

                    echo "Running tests with coverage..."
                    npm run test:cov

                    echo "Normalizing coverage paths for SonarQube..."
                    sed -i 's|SF:.*/src|SF:src|g' coverage/lcov.info
                    sed -i 's|\\\\|/|g' coverage/lcov.info
                '''
            }
        }

        stage('Build App') {
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
                            -Dsonar.token=${SONAR_AUTH_TOKEN}
                    '''
                }
            }
        }

        stage('Quality Gate') {
            steps {
                script {
                    echo "Waiting for SonarQube Quality Gate (timeout 10 min)..."
                    waitForQualityGate abortPipeline: true, timeout: 10 * 60
                }
            }
        }

        stage('Docker Build & Push') {
            steps {
                withCredentials([usernamePassword(credentialsId: 'nexus-credentials', usernameVariable: 'NEXUS_USER', passwordVariable: 'NEXUS_PASSWORD')]) {
                    sh '''
                        echo "Building Docker image..."
                        docker build -t ${IMAGE_NAME}:${BUILD_TAG} .

                        echo "Login to Nexus..."
                        echo $NEXUS_PASSWORD | docker login http://nexus_repo:8081 -u $NEXUS_USER --password-stdin

                        echo "Pushing image..."
                        docker push ${IMAGE_NAME}:${BUILD_TAG}

                        echo "Cleaning old images..."
                        docker rmi $(docker images ${IMAGE_NAME} --format "{{.Repository}}:{{.Tag}}" | sort -r | tail -n +6 || true) || true
                    '''
                }
            }
        }
    }

    post {
        always {
            sh 'docker logout http://nexus_repo:8081 || true'
        }
    }
}
