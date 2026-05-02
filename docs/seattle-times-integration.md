# Seattle Times Midi Crossword Integration

## Overview

Added support for Seattle Times Midi crosswords - smaller puzzles (9x9 to 11x11) with 30-44 clues, perfect for mobile devices.

## What Changed

### 1. xword-dl Fork with Seattle Times Support

Created a fork of xword-dl with Seattle Times Midi downloader:
- Location: `~/dev/projects/xword-dl`
- Branch: `feature/seattle-times-midi`
- Command: `stm` (Seattle Times Midi)

**Key Features:**
- Uses AmuseLabs infrastructure (same as LA Times, Newsday)
- Supports `--latest` and `--date` flags
- Puzzle sizes: 9x9 (30 clues), 10x10 (36-38 clues), 11x11 (42-44 clues)
- Much smaller than standard 15x15 (70-80 clues)

**Verified API Endpoints:**
- Picker: `https://seattletimes.amuselabs.com/puzzleme/date-picker?set=seattletimes-crossword-midi`
- Crossword: `https://seattletimes.amuselabs.com/puzzleme/crossword?id={puzzle_id}&set=seattletimes-crossword-midi`

**Puzzle ID Format:**
- Sequential numbering: `midi-crossword-111`, `midi-crossword-110`, etc.
- Not date-based, requires date lookup via picker API

### 2. Scraper Integration

Updated scraper to include Seattle Times Midi:

**Changes:**
- Added `stm` to `PUZZLE_SOURCES` array
- Updated `Dockerfile` to use xword-dl fork
- Copy xword-dl source into Docker build context

**Files Modified:**
- `packages/scraper/src/scrape.ts` - Added Seattle Times Midi to sources
- `packages/scraper/Dockerfile` - Install from local xword-dl fork
- `.gitignore` - Exclude xword-dl directory

### 3. Puzzle Characteristics

**Size Comparison:**

| Source | Grid Size | Clues | Notes |
|--------|-----------|-------|-------|
| USA Today | 15×15 | 70-80 | Standard |
| Universal | 15×15 | 70-80 | Standard |
| LA Times | 15×15 | 70-80 | Standard |
| Newsday | 15×15 | 70-80 | Standard |
| **Seattle Times Midi** | **9×9 to 11×11** | **30-44** | **NEW - Mobile optimized!** |

### 4. Database Impact

Seattle Times Midi puzzles will be stored with:
- Source: `"Seattle Times Midi"`
- Grid sizes: 9×9, 10×10, or 11×11
- Significantly fewer clues than standard puzzles

## Testing

### Local Testing (xword-dl fork)

```bash
cd ~/dev/projects/xword-dl
source .venv/bin/activate

# Test latest puzzle
xword-dl stm --latest -o /tmp/test.puz

# Test specific date
xword-dl stm --date "May 1, 2026" -o /tmp/test-date.puz

# Verify puzzle
python3 -c "import puz; p = puz.read('/tmp/test.puz'); print(f'{p.title} - {p.width}x{p.height} - {len(p.clues)} clues')"
```

**Test Results:**
- ✅ Latest puzzle downloads successfully
- ✅ Date-based lookup works
- ✅ Puzzle sizes: 9×9 (30 clues), 10×10 (36 clues), 11×11 (42 clues)

### Docker Testing

```bash
cd ~/dev/projects/crossword-catastrophe

# Build scraper with xword-dl fork
docker-compose build scraper

# Test Seattle Times Midi command
docker-compose run --rm scraper xword-dl stm --latest -o /tmp/test.puz
```

**Test Result:** ✅ Works in Docker container

## Deployment

### Prerequisites

1. **Fork xword-dl to your GitHub account:**
   - Go to https://github.com/thisisparker/xword-dl
   - Click "Fork" button
   - Fork to slmingol/xword-dl

2. **Push the feature branch:**
   ```bash
   cd ~/dev/projects/xword-dl
   git remote add slmingol git@github.com:slmingol/xword-dl.git
   git push slmingol feature/seattle-times-midi
   ```

   Or use the helper script:
   ```bash
   cd ~/dev/projects/crossword-catastrophe
   ./scripts/setup-seattle-times.sh
   ```

### Build & Deploy

The scraper Dockerfile now installs xword-dl directly from your GitHub fork:
```dockerfile
RUN pip install --no-cache-dir git+https://github.com/slmingol/xword-dl.git@feature/seattle-times-midi
```

No need to copy files - Docker pulls directly from GitHub!

```bash
# Rebuild scraper service
docker-compose build scraper

# Restart services
docker-compose up -d

# Monitor logs
docker-compose logs -f scraper
```

### Scraping Schedule

Seattle Times Midi puzzles will be scraped automatically:
- **Daily:** 6 AM (configured in `SCRAPE_SCHEDULE` env var)
- **On startup:** Immediate scrape when container starts
- **Historical:** Can scrape past puzzles using date ranges

## Maintenance

### Updating xword-dl Fork

When changes are made to the fork:

```bash
cd ~/dev/projects/xword-dl
git commit -am "Update description"
git push slmingol feature/seattle-times-midi

cd ~/dev/projects/crossword-catastrophe
docker-compose build scraper
docker-compose up -d scraper
```

Docker will automatically pull the latest changes from GitHub during build.

### Contributing Back to Upstream

The Seattle Times Midi downloader can be contributed back to the main xword-dl project:

1. Push fork to GitHub (if not already done)
2. Create PR to https://github.com/thisisparker/xword-dl
3. Include test results and documentation
4. Once merged, update Dockerfile to use upstream repo

## Troubleshooting

### Issue: "No puzzle found for date"

Seattle Times Midi has limited archive depth (~14 days based on observed data). Use recent dates only.

### Issue: Docker build fails pulling from GitHub

Ensure the feature branch has been pushed to your fork:

```bash
cd ~/dev/projects/xword-dl
git push slmingol feature/seattle-times-midi
```

Verify it's accessible at: https://github.com/slmingol/xword-dl/tree/feature/seattle-times-midi

### Issue: "Command not found: xword-dl"

The scraper container needs to be rebuilt after updating the fork:

```bash
docker-compose build scraper
```

## Benefits for Users

1. **Smaller Puzzles:** 9×9 to 11×11 grids vs standard 15×15
2. **Fewer Clues:** 30-44 clues vs 70-80 clues
3. **Mobile Friendly:** Easier to solve on small screens
4. **Variety:** Different difficulty level and solving experience
5. **Daily Fresh Content:** New puzzle every day

## Success Metrics

- ✅ xword-dl fork created and tested
- ✅ Seattle Times Midi downloader implemented
- ✅ API URLs verified and working
- ✅ Docker integration complete
- ✅ Scraper configured to include new source
- ✅ End-to-end testing successful

## Next Steps

1. **Deploy to production** - Copy xword-dl and rebuild containers
2. **Monitor first scrape** - Verify puzzles are saved correctly
3. **User feedback** - Announce new puzzle source to users
4. **Upstream PR** - Contribute back to xword-dl project
5. **Documentation** - Update user-facing docs with new source

## Files Reference

**xword-dl fork:**
- GitHub: https://github.com/slmingol/xword-dl
- Branch: `feature/seattle-times-midi`
- Downloader: `src/xword_dl/downloader/seattletimesdownloader.py`

**crossword-catastrophe:**
- `packages/scraper/src/scrape.ts` - Source configuration
- `packages/scraper/Dockerfile` - Build configuration (installs from GitHub)
- `scripts/setup-seattle-times.sh` - Fork setup helper

## Timeline

- **May 2, 2026:** Implementation completed and tested
- **Next:** Production deployment
