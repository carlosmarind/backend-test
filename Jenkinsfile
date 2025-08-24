pipeline {
    agent {
        docker {
            image 'edgardobenavidesl/node-java-sonar-docker:latest'
            args '-v /var/run/docker.sock:/var/run/docker.sock --network devnet'
            reuseNode true
        }
    }

    environment {
        IMAGE_NAME = "backend-test"
        BUILD_TAG = "${new Date().format('yyyyMMddHHmmss')}"
        SONAR_HOST_URL = "http://sonarqube:9000/"
    }

    stages {
        stage('Checkout') {
            steps {
                checkout scm
            }
        }

        stage('Install dependencies') {
            steps {
                sh 'echo Installing dependencies...'
                sh 'npm ci'
            }
        }

        stage('Run tests & coverage') {
            steps {
                sh 'echo Running tests with coverage...'
                sh 'npm run test:cov'
                sh 'echo Normalizing coverage paths for SonarQube...'
                sh "sed -i 's|SF:.*/src|SF:src|g' coverage/lcov.info"
                sh "sed -i 's|\\\\|/|g' coverage/lcov.info"
            }
        }

        stage('Build app') {
            steps {
                sh 'npm run build'
            }
        }

        stage('SonarQube Analysis') {
            environment {
                SONAR_TOKEN = credentials('sonar-token')
            }
            steps {
                withSonarQubeEnv('SonarQube') {
                    sh """
                    echo Running SonarQube analysis...
                    sonar-scanner \
                        -Dsonar.projectKey=${IMAGE_NAME} \
                        -Dsonar.sources=src \
                        -Dsonar.tests=src \
                        -Dsonar.test.inclusions=**/*.spec.ts \
                        -Dsonar.javascript.lcov.reportPaths=coverage/lcov.info \
                        -Dsonar.exclusions=node_modules/**,dist/** \
                        -Dsonar.coverage.exclusions=**/*.spec.ts \
                        -Dsonar.host.url=${SONAR_HOST_URL} \
                        -Dsonar.login=${SONAR_TOKEN}
                    """
                }
            }
        }

        stage('Quality Gate') {
            steps {
                timeout(time: 2, unit: 'MINUTES') {
                    waitForQualityGate abortPipeline: true
                }
            }
        }

        stage('Docker Build & Push') {
            steps {
                withCredentials([usernamePassword(credentialsId: 'nexus-credentials', usernameVariable: 'NEXUS_USER', passwordVariable: 'NEXUS_PASSWORD')]) {
                    sh """
                    echo Building Docker image...
                    docker build -t ${IMAGE_NAME}:latest .
                    
                    echo Logging into Nexus...
                    echo $NEXUS_PASSWORD | docker login http://localhost:8082 -u $NEXUS_USER --password-stdin
                    
                    docker tag ${IMAGE_NAME}:latest localhost:8082/${IMAGE_NAME}:latest
                    docker push localhost:8082/${IMAGE_NAME}:latest
                    
                    docker logout http://localhost:8082
                    """
                }
            }
        }
    }

    post {
        always {
            cleanWs()
        }
        success {
            echo 'Pipeline finished successfully.'
        }
        failure {
            echo 'Pipeline failed.'
        }
    }
}
