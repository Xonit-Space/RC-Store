#!/bin/sh
set -e

echo "[Entrypoint] Checking required environment variables..."
for var in DATABASE_URL NEXTAUTH_SECRET NEXTAUTH_URL; do
  eval "value=\${$var}"
  if [ -z "$value" ]; then
    echo "[Entrypoint] ERROR: $var is required but not set."
    exit 1
  fi
done

echo "[Entrypoint] Running Prisma migrations..."
npx prisma migrate deploy

echo "[Entrypoint] Starting RC Store server (standalone)..."
exec node server.js
