############
# Stage 1 = 🔨 Build everything
############

# Use Node.js v20 with Alpine Linux for a small image size  
# 🔁 This is like you downloaded Node 20 on a fresh Linux VM.
FROM node:20-alpine AS builder

# Install system packages needed for building native Node modules
# these are system-level packages required to build native Node.js modules
RUN apk add --no-cache \
  python3 \
  make \
  g++ \
  git \
  libjpeg-turbo-dev \
  cairo-dev \
  pango-dev \
  giflib-dev

# Set the working directory inside the container
# It’s creating a folder inside our image here, called /app and telling Docker: 🧠 “From now on, all commands will be executed inside /app.”
WORKDIR /app

# Copy everything from your local project into the container
# we now added the project inside this image, so we will be able to use any file we want from the new folder /app, not from our main project (from its copy we did "/app")
COPY . .

# Copy the production env file for the frontend into the correct location
# This makes sure that your build and runtime have proper environment variables.
COPY apps/frontend/.env.production ./apps/frontend/.env

# Install pnpm globally to run commands on our new project (the image)
RUN npm install -g pnpm

# Install all dependencies (monorepo-wide)
RUN pnpm install

# Set production mode to optimize builds
# It affects how builds run — and how your app behaves later when it starts, i don't know how this happens basically, but yeah use it 😂
ENV NODE_ENV=production

# Build shared database package
RUN cd packages/db && pnpm run build

# Build the frontend Remix app
RUN cd apps/frontend && pnpm run build

# -> the image is now ready with build output


# Install Express and Remix Express adapter inside the frontend package
# we install express as part of the frontend package, to support the server-side rendering behavior.
RUN cd apps/frontend && pnpm add express@4.18.2 @remix-run/express@2.16.0

############
# Stage 2 = 🏃 Run the final production app
# Multi-stage Docker builds → we use one stage to build, then throw it away and create a smaller, cleaner image just for running the app.
# 🧠 Why not just use the builder image?
# Because:
# It's bloated (has build tools, source code, dev files)
# It’s slow to start
# It's less secure
# It’s harder to cache in CI/CD
# Docker image best practices say:
# 👉 "Your production image should have only what you need to run, nothing more"
############
        
# Start from a clean production base image
# Use a new, clean, minimal base — same Node.js but no extra build tools, since we don’t need g++, make, python3, or the full monorepo anymore cause we already built the app ❤️
FROM node:20-alpine AS runner

# Install only the minimum runtime dependencies needed
# This installs runtime system packages, not build tools
RUN apk add --no-cache \
  libjpeg-turbo \
  cairo \
  pango \
  giflib \
  curl

# Install pnpm to run the app
# we already installed this in Stage 1, BUT remember — Stage 2 is a brand new clean image
RUN npm install -g pnpm

# Set working directory
# we used WORKDIR /app in Stage 1, but that was in the builder image. Now this is a new fresh image → it has nothing.
# ->
# /app/
WORKDIR /app

# Create folder structure for compiled output
# 💡 We’re just creating the folders before copying into them.
# ->
# /app/
#   └─ apps/frontend/build
#   └─ packages/db/dist
RUN mkdir -p apps/frontend/build packages/db/dist

# Copy the required config files
# 🧠 These help with dependency resolution, or in case we ever want to pnpm install in this image too, 📌 These files don’t run anything. They’re just metadata and dependency trees.
COPY package.json pnpm-workspace.yaml pnpm-lock.yaml* ./
COPY apps/frontend/package.json ./apps/frontend/
COPY packages/db/package.json ./packages/db/

# Copy node_modules (already built) from the build stage
# We already installed everything in Stage 1, so instead of reinstalling, just copy the final folders
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/apps/frontend/node_modules ./apps/frontend/node_modules
COPY --from=builder /app/packages/db/node_modules ./packages/db/node_modules

# Copy the built frontend app (Remix build output)
# 🎯 The folders we created earlier with mkdir? Were now we are filling them with content.
COPY --from=builder /app/apps/frontend/build ./apps/frontend/build

# Copy the built DB output (e.g., compiled types or code)
# 🎯 The folders we created earlier with mkdir? Were now we are filling them with content.
COPY --from=builder /app/packages/db/dist ./packages/db/dist

# Copy the server entry point file (custom Express wrapper)
# This is the custom Express server that starts the frontend.
COPY --from=builder /app/apps/frontend/server.js ./apps/frontend/

# after copying build
COPY --from=builder /app/apps/frontend/public ./apps/frontend/public


# ->
# /app/
# ├─ package.json
# ├─ node_modules/
# ├─ pnpm-lock.yaml
# ├─ apps/
# │   └─ frontend/
# │       ├─ package.json
# │       ├─ build/   <-- built Remix app
# │       └─ server.js
# └─ packages/
    # └─ db/
        # ├─ package.json
        # └─ dist/   <-- compiled code

# Copy the .env file again for runtime
# Taking the production env file from your project
# Renaming it to .env inside the container
COPY apps/frontend/.env.production ./apps/frontend/.env


# Set environment to production
# This tells We’re in production mode
ENV NODE_ENV=production

# Disable SSL cert validation (TEMP: needed only for internal development)
# It tells Node: “Don’t crash on unverified SSL certs.” # Honestly i didn't get that, but okkay 😂
ENV NODE_TLS_REJECT_UNAUTHORIZED=0

# Enable all debug logs from Node
# 🔍 Enables debug logging for any library using the debug module.
ENV DEBUG=*

# Enable warnings tracking in Node.js
# 🔍 Tells Node.js: “Show full stack traces for warnings.” # Useful for debugging memory leaks, deprecations, or unexpected behavior.
ENV NODE_OPTIONS="--trace-warnings"

# Docker will use this to check if the container is healthy
# Every 30 seconds, send a request to /api/health on port 5173. If it fails 3 times, mark this container as unhealthy.
# 💡 Your app must have an API route at /api/health that returns status 200.
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:5173/api/health || exit 1

# Set working directory to the frontend app
# The server.js file is in here, and build/ and node_modules/ are inside this structure
WORKDIR /app/apps/frontend

# Tell Docker to expose port 5173
# This container listens on port 5173
EXPOSE 5173

# Start the server using our custom server.js file
# 🎯 This is the default command Docker runs when you start the container
CMD ["node", "server.js"]
