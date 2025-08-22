pipeline {
    agent {
        docker {
            image 'node:18'
            args '-v /var/run/docker.sock:/var/run/docker.sock'
            reuseNode true
        }
    }

    environment {
        IMAGE_NAME = "edgardobenavidesl/backend-test"
        SONAR_HOST_URL = "http://sonarqube:9000"  // Ajusta si usas otro host
        SONAR_SCANNER_IMAGE = "sonarsource/sonar-scanner-cli:latest"
    }

    stages {

        stage('Instalación de dependencias') {
            steps {
                sh 'npm ci'
            }
        }

        stage('Pruebas + Cobertura') {
            steps {
                sh 'npm run test:cov' // Genera coverage/lcov.info
            }
            post {
                always {
                    archiveArtifacts artifacts: 'coverage/**', allowEmptyArchive: true
                }
            }
        }

        stage('Análisis SonarQube') {
            steps {
                withSonarQubeEnv('SonarQube') {
                    script {
                        docker.image(SONAR_SCANNER_IMAGE).inside('--network dockercompose_devnet') {
                            sh '''
                                sonar-scanner \
                                  -Dsonar.projectKey=backend-test \
                                  -Dsonar.projectName=backend-nest \
                                  -Dsonar.projectVersion=2.0.0 \
                                  -Dsonar.sources=src \
                                  -Dsonar.exclusions=node_modules/**,coverage/**,src/**/*.spec.ts,src/config/configuration.ts \
                                  -Dsonar.tests=src \
                                  -Dsonar.test.inclusions=src/**/*.spec.ts \
                                  -Dsonar.javascript.lcov.reportPaths=coverage/lcov.info \
                                  -Dsonar.typescript.lcov.reportPaths=coverage/lcov.info \
                                  -Dsonar.sourceEncoding=UTF-8 \
                                  -Dsonar.verbose=false
                            '''
                        }
                    }
                }
            }
        }

        stage('Quality Gate') {
            steps {
                timeout(time: 3, unit: 'MINUTES') {
                    waitForQualityGate abortPipeline: true
                }
            }
        }

        stage('Construcción Docker') {
            steps {
                script {
                    def app = docker.build("${IMAGE_NAME}:${BUILD_NUMBER}")
                    docker.withRegistry('https://index.docker.io/v1/', 'dockerhub-credentials') {
                        app.push()
                        app.push("latest")
                    }
                }
            }
        }

        stage('Push a Nexus') {
            steps {
                script {
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
