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
                script {
                    docker.image('node:22').inside {
                        sh 'npm install'
                    }
                }
            }
        }

        stage('Testing con cobertura') {
            steps {
                script {
                    docker.image('node:22').inside {
                        sh 'mkdir -p test-results'
                        sh 'npm test -- --coverage'
                    }
                }
            }
            post {
                always {
                    junit 'test-results/junit.xml'
                }
            }
        }


        stage('Build') {
            steps {
                script {
                    docker.image('node:22').inside {
                        sh 'npm run build'
                    }
                }
            }
        }
    }
}
