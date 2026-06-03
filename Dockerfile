ARG NODE_IMAGE=node:22-alpine

# ── Build stage ────────────────────────────────────────────────────────────────
FROM ${NODE_IMAGE} AS builder

RUN apk update && apk upgrade --no-cache && rm -rf /var/cache/apk/*

WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci

COPY . .

# Seed the DB so the standalone image ships with initial data
RUN npm run db:seed 2>/dev/null || true

ENV NEXT_TELEMETRY_DISABLED=1
RUN npm run build

# ── Production stage ───────────────────────────────────────────────────────────
FROM ${NODE_IMAGE} AS runner

RUN apk update && apk upgrade --no-cache && rm -rf /var/cache/apk/*
RUN addgroup --system --gid 1001 nodejs && adduser --system --uid 1001 nextjs

WORKDIR /app

ENV NODE_ENV=production
ENV PORT=8081
ENV NEXT_TELEMETRY_DISABLED=1

COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

# Seeded DB ships in the image; runtime PVC overlays /data/iraven.db
COPY --from=builder --chown=nextjs:nodejs /app/iraven.db ./iraven.db

USER nextjs
EXPOSE 8081

HEALTHCHECK --interval=30s --timeout=5s --start-period=15s --retries=3 \
  CMD wget -q -O /dev/null http://localhost:8081/api/health || exit 1

CMD ["node", "server.js"]
