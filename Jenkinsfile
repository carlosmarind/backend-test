pipeline {
    agent {
        docker {
            image 'cimg/node:22.2.0'
            args '--network devnet -v /var/run/docker.sock:/var/run/docker.sock'
            reuseNode true
        }
    }

    environment {
        IMAGE_NAME = "edgardobenavidesl/backend-test"
        BUILD_TAG = "${new Date().format('yyyyMMddHHmmss')}"
        MAX_IMAGES_TO_KEEP = 5
        SONAR_PROJECT_KEY = "backend-test"
        NEXUS_URL = "nexus_repo:8082"
        KUBE_CONFIG = "/home/jenkins/.kube/config"
        DEPLOYMENT_FILE = "kubernetes.yaml"
        SONAR_HOST_URL = "http://sonarqube:9000"
        SONAR_AUTH_TOKEN = credentials('sonarqube-cred')
    }

    stages {
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
                    echo "Normalizando rutas en lcov.info..."
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

        stage('Debug SonarQube desde contenedor') {
            steps {
                sh '''
                    echo "Probando conexión desde el contenedor del pipeline..."
                    curl -s -u ${SONAR_AUTH_TOKEN}: ${SONAR_HOST_URL}/api/system/health || echo "No se pudo conectar desde contenedor"
                '''
            }
        }

        stage('Quality Assurance - SonarQube') {
            steps {
                script {
                    withSonarQubeEnv('SonarQube') {
                        sh """
                            npx sonarqube-scanner \
                                -Dsonar.projectKey=${SONAR_PROJECT_KEY} \
                                -Dsonar.sources=src \
                                -Dsonar.tests=src \
                                -Dsonar.test.inclusions=**/*.spec.ts \
                                -Dsonar.javascript.lcov.reportPaths=coverage/lcov.info \
                                -Dsonar.exclusions=node_modules/**,dist/** \
                                -Dsonar.coverage.exclusions=**/*.spec.ts \
                                -Dsonar.host.url=${SONAR_HOST_URL} \
                                -Dsonar.token=${SONAR_AUTH_TOKEN}
                        """
                    }
                }
            }
        }

        stage('Debug SonarQube desde Jenkins (Master)') {
            steps {
                echo "Probando conexión desde el nodo Jenkins (host donde corre waitForQualityGate)..."
                sh 'curl -s http://sonarqube:9000/api/system/health || echo "No se pudo conectar desde Jenkins Master"'
            }
        }

        stage('Quality Gate') {
            steps {
                script {
                    echo "Esperando 15s para que SonarQube procese el análisis..."
                    sleep 15
                    timeout(time: 10, unit: 'MINUTES') {
                        def qg = waitForQualityGate()
                        if (qg.status != 'OK') {
                            error "Pipeline detenido por Quality Gate: ${qg.status}"
                        } else {
                            echo "Quality Gate OK"
                        }
                    }
                }
            }
        }

        stage('Verificar Nexus') {
            steps {
                script {
                    echo "Verificando que ${NEXUS_URL} sea accesible..."
                    sh '''
                        if ! curl -sSf http://${NEXUS_URL}/service/rest/v1/status > /dev/null; then
                            echo "No se puede conectar a ${NEXUS_URL}"
                            exit 1
                        fi
                        echo "Conexión exitosa a ${NEXUS_URL}"
                    '''
                }
            }
        }


        stage('Build & Push Docker Image') {
            steps {
                script {
                    def maxImages = MAX_IMAGES_TO_KEEP.toInteger() + 1

                    sh """
                        docker images ${IMAGE_NAME} --format "{{.Repository}}:{{.Tag}}" \
                        | sort -r | tail -n +${maxImages} | xargs -r docker rmi -f || true
                    """

                    def app = docker.build("${IMAGE_NAME}:${BUILD_NUMBER}")

                    docker.withRegistry("http://${NEXUS_URL}", 'nexus-credentials') {
                        sh "docker tag ${IMAGE_NAME}:${BUILD_NUMBER} ${NEXUS_URL}/${IMAGE_NAME}:${BUILD_NUMBER}"
                        sh "docker tag ${IMAGE_NAME}:${BUILD_NUMBER} ${NEXUS_URL}/${IMAGE_NAME}:latest"
                        sh "docker push ${NEXUS_URL}/${IMAGE_NAME}:${BUILD_NUMBER}"
                        sh "docker push ${NEXUS_URL}/${IMAGE_NAME}:latest"
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
