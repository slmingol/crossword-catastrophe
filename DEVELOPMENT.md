# Crossword App Development Guide

## Project Structure

```
crossword-app/
├── packages/
│   ├── backend/          # Express API server
│   │   ├── src/
│   │   │   ├── index.ts       # Server entry point
│   │   │   ├── db/            # Database client and migrations
│   │   │   └── routes/        # API routes
│   │   └── Dockerfile
│   ├── frontend/         # React + Vite app
│   │   ├── src/
│   │   │   ├── pages/         # Page components
│   │   │   ├── components/    # Reusable components
│   │   │   └── api/           # API client
│   │   └── Dockerfile
│   └── scraper/          # Puzzle scraper service
│       ├── src/
│       │   ├── index.ts       # Cron scheduler
│       │   ├── scrape.ts      # Scraping logic
│       │   └── parser.ts      # .puz file parser
│       └── Dockerfile
├── docker-compose.yml
└── package.json
```

## Architecture

### Backend
- **Framework**: Express + TypeScript
- **Database**: PostgreSQL with pg driver
- **API Endpoints**:
  - `GET /api/puzzles` - List puzzles with pagination
  - `GET /api/puzzles/:id` - Get puzzle details
  - `GET /api/puzzles/daily/today` - Get today's puzzle
  - `POST /api/puzzles/:id/progress` - Save user progress

### Frontend
- **Framework**: React 18 + Vite
- **Crossword Component**: @guardian/react-crossword
- **Routing**: React Router v6
- **Pages**:
  - Home - Shows today's puzzle
  - Archive - Browse all puzzles
  - PuzzlePlay - Play a specific puzzle

### Scraper
- **Tool**: xword-dl (Python CLI)
- **Schedule**: Daily at 6 AM (configurable)
- **Sources**: WSJ, USA Today, Universal Crossword
- **Format**: Parses .puz (Across Lite) files

## Development

### Prerequisites
- Node.js 20+
- Docker & Docker Compose
- (Optional) Python 3.11+ with xword-dl for local testing

### Quick Start

```bash
# Clone/download the project
cd crossword-app

# Run setup script (installs deps, starts Docker, runs migrations)
chmod +x setup.sh
./setup.sh

# Access the app
open http://localhost:3000
```

### Development Mode (without full Docker)

```bash
# Start PostgreSQL only
docker-compose up -d postgres

# In separate terminals:
npm run dev:backend    # Terminal 1
npm run dev:frontend   # Terminal 2
npm run dev:scraper    # Terminal 3 (optional)
```

## Database Schema

### puzzles
- `id` - Primary key
- `title` - Puzzle title
- `author` - Puzzle creator
- `source` - Publication source
- `date` - Publication date (unique per source)
- `difficulty` - Optional difficulty level
- `grid_data` - JSON: grid dimensions and cell data
- `clues_across` - JSON: across clues with answers
- `clues_down` - JSON: down clues with answers

### user_progress
- `id` - Primary key
- `puzzle_id` - Foreign key to puzzles
- `user_id` - User identifier (default: anonymous)
- `progress_data` - JSON: current puzzle state
- `completed` - Boolean completion flag
- `time_spent` - Seconds spent on puzzle

## Configuration

### Environment Variables

**Backend** (`.env`):
```env
DATABASE_URL=postgresql://crossword:crossword_dev@localhost:5432/crossword
PORT=3001
```

**Scraper** (`.env`):
```env
DATABASE_URL=postgresql://crossword:crossword_dev@localhost:5432/crossword
SCRAPE_SCHEDULE=0 6 * * *  # Cron format
```

**Frontend** (`.env`):
```env
VITE_API_URL=http://localhost:3001/api
```

## Adding More Puzzle Sources

Edit `packages/scraper/src/scrape.ts` and add to the `PUZZLE_SOURCES` array:

```typescript
const PUZZLE_SOURCES = [
  { name: 'wsj', display: 'Wall Street Journal' },
  { name: 'usa-today', display: 'USA Today' },
  { name: 'universal', display: 'Universal Crossword' },
  { name: 'your-source', display: 'Your Source Name' },
];
```

Check xword-dl documentation for available sources: `xword-dl --help`

## Manual Scraping

Trigger a scrape manually:

```bash
# Inside Docker
docker-compose exec scraper npm run scrape --workspace=scraper

# Or locally
cd packages/scraper
npm run scrape
```

## Troubleshooting

### No puzzles showing up
- Check scraper logs: `docker-compose logs scraper`
- Verify xword-dl is installed: `docker-compose exec scraper xword-dl --version`
- Some sources may require subscriptions

### Frontend can't connect to backend
- Check CORS settings in `packages/backend/src/index.ts`
- Verify proxy configuration in `packages/frontend/vite.config.ts`
- Ensure backend is running: `curl http://localhost:3001/health`

### Database connection errors
- Confirm PostgreSQL is running: `docker-compose ps postgres`
- Check DATABASE_URL in .env files
- Verify migrations ran: `docker-compose logs backend | grep migration`

## Production Deployment

1. Update environment variables for production
2. Change PostgreSQL credentials
3. Set `NODE_ENV=production`
4. Use proper secrets management
5. Consider adding authentication
6. Set up SSL/TLS for frontend
7. Configure proper CORS origins

## Future Enhancements

- User authentication and accounts
- Social features (leaderboards, sharing)
- Mobile app (React Native)
- Puzzle difficulty ratings
- Hints and reveal letter features
- Collaborative solving
- Custom puzzle uploads
- Statistics and analytics
