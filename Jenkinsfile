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
                stage ('Quality gate'){
                    steps{
                        timeout(time: 60, unit: 'SECONDS'){
                            script{
                                def qg = waitForQualityGate()
                                if(qg.status != 'OK'){
                                   error "La puerta de calidad no pasó: ${qg.status}"
                                }
                            }
                        }
                   }
                }
            }
            
        }
        stage('Etapa de empaquetado y delivery'){
          steps{
            sh 'docker build -t backend-test:cma .'

            //sh 'docker tag backend-test dockermonges/backend-test:latest'
            sh 'docker tag backend-test:cma localhost:8082/backend-test:latest'

            sh "docker tag backend-test:cma localhost:8082/backend-test:${env.BUILD_NUMBER}"
            
            script{
               /*docker.withRegistry('', 'f9e70e70-833b-4fbe-9635-7c57ea832e76'){ 
                    sh 'docker push dockermonges/backend-test:cma'
                }*/
                docker.withRegistry('http://localhost:8082', 'nexus-credencial'){  
                    
                    sh 'docker push localhost:8082/backend-test:latest'
                    sh "docker push localhost:8082/backend-test:${env.BUILD_NUMBER}"
                }
            }
            
          }
        }
    }
}