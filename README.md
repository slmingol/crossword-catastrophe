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
- 📚 **990+ puzzles** dating back to August 2025
- 🔄 **Daily automatic scraping** from 4 major sources
- 🎨 **Animated splash screen** with logo transition
- 🔍 **Source filtering** with visual badges (LA Times, Newsday, USA Today, Universal)
- 💾 **Auto-save progress** every 30 seconds
- ⏱️ **Built-in timer** and completion tracking
- 📱 **Mobile-responsive** design
- 🏠 **Self-hosted** - your data stays with you

## 🏗️ Architecture

- **Frontend**: React 18 + TypeScript + Vite
- **Backend**: Express + TypeScript
- **Scraper**: Node.js + Python (xword-dl)
- **Database**: SQLite 3 with WAL mode

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
- **USA Today** - Daily crosswords
- **Universal Crossword** - Daily syndicated puzzles

All puzzles are downloaded via [xword-dl](https://github.com/thisisparker/xword-dl), which handles authentication and format conversion.

## 📂 Data Storage

All puzzle data is stored in a single SQLite database file (`data/crossword.db`). This makes backups simple - just copy the file. The database uses WAL mode for better concurrent access during scraper runs.

## 🎮 How to Use

1. Open http://localhost:3000
2. Browse the puzzle archive or click a date badge
3. Filter by source using the colored badges at the top
4. Click any puzzle to start playing
5. Use keyboard or mouse to fill in answers
6. Click **Check** to validate your answers
7. Click **Show** to reveal the solution
8. Progress auto-saves every 30 seconds

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
