#!/usr/bin/env bash
set -euo pipefail

REPO_DIR="/var/www/paceplan"
WEB_DIST="$REPO_DIR/apps/web/dist"
API_DIR="$REPO_DIR/apps/api"

echo "==> Pulling latest code..."
git -C "$REPO_DIR" pull

echo "==> Installing dependencies..."
pnpm --dir "$REPO_DIR" install --frozen-lockfile

echo "==> Building API..."
pnpm --dir "$REPO_DIR" --filter @paceplan/api build

echo "==> Building web..."
pnpm --dir "$REPO_DIR" --filter @paceplan/web build

echo "==> Running database migrations..."
psql "$DATABASE_URL" -f "$REPO_DIR/packages/db/src/migrations/001_initial_schema.sql"
psql "$DATABASE_URL" -f "$REPO_DIR/packages/db/src/migrations/002_expanded_schema.sql"

echo "==> Restarting API via PM2..."
if pm2 describe paceplan-api > /dev/null 2>&1; then
  pm2 reload paceplan-api
else
  pm2 start "$API_DIR/ecosystem.config.js" --env production
fi
pm2 save

echo "==> Reloading Nginx..."
nginx -t && systemctl reload nginx

echo "==> Deploy concluído."
