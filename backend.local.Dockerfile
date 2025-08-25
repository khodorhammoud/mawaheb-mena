# Build stage
FROM node:20-alpine AS builder

# Install build dependencies
RUN apk add --no-cache python3 make g++ git

# Set working directory
WORKDIR /app

# Copy the entire monorepo structure for the build
COPY . .

# Install all dependencies
RUN npm install -g pnpm
RUN pnpm install

# Build shared packages first, then the backend
ENV NODE_ENV=production
RUN cd packages/db && pnpm run build
RUN cd apps/backend && pnpm run build

# Development stage - for fast iterations
FROM node:20-alpine AS dev

# Install build dependencies
RUN apk add --no-cache python3 make g++ git

# Install pnpm and turbo
RUN npm install -g pnpm turbo

WORKDIR /app

# Copy package files for dependency installation
COPY package.json pnpm-workspace.yaml pnpm-lock.yaml* ./
COPY turbo.json ./

# Copy all package.json files
COPY apps/backend/package.json ./apps/backend/
COPY packages/db/package.json ./packages/db/
COPY packages/ui/package.json ./packages/ui/
COPY packages/eslint-config/package.json ./packages/eslint-config/
COPY packages/typescript-config/package.json ./packages/typescript-config/

# Install dependencies
RUN pnpm install

# Start command (source code will be mounted)
CMD ["turbo", "dev", "--filter=backend"]

# Production stage - much smaller
FROM node:20-alpine AS runner

# Set working directory
WORKDIR /app

# Create minimal directory structure
RUN mkdir -p apps/backend/dist packages/db/dist

# Copy package files
COPY package.json pnpm-workspace.yaml pnpm-lock.yaml* ./
COPY apps/backend/package.json ./apps/backend/
COPY packages/db/package.json ./packages/db/

# Copy all node_modules from builder to ensure all dependencies are available
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/apps/backend/node_modules ./apps/backend/node_modules
COPY --from=builder /app/packages/db/node_modules ./packages/db/node_modules

# Copy built application from builder stage
COPY --from=builder /app/apps/backend/dist ./apps/backend/dist
COPY --from=builder /app/packages/db/dist ./packages/db/dist

# Copy .env file
COPY apps/backend/.env.local ./apps/backend/.env

# Install pnpm
RUN npm install -g pnpm

# Set environment variables
ENV NODE_ENV=production

# Set working directory to the backend app
WORKDIR /app/apps/backend

# Expose backend port
EXPOSE 3002

# Start the application
CMD ["node", "dist/main"]