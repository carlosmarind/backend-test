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

        stage('Instalar dependencias') {
            steps {
                sh 'npm install'
            }
        }

        stage('Testing con cobertura') {
            steps {
                sh 'npm test -- --coverage'
            }
            post {
                always {
                    junit '**/test-results/**/*.xml' 
                }
            }
        }

        stage('Build') {
            steps {
                sh 'npm run build'
            }
        }
    }
}
