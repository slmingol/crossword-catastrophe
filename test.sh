#!/bin/bash

# Quick test script to verify the application is working

set -e

echo "🧪 Testing Crossword App..."

# Check if services are running
echo "Checking services..."

# Test PostgreSQL
if docker-compose exec -T postgres pg_isready -U crossword > /dev/null 2>&1; then
    echo "✅ PostgreSQL is running"
else
    echo "❌ PostgreSQL is not responding"
    exit 1
fi

# Test backend
if curl -s http://localhost:3001/health > /dev/null; then
    echo "✅ Backend is running"
else
    echo "❌ Backend is not responding"
    exit 1
fi

# Test frontend
if curl -s http://localhost:3000 > /dev/null; then
    echo "✅ Frontend is running"
else
    echo "❌ Frontend is not responding"
    exit 1
fi

# Check database tables
echo "Checking database..."
TABLES=$(docker-compose exec -T postgres psql -U crossword -d crossword -t -c "SELECT COUNT(*) FROM information_schema.tables WHERE table_schema = 'public';")
if [ "$TABLES" -ge 2 ]; then
    echo "✅ Database tables created"
else
    echo "❌ Database tables missing"
    exit 1
fi

# Check puzzle count
PUZZLE_COUNT=$(docker-compose exec -T postgres psql -U crossword -d crossword -t -c "SELECT COUNT(*) FROM puzzles;")
echo "📊 Puzzles in database: $(echo $PUZZLE_COUNT | xargs)"

echo ""
echo "✅ All tests passed!"
echo ""
echo "Try the app at: http://localhost:3000"
