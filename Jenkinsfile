pipeline {
    agent any
    stages {
        stage('Etapa de construccion / build de aplicacion') {
            agent {
                docker {
                    image 'node:22'
                    reuseNode true
                }
            }
            stages{
                stage('Instalar dependencias') {
                    steps {
                        sh 'npm install'
                    }
                }
                stage('Testing') {
                    steps {
                        sh 'npm run test:cov'
                    }
                }
                stage('Build') {
                    steps {
                        sh 'npm run build'
                    }
                }
            }
        }
        stage("Quality Assurance"){
            agent {
                docker {
                    image 'sonarsource/sonar-scanner-cli'
                    args '--network=devops-infra_default'
                    reuseNode true
                }
            }
            stages{
                stage('Upload de codigo a sonarqube') {
                    steps{
                        withSonarQubeEnv('SonarQube') {
                            sh 'sonar-scanner'
                        }
                        
                    }
                }
                stage('Quality Gate'){
                    steps{
                        timeout(time: 60, unit: 'SECONDS') {
                            script {
                                    def qg = waitForQualityGate()
                                    if (qg.status != 'OK') {
                                        error "La puerta de calidad no paso: ${qg.status}"
                                    }
                            }
                        }
                    }
                }
            } 

        }
        stage('Construcción de imagen docker & Upload de imagen') {
            steps {
                sh 'docker build -t backend-node-devops:cmd .'
                sh "docker tag backend-node-devops:cmd localhost:8082/backend-node-devops:${BUILD_NUMBER}"
                sh "docker tag backend-node-devops:cmd localhost:8082/backend-node-devops:latest"
                script {
                    docker.withRegistry('http://localhost:8082', 'nexus-credentials') {
                        sh "docker push localhost:8082/backend-node-devops:${BUILD_NUMBER}"
                    }
                }
                script {
                    docker.withRegistry('http://localhost:8082', 'nexus-credentials') {
                        sh "docker push localhost:8082/backend-node-devops:latest"
                    }
                }
            }
        }
        stage('Actualización de imagen de kubernetes a partir del pipeline') {
            when {
                branch 'main'
            }
            agent{
                docker{
                    image 'alpine/k8s:1.32.2'
                    reuseNode true
                }
            }
            steps {
                withKubeConfig([credentialsId: 'kubeconfig-docker']){
                     sh "kubectl -n devops set image deployments backend-node-devops backend-node-devops=localhost:8082/backend-node-devops:latest"
                }
            }
        }                

    }
}
