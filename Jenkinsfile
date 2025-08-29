pipeline {
    agent any
    stages {
        stage('Etapa de construccion / build de aplicacion') {
            agent {
                docker {
                    image 'node'
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
                        withSonarQubeEnv('Sonar01') {
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

        stage('Etapa de empaquetado y delivery') {
            steps {
                sh 'docker build -t backend-test:spr .'
                sh "docker tag backend-test:spr localhost:8082/backend-test:latest"
                script {
                    docker.withRegistry('http://localhost:8082', 'nexus-credentials') {
                        sh "docker push localhost:8082/backend-test:latest"
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