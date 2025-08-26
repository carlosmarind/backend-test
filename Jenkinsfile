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

            stage('Etapa de empaquetado y Delivery') {
                steps {
                    script {
                        docker.withRegistry('', 'dock-hub-credentials') {
                            sh "docker build -t ${DOCKER_REPO}:Dev ."
                            sh "docker tag ${DOCKER_REPO}:Dev ${DOCKER_REGISTRY}/${DOCKER_REPO}:Dev"
                            sh "docker push ${DOCKER_REGISTRY}/${DOCKER_REPO}:Dev"
                        }
                    }
                }
        }
    }
}
