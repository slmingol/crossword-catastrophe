#!/bin/bash

# Setup script for Crossword App — Docker-based full stack

set -e

echo "Setting up Crossword App..."

# Check Docker is available
if ! docker-compose version > /dev/null 2>&1; then
    echo "Error: docker-compose not found. Install Docker Desktop or Podman with docker-compose."
    exit 1
fi

# Create backend .env if missing
if [ ! -f packages/backend/.env ]; then
    echo "Creating packages/backend/.env..."
    cat > packages/backend/.env << 'EOF'
PORT=3001
DATABASE_PATH=/app/data/crossword.db
EOF
fi

# Create scraper .env if missing
if [ ! -f packages/scraper/.env ]; then
    echo "Creating packages/scraper/.env..."
    cat > packages/scraper/.env << 'EOF'
DATABASE_PATH=/app/data/crossword.db
SCRAPE_SCHEDULE=0 6 * * *
EOF
fi

# Install Node dependencies
echo "Installing dependencies..."
npm install

# Build and start all services
echo "Starting Docker services..."
docker-compose up -d --build

echo ""
echo "Setup complete!"
echo ""
echo "Services:"
echo "  Frontend: http://localhost:3000"
echo "  Backend:  http://localhost:3001"
echo ""
echo "Logs:  docker-compose logs -f"
echo "Stop:  docker-compose down"
echo ""
echo "The scraper runs daily at 6 AM to fetch new puzzles."
echo "Manual scrape: docker-compose exec scraper node dist/index.js"
