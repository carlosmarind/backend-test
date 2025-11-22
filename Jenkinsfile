pipeline {
    agent any
    stages {
        stage('Instalar dependencias') {
            agent {
                docker {
                    image 'node:22'
                    reuseNode true
                    //args '-v /var/jenkins_home/cache:/root/.npm'
                }
            }
            stages {
                stage('Instalación') {
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
        stage('Quality Assurance'){
            agent{
                docker {
                    image 'sonarsource/sonar-scanner-cli'
                    args '--network=devops-infra_default'
                    reuseNode true
                }
            }
            stages{
                stage('Subiendo código a SonarQube'){
                    steps{
                        withSonarQubeEnv('SonarQube'){
                            sh 'sonar-scanner'
                        }
                    }
                }

                stage('Quality Gate'){
                    steps{
                        timeout(time: 30, unit: 'SECONDS') {
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
        stage('Construcción de imagen y delivery'){
            steps{
                script {
                    docker.withRegistry('http://localhost:8082', 'nexus-credentials') {
                        sh 'docker build -t backend-test .'
                        sh 'docker tag backend-test localhost:8082/backend-test:latest'
                        sh 'docker push localhost:8082/backend-test:latest'
                    }

                    docker.withRegistry('http://localhost:8082', 'nexus-credentials') {
                        sh "docker tag backend-test localhost:8082/backend-test:${BUILD_NUMBER}"
                        sh "docker push localhost:8082/backend-test:${BUILD_NUMBER}"
                    }
                }

                    
            }
        }
        stage('Despliegue continuo') {
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
                    sh "kubectl -n devops set image deployments backend-test backend-test=localhost:8082/backend-test:latest"
                }
            }
        }
    }
}