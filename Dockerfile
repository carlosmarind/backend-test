# Imagen base de Node
FROM node:18-alpine AS build

# Directorio de trabajo dentro del contenedor
WORKDIR /usr/src/app

# Copiar package.json y package-lock.json primero
COPY package*.json ./

# Instalar solo dependencias de producción
RUN npm install 


# Copiar la carpeta compilada "dist" y otros archivos necesarios
COPY dist ./dist

# Exponer el puerto de la aplicación
EXPOSE 4000

RUN npm install --only=production



CMD ["node", "dist/main.js"]