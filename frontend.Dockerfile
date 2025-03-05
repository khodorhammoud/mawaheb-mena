FROM node:20-alpine AS base

# Install build dependencies
RUN apk add --no-cache autoconf automake libtool make g++ python3

# Set working directory
WORKDIR /app

# Install dependencies only when needed
FROM base AS deps
# Copy only package.json files for workspace dependency resolution
COPY package.json ./
COPY apps/frontend/package.json ./apps/frontend/
# Create packages directory if it doesn't exist in the image
RUN mkdir -p ./packages

# Use npm install without package-lock.json
RUN npm install --no-package-lock

# Build stage
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Fix ESBuild version mismatch by reinstalling it
RUN npm uninstall -g esbuild && \
    rm -rf ./node_modules/esbuild && \
    npm install -g esbuild && \
    npm install --no-save esbuild

# Build the app
RUN cd apps/frontend && npm run build

# Production image
FROM node:20-alpine AS runner
WORKDIR /app

ENV NODE_ENV production

# Copy necessary files for running the app
COPY --from=builder /app/apps/frontend/build ./apps/frontend/build
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/apps/frontend/package.json ./apps/frontend/package.json

# Set working directory to frontend folder
WORKDIR /app/apps/frontend

# Expose port
EXPOSE 3000

# Start the app
CMD ["npm", "run", "start"]