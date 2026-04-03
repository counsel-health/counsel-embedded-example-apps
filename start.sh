#!/bin/bash

## Startup docker compose with the following services:
# - web: nextjs
# - server: nodejs
#
# Requires: Doppler CLI and `doppler setup` at the repo root.

set -euo pipefail

echo "🔐 Downloading secrets from Doppler..."
doppler secrets download --format=env-no-quotes --no-file > .env.local

echo "🔄 Copying .env.local to web/nextjs/.env.local"
cp .env.local web/nextjs/.env.local
echo "🔄 Copying .env.local to server/nodejs/.env.local"
cp .env.local server/nodejs/.env.local

echo "🐳 Stopping any existing containers..."
docker compose --env-file .env.local down

echo "🚀 Starting services..."
doppler run -- docker compose --env-file .env.local up --build

echo "✅ Services started successfully!"
