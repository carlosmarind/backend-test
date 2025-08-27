pipeline {
  agent any
  stages {
      stage('Instalacion de dependencias') {
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
  }
}