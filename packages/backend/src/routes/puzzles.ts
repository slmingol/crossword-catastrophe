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

// Get user's current puzzle (in progress or latest)
puzzleRouter.get('/current/:userId', async (req, res) => {
  try {
    const { userId } = req.params;

    // First, check if there's an incomplete puzzle
    const inProgressResult = await db.query(
      `SELECT p.*, up.progress_data, up.completed, up.time_spent, up.last_updated
       FROM puzzles p
       JOIN user_progress up ON p.id = up.puzzle_id
       WHERE up.user_id = $1 AND up.completed = false
       ORDER BY up.last_updated DESC
       LIMIT 1`,
      [userId]
    );

    if (inProgressResult.rows.length > 0) {
      return res.json(inProgressResult.rows[0]);
    }

    // If no incomplete puzzle, return the latest puzzle
    const latestResult = await db.query(
      `SELECT * FROM puzzles
       WHERE date >= CURRENT_DATE - INTERVAL '1 day'
       ORDER BY date DESC, created_at DESC
       LIMIT 1`
    );

    if (latestResult.rows.length === 0) {
      return res.status(404).json({ error: 'No puzzle available' });
    }

    res.json(latestResult.rows[0]);
  } catch (error) {
    console.error('Error fetching current puzzle:', error);
    res.status(500).json({ error: 'Failed to fetch current puzzle' });
  }
});

// Get user progress for a specific puzzle
puzzleRouter.get('/:id/progress/:userId', async (req, res) => {
  try {
    const { id, userId } = req.params;

    const result = await db.query(
      `SELECT * FROM user_progress
       WHERE puzzle_id = $1 AND user_id = $2`,
      [id, userId]
    );

    if (result.rows.length === 0) {
      return res.json(null);
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error fetching user progress:', error);
    res.status(500).json({ error: 'Failed to fetch user progress' });
  }
});

// Get all user progress
puzzleRouter.get('/progress/:userId', async (req, res) => {
  try {
    const { userId } = req.params;

    const result = await db.query(
      `SELECT up.*, p.title, p.author, p.source, p.date
       FROM user_progress up
       JOIN puzzles p ON up.puzzle_id = p.id
       WHERE up.user_id = $1
       ORDER BY up.last_updated DESC`,
      [userId]
    );

    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching user progress:', error);
    res.status(500).json({ error: 'Failed to fetch user progress' });
  }
});

// Get previous puzzle
puzzleRouter.get('/:id/previous', async (req, res) => {
  try {
    const { id } = req.params;
    
    // Get current puzzle's date
    const currentResult = await db.query(
      'SELECT date FROM puzzles WHERE id = $1',
      [id]
    );
    
    if (currentResult.rows.length === 0) {
      return res.status(404).json({ error: 'Puzzle not found' });
    }
    
    const currentDate = currentResult.rows[0].date;
    
    // Get the most recent puzzle before this date
    const result = await db.query(
      `SELECT id FROM puzzles
       WHERE date < $1
       ORDER BY date DESC, id DESC
       LIMIT 1`,
      [currentDate]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'No previous puzzle' });
    }
    
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error fetching previous puzzle:', error);
    res.status(500).json({ error: 'Failed to fetch previous puzzle' });
  }
});

// Get next puzzle
puzzleRouter.get('/:id/next', async (req, res) => {
  try {
    const { id } = req.params;
    
    // Get current puzzle's date
    const currentResult = await db.query(
      'SELECT date FROM puzzles WHERE id = $1',
      [id]
    );
    
    if (currentResult.rows.length === 0) {
      return res.status(404).json({ error: 'Puzzle not found' });
    }
    
    const currentDate = currentResult.rows[0].date;
    
    // Get the earliest puzzle after this date
    const result = await db.query(
      `SELECT id FROM puzzles
       WHERE date > $1
       ORDER BY date ASC, id ASC
       LIMIT 1`,
      [currentDate]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'No next puzzle' });
    }
    
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error fetching next puzzle:', error);
    res.status(500).json({ error: 'Failed to fetch next puzzle' });
  }
});
