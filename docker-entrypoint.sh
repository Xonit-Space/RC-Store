#!/bin/sh
set -e

echo "[Entrypoint] Running Prisma migrations..."
npx prisma migrate deploy

echo "[Entrypoint] Starting RC Store server..."
exec node server.js
