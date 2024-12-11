pipeline {
    agent any
    environment {
        SONAR_TOKEN = credentials('sqp_7f124a2ffd0c4621f551dbbabd5debfda324220d')
        DOCKER_REGISTRY = 'http://localhost:8081/' 
        DOCKER_CREDENTIALS = credentials('sqp_7f124a2ffd0c4621f551dbbabd5debfda324220d')
    }
    stages {
        stage('Checkout') {
            steps {
                checkout scm
            }
        }
        stage('Install Dependencies') {
            steps {
                powershell '''
                    Write-Output "Installing dependencies..."
                    npm install
                '''
            }
        }
        stage('Run Tests') {
            steps {
                powershell '''
                    Write-Output "Installing dependencies..."
                    npm install

                    Write-Output "Running tests..."
                    npm test
                '''
            }
        }
        stage('SonarQube Analysis') {
            steps {
                withSonarQubeEnv('SonarQube') {
                    powershell '''
                        Write-Output "Running SonarQube analysis..."
                        sonar-scanner -Dsonar.projectKey=backend-test `
                                      -Dsonar.sources=. `
                                      -Dsonar.host.url=${SONAR_HOST_URL} `
                                      -Dsonar.login=${SONAR_TOKEN}
                    '''
                }
            }
        }
        stage('Quality Gate') {
            steps {
                script {
                    def qg = waitForQualityGate()
                    if (qg.status != 'OK') {
                        error "Pipeline aborted due to quality gate failure: ${qg.status}"
                    }
                }
            }
        }
        stage('Build Docker Image') {
            steps {
                powershell '''
                    Write-Output "Building Docker image..."
                    docker build -t ${DOCKER_REGISTRY}/backend-test:latest .
                '''
            }
        }
        stage('Push Docker Image') {
            steps {
                script {
                    def buildNumber = env.BUILD_NUMBER
                    withDockerRegistry([credentialsId: 'sqp_7f124a2ffd0c4621f551dbbabd5debfda324220d', url: "https://${DOCKER_REGISTRY}"]) {
                        powershell '''
                            Write-Output "Pushing Docker image with tag 'latest'..."
                            docker push ${DOCKER_REGISTRY}/backend-test:latest
                        '''
                        powershell '''
                            Write-Output "Tagging and pushing Docker image with build number..."
                            docker tag ${DOCKER_REGISTRY}/backend-test:latest ${DOCKER_REGISTRY}/backend-test:${buildNumber}
                            docker push ${DOCKER_REGISTRY}/backend-test:${buildNumber}
                        '''
                    }
                }
            }
        }
    }
    post {
        always {
            cleanWs()
        }
    }
}
