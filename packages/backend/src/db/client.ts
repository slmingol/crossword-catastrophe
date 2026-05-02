import Database from 'better-sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Database file location
const dbPath = process.env.DATABASE_PATH || path.join(__dirname, '../../../..', 'data', 'crossword.db');

export const db = new Database(dbPath);

// Enable WAL mode for better concurrent access
db.pragma('journal_mode = WAL');

export interface Puzzle {
  id: number;
  title: string;
  author: string;
  source: string;
  date: string;
  difficulty?: string;
  grid_data: string;
  clues_across: string;
  clues_down: string;
  created_at: string;
}
