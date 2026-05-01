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

async function scrapeSingleSource(source: string, displayName: string) {
  const today = new Date().toISOString().split('T')[0];
  const outputDir = '/tmp/puzzles';
  const outputFile = path.join(outputDir, `${source}-${today}.puz`);

  try {
    // Download puzzle using xword-dl
    // Note: xword-dl must be installed in the container
    const { stdout, stderr } = await execAsync(
      `xword-dl ${source} --output ${outputFile}`,
      { timeout: 30000 }
    );

    if (stderr && !stderr.includes('Successfully')) {
      console.log(`xword-dl stderr: ${stderr}`);
    }

    // Read and parse the .puz file
    const fileBuffer = await readFile(outputFile);
    const puzzleData = parsePuzFile(fileBuffer);

    // Check if puzzle already exists
    const existing = await db.query(
      'SELECT id FROM puzzles WHERE source = $1 AND date = $2',
      [displayName, today]
    );

    if (existing.rows.length > 0) {
      console.log(`Puzzle from ${displayName} for ${today} already exists, skipping`);
      await unlink(outputFile);
      return;
    }

    // Store in database
    await db.query(
      `INSERT INTO puzzles (title, author, source, date, difficulty, grid_data, clues_across, clues_down)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
      [
        puzzleData.title,
        puzzleData.author,
        displayName,
        today,
        puzzleData.difficulty,
        JSON.stringify(puzzleData.grid),
        JSON.stringify(puzzleData.cluesAcross),
        JSON.stringify(puzzleData.cluesDown),
      ]
    );

    console.log(`Successfully saved ${displayName} puzzle for ${today}`);

    // Clean up
    await unlink(outputFile);
  } catch (error: any) {
    if (error.code === 'ENOENT') {
      throw new Error('xword-dl not found. Make sure it is installed.');
    }
    throw error;
  }
}
