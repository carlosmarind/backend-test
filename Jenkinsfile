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
        SONAR_HOST_URL = "http://host.docker.internal:9000"
        SONAR_PROJECT_KEY = "backend-test"
    }

    stages {
        stage('Checkout SCM') {
            steps {
                checkout([$class: 'GitSCM',
                    branches: [[name: 'dev']],
                    userRemoteConfigs: [[
                        url: 'https://github.com/EdgardoBenavides/backend-test.git',
                        credentialsId: 'Githubpas'
                    ]]
                ])
            }
        }

        stage('Instalación de dependencias') {
            steps {
                sh 'npm ci'
            }
        }

        stage('Ejecución de pruebas con cobertura') {
            steps {
                sh '''
                    npm run test:cov
                    if [ ! -f coverage/lcov.info ]; then
                      echo "ERROR: No se generó coverage/lcov.info"
                      exit 1
                    fi
                '''
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
                    sh '''
                        echo "Normalizando rutas en lcov.info..."
                        sed -i 's|\\\\|/|g' coverage/lcov.info

                        echo "Ejecutando análisis SonarQube..."
                        sonar-scanner \
                          -Dsonar.projectKey=${SONAR_PROJECT_KEY} \
                          -Dsonar.sources=src \
                          -Dsonar.tests=src \
                          -Dsonar.test.inclusions=**/*.spec.ts \
                          -Dsonar.javascript.lcov.reportPaths=coverage/lcov.info \
                          -Dsonar.exclusions=node_modules/**,dist/** \
                          -Dsonar.host.url=${SONAR_HOST_URL} \
                          -Dsonar.qualitygate.wait=true
                    '''
                }
            }
        }

        stage('Quality Gate') {
            steps {
                timeout(time: 10, unit: 'MINUTES') {
                    script {
                        def gate = waitForQualityGate()
                        if (gate.status != 'OK') {
                            error "Quality Gate failed: ${gate.status}"
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
                        def app = docker.build("${IMAGE_NAME}:${BUILD_NUMBER}")

                        sh "docker rmi ${IMAGE_NAME}:latest || true"
                        sh "docker tag ${IMAGE_NAME}:${BUILD_NUMBER} ${IMAGE_NAME}:latest"

                        app.push("${BUILD_NUMBER}")
                        sh "docker push ${IMAGE_NAME}:latest"
                    }

                    // Nexus
                    def nexusHost = sh(
                        script: 'ping -c 1 nexus >/dev/null 2>&1 && echo "nexus" || echo "localhost"',
                        returnStdout: true
                    ).trim()

                    echo "Usando Nexus host: ${nexusHost}"

                    docker.withRegistry("http://${nexusHost}:8082", 'nexus-credentials') {
                        sh "docker tag ${IMAGE_NAME}:${BUILD_NUMBER} ${nexusHost}:8082/${IMAGE_NAME}:${BUILD_NUMBER}"
                        sh "docker push ${nexusHost}:8082/${IMAGE_NAME}:${BUILD_NUMBER}"

                        sh "docker tag ${IMAGE_NAME}:${BUILD_NUMBER} ${nexusHost}:8082/${IMAGE_NAME}:latest"
                        sh "docker push ${nexusHost}:8082/${IMAGE_NAME}:latest"
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
