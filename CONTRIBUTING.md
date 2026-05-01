# Contributing to Crossword App

Thank you for your interest in contributing!

## Development Setup

1. Fork the repository
2. Clone your fork: `git clone <your-fork-url>`
3. Run setup: `./setup.sh`
4. Create a feature branch: `git checkout -b feature/your-feature`

## Code Style

- Use TypeScript for all new code
- Follow existing code patterns
- Use meaningful variable names
- Add comments for complex logic

## Testing

Before submitting a PR:

```bash
# Build all packages
npm run build

# Test the application
./test.sh
```

## Pull Request Process

1. Update README.md with any new features
2. Ensure all services build and run
3. Test the scraper with multiple sources
4. Update DEVELOPMENT.md if adding configuration options

## Adding Puzzle Sources

1. Add source to `packages/scraper/src/scrape.ts`
2. Test with `npm run scrape --workspace=scraper`
3. Verify puzzles appear in the frontend
4. Update documentation

## Reporting Issues

Include:
- OS and Docker version
- Error logs from `docker-compose logs`
- Steps to reproduce
- Expected vs actual behavior

## Feature Requests

Open an issue with:
- Use case description
- Proposed solution
- Any alternative solutions considered
