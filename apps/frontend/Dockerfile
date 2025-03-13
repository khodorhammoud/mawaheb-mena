# Build stage
FROM node:20-alpine as builder

WORKDIR /app

# Copy root package files for the monorepo
COPY package.json package-lock.json* ./
COPY turbo.json ./

# Copy the app package.json
COPY apps/frontend/package.json ./apps/frontend/

# Create packages directory if needed for turborepo
RUN mkdir -p packages

# Install dependencies at root level
RUN npm install

# Copy the application code
COPY apps/frontend ./apps/frontend

# Build the app using turborepo
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