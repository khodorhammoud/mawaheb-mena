#!/bin/bash

# Pull latest changes
git pull

# Check if SSL certificates need renewal
if [ -d "./certbot/conf/live/your-domain.com" ]; then
  docker run --rm \
    -v ./certbot/conf:/etc/letsencrypt \
    -v ./certbot/www:/var/www/certbot \
    certbot/certbot renew --quiet

  # Copy renewed certificates if they exist
  if [ $? -eq 0 ]; then
    cp ./certbot/conf/live/your-domain.com/fullchain.pem ./ssl/
    cp ./certbot/conf/live/your-domain.com/privkey.pem ./ssl/
    echo "SSL certificates renewed successfully"
  fi
fi

# Build and start containers
docker-compose down
docker-compose build
docker-compose up -d

# Clean up unused images
docker image prune -f 