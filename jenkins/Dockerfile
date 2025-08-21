FROM jenkins/jenkins:lts

# Evitar wizard de instalación
ENV JAVA_OPTS=-Djenkins.install.runSetupWizard=false

# Instalar dependencias y Docker CLI + Compose
USER root
RUN apt-get update && apt-get install -y \
    ca-certificates curl gnupg lsb-release sudo bash \
 && install -m 0755 -d /etc/apt/keyrings \
 && curl -fsSL https://download.docker.com/linux/debian/gpg | gpg --dearmor -o /etc/apt/keyrings/docker-archive-keyring.gpg \
 && echo "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker-archive-keyring.gpg] https://download.docker.com/linux/debian $(lsb_release -cs) stable" \
    | tee /etc/apt/sources.list.d/docker.list > /dev/null \
 && apt-get update \
 && apt-get install -y docker-ce-cli docker-compose \
 && apt-get clean

# Copiar plugins de Jenkins
COPY plugins.txt /usr/share/jenkins/plugins.txt
RUN jenkins-plugin-cli -f /usr/share/jenkins/plugins.txt

# Directorio de trabajo
WORKDIR /var/jenkins_home
EXPOSE 8080 50000
