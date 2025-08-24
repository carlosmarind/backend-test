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
        NEXUS_URL = "http://host.docker.internal:8082" // HTTP explícito
        NEXUS_REPO = "docker-repo" // tu repo en Nexus
    }

    stages {
        stage('Checkout SCM') {
            steps {
                checkout scm
            }
        }

        stage('Install dependencies') {
            steps {
                sh 'npm ci'
            }
        }

        stage('Run tests & coverage') {
            steps {
                sh 'npm run test:cov'
                sh '''
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
            steps {
                withCredentials([string(credentialsId: 'sonarqube-cred', variable: 'SONAR_TOKEN')]) {
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
                    echo 'Logging into Nexus...'
                    docker login -u $NEXUS_USER -p $NEXUS_PASSWORD host.docker.internal:8081/dockerreponexus
                    docker build -t host.docker.internal:8081/dockerreponexus/backend-test:latest .
                    docker push host.docker.internal:8081/dockerreponexus/backend-test:latest
                """
            }
        }

    }

    post {
        always {
            echo 'Cleaning workspace...'
            deleteDir()
        }
    }
}
