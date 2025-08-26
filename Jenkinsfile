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
                        timeout(time: 5, unit: 'MINUTES') {
                            def qg = waitForQualityGate()
                            if (qg.status != 'OK') {
                                error "La puerta de calidad no paso: ${qg.status}"
                            }
                        }

                    }
                }
            } 

        }
        stage('Etapa de empaquetado y delivery') {
            steps {
                sh 'docker build -t backend-node-devops:cmd .'
                sh "docker tag backend-node-devops:cmd cristofermondacagarrido/backend-node-devops:${BUILD_NUMBER}"
                sh "docker tag backend-node-devops:cmd localhost:8082/backend-node-devops:${BUILD_NUMBER}"
                script {
                    docker.withRegistry('https://index.docker.io/v1/', 'docker-hub-credentials') {
                        sh "docker push cristofermondacagarrido/backend-node-devops:${BUILD_NUMBER}"
                    }
                    docker.withRegistry('http://localhost:8082', 'nexus-credentials') {
                        sh "docker push localhost:8082/backend-node-devops:${BUILD_NUMBER}"
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
                     sh "kubectl -n devops set image deployments backend-node-devops backend-node-devops=localhost:8082/backend-node-devops:${BUILD_NUMBER}"
                }
            }
        }
    }
}