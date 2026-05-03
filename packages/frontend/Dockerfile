FROM node:20-alpine AS builder

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

# Build static files for production
RUN npm run build --workspace=frontend

# Production stage with nginx
FROM nginx:alpine

# Copy built files
COPY --from=builder /app/packages/frontend/dist /usr/share/nginx/html

# Copy nginx config
COPY packages/frontend/nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 3000

CMD ["nginx", "-g", "daemon off;"]
