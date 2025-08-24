FROM node:22-alpine

# Instalar Docker CLI y utilidades
RUN apk add --no-cache docker-cli curl bash

# Instalar kubectl si realmente lo necesitas dentro de la imagen
RUN curl -fsSLO "https://dl.k8s.io/release/$(curl -fsSL https://dl.k8s.io/release/stable.txt)/bin/linux/amd64/kubectl" && \
    install -o root -g root -m 0755 kubectl /usr/local/bin/kubectl && \
    rm kubectl

WORKDIR /usr/src/app

COPY package*.json ./
RUN npm install

COPY . .

# Asegurar que dist/main.js se genere
RUN npm run build

EXPOSE 3000

CMD ["node", "dist/main.js"]
