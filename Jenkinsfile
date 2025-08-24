pipeline {
    agent any
    stages {
        stage('Instalacion preliminar') {
			agent{
				docker{
					image 'node:22'
					reuseNode true
				}
			}
            stages {
				stage('Dependencias'){
					steps{
						sh 'npm install'
					}
				}
				stage('Testing y cobertura') {
					steps {
						sh 'npm run test:cov'
					}
				}
				stage('Build') {
					steps {
						sh 'npm run build'
					}
				}
			}
		}
	}
}