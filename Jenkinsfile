pipeline {
  agent any
  options { timestamps() }   // <-- quitamos ansiColor
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
  tools { nodejs "NodeJS" }  // <-- usa el nombre real de tu instalación

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
    withCredentials([usernamePassword(credentialsId: "${NEXUS_CREDS_ID}", usernameVariable: 'DOCKER_USER', passwordVariable: 'DOCKER_PASS')]) {
      sh '''
        set -eux
        echo "$DOCKER_PASS" | docker login http://${REGISTRY_URL} -u "$DOCKER_USER" --password-stdin
        docker version
        docker images | grep "${IMAGE_NAME}" || true
        # reintentos por si Nexus tarda en aceptar la capa latest
        for i in 1 2 3; do
          docker push ${REGISTRY_URL}/${IMAGE_NAME}:${IMAGE_TAG} && break || sleep 3
        done
        for i in 1 2 3; do
          docker push ${REGISTRY_URL}/${IMAGE_NAME}:latest && break || sleep 3
        done
        docker logout http://${REGISTRY_URL} || true
      '''
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
