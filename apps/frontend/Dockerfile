# Build stage
FROM node:20-alpine as builder

WORKDIR /app

# Copy package files
COPY package*.json ./
COPY turbo.json ./

# Copy workspace files
COPY apps/frontend/package*.json ./apps/frontend/
COPY apps/frontend/ ./apps/frontend/

# Install dependencies
RUN npm install

# Build the app
RUN npm run build

# Production stage
FROM node:20-alpine

WORKDIR /app

# Copy built assets from builder
COPY --from=builder /app/apps/frontend/build ./build
COPY --from=builder /app/apps/frontend/package*.json ./
COPY --from=builder /app/apps/frontend/node_modules ./node_modules

# Set environment variables
ENV NODE_ENV=production

# Expose port
EXPOSE 3000

# Start the app
CMD ["npm", "start"] 