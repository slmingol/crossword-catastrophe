#!/bin/bash

# Development script for running services locally without Docker

set -e

echo "🧩 Starting Crossword App in development mode..."

# Check if .env files exist
if [ ! -f packages/backend/.env ]; then
    echo "Creating backend .env..."
    cp packages/backend/.env.example packages/backend/.env
fi

if [ ! -f packages/scraper/.env ]; then
    echo "Creating scraper .env..."
    cp packages/scraper/.env.example packages/scraper/.env
fi

if [ ! -f packages/frontend/.env ]; then
    echo "Creating frontend .env..."
    cp packages/frontend/.env.example packages/frontend/.env
fi

# Install dependencies if needed
if [ ! -d node_modules ]; then
    echo "📦 Installing dependencies..."
    npm install
fi

# Start PostgreSQL with Docker
echo "🐳 Starting PostgreSQL..."
docker-compose up -d postgres

# Wait for PostgreSQL
sleep 3

# Run migrations
echo "🔧 Running migrations..."
cd packages/backend && npm run migrate && cd ../..

echo ""
echo "✅ PostgreSQL is ready!"
echo ""
echo "Start the services in separate terminals:"
echo "  Terminal 1: npm run dev:backend"
echo "  Terminal 2: npm run dev:frontend"
echo "  Terminal 3: npm run dev:scraper"
echo ""
