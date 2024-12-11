FROM node:23 AS build

WORKDIR /usr/app

COPY package.json ./
RUN npm i

COPY . . 
RUN npm run build

FROM node:23-alpine

WORKDIR /usr/app

COPY --from=build /usr/app/node_modules ./node_modules
COPY --from=build /usr/app/dist ./dist
COPY --from=build /usr/app/package*.json ./

EXPOSE 3000


CMD ["node","dist/index.js"]