pipeline {
    agent {
        docker {
            image 'edgardobenavidesl/node-java-sonar-docker:latest'
            args '-v /var/run/docker.sock:/var/run/docker.sock --network devnet'
            reuseNode true
        }
    }

    environment {
        IMAGE_NAME = "backend-test"
        BUILD_TAG = "${new Date().format('yyyyMMddHHmmss')}"
        SONAR_HOST_URL = "http://sonarqube:9000"
    }

    stages {
        stage('Checkout SCM') {
            steps {
                checkout scm
            }
        }

        stage('Install dependencies') {
            steps {
                sh '''
                    echo "Installing dependencies..."
                    npm ci
                '''
            }
        }

stage('Run tests & coverage') {
    steps {
        sh '''
            echo "Running tests with coverage..."
            npm run test:cov
            echo "Normalizing coverage paths for SonarQube..."
            sed -i 's|SF:.*/src|SF:src|g' coverage/lcov.info
            sed -i 's#\\\\#/#g' coverage/lcov.info
        '''
    }
}

        stage('Build app') {
            steps {
                sh 'npm run build'
            }
        }

        stage('SonarQube Analysis') {
            environment {
                SONAR_TOKEN = credentials('sonarqube-cred')
            }
            steps {
                withSonarQubeEnv('SonarQube') {
                    sh '''
                        echo "Running SonarQube analysis..."
                        sonar-scanner \
                        -Dsonar.projectKey=backend-test \
                        -Dsonar.sources=src \
                        -Dsonar.tests=src \
                        -Dsonar.test.inclusions=**/*.spec.ts \
                        -Dsonar.javascript.lcov.reportPaths=coverage/lcov.info \
                        -Dsonar.exclusions=node_modules/**,dist/** \
                        -Dsonar.coverage.exclusions=**/*.spec.ts \
                        -Dsonar.host.url=$SONAR_HOST_URL \
                        -Dsonar.login=$SONAR_TOKEN
                    '''
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

       stage('Docker Build & Push') {
    steps {
        withCredentials([usernamePassword(
            credentialsId: 'nexus-credentials', 
            usernameVariable: 'NEXUS_USER', 
            passwordVariable: 'NEXUS_PASSWORD'
        )]) {
            script {
                echo 'Building Docker image...'
                sh 'docker build -t backend-test:latest .'

                // IP del host donde corre Nexus
                def nexusHost = '172.17.0.1' // Ajusta según tu red / WSL2

                echo "Logging into Nexus at ${nexusHost}..."
                sh """
                    echo $NEXUS_PASSWORD | docker login http://${nexusHost}:8082 -u $NEXUS_USER --password-stdin
                """

                echo 'Pushing Docker image to Nexus...'
                sh "docker tag backend-test:latest ${nexusHost}:8082/backend-test:latest"
                sh "docker push ${nexusHost}:8082/backend-test:latest"
            }
        }
    }
}
    }

    post {
        always {
            echo "Cleaning workspace..."
            deleteDir()
        }
    }
}
