# Dockerfile para node con Docker CLI
FROM node:22-alpine

# Instalar Docker CLI
RUN apk add --no-cache docker-cli

# Establecer directorio de trabajo
WORKDIR /usr/src/app

# Copiar package.json para instalar dependencias
COPY package*.json ./

RUN npm install

# Copiar el resto de archivos
COPY . .

# (Opcional) Compilar si es NestJS
RUN npm run build

# Exponer el puerto de la app
EXPOSE 3000

# Comando por defecto para iniciar la app
CMD ["node", "dist/main.js"]
