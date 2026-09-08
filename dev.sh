#!/bin/bash

# Development script for running services locally without Docker

set -e

echo "Starting Crossword App in development mode..."

# Create backend .env if missing
if [ ! -f packages/backend/.env ]; then
    echo "Creating packages/backend/.env..."
    cat > packages/backend/.env << 'EOF'
PORT=3001
DATABASE_PATH=./data/crossword.db
EOF
fi

# Create scraper .env if missing
if [ ! -f packages/scraper/.env ]; then
    echo "Creating packages/scraper/.env..."
    cat > packages/scraper/.env << 'EOF'
DATABASE_PATH=./data/crossword.db
SCRAPE_SCHEDULE=0 6 * * *
EOF
fi

# Install dependencies if needed
if [ ! -d node_modules ]; then
    echo "Installing dependencies..."
    npm install
fi

# Ensure data directory exists (SQLite lives here)
mkdir -p data

echo ""
echo "Start the services in separate terminals:"
echo "  Terminal 1: npm run dev:backend"
echo "  Terminal 2: npm run dev:frontend"
echo "  Terminal 3: npm run dev:scraper (optional)"
echo ""
