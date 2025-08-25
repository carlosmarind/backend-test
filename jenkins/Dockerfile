FROM jenkins/jenkins:lts

ENV JENKINS_USER=gdiaz
ENV JENKINS_PASS=admin123.
ENV JAVA_OPTS=-Djenkins.install.runSetupWizard=false

# Copiar plugins
COPY plugins.txt /usr/share/jenkins/plugins.txt
RUN jenkins-plugin-cli -f /usr/share/jenkins/plugins.txt

USER root

# Instalar Docker CLI y Docker Compose
RUN apt-get update && apt-get install -y \
    ca-certificates curl gnupg lsb-release \
  && install -m 0755 -d /etc/apt/keyrings \
  && curl -fsSL https://download.docker.com/linux/debian/gpg -o /etc/apt/keyrings/docker.asc \
  && chmod a+r /etc/apt/keyrings/docker.asc \
  && echo "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.asc] \
     https://download.docker.com/linux/debian $(lsb_release -cs) stable" \
     | tee /etc/apt/sources.list.d/docker.list > /dev/null \
  && apt-get update \
  && apt-get install -y docker-ce-cli docker-compose-plugin \
  && apt-get clean

# Crear grupo docker con el mismo GID que en el host
ARG DOCKER_GID=998
RUN groupadd -for -g ${DOCKER_GID} docker \
  && usermod -aG docker jenkins

USER jenkins
