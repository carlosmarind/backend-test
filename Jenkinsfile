pipeline {
  agent any

  environment {
    IMAGE_TOOLING      = 'edgardobenavidesl/node-java-sonar-docker:latest'
    SONARQUBE_SERVER   = 'SonarQube'                     // nombre en Jenkins Global Config
    SONAR_PROJECT_KEY  = 'backend-test'
    NEXUS_REGISTRY     = 'localhost:8082'                // ⚠️ usa host/IP alcanzable por los nodos K8s
    IMAGE_NAME         = "${NEXUS_REGISTRY}/backend-test"
    BUILD_TAG          = "${env.BUILD_NUMBER}"
    MAX_IMAGES_TO_KEEP = '5'
    K8S_NAMESPACE      = 'default'                       // ajusta si usas otro namespace
  }

  options { timeout(time: 45, unit: 'MINUTES') }

  stages {
    stage('Checkout SCM') {
      steps { checkout scm }
    }

    stage('Install dependencies') {
      steps {
        script {
          docker.image(env.IMAGE_TOOLING).inside('-v /var/run/docker.sock:/var/run/docker.sock --network devnet') {
            sh 'npm ci'
          }
        }
      }
    }

    stage('Run tests & coverage') {
      steps {
        script {
          docker.image(env.IMAGE_TOOLING).inside('-v /var/run/docker.sock:/var/run/docker.sock --network devnet') {
            sh '''
              set -eux
              npm run test:cov
              # Normaliza rutas de lcov para Sonar
              sed -i 's|SF:.*/src|SF:src|g' coverage/lcov.info
              sed -i 's#\\\\#/#g' coverage/lcov.info
            '''
          }
        }
      }
    }

    stage('Build app') {
      steps {
        script {
          docker.image(env.IMAGE_TOOLING).inside('-v /var/run/docker.sock:/var/run/docker.sock --network devnet') {
            sh 'npm run build'
          }
        }
      }
    }

    stage('SonarQube Analysis') {
      steps {
        script {
          docker.image(env.IMAGE_TOOLING).inside('-v /var/run/docker.sock:/var/run/docker.sock --network devnet') {
            withSonarQubeEnv(SONARQUBE_SERVER) {
              withCredentials([string(credentialsId: 'sonarqube-cred', variable: 'SONAR_TOKEN')]) {
                sh '''
                  set -e
                  # Usa el valor del env o 'backend-test' como respaldo
                  PK="${SONAR_PROJECT_KEY:-backend-test}"

                  # (opcional) verifica que no esté vacío
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
                    -Dsonar.login=$SONAR_TOKEN
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
          docker.image(env.IMAGE_TOOLING).inside('-v /var/run/docker.sock:/var/run/docker.sock --network devnet') {
            withCredentials([usernamePassword(credentialsId: 'nexus-credentials',
              usernameVariable: 'NEXUS_USER', passwordVariable: 'NEXUS_PASS')]) {
              sh '''
                set -eux
                echo "$NEXUS_PASS" | docker login -u "$NEXUS_USER" --password-stdin http://${NEXUS_REGISTRY}

                docker build -t ${IMAGE_NAME}:${BUILD_NUMBER} -t ${IMAGE_NAME}:latest .
                docker push ${IMAGE_NAME}:${BUILD_NUMBER}
                docker push ${IMAGE_NAME}:latest

                docker image prune -f
              '''
            }
          }
        }
      }
    }

    stage('Deploy to Kubernetes') {
      steps {
        script {
          withCredentials([
            file(credentialsId: 'kubeconfig', variable: 'KUBECONFIG_FILE'),
            string(credentialsId: 'api-key',    variable: 'API_KEY'),
            usernamePassword(credentialsId: 'nexus-credentials', usernameVariable: 'REG_USER', passwordVariable: 'REG_PASS') // por si luego creas imagePullSecret
          ]) {
            sh '''
              set -eux
              NS="${K8S_NAMESPACE}"
              KCONF="$KUBECONFIG_FILE"

              # 1) ConfigMap y Secret (sin exponer secretos en Git)
              docker run --rm --network devnet \
                -v "$KCONF:/root/.kube/config:ro" \
                bitnami/kubectl:latest \
                kubectl -n "$NS" create configmap app-config \
                  --from-literal=USERNAME=userkube \
                  --dry-run=client -o yaml \
              | docker run --rm -i --network devnet \
                  -v "$KCONF:/root/.kube/config:ro" \
                  bitnami/kubectl:latest \
                  kubectl apply -f -

              docker run --rm --network devnet \
                -v "$KCONF:/root/.kube/config:ro" \
                bitnami/kubectl:latest \
                kubectl -n "$NS" create secret generic app-secrets \
                  --from-literal=API_KEY="$API_KEY" \
                  --dry-run=client -o yaml \
              | docker run --rm -i --network devnet \
                  -v "$KCONF:/root/.kube/config:ro" \
                  bitnami/kubectl:latest \
                  kubectl apply -f -

              # (Opcional) imagePullSecret si tu cluster lo requiere
              # docker run --rm --network devnet \
              #   -v "$KCONF:/root/.kube/config:ro" \
              #   bitnami/kubectl:latest \
              #   kubectl -n "$NS" create secret docker-registry nexus-docker \
              #     --docker-server='${NEXUS_REGISTRY}' \
              #     --docker-username="$REG_USER" \
              #     --docker-password="$REG_PASS" \
              #     --docker-email="noreply@local" \
              #     --dry-run=client -o yaml \
              # | docker run --rm -i --network devnet \
              #     -v "$KCONF:/root/.kube/config:ro" \
              #     bitnami/kubectl:latest \
              #     kubectl apply -f -

              # 2) Aplica manifiesto (monta el workspace para ver kubernetes.yaml)
              docker run --rm --network devnet \
                -v "$KCONF:/root/.kube/config:ro" \
                -v "$PWD:/work" -w /work \
                bitnami/kubectl:latest \
                kubectl -n "$NS" apply -f kubernetes.yaml

              # 3) Actualiza imagen y espera rollout
              docker run --rm --network devnet \
                -v "$KCONF:/root/.kube/config:ro" \
                bitnami/kubectl:latest \
                kubectl -n "$NS" set image deployment/backend-test backend-test=${IMAGE_NAME}:latest

              docker run --rm --network devnet \
                -v "$KCONF:/root/.kube/config:ro" \
                bitnami/kubectl:latest \
                kubectl -n "$NS" rollout status deployment/backend-test --timeout=180s

              # 4) Verificación estricta
              AR=$(docker run --rm --network devnet \
                -v "$KCONF:/root/.kube/config:ro" \
                bitnami/kubectl:latest \
                kubectl -n "$NS" get deploy backend-test -o jsonpath='{.status.availableReplicas}')
              echo "Available replicas: ${AR:-0}"
              test "${AR:-0}" = "3"

              docker run --rm --network devnet \
                -v "$KCONF:/root/.kube/config:ro" \
                bitnami/kubectl:latest \
                kubectl -n "$NS" get pods -l app=backend-test -o wide
            '''
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
