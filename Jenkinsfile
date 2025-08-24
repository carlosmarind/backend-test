pipeline {
  agent any

  environment {
    IMAGE_TOOLING      = 'edgardobenavidesl/node-java-sonar-docker:latest'
    SONAR_PROJECT_KEY  = 'backend-test'
    NEXUS_REGISTRY     = 'nexus:8083'                 // AJUSTA si tu puerto/host es otro
    IMAGE_NAME         = "${NEXUS_REGISTRY}/backend-test"
    BUILD_TAG          = "${env.BUILD_NUMBER}"        // o tu timestamp si prefieres
    MAX_IMAGES_TO_KEEP = '5'
  }

  stages {
    stage('Checkout SCM') {
      steps { checkout scm }
    }

    stage('Install dependencies') {
      steps {
        script {
          docker.image(env.IMAGE_TOOLING).inside('--network devnet') {
            sh 'npm ci'
          }
        }
      }
    }

    stage('Run tests & coverage') {
      steps {
        script {
          docker.image(env.IMAGE_TOOLING).inside('--network devnet') {
            sh '''
              npm run test:cov
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
          docker.image(env.IMAGE_TOOLING).inside('--network devnet') {
            sh 'npm run build'
          }
        }
      }
    }

    stage('SonarQube Analysis') {
      steps {
        script {
          docker.image(env.IMAGE_TOOLING).inside('--network devnet') {
            withSonarQubeEnv('SonarQube') {
              withCredentials([string(credentialsId: 'sonarqube-cred', variable: 'SONAR_TOKEN')]) {
                sh '''
                  sonar-scanner \
                    -Dsonar.projectKey=''' + env.SONAR_PROJECT_KEY + ''' \
                    -Dsonar.sources=src \
                    -Dsonar.tests=src \
                    -Dsonar.test.inclusions=**/*.spec.ts \
                    -Dsonar.javascript.lcov.reportPaths=coverage/lcov.info \
                    -Dsonar.exclusions=node_modules/**,dist/** \
                    -Dsonar.coverage.exclusions=**/*.spec.ts \
                    -Dsonar.host.url=http://sonarqube:9000/ \
                    -Dsonar.login=$SONAR_TOKEN
                '''
              }
            }
          }
        }
      }
    }

    // stage('Quality Gate (optional)') {
    //   when { expression { currentBuild.resultIsBetterOrEqualTo('SUCCESS') || currentBuild.currentResult == null } }
    //   steps {
    //     echo 'Quality Gate: habilítalo con waitForQualityGate() si usas webhooks.'
    //   }
    // }

    stage('Quality Gate') {
      steps {
        timeout(time: 10, unit: 'MINUTES') {
          waitForQualityGate()   // falla el build si no pasa el 90%
        }
      }
    }

    stage('Docker Build & Push (Nexus)') {
      steps {
        script {
          docker.image(env.IMAGE_TOOLING).inside('--network devnet') {
            withCredentials([usernamePassword(
              credentialsId: 'nexus-docker-cred',   // crea esta credencial en Jenkins
              usernameVariable: 'NEXUS_USER',
              passwordVariable: 'NEXUS_PASS'
            )]) {
              sh '''
                set -e
                echo "$NEXUS_PASS" | docker login -u "$NEXUS_USER" --password-stdin ''' + "${env.NEXUS_REGISTRY}" + '''
                docker build -t ''' + "${env.IMAGE_NAME}:latest" + ''' -t ''' + "${env.IMAGE_NAME}:${BUILD_TAG}" + ''' .
                docker push ''' + "${env.IMAGE_NAME}:${BUILD_TAG}" + '''
                docker push ''' + "${env.IMAGE_NAME}:latest" + '''
                docker image prune -f
              '''
            }
          }
        }
      }
    }


  }

  post {
    always { deleteDir()  }
  }
}
