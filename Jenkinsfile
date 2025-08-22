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
    }

    stages {
        stage('Checkout SCM') {
            steps {
                checkout([$class: 'GitSCM',
                    branches: [[name: 'dev']],
                    doGenerateSubmoduleConfigurations: false,
                    extensions: [],
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
    steps {
        withSonarQubeEnv('SonarQube') {
            script {
                // Usamos Node 18 para compatibilidad
                docker.image('node:18').inside('--network dockercompose_devnet -v $WORKSPACE:/workspace -w /workspace') {
                    // Generar cobertura antes de sonar
                    sh 'npm run test:cov'

                    // Ejecutar sonar-scanner
                    sh """
                    npx sonar-scanner \
                        -Dsonar.projectKey=backend-test \
                        -Dsonar.sources=src \
                        -Dsonar.tests=src \
                        -Dsonar.test.inclusions=src/**/*.spec.ts \
                        -Dsonar.exclusions=coverage/**,src/config/configuration.ts,src/**/*.spec.ts \
                        -Dsonar.coverage.exclusions=src/**/*.spec.ts \
                        -Dsonar.javascript.lcov.reportPaths=coverage/lcov.info \
                        -Dsonar.login=$SONAR_AUTH_TOKEN
                    """
                }
            }
        }
    }
}

stage('Quality Gate') {
    steps {
        timeout(time: 10, unit: 'MINUTES') { // aumentamos timeout
            script {
                // Esperamos que el servidor procese el análisis
                def gate = waitForQualityGate()
                if (gate.status != 'OK') {
                    error "Quality Gate failed with status: ${gate.status}"
                } else {
                    echo "Quality Gate passed!"
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

    post {
        always {
            echo 'Pipeline finalizado'
        }
    }
}
