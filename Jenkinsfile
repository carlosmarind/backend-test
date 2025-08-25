pipeline {
  agent any

  environment {
    IMAGE_TOOLING        = 'edgardobenavidesl/node-java-sonar-docker:latest'

    SONARQUBE_SERVER     = 'SonarQube'          // nombre en Jenkins Global Config
    SONAR_PROJECT_KEY    = 'backend-test'

    // Registries: push (host local) vs pull (desde los nodos K8s)
    NEXUS_REGISTRY_PUSH  = 'localhost:8082'
    NEXUS_REGISTRY_PULL  = 'host.docker.internal:8082'

    IMAGE_NAME_PUSH      = "${NEXUS_REGISTRY_PUSH}/backend-test"
    IMAGE_NAME_PULL      = "${NEXUS_REGISTRY_PULL}/backend-test"

    BUILD_TAG            = "${env.BUILD_NUMBER}"
    MAX_IMAGES_TO_KEEP   = '5'

    K8S_NAMESPACE        = 'default'
    DEPLOYMENT_FILE      = 'kubernetes.yaml'    // existe en el repo raíz
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
            sh '''
              set -eux
              npm ci
            '''
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
              # Normaliza rutas del lcov para Sonar (tolerante si no existe)
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
            sh '''
              set -eux
              npm run build
            '''
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
            withCredentials([usernamePassword(
              credentialsId: 'nexus-credentials',
              usernameVariable: 'NEXUS_USER',
              passwordVariable: 'NEXUS_PASS'
            )]) {
              sh '''
                set -eux
                # Login por HTTP al registry local (insecure registry ya configurado)
                echo "$NEXUS_PASS" | docker login -u "$NEXUS_USER" --password-stdin http://${NEXUS_REGISTRY_PUSH}

                # Build con dos tags (BUILD_NUMBER y latest)
                docker build \
                  -t ${IMAGE_NAME_PUSH}:${BUILD_NUMBER} \
                  -t ${IMAGE_NAME_PUSH}:latest .

                # Push de ambas etiquetas
                docker push ${IMAGE_NAME_PUSH}:${BUILD_NUMBER}
                docker push ${IMAGE_NAME_PUSH}:latest

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
          // Necesitamos kubeconfig + credenciales de Nexus para imagePullSecret
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

              # Prepara kubeconfig dentro del workspace y móntalo como /root/.kube/config (solo lectura)
              mkdir -p "$WORKSPACE/.kube"
              cp "$KUBECONFIG_FILE" "$WORKSPACE/.kube/config"
              chmod 600 "$WORKSPACE/.kube/config"

              # Base kubectl como contenedor (root, con KUBECONFIG dentro)
              KENV='--user=0:0 -e HOME=/root -e KUBECONFIG=/root/.kube/config'
              KMNT='-v "$WORKSPACE/.kube:/root/.kube:ro"'
              KMNTW='-v "$WORKSPACE/.kube:/root/.kube:ro" -v "$WORKSPACE:/work" -w /work'

              # 1) imagePullSecret apuntando al registry PULL (host.docker.internal:8082)
              #    OJO: --docker-server DEBE ser el host:puerto exacto que usa la imagen en el Deployment
              sh -c "docker run --rm $KENV $KMNT bitnami/kubectl:latest -n $NS create secret docker-registry nexus-docker \
                  --docker-server=${NEXUS_REGISTRY_PULL} \
                  --docker-username=$REG_USER \
                  --docker-password=$REG_PASS \
                  --docker-email=noreply@local \
                  --dry-run=client -o yaml" \
              | sh -c "docker run --rm $KENV $KMNT bitnami/kubectl:latest -n $NS apply -f -"

              # 2) Aplica el manifiesto desde el workspace
              sh -c "docker run --rm $KENV $KMNTW bitnami/kubectl:latest -n $NS apply -f $DF"

              # 3) Fuerza la imagen al tag del build (el repo es el mismo en Nexus, accesible por ambos hosts)
              sh -c "docker run --rm $KENV $KMNT bitnami/kubectl:latest -n $NS set image deployment/backend-test backend-test=${IMAGE_NAME_PULL}:${BUILD_NUMBER}"

              # 4) Espera el rollout y valida réplicas
              sh -c "docker run --rm $KENV $KMNT bitnami/kubectl:latest -n $NS rollout status deployment/backend-test --timeout=180s"

              DR=$(sh -c "docker run --rm $KENV $KMNT bitnami/kubectl:latest -n $NS get deploy backend-test -o jsonpath='{.spec.replicas}'")
              AR=$(sh -c "docker run --rm $KENV $KMNT bitnami/kubectl:latest -n $NS get deploy backend-test -o jsonpath='{.status.availableReplicas}'")
              echo "Desired replicas: ${DR:-?} | Available replicas: ${AR:-0}"
              test -n "$DR" && [ "${AR:-0}" = "$DR" ]

              # 5) Listado final de pods
              sh -c "docker run --rm $KENV $KMNT bitnami/kubectl:latest -n $NS get pods -l app=backend-test -o wide"
            '''
          }
        }
      }
    }

  } // stages

  post {
    always {
      echo "Pipeline finalizado."
      deleteDir()
    }
  }
}
