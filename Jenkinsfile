pipeline {
    agent {
        docker {
            image 'cimg/node:22.2.0'
            args '-v /var/run/docker.sock:/var/run/docker.sock --network devnet'
        }
    }

    environment {
        IMAGE_NAME = "edgardobenavidesl/backend-test"
        BUILD_TAG = "${new Date().format('yyyyMMddHHmmss')}"
        MAX_IMAGES_TO_KEEP = 5
    }

    stages {
        stage('Checkout SCM') {
            steps {
                checkout scm
            }
        }

        stage('Instalación de dependencias') {
            steps {
                sh 'npm ci'
            }
        }

        stage('Ejecución de pruebas con cobertura') {
            steps {
                sh 'npm run test:cov'
                sh '''
                    [ ! -f coverage/lcov.info ] && echo "No se encontró lcov.info" || echo "Normalizando rutas en lcov.info"
                    sed -i 's|SF:.*/src|SF:src|g' coverage/lcov.info
                    sed -i 's|\\\\|/|g' coverage/lcov.info
                '''
            }
        }

        stage('Build aplicación') {
            steps {
                sh 'npm run build'
            }
        }

        stage('SonarQube Analysis') {
            steps {
                withSonarQubeEnv('SonarQube') {
                    sh '''
                        npm install -g sonar-scanner
                        sonar-scanner \
                        -Dsonar.projectKey=backend-test \
                        -Dsonar.sources=src \
                        -Dsonar.tests=src \
                        -Dsonar.test.inclusions=**/*.spec.ts \
                        -Dsonar.javascript.lcov.reportPaths=coverage/lcov.info \
                        -Dsonar.exclusions=node_modules/**,dist/** \
                        -Dsonar.coverage.exclusions=**/*.spec.ts
                    '''
                }
            }
        }

        stage('Quality Gate') {
            steps {
                timeout(time: 10, unit: 'MINUTES') {
                    waitForQualityGate abortPipeline: true
                }
            }
        }

        stage('Build & Push Docker Image') {
            steps {
                script {
                    sh "docker build -t ${IMAGE_NAME}:${BUILD_TAG} ."
                    sh "docker push ${IMAGE_NAME}:${BUILD_TAG}"
                }
            }
        }
    }

    post {
        always {
            echo "Pipeline finalizado"
        }
        cleanup {
            sh 'docker system prune -f'
        }
    }
}
