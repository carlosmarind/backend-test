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
    withCredentials([usernamePassword(credentialsId: 'nexus-credentials', usernameVariable: 'NEXUS_USER', passwordVariable: 'NEXUS_PASSWORD')]) {
        sh """
        echo 'Building Docker image...'
        docker build -t backend-test:latest .

        echo 'Logging into Nexus...'
        echo \$NEXUS_PASSWORD | docker login http://host.docker.internal:8082 -u \$NEXUS_USER --password-stdin

        echo 'Tagging image for Nexus...'
        docker tag backend-test:latest host.docker.internal:8082/backend-test:latest

        echo 'Pushing image to Nexus...'
        docker push host.docker.internal:8082/backend-test:latest
        """
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
