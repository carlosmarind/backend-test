pipeline {
  agent any
  stages {
    stage('Sanity') {
      steps {
        echo "Hola Mauricio! Jenkins ve este Jenkinsfile 👍"
        sh 'node -v || true'
      }
    }
  }
}
'@ | Out-File -Encoding utf8 Jenkinsfile

# 2) Sube al repo
git add Jenkinsfile
git commit -m "Jenkins: Jenkinsfile mínimo de sanity"
git push origin main