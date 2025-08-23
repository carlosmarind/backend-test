pipeline {
    agent any

    stages {
        stage('Dependencies') {
			agent{
				docker{
					image 'node:22'
					reuseNode true
				}
			}
            steps {
                sh 'npm install'
            }
        }
        stage('Preliminary Testing') {
            steps {
                echo 'npm run test:cov'
            }
        }
        stage('Build') {
            steps {
                sh 'RUN npm run build'
            }
        }
		
    }
}