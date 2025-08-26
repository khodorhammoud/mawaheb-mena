#!/bin/bash

# Create directories for certbot
mkdir -p ./certbot/www
mkdir -p ./certbot/conf

# Stop any running containers
docker-compose down

# Run certbot to obtain certificates
docker run -it --rm \
  -v ./certbot/conf:/etc/letsencrypt \
  -v ./certbot/www:/var/www/certbot \
  certbot/certbot certonly --webroot \
  --webroot-path=/var/www/certbot \
  --email your-email@example.com \
  --agree-tos \
  --no-eff-email \
  -d your-domain.com

# Create ssl directory if it doesn't exist
mkdir -p ./ssl

# Copy certificates to the ssl directory
cp ./certbot/conf/live/your-domain.com/fullchain.pem ./ssl/
cp ./certbot/conf/live/your-domain.com/privkey.pem ./ssl/

# Set proper permissions
chmod 644 ./ssl/fullchain.pem
chmod 644 ./ssl/privkey.pem

# Restart containers
docker-compose up -d

# reason to build
# reason to build
