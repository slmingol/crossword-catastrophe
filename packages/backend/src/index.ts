import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { puzzleRouter } from './routes/puzzles.js';
import { db } from './db/client.js';
import { migrate } from './db/migrate.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Version endpoint
app.get('/api/version', (req, res) => {
  try {
    const rootPackageJson = JSON.parse(
      fs.readFileSync(path.join(__dirname, '../../../package.json'), 'utf-8')
    );
    const backendPackageJson = JSON.parse(
      fs.readFileSync(path.join(__dirname, '../package.json'), 'utf-8')
    );
    const frontendPackageJson = JSON.parse(
      fs.readFileSync(path.join(__dirname, '../../frontend/package.json'), 'utf-8')
    );
    const scraperPackageJson = JSON.parse(
      fs.readFileSync(path.join(__dirname, '../../scraper/package.json'), 'utf-8')
    );

    res.json({
      version: rootPackageJson.version,
      components: {
        backend: backendPackageJson.version,
        frontend: frontendPackageJson.version,
        scraper: scraperPackageJson.version,
      },
      buildDate: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Error reading version:', error);
    res.status(500).json({ error: 'Failed to read version' });
  }
});

// Routes
app.use('/api/puzzles', puzzleRouter);

// Error handler
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Internal server error' });
});

function start() {
  try {
    // Ensure data directory exists
    const dataDir = path.join(__dirname, '../../..', 'data');
    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir, { recursive: true });
    }

    // Run migrations
    console.log('Running database migrations...');
    db.exec(`
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
    `);
    
    console.log('Database ready');

    app.listen(PORT, () => {
      console.log(`Backend server running on http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
}

start();
