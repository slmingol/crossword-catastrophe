import { exec } from 'child_process';
import { promisify } from 'util';
import { readFile, unlink } from 'fs/promises';
import path from 'path';
import { db } from './db.js';
import { parsePuzFile } from './parser.js';

const execAsync = promisify(exec);

const PUZZLE_SOURCES = [
  { name: 'usa', display: 'USA Today' },
  { name: 'uni', display: 'Universal Crossword' },
  { name: 'lat', display: 'Los Angeles Times' },
  { name: 'nd', display: 'Newsday' },
];

export async function scrapePuzzles() {
  console.log(`Starting puzzle scrape at ${new Date().toISOString()}`);
  
  for (const source of PUZZLE_SOURCES) {
    try {
      console.log(`Scraping ${source.display}...`);
      await scrapeSingleSource(source.name, source.display);
    } catch (error) {
      console.error(`Failed to scrape ${source.display}:`, error);
    }
  }
  
  console.log('Scrape completed');
}

export async function scrapeHistoricalPuzzles(daysBack: number = 50) {
  console.log(`Starting historical scrape for last ${daysBack} days at ${new Date().toISOString()}`);
  
  for (let i = 1; i <= daysBack; i++) {
    const targetDate = new Date();
    targetDate.setDate(targetDate.getDate() - i);
    const dateStr = targetDate.toISOString().split('T')[0];
    
    console.log(`\nScraping puzzles for ${dateStr} (${i}/${daysBack})...`);
    
    for (const source of PUZZLE_SOURCES) {
      try {
        await scrapeSingleSourceForDate(source.name, source.display, dateStr);
      } catch (error) {
        console.error(`Failed to scrape ${source.display} for ${dateStr}:`, error);
      }
    }
  }
  
  console.log('\nHistorical scrape completed');
}

async function scrapeSingleSource(source: string, displayName: string) {
  const today = new Date().toISOString().split('T')[0];
  return scrapeSingleSourceForDate(source, displayName, today);
}

async function scrapeSingleSourceForDate(source: string, displayName: string, dateStr: string) {
  const outputDir = '/tmp/puzzles';
  const outputFile = path.join(outputDir, `${source}-${dateStr}.puz`);

  try {
    // Check if puzzle already exists before downloading
    const existing = await db.query(
      'SELECT id FROM puzzles WHERE source = $1 AND date = $2',
      [displayName, dateStr]
    );

    if (existing.rows.length > 0) {
      console.log(`Puzzle from ${displayName} for ${dateStr} already exists, skipping`);
      return;
    }

    // Download puzzle using xword-dl with date flag
    const { stdout, stderr } = await execAsync(
      `xword-dl ${source} --date "${dateStr}" --output ${outputFile}`,
      { timeout: 30000 }
    );

    if (stderr && !stderr.includes('Successfully')) {
      console.log(`xword-dl stderr: ${stderr}`);
    }

    // Read and parse the .puz file
    const fileBuffer = await readFile(outputFile);
    const puzzleData = parsePuzFile(fileBuffer);

    // Store in database
    await db.query(
      `INSERT INTO puzzles (title, author, source, date, difficulty, grid_data, clues_across, clues_down)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
      [
        puzzleData.title,
        puzzleData.author,
        displayName,
        dateStr,
        puzzleData.difficulty,
        JSON.stringify(puzzleData.grid),
        JSON.stringify(puzzleData.cluesAcross),
        JSON.stringify(puzzleData.cluesDown),
      ]
    );

    console.log(`Successfully saved ${displayName} puzzle for ${dateStr}`);

    // Clean up
    await unlink(outputFile);
  } catch (error: any) {
    if (error.code === 'ENOENT') {
      throw new Error('xword-dl not found. Make sure it is installed.');
    }
    throw error;
  }
}
