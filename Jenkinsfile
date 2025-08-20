pipeline {
  agent any
  options { timestamps(); ansiColor('xterm') }
  environment {
    REGISTRY_URL      = "host.docker.internal:8082"
    IMAGE_NAME        = "labo3/backend-test"
    NEXUS_CREDS_ID    = "cred-nexus-docker"
    SONAR_SERVER_NAME = "SonarQubeServer"
    K8S_NAMESPACE     = "default"
    DEPLOYMENT_NAME   = "backend-test"
    CONTAINER_NAME    = "backend"
    KUBECONFIG_ID     = "cred-kubeconfig-file"
  }
  tools { nodejs "Node18" }

  stages {
    stage('Checkout'){ steps { checkout scm } }

    stage('Install dependencies'){ steps { sh 'npm ci' } }

    stage('Testing'){
      steps { sh 'npm run test:cov || npm test || true' }
      post { always { junit allowEmptyResults: true, testResults: 'reports/junit/*.xml' } }
    }

    stage('Build'){ steps { sh 'npm run build' } }

    stage('SonarQube Analysis'){
      steps {
        withSonarQubeEnv("${SONAR_SERVER_NAME}") {
          sh 'npx sonar-scanner'
        }
      }
    }

    stage('Quality Gate'){
      steps {
        timeout(time: 10, unit: 'MINUTES') {
          script {
            def qg = waitForQualityGate()
            if (qg.status != 'OK') { error "Quality Gate: ${qg.status}" }
          }
        }
      }
    }

    stage('Docker Build'){
      steps {
        script { env.IMAGE_TAG = "${BUILD_NUMBER}" }
        sh '''
          docker build --pull \
            -t ${REGISTRY_URL}/${IMAGE_NAME}:${IMAGE_TAG} \
            -t ${REGISTRY_URL}/${IMAGE_NAME}:latest .
        '''
      }
    }

    stage('Docker Push'){
      steps {
        script {
          docker.withRegistry("http://${REGISTRY_URL}", "${NEXUS_CREDS_ID}") {
            sh """
              docker push ${REGISTRY_URL}/${IMAGE_NAME}:${IMAGE_TAG}
              docker push ${REGISTRY_URL}/${IMAGE_NAME}:latest
            """
          }
        }
      }
    }

    stage('Kubernetes Deploy'){
      steps {
        withCredentials([file(credentialsId: "${KUBECONFIG_ID}", variable: 'KUBECONFIG_FILE')]) {
          sh '''
            export KUBECONFIG="${KUBECONFIG_FILE}"
            kubectl -n ${K8S_NAMESPACE} set image deployment/${DEPLOYMENT_NAME} \
              ${CONTAINER_NAME}=${REGISTRY_URL}/${IMAGE_NAME}:${IMAGE_TAG}
            kubectl -n ${K8S_NAMESPACE} rollout status deployment/${DEPLOYMENT_NAME} --timeout=300s
          '''
        }
      }
    }
  }

  post {
    success { echo "OK -> ${REGISTRY_URL}/${IMAGE_NAME}:${BUILD_NUMBER}" }
    failure { echo "Pipeline falló. Revisa las etapas." }
  }
}
