FROM node:22-slim AS builder

WORKDIR /app

# Install dependencies with legacy-peer-deps (required for React 19 peer resolution)
COPY package*.json ./
RUN npm install --legacy-peer-deps

# Copy source files
COPY . .

# Build Vite frontend → dist/
RUN npm run build

# Production runner image
FROM node:22-slim AS runner

WORKDIR /app

ENV NODE_ENV=production

# Install only production dependencies
COPY package*.json ./
RUN npm install --omit=dev --legacy-peer-deps

# Copy built frontend, pre-compiled server, and public assets
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/server.js ./server.js
COPY --from=builder /app/public ./public

EXPOSE 3000

CMD ["node", "server.js"]
