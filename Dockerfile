# Stage 1: Build the Expo Web application
FROM node:20-alpine AS builder
WORKDIR /app

# Copy root and workspace dependencies
COPY package*.json ./
COPY mobile/package*.json ./mobile/
COPY backend/package*.json ./backend/

# Install dependencies
RUN npm install
RUN cd mobile && npm install
RUN cd backend && npm install

# Copy source files
COPY mobile/ ./mobile/
COPY backend/ ./backend/

# Build static web frontend
RUN cd mobile && npx expo export -p web

# Stage 2: Production runner
FROM node:20-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV PORT=5000

COPY package*.json ./
COPY backend/package*.json ./backend/
RUN cd backend && npm install --production

COPY backend/ ./backend/
COPY --from=builder /app/mobile/dist ./mobile/dist

EXPOSE 5000

CMD ["node", "backend/src/server.js"]
