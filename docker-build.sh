#!/bin/bash

# Show script execution in terminal
set -x

# Build all Docker images
echo "Building Docker images..."
docker-compose build

# Run the containers in detached mode
echo "Starting containers..."
docker-compose up -d

# Show container status
echo "Container status:"
docker-compose ps 