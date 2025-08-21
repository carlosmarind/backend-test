# Imagen base de Jenkins LTS
FROM jenkins/jenkins:lts

# Evitar el wizard de instalación inicial
ENV JAVA_OPTS=-Djenkins.install.runSetupWizard=false

# Usuario y contraseña inicial (opcional, puedes cambiar luego en UI)
ENV JENKINS_USER=gdiaz
ENV JENKINS_PASS=admin123.

# Copiar plugins a instalar
COPY plugins.txt /usr/share/jenkins/plugins.txt
RUN jenkins-plugin-cli -f /usr/share/jenkins/plugins.txt

# Cambiar a root para instalar dependencias
USER root

# Instalar dependencias necesarias y Docker CLI + Compose
RUN apt-get update && apt-get install -y \
    ca-certificates curl gnupg lsb-release sudo bash \
 && install -m 0755 -d /etc/apt/keyrings \
 && curl -fsSL https://download.docker.com/linux/debian/gpg | gpg --dearmor -o /etc/apt/keyrings/docker-archive-keyring.gpg \
 && echo "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker-archive-keyring.gpg] https://download.docker.com/linux/debian $(lsb_release -cs) stable" \
    | tee /etc/apt/sources.list.d/docker.list > /dev/null \
 && apt-get update \
 && apt-get install -y docker-ce-cli docker-compose \
 && apt-get clean

# Crear grupo docker y añadir usuario jenkins
RUN groupadd -f docker \
    && usermod -aG docker jenkins

# Volver a usuario jenkins
USER jenkins

# Directorio de trabajo
WORKDIR /var/jenkins_home

# Exponer puertos de Jenkins
EXPOSE 8080 50000
