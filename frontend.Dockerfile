# Build stage
FROM node:20-alpine as builder

# Install build dependencies if needed
RUN apk add --no-cache autoconf automake libtool make g++

# Set working directory
WORKDIR /app

# Copy package files for the entire monorepo
COPY package.json package-lock.json* ./
COPY turbo.json ./
COPY apps/frontend/package.json ./apps/frontend/

# Create packages directory if needed for turborepo
RUN mkdir -p packages

# Install dependencies
RUN npm install

# Copy the frontend application code
COPY apps/frontend ./apps/frontend

# Build the app
RUN npm run build -- --filter=frontend

# Production stage
FROM node:20-alpine as runner

WORKDIR /app

# Copy built assets from builder
COPY --from=builder /app/apps/frontend/build ./apps/frontend/build
COPY --from=builder /app/apps/frontend/package.json ./apps/frontend/package.json
COPY --from=builder /app/node_modules ./node_modules

# Set environment variables
ENV NODE_ENV=production

# Set working directory to the app directory
WORKDIR /app/apps/frontend

# Expose port
EXPOSE 3000

# Start the app
CMD ["npm", "start"]