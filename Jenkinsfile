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

        # 0) Trabajamos con una copia local del kubeconfig de la credencial
        cp "$KUBECONFIG_FILE" kubeconfig.patched

        # 1) Detectar contexto y cluster actuales
        CTX=$(kubectl --kubeconfig kubeconfig.patched config current-context || true)
        echo "current-context: ${CTX}"
        if [ -z "$CTX" ]; then
          echo "No hay current-context en el kubeconfig, abortando."
          exit 1
        fi
        CLUSTER=$(kubectl --kubeconfig kubeconfig.patched config view -o jsonpath='{.contexts[?(@.name=="'"$CTX"'")].context.cluster}')
        echo "cluster actual: ${CLUSTER}"

        # 2) Leer server actual del cluster
        SERVER=$(kubectl --kubeconfig kubeconfig.patched config view -o jsonpath='{.clusters[?(@.name=="'"$CLUSTER"'")].cluster.server}')
        echo "server actual: ${SERVER}"

        # 3) Si el server es 127.0.0.1:PORT, cambiar a host.docker.internal:PORT
        if echo "$SERVER" | grep -qE '^https://127\\.0\\.0\\.1:[0-9]+'; then
          PORT=$(echo "$SERVER" | sed -E 's#^https://127\\.0\\.0\\.1:([0-9]+).*#\\1#')
          NEW_SERVER="https://host.docker.internal:${PORT}"
          echo "Parcheando server a: ${NEW_SERVER}"
          kubectl --kubeconfig kubeconfig.patched config set-cluster "$CLUSTER" --server="${NEW_SERVER}"
        fi

        # 4) (Fallback común en Docker Desktop) Si sigue apuntando mal, probar con kubernetes.docker.internal:6443
        SERVER2=$(kubectl --kubeconfig kubeconfig.patched config view -o jsonpath='{.clusters[?(@.name=="'"$CLUSTER"'")].cluster.server}')
        if echo "$SERVER2" | grep -qE '^https://127\\.0\\.0\\.1:'; then
          echo "Usando fallback: https://kubernetes.docker.internal:6443"
          kubectl --kubeconfig kubeconfig.patched config set-cluster "$CLUSTER" --server="https://kubernetes.docker.internal:6443"
        fi

        # 5) Ver conectividad (no fallar si info no está pública)
        kubectl --kubeconfig kubeconfig.patched cluster-info || true
        kubectl --kubeconfig kubeconfig.patched version --client=true

        # 6) Exportar KUBECONFIG a la copia parcheada y desplegar
        export KUBECONFIG="$PWD/kubeconfig.patched"
        kubectl apply -f kubernetes.yaml --validate=false

        # 7) Actualizar imagen + esperar rollout
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
