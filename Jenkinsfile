pipeline {
  agent any

  options { timestamps() }

  tools {
    nodejs 'Node20'              // Global Tool: NodeJS (LTS 18/20)
    // SonarScanner se obtiene con tool() dentro del stage
  }

  environment {
    SONARQUBE_SERVER = 'SonarServer'
    SONAR_PROJECT_KEY = 'backend-test-mauricio'
    REGISTRY = 'host.docker.internal:8082'
    IMAGE_NAME = 'labo3/backend-test'
    DOCKER_BUILDKIT = '1'
  }

  stages {
    stage('Checkout') {
      steps { checkout scm }
    }

    stage('Install deps') {
      steps {
        sh '''
          if [ -f package-lock.json ]; then
            npm ci
          else
            npm install
          fi
        '''
      }
    }

    stage('Testing + Coverage') {
      environment { JEST_JUNIT_OUTPUT = 'junit-report.xml' } // requiere jest-junit (opcional)
      steps {
        // Si no tienes jest-junit aún, puedes dejar solo: npm test -- --coverage
        sh 'npm test -- --coverage --reporters=default --reporters=jest-junit || true'
      }
    }

    stage('Build app') {
      steps {
        sh 'npm run build || echo "ajusta el build si tu app no usa npm"'
      }
    }

    stage('SonarQube Scan') {
      steps {
        script {
          def scannerHome = tool 'SonarScanner'  // Global Tool: SonarQube Scanner
          withSonarQubeEnv("${env.SONARQUBE_SERVER}") {
            withCredentials([string(credentialsId: 'sonar-token', variable: 'SONAR_TOKEN')]) {
              sh """
                export SONAR_TOKEN="$SONAR_TOKEN"
                "${scannerHome}/bin/sonar-scanner" \
                  -Dsonar.host.url="$SONAR_HOST_URL" \
                  -Dsonar.projectKey='${SONAR_PROJECT_KEY}' \
                  -Dsonar.sources=src \
                  -Dsonar.tests=src \
                  -Dsonar.test.inclusions=**/*.test.* \
                  -Dsonar.javascript.lcov.reportPaths=coverage/lcov.info
              """
            }
          }
        }
      }
    }

    stage('Quality Gate') {
      steps {
        timeout(time: 30, unit: 'MINUTES') {
          waitForQualityGate abortPipeline: true
        }
      }
    }

    /* ---------- A partir de aquí quitamos el label 'docker' ---------- */
    stage('Build Docker image') {
      agent any
      steps {
        sh """
          docker version
          docker build \
            -t ${REGISTRY}/${IMAGE_NAME}:latest \
            -t ${REGISTRY}/${IMAGE_NAME}:${BUILD_NUMBER} .
        """
      }
    }

    stage('Push to Nexus') {
      agent any
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
  agent any
  steps {
    withCredentials([file(credentialsId: 'kubeconfig', variable: 'KUBECONFIG_FILE')]) {
      sh '''
        set -e

        # 1) Copiamos el kubeconfig de la credencial a uno editable local
        cp "$KUBECONFIG_FILE" kubeconfig.patched

        echo "Server actual en kubeconfig:"
        awk "/server:/{print}" kubeconfig.patched | head -1 || true

        # 2) Si el server apunta a 127.0.0.1 (inaccesible desde el contenedor de Jenkins),
        #    lo cambiamos por host.docker.internal manteniendo el puerto
        if awk "/server:/{print \$2}" kubeconfig.patched | head -1 | grep -qE '^https://127\\.0\\.0\\.1:'; then
          echo "Parcheando kubeconfig para usar host.docker.internal..."
          sed -i 's#https://127\\.0\\.0\\.1:#https://host.docker.internal:#' kubeconfig.patched
        fi

        export KUBECONFIG="$PWD/kubeconfig.patched"

        # 3) Diagnóstico rápido
        kubectl cluster-info || true
        kubectl version --client=true

        # 4) Aplicamos el manifiesto sin validar contra OpenAPI del API Server
        kubectl apply -f kubernetes.yaml --validate=false

        # 5) Actualizamos imagen y esperamos rollout
        kubectl set image deployment/backend-test backend='"${REGISTRY}/${IMAGE_NAME}:latest"' -n default
        kubectl rollout status deployment/backend-test -n default
      '''
    }
  }
}
  }

  post {
    always {
      // Evita fallo si docker no está disponible por cualquier motivo
      sh 'command -v docker >/dev/null 2>&1 && docker logout ${REGISTRY} || true'
      junit allowEmptyResults: true, testResults: 'junit-report*.xml'
      archiveArtifacts artifacts: 'coverage/**/*, build/**/*', allowEmptyArchive: true
    }
  }
}
