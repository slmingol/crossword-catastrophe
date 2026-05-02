import { execSync } from 'child_process';
import axios from 'axios';
import * as cheerio from 'cheerio';
import { writeFileSync, readFileSync, unlinkSync } from 'fs';
import path from 'path';

export interface CustomPuzzle {
  title: string;
  author: string;
  difficulty?: string;
  grid: {
    width: number;
    height: number;
    solution: string[][];
  };
  cluesAcross: Record<string, string>;
  cluesDown: Record<string, string>;
}

// Scrape LA Times from Amuselabs
export async function scrapeLATimes(date: Date): Promise<CustomPuzzle> {
  const dateStr = formatDateForLAT(date);
  const puzzleId = `tca${dateStr}`;
  
  // Try to get puzzle data from Amuselabs API
  const apiUrl = `https://lat.amuselabs.com/lat/crossword?id=${puzzleId}&set=latimes`;
  
  try {
    const response = await axios.get(apiUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
      },
      timeout: 30000,
    });
    
    const $ = cheerio.load(response.data);
    
    // Extract embedded JSON data
    const scriptTags = $('script').toArray();
    let puzzleData: any = null;
    
    for (const script of scriptTags) {
      const content = $(script).html() || '';
      if (content.includes('window.rawc') || content.includes('rawc')) {
        // Extract JSON data
        const match = content.match(/rawc\s*=\s*({[\s\S]*?});/);
        if (match) {
          puzzleData = JSON.parse(match[1]);
          break;
        }
      }
    }
    
    if (!puzzleData) {
      throw new Error('Could not find puzzle data in page');
    }
    
    return parseAmuselabsData(puzzleData);
  } catch (error) {
    throw new Error(`Failed to scrape LA Times: ${error}`);
  }
}

// Scrape Universal Crossword from Amuselabs
export async function scrapeUniversal(date: Date): Promise<CustomPuzzle> {
  const dateStr = formatDateForUniversal(date);
  const puzzleId = `uclick-${dateStr}`;
  
  const apiUrl = `https://amuselabs.com/pmm/crossword?id=${puzzleId}&set=fcx`;
  
  try {
    const response = await axios.get(apiUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
      },
      timeout: 30000,
    });
    
    const $ = cheerio.load(response.data);
    const scriptTags = $('script').toArray();
    let puzzleData: any = null;
    
    for (const script of scriptTags) {
      const content = $(script).html() || '';
      if (content.includes('window.rawc') || content.includes('rawc')) {
        const match = content.match(/rawc\s*=\s*({[\s\S]*?});/);
        if (match) {
          puzzleData = JSON.parse(match[1]);
          break;
        }
      }
    }
    
    if (!puzzleData) {
      throw new Error('Could not find puzzle data in page');
    }
    
    return parseAmuselabsData(puzzleData);
  } catch (error) {
    throw new Error(`Failed to scrape Universal: ${error}`);
  }
}

// Scrape Newsday from Amuselabs
export async function scrapeNewsday(date: Date): Promise<CustomPuzzle> {
  const dateStr = formatDateForNewsday(date);
  const puzzleId = `Creators-${dateStr}`;
  
  const apiUrl = `https://amuselabs.com/pmm/crossword?id=${puzzleId}&set=creatorsweb`;
  
  try {
    const response = await axios.get(apiUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
      },
      timeout: 30000,
    });
    
    const $ = cheerio.load(response.data);
    const scriptTags = $('script').toArray();
    let puzzleData: any = null;
    
    for (const script of scriptTags) {
      const content = $(script).html() || '';
      if (content.includes('window.rawc') || content.includes('rawc')) {
        const match = content.match(/rawc\s*=\s*({[\s\S]*?});/);
        if (match) {
          puzzleData = JSON.parse(match[1]);
          break;
        }
      }
    }
    
    if (!puzzleData) {
      throw new Error('Could not find puzzle data in page');
    }
    
    return parseAmuselabsData(puzzleData);
  } catch (error) {
    throw new Error(`Failed to scrape Newsday: ${error}`);
  }
}

// Parse Amuselabs puzzle data format
function parseAmuselabsData(data: any): CustomPuzzle {
  const width = parseInt(data.w) || parseInt(data.width) || 15;
  const height = parseInt(data.h) || parseInt(data.height) || 15;
  
  // Parse grid - could be in 'box' or 'grid' field
  const gridData = data.box || data.grid || [];
  const solution: string[][] = [];
  
  for (let i = 0; i < height; i++) {
    const row: string[] = [];
    for (let j = 0; j < width; j++) {
      const idx = i * width + j;
      const cell = gridData[idx];
      if (cell === null || cell === 0 || cell === '0') {
        row.push('.');
      } else {
        row.push(cell.toString().toUpperCase());
      }
    }
    solution.push(row);
  }
  
  // Parse clues
  const cluesAcross: Record<string, string> = {};
  const cluesDown: Record<string, string> = {};
  
  const clues = data.clues || data.placedWords || [];
  
  if (Array.isArray(clues)) {
    for (const clue of clues) {
      const number = clue.number || clue.num || clue.n;
      const text = clue.clue || clue.c || '';
      const direction = clue.direction || clue.dir || clue.d;
      
      if (direction === 'across' || direction === 'a' || direction === 'A') {
        cluesAcross[number.toString()] = text;
      } else if (direction === 'down' || direction === 'd' || direction === 'D') {
        cluesDown[number.toString()] = text;
      }
    }
  } else if (typeof clues === 'object') {
    // Alternative format: {across: [...], down: [...]}
    if (clues.across) {
      for (const clue of clues.across) {
        cluesAcross[clue.number.toString()] = clue.clue;
      }
    }
    if (clues.down) {
      for (const clue of clues.down) {
        cluesDown[clue.number.toString()] = clue.clue;
      }
    }
  }
  
  return {
    title: data.title || data.t || 'Crossword Puzzle',
    author: data.author || data.a || data.by || 'Unknown',
    difficulty: data.difficulty || data.diff,
    grid: {
      width,
      height,
      solution,
    },
    cluesAcross,
    cluesDown,
  };
}

// Date formatters for different sources
function formatDateForLAT(date: Date): string {
  const year = date.getFullYear().toString().slice(-2);
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}${month}${day}`;
}

function formatDateForUniversal(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}${month}${day}`;
}

function formatDateForNewsday(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}${month}${day}`;
}
