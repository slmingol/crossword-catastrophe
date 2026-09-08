# Crossword App Development Guide

## Project Structure

```
crossword-catastrophe/
├── packages/
│   ├── backend/          # Express API server
│   │   ├── src/
│   │   │   ├── index.ts       # Server entry point
│   │   │   ├── db/            # SQLite client and migrations
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
├── xword-dl/             # Vendored xword-dl fork (Seattle Times Midi support)
├── docker-compose.yml
└── package.json
```

## Architecture

### Backend
- **Framework**: Express 5 + TypeScript 6
- **Database**: SQLite via better-sqlite3
- **API Endpoints**:
  - `GET /api/puzzles` — List puzzles with pagination
  - `GET /api/puzzles/:id` — Get puzzle details
  - `GET /api/puzzles/daily/today` — Get today's puzzle
  - `POST /api/puzzles/:id/progress` — Save user progress
  - `GET /api/puzzles/:id/progress/:userId` — Get user progress
  - `GET /api/puzzles/:id/previous` / `/next` — Navigate puzzles

### Frontend
- **Framework**: React 19 + Vite 8
- **Crossword Component**: @guardian/react-crossword
- **Routing**: React Router v7
- **Pages**:
  - Home — Today's puzzle
  - Archive — Browse all puzzles
  - PuzzlePlay — Play a specific puzzle

### Scraper
- **Tool**: xword-dl (Python CLI, vendored fork at `xword-dl/`)
- **Schedule**: Daily at 6 AM (configurable via `SCRAPE_SCHEDULE`)
- **Sources**: USA Today, Universal Crossword, LA Times, Newsday, Seattle Times Midi
- **Format**: Parses .puz (Across Lite) files into SQLite

## Development

### Prerequisites
- Node.js 25+
- Docker & Docker Compose (or Podman + docker-compose)
- Python 3.14+ with xword-dl for local scraper testing (optional)

### Quick Start (Docker)

```bash
chmod +x setup.sh
./setup.sh
open http://localhost:3000
```

### Development Mode (local, no Docker)

```bash
# One-time setup
chmod +x dev.sh
./dev.sh

# Then in separate terminals:
npm run dev:backend    # Terminal 1 — http://localhost:3001
npm run dev:frontend   # Terminal 2 — http://localhost:3000
npm run dev:scraper    # Terminal 3 (optional)
```

## Database Schema

### puzzles
| Column | Type | Notes |
|--------|------|-------|
| `id` | INTEGER PK | Auto-increment |
| `title` | VARCHAR(255) | Puzzle title |
| `author` | VARCHAR(255) | Puzzle creator |
| `source` | VARCHAR(100) | Publication name |
| `date` | DATE | Publication date (unique per source) |
| `difficulty` | VARCHAR(50) | Optional |
| `grid_data` | TEXT | JSON: grid dimensions and cell data |
| `clues_across` | TEXT | JSON: across clues |
| `clues_down` | TEXT | JSON: down clues |

### user_progress
| Column | Type | Notes |
|--------|------|-------|
| `id` | INTEGER PK | Auto-increment |
| `puzzle_id` | INTEGER FK | References puzzles |
| `user_id` | VARCHAR(100) | Default: "anonymous" |
| `progress_data` | TEXT | JSON: current puzzle state |
| `completed` | BOOLEAN | |
| `time_spent` | INTEGER | Seconds |

## Configuration

### Environment Variables

**Backend** (`packages/backend/.env`):
```env
PORT=3001
DATABASE_PATH=./data/crossword.db
```

**Scraper** (`packages/scraper/.env`):
```env
DATABASE_PATH=./data/crossword.db
SCRAPE_SCHEDULE=0 6 * * *
```

## Adding Puzzle Sources

Edit `packages/scraper/src/scrape.ts` and add to `PUZZLE_SOURCES`:

```typescript
const PUZZLE_SOURCES = [
  { name: 'usa', display: 'USA Today' },
  { name: 'uni', display: 'Universal Crossword' },
  { name: 'lat', display: 'Los Angeles Times' },
  { name: 'nd',  display: 'Newsday' },
  { name: 'stm', display: 'Seattle Times Midi' },
  { name: 'your-source', display: 'Your Source Name' },
];
```

Check available sources: `xword-dl --help`

## Manual Scraping

```bash
# Inside Docker
docker-compose exec scraper node dist/index.js

# Locally
cd packages/scraper && npm run scrape
```

## Smoke Testing

```bash
# With stack running via docker-compose
chmod +x test.sh
./test.sh
```

## Troubleshooting

### No puzzles showing up
- Check scraper logs: `docker-compose logs scraper`
- Verify xword-dl is installed: `docker-compose exec scraper xword-dl --version`
- Some sources may be unavailable on certain dates

### Frontend can't reach backend
- Check nginx proxy config: `packages/frontend/nginx.conf`
- Verify backend is running: `curl http://localhost:3001/health`
- In dev mode, the Vite proxy in `vite.config.ts` forwards `/api` to `localhost:3001`

### SQLite database issues
- Database file lives at the path set in `DATABASE_PATH`
- Docker volume: `puzzle_data` (see `docker-compose.yml`)
- Tables are created automatically on backend startup

## Production Deployment

1. Use `docker-compose.prod.yml` with pre-built GHCR images
2. Set `NODE_ENV=production`
3. Mount a persistent volume for the SQLite database
4. Configure proper CORS origins in `packages/backend/src/index.ts`
5. Set up SSL/TLS termination in front of nginx

## Future Enhancements

- User authentication and accounts
- Social features (leaderboards, sharing)
- Mobile app (React Native)
- Puzzle difficulty ratings
- Hints and reveal features
- Collaborative solving
- Statistics and analytics
