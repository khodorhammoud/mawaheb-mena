FROM node:bullseye-slim as base


# Set the working directory
WORKDIR /app

# Install dependencies
COPY apps/frontend/package.json ./
# COPY apps/frontend/package-lock.json ./
# RUN npm ci --production=false
RUN npm install

# Copy the rest of the application code
COPY apps/frontend/ .

RUN npm run db:generate

# Build the Remix app
RUN npm run build

# Remove dev dependencies
RUN npm prune --production

# Stage 2: Create the final image
FROM node:20-alpine as runner

# Set the working directory
WORKDIR /app

# Copy the build from the builder stage
COPY --from=base /app /app

# Set environment variables for production
ENV NODE_ENV=production
ENV PORT=5173

# Expose the port
EXPOSE 5173

# Start the Remix app
CMD ["npm", "run" ,"start"] 