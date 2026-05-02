FROM python:3.11-slim

# Install Node.js and git
RUN apt-get update && apt-get install -y curl git && \
    curl -fsSL https://deb.nodesource.com/setup_20.x | bash - && \
    apt-get install -y nodejs && \
    rm -rf /var/lib/apt/lists/*

# Copy local xword-dl fork with Seattle Times Midi support (feature/seattle-times-midi branch)
COPY xword-dl /tmp/xword-dl

# Install xword-dl from local copy (faster rebuilds than GitHub fetch)
RUN pip install --no-cache-dir /tmp/xword-dl && rm -rf /tmp/xword-dl

WORKDIR /app

# Copy workspace configuration
COPY package*.json ./

# Copy scraper package
COPY packages/scraper/package*.json ./packages/scraper/
COPY packages/scraper/tsconfig.json ./packages/scraper/

# Install dependencies
RUN npm install --workspace=scraper

# Copy scraper source code
COPY packages/scraper/src ./packages/scraper/src

# Build TypeScript
RUN npm run build --workspace=scraper

# Create puzzle directory
RUN mkdir -p /tmp/puzzles

WORKDIR /app/packages/scraper

CMD ["node", "dist/index.js"]
