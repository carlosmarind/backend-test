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
        stage('Etapa de empaquetado y delivery'){
          steps{
            script{
                docker.withRegistry('https//:docker.io', 'docker-hub-credentials'){
                    sh 'docker build -t backend-test:cma .'
                    sh 'docker tag backend-test:cma cesar/backend-test:cma'
                    sh 'docker push cesar/backend-test:cma'
                }
            }
            
          }
        }
    }
}