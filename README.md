# Crossword App

Self-hosted crossword puzzle application with daily puzzle scraping.

## Architecture

- **Frontend**: React + Vite + @guardian/react-crossword
- **Backend**: Node.js + Express + TypeScript
- **Scraper**: Node.js + TypeScript + xword-dl
- **Database**: PostgreSQL

## Features

- Daily automatic puzzle downloads from various sources
- Puzzle archive with search and filtering
- Clean crossword playing interface
- Progress tracking and timer
- Mobile-responsive design

## Quick Start

```bash
# Install dependencies
npm install

# Start all services with Docker
npm run docker:up

# Access the app
# Frontend: http://localhost:3000
# Backend API: http://localhost:3001
```

## Development

```bash
# Run services individually
npm run dev:frontend
npm run dev:backend
npm run dev:scraper
```

## Environment Variables

Create `.env` files in each package directory:

### Backend (.env)
```
DATABASE_URL=postgresql://crossword:crossword_dev@localhost:5432/crossword
PORT=3001
```

### Scraper (.env)
```
DATABASE_URL=postgresql://crossword:crossword_dev@localhost:5432/crossword
SCRAPE_SCHEDULE=0 6 * * *
```

## Puzzle Sources

The scraper supports multiple sources via xword-dl:
- Wall Street Journal
- USA Today
- Universal Crossword
- And many more...
