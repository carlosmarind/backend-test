pipeline {
    agent {
        docker { 
            image 'node:22' 
            args '-u 0:0' // Ejecutar como root para permisos de instalación
        }
    }

    environment {
        IMAGE_NAME = "edgardobenavidesl/backend-test"
        BUILD_TAG = "${new Date().format('yyyyMMddHHmmss')}"
        MAX_IMAGES_TO_KEEP = 5
        SONAR_HOST_URL = "http://sonarqube:9000"
    }

    stages {
        stage('Instalación de dependencias') {
            steps {
                sh 'npm ci'
            }
        }

        stage('Ejecución de pruebas y cobertura') {
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
                    sh """
                        npx sonar-scanner \
                        -Dsonar.projectKey=backend-test \
                        -Dsonar.sources=src \
                        -Dsonar.tests=src \
                        -Dsonar.typescript.lcov.reportPaths=coverage/lcov.info \
                        -Dsonar.coverage.exclusions=src/**/*.spec.ts \
                        -Dsonar.exclusions=node_modules/**,dist/**,coverage/** \
                        -Dsonar.host.url=${SONAR_HOST_URL} \
                        -Dsonar.qualitygate.wait=true
                    """
                }
            }
        }

        stage('Quality Gate') {
            steps {
                timeout(time: 10, unit: 'MINUTES') {
                    script {
                        def gate = waitForQualityGate()
                        if (gate.status != 'OK') {
                            error "Quality Gate failed with status: ${gate.status}"
                        }
                    }
                }
            }
        }

        stage('Empaquetado y push Docker') {
            steps {
                script {
                    // Limpiar imágenes antiguas
                    sh """
                        docker images ${IMAGE_NAME} --format "{{.Repository}}:{{.Tag}}" \
                        | sort -r | tail -n +\$((MAX_IMAGES_TO_KEEP + 1)) | xargs -r docker rmi -f || true
                    """

                    // Docker Hub
                    docker.withRegistry('https://index.docker.io/v1/', 'dockerhub-credentials') {
                        def app = docker.build("${IMAGE_NAME}:${BUILD_TAG}")
                        sh "docker tag ${IMAGE_NAME}:${BUILD_TAG} ${IMAGE_NAME}:ebl"
                        app.push("${BUILD_TAG}")
                        sh "docker push ${IMAGE_NAME}:ebl"
                    }

                    // Nexus
                    def nexusHost = sh(
                        script: 'ping -c 1 nexus >/dev/null 2>&1 && echo "nexus" || echo "localhost"',
                        returnStdout: true
                    ).trim()

                    docker.withRegistry("http://${nexusHost}:8082", 'nexus-credentials') {
                        sh "docker tag ${IMAGE_NAME}:${BUILD_TAG} ${nexusHost}:8082/${IMAGE_NAME}:${BUILD_TAG}"
                        sh "docker push ${nexusHost}:8082/${IMAGE_NAME}:${BUILD_TAG}"
                        sh "docker tag ${IMAGE_NAME}:${BUILD_TAG} ${nexusHost}:8082/${IMAGE_NAME}:ebl"
                        sh "docker push ${nexusHost}:8082/${IMAGE_NAME}:ebl"
                    }
                }
            }
        }
    }

    post {
        always {
            echo 'Pipeline finalizado'
        }
    }
}
