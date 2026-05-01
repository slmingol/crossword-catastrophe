import cron from 'node-cron';
import { scrapePuzzles } from './scrape.js';
import dotenv from 'dotenv';

dotenv.config();

const SCRAPE_SCHEDULE = process.env.SCRAPE_SCHEDULE || '0 6 * * *'; // 6 AM daily

console.log('Crossword scraper service started');
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
