# 1) Build the static site
FROM node:20-alpine AS build
WORKDIR /app

COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

# 2) Serve with Nginx
FROM nginx:alpine

COPY --from=build /app/dist /usr/share/nginx/html

# Copy config template (from Vite public folder)
COPY public/config.template.js /usr/share/nginx/html/config.template.js

# SPA fallback + serve config.js
RUN printf '%s\n' \
'server {' \
'  listen 8080;' \
'  server_name _;' \
'  root /usr/share/nginx/html;' \
'  index index.html;' \
'' \
'  location = /config.js {' \
'    add_header Cache-Control "no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0";' \
'  }' \
'' \
'  location / {' \
'    try_files $uri $uri/ /index.html;' \
'  }' \
'}' \
> /etc/nginx/conf.d/default.conf

EXPOSE 8080

# Generate config.js from env vars at startup, then run nginx
CMD ["sh", "-c", "envsubst < /usr/share/nginx/html/config.template.js > /usr/share/nginx/html/config.js && nginx -g 'daemon off;'"]
