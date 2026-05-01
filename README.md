# Crossword App

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![GitHub stars](https://img.shields.io/github/stars/slmingol/crossword-catastrophe?style=social)](https://github.com/slmingol/crossword-catastrophe/stargazers)
[![GitHub issues](https://img.shields.io/github/issues/slmingol/crossword-catastrophe)](https://github.com/slmingol/crossword-catastrophe/issues)
[![Docker](https://img.shields.io/badge/Docker-Ready-blue?logo=docker)](https://www.docker.com/)
[![Node.js](https://img.shields.io/badge/Node.js-20+-green?logo=node.js)](https://nodejs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.4+-blue?logo=typescript)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-18+-61DAFB?logo=react)](https://reactjs.org/)

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
