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
                    // Montamos workspace para que el scanner vea el código
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
                    // Push a DockerHub
                    docker.withRegistry('https://index.docker.io/v1/', 'dockerhub-credentials') {
                        def app = docker.build("${IMAGE_NAME}:${BUILD_NUMBER}")
                        app.push()
                        app.push("ebl")
                    }
                }
                script {
                    // Push a Nexus
                    docker.withRegistry('http://nexus:8082', 'nexus-credentials') {
                        sh "docker tag ${IMAGE_NAME}:${BUILD_NUMBER} nexus:8082/${IMAGE_NAME}:ebl"
                        sh "docker push nexus:8082/${IMAGE_NAME}:ebl"
                    }
                }
            }
        }
    }
}
