const API_URL = import.meta.env.VITE_API_URL || '/api';

export interface Puzzle {
  id: number;
  title: string;
  author: string;
  source: string;
  date: string;
  difficulty?: string;
  grid_data?: any;
  clues_across?: any;
  clues_down?: any;
}

export interface PuzzleListResponse {
  puzzles: Puzzle[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

export interface UserProgress {
  id: number;
  puzzle_id: number;
  user_id: string;
  progress_data: any;
  completed: boolean;
  time_spent: number;
  last_updated: string;
  title?: string;
  author?: string;
  source?: string;
  date?: string;
}

export const api = {
  async getPuzzles(page = 1, limit = 20): Promise<PuzzleListResponse> {
    const response = await fetch(`${API_URL}/puzzles?page=${page}&limit=${limit}`);
    if (!response.ok) throw new Error('Failed to fetch puzzles');
    return response.json();
  },

  async getPuzzle(id: number): Promise<Puzzle> {
    const response = await fetch(`${API_URL}/puzzles/${id}`);
    if (!response.ok) throw new Error('Failed to fetch puzzle');
    return response.json();
  },

  async getTodaysPuzzle(): Promise<Puzzle> {
    const response = await fetch(`${API_URL}/puzzles/daily/today`);
    if (!response.ok) throw new Error('No puzzle available for today');
    return response.json();
  },

  async getCurrentPuzzle(userId: string = 'anonymous'): Promise<Puzzle> {
    const response = await fetch(`${API_URL}/puzzles/current/${userId}`);
    if (!response.ok) throw new Error('Failed to fetch current puzzle');
    return response.json();
  },

  async getUserProgress(userId: string = 'anonymous'): Promise<UserProgress[]> {
    const response = await fetch(`${API_URL}/puzzles/progress/${userId}`);
    if (!response.ok) throw new Error('Failed to fetch user progress');
    return response.json();
  },

  async getPuzzleProgress(puzzleId: number, userId: string = 'anonymous'): Promise<UserProgress | null> {
    const response = await fetch(`${API_URL}/puzzles/${puzzleId}/progress/${userId}`);
    if (!response.ok) throw new Error('Failed to fetch puzzle progress');
    return response.json();
  },

  async saveProgress(
    puzzleId: number,
    progressData: any,
    completed: boolean,
    timeSpent: number,
    userId: string = 'anonymous'
  ) {
    const response = await fetch(`${API_URL}/puzzles/${puzzleId}/progress`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        userId,
        progressData,
        completed,
        timeSpent,
      }),
    });
    if (!response.ok) throw new Error('Failed to save progress');
    return response.json();
  },
};
