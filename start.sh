#!/bin/sh
# Start Next.js + internal service-to-service server
node /app/internal-server.js &
exec node /app/server.js
