# Entwicklungsfreundliches Node-Image
FROM node:20-alpine AS base
WORKDIR /app

COPY package*.json ./
RUN npm install --legacy-peer-deps

COPY . .

EXPOSE 8080
CMD ["npm", "run", "dev"]
