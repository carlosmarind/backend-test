pipeline {
    agent any

    environment {
        NODE_OPTIONS = "--max-old-space-size=4096"
    }

    stages {
        stage('Checkout') {
            steps {
                git branch: 'main', url: 'https://github.com/Mondacars0165/backend-test.git'
            }
        }

        stage('Etapa  de construccion / build') {
            agent {
                docker {
                     image 'node:22'
                     reuseNode true 
                }
            }
            stages {
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
    }
}
