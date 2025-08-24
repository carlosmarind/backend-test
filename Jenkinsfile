pipeline {
    agent any

    environment {
        IMAGE_NAME = "backend-test"
        BUILD_TAG = "${new Date().format('yyyyMMddHHmmss')}"
        SONAR_HOST_URL = "http://sonarqube:9000"
    }

    stages {
        stage('Checkout SCM') {
            steps {
                checkout scm
            }
        }

        stage('Install dependencies') {
            steps {
                // Ejecuta dentro del contenedor Node/Java
                docker.image('edgardobenavidesl/node-java-sonar-docker:latest').inside('--network host') {
                    sh 'npm ci'
                }
            }
        }

        stage('Run tests & coverage') {
            steps {
                docker.image('edgardobenavidesl/node-java-sonar-docker:latest').inside('--network host') {
                    sh '''
                        npm run test:cov
                        sed -i 's|SF:.*/src|SF:src|g' coverage/lcov.info
                        sed -i 's#\\\\#/#g' coverage/lcov.info
                    '''
                }
            }
        }

        stage('Build app') {
            steps {
                docker.image('edgardobenavidesl/node-java-sonar-docker:latest').inside('--network host') {
                    sh 'npm run build'
                }
            }
        }

        stage('SonarQube Analysis') {
            steps {
                docker.image('edgardobenavidesl/node-java-sonar-docker:latest').inside('--network host') {
                    withSonarQubeEnv('SonarQube') {
                        withCredentials([string(credentialsId: 'sonarqube-cred', variable: 'SONAR_TOKEN')]) {
                            sh '''
                                sonar-scanner \
                                -Dsonar.projectKey=backend-test \
                                -Dsonar.sources=src \
                                -Dsonar.tests=src \
                                -Dsonar.test.inclusions=**/*.spec.ts \
                                -Dsonar.javascript.lcov.reportPaths=coverage/lcov.info \
                                -Dsonar.exclusions=node_modules/**,dist/** \
                                -Dsonar.coverage.exclusions=**/*.spec.ts \
                                -Dsonar.host.url=$SONAR_HOST_URL \
                                -Dsonar.login=$SONAR_TOKEN
                            '''
                        }
                    }
                }
            }
        }

        stage('Quality Gate') {
            steps {
                timeout(time: 2, unit: 'MINUTES') {
                    waitForQualityGate abortPipeline: true
                }
            }
        }

        stage('Docker Build & Push') {
            steps {
                withCredentials([usernamePassword(credentialsId: 'nexus-credentials', usernameVariable: 'NEXUS_USER', passwordVariable: 'NEXUS_PASSWORD')]) {
                    sh '''
                        echo $NEXUS_PASSWORD | docker login host.docker.internal:8081/dockerreponexus --username $NEXUS_USER --password-stdin
                        docker build -t host.docker.internal:8081/dockerreponexus/${IMAGE_NAME}:$BUILD_TAG .
                        docker push host.docker.internal:8081/dockerreponexus/${IMAGE_NAME}:$BUILD_TAG
                    '''
                }
            }
        }
    }

    post {
        always {
            echo 'Cleaning workspace...'
            deleteDir()
        }
    }
}
