
# Usamos una imagen oficial de Node.js como base
FROM node:18

# Establecer el directorio de trabajo en el contenedor
WORKDIR /usr/src/app

# Copiar el package.json y package-lock.json al contenedor
COPY package*.json ./

# Instalar las dependencias dentro del contenedor
RUN npm install

# Copiar el código de tu aplicación al contenedor
COPY . .

# Exponer el puerto que se usará (si es necesario)
EXPOSE 3000

# Definir el comando predeterminado para ejecutar el contenedor
CMD ["npm", "test"]