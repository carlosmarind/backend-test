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
  environment { JEST_JUNIT_OUTPUT = 'junit-report.xml' }
  steps {
    sh '''
      npm test -- --coverage --reporters=default --reporters=jest-junit
    '''
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

        # 0) Usamos una copia local del kubeconfig de la credencial
        cp "$KUBECONFIG_FILE" kubeconfig.patched

        # 1) Detectamos contexto/cluster
        CTX=$(kubectl --kubeconfig kubeconfig.patched config current-context)
        CLUSTER=$(kubectl --kubeconfig kubeconfig.patched config view -o jsonpath='{.contexts[?(@.name=="'"$CTX"'")].context.cluster}')
        echo "contexto: $CTX | cluster: $CLUSTER"

        # 2) Forzamos el API server al portproxy del host (6443)
        kubectl --kubeconfig kubeconfig.patched config set-cluster "$CLUSTER" --server="https://host.docker.internal:6443" >/dev/null

        echo "Server tras parche:"
        kubectl --kubeconfig kubeconfig.patched config view -o jsonpath='{.clusters[?(@.name=="'"$CLUSTER"'")].cluster.server}'; echo

        # 3) Si el CA/hostname no calza, tolerarlo SOLO para el laboratorio
        if ! kubectl --kubeconfig kubeconfig.patched --request-timeout=5s version >/dev/null 2>&1; then
          echo "Activando insecure-skip-tls-verify (SOLO LAB)."
          kubectl --kubeconfig kubeconfig.patched config set-cluster "$CLUSTER" --insecure-skip-tls-verify=true >/dev/null
        fi

        export KUBECONFIG="$PWD/kubeconfig.patched"

        # 4) Sanity check rápido
        kubectl cluster-info || true
        kubectl get ns | head -5 || true

        # 5) Aplicamos manifiestos (sin validar OpenAPI)
        kubectl apply -f kubernetes.yaml --validate=false

        # 6) Elegimos tag inmutable para evitar problemas de cacheo (en vez de :latest)
        TARGET_IMAGE=${REGISTRY}/${IMAGE_NAME}:${BUILD_NUMBER}
        echo "Actualizando deployment/backend-test a la imagen: ${TARGET_IMAGE}"

        # 7) Actualizamos la imagen (sin comillas que rompan la expansión)
        kubectl -n default set image deployment/backend-test backend=${TARGET_IMAGE}

        # 8) Esperamos el rollout con timeout y diagnóstico automático si falla
        if ! kubectl -n default rollout status deployment/backend-test --timeout=180s; then
          echo "Rollout NO completó. Mostrando diagnóstico..."
          kubectl -n default get deploy backend-test -o wide || true
          kubectl -n default get rs -l app=backend-test -o wide || true
          kubectl -n default get pods -l app=backend-test \
            -o custom-columns=NAME:.metadata.name,PHASE:.status.phase,READY:.status.containerStatuses[0].ready,REASON:.status.containerStatuses[0].state.waiting.reason,IMAGE:.spec.containers[0].image --no-headers || true
          kubectl -n default describe deploy/backend-test || true
          kubectl -n default describe rs -l app=backend-test || true
          POD=$(kubectl -n default get pods -l app=backend-test -o jsonpath='{.items[?(@.status.containerStatuses[0].ready==false)].metadata.name}' 2>/dev/null || true)
          [ -n "$POD" ] && kubectl -n default logs "$POD" --tail=200 || true
          exit 1
        fi
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
