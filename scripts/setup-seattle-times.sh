#!/bin/bash
# Setup script for Seattle Times Midi crossword support

set -e

echo "==================================================================="
echo "Seattle Times Midi Crossword - GitHub Fork Setup"
echo "==================================================================="
echo ""
echo "This script will help you push your xword-dl fork to GitHub."
echo ""

# Check if we're in the right directory
if [ ! -d "~/dev/projects/xword-dl" ]; then
    echo "ERROR: xword-dl fork not found at ~/dev/projects/xword-dl"
    echo "Expected directory structure:"
    echo "  ~/dev/projects/xword-dl (your fork)"
    echo "  ~/dev/projects/crossword-catastrophe (this project)"
    exit 1
fi

echo "Step 1: Create GitHub fork"
echo "-------------------------"
echo "1. Go to: https://github.com/thisisparker/xword-dl"
echo "2. Click 'Fork' button in top right"
echo "3. Create fork under your account (slmingol)"
echo ""
read -p "Press ENTER once you've created the fork..."

echo ""
echo "Step 2: Push feature branch to your fork"
echo "---------------------------------------"
cd ~/dev/projects/xword-dl

# Check if remote exists
if git remote | grep -q slmingol; then
    echo "Remote 'slmingol' already exists"
else
    echo "Adding remote 'slmingol'..."
    git remote add slmingol git@github.com:slmingol/xword-dl.git
fi

echo "Pushing feature branch..."
git push slmingol feature/seattle-times-midi

echo ""
echo "==================================================================="
echo "SUCCESS!"
echo "==================================================================="
echo ""
echo "Your fork is now available at:"
echo "  https://github.com/slmingol/xword-dl/tree/feature/seattle-times-midi"
echo ""
echo "The scraper Dockerfile has been updated to install from your fork:"
echo "  git+https://github.com/slmingol/xword-dl.git@feature/seattle-times-midi"
echo ""
echo "Next steps:"
echo "  1. Build scraper: docker-compose build scraper"
echo "  2. Deploy: docker-compose up -d"
echo "  3. Monitor: docker-compose logs -f scraper"
echo ""
echo "Optional: Create PR to upstream xword-dl"
echo "  https://github.com/thisisparker/xword-dl/compare/main...slmingol:feature/seattle-times-midi"
echo ""
