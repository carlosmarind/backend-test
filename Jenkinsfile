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
            steps { sh 'npm install' }
        }
 
        stage('Ejecución de pruebas automatizadas') {
            steps { sh 'npm run test:cov' }
        }
 
        stage('Construcción de aplicación') {
            steps { sh 'npm run build' }
        }
 
        stage('Empaquetado y push Docker') {
            steps {
                script {
                    docker.withRegistry('https://index.docker.io/v1/', 'dockerhub-credentials') {
                        def app = docker.build("${IMAGE_NAME}:${BUILD_NUMBER}")
                        app.push()          
                        app.push("ebl")  
                    }
                }
                script {
                    docker.withRegistry('http://localhost:8082', 'nexus-credentials') {
                        sh "docker tag ${IMAGE_NAME}:${BUILD_NUMBER} localhost:8082/${IMAGE_NAME}:${BUILD_NUMBER}"
                        sh "docker push localhost:8082/${IMAGE_NAME}:${BUILD_NUMBER}"
                    }
                }
            }
        }
    }
}
 