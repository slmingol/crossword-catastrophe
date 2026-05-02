FROM node:20-alpine

WORKDIR /app

# Copy workspace configuration
COPY package*.json ./

# Copy frontend package
COPY packages/frontend/package*.json ./packages/frontend/
COPY packages/frontend/tsconfig*.json ./packages/frontend/
COPY packages/frontend/vite.config.ts ./packages/frontend/

# Install dependencies
RUN npm install --workspace=frontend

# Copy frontend source
COPY packages/frontend/index.html ./packages/frontend/
COPY packages/frontend/public ./packages/frontend/public
COPY packages/frontend/src ./packages/frontend/src

EXPOSE 3000

# Run dev server (host and HMR configured in vite.config.ts)
CMD ["npm", "run", "dev", "--workspace=frontend"]
