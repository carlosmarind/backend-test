pipeline {
  agent any
  tools { nodejs 'nodejs-20' }
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
        powershell '''
          $ErrorActionPreference = "Stop"
          npm ci
          npx jest --config=jest.config.js --coverage --runInBand
          if (!(Test-Path coverage/lcov.info)) { Write-Error "Falta coverage/lcov.info"; exit 1 }
          Write-Host "Primeras rutas del LCOV:"
          Select-String -Path coverage/lcov.info -Pattern "^SF:" | Select-Object -First 5
        '''
      }
    }

    stage('Sonar') {
      steps {
        withSonarQubeEnv('sonarqube') {
          powershell '''
            & "$env:SCANNER_HOME\\bin\\sonar-scanner.bat" `
              -D"sonar.projectBaseDir=$env:WORKSPACE" `
              -D"sonar.projectKey=backend-test" `
              -D"sonar.projectName=backend-test" `
              -D"sonar.projectVersion=$env:BUILD_NUMBER" `
              -D"sonar.sourceEncoding=UTF-8" `
              -D"sonar.sources=src" `
              -D"sonar.tests=src" `
              -D"sonar.test.inclusions=**/*.spec.ts,**/*.test.ts" `
              -D"sonar.javascript.lcov.reportPaths=coverage/lcov.info" `
              -D"sonar.typescript.lcov.reportPaths=coverage/lcov.info"
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
          powershell '''
            $ErrorActionPreference = "Stop"
            docker build -t $env:IMAGE_BUILD -t $env:IMAGE_LATEST .
            $env:P | docker login $env:REGISTRY -u $env:U --password-stdin
            docker push $env:IMAGE_BUILD
            docker push $env:IMAGE_LATEST
            docker logout $env:REGISTRY
          '''
        }
      }
    }

    stage('K8s deploy') {
      steps {
        withCredentials([file(credentialsId: 'kubeconfig', variable: 'KCFG')]) {
          powershell '''
            $ErrorActionPreference = "Stop"
            $env:KUBECONFIG=$env:KCFG
            kubectl apply -f kubernetes.yaml
            kubectl rollout status deployment/backend-test --timeout=180s
          '''
        }
      }
    }
  }
}
