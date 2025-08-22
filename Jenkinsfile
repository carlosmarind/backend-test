pipeline {
    agent {
        docker {
            image 'edgardobenavidesl/backend-test' // Tu imagen con Node.js y npm
            args '-v /var/run/docker.sock:/var/run/docker.sock'
            reuseNode true
        }
    }

    environment {
        IMAGE_NAME = "edgardobenavidesl/backend-test"
    }

    stages {
        stage('Instalación de dependencias') {
            steps { 
                sh 'npm ci' 
            }
        }

        stage('Pruebas automatizadas con cobertura') {
            steps { 
                sh 'npm run test:cov' 
            }
        }

        stage('Construcción de aplicación') {
            steps { 
                sh 'npm run build' 
            }
        }

        stage('Quality Assurance') {
    steps {
        withSonarQubeEnv('SonarQube') {
            script {
                docker.image('sonarsource/sonar-scanner-cli:latest').inside("-v $WORKSPACE:/usr/src/app -w /usr/src/app") {
                    sh '''
                        sonar-scanner \
                        -Dsonar.projectKey=backend-test \
                        -Dsonar.sources=src \
                        -Dsonar.tests=src \
                        -Dsonar.test.inclusions=**/*.spec.ts \
                        -Dsonar.exclusions=**/node_modules/**,**/coverage/**,**/*.spec.ts \
                        -Dsonar.javascript.lcov.reportPaths=coverage/lcov.info \
                        -Dsonar.login=$SONAR_AUTH_TOKEN
                    '''
                }
            }
        }
    }
}


        stage('Quality Gate') {
            steps {
                timeout(time: 5, unit: 'MINUTES') {
                    waitForQualityGate abortPipeline: true
                }
            }
        }

        stage('Empaquetado y push Docker') {
            steps {
                script {
                    def app = docker.build("${IMAGE_NAME}:${BUILD_NUMBER}")

                    docker.withRegistry('https://index.docker.io/v1/', 'dockerhub-credentials') {
                        app.push()
                        app.push("ebl")
                    }

                    docker.withRegistry('http://localhost:8082', 'nexus-credentials') {
                        sh "docker tag ${IMAGE_NAME}:${BUILD_NUMBER} localhost:8082/${IMAGE_NAME}:${BUILD_NUMBER}"
                        sh "docker tag ${IMAGE_NAME}:${BUILD_NUMBER} localhost:8082/${IMAGE_NAME}:latest"

                        sh "docker push localhost:8082/${IMAGE_NAME}:${BUILD_NUMBER}"
                        sh "docker push localhost:8082/${IMAGE_NAME}:latest"
                    }
                }
            }
        }
    }
}
