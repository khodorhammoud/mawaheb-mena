# Stage 1: Build Stage
FROM node:23-alpine AS base

FROM base AS prune

RUN apk update
RUN apk add --no-cache libc6-compat

WORKDIR /app
RUN npm install turbo --global
COPY . .
RUN turbo prune frontend --docker


# This Step only installs Production & Dev dependencies
FROM base AS installer
RUN apk update
RUN apk add --no-cache libc6-compat
WORKDIR /app
# the /out/json contain the package.json file that is used to install packages related to the "frontend" 
COPY --from=prune /app/out/json/ .

RUN npm install

# This Step only installs Production dependencies only
FROM base AS installer-production
RUN apk update
RUN apk add --no-cache libc6-compat
WORKDIR /app
# the /out/json contain the package.json file that is used to install packages related to the "frontend" 
COPY --from=prune /app/out/json/ .

RUN npm install --only=production


# Uses the dev & production dependencies to make a production build
FROM base AS builder
WORKDIR /app
COPY --from=installer /app/node_modules /app/node_modules

# the /out/full contain the code files that is used to run the package "frontend" 
COPY --from=prune /app/out/full/ .

# We assume that you have a "build" command in your root package.json file
# The --filter is used to tell which of the "apps" to run this command against
RUN npx turbo build --filter=frontend

# runner will use the builder output, and use only the node_modules for production to reduce the size of the final image
FROM base AS runner
WORKDIR /app

# Don't run production as root
RUN addgroup --system --gid 1001 remix-group
RUN adduser --system --uid 1001 remix-user
USER remix-user

# Copy Production dependencies, build and public dirctories
COPY --from=installer-production --chown=remix-user:remix-group /app/node_modules /app/node_modules
COPY --from=prune   --chown=remix-user:remix-group /app/out/json/ .
COPY --from=builder --chown=remix-user:remix-group /app/apps/frontend/build /app/apps/frontend/build
COPY --from=builder --chown=remix-user:remix-group /app/apps/frontend/public /app/apps/frontend/public

WORKDIR /app/apps/frontend

CMD ["npm", "run", "start"]