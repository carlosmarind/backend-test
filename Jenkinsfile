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
          set -eux

          NS="${K8S_NAMESPACE}"
          DF="${DEPLOYMENT_FILE:-kubernetes.yaml}"
          [ -f "$DF" ] || { echo "No se encontró $DF"; ls -la; exit 2; }

          # Limpieza para evitar colisiones previas (carpeta 'kubeconfig' etc.)
          rm -rf "$WORKSPACE/kubeconfig" "$WORKSPACE/.kube" || true
          rm -f  "$WORKSPACE/kubeconfig.yaml" || true

          # Copiamos SIEMPRE a un archivo con nombre fijo
          cp "$KUBECONFIG_FILE" "$WORKSPACE/kubeconfig.yaml"
          chmod 600 "$WORKSPACE/kubeconfig.yaml"

          # kubectl en contenedor SIEMPRE con --kubeconfig al archivo montado
          KCA="docker run --rm -i --user=0:0 \
               -v $WORKSPACE/kubeconfig.yaml:/kube/config:ro \
               bitnami/kubectl:latest \
               --kubeconfig=/kube/config"

          # (opcional) contexto actual por si quieres fijarlo
          CTX="$($KCA config view -o jsonpath='{.current-context}' || true)"
          [ -n "$CTX" ] && KCTX="--context=$CTX" || KCTX=""

          # 1) imagePullSecret -> por STDIN, sin archivos intermedios
          REG_SERVER="${NEXUS_REGISTRY:-host.docker.internal:8082}"
          echo "Usando registry para imagePullSecret: $REG_SERVER"

          $KCA $KCTX -n "$NS" create secret docker-registry nexus-docker \
            --docker-server="$REG_SERVER" \
            --docker-username="$REG_USER" \
            --docker-password="$REG_PASS" \
            --docker-email="noreply@local" \
            --dry-run=client -o yaml \
          | $KCA $KCTX -n "$NS" apply --validate=false -f -

          # 2) Aplicar manifiesto de la app por STDIN
          echo "==> Aplicando manifiesto: $DF"
          cat "$DF" | $KCA $KCTX -n "$NS" apply --validate=false -f -

          # 3) Forzar imagen exacta del build
          echo "==> Set image a ${IMAGE_NAME}:${BUILD_NUMBER}"
          $KCA $KCTX -n "$NS" set image deployment/backend-test \
            backend-test=${IMAGE_NAME}:${BUILD_NUMBER}

          # 4) Esperar rollout y validar réplicas
          $KCA $KCTX -n "$NS" rollout status deployment/backend-test --timeout=180s
          DR=$($KCA $KCTX -n "$NS" get deploy backend-test -o jsonpath='{.spec.replicas}')
          AR=$($KCA $KCTX -n "$NS" get deploy backend-test -o jsonpath='{.status.availableReplicas}')
          echo "Replicas deseadas: ${DR:-?} | disponibles: ${AR:-0}"
          test -n "$DR" && [ "${AR:-0}" = "$DR" ]

          # 5) Diagnóstico final
          $KCA $KCTX -n "$NS" get pods -l app=backend-test -o wide
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
