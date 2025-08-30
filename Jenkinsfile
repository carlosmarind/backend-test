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
                    catchError(buildResult: 'SUCCESS', stageResult: 'FAILURE') {
                    sh 'npm run test:cov -- --ci --runInBand'
                    }
                }
            }
              stage('Construccion de la aplicacion') {
                  steps {
                      sh 'npm run build'
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
                    sh 'docker tag backend-test:latest localhost:8082/backend-test:latest'
                    sh 'docker push localhost:8082/backend-test:latest'
                }
            }
          }
      }
  }
}