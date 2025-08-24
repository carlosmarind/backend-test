pipeline {
  agent any

  environment {
    GIT_BRANCH = 'main'
    REPO_URL   = 'https://github.com/Mondacars0165/backend-test.git'
    SONARQUBE_SERVER = 'SonarQubeServer'
    SONAR_PROJECT_KEY = 'backend-test'
    SONAR_SCANNER = 'SonarScanner'
    REGISTRY_URL = 'localhost:8083'       
    REGISTRY_REPO = 'docker-hosted'
    IMAGE_NAME   = 'backend-node-devops'
    FULL_IMAGE   = "${REGISTRY_URL}/${REGISTRY_REPO}/${IMAGE_NAME}"
    NODE_OPTIONS = "--max-old-space-size=4096"
  }

  options {
    timestamps()
    buildDiscarder(logRotator(numToKeepStr: '20'))
    timeout(time: 60, unit: 'MINUTES')
  }

  stages {
    stage('Checkout') {
      steps {
        git branch: env.GIT_BRANCH, url: env.REPO_URL
      }
    }

    stage('Node: Install + Test + Build') {
      agent {
        docker {
          image 'node:22'
          reuseNode true
          args '-v $PWD:/app -w /app'
        }
      }
      steps {
        sh 'node -v && npm -v'
        sh 'npm ci'
        sh 'npm run test:cov'
        sh 'npm run build'
        archiveArtifacts artifacts: 'coverage/**', fingerprint: true, onlyIfSuccessful: true
        junit allowEmptyResults: true, testResults: 'reports/junit/**/*.xml'
      }
    }

    stage('SonarQube: Análisis') {
      steps {
        withSonarQubeEnv(env.SONARQUBE_SERVER) {
          sh """
            sonar-scanner \
              -Dsonar.projectKey=${SONAR_PROJECT_KEY} \
              -Dsonar.projectName=${SONAR_PROJECT_KEY} \
              -Dsonar.sources=src \
              -Dsonar.tests=src \
              -Dsonar.test.inclusions=**/*.spec.ts,**/*.test.ts,**/*.spec.js,**/*.test.js \
              -Dsonar.javascript.lcov.reportPaths=coverage/lcov.info \
              -Dsonar.sourceEncoding=UTF-8
          """
        }
      }
    }

    stage('SonarQube: Quality Gate 90%') {
      steps {
        timeout(time: 15, unit: 'MINUTES') {
          waitForQualityGate abortPipeline: true
        }
      }
    }

    stage('Docker: Build & Tag') {
      steps {
        script {
          sh """
            docker build -t ${FULL_IMAGE}:latest -t ${FULL_IMAGE}:${BUILD_NUMBER} .
          """
        }
      }
    }

    stage('Docker: Login & Push → Nexus') {
      steps {
        withCredentials([usernamePassword(
          credentialsId: 'nexus-docker-creds',
          usernameVariable: 'NEXUS_USER',
          passwordVariable: 'NEXUS_PASS'
        )]) {
          sh """
            echo "${NEXUS_PASS}" | docker login ${REGISTRY_URL} -u "${NEXUS_USER}" --password-stdin
            docker push ${FULL_IMAGE}:latest
            docker push ${FULL_IMAGE}:${BUILD_NUMBER}
            docker logout ${REGISTRY_URL}
          """
        }
      }
    }

    stage('Kubernetes: Deploy/Update') {
      steps {
        sh 'kubectl apply -f kubernetes.yaml'
        sh 'kubectl rollout status deployment/backend-node-devops -n default'
        sh 'kubectl get pods -o wide'
      }
    }
  }

  post {
    success {
      echo "Pipeline OK. Imagen subida como:"
      echo " - ${FULL_IMAGE}:latest"
      echo " - ${FULL_IMAGE}:${BUILD_NUMBER}"
    }
    failure {
      echo "Pipeline falló."
    }
    always {
      sh 'docker images | head -n 20 || true'
      sh 'kubectl get deploy,svc,pods || true'
    }
  }
}
