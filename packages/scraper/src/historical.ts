import { scrapeHistoricalPuzzles } from './scrape.js';
import dotenv from 'dotenv';

dotenv.config();

const daysBack = parseInt(process.env.DAYS_BACK || '50');

console.log(`Starting historical scrape for last ${daysBack} days...`);

scrapeHistoricalPuzzles(daysBack)
  .then(() => {
    console.log('Historical scrape completed successfully');
    process.exit(0);
  })
  .catch(error => {
    console.error('Historical scrape failed:', error);
    process.exit(1);
  });
