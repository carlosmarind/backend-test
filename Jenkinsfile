pipeline { 
    agent {
        docker {
            image 'gdiaz90/node-with-docker-cli:22'
            args '-v /var/run/docker.sock:/var/run/docker.sock'
            reuseNode true
        }
    }

    environment {
        IMAGE_NAME = "gdiaz90/backend-test"
        REGISTRY_NEXUS = "localhost:8082"
        REGISTRY_DOCKERHUB = "https://index.docker.io/v1/"
        K8S_NAMESPACE = "gdd"
    }

    stages {
        stage('Instalación de dependencias') {
            steps {
                sh 'npm install'
            }
        }

        stage('Pruebas automatizadas') {
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
                        docker.image('sonarsource/sonar-scanner-cli:latest').inside('--network dockercompose_devnet') {
                            sh '''
                                sonar-scanner \
                                -Dsonar.projectKey=backend-test \
                                -Dsonar.sources=src \
                                -Dsonar.tests=src \
                                -Dsonar.test.inclusions=src/**/*.spec.ts \
                                -Dsonar.javascript.lcov.reportPaths=coverage/lcov.info \
                                -Dsonar.login=$SONAR_AUTH_TOKEN \
                                -Dsonar.host.url=$SONAR_HOST_URL
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

        stage('Construcción imagen Docker') {
            steps {
                script {
                    docker.build("${IMAGE_NAME}:${BUILD_NUMBER}")
                }
            }
        }

        stage('Push Docker Hub') {
            steps {
                script {
                    docker.withRegistry(REGISTRY_DOCKERHUB, 'dockerhub-credentials') {
                        def app = docker.image("${IMAGE_NAME}:${BUILD_NUMBER}")
                        app.push()
                        app.push("latest")
                    }
                }
            }
        }

        stage('Push Nexus') {
            steps {
                script {
                    docker.withRegistry("http://${REGISTRY_NEXUS}", 'nexus-credentials') {
                        sh "docker tag ${IMAGE_NAME}:${BUILD_NUMBER} ${REGISTRY_NEXUS}/${IMAGE_NAME}:${BUILD_NUMBER}"
                        sh "docker tag ${IMAGE_NAME}:${BUILD_NUMBER} ${REGISTRY_NEXUS}/${IMAGE_NAME}:latest"

                        sh "docker push ${REGISTRY_NEXUS}/${IMAGE_NAME}:${BUILD_NUMBER}"
                        sh "docker push ${REGISTRY_NEXUS}/${IMAGE_NAME}:latest"
                    }
                }
            }
        }

        stage('Validación y Deploy a Kubernetes') {
            agent {
                docker {
                    image 'lachlanevenson/k8s-kubectl:v1.30.0' // Imagen con kubectl preinstalado
                    args '-v /var/run/docker.sock:/var/run/docker.sock'
                    reuseNode true
                }
            }
            steps {
                withCredentials([file(credentialsId: 'kubeconfig', variable: 'KUBECONFIG_FILE')]) {
                    sh '''
                        cp "$KUBECONFIG_FILE" kubeconfig.patched
                        export KUBECONFIG="$PWD/kubeconfig.patched"

                        # Validación previa
                        kubectl apply --dry-run=client -f kubernetes.yaml -n ${K8S_NAMESPACE}

                        # Aplicamos manifiestos YAML
                        kubectl apply -f kubernetes.yaml -n ${K8S_NAMESPACE} --validate=false

                        # Actualizamos deployment con imagen inmutable
                        TARGET_IMAGE=${REGISTRY_NEXUS}/${IMAGE_NAME}:${BUILD_NUMBER}
                        kubectl -n ${K8S_NAMESPACE} set image deployment/backend-test backend=${TARGET_IMAGE}

                        # Esperamos rollout exitoso
                        kubectl -n ${K8S_NAMESPACE} rollout status deployment/backend-test --timeout=180s

                        # Estado post-despliegue
                        kubectl -n ${K8S_NAMESPACE} get deploy backend-test -o wide
                        kubectl -n ${K8S_NAMESPACE} get pods -l app=backend-test -o wide
                    '''
                }
            }
        }
    }

    post {
        always {
            sh 'command -v docker >/dev/null 2>&1 && docker logout ${REGISTRY_DOCKERHUB} || true'
            sh 'command -v docker >/dev/null 2>&1 && docker logout ${REGISTRY_NEXUS} || true'
        }
    }
}
