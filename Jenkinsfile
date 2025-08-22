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
    }

    stages {
        stage('Instalación de dependencias..') {
            steps {
                sh 'npm install'
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
                    args '--network=devnet -v $WORKSPACE:/usr/src'
                    reuseNode true
                }
            }
            steps {
                withSonarQubeEnv('SonarQube') {
                    sh """
                        sonar-scanner \
                        -Dsonar.projectKey=backend-test \
                        -Dsonar.sources=src \
                        -Dsonar.tests=src \
                        -Dsonar.test.inclusions="**/*.spec.ts" \
                        -Dsonar.exclusions="node_modules/**,dist/**" \
                        -Dsonar.javascript.lcov.reportPaths=coverage/lcov.info
                    """
                }
            }
        }

        stage('Quality Gate') {
                steps {
                        timeout(time: 10, unit: 'MINUTES') {  // Aumentamos el tiempo de espera
                            script {
                                def qualityGate = waitForQualityGate abortPipeline: false
                                if (qualityGate.status != 'OK') {
                                    echo "⚠️ Quality Gate NO aprobado: ${qualityGate.status}"
                                    // Puedes decidir fallar el build o continuar
                                    error("Pipeline detenido porque no pasó el Quality Gate: ${qualityGate.status}")
                                } else {
                                    echo "✅ Quality Gate aprobado"
                                }
                            }
                        }
                    }
        }

        stage('Empaquetado y push Docker') {
            steps {
                script {
                    sh """
                        docker images ${IMAGE_NAME} --format "{{.Repository}}:{{.Tag}}" \
                        | sort -r | tail -n +\$((MAX_IMAGES_TO_KEEP + 1)) | xargs -r docker rmi -f || true
                    """

                    docker.withRegistry('https://index.docker.io/v1/', 'dockerhub-credentials') {
                        def app = docker.build("${IMAGE_NAME}:${BUILD_TAG}")

                        sh "docker rmi ${IMAGE_NAME}:ebl || true"
                        sh "docker tag ${IMAGE_NAME}:${BUILD_TAG} ${IMAGE_NAME}:ebl"

                        app.push("${BUILD_TAG}")
                        sh "docker push ${IMAGE_NAME}:ebl"
                    }

                    def nexusHost = sh(
                        script: 'ping -c 1 nexus >/dev/null 2>&1 && echo "nexus" || echo "localhost"',
                        returnStdout: true
                    ).trim()

                    echo "Usando Nexus host: ${nexusHost}"
                    docker.withRegistry("http://${nexusHost}:8082", 'nexus-credentials') {
                        // Tag único en Nexus
                        sh "docker tag ${IMAGE_NAME}:${BUILD_TAG} ${nexusHost}:8082/${IMAGE_NAME}:${BUILD_TAG}"
                        sh "docker push ${nexusHost}:8082/${IMAGE_NAME}:${BUILD_TAG}"

                        // Actualiza tag ebl en Nexus
                        sh "docker tag ${IMAGE_NAME}:${BUILD_TAG} ${nexusHost}:8082/${IMAGE_NAME}:ebl"
                        sh "docker push ${nexusHost}:8082/${IMAGE_NAME}:ebl"
                    }
                }
            }
        }
    }
}
