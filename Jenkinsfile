pipeline {
    agent any
    stages {
        stage('1. Build') {
            agent {
                docker {
                    image 'node:22'
                    reuseNode true
                }
            }
            stages{
                stage('Instalacion de dependencias') {
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
            }
        }
         stage('2. Packaging and delivery stage') {
             steps {

                sh 'docker build -t backend-test:cmd .'
                sh "docker tag backend-test:cmd cmilabaca/backend-test:${BUILD_NUMBER}"
                sh "docker tag backend-test:cmd localhost:8082/backend-test:${BUILD_NUMBER}"
                script {
                    docker.withRegistry('https://docker.io/v1/', 'docker-hub-credentials') {
                        sh "docker push cmilabaca/backend-test:${BUILD_NUMBER}"
                    }
                }
            }
         }
    }
}
