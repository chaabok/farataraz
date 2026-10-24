#!/bin/bash
# Task 44: Checkpoint routine — dump DB + commit + push everything to GitHub
# Usage: bash .zscripts/push-to-github.sh "commit message"
set -e
cd /home/z/my-project
MSG="${1:-checkpoint: $(date '+%Y-%m-%d %H:%M')}"

echo "[checkpoint] 1/3 — dumping database..."
node .zscripts/dump-database.js /home/z/my-project/backups/parsa-db-latest.sql | tail -1

git add -A
if git diff --cached --quiet; then
  echo "[checkpoint] no source changes to commit (DB dump refreshed)"
else
  git commit -m "$MSG" | tail -1
fi

echo "[checkpoint] 2/3 — pushing to GitHub (origin/main)..."
git push origin main

echo "[checkpoint] 3/3 — refreshing local repo.tar snapshot..."
tar -cf /home/sync/repo.tar.new \
  --exclude=./node_modules --exclude=./.next --exclude=./pg-local/pgdata \
  --exclude=./pg-local/pgdata.log --exclude=./server.log . 2>/dev/null
mv /home/sync/repo.tar.new /home/sync/repo.tar

echo "[checkpoint] DONE ✓ (GitHub + local snapshot updated)"
