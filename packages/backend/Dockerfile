FROM node:25-alpine

WORKDIR /app

# Copy root package files
COPY package*.json ./
COPY packages/backend/package*.json ./packages/backend/

# Install dependencies
RUN npm install --workspace=backend

# Copy backend source
COPY packages/backend ./packages/backend

# Build
RUN npm run build --workspace=backend

EXPOSE 3001

CMD ["npm", "run", "start", "--workspace=backend"]
