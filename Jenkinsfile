pipeline {
  agent any
  stages {
      stage('Etapa de construccion') {
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
                      sh 'npm run test:cov'
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
                    sh 'docker build -t backend-test .'
                    sh 'docker tag backend-test carlos/backend-test'
                    sh 'docker push carlos/backend-test'
                }
            }
          }
      }
  }
}