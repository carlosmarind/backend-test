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
                            -Dsonar.token=${SONAR_AUTH_TOKEN}
                    '''
                }
            }
        }

stage('Quality Gate') {
    steps {
        script {
            timeout(time: 2, unit: 'MINUTES') { // ⏳ ajusta a tu realidad
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
                    sh '''
                        echo "Building Docker image..."
                        docker build -t ${IMAGE_NAME}:${BUILD_TAG} -t ${IMAGE_NAME}:latest .

                        echo "Login to Nexus..."
                        echo $NEXUS_PASSWORD | docker login http://nexus_repo:8081 -u $NEXUS_USER --password-stdin

                        echo "Pushing image with build tag..."
                        docker push ${IMAGE_NAME}:${BUILD_TAG}

                        echo "Pushing image with latest tag..."
                        docker push ${IMAGE_NAME}:latest

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
