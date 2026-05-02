import { db } from './client.js';

const schema = `
CREATE TABLE IF NOT EXISTS puzzles (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  title VARCHAR(255) NOT NULL,
  author VARCHAR(255),
  source VARCHAR(100) NOT NULL,
  date DATE NOT NULL,
  difficulty VARCHAR(50),
  grid_data TEXT NOT NULL,
  clues_across TEXT NOT NULL,
  clues_down TEXT NOT NULL,
  created_at TEXT DEFAULT (datetime('now')),
  UNIQUE(source, date)
);

CREATE INDEX IF NOT EXISTS idx_puzzles_date ON puzzles(date DESC);
CREATE INDEX IF NOT EXISTS idx_puzzles_source ON puzzles(source);

CREATE TABLE IF NOT EXISTS user_progress (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  puzzle_id INTEGER NOT NULL,
  user_id VARCHAR(100),
  progress_data TEXT,
  completed BOOLEAN DEFAULT 0,
  time_spent INTEGER DEFAULT 0,
  last_updated TEXT DEFAULT (datetime('now')),
  UNIQUE(puzzle_id, user_id),
  FOREIGN KEY (puzzle_id) REFERENCES puzzles(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_user_progress_puzzle ON user_progress(puzzle_id);
CREATE INDEX IF NOT EXISTS idx_user_progress_user ON user_progress(user_id, last_updated DESC);
`;

function migrate() {
  try {
    console.log('Running migrations...');
    db.exec(schema);
    console.log('Migrations completed successfully');
    process.exit(0);
  } catch (error) {
    console.error('Migration failed:', error);
    process.exit(1);
  }
}

if (import.meta.url === `file://${process.argv[1]}`) {
  migrate();
}

export { migrate };
