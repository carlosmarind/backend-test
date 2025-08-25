pipeline {
  agent any

  environment {
    IMAGE_TOOLING      = 'edgardobenavidesl/node-java-sonar-docker:latest' // Node + Java + Docker CLI + Sonar
    SONARQUBE_SERVER   = 'SonarQube'
    SONAR_PROJECT_KEY  = 'backend-test'

    // === Registry (Nexus) ===
    NEXUS_REGISTRY     = 'host.docker.internal:8082'
    IMAGE_NAME         = "${NEXUS_REGISTRY}/backend-test"

    // === K8s ===
    K8S_NAMESPACE      = 'ebl'
    DEPLOYMENT_NAME    = 'backend-test'     // metadata.name del Deployment
    CONTAINER_NAME     = 'backend'          // name del container dentro del pod
    DEPLOYMENT_FILE    = 'kubernetes.yaml'  // tu manifiesto (namespace, cm, secret, svc, deploy)

    // === Misc ===
    BUILD_TAG          = "${env.BUILD_NUMBER}"
    MAX_IMAGES_TO_KEEP = '5'
    KUBECTL_VERSION    = 'v1.30.0'          // cliente kubectl a instalar en el contenedor tooling
    KUBECONFIG         = '/home/jenkins/.kube/config' // ajusta si lo tienes en otro path
  }

  options { timeout(time: 45, unit: 'MINUTES') }

  stages {

    stage('Checkout SCM') {
      steps { checkout scm }
    }

    stage('Install dependencies') {
      steps {
        script {
          def insideArgs = '--add-host=host.docker.internal:host-gateway -v /var/run/docker.sock:/var/run/docker.sock --network devnet'
          docker.image(env.IMAGE_TOOLING).inside(insideArgs) {
            sh 'set -eux; npm ci'
          }
        }
      }
    }

    stage('Run tests & coverage') {
      steps {
        script {
          def insideArgs = '--add-host=host.docker.internal:host-gateway -v /var/run/docker.sock:/var/run/docker.sock --network devnet'
          docker.image(env.IMAGE_TOOLING).inside(insideArgs) {
            sh '''
              set -eux
              npm run test:cov
              # normalización de rutas lcov para Sonar
              sed -i 's|SF:.*/src|SF:src|g' coverage/lcov.info || true
              sed -i 's#\\\\#/#g' coverage/lcov.info || true
            '''
          }
        }
      }
    }

    stage('Build app') {
      steps {
        script {
          def insideArgs = '--add-host=host.docker.internal:host-gateway -v /var/run/docker.sock:/var/run/docker.sock --network devnet'
          docker.image(env.IMAGE_TOOLING).inside(insideArgs) {
            sh 'set -eux; npm run build'
          }
        }
      }
    }

    stage('SonarQube Analysis') {
      steps {
        script {
          def insideArgs = '--add-host=host.docker.internal:host-gateway -v /var/run/docker.sock:/var/run/docker.sock --network devnet'
          docker.image(env.IMAGE_TOOLING).inside(insideArgs) {
            withSonarQubeEnv(SONARQUBE_SERVER) {
              withCredentials([string(credentialsId: 'sonarqube-cred', variable: 'SONAR_TOKEN')]) {
                sh '''
                  set -eux
                  PK="${SONAR_PROJECT_KEY:-backend-test}"
                  [ -n "$PK" ] || { echo "ERROR: SONAR_PROJECT_KEY vacío"; exit 2; }
                  sonar-scanner \
                    -Dsonar.projectKey=$PK \
                    -Dsonar.projectName=$PK \
                    -Dsonar.sources=src \
                    -Dsonar.tests=src \
                    -Dsonar.test.inclusions=**/*.spec.ts \
                    -Dsonar.javascript.lcov.reportPaths=coverage/lcov.info \
                    -Dsonar.exclusions=node_modules/**,dist/** \
                    -Dsonar.coverage.exclusions=**/*.spec.ts \
                    -Dsonar.host.url=http://sonarqube:9000 \
                    -Dsonar.login="$SONAR_TOKEN"
                '''
              }
            }
          }
        }
      }
    }

    stage('Quality Gate') {
      steps {
        timeout(time: 10, unit: 'MINUTES') {
          script {
            def qg = waitForQualityGate abortPipeline: true
            echo "Quality Gate: ${qg.status}"
          }
        }
      }
    }

    stage('Docker Build & Push (Nexus)') {
      steps {
        script {
          def insideArgs = '--add-host=host.docker.internal:host-gateway -v /var/run/docker.sock:/var/run/docker.sock --network devnet'
          docker.image(env.IMAGE_TOOLING).inside(insideArgs) {
            withCredentials([usernamePassword(credentialsId: 'nexus-credentials', usernameVariable: 'NEXUS_USER', passwordVariable: 'NEXUS_PASS')]) {
              sh '''
                set -eux
                REG="${NEXUS_REGISTRY}"   # p.ej. host.docker.internal:8082

                # Ping rápido al /v2/ (puede avisar si hay problema de red)
                docker run --rm --network devnet --add-host=host.docker.internal:host-gateway \
                  curlimages/curl:8.8.0 -sS -m 8 -I http://host.docker.internal:8082/v2/ || true

                # Login (sin "http://", el daemon sabe que es insecure-registries)
                for i in 1 2 3; do
                  echo "$NEXUS_PASS" | docker login -u "$NEXUS_USER" --password-stdin "${REG}" && break || {
                    echo "Login falló (${i}/3). Reintentando..."
                    sleep 3
                  }
                done

                # Build & tags
                docker build -t ${IMAGE_NAME}:${BUILD_NUMBER} -t ${IMAGE_NAME}:latest .

                # Push con reintentos
                for i in 1 2 3; do docker push ${IMAGE_NAME}:${BUILD_NUMBER} && break || { echo "Retry push tag (${i}/3)"; sleep 4; }; done
                for i in 1 2 3; do docker push ${IMAGE_NAME}:latest        && break || { echo "Retry push latest (${i}/3)"; sleep 4; }; done

                docker image prune -f || true
              '''
            }
          }
        }
      }
    }

    stage('Deploy to Kubernetes (namespace ebl)') {
      steps {
        script {
          def insideArgs = '--add-host=host.docker.internal:host-gateway -v /var/run/docker.sock:/var/run/docker.sock --network devnet'
          docker.image(env.IMAGE_TOOLING).inside(insideArgs) {
            sh """
              set -eux

              # Instala kubectl si no está (ephemeral, dentro del contenedor tooling)
              if ! command -v kubectl >/dev/null 2>&1; then
                curl -fsSLo /usr/local/bin/kubectl https://storage.googleapis.com/kubernetes-release/release/${KUBECTL_VERSION}/bin/linux/amd64/kubectl
                chmod +x /usr/local/bin/kubectl
              fi

              # Asegurar namespace y recursos base (idempotente)
              kubectl get ns ${K8S_NAMESPACE} >/dev/null 2>&1 || kubectl create namespace ${K8S_NAMESPACE}
              if [ -f "${DEPLOYMENT_FILE}" ]; then
                kubectl apply -f "${DEPLOYMENT_FILE}"
              fi

              # Actualiza solo la imagen del container del Deployment
              kubectl -n ${K8S_NAMESPACE} set image deploy/${DEPLOYMENT_NAME} ${CONTAINER_NAME}=${IMAGE_NAME}:${BUILD_NUMBER} --record

              # Espera el rollout
              kubectl -n ${K8S_NAMESPACE} rollout status deploy/${DEPLOYMENT_NAME} --timeout=180s
            """
          }
        }
      }
    }
  }

  post {
    always {
      echo "Pipeline finalizado."
      deleteDir()
    }
  }
}
