import pg from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const { Pool } = pg;

export const db = new Pool({
  connectionString: process.env.DATABASE_URL,
});

export interface Puzzle {
  id: number;
  title: string;
  author: string;
  source: string;
  date: string;
  difficulty?: string;
  grid_data: any;
  clues_across: any;
  clues_down: any;
  created_at: Date;
}
