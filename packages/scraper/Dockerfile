FROM python:3.11-slim

# Install Node.js
RUN apt-get update && apt-get install -y curl && \
    curl -fsSL https://deb.nodesource.com/setup_20.x | bash - && \
    apt-get install -y nodejs && \
    rm -rf /var/lib/apt/lists/*

# Install xword-dl
RUN pip install --no-cache-dir xword-dl

WORKDIR /app

# Copy root package files
COPY package*.json ./
COPY packages/scraper/package*.json ./packages/scraper/

# Install dependencies
RUN npm install --workspace=scraper

# Copy scraper source
COPY packages/scraper ./packages/scraper

# Build
RUN npm run build --workspace=scraper

# Create puzzle directory
RUN mkdir -p /tmp/puzzles

CMD ["npm", "run", "start", "--workspace=scraper"]
