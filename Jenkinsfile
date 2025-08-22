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
        stage('Instalación de dependencias..') {
            steps { sh 'npm install' }
        }
 
        stage('Ejecución de pruebas automatizadas') {
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
                    docker.withRegistry('https://index.docker.io/v1/', 'dockerhub-credentials') {
                        def app = docker.build("${IMAGE_NAME}:${BUILD_NUMBER}")
                        app.push()          
                        app.push("gdd")  
                    }
                }
                script {
                    docker.withRegistry('http://localhost:8082', 'nexus-credentials') {
                        def app = docker.build("${IMAGE_NAME}:${BUILD_NUMBER}")
                        
                        sh "docker tag ${IMAGE_NAME}:${BUILD_NUMBER} localhost:8082/${IMAGE_NAME}:latest"
                        sh "docker push localhost:8082/${IMAGE_NAME}:${BUILD_NUMBER}"
                        sh "docker push localhost:8082/${IMAGE_NAME}:latest"
                    }
                }
            }
        }
    }
}