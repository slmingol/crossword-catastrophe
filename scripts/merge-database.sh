#!/bin/bash
# Script to merge puzzles from a new database into the repository database

set -e

SOURCE_DB="${1:-data/crossword.db}"
BACKUP_DB="data/crossword.db.backup-$(date +%Y%m%d-%H%M%S)"

if [ ! -f "$SOURCE_DB" ]; then
    echo "Error: Source database not found: $SOURCE_DB"
    exit 1
fi

echo "=== Puzzle Database Merge Tool ==="
echo ""
echo "This will merge puzzles from: $SOURCE_DB"
echo "Into repository database: data/crossword.db"
echo ""

# Check puzzle counts
REPO_COUNT=$(sqlite3 data/crossword.db "SELECT COUNT(*) FROM puzzles;" 2>/dev/null || echo "0")
SOURCE_COUNT=$(sqlite3 "$SOURCE_DB" "SELECT COUNT(*) FROM puzzles;" 2>/dev/null || echo "0")

echo "Repository database: $REPO_COUNT puzzles"
echo "Source database: $SOURCE_COUNT puzzles"
echo ""

if [ "$SOURCE_COUNT" -le "$REPO_COUNT" ]; then
    echo "Source has same or fewer puzzles. Nothing to merge."
    exit 0
fi

# Backup current database
echo "Creating backup: $BACKUP_DB"
cp data/crossword.db "$BACKUP_DB"

# Export new puzzles from source (those not in repo)
echo "Exporting new puzzles from source database..."
sqlite3 "$SOURCE_DB" <<EOF > /tmp/new_puzzles.sql
.output /tmp/new_puzzles.sql
SELECT 
    'INSERT OR IGNORE INTO puzzles (title, author, source, date, difficulty, grid_data, clues_across, clues_down, created_at) VALUES (' ||
    quote(title) || ', ' ||
    quote(author) || ', ' ||
    quote(source) || ', ' ||
    quote(date) || ', ' ||
    quote(difficulty) || ', ' ||
    quote(grid_data) || ', ' ||
    quote(clues_across) || ', ' ||
    quote(clues_down) || ', ' ||
    quote(created_at) || ');'
FROM puzzles;
.output stdout
EOF

# Import into repository database
echo "Importing new puzzles into repository database..."
sqlite3 data/crossword.db < /tmp/new_puzzles.sql

# Verify
NEW_REPO_COUNT=$(sqlite3 data/crossword.db "SELECT COUNT(*) FROM puzzles;")
ADDED=$((NEW_REPO_COUNT - REPO_COUNT))

echo ""
echo "=== Merge Complete ==="
echo "Added: $ADDED new puzzles"
echo "Total: $NEW_REPO_COUNT puzzles"
echo "Backup saved: $BACKUP_DB"
echo ""
echo "To commit the updated database:"
echo "  git add data/crossword.db"
echo "  git commit -m 'Update puzzle database: +$ADDED puzzles'"
echo "  git push"

# Cleanup
rm -f /tmp/new_puzzles.sql
