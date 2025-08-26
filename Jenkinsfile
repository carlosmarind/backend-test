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
		stage('QA Sonarqube'){
			agent{
				docker{
					image 'sonarsource/sonar-scanner-cli'
					args '--network devops-infra_default'
					reuseNode true
				}
			}
			stages{
				stage('Upload a Sonarqube'){
					steps{
						withSonarQubeEnv('SonarQube'){
							sh 'sonar-scanner'
						}
					}
				}
			}
		}
		stage('Empaquetado y Delivery'){
			steps{
				script{
					docker.withRegistry('http://localhost:8082', 'nexus-credentials'){	
						sh 'docker tag backend-test localhost:8082/backend-test:${BUILD_NUMBER}'
						sh "docker tag backend-test localhost:8082/backend-test:latest"
						sh 'docker push localhost:8082/backend-test:${BUILD_NUMBER}'
						sh "docker push localhost:8082/backend-test:latest"
					}
				}
			}
		}
		stage('Deploy a Kubernetes'){
      steps{
          script{
              sh 'kubectl apply -f kubernetes.yaml'
              sh 'kubectl rollout restart deployment/backend-test -n devops-test'
              sh 'kubectl rollout status deployment/backend-test -n devops-test'
          }
      }
  }
	}
}