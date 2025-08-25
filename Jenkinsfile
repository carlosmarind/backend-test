pipeline {
  agent any

  environment {
    IMAGE_TOOLING      = 'edgardobenavidesl/node-java-sonar-docker:latest'
    SONARQUBE_SERVER   = 'SonarQube'
    SONAR_PROJECT_KEY  = 'backend-test'
    NEXUS_REGISTRY     = 'host.docker.internal:8082'    // coincide con insecure-registries
    IMAGE_NAME         = "${NEXUS_REGISTRY}/backend-test"
    BUILD_TAG          = "${env.BUILD_NUMBER}"
    MAX_IMAGES_TO_KEEP = '5'
    K8S_NAMESPACE      = 'default'
    DEPLOYMENT_FILE    = 'kubernetes.yaml'
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
            sh 'set -eux; npm ci'
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
          docker.image(env.IMAGE_TOOLING).inside('-v /var/run/docker.sock:/var/run/docker.sock --network devnet') {
            sh 'set -eux; npm run build'
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
          docker.image(env.IMAGE_TOOLING).inside('-v /var/run/docker.sock:/var/run/docker.sock --network devnet') {
            withCredentials([usernamePassword(credentialsId: 'nexus-credentials', usernameVariable: 'NEXUS_USER', passwordVariable: 'NEXUS_PASS')]) {
              sh '''
                set -eux
                echo "$NEXUS_PASS" | docker login -u "$NEXUS_USER" --password-stdin ${NEXUS_REGISTRY}

                docker build -t ${IMAGE_NAME}:${BUILD_NUMBER} -t ${IMAGE_NAME}:latest .

                for i in 1 2 3; do
                  docker push ${IMAGE_NAME}:${BUILD_NUMBER} && break || { echo "Retry push ${BUILD_NUMBER} ($i/3)"; sleep 3; }
                done
                for i in 1 2 3; do
                  docker push ${IMAGE_NAME}:latest && break || { echo "Retry push latest ($i/3)"; sleep 3; }
                done

                docker image prune -f || true
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
        usernamePassword(credentialsId: 'nexus-credentials',
          usernameVariable: 'REG_USER', passwordVariable: 'REG_PASS')
      ]) {
        sh '''
          set -euxo pipefail

          NS="${K8S_NAMESPACE}"
          DF="${DEPLOYMENT_FILE:-kubernetes.yaml}"
          [ -f "$DF" ] || { echo "No se encontró $DF"; ls -la; exit 2; }

          # --- kubeconfig: ya es un ARCHIVO (Secret file) ---
          cp -f "$KUBECONFIG_FILE" "$WORKSPACE/kubeconfig.yaml"
          chmod 600 "$WORKSPACE/kubeconfig.yaml"

          # Verificar que el archivo existe y tiene contenido
          [ -s "$WORKSPACE/kubeconfig.yaml" ] || { echo "kubeconfig.yaml está vacío o no existe"; exit 2; }
          echo "=== Primeras líneas del kubeconfig ==="
          head -n 5 "$WORKSPACE/kubeconfig.yaml"

          # --- alias para kubectl ---
          KUB="docker run --rm --user=0:0 \
               -v $WORKSPACE:/work:ro \
               bitnami/kubectl:latest \
               --kubeconfig=/work/kubeconfig.yaml"

          # --- Verificar conexión a Kubernetes ---
          echo "=== Verificando versión de kubectl ==="
          $KUB version --client
          
          echo "=== Verificando conexión al cluster ==="
          $KUB cluster-info

          # --- Crear/actualizar imagePullSecret ---
          REG_SERVER="${NEXUS_REGISTRY:-host.docker.internal:8082}"
          echo "=== Creando secret de Docker registry ==="
          $KUB -n "$NS" create secret docker-registry nexus-docker \
            --docker-server="$REG_SERVER" \
            --docker-username="$REG_USER" \
            --docker-password="$REG_PASS" \
            --docker-email="noreply@local" \
            --dry-run=client -o yaml | $KUB -n "$NS" apply -f -

          # --- Aplicar manifiesto de la aplicación ---
          echo "=== Aplicando manifiesto: $DF ==="
          $KUB -n "$NS" apply -f /work/"$DF"

          # --- Actualizar la imagen del deployment ---
          echo "=== Actualizando imagen a ${IMAGE_NAME}:${BUILD_NUMBER} ==="
          $KUB -n "$NS" set image deployment/backend-test backend-test=${IMAGE_NAME}:${BUILD_NUMBER}

          # --- Esperar por el rollout ---
          echo "=== Esperando por el rollout ==="
          $KUB -n "$NS" rollout status deployment/backend-test --timeout=180s

          # --- Verificar estado final ---
          echo "=== Estado final del deployment ==="
          $KUB -n "$NS" get deployment backend-test -o wide
          
          echo "=== Pods en ejecución ==="
          $KUB -n "$NS" get pods -l app=backend-test -o wide

          # --- Verificación adicional ---
          DR=$($KUB -n "$NS" get deploy backend-test -o jsonpath='{.spec.replicas}')
          AR=$($KUB -n "$NS" get deploy backend-test -o jsonpath='{.status.availableReplicas}')
          echo "Replicas deseadas: ${DR:-?} | disponibles: ${AR:-0}"
          
          if [ -n "$DR" ] && [ "${AR:-0}" -eq "$DR" ]; then
            echo "✅ Despliegue exitoso - Todas las réplicas están disponibles"
          else
            echo "❌ Problema con el despliegue - Réplicas disponibles: ${AR:-0}/$DR"
            exit 1
          fi
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
