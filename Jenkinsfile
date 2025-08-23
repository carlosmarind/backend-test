pipeline {
    agent any
    stages {
        stage('Instalacion de dependencias') {
            agent {
                docker {
                    image 'node:22'
                    reuseNode true
                }
            }
            steps {
                sh 'npm install'
            }
        }
        stage('Ejecucion de pruebas automatizadas') {
            steps {
                sh 'npm run test:cov'
            }
        }
        stage('Construccion de aplicacion') {
            steps {
                sh 'npm run build'
            }
        }
        stage('Etapa de empaquetado y delivery') {
            steps {
                script{
                    docker.withRegistry('https://index.docker.io/v1/', 'dockerhub-credentials') {
                        sh 'docker build -t backend-test:Test .'
                        sh 'docker tag backend-test:Test landaura/backend-test:Dev'
                        sh 'docker push landaura/backend-test:Dev'
                    }
                }
            }
        }
    }
}