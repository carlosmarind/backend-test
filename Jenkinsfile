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
          }
      }
  }
}