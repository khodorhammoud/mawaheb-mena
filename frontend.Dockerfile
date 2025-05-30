# Build stage
FROM node:20-alpine AS builder

# Install build dependencies
RUN apk add --no-cache \
python3 \
make \
g++ \
git \
libjpeg-turbo-dev \
cairo-dev \
pango-dev \
giflib-dev

# Set working directory
WORKDIR /app

# Copy the entire monorepo structure for the build
COPY . .

COPY apps/frontend/.env.production ./apps/frontend/.env

# Install pnpm
RUN npm install -g pnpm

# Install all dependencies
RUN pnpm install

# Build the db package and frontend
ENV NODE_ENV=production
RUN cd packages/db && pnpm run build
RUN cd apps/frontend && pnpm run build

# Install express and the remix express adapter in the frontend package
RUN cd apps/frontend && pnpm add express@4.18.2 @remix-run/express@2.16.0

# Production stage - much smaller
FROM node:20-alpine AS runner

# Install runtime dependencies
RUN apk add --no-cache \
    libjpeg-turbo \
    cairo \
    pango \
    giflib \
    curl
    
    # Install pnpm
    RUN npm install -g pnpm
    
    # Set working directory
    WORKDIR /app
    
    # Create minimal directory structure
    RUN mkdir -p apps/frontend/build packages/db/dist
    
    # Copy package files
    COPY package.json pnpm-workspace.yaml pnpm-lock.yaml* ./
    COPY apps/frontend/package.json ./apps/frontend/
    COPY packages/db/package.json ./packages/db/
    
    # Copy node_modules from builder
    COPY --from=builder /app/node_modules ./node_modules
    COPY --from=builder /app/apps/frontend/node_modules ./apps/frontend/node_modules
    COPY --from=builder /app/packages/db/node_modules ./packages/db/node_modules
    
# Copy built application from builder stage
COPY --from=builder /app/apps/frontend/build ./apps/frontend/build
COPY --from=builder /app/packages/db/dist ./packages/db/dist

# Copy our custom server wrapper
COPY --from=builder /app/apps/frontend/server.js ./apps/frontend/

# Copy .env file
COPY apps/frontend/.env.production ./apps/frontend/.env

# Set environment variables
ENV NODE_ENV=production
# Disable Node.js rejection of unauthorized SSL certificates
ENV NODE_TLS_REJECT_UNAUTHORIZED=0
# Set debugging
ENV DEBUG=*
ENV NODE_OPTIONS="--trace-warnings"

# Add a health check using our new API endpoint
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 CMD curl -f http://localhost:5173/api/health || exit 1

# Set working directory to the frontend app
WORKDIR /app/apps/frontend

# Expose frontend port
EXPOSE 5173

# Start the application with our custom server wrapper
CMD ["node", "server.js"]