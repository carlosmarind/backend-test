pipeline {
    agent any

    environment {
        IMAGE_NAME = 'backend-test'
    }

    stages {

        stage('Install dependencies') {
            steps {
                echo "Instalando dependencias npm..."
                bat 'npm install'
            }
        }

        stage('Run Tests & Generate Coverage') {
            steps {
                echo "Ejecutando tests con cobertura..."
                bat 'npm run test:cov'
            }
        }

        stage('Build Project') {
            steps {
                echo "Construyendo proyecto..."
                bat 'npm run build'
            }
        }

        stage('SonarQube Analysis') {
            steps {
                withSonarQubeEnv('SonarQube') {
                    echo "Ejecutando análisis SonarQube con npx..."
                    bat """
                    npx sonarqube-scanner ^
                        -Dsonar.projectKey=backend-test ^
                        -Dsonar.sources=. ^
                        -Dsonar.host.url=%SONAR_HOST_URL% ^
                        -Dsonar.login=%SONAR_AUTH_TOKEN% ^
                        -Dsonar.javascript.lcov.reportPaths=coverage/lcov.info ^
                        -Dsonar.coverage.exclusions=node_modules/**,tests/**,**/main.ts,**/src/config/**,**/*.module.ts
                    """
                }
            }
        }

        stage('Quality Gate') {
            steps {
                echo "Esperando resultado de Quality Gate..."
                timeout(time: 10, unit: 'MINUTES') {
                    waitForQualityGate abortPipeline: true
                }
            }
        }

        stage('Build Docker Image') {
            steps {
                script {
                    echo "Construyendo imagen Docker..."
                    bat "docker build -t %IMAGE_NAME%:latest ."
                    bat "docker tag %IMAGE_NAME%:latest localhost:8082/docker-hosted/%IMAGE_NAME%:${env.BUILD_NUMBER}"
                }
            }
        }

        stage('Push Docker Image to Nexus') {
            steps {
                script {
                    // Usa directamente el ID literal de la credencial de Jenkins
                    docker.withRegistry('http://localhost:8082', 'nexus-credentials') {
                        echo "Subiendo imagen Docker con tag latest y build number..."
                        bat "docker push localhost:8082/docker-hosted/%IMAGE_NAME%:latest"
                        bat "docker push localhost:8082/docker-hosted/%IMAGE_NAME%:${env.BUILD_NUMBER}"
                    }
                }
            }
        }

        stage('Deploy to Kubernetes') {
            steps {
                withKubeConfig([credentialsId: 'k8s-cred']) {
                    echo "Aplicando kubernetes.yaml..."
                    bat "kubectl apply -f kubernetes.yaml"
                    echo "Verificando despliegue..."
                    bat "kubectl rollout status deployment/backend-test"
                }
            }
        }
    }

    post {
        always {
            echo "Pipeline completado."
        }
    }
}