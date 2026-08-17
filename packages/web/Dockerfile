# Multi-stage Dockerfile for React/Vite Web Application
FROM node:20-alpine AS builder

WORKDIR /app

# Copy root workspace and package manifests
COPY package.json ./
COPY packages/shared/package.json ./packages/shared/
COPY packages/web/package.json ./packages/web/
COPY tsconfig.base.json ./

# Install monorepo dependencies
RUN npm install

# Copy source code for shared library and web application
COPY packages/shared ./packages/shared
COPY packages/web ./packages/web

# Build shared package and web app
RUN npm run build:shared
RUN npm run build:web

# Production runtime stage with Nginx
FROM nginx:alpine AS runner

# Copy built static assets to nginx serve directory
COPY --from=builder /app/packages/web/dist /usr/share/nginx/html

# Copy custom nginx configuration with SPA routing and API reverse proxy
COPY packages/web/nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
