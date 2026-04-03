#!/bin/bash

## Startup docker compose with the following services:
# - web: nextjs
# - server: nodejs
#
# Requires: Doppler CLI and `doppler setup` at the repo root (or doppler.yaml).
# See doppler.yaml.example and automation-testing/README.md.

set -euo pipefail

echo "🔐 Downloading secrets from Doppler..."
doppler secrets download --format=env-no-quotes --no-file > .env.local

echo "🔄 Copying .env.local to web/nextjs/.env.local"
cp .env.local web/nextjs/.env.local
echo "🔄 Copying .env.local to server/nodejs/.env.local"
cp .env.local server/nodejs/.env.local

echo "🐳 Stopping any existing containers..."
docker compose down

echo "🚀 Starting services..."
docker compose up --build

echo "✅ Services started successfully!"
