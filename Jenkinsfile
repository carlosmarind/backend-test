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

    
  stage('Docker Build & Push (Nexus)') {
  steps {
    script {
      // *** Fuerza que el contenedor "inside" conozca host.docker.internal ***
      def insideArgs = '--add-host=host.docker.internal:host-gateway ' +
                       '-v /var/run/docker.sock:/var/run/docker.sock ' +
                       '--network devnet'

      docker.image(env.IMAGE_TOOLING).inside(insideArgs) {
        withCredentials([usernamePassword(credentialsId: 'nexus-credentials',
          usernameVariable: 'NEXUS_USER', passwordVariable: 'NEXUS_PASS')]) {
          sh '''
            set -eux

            REG="${NEXUS_REGISTRY}"   # ej: host.docker.internal:8082

            echo "==> Preflight al registry ${REG}"
            # 1) Chequeo TCP rápido (si falla, no sirve reintentar login)
            (exec 3<>/dev/tcp/host.docker.internal/8082) || {
              echo "ERROR: No hay conectividad TCP a ${REG} desde esta red (devnet)."
              echo "Sugerencia: verifica que Nexus esté corriendo y que este contenedor tenga ruta al host."
              exit 2
            }
            exec 3>&-

            # 2) Chequeo HTTP al endpoint /v2/ (propio de Docker Registry en Nexus)
            docker run --rm --network devnet --add-host=host.docker.internal:host-gateway \
              curlimages/curl:8.8.0 -sS -m 8 -I http://host.docker.internal:8082/v2/ || {
                echo "ADVERTENCIA: /v2/ no respondió como se esperaba; intentaré login de todos modos."
              }

            # 3) Login con reintentos (no usar esquema http://, deja que el daemon use HTTP por ser 'insecure-registries')
            for i in 1 2 3; do
              echo "$NEXUS_PASS" | docker login -u "$NEXUS_USER" --password-stdin "${REG}" && break || {
                echo "Login falló (${i}/3). Esperando y reintentando..."
                sleep 3
              }
              if [ "$i" = "3" ]; then
                echo "ERROR: docker login a ${REG} falló 3 veces."
                exit 2
              fi
            done

            # 4) Build & tag
            docker build -t ${IMAGE_NAME}:${BUILD_NUMBER} -t ${IMAGE_NAME}:latest .

            # 5) Push con reintentos y backoff corto (maneja EOF/timeout intermitentes)
            for i in 1 2 3; do
              docker push ${IMAGE_NAME}:${BUILD_NUMBER} && break || {
                echo "Push ${BUILD_NUMBER} falló (${i}/3). Reintentando..."
                sleep 4
              }
              [ "$i" = "3" ] && { echo "ERROR: push ${BUILD_NUMBER} falló 3 veces"; exit 2; }
            done

            for i in 1 2 3; do
              docker push ${IMAGE_NAME}:latest && break || {
                echo "Push latest falló (${i}/3). Reintentando..."
                sleep 4
              }
              [ "$i" = "3" ] && { echo "ERROR: push latest falló 3 veces"; exit 2; }
            done

            docker image prune -f || true
          '''
        }
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
