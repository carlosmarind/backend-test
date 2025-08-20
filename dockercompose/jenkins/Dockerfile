# Imagen base Jenkins LTS
FROM jenkins/jenkins:lts

# Variables de entorno
ENV JENKINS_USER=jenkins
ENV JENKINS_PASS=4a7197cf94ca4492b1d4cec0ff2cada9
ENV JAVA_OPTS=-Djenkins.install.runSetupWizard=false

# Copiar plugins a instalar
COPY plugins.txt /usr/share/jenkins/plugins.txt
RUN jenkins-plugin-cli -f /usr/share/jenkins/plugins.txt

# Cambiar a root para instalar dependencias
USER root

# Instalar dependencias básicas y Docker CLI
RUN apt-get update && apt-get install -y \
    ca-certificates curl gnupg lsb-release sudo bash \
 && install -m 0755 -d /etc/apt/keyrings \
 && curl -fsSL https://download.docker.com/linux/debian/gpg | gpg --dearmor -o /etc/apt/keyrings/docker-archive-keyring.gpg \
 && echo "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker-archive-keyring.gpg] https://download.docker.com/linux/debian $(lsb_release -cs) stable" \
    | tee /etc/apt/sources.list.d/docker.list > /dev/null \
 && apt-get update \
 && apt-get install -y docker-ce-cli docker-compose \
 && apt-get clean

# Permitir que Jenkins use Docker
RUN usermod -aG docker jenkins

# Cambiar de nuevo a usuario jenkins
USER jenkins

# Directorio de trabajo
WORKDIR /var/jenkins_home
