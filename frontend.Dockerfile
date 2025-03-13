# Build stage
FROM node:20-alpine AS builder

# Install build dependencies and canvas-specific dependencies
RUN apk add --no-cache \
    autoconf \
    automake \
    libtool \
    make \
    g++ \
    python3 \
    python3-dev \
    py3-setuptools \
    pkgconfig \
    pixman-dev \
    cairo-dev \
    pango-dev \
    jpeg-dev \
    giflib-dev \
    librsvg-dev \
    file \
    nasm \
    libjpeg-turbo-dev \
    libjpeg-turbo-utils

# Set working directory
WORKDIR /app

# Copy package files for the entire monorepo
COPY package.json package-lock.json* ./
COPY turbo.json ./
COPY apps/frontend/package.json ./apps/frontend/
COPY apps/shared/ ./apps/shared/

# Create packages directory if needed for turborepo
RUN mkdir -p packages

# Install all dependencies (including dev dependencies for build)
RUN npm install --ignore-scripts && \
    npm rebuild canvas && \
    npm rebuild pdf-extractor && \
    npm rebuild isomorphic-dompurify

# Copy the frontend application code
COPY apps/frontend ./apps/frontend

# Ensure commonly missed packages are explicitly installed
RUN npm install --save openai dotenv @remix-run/dev remix-auth-google

# Build the app
RUN npm run build -- --filter=frontend

# Production stage
FROM node:20-alpine AS runner

# Install runtime dependencies
RUN apk add --no-cache \
    libjpeg-turbo \
    cairo \
    pango \
    giflib \
    librsvg

WORKDIR /app

# # Copy package files to ensure proper npm installation in production
# COPY package.json package-lock.json* ./
# COPY apps/frontend/package.json ./apps/frontend/

# # Copy built assets from builder
# COPY --from=builder /app/apps/frontend/build ./apps/frontend/build
# COPY --from=builder /app/node_modules ./node_modules

# # Install production dependencies (ensures all required packages are available)
# RUN cd apps/frontend && npm install --production --ignore-scripts
# Copy ALL files from builder (including node_modules with all deps) to ensure everything needed is available
COPY --from=builder /app ./

# Set environment variables
ENV NODE_ENV=production

# Set working directory to the app directory
WORKDIR /app/apps/frontend

# Expose port
EXPOSE 3000

# Start the app
CMD ["npm", "start"]