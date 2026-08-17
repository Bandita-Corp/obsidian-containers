# Multi-stage Dockerfile for Nest.js Git-backed Sync Server
FROM node:20-alpine AS builder

# Install git required for building/typechecking if needed
RUN apk add --no-cache git

WORKDIR /app

# Copy root workspace and package manifests
COPY package.json ./
COPY packages/shared/package.json ./packages/shared/
COPY packages/server/package.json ./packages/server/
COPY packages/obsidian-plugin/package.json ./packages/obsidian-plugin/
COPY packages/web/package.json ./packages/web/
COPY tsconfig.base.json ./

# Install monorepo dependencies
RUN npm install

# Copy source codes
COPY packages/shared ./packages/shared
COPY packages/server ./packages/server
COPY packages/web ./packages/web

# Build shared package, web app, and server package
RUN npm run build:shared
RUN npm run build:web
RUN npm run build:server

# Production runtime stage
FROM node:20-alpine AS runner

# Install git in runtime container (critical for simple-git operations)
RUN apk add --no-cache git openssh-client

WORKDIR /app

ENV NODE_ENV=production
ENV PORT=3000
ENV VAULT_STORAGE_PATH=/app/data/vault
ENV GIT_USER_NAME="Obsidian Sync Engine"
ENV GIT_USER_EMAIL="sync@obsidian.local"

# Copy root and package manifests for production install
COPY package.json ./
COPY packages/shared/package.json ./packages/shared/
COPY packages/server/package.json ./packages/server/
COPY packages/obsidian-plugin/package.json ./packages/obsidian-plugin/
COPY packages/web/package.json ./packages/web/

RUN npm install --omit=dev

# Copy built artifacts from builder stage
COPY --from=builder /app/packages/shared/dist ./packages/shared/dist
COPY --from=builder /app/packages/server/dist ./packages/server/dist
COPY --from=builder /app/packages/web/dist ./packages/web/dist

# Create storage directory for Git repository
RUN mkdir -p /app/data/vault

EXPOSE 3000

CMD ["node", "packages/server/dist/main.js"]
