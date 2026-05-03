# Crossword Cat-a-strophe 🐱

<div align="center">
  <img src="packages/frontend/public/logo.png" alt="Crossword Cat-a-strophe Logo" width="300" />
</div>

<div align="center">

[![Build and Push](https://github.com/slmingol/crossword-catastrophe/actions/workflows/build-and-push.yml/badge.svg)](https://github.com/slmingol/crossword-catastrophe/actions/workflows/build-and-push.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![GitHub stars](https://img.shields.io/github/stars/slmingol/crossword-catastrophe?style=social)](https://github.com/slmingol/crossword-catastrophe/stargazers)
[![GitHub issues](https://img.shields.io/github/issues/slmingol/crossword-catastrophe)](https://github.com/slmingol/crossword-catastrophe/issues)
[![Docker](https://img.shields.io/badge/Docker-Ready-blue?logo=docker)](https://www.docker.com/)
[![Node.js](https://img.shields.io/badge/Node.js-20+-green?logo=node.js)](https://nodejs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.4+-blue?logo=typescript)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-18+-61DAFB?logo=react)](https://reactjs.org/)
[![SQLite](https://img.shields.io/badge/SQLite-3+-003B57?logo=sqlite)](https://www.sqlite.org/)

</div>

Self-hosted crossword puzzle application with daily puzzle scraping from multiple sources. Play puzzles in your browser with progress tracking, answer checking, and a searchable archive.

## ✨ Features

- 🎯 **Interactive puzzle grid** with keyboard navigation and answer validation
- 📚 **4100+ puzzles** dating back to February 2026
- 🔄 **Daily automatic scraping** from 5 major sources including Seattle Times Midi
- 🎨 **Animated splash screen** with logo transition
- 🔍 **Source filtering** with visual badges (LA Times, Newsday, Seattle Times, USA Today, Universal)
- 💾 **Auto-save progress** every 30 seconds
- ⏱️ **Built-in timer** and completion tracking
- 📱 **Mobile-optimized** with native keyboard, touch controls, and tabbed clues interface
- 👆 **Touch-friendly buttons** with responsive feedback
- 🔄 **Smart Show/Hide** - reveals solution temporarily without overwriting your progress
- 🏠 **Self-hosted** - your data stays with you

## 🏗️ Architecture

- **Frontend**: React 18 + TypeScript + Vite build served by nginx
- **Backend**: Express + TypeScript
- **Scraper**: Node.js + Python (xword-dl fork with Seattle Times support)
- **Database**: SQLite 3 with WAL mode

## 📱 Mobile Experience

The app is fully optimized for mobile devices:

- **Native keyboard support** - HTML input elements trigger mobile keyboards automatically
- **Responsive grid sizing** - 95% width on mobile, 60% on desktop for optimal viewing
- **Tabbed clues interface** - Switch between ACROSS and DOWN clues with dedicated tabs
- **Touch-optimized buttons** - All interactive elements use touch event handlers
- **Backspace support** - Delete letters naturally using your mobile keyboard
- **Auto-focus management** - Smooth navigation between cells
- **Show/Hide solution** - Temporarily view answers without losing your progress

## 🚀 Quick Start

```bash
# Clone the repository
git clone https://github.com/slmingol/crossword-catastrophe.git
cd crossword-catastrophe

# Start all services with Docker Compose
docker-compose up -d

# Access the app
# Frontend: http://localhost:3000
# Backend API: http://localhost:3001
```

The first time you run it, the scraper will download today's puzzles from all sources.

### Production Deployment

For production deployments using pre-built images from GitHub Container Registry:

```bash
# Create data directory for SQLite database
mkdir -p data

# Configure API URL for your hostname
cp .env.production.example .env
# Edit .env and set API_URL to your server's hostname:
# API_URL=http://your-server.com:9999/api

# Start production services
./scripts/run-prod.sh

# Or use docker compose directly
docker-compose -f docker-compose.prod.yml up -d
```

**Important:** The frontend needs to know where the backend API is. Set the `API_URL` environment variable in `.env` to match your server's hostname. For example:
- Local: `API_URL=http://localhost:9998/api`
- Remote: `API_URL=http://docker-host-01.bub.lan:9998/api`

**Production control script:**
```bash
./scripts/run-prod.sh start   # Start all services
./scripts/run-prod.sh stop    # Stop all services
./scripts/run-prod.sh restart # Restart services
./scripts/run-prod.sh logs    # View logs
./scripts/run-prod.sh status  # Show running services
./scripts/run-prod.sh update  # Pull latest images and restart
```

Access the production app:
- Frontend: http://localhost:9999
- Backend API: http://localhost:9998

The production configuration uses:
- Pre-built multi-platform images (amd64/arm64)
- Production environment settings
- Auto-restart policies
- No source code volume mounts
- Local `./data` directory for SQLite database (easy to backup)

## 🐳 Using Pre-built Container Images

Pre-built multi-platform (amd64/arm64) containers are available from GitHub Container Registry:

```bash
# Pull the latest images
docker pull ghcr.io/slmingol/crossword-catastrophe-backend:latest
docker pull ghcr.io/slmingol/crossword-catastrophe-frontend:latest
docker pull ghcr.io/slmingol/crossword-catastrophe-scraper:latest
```

Or update your `docker-compose.yml` to use the pre-built images instead of building locally.

## 💻 Development

```bash
# Install dependencies
npm install

# Run services individually
npm run dev:frontend  # Frontend on :3000
npm run dev:backend   # Backend on :3001
npm run dev:scraper   # Runs once then exits
```

## ⚙️ Configuration

The application uses environment variables for configuration:

### Backend
```bash
DATABASE_PATH=/app/data/crossword.db  # SQLite database file path
PORT=3001                              # API server port
```

### Scraper
```bash
DATABASE_PATH=/app/data/crossword.db  # SQLite database file path
SCRAPE_SCHEDULE=0 6 * * *             # Cron schedule (6 AM daily)
```

## 📰 Puzzle Sources

Daily puzzles are automatically scraped from:

- **Los Angeles Times** - Daily crosswords
- **Newsday** - Saturday Stumper and daily puzzles
- **Seattle Times Midi** - Historical puzzles dating back to Feb 4, 2026 with ID-based retrieval
- **USA Today** - Daily crosswords
- **Universal Crossword** - Daily syndicated puzzles

All puzzles are downloaded via a custom fork of [xword-dl](https://github.com/slmingol/xword-dl) with Seattle Times Midi support, which handles authentication and format conversion.

## 📂 Data Storage

All puzzle data is stored in a single SQLite database file (`data/crossword.db`). This makes backups simple - just copy the file. The database uses WAL mode for better concurrent access during scraper runs.

### Database Version Control

The repository includes a baseline database with 4100+ puzzles. Each instance can acquire new puzzles via the daily scraper, and you can merge updates back to the repository:

```bash
# After your instance has collected new puzzles, merge them:
./scripts/merge-database.sh

# Review what changed
git diff data/crossword.db

# Commit and push the updated database
git add data/crossword.db
git commit -m "Update puzzle database: +50 new puzzles"
git push
```

**Benefits:**
- ✅ New deployments start with existing puzzle archive
- ✅ Share puzzle collections across instances
- ✅ Version-controlled puzzle history
- ✅ Simple merge tool handles duplicates automatically

**Notes:**
- SQLite databases are binary files (no line-by-line diffs)
- WAL/SHM files are temporary and excluded from git
- The merge script uses `INSERT OR IGNORE` to avoid duplicates
- Always pull latest before merging to avoid conflicts

## 🎮 How to Use

1. Open http://localhost:3000 (or your production URL)
2. Browse the puzzle archive or click a date badge
3. Filter by source using the colored badges at the top
4. Click any puzzle to start playing
5. Use keyboard or tap cells to fill in answers (mobile keyboards appear automatically)
6. Click **Check** to validate your answers
7. Click **Show** to temporarily reveal the solution (clears your grid, click **Hide** to continue)
8. Progress auto-saves every 30 seconds
9. On mobile, use the ACROSS/DOWN tabs to switch between clue lists

## 🔧 Troubleshooting

**Frontend shows no puzzles:**
- Check backend logs: `docker-compose logs backend`
- Verify database exists: `ls -lh data/crossword.db`

**Scraper fails to download:**
- Some sources may block Docker containers
- Check scraper logs: `docker-compose logs scraper`
- Try running scraper outside Docker for testing

**Database locked errors:**
- SQLite uses WAL mode which should prevent this
- If it persists, restart containers: `docker-compose restart`

## 📜 License

MIT License - See [LICENSE](LICENSE) file for details.
