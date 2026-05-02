import axios from 'axios';
import * as cheerio from 'cheerio';

const date = new Date();
const year = date.getFullYear().toString();
const month = (date.getMonth() + 1).toString().padStart(2, '0');
const day = date.getDate().toString().padStart(2, '0');

// LA Times format: YYMMDD
const latYear = year.slice(-2);
const latId = `tca${latYear}${month}${day}`;
const latUrl = `https://cdn3.amuselabs.com/lat/date-picker?set=lat&embed=1&id=${latId}`;

console.log('Fetching:', latUrl);

async function test() {
  try {
    const response = await axios.get(latUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36',
        'Accept': 'text/html',
      },
      timeout: 30000,
    });
    
    console.log('Status:', response.status);
    console.log('Response length:', response.data.length);
    console.log('\n--- First 2000 chars ---');
    console.log(response.data.substring(0, 2000));
    console.log('\n--- Looking for rawc ---');
    
    const rawcIndex = response.data.indexOf('rawc');
    if (rawcIndex !== -1) {
      console.log('Found "rawc" at position:', rawcIndex);
      console.log('Context:', response.data.substring(rawcIndex - 50, rawcIndex + 200));
    } else {
      console.log('Did not find "rawc" in response');
    }
    
    // Look for window
    const windowIndex = response.data.indexOf('window.');
    if (windowIndex !== -1) {
      console.log('\n--- First window. occurrence ---');
      console.log(response.data.substring(windowIndex, windowIndex + 200));
    }
    
  } catch (error) {
    console.error('Error:', error.message);
    if (error.response) {
      console.error('Status:', error.response.status);
      console.error('Data:', error.response.data);
    }
  }
}

test();
