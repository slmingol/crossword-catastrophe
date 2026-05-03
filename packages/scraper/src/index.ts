import cron from 'node-cron';
import { scrapePuzzles } from './scrape.js';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const SCRAPE_SCHEDULE = process.env.SCRAPE_SCHEDULE || '0 6 * * *'; // 6 AM daily

// Read version from package.json
const packageJson = JSON.parse(
  fs.readFileSync(path.join(__dirname, '../package.json'), 'utf-8')
);

console.log(`🔍 Scraper v${packageJson.version} started`);
console.log(`Schedule: ${SCRAPE_SCHEDULE}`);

// Run immediately on startup
console.log('Running initial scrape...');
scrapePuzzles().catch(console.error);

// Schedule daily scraping
cron.schedule(SCRAPE_SCHEDULE, () => {
  console.log('Running scheduled scrape...');
  scrapePuzzles().catch(console.error);
});

// Keep process running
process.on('SIGTERM', () => {
  console.log('Received SIGTERM, shutting down gracefully');
  process.exit(0);
});
