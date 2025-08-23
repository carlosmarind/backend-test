pipeline {
    agent {
        docker {
            image 'gdiaz90/node-with-docker-cli:22'
            args '-v /var/run/docker.sock:/var/run/docker.sock'
            reuseNode true
        }
    }
    environment {
        IMAGE_NAME = "gdiaz90/backend-test"
    }
    stages {
        stage('Instalación de dependencias') {
            steps { 
                sh 'npm install' 
            }
        }

        stage('Pruebas automatizadas') {
            steps {
                sh '''
                    export JEST_JUNIT_OUTPUT_DIR=reports
                    export JEST_JUNIT_OUTPUT_NAME=junit.xml
                    export JEST_JUNIT_SUITE_NAME=backend-test
                    npm run test:cov
                '''
            }
        }

        stage('Construcción de aplicación') {
            steps { 
                sh 'npm run build' 
            }
        }

        stage('Quality Assurance') {
            steps {
                withSonarQubeEnv('SonarQube') { 
                    script {
                        docker.image('sonarsource/sonar-scanner-cli:latest').inside('--network dockercompose_devnet') {
                            sh '''
                                sonar-scanner \
                                -Dsonar.projectKey=backend-test \
                                -Dsonar.sources=src \
                                -Dsonar.tests=src \
                                -Dsonar.test.inclusions=src/**/*.spec.ts \
                                -Dsonar.javascript.lcov.reportPaths=coverage/lcov.info \
                                -Dsonar.testExecutionReportPaths=reports/junit.xml \
                                -Dsonar.login=$SONAR_AUTH_TOKEN \
                                -Dsonar.host.url=$SONAR_HOST_URL
                            '''
                        }
                    }
                }
            }
        }

        stage('Quality Gate'){
            steps {
                timeout(time: 2, unit: 'MINUTES') {
                    waitForQualityGate abortPipeline: true
                }
            }
        }

        stage('Empaquetado y push Docker') {
            steps {
                script {
                    def app = docker.build("${IMAGE_NAME}:${BUILD_NUMBER}")

                    docker.withRegistry('https://index.docker.io/v1/', 'dockerhub-credentials') {
                        app.push()
                        app.push("gdd")
                    }

                    docker.withRegistry('http://localhost:8082', 'nexus-credentials') {
                        sh "docker tag ${IMAGE_NAME}:${BUILD_NUMBER} localhost:8082/${IMAGE_NAME}:${BUILD_NUMBER}"
                        sh "docker tag ${IMAGE_NAME}:${BUILD_NUMBER} localhost:8082/${IMAGE_NAME}:latest"

                        sh "docker push localhost:8082/${IMAGE_NAME}:${BUILD_NUMBER}"
                        sh "docker push localhost:8082/${IMAGE_NAME}:latest"
                    }
                }
            }
        }
    }
}
