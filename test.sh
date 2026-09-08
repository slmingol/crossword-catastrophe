#!/bin/bash

# Quick smoke test — verifies the running stack responds correctly

set -e

echo "Testing Crossword App..."

# Backend health
if curl -sf http://localhost:3001/health > /dev/null; then
    echo "Backend health: OK"
else
    echo "Backend health: FAILED (is docker-compose up?)"
    exit 1
fi

# Backend version
VERSION=$(curl -sf http://localhost:3001/api/version | python3 -c "import sys,json; print(json.load(sys.stdin)['version'])" 2>/dev/null || echo "unknown")
echo "Backend version: $VERSION"

# Puzzles API
PUZZLE_COUNT=$(curl -sf http://localhost:3001/api/puzzles | python3 -c "import sys,json; print(json.load(sys.stdin)['pagination']['total'])" 2>/dev/null || echo "0")
echo "Puzzles in database: $PUZZLE_COUNT"

# Frontend static
if curl -sf http://localhost:3000 > /dev/null; then
    echo "Frontend: OK"
else
    echo "Frontend: FAILED (is docker-compose up?)"
    exit 1
fi

# nginx API proxy
if curl -sf http://localhost:3000/api/puzzles > /dev/null; then
    echo "nginx -> backend proxy: OK"
else
    echo "nginx -> backend proxy: FAILED"
    exit 1
fi

echo ""
echo "All checks passed!"
echo "Open http://localhost:3000"
