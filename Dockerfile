# Etapa 1: Construcción (contru)
FROM node:22 AS contru 
# Usa la imagen oficial de Node.js versión 22 como base.
# Le ponemos un alias "contru" para referirnos a ella después (etapa de build).

WORKDIR /usr/app 
# Define el directorio de trabajo dentro del contenedor en /usr/app.
# Todo lo que copies/ejecutes después se hará en esa ruta.

COPY . .
# Copia todo el contenido del proyecto desde el host (PC) al contenedor (/usr/app).

RUN npm install
# Instala todas las dependencias del proyecto (incluyendo devDependencies).
# Esto es necesario para poder ejecutar tests y compilar.

RUN npm run test
# Ejecuta los tests definidos en package.json.
# Si falla, el build se corta aquí y no sigue adelante (lo cual es bueno, rompe temprano).

RUN npm run build
# Compila el proyecto (generalmente crea la carpeta dist con los archivos listos para producción).

# Etapa 2: Producción
FROM node:22-alpine AS produccion
# Usa una imagen de Node.js 22 pero en su versión "alpine" (más ligera, ideal para producción).
# Le ponemos un alias "produccion".

WORKDIR /usr/app
# Definimos nuevamente el directorio de trabajo para esta nueva etapa.

COPY --from=contru /usr/app/dist ./dist
# Copiamos SOLO los archivos ya compilados (dist) desde la etapa "contru" al contenedor de producción.
# Así no cargamos código fuente innecesario ni dependencias de desarrollo.

COPY --from=contru /usr/app/package*.json .
# Copiamos los archivos package.json y package-lock.json desde la etapa "contru".
# Necesarios para instalar las dependencias de producción.

RUN npm install --only=production
# Instala SOLO las dependencias necesarias para producción (sin devDependencies).
# Esto hace que la imagen final sea más liviana y segura.

EXPOSE 4000
# Expone el puerto 4000 para que el contenedor pueda recibir tráfico externo.

CMD ["node", "dist/main.js"]
# Comando que se ejecuta por defecto cuando el contenedor arranca.
# Aquí inicia la aplicación Node desde la carpeta dist (ya compilada).