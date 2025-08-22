pipeline {
    agent {
        docker {
            image 'edgardobenavidesl/node-with-docker-cli:22'
            args '-v /var/run/docker.sock:/var/run/docker.sock'
            reuseNode true
        }
    }

    environment {
        IMAGE_NAME = "edgardobenavidesl/backend-test"
        BUILD_TAG = "${new Date().format('yyyyMMddHHmmss')}"
    }

    stages {
        stage('Instalación de dependencias..') {
            steps {
                sh 'npm install'
            }
        }

        stage('Ejecución de pruebas automatizadas') {
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
            agent {
                docker {
                    image 'sonarsource/sonar-scanner-cli'
                    args '--network=devnet -v $WORKSPACE:/usr/src'
                    reuseNode true
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
                    // Docker Hub
                    docker.withRegistry('https://index.docker.io/v1/', 'dockerhub-credentials') {
                        // Build con tag único
                        def app = docker.build("${IMAGE_NAME}:${BUILD_TAG}")
                        
                        // Etiqueta como ebl y push
                        app.push("ebl")
                        app.push()
                    }

                    // Nexus
                    docker.withRegistry('http://nexus:8082', 'nexus-credentials') {
                        // Tag único en Nexus
                        sh "docker tag ${IMAGE_NAME}:${BUILD_TAG} nexus:8082/${IMAGE_NAME}:${BUILD_TAG}"
                        sh "docker push nexus:8082/${IMAGE_NAME}:${BUILD_TAG}"

                        // Actualiza tag ebl en Nexus
                        sh "docker tag ${IMAGE_NAME}:${BUILD_TAG} nexus:8082/${IMAGE_NAME}:ebl"
                        sh "docker push nexus:8082/${IMAGE_NAME}:latest"
                    }
                }
            }
        }
    }
}
