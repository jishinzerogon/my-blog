# ステージ1: Reactアプリをビルド
FROM node:22-alpine AS build

WORKDIR /app
COPY package.json package-lock.json* ./
RUN npm install
COPY index.html vite.config.js ./
COPY src/ src/
RUN npm run build

# ステージ2: ビルド成果物をnginxで配信
FROM nginx:alpine

COPY --from=build /app/dist/ /usr/share/nginx/html/
COPY nginx.conf /etc/nginx/conf.d/default.conf
