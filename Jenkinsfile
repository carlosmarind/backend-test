pipeline {
  agent any

  environment {
    IMAGE_TOOLING      = 'edgardobenavidesl/node-java-sonar-docker:latest'
    SONARQUBE_SERVER   = 'SonarQube'                     // nombre en Jenkins Global Config
    SONAR_PROJECT_KEY  = 'backend-test'
    NEXUS_REGISTRY     = 'localhost:8082'                // ⚠️ desde K8s "localhost" NO sirve; usa IP/DNS accesible por los nodos
    IMAGE_NAME         = "${NEXUS_REGISTRY}/backend-test"
    BUILD_TAG          = "${env.BUILD_NUMBER}"
    MAX_IMAGES_TO_KEEP = '5'
    K8S_NAMESPACE      = 'default'
    DEPLOYMENT_FILE    = 'kubernetes.yaml'               // ajusta si está en k8s/kubernetes.yaml
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
              # Normaliza rutas de lcov para Sonar (tolerante a ausencia del archivo)
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
            // Recomendado: 'nexus-credentials' como "Username with password"
            withCredentials([usernamePassword(
              credentialsId: 'nexus-credentials',
              usernameVariable: 'NEXUS_USER',
              passwordVariable: 'NEXUS_PASS'
            )]) {
              sh '''
                set -eux
                echo "$NEXUS_PASS" | docker login -u "$NEXUS_USER" --password-stdin http://${NEXUS_REGISTRY}

                docker build -t ${IMAGE_NAME}:${BUILD_NUMBER} -t ${IMAGE_NAME}:latest .
                docker push ${IMAGE_NAME}:${BUILD_NUMBER}
                docker push ${IMAGE_NAME}:latest

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
          withCredentials([file(credentialsId: 'kubeconfig', variable: 'KUBECONFIG_FILE')]) {
            sh '''
              set -eux
              NS="${K8S_NAMESPACE}"
              KCONF="$KUBECONFIG_FILE"
              DF="${DEPLOYMENT_FILE:-kubernetes.yaml}"

              [ -f "$DF" ] || { echo "No se encontró $DF"; ls -la; exit 2; }

              # Detecta si KCONF es archivo o directorio
              if [ -f "$KCONF" ]; then
                echo "Kubeconfig es un archivo: $KCONF"
                KENV="-e KUBECONFIG=/kubeconfig"
                KMOUNT="-v $KCONF:/kubeconfig:ro"

                # Apply (por stdin, evita montar workspace)
                cat "$DF" | docker run --rm -i --network devnet \
                  $KENV $KMOUNT bitnami/kubectl:latest -n "$NS" apply -f -

                # set image
                docker run --rm --network devnet $KENV $KMOUNT \
                  bitnami/kubectl:latest -n "$NS" set image deployment/backend-test backend-test=${IMAGE_NAME}:latest

                # rollout
                docker run --rm --network devnet $KENV $KMOUNT \
                  bitnami/kubectl:latest -n "$NS" rollout status deployment/backend-test --timeout=180s

                # verificación
                DR=$(docker run --rm --network devnet $KENV $KMOUNT bitnami/kubectl:latest -n "$NS" get deploy backend-test -o jsonpath='{.spec.replicas}')
                AR=$(docker run --rm --network devnet $KENV $KMOUNT bitnami/kubectl:latest -n "$NS" get deploy backend-test -o jsonpath='{.status.availableReplicas}')
                echo "Desired replicas: ${DR:-?} | Available replicas: ${AR:-0}"
                test -n "$DR" && [ "${AR:-0}" = "$DR" ]

                docker run --rm --network devnet $KENV $KMOUNT \
                  bitnami/kubectl:latest -n "$NS" get pods -l app=backend-test -o wide

              elif [ -d "$KCONF" ]; then
                echo "Kubeconfig es un directorio: $KCONF"
                # Usa 'config' si existe; si no, el primer .yaml/.yml
                if [ -f "$KCONF/config" ]; then
                  KFILE="config"
                else
                  KFILE="$(ls -1 "$KCONF" | grep -E '(^config$|\\.ya?ml$)' | head -n1 || true)"
                  [ -n "$KFILE" ] || { echo "No se encontró archivo kubeconfig dentro de $KCONF"; exit 2; }
                fi
                echo "Usando kubeconfig: $KCONF/$KFILE"
                KENV="-e KUBECONFIG=/kube/$KFILE"
                KMOUNT="-v $KCONF:/kube:ro"

                cat "$DF" | docker run --rm -i --network devnet \
                  $KENV $KMOUNT bitnami/kubectl:latest -n "$NS" apply -f -

                docker run --rm --network devnet $KENV $KMOUNT \
                  bitnami/kubectl:latest -n "$NS" set image deployment/backend-test backend-test=${IMAGE_NAME}:latest

                docker run --rm --network devnet $KENV $KMOUNT \
                  bitnami/kubectl:latest -n "$NS" rollout status deployment/backend-test --timeout=180s

                DR=$(docker run --rm --network devnet $KENV $KMOUNT bitnami/kubectl:latest -n "$NS" get deploy backend-test -o jsonpath='{.spec.replicas}')
                AR=$(docker run --rm --network devnet $KENV $KMOUNT bitnami/kubectl:latest -n "$NS" get deploy backend-test -o jsonpath='{.status.availableReplicas}')
                echo "Desired replicas: ${DR:-?} | Available replicas: ${AR:-0}"
                test -n "$DR" && [ "${AR:-0}" = "$DR" ]

                docker run --rm --network devnet $KENV $KMOUNT \
                  bitnami/kubectl:latest -n "$NS" get pods -l app=backend-test -o wide
              else
                echo "Ruta KUBECONFIG inválida: $KCONF"
                exit 2
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
