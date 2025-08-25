pipeline{
    agent any
    stages{
        stage ('Etapa de construcción'){
            agent{
                docker {
                    image 'node:22'
                    reuseNode true
                }
            }
            stages{
                stage('Instalación de dependencias'){
                    steps{
                        sh 'npm install'
                    }
                }
                stage('Ejecución de pruebas'){
                    steps{
                        sh 'npm run test:cov'
                    }
                }
                stage('Construcción de aplicación'){
                    steps{
                        sh 'npm run build'
                    }
                }
            }
           
        } 
        stage ('Aseguramiento de calidad'){
            agent{
                docker {
                    image 'sonarsource/sonar-scanner-cli'
                    reuseNode true
                }
            }
            stages{
                stage('Subir código a SonarQube'){
                    steps{
                        withSonarQubeEnv('SonarQube'){
                            sh 'sonar-scanner'
                        }                      
                    }
                } 
            }
        }
        stage('Etapa de empaquetado y delivery'){
          steps{
            script{
                docker.withRegistry('https://index.docker.io/v1/', 'docker-hub-credentials'){ 
                    sh 'docker build -t backend-test:cma .'
                    sh 'docker tag backend-test:cma cesar/backend-test:cma'
                    sh 'docker push cesar/backend-test:cma'
                }
                docker.withRegistry('http://localhost:8082', 'nexus-credencial'){  
                    sh 'docker tag backend-test:cma localhost:8082/cesar/backend-test:cma'
                    sh 'docker push localhost:8082/cesar/backend-test:cma'
                }
            }
            
          }
        }
    }
}