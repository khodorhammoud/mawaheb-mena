FROM node:20-alpine AS base

# Install build dependencies
RUN apk add --no-cache autoconf automake libtool make g++ python3

# Set working directory
WORKDIR /app

# Install dependencies only when needed
FROM base AS deps
# Copy only package.json files for workspace dependency resolution
COPY package.json ./
COPY apps/cms/package.json ./apps/cms/
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
RUN cd apps/cms && npx keystone build

# Production image
FROM node:20-alpine AS runner
WORKDIR /app

ENV NODE_ENV production

# Copy necessary files for running the app
COPY --from=builder /app/apps/cms/.keystone ./apps/cms/.keystone
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/apps/cms/package.json ./apps/cms/package.json
COPY --from=builder /app/apps/cms/keystone.ts ./apps/cms/keystone.ts
COPY --from=builder /app/apps/cms/schema ./apps/cms/schema
COPY --from=builder /app/apps/cms/auth.ts ./apps/cms/auth.ts

# Set working directory to cms folder
WORKDIR /app/apps/cms

# Expose port
EXPOSE 3000

# Start the app
CMD ["npm", "run", "start"]