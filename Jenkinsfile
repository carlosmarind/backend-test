pipeline {
    agent {
        docker {
            image 'edgardobenavidesl/backend-test'
            args '-v /var/run/docker.sock:/var/run/docker.sock'
            reuseNode true
        }
    }

    environment {
        IMAGE_NAME = "edgardobenavidesl/backend-test"
    }

    stages {
        stage('Instalación de dependencias') {
            steps {
                sh 'npm ci'
            }
        }

        stage('Pruebas automatizadas') {
            steps {
                sh 'npm run test:cov'
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
                    sh '''
                        npm install -g sonar-scanner
                        sonar-scanner \
                            -Dsonar.projectKey=backend-test \
                            -Dsonar.sources=src \
                            -Dsonar.tests=src \
                            -Dsonar.test.inclusions=src/**/*.spec.ts \
                            -Dsonar.exclusions=coverage/**,src/config/configuration.ts,src/**/*.spec.ts,node_modules/** \
                            -Dsonar.coverage.exclusions=src/**/*.spec.ts \
                            -Dsonar.javascript.lcov.reportPaths=coverage/lcov.info \
                            -Dsonar.login=$SONAR_AUTH_TOKEN
                    '''
                }
            }
        }

        stage('Quality Gate') {
            steps {
                timeout(time: 10, unit: 'MINUTES') {
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
                        app.push("ebl")
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
