pipeline {
  agent any
  stages {
      stage('Etapa de construccion / buil de la aplicacion') {
          agent {
              docker {
                  image 'node:22'
                  reuseNode true
              }
          }
          stages {
              stage('Instalacion de dependencias') {
                  steps {
                      sh 'npm install'
                  }
              }
              stage('Ejecucion de pruebas') {
                  steps {
                      sh 'npm run test:cov -- --ci --runInBand'
                  }
              }
              stage('Construccion de la aplicacion') {
                  steps {
                      sh 'npm run build'
                  }
              }
          }
      }
      stage('Etapa de analisis de calidad de codigo') {
          agent {
              docker {
                  image 'sonarsource/sonar-scanner-cli'
                  args: '--network=devops-infra-default'
                  reuseNode true
              }
          }
          stages {
              stage('Upload de calidad de codigo a SonarQube') {
                  steps {
                    withSonarQubeEnv('sonarqube-server') {
                        sh 'sonar-scanner'
                        
                      }
                  }
              }
          }
      }
      stage('Etapa de empaquetado y despliegue') {
          steps {
            script {
                docker.withRegistry('https://index.docker.io/v1/', 'docker-hub-credentials') {
                    sh 'docker build -t backend-test:crl .'
                    sh 'docker tag backend-test:crl crojasalvear/backend-test:crl'
                    sh 'docker push crojasalvear/backend-test:crl'
                }
                docker.withRegistry('http://localhost:8082', 'nexus-credentials') {
                    sh 'docker tag backend-test:crl localhost:8082/backend-test:crl'
                    sh 'docker push localhost:8082/backend-test:crl'
                }
            }
          }
      }
  }
}