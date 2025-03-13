# Build stage - use Debian for both stages to ensure binary compatibility
FROM node:20-slim AS builder

# Install build dependencies for Debian
RUN apt-get update && apt-get install -y \
    autoconf \
    automake \
    libtool \
    make \
    g++ \
    python3 \
    python3-dev \
    python3-setuptools \
    pkg-config \
    libpixman-1-dev \
    libcairo2-dev \
    libpango1.0-dev \
    libjpeg-dev \
    libgif-dev \
    librsvg2-dev \
    file \
    nasm \
    libjpeg62-turbo-dev \
    && apt-get clean \
    && rm -rf /var/lib/apt/lists/*

# Set working directory
WORKDIR /app

# Copy package files for the entire monorepo
COPY package.json package-lock.json* ./
COPY turbo.json ./
COPY apps/cms/package.json ./apps/cms/

# Create packages directory if needed for turborepo
RUN mkdir -p packages

# Install dependencies
RUN npm install --ignore-scripts && \
    npm rebuild canvas && \
    npm rebuild isomorphic-dompurify

# Copy the CMS application code
COPY apps/cms ./apps/cms

# Set environment variable to force Prisma to generate for debian
ENV PRISMA_SCHEMA_ENGINE_BINARY=debian-openssl-3.0.x
ENV PRISMA_QUERY_ENGINE_BINARY=debian-openssl-3.0.x
ENV PRISMA_INTROSPECTION_ENGINE_BINARY=debian-openssl-3.0.x
ENV PRISMA_FMT_BINARY=debian-openssl-3.0.x
ENV PRISMA_ENGINES_CHECKSUM=debian-openssl-3.0.x

# Find and modify all schema.prisma files to include debian target
RUN find /app -name "schema.prisma" -type f -exec sed -i '/provider *= *"prisma-client-js"/a \ \ binaryTargets = ["native", "debian-openssl-3.0.x"]' {} \;

# Regenerate Prisma client
RUN cd /app/apps/cms && npx prisma generate --schema=/app/apps/cms/node_modules/.prisma/client/schema.prisma || true

# Build the app
RUN cd apps/cms && npx keystone build

# Production stage - use the same Debian image
FROM node:20-slim AS runner

# Install runtime dependencies for Debian
RUN apt-get update && apt-get install -y \
    libjpeg62-turbo \
    libcairo2 \
    libpango-1.0-0 \
    libpangocairo-1.0-0 \
    libgif7 \
    librsvg2-2 \
    libssl-dev \
    && apt-get clean \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Copy ALL files from builder to ensure everything is available
COPY --from=builder /app ./

# Set environment variables
ENV NODE_ENV=production
ENV PRISMA_QUERY_ENGINE_TYPE="debian-openssl-3.0.x"

# Set working directory to the app directory
WORKDIR /app/apps/cms

# Expose port
EXPOSE 3000

# Start the app
CMD ["npm", "start"]