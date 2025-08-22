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
            steps { sh 'npm install' }
        }

        stage('Pruebas automatizadas') {
            steps { sh 'npm run test:cov' }
        }

        stage('Construcción de aplicación') {
            steps { sh 'npm run build' }
        }

        stage('Quality Assurance') {
            agent {
                docker {
                    image 'sonarsource/sonar-scanner-cli'
                    args '--network=dockercompose_devnet'
                }
            }
            steps {
                withSonarQubeEnv('SonarQube') {
                    sh 'sonar-scanner'
                }
            }
        }

        stage('Empaquetado y push Docker') {
            steps {
                script {
                    // Construir la imagen una sola vez
                    def app = docker.build("${IMAGE_NAME}:${BUILD_NUMBER}")

                    // Push a Docker Hub
                    docker.withRegistry('https://index.docker.io/v1/', 'dockerhub-credentials') {
                        app.push()          // push con tag ${BUILD_NUMBER}
                        app.push("gdd")     // push con tag "gdd"
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
