/**
 * Boot-time disaster recovery (Task 43):
 * If parsaDb is missing (e.g. pgdata was lost / fresh initdb after a sandbox reset),
 * automatically restore the newest available SQL dump so the ERP boots WITH data.
 * Search order (newest by mtime wins): backups/*.sql, download/*.sql, upload/*.sql
 * Usage: called by .zscripts/dev.sh AFTER dependencies are ensured (needs node_modules/pg).
 * Exit: 0 = ok or no-op, 1 = failure.
 */
const { Client } = require(require('path').join('/home/z/my-project', 'node_modules', 'pg'));
const fs = require('fs');
const path = require('path');
const ROOT = '/home/z/my-project';

(async () => {
  const admin = new Client({ host: '127.0.0.1', port: 5432, user: 'postgres', password: 'parsa', database: 'postgres' });
  await admin.connect();
  const r = await admin.query(`SELECT 1 FROM pg_database WHERE datname='parsaDb'`);
  await admin.end();
  if (r.rowCount > 0) {
    console.log('[boot-recovery] parsaDb exists — no action needed');
    return;
  }
  const dirs = [path.join(ROOT, 'backups'), path.join(ROOT, 'download'), path.join(ROOT, 'upload')];
  const candidates = [];
  for (const d of dirs) {
    if (!fs.existsSync(d)) continue;
    for (const f of fs.readdirSync(d)) {
      if (!f.endsWith('.sql')) continue;
      const p = path.join(d, f);
      try { candidates.push({ p, m: fs.statSync(p).mtimeMs }); } catch (e) { /* ignore */ }
    }
  }
  candidates.sort((a, b) => b.m - a.m);
  if (!candidates.length) {
    console.error('[boot-recovery] parsaDb MISSING and no SQL dump found anywhere!');
    process.exit(1);
  }
  console.log('[boot-recovery] parsaDb missing → auto-restoring newest dump:', candidates[0].p);
  const { execFileSync } = require('child_process');
  execFileSync('node', [path.join(ROOT, '.zscripts', 'restore-database.js'), candidates[0].p, 'parsaDb'], { stdio: 'inherit' });
  console.log('[boot-recovery] DONE');
})().catch(e => { console.error('[boot-recovery] FAILED:', e.message); process.exit(1); });
