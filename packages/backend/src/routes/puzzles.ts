import express from 'express';
import { db } from '../db/client.js';

export const puzzleRouter = express.Router();

// Get all puzzles with pagination
puzzleRouter.get('/', async (req, res) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const offset = (page - 1) * limit;

    const result = await db.query(
      `SELECT id, title, author, source, date, difficulty, created_at
       FROM puzzles
       ORDER BY date DESC
       LIMIT $1 OFFSET $2`,
      [limit, offset]
    );

    const countResult = await db.query('SELECT COUNT(*) FROM puzzles');
    const total = parseInt(countResult.rows[0].count);

    res.json({
      puzzles: result.rows,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('Error fetching puzzles:', error);
    res.status(500).json({ error: 'Failed to fetch puzzles' });
  }
});

// Get puzzle by ID
puzzleRouter.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const result = await db.query(
      'SELECT * FROM puzzles WHERE id = $1',
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Puzzle not found' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error fetching puzzle:', error);
    res.status(500).json({ error: 'Failed to fetch puzzle' });
  }
});

// Get today's puzzle
puzzleRouter.get('/daily/today', async (req, res) => {
  try {
    const result = await db.query(
      `SELECT * FROM puzzles
       WHERE date >= CURRENT_DATE - INTERVAL '1 day'
       ORDER BY date DESC, created_at DESC
       LIMIT 1`
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'No puzzle available for today' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error fetching daily puzzle:', error);
    res.status(500).json({ error: 'Failed to fetch daily puzzle' });
  }
});

// Save user progress
puzzleRouter.post('/:id/progress', async (req, res) => {
  try {
    const { id } = req.params;
    const { userId = 'anonymous', progressData, completed, timeSpent } = req.body;

    await db.query(
      `INSERT INTO user_progress (puzzle_id, user_id, progress_data, completed, time_spent)
       VALUES ($1, $2, $3, $4, $5)
       ON CONFLICT (puzzle_id, user_id) 
       DO UPDATE SET
         progress_data = $3,
         completed = $4,
         time_spent = $5,
         last_updated = NOW()`,
      [id, userId, JSON.stringify(progressData), completed, timeSpent]
    );

    res.json({ success: true });
  } catch (error) {
    console.error('Error saving progress:', error);
    res.status(500).json({ error: 'Failed to save progress' });
  }
});
