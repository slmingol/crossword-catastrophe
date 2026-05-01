#!/bin/bash

# Crossword App Setup Script

set -e

echo "🧩 Setting up Crossword App..."

# Check if Docker is running
if ! docker info > /dev/null 2>&1; then
    echo "❌ Error: Docker is not running. Please start Docker and try again."
    exit 1
fi

# Create .env files from examples
echo "📝 Creating .env files..."
cp packages/backend/.env.example packages/backend/.env 2>/dev/null || true
cp packages/scraper/.env.example packages/scraper/.env 2>/dev/null || true
cp packages/frontend/.env.example packages/frontend/.env 2>/dev/null || true

# Install dependencies
echo "📦 Installing dependencies..."
npm install

# Start Docker services
echo "🐳 Starting Docker services..."
docker-compose up -d postgres

# Wait for PostgreSQL to be ready
echo "⏳ Waiting for PostgreSQL to be ready..."
sleep 5

# Run database migrations
echo "🔧 Running database migrations..."
docker-compose up -d backend
sleep 3
docker-compose exec -T backend npm run migrate --workspace=backend || true

# Start all services
echo "🚀 Starting all services..."
docker-compose up -d

echo ""
echo "✅ Setup complete!"
echo ""
echo "Services:"
echo "  Frontend: http://localhost:3000"
echo "  Backend:  http://localhost:3001"
echo ""
echo "To view logs: docker-compose logs -f"
echo "To stop:      docker-compose down"
echo ""
echo "The scraper will run daily at 6 AM to fetch new puzzles."
echo "To manually trigger a scrape: docker-compose exec scraper npm run scrape --workspace=scraper"
