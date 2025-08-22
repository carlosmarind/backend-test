pipeline {
    agent any

    environment {
        NODE_IMAGE = 'edgardobenavidesl/node-with-docker-cli:22'
        SONAR_SCANNER_IMAGE = 'sonarsource/sonar-scanner-cli'
        SONAR_HOST = 'http://host.docker.internal:9000'
        SONAR_PROJECT_KEY = 'backend-test'
    }

    stages {
        stage('Checkout SCM') {
            steps {
                checkout scm
            }
        }

        stage('Instalación de dependencias') {
            steps {
                script {
                    docker.image(NODE_IMAGE).inside("-u 0:0 -v /var/run/docker.sock:/var/run/docker.sock") {
                        sh 'npm ci'
                    }
                }
            }
        }

        stage('Pruebas automatizadas') {
            steps {
                script {
                    docker.image(NODE_IMAGE).inside("-u 0:0 -v /var/run/docker.sock:/var/run/docker.sock") {
                        sh 'npm run test:cov'
                    }
                }
            }
        }

        stage('Construcción de aplicación') {
            steps {
                script {
                    docker.image(NODE_IMAGE).inside("-u 0:0 -v /var/run/docker.sock:/var/run/docker.sock") {
                        sh 'npm run build'
                    }
                }
            }
        }

        stage('Quality Assurance') {
            steps {
                script {
                    // Se intenta ejecutar Sonar, pero si falla no rompe todo
                    try {
                        docker.image(SONAR_SCANNER_IMAGE).inside("-u 0:0 -v /var/run/docker.sock:/var/run/docker.sock") {
                            sh """
                                sonar-scanner \
                                -Dsonar.projectKey=${SONAR_PROJECT_KEY} \
                                -Dsonar.sources=. \
                                -Dsonar.exclusions=node_modules/**,dist/**,coverage/** \
                                -Dsonar.javascript.lcov.reportPaths=coverage/lcov.info \
                                -Dsonar.host.url=${SONAR_HOST} \
                                -Dsonar.qualitygate.wait=true
                            """
                        }
                    } catch (err) {
                        echo "⚠️ SonarQube falló: ${err}. Continuando pipeline..."
                    }
                }
            }
        }

        stage('Empaquetado y push Docker') {
            steps {
                script {
                    docker.image(NODE_IMAGE).inside("-u 0:0 -v /var/run/docker.sock:/var/run/docker.sock") {
                        sh '''
                            docker build -t edgardobenavidesl/backend-test:dev .
                            docker push edgardobenavidesl/backend-test:dev
                        '''
                    }
                }
            }
        }
    }

    post {
        always {
            echo "Pipeline finalizado"
        }
    }
}
