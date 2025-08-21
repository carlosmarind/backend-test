pipeline {
  agent any

  environment {
    SONARQUBE_SERVER = 'SonarServer'
    SONAR_PROJECT_KEY = 'backend-test-mauricio'
    REGISTRY = 'host.docker.internal:8082'
    IMAGE_NAME = 'labo3/backend-test'
  }

  stages {
    stage('Checkout') {
      steps { checkout scm }
    }

    stage('Install deps') {
      steps {
        sh '''
          if [ -f package-lock.json ]; then npm ci; else npm install; fi
        '''
      }
    }

    stage('Testing + Coverage') {
      steps { sh 'npm test -- --coverage' }
    }

    stage('Build app') {
      steps { sh 'npm run build || echo "ajusta el build si tu app no usa npm"' }
    }

    stage('SonarQube Scan') {
      steps {
        withSonarQubeEnv("${env.SONARQUBE_SERVER}") {
          withCredentials([string(credentialsId: 'sonar-token', variable: 'SONAR_TOKEN')]) {
            sh """
              sonar-scanner \
                -Dsonar.login=$SONAR_TOKEN \
                -Dsonar.projectKey=${env.SONAR_PROJECT_KEY} \
                -Dsonar.sources=src \
                -Dsonar.tests=tests \
                -Dsonar.test.inclusions=tests/**/*.test.js \
                -Dsonar.javascript.lcov.reportPaths=coverage/lcov.info
            """
          }
        }
      }
    }

    stage('Quality Gate') {
      steps {
        timeout(time: 15, unit: 'MINUTES') {
          waitForQualityGate abortPipeline: true
        }
      }
    }

    stage('Build Docker image') {
      steps {
        sh """
          docker build -t ${REGISTRY}/${IMAGE_NAME}:latest -t ${REGISTRY}/${IMAGE_NAME}:${BUILD_NUMBER} .
        """
      }
    }

    stage('Push to Nexus') {
      steps {
        withCredentials([usernamePassword(credentialsId: 'nexus-docker', passwordVariable: 'NEXUS_PWD', usernameVariable: 'NEXUS_USER')]) {
          sh 'echo "$NEXUS_PWD" | docker login ' + "${env.REGISTRY}" + ' -u "$NEXUS_USER" --password-stdin'
        }
        sh """
          docker push ${REGISTRY}/${IMAGE_NAME}:latest
          docker push ${REGISTRY}/${IMAGE_NAME}:${BUILD_NUMBER}
        """
      }
    }

    stage('Deploy to K8s') {
      steps {
        withCredentials([file(credentialsId: 'kubeconfig', variable: 'KUBECONFIG_FILE')]) {
          sh '''
            export KUBECONFIG="$KUBECONFIG_FILE"
            kubectl apply -f kubernetes.yaml
            kubectl set image deployment/backend-test backend=${REGISTRY}/${IMAGE_NAME}:latest -n default
            kubectl rollout status deployment/backend-test -n default
          '''
        }
      }
    }
  }
}
