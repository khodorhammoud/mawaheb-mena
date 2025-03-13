# Build stage
FROM node:20-alpine as builder

# Install build dependencies if needed
RUN apk add --no-cache autoconf automake libtool make g++ python3

# Set working directory
WORKDIR /app

# Copy package files for the entire monorepo
COPY package.json package-lock.json* ./
COPY turbo.json ./
COPY apps/cms/package.json ./apps/cms/

# Create packages directory if needed for turborepo
RUN mkdir -p packages

# Install dependencies
RUN npm install

# Copy the CMS application code
COPY apps/cms ./apps/cms

# Build the app
RUN cd apps/cms && npx keystone build

# Production stage
FROM node:20-alpine as runner

WORKDIR /app

# Copy built assets from builder
COPY --from=builder /app/apps/cms/.keystone ./apps/cms/.keystone
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/apps/cms/package.json ./apps/cms/package.json
COPY --from=builder /app/apps/cms/keystone.ts ./apps/cms/keystone.ts
COPY --from=builder /app/apps/cms/schema ./apps/cms/schema
COPY --from=builder /app/apps/cms/auth.ts ./apps/cms/auth.ts

# Set environment variables
ENV NODE_ENV=production

# Set working directory to the app directory
WORKDIR /app/apps/cms

# Expose port
EXPOSE 3001

# Start the app
CMD ["npm", "start"]