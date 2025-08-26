FROM node:20-alpine AS build-node
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build || echo "skip build"

FROM node:20-alpine AS runtime-node
WORKDIR /app
COPY --from=build-node /app ./
ENV NODE_ENV=production
EXPOSE 3000
CMD ["npm","start"]

