FROM node:20-alpine

WORKDIR /app

# Copy workspace configuration
COPY package*.json ./

# Copy backend package
COPY packages/backend/package*.json ./packages/backend/
COPY packages/backend/tsconfig.json ./packages/backend/

# Install dependencies
RUN npm install --workspace=backend

# Copy backend source code
COPY packages/backend/src ./packages/backend/src

# Build TypeScript
RUN npm run build --workspace=backend

EXPOSE 3001

WORKDIR /app/packages/backend

CMD ["npm", "run", "dev", "--workspace=backend"]
