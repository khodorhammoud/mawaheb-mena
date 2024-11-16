# Stage 1: Build
FROM node:23-alpine AS base
 
FROM base AS builder

RUN apk update
RUN apk add --no-cache libc6-compat

WORKDIR /app

RUN npm install -g turbo@^2
COPY . .

# Generate a partial monorepo with a pruned lockfile for a target workspace.
# Assuming "web" is the name entered in the project's package.json: { name: "web" }
RUN turbo prune frontend --docker

# Add lockfile and package.json's of isolated subworkspace
FROM base AS installer
RUN apk update
RUN apk add --no-cache libc6-compat
WORKDIR /app

# First install the dependencies (as they change less often)
COPY --from=builder /app/out/json/ .
RUN npm install

# Build the project
COPY --from=builder /app/out/full/ .
RUN npx turbo run build --filter=frontend...

FROM base AS runner
WORKDIR /app

# Don't run production as root
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs
USER remix


# Automatically leverage output traces to reduce image size
# https://nextjs.org/docs/advanced-features/output-file-tracing
COPY --from=installer --chown=remix:nodejs /app/apps/frontend/build ./apps/frontend/build
COPY --from=installer --chown=remix:nodejs /app/apps/frontend/public ./apps/frontend/public

# COPY --from=installer --chown=nextjs:nodejs /app/apps/frontend/.next/standalone ./
# COPY --from=installer --chown=nextjs:nodejs /app/apps/frontend/.next/static ./apps/frontend/.next/static
# COPY --from=installer --chown=nextjs:nodejs /app/apps/frontend/public ./apps/frontend/public
 

# Set the environment variable for production
ENV NODE_ENV=production

# Expose the port Remix Run uses
EXPOSE 3000

# Start the Remix Run server
CMD ["node", "apps/frontend/build/index.js"]