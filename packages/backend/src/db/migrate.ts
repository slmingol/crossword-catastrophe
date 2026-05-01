import { db } from './client.js';

const schema = `
CREATE TABLE IF NOT EXISTS puzzles (
  id SERIAL PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  author VARCHAR(255),
  source VARCHAR(100) NOT NULL,
  date DATE NOT NULL,
  difficulty VARCHAR(50),
  grid_data JSONB NOT NULL,
  clues_across JSONB NOT NULL,
  clues_down JSONB NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(source, date)
);

CREATE INDEX IF NOT EXISTS idx_puzzles_date ON puzzles(date DESC);
CREATE INDEX IF NOT EXISTS idx_puzzles_source ON puzzles(source);

CREATE TABLE IF NOT EXISTS user_progress (
  id SERIAL PRIMARY KEY,
  puzzle_id INTEGER REFERENCES puzzles(id) ON DELETE CASCADE,
  user_id VARCHAR(100),
  progress_data JSONB,
  completed BOOLEAN DEFAULT FALSE,
  time_spent INTEGER DEFAULT 0,
  last_updated TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_user_progress_puzzle ON user_progress(puzzle_id);
`;

async function migrate() {
  try {
    console.log('Running migrations...');
    await db.query(schema);
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
