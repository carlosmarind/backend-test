pipeline {
    agent any 
    stages {
        stage('Install docker node:22') {
            agent {
                docker{
                    image 'node:22'
                    reuseNode true
                }
            }
            stages{
                stage('Install dependencies'){
                    steps {
                        sh 'npm install'
                    }
                }
                stage('Ejecución tests'){
                    steps{
                        sh 'npm run test:cov'
                    }
                }    
                stage('Construcción aplicación'){
                    steps{
                        sh 'npm run build'
                    }
                } 
            }   
        }
        stage('Quality Assurance'){
            agent{
                docker{
                    image 'sonarsource/sonar-scanner-cli'
                    args '--network=devops-infra_default'
                    reuseNode true
                }
            }
            stages{
                stage('Upload código a sonarqube'){
                    steps{
                        withSonarQubeEnv('SonarQube'){
                            sh 'sonar-scanner'
                        }
                        
                    }
                }
                stage('Quality Gate'){
                    steps{
                        timeout(time:30, unit:'SECONDS'){
                            script{
                                def qg = waitForQualityGate()
                                if(qg.status != 'OK'){
                                    error "Quality Gate failed with status ${qg.status}"
                                }
                            }
                        }
                    }
                }
            }
        }
        stage('Etapa empaquetado y delivery'){
            steps{
                sh 'docker build -t backend-node-devops .'
                sh "docker tag backend-node-devops:latest localhost:8082/backend-node-devops:latest"
                sh "docker tag backend-node-devops:latest localhost:8082/backend-node-devops:${BUILD_NUMBER}"
            
                script{
                    docker.withRegistry('http://localhost:8082/', 'nexus-credentials'){
                    sh "docker push localhost:8082/backend-node-devops:latest"
                    sh "docker push localhost:8082/backend-node-devops:${BUILD_NUMBER}"
                    }
                }  
            }
        }

        stage('Despliegue continuo') {
            when {
                branch 'main'
            }
            agent{
                docker{
                    image 'alpine/k8s:1.32.2'
                    reuseNode true
                }
            }
            steps {
                withKubeConfig([credentialsId: 'kubeconfig-docker']){
                    sh "kubectl -n devops set image deployments backend-node-devops backend-node-devops=localhost:8082/backend-node-devops:${BUILD_NUMBER}"

                    sh 'kubectl apply -f kubernetes.yaml -n devops'
                    sh 'kubectl rollout status deployment/backend-node-devops -n devops --timeout=2m'
                    sh 'kubectl get pods -n devops'
                }
            }
        }
        //stage('testeo ejecucion contenedor'){
        //    steps{
        //        sh 'docker run -d --rm -p 8000:3000 -e USERNAME=CMD -e PORT=3000 --name backend-node-devops-container localhost:8082/backend-node-devops:cmd'
        //    }
        //}
    }
}