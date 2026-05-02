#!/usr/bin/env bash

docker-compose exec backend node -e "
const Database = require('better-sqlite3');
const db = new Database('/app/data/crossword.db');
const result = db.prepare('SELECT source, COUNT(*) as count FROM puzzles GROUP BY source ORDER BY source').all();
console.log(result);
"
