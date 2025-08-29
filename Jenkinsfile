pipeline {
    agent any

    environment {
        NODE_VERSION = '22'
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

        stage('Quality Assurance') {
            agent {
                docker {
                    image "sonarsource/sonar-scanner-cli"
                    args "--network=devops-infra_default"
                    reuseNode true
                }
            }
            steps {
                withSonarQubeEnv("${SONARQUBE}") {
                    sh 'sonar-scanner'
                }
            }
        }
        stage('Quality Gate') {
            steps {
                timeout(time: 30, unit: 'SECONDS') {
                    script {
                        def qg = waitForQualityGate()
                        if (qg.status != 'OK') {
                            echo "Quality Gate: ${qg.status}"
                        }
                    }
                }
            }
        }
        stage('Etapa de empaquetado y Delivery') {
            steps {
                sh "docker build -t ${DOCKER_REPO}:Dev ."
                sh "docker tag ${DOCKER_REPO}:Dev ${DOCKER_REGISTRY}/${DOCKER_REPO}:Dev"
                sh "docker tag ${DOCKER_REPO}:Dev localhost:8082/${DOCKER_REPO}:${BUILD_NUMBER}"
                script {
                    docker.withRegistry('', 'dock-hub-credentials') {
                        sh "docker build -t ${DOCKER_REPO}:Dev ."
                        sh "docker tag ${DOCKER_REPO}:Dev ${DOCKER_REGISTRY}/${DOCKER_REPO}:Dev"
                        sh "docker push ${DOCKER_REGISTRY}/${DOCKER_REPO}:${BUILD_NUMBER}"
                    }
                    docker.withRegistry('http://localhost:8082', 'nexus-hub-credentials') {
                        sh "docker build -t ${DOCKER_REPO}:Dev ."
                        sh "docker tag ${DOCKER_REPO}:Dev localhost:8082/${DOCKER_REPO}:Dev"
                        sh "docker push localhost:8082/${DOCKER_REPO}:${BUILD_NUMBER}"
                    }
                }
            }
        }
        stage('Despliegue continuo') {
            agent{
                docker{
                    image 'alpine/k8s:1.32.2'
                    reuseNode true
                }
            }
            steps {
                withKubeConfig([credentialsId: 'kubeconfig',]) {
                    sh "kubectl -n devops set image deployments backend-test backend-test=localhost:8082/backend-test:${BUILD_NUMBER}"
                }
            }
        }
    }
}
