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
  steps {
    script {
      def status = sh(script: '''
        set -e
        rm -f junit*.xml || true
        npm run test:ci
        echo "Archivos JUnit generados:"
        ls -l junit*.xml || true
      ''', returnStatus: true)

      if (status != 0) {
        currentBuild.result = 'UNSTABLE'
        echo "⚠️ Tests fallaron (exit=${status}). Marcamos UNSTABLE, pero continuamos."
      }
    }
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
      def scannerHome = tool 'SonarScanner'
      withSonarQubeEnv("${env.SONARQUBE_SERVER}") {
        withCredentials([string(credentialsId: 'sonar-token', variable: 'SONAR_TOKEN')]) {
          sh """
            export SONAR_TOKEN="$SONAR_TOKEN"
            "${scannerHome}/bin/sonar-scanner" \
              -Dsonar.host.url="$SONAR_HOST_URL" \
              -Dsonar.projectKey='${SONAR_PROJECT_KEY}' \
              -Dsonar.projectName='${SONAR_PROJECT_KEY}' \
              -Dsonar.sources=src \
              -Dsonar.tests=src \
              -Dsonar.test.inclusions=**/*.spec.ts \
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
      script {
        def qg = waitForQualityGate()   // NO usamos abortPipeline
        if (qg.status != 'OK') {
          currentBuild.result = 'UNSTABLE'
          echo "⚠️ Quality Gate: ${qg.status}. Marcamos UNSTABLE y seguimos."
        } else {
          echo "✅ Quality Gate OK"
        }
      }
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

        # 5) Aplicamos manifiestos
        kubectl apply -f kubernetes.yaml --validate=false

        # 6) Actualizamos imagen con tag inmutable de este build
        TARGET_IMAGE=${REGISTRY}/${IMAGE_NAME}:${BUILD_NUMBER}
        echo "Actualizando deployment/backend-test a: ${TARGET_IMAGE}"
        kubectl -n default set image deployment/backend-test backend=${TARGET_IMAGE}

        # 7) Esperamos rollout y, si falla, diagnosticamos
        if ! kubectl -n default rollout status deployment/backend-test --timeout=180s; then
          echo "Rollout NO completó. Mostrando diagnóstico..."
          kubectl -n default get deploy backend-test -o wide || true
          kubectl -n default get rs -l app=backend-test -o wide || true
          kubectl -n default get pods -l app=backend-test -o wide || true
          kubectl -n default describe deploy/backend-test || true
          kubectl -n default describe rs -l app=backend-test || true
          POD=$(kubectl -n default get pods -l app=backend-test -o jsonpath='{.items[?(@.status.containerStatuses[0].ready==false)].metadata.name}' 2>/dev/null || true)
          [ -n "$POD" ] && kubectl -n default logs "$POD" --tail=200 || true
          exit 1
        fi

        # 8) 📸 Evidencia post-deploy (impresión + archivo para artefactos)
        echo "===== K8s Status (post-deploy) =====" | tee k8s-status.txt
        echo "\nDeployment:" | tee -a k8s-status.txt
        kubectl -n default get deploy backend-test -o wide | tee -a k8s-status.txt

        echo "\nReplicaSets:" | tee -a k8s-status.txt
        kubectl -n default get rs -l app=backend-test -o wide | tee -a k8s-status.txt

        echo "\nPods:" | tee -a k8s-status.txt
        kubectl -n default get pods -l app=backend-test -o wide | tee -a k8s-status.txt

        echo "\nService:" | tee -a k8s-status.txt
        kubectl -n default get svc backend-test -o wide | tee -a k8s-status.txt

        echo "\n(Para probar local: kubectl -n default port-forward svc/backend-test 3000:80 )" | tee -a k8s-status.txt
      '''
    }
  }
}




  }

post {
  always {
    sh 'command -v docker >/dev/null 2>&1 && docker logout ${REGISTRY} || true'

    junit allowEmptyResults: true, testResults: 'junit*.xml'

    // agrega k8s-status.txt
    archiveArtifacts artifacts: 'coverage/**/*, dist/**/*, k8s-status.txt', allowEmptyArchive: true
  }
}
}
