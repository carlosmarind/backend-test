pipeline {
    agent {
        docker {
            image 'edgardobenavidesl/node-with-docker-cli:22'
            args '-v /var/run/docker.sock:/var/run/docker.sock'
            reuseNode true
        }
    }

    environment {
        IMAGE_NAME = "edgardobenavidesl/backend-test"
        BUILD_TAG = "${new Date().format('yyyyMMddHHmmss')}"
        MAX_IMAGES_TO_KEEP = 5
        SONAR_HOST_URL = "http://host.docker.internal:9000" // <-- cambio aquí
    }

    stages {
        stage('Instalación de dependencias') {
            steps {
                sh 'npm ci'
            }
        }

        stage('Ejecución de pruebas automatizadas') {
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
            agent {
                docker {
                    image 'sonarsource/sonar-scanner-cli'
                    args '-v $WORKSPACE:/usr/src'
                    reuseNode true
                }
            }
            steps {
                withSonarQubeEnv('SonarQube') {
                    sh """
                        sonar-scanner \
                        -Dsonar.projectKey=backend-test \
                        -Dsonar.sources=. \
                        -Dsonar.exclusions=node_modules/**,dist/**,coverage/** \
                        -Dsonar.javascript.lcov.reportPaths=coverage/lcov.info \
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

                        // Etiquetar como 'ebl' antes de push
                        sh "docker rmi ${IMAGE_NAME}:ebl || true"
                        sh "docker tag ${IMAGE_NAME}:${BUILD_TAG} ${IMAGE_NAME}:ebl"

                        app.push("${BUILD_TAG}")
                        sh "docker push ${IMAGE_NAME}:ebl"
                    }

                    // Nexus
                    def nexusHost = sh(
                        script: 'ping -c 1 nexus >/dev/null 2>&1 && echo "nexus" || echo "localhost"',
                        returnStdout: true
                    ).trim()

                    echo "Usando Nexus host: ${nexusHost}"

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
}
