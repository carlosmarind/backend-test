# Imagen base con Node.js 22
FROM node:22-alpine

# Instalar Java 17, Docker CLI, bash, curl, unzip, git
RUN apk add --no-cache openjdk17 docker-cli bash curl unzip git

# Establecer variable de entorno para Java
ENV JAVA_HOME=/usr/lib/jvm/java-17-openjdk
ENV PATH="$JAVA_HOME/bin:$PATH"

# Descargar e instalar SonarScanner
ENV SONAR_SCANNER_VERSION=5.0.1.3006
ENV SONAR_SCANNER_HOME=/opt/sonar-scanner
RUN curl -sSL https://binaries.sonarsource.com/Distribution/sonar-scanner-cli/sonar-scanner-cli-${SONAR_SCANNER_VERSION}-linux.zip \
    -o /tmp/sonar-scanner.zip \
    && unzip /tmp/sonar-scanner.zip -d /opt \
    && mv /opt/sonar-scanner-${SONAR_SCANNER_VERSION}-linux $SONAR_SCANNER_HOME \
    && rm /tmp/sonar-scanner.zip

# Agregar SonarScanner al PATH
ENV PATH="${SONAR_SCANNER_HOME}/bin:${PATH}"

# Establecer directorio de trabajo
WORKDIR /usr/src/app

# Copiar archivos de dependencias
COPY package*.json ./

# Instalar dependencias de la app
RUN npm install --production

# Copiar el resto del código fuente
COPY . .

# (Opcional) Build si usas frameworks como NestJS
RUN npm run build || echo "No build step, skipping"

# Exponer el puerto que usa la app
EXPOSE 3000

# Comando de inicio
CMD ["node", "dist/main.js"]
