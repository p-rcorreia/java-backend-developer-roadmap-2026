FROM node:22-alpine AS build

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build

FROM node:22-alpine

WORKDIR /app

ENV PORT=8080
ENV DATA_DIR=/data

COPY server.mjs ./
COPY --from=build /app/dist ./dist
RUN mkdir -p /data

EXPOSE 8080

CMD ["node", "server.mjs"]
