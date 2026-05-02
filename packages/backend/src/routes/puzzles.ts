import express from 'express';
import { db } from '../db/client.js';

export const puzzleRouter = express.Router();

// Get all puzzles with pagination
puzzleRouter.get('/', (req, res) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const offset = (page - 1) * limit;
    const sources = req.query.sources as string | undefined;

    let query = `SELECT id, title, author, source, date, difficulty, created_at
       FROM puzzles`;
    let countQuery = 'SELECT COUNT(*) as count FROM puzzles';
    const queryParams: any[] = [];
    const countParams: any[] = [];

    // Add source filter if provided
    if (sources) {
      const sourceArray = sources.split(',');
      const placeholders = sourceArray.map(() => '?').join(',');
      query += ` WHERE source IN (${placeholders})`;
      countQuery += ` WHERE source IN (${placeholders})`;
      queryParams.push(...sourceArray);
      countParams.push(...sourceArray);
    }

    query += ` ORDER BY date DESC LIMIT ? OFFSET ?`;
    queryParams.push(limit, offset);

    const puzzles = db.prepare(query).all(...queryParams);
    const countResult = db.prepare(countQuery).get(...countParams) as { count: number };
    const total = countResult.count;

    res.json({
      puzzles,
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
puzzleRouter.get('/:id', (req, res) => {
  try {
    const { id } = req.params;
    const puzzle = db.prepare('SELECT * FROM puzzles WHERE id = ?').get(id);

    if (!puzzle) {
      return res.status(404).json({ error: 'Puzzle not found' });
    }

    // Parse JSON strings back to objects
    const result = {
      ...puzzle as any,
      grid_data: JSON.parse((puzzle as any).grid_data),
      clues_across: JSON.parse((puzzle as any).clues_across),
      clues_down: JSON.parse((puzzle as any).clues_down),
    };

    res.json(result);
  } catch (error) {
    console.error('Error fetching puzzle:', error);
    res.status(500).json({ error: 'Failed to fetch puzzle' });
  }
});

// Get today's puzzle
puzzleRouter.get('/daily/today', (req, res) => {
  try {
    const puzzle = db.prepare(`
      SELECT * FROM puzzles
      WHERE date >= date('now', '-1 day')
      ORDER BY date DESC, created_at DESC
      LIMIT 1
    `).get();

    if (!puzzle) {
      return res.status(404).json({ error: 'No puzzle available for today' });
    }

    // Parse JSON strings
    const result = {
      ...puzzle as any,
      grid_data: JSON.parse((puzzle as any).grid_data),
      clues_across: JSON.parse((puzzle as any).clues_across),
      clues_down: JSON.parse((puzzle as any).clues_down),
    };

    res.json(result);
  } catch (error) {
    console.error('Error fetching daily puzzle:', error);
    res.status(500).json({ error: 'Failed to fetch daily puzzle' });
  }
});

// Save user progress
puzzleRouter.post('/:id/progress', (req, res) => {
  try {
    const { id } = req.params;
    const { userId = 'anonymous', progressData, completed, timeSpent } = req.body;

    const stmt = db.prepare(`
      INSERT INTO user_progress (puzzle_id, user_id, progress_data, completed, time_spent)
      VALUES (?, ?, ?, ?, ?)
      ON CONFLICT (puzzle_id, user_id)
      DO UPDATE SET
        progress_data = excluded.progress_data,
        completed = excluded.completed,
        time_spent = excluded.time_spent,
        last_updated = datetime('now')
    `);

    stmt.run(id, userId, JSON.stringify(progressData), completed ? 1 : 0, timeSpent);

    res.json({ success: true });
  } catch (error) {
    console.error('Error saving progress:', error);
    res.status(500).json({ error: 'Failed to save progress' });
  }
});

// Get user's current puzzle (in progress or latest)
puzzleRouter.get('/current/:userId', (req, res) => {
  try {
    const { userId } = req.params;

    // First, check if there's an incomplete puzzle
    const inProgress = db.prepare(`
      SELECT p.*, up.progress_data, up.completed, up.time_spent, up.last_updated
      FROM puzzles p
      JOIN user_progress up ON p.id = up.puzzle_id
      WHERE up.user_id = ? AND up.completed = 0
      ORDER BY up.last_updated DESC
      LIMIT 1
    `).get(userId);

    if (inProgress) {
      const result = {
        ...inProgress as any,
        grid_data: JSON.parse((inProgress as any).grid_data),
        clues_across: JSON.parse((inProgress as any).clues_across),
        clues_down: JSON.parse((inProgress as any).clues_down),
        progress_data: JSON.parse((inProgress as any).progress_data),
      };
      return res.json(result);
    }

    // If no incomplete puzzle, return the latest puzzle
    const latest = db.prepare(`
      SELECT * FROM puzzles
      WHERE date >= date('now', '-1 day')
      ORDER BY date DESC, created_at DESC
      LIMIT 1
    `).get();

    if (!latest) {
      return res.status(404).json({ error: 'No puzzle available' });
    }

    const result = {
      ...latest as any,
      grid_data: JSON.parse((latest as any).grid_data),
      clues_across: JSON.parse((latest as any).clues_across),
      clues_down: JSON.parse((latest as any).clues_down),
    };

    res.json(result);
  } catch (error) {
    console.error('Error fetching current puzzle:', error);
    res.status(500).json({ error: 'Failed to fetch current puzzle' });
  }
});

// Get user progress for a specific puzzle
puzzleRouter.get('/:id/progress/:userId', (req, res) => {
  try {
    const { id, userId } = req.params;

    const progress = db.prepare(`
      SELECT * FROM user_progress
      WHERE puzzle_id = ? AND user_id = ?
    `).get(id, userId);

    if (!progress) {
      return res.json(null);
    }

    // Parse JSON
    const result = {
      ...progress as any,
      progress_data: JSON.parse((progress as any).progress_data),
    };

    res.json(result);
  } catch (error) {
    console.error('Error fetching user progress:', error);
    res.status(500).json({ error: 'Failed to fetch user progress' });
  }
});

// Get all user progress
puzzleRouter.get('/progress/:userId', (req, res) => {
  try {
    const { userId } = req.params;

    const progressList = db.prepare(`
      SELECT up.*, p.title, p.author, p.source, p.date
      FROM user_progress up
      JOIN puzzles p ON up.puzzle_id = p.id
      WHERE up.user_id = ?
      ORDER BY up.last_updated DESC
    `).all(userId);

    // Parse JSON fields
    const results = progressList.map((item: any) => ({
      ...item,
      progress_data: JSON.parse(item.progress_data),
    }));

    res.json(results);
  } catch (error) {
    console.error('Error fetching user progress:', error);
    res.status(500).json({ error: 'Failed to fetch user progress' });
  }
});

// Get previous puzzle
puzzleRouter.get('/:id/previous', (req, res) => {
  try {
    const { id } = req.params;
    
    // Get current puzzle's date
    const current = db.prepare('SELECT date FROM puzzles WHERE id = ?').get(id) as { date: string } | undefined;
    
    if (!current) {
      return res.status(404).json({ error: 'Puzzle not found' });
    }
    
    const currentDate = current.date;
    
    // Get the most recent puzzle before this date
    const previous = db.prepare(`
      SELECT id FROM puzzles
      WHERE date < ?
      ORDER BY date DESC, id DESC
      LIMIT 1
    `).get(currentDate);
    
    if (!previous) {
      return res.status(404).json({ error: 'No previous puzzle' });
    }
    
    res.json(previous);
  } catch (error) {
    console.error('Error fetching previous puzzle:', error);
    res.status(500).json({ error: 'Failed to fetch previous puzzle' });
  }
});

// Get next puzzle
puzzleRouter.get('/:id/next', (req, res) => {
  try {
    const { id } = req.params;
    
    // Get current puzzle's date
    const current = db.prepare('SELECT date FROM puzzles WHERE id = ?').get(id) as { date: string } | undefined;
    
    if (!current) {
      return res.status(404).json({ error: 'Puzzle not found' });
    }
    
    const currentDate = current.date;
    
    // Get the earliest puzzle after this date
    const next = db.prepare(`
      SELECT id FROM puzzles
      WHERE date > ?
      ORDER BY date ASC, id ASC
      LIMIT 1
    `).get(currentDate);
    
    if (!next) {
      return res.status(404).json({ error: 'No next puzzle' });
    }
    
    res.json(next);
  } catch (error) {
    console.error('Error fetching next puzzle:', error);
    res.status(500).json({ error: 'Failed to fetch next puzzle' });
  }
});
