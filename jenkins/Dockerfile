# Base Jenkins LTS
FROM jenkins/jenkins:lts

# Variables de entorno
ENV JENKINS_USER=gdiaz
ENV JENKINS_PASS=admin123.
ENV JAVA_OPTS=-Djenkins.install.runSetupWizard=false

# Instalar Docker dentro del contenedor
USER root

RUN apt-get update && apt-get install -y \
    ca-certificates curl gnupg lsb-release sudo \
  && mkdir -m 0755 -p /etc/apt/keyrings \
  && curl -fsSL https://download.docker.com/linux/debian/gpg -o /etc/apt/keyrings/docker.asc \
  && chmod a+r /etc/apt/keyrings/docker.asc \
  && echo "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.asc] https://download.docker.com/linux/debian $(. /etc/os-release && echo \"$VERSION_CODENAME\") stable" \
     | tee /etc/apt/sources.list.d/docker.list > /dev/null \
  && apt-get update \
  && apt-get install -y docker-ce docker-ce-cli containerd.io docker-compose-plugin \
  && apt-get clean

# Permitir que el usuario jenkins use Docker
RUN groupadd -g 999 docker || true \
  && usermod -aG docker jenkins

# Cambiar a jenkins
USER jenkins
