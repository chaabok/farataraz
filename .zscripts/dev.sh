#!/bin/bash
# Parsa ERP custom boot flow (used by platform start.sh instead of bun+db:push flow)
cd /home/z/my-project

# 0. Restore ERP .env (platform start.sh overwrites .env with the sqlite template)
cp -f erp.env .env

# 1. Start portable PostgreSQL (binaries+data live inside the project for persistence)
PG_BIN=/home/z/my-project/pg-local/pgsql/bin
PG_DATA=/home/z/my-project/pg-local/pgdata
if [ ! -x "$PG_BIN/pg_ctl" ]; then
  echo "[dev.sh] ERROR: portable postgres binaries missing at $PG_BIN"
fi
if [ ! -d "$PG_DATA" ]; then
  echo "[dev.sh] initdb: creating fresh cluster..."
  "$PG_BIN/initdb" -D "$PG_DATA" -U postgres -E UTF8 --auth=trust
fi
# Postgres refuses to start if pgdata perms are not 0700/0750 — the sandbox
# sync/restore may rewrite them (seen: 0755 → FATAL invalid permissions).
chmod 700 "$PG_DATA" 2>/dev/null
"$PG_BIN/pg_ctl" -D "$PG_DATA" -l /home/z/my-project/pg-local/pgdata.log start -o "-h 127.0.0.1 -p 5432" 2>/dev/null \
  || echo "[dev.sh] postgres start skipped (already running?)"
sleep 2

# 2. Ensure dependencies (missing after a fresh restore)
if [ ! -d node_modules ] || [ ! -d node_modules/@nestjs ]; then
  echo "[dev.sh] installing dependencies..."
  bun install
fi

# 2.5 Disaster recovery (Task 43): if parsaDb is missing (fresh/lost pgdata after
# a sandbox reset), auto-restore the newest SQL dump (backups/ → download/ → upload/)
node /home/z/my-project/.zscripts/boot-db-recovery.js \
  || echo "[dev.sh] boot DB recovery skipped (no dump or failed)"

# 3. Compile backend if dist is missing
if [ ! -f backend/dist/main.js ]; then
  echo "[dev.sh] compiling backend..."
  node node_modules/typescript/bin/tsc --project backend/tsconfig.json
fi

# 4. Unified server: Next dev :3000 + NestJS :3005 (auto-restarts both)
exec node server.js
