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
                    args '--network=devops-infra_default'
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
                docker.withRegistry('https://index.docker.io/v2/', 'f9e70e70-833b-4fbe-9635-7c57ea832e76'){ 
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