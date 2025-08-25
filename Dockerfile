# Etapa 1: build
FROM node:22-alpine AS build

WORKDIR /usr/src/app

# Copiar package.json e instalar dependencias
COPY package*.json ./
RUN npm install

# Copiar todo el código y construir
COPY . .
RUN npm run build

# Etapa 2: runtime
FROM node:22-alpine

WORKDIR /usr/src/app

# Copiar sólo lo necesario de la build
COPY --from=build /usr/src/app/package*.json ./
COPY --from=build /usr/src/app/dist ./dist
COPY --from=build /usr/src/app/node_modules ./node_modules

EXPOSE 4000
CMD ["node", "dist/main.js"]
