# Build stage
FROM node:20-slim AS builder

# Install build dependencies
RUN apt-get update && apt-get install -y \
    python3 \
    make \
    g++ \
    git \
    libpixman-1-dev \
    libcairo2-dev \
    libpango1.0-dev \
    libjpeg-dev \
    libgif-dev

# Install pnpm
RUN npm install -g pnpm

# Set working directory
WORKDIR /app

# Copy the monorepo files from the context
COPY package.json pnpm-workspace.yaml pnpm-lock.yaml* ./
COPY apps/cms ./apps/cms
COPY packages ./packages
COPY turbo.json ./

# Install all dependencies
RUN pnpm install

# Build the CMS
WORKDIR /app/apps/cms
RUN pnpm run build

# Production stage - much smaller
FROM node:20-slim AS runner

# Install runtime dependencies
RUN apt-get update && apt-get install -y \
    libjpeg62-turbo \
    libcairo2 \
    libpango-1.0-0 \
    libpangocairo-1.0-0 \
    libgif7 \
    libssl-dev \
    && apt-get clean \
    && rm -rf /var/lib/apt/lists/*

# Install pnpm
RUN npm install -g pnpm

# Set working directory
WORKDIR /app

# Copy only the necessary package files for production
COPY package.json pnpm-workspace.yaml pnpm-lock.yaml* ./
COPY apps/cms/package.json ./apps/cms/

# Copy all the necessary files from the builder stage
COPY --from=builder /app/apps/cms/.keystone ./apps/cms/.keystone
COPY --from=builder /app/apps/cms/schema.prisma ./apps/cms/schema.prisma
COPY --from=builder /app/apps/cms/keystone.ts ./apps/cms/keystone.ts
COPY --from=builder /app/apps/cms/node_modules ./apps/cms/node_modules
COPY --from=builder /app/node_modules ./node_modules

# Install additional dependencies if needed
WORKDIR /app
RUN pnpm install --prod --frozen-lockfile || true

# Set environment variables
ENV NODE_ENV=production

# Set working directory to the CMS app
WORKDIR /app/apps/cms

# Expose CMS port
EXPOSE 3001

# Start the CMS
CMD ["pnpm", "start"]