#!/bin/bash
set -e

echo "🚀 Deploying CIMCO v2..."

# Load environment
export $(grep -v '^#' .env | xargs)

# Pull latest
git pull origin main

# Build and start
docker-compose -f docker-compose.prod.yml pull
docker-compose -f docker-compose.prod.yml build --no-cache
docker-compose -f docker-compose.prod.yml up -d

# Run migrations
docker-compose -f docker-compose.prod.yml exec -T backend ./cimco-backend migrate

# Health check
sleep 5
curl -f http://localhost:8081/api/health || exit 1

echo "✅ Deployment complete!"
echo "App: https://$DOMAIN"
