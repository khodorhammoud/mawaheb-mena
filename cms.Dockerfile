############
# Stage 1 = 🔨 Build everything
############

# Start with a lightweight Node 20 image
# 🔁 Think of it as a fresh VM with Node 20 installed.
FROM node:20-slim AS builder

# These are required only while building (not when running)
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
# 🧠 From here on, all commands will run inside /app in the container
WORKDIR /app

# From: package.json, pnpm-workspace.yaml, pnpm-lock.yaml* on your local machine
# To:   /app in the container (runner stage)
# It does NOT create new files from scratch
# It’s literally taking the existing files from your computer → placing them in the container
COPY package.json pnpm-workspace.yaml pnpm-lock.yaml* ./

# From: apps/cms folder on your local machine, To: /app/apps/cms inside the container (builder stage)
# This copies all source code for the CMS app into the container
# Needed so the build step (pnpm run build) in Stage 1 has all the files
COPY apps/cms ./apps/cms

# From: packages folder on your local machine, To: /app/packages inside the container (builder stage)
# In a monorepo, packages usually contains shared libraries (like db, ui, utils)
# Copying it ensures CMS can import and build with those shared packages
COPY packages ./packages

# From: turbo.json file on your local machine, To: /app/turbo.json inside the container (builder stage)
# turbo.json is the config for Turborepo (your monorepo build system)
# It’s needed so Turborepo knows how to build your apps and packages in the container
COPY turbo.json ./

# Install all dependencies (monorepo-wide)
RUN pnpm install

# Build the CMS
WORKDIR /app/apps/cms
RUN pnpm run build

############
# Stage 2 = 🏃 Run the final production app
############

# Start from a clean Node 20 Slim base
# No build tools here — just the bare minimum to run CMS.
FROM node:20-slim AS runner

# Install runtime system packages (needed by CMS in production)
RUN apt-get update && apt-get install -y \
    libjpeg62-turbo \
    libcairo2 \
    libpango-1.0-0 \
    libpangocairo-1.0-0 \
    libgif7 \
    libssl-dev \
    && apt-get clean \
    && rm -rf /var/lib/apt/lists/*

# Install pnpm (again, because this is a new clean image)
RUN npm install -g pnpm

# Set working directory
WORKDIR /app

# From: package.json, pnpm-workspace.yaml, pnpm-lock.yaml* on your local machine
# To:   /app in the container (runner stage)
# These are needed so the runtime container knows the dependencies and monorepo structure
COPY package.json pnpm-workspace.yaml pnpm-lock.yaml* ./

# From: apps/cms/package.json on your local machine
# To:   /app/apps/cms/package.json inside the container
# This ensures the CMS app’s own dependencies are also recognized in production
COPY apps/cms/package.json ./apps/cms/

# These are copied from the builder stage (NOT your local machine)


COPY --from=builder /app/apps/cms/.keystone ./apps/cms/.keystone
COPY --from=builder /app/apps/cms/schema.prisma ./apps/cms/schema.prisma
COPY --from=builder /app/apps/cms/keystone.ts ./apps/cms/keystone.ts
COPY --from=builder /app/apps/cms/node_modules ./apps/cms/node_modules
COPY --from=builder /app/node_modules ./node_modules

# Copy .env file
COPY apps/cms/.env.production ./apps/cms/.env

# Ensure production-only dependencies are installed (optional step)
# `|| true` means it won’t fail if pnpm has nothing new to install
WORKDIR /app
RUN pnpm install --prod --frozen-lockfile || true

# Set environment mode to production
ENV NODE_ENV=production

# Move into CMS app folder
WORKDIR /app/apps/cms

# Expose CMS port
EXPOSE 3001

# Start the CMS
CMD ["pnpm", "start"]