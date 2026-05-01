FROM node:25-alpine

WORKDIR /app

# Copy root package files
COPY package*.json ./
COPY packages/frontend/package*.json ./packages/frontend/

# Install dependencies
RUN npm install --workspace=frontend

# Copy frontend source
COPY packages/frontend ./packages/frontend

EXPOSE 3000

CMD ["npm", "run", "dev", "--workspace=frontend", "--", "--host"]
