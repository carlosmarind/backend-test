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
                sh 'docker build -t backend-test:Dev .'
                sh 'docker tag backend-test:Dev backend-test:LA'
                sh 'docker push backend-test:LA'
            }
        }
    }
}