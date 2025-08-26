pipeline {
    agent any

    environment {
        NODE_VERSION = '20'
        DOCKER_REGISTRY = 'landaura'
        DOCKER_REPO = 'backend-test'
        SONARQUBE = 'SonarQube'  // nombre configurado en Jenkins para sonar
        KUBECONFIG = '/home/jenkins/.kube/config' // montado en el contenedor Jenkins
    }

    stages {
        stage('Instalación de dependencias') {
            agent {
                docker {
                    image "node:${NODE_VERSION}"
                    reuseNode true
                }
            }
            steps {
                sh 'npm ci'
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

            stage('Construcción de imagen Docker') {
                steps {
                    script {
                        docker.withRegistry('https://docker.io', 'dock-hub-credentials') {
                            sh "docker build -t ${DOCKER_REGISTRY}/backend-test:Dev ."
                            sh "docker tag backend-test-1:Dev ${DOCKER_REGISTRY}/backend-test:Dev"
                            sh "docker push ${DOCKER_REGISTRY}/backend-test:Dev"
                        }
                    }
                }
        }
    }
}
