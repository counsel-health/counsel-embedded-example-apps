#!/bin/bash

## Startup docker compose with the following services:
# - web: nextjs
# - server: nodejs

set -e  # Exit on any error

echo "🔐 Downloading secrets from Doppler..."
doppler secrets download --format=env-no-quotes --no-file > .env.local

echo "🔄 Copying .env.local to web/nextjs/.env.local"
cp .env.local web/nextjs/.env.local
echo "🔄 Copying .env.local to server/nodejs/.env.local"
cp .env.local server/nodejs/.env.local

echo "🐳 Stopping any existing containers..."
docker-compose down

echo "🚀 Starting services..."
docker-compose up --build

echo "✅ Services started successfully!" 