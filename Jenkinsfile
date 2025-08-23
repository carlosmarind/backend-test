pipeline {
    agent {
        docker {
            image 'edgardobenavidesl/node-with-docker-cli:22'
            args '-v /var/run/docker.sock:/var/run/docker.sock --network jenkins_default'
            reuseNode true
        }
    }

    environment {
        IMAGE_NAME = "edgardobenavidesl/backend-test"
        BUILD_TAG = "${new Date().format('yyyyMMddHHmmss')}"
        MAX_IMAGES_TO_KEEP = 5
        SONAR_HOST_URL = "http://sonarqube:9000" // Sonar en la misma red Docker
        SONAR_PROJECT_KEY = "backend-test"
        NEXUS_URL = "nexus:8082"
        KUBE_CONFIG = "/home/jenkins/.kube/config"
        DEPLOYMENT_FILE = "kubernetes.yaml"
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

        stage('Quality Assurance - SonarQube') {
            steps {
                withSonarQubeEnv('SonarQube') {
                    sh '''
                        sonar-scanner \
                          -Dsonar.projectKey=${SONAR_PROJECT_KEY} \
                          -Dsonar.sources=src \
                          -Dsonar.tests=src \
                          -Dsonar.test.inclusions=**/*.spec.ts \
                          -Dsonar.javascript.lcov.reportPaths=coverage/lcov.info \
                          -Dsonar.exclusions=node_modules/**,dist/** \
                          -Dsonar.coverage.exclusions=**/*.spec.ts \
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

        stage('Build & Push Docker Image') {
            steps {
                script {
                    // Limpiar imágenes antiguas
                    sh """
                        docker images ${IMAGE_NAME} --format "{{.Repository}}:{{.Tag}}" \
                        | sort -r | tail -n +\$((MAX_IMAGES_TO_KEEP + 1)) | xargs -r docker rmi -f || true
                    """

                    def app = docker.build("${IMAGE_NAME}:${BUILD_NUMBER}")

                    // Push a Nexus con tags latest y BUILD_NUMBER
                    docker.withRegistry("http://${NEXUS_URL}", 'nexus-credentials') {
                        sh "docker tag ${IMAGE_NAME}:${BUILD_NUMBER} ${NEXUS_URL}/${IMAGE_NAME}:${BUILD_NUMBER}"
                        sh "docker tag ${IMAGE_NAME}:${BUILD_NUMBER} ${NEXUS_URL}/${IMAGE_NAME}:latest"
                        sh "docker push ${NEXUS_URL}/${IMAGE_NAME}:${BUILD_NUMBER}"
                        sh "docker push ${NEXUS_URL}/${IMAGE_NAME}:latest"
                    }
                }
            }
        }

        // stage('Actualizar Kubernetes') {
        //     steps {
        //         sh '''
        //             echo "Aplicando configuración de Kubernetes..."
        //             kubectl --kubeconfig=${KUBE_CONFIG} apply -f ${DEPLOYMENT_FILE}

        //             echo "Validando pods en ejecución..."
        //             kubectl --kubeconfig=${KUBE_CONFIG} rollout status deployment/backend-app
        //         '''
        //     }
        // }
    }

    post {
        always {
            echo 'Pipeline finalizado'
        }
    }
}
