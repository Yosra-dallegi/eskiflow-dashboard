# ──────────────────────────────────────────────
# Stage 1 — Build (Vite frontend + compile server)
# ──────────────────────────────────────────────
FROM node:22-alpine AS builder

WORKDIR /app

# Install dependencies first (better layer caching)
COPY package*.json ./
RUN npm install

# Copy source files
COPY . .

# Build Vite frontend → dist/
RUN npm run build

# Compile server.ts → server.js using esbuild (already in devDependencies)
RUN npx esbuild server.ts \
      --bundle \
      --platform=node \
      --packages=external \
      --format=esm \
      --outfile=server.compiled.js

# ──────────────────────────────────────────────
# Stage 2 — Production image (lean)
# ──────────────────────────────────────────────
FROM node:22-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production

# Only install production dependencies
COPY package*.json ./
RUN npm install --omit=dev

# Copy built assets from builder stage
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/server.compiled.js ./server.js
COPY --from=builder /app/public ./public

EXPOSE 3000

CMD ["node", "server.js"]
