FROM python:3.14-slim

# Install Node.js
RUN apt-get update && apt-get install -y curl build-essential && \
    curl -fsSL https://deb.nodesource.com/setup_22.x | bash - && \
    apt-get install -y nodejs && \
    rm -rf /var/lib/apt/lists/*

# Install vendored xword-dl fork (includes SSL fix for USA Today + Seattle Times Midi support)
COPY xword-dl /tmp/xword-dl
RUN SETUPTOOLS_SCM_PRETEND_VERSION=2025.10.14.post1 pip install --no-cache-dir /tmp/xword-dl && rm -rf /tmp/xword-dl

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
