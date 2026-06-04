ARG NODE_IMAGE=node:22-alpine

# ── Build stage ────────────────────────────────────────────────────────────────
FROM ${NODE_IMAGE} AS builder

RUN apk update && apk upgrade --no-cache && rm -rf /var/cache/apk/*

WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci

COPY . .

ENV NEXT_TELEMETRY_DISABLED=1
RUN npm run build

# Compile internal service-to-service server to a standalone JS bundle
RUN npx esbuild internal-server.ts \
    --bundle --platform=node --target=node22 \
    --external:node:sqlite --external:node:http --external:node:fs \
    --external:node:path --external:node:crypto \
    --outfile=internal-server.js

# ── Production stage ───────────────────────────────────────────────────────────
FROM ${NODE_IMAGE} AS runner

RUN apk update && apk upgrade --no-cache && rm -rf /var/cache/apk/*
RUN addgroup --system --gid 1001 nodejs && adduser --system --uid 1001 nextjs

WORKDIR /app

ENV NODE_ENV=production
ENV PORT=8081
ENV INTERNAL_PORT=3003
ENV NEXT_TELEMETRY_DISABLED=1

COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static
COPY --from=builder --chown=nextjs:nodejs /app/internal-server.js ./

COPY --chown=nextjs:nodejs start.sh ./
RUN chmod +x start.sh

USER nextjs
EXPOSE 8081 3003

HEALTHCHECK --interval=30s --timeout=5s --start-period=15s --retries=3 \
  CMD wget -q -O /dev/null http://localhost:8081/api/health || exit 1

CMD ["./start.sh"]
