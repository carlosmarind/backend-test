pipeline {
  agent any

  environment {
    IMAGE_TOOLING     = 'edgardobenavidesl/node-java-sonar-docker:latest'
    SONAR_PROJECT_KEY = 'backend-test'
    IMAGE_NAME        = 'edgardobenavidesl/backend-test'
    BUILD_TAG         = "${new Date().format('yyyyMMddHHmmss')}"
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
              withCredentials([string(credentialsId: 'sonar-token', variable: 'SONAR_TOKEN')]) {
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

    stage('Quality Gate (optional)') {
      when { expression { currentBuild.resultIsBetterOrEqualTo('SUCCESS') || currentBuild.currentResult == null } }
      steps {
        echo 'Quality Gate: habilítalo con waitForQualityGate() si usas webhooks.'
      }
    }

    stage('Docker Build & Push') {
      steps {
        script {
          docker.image(env.IMAGE_TOOLING).inside('--network devnet') {
            withCredentials([usernamePassword(credentialsId: 'dockerhub-credentials', usernameVariable: 'DOCKER_USER', passwordVariable: 'DOCKER_PASS')]) {
              sh '''
                set -e
                echo "$DOCKER_PASS" | docker login -u "$DOCKER_USER" --password-stdin
                IMAGE_TAG_LATEST='''' + "${env.IMAGE_NAME}:latest" + ''''
                IMAGE_TAG_BUILD='''' + "${env.IMAGE_NAME}:${env.BUILD_TAG}" + ''''
                docker build -t "$IMAGE_TAG_BUILD" -t "$IMAGE_TAG_LATEST" .
                docker push "$IMAGE_TAG_BUILD"
                docker push "$IMAGE_TAG_LATEST"
                docker image prune -f
              '''
            }
          }
        }
      }
    }
  }

  post {
    always { cleanWs() }
  }
}
