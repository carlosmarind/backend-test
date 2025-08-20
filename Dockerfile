# Imagen base con Node.js 22
FROM node:22-alpine
 
# Instalar Docker CLI (útil si necesitas usar docker dentro del contenedor)
RUN apk add --no-cache docker-cli bash
 
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