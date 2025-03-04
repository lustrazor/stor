FROM node:18-alpine AS base

# Install dependencies only when needed
FROM base AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app

# Install dependencies
COPY package.json package-lock.json* ./
RUN npm ci

# Rebuild the source code only when needed
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Create uploads directory in builder stage
RUN mkdir -p /app/public/uploads

# Next.js collects anonymous telemetry data about general usage
ENV NEXT_TELEMETRY_DISABLED 1

RUN npm run build

# Production image, copy all the files and run next
FROM base AS runner
WORKDIR /app

ENV NODE_ENV production
ENV NEXT_TELEMETRY_DISABLED 1
# Enable more verbose logging
ENV NODE_OPTIONS='--trace-warnings'
ENV NODE_DEBUG='http,net,stream,fs'

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Create necessary directories and logs directory
RUN mkdir -p /app/public/uploads /app/logs && \
    chown -R nextjs:nodejs /app && \
    chmod -R 755 /app/public/uploads

# Copy public directory and other files
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static

USER nextjs

EXPOSE 3000

ENV PORT 3000
ENV HOSTNAME "0.0.0.0"

# Start with logging enabled
CMD ["sh", "-c", "node server.js 2>&1 | tee -a /app/logs/app.log"] 