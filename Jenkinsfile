pipeline {
  agent any
  options { timestamps(); skipDefaultCheckout(true) }
  environment {
    REGISTRY      = "host.docker.internal:8083"
    REPOSITORY    = "backend-test"
    IMAGE_LATEST  = "${env.REGISTRY}/${env.REPOSITORY}:latest"
    IMAGE_BUILD   = "${env.REGISTRY}/${env.REPOSITORY}:${env.BUILD_NUMBER}"
    SCANNER_HOME  = tool 'SonarScanner'
  }

  stages {
    stage('Checkout') {
      steps { checkout scm }
    }

    stage('Install & Test') {
      steps {
        powershell "npm ci; npm test -- --coverage"
      }
    }

    stage('Sonar') {
      steps {
        withSonarQubeEnv('sonarqube') {
          powershell '''
            & "$env:SCANNER_HOME\\bin\\sonar-scanner.bat" `
              -Dsonar.projectKey=backend-test `
              -Dsonar.projectName=backend-test `
              -Dsonar.sourceEncoding=UTF-8 `
              -Dsonar.sources=src `
              -Dsonar.tests=src `
              -Dsonar.test.inclusions="**/*.spec.ts,**/*.test.ts" `
              -Dsonar.javascript.lcov.reportPaths=coverage/lcov.info `
              -Dsonar.typescript.lcov.reportPaths=coverage/lcov.info
          '''
        }
      }
    }


    stage('Quality Gate') {
      steps {
        timeout(time: 10, unit: 'MINUTES') {
          waitForQualityGate abortPipeline: true
        }
      }
    }

    stage('Docker build & push') {
      steps {
        withCredentials([usernamePassword(credentialsId: 'nexus-docker', usernameVariable: 'U', passwordVariable: 'P')]) {
          powershell """
            docker build -t $env:IMAGE_BUILD -t $env:IMAGE_LATEST .
            \$env:P | docker login $env:REGISTRY -u $env:U --password-stdin
            docker push $env:IMAGE_BUILD
            docker push $env:IMAGE_LATEST
            docker logout $env:REGISTRY
          """
        }
      }
    }

    stage('K8s deploy') {
      steps {
        withCredentials([file(credentialsId: 'kubeconfig', variable: 'KCFG')]) {
          powershell '''
            $env:KUBECONFIG=$env:KCFG
            kubectl apply -f kubernetes.yaml
            kubectl rollout status deployment/backend-test --timeout=180s
          '''
        }
      }
    }
  }
}
