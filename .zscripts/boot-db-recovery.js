/**
 * Boot-time disaster recovery (Task 43 + Task 47):
 * 1) env + license self-healing — sandbox recycles wipe gitignored secret files
 *    (erp.env, license.key, .hidden_license.data). Restored from
 *    upload/env-recovery/ (survives recycles) or the user's original upload.
 *    erp.env is also mirrored to .env (server.js reads .env).
 * 2) DB self-healing — if parsaDb is missing (fresh initdb after a sandbox
 *    reset), auto-restore the newest SQL dump.
 *    Search order (newest by mtime wins): backups/*.sql, download/*.sql, upload/*.sql
 * Usage: called by .zscripts/dev.sh AFTER dependencies are ensured (needs node_modules/pg).
 * Exit: 0 = ok or no-op, 1 = failure.
 */
const { Client } = require(require('path').join('/home/z/my-project', 'node_modules', 'pg'));
const fs = require('fs');
const path = require('path');
const ROOT = '/home/z/my-project';

function recoverEnvAndLicense() {
  const REC_DIR = path.join(ROOT, 'upload', 'env-recovery');
  const ORIG_BACKEND = path.join(ROOT, 'upload', 'farataraz-extracted', 'backend');
  const targets = [
    { file: 'erp.env', recCandidates: [path.join(REC_DIR, 'erp.env')], dests: [path.join(ROOT, 'erp.env')] },
    { file: 'license.key', recCandidates: [path.join(REC_DIR, 'license.key'), path.join(ORIG_BACKEND, 'license.key')], dests: [path.join(ROOT, 'license.key'), path.join(ROOT, 'backend', 'license.key')] },
    { file: '.hidden_license.data', recCandidates: [path.join(REC_DIR, '.hidden_license.data'), path.join(ORIG_BACKEND, '.hidden_license.data')], dests: [path.join(ROOT, '.hidden_license.data'), path.join(ROOT, 'backend', '.hidden_license.data')] },
  ];
  for (const t of targets) {
    const missing = t.dests.filter(d => !fs.existsSync(d));
    if (!missing.length) continue;
    const src = t.recCandidates.find(c => fs.existsSync(c));
    if (!src) {
      console.error(`[boot-recovery] MISSING ${t.file} and no recovery copy found!`);
      continue;
    }
    for (const d of missing) {
      try { fs.copyFileSync(src, d); console.log(`[boot-recovery] restored ${t.file} → ${path.relative(ROOT, d)} (from ${path.relative(ROOT, src)})`); }
      catch (e) { console.error(`[boot-recovery] failed to restore ${t.file}:`, e.message); }
    }
  }
  // Mirror erp.env → .env unless .env already points at PostgreSQL parsaDb
  try {
    const envPath = path.join(ROOT, 'erp.env');
    const dotEnvPath = path.join(ROOT, '.env');
    if (fs.existsSync(envPath)) {
      const envContent = fs.readFileSync(envPath, 'utf8');
      let needCopy = true;
      if (fs.existsSync(dotEnvPath)) {
        const cur = fs.readFileSync(dotEnvPath, 'utf8');
        if (cur.includes('parsaDb') && cur.includes('JWT_SECRET=')) needCopy = false;
      }
      if (needCopy) {
        fs.copyFileSync(envPath, dotEnvPath);
        console.log('[boot-recovery] mirrored erp.env → .env (replaced platform sqlite template)');
      }
    }
  } catch (e) { console.error('[boot-recovery] erp.env mirror failed:', e.message); }
}

(async () => {
  recoverEnvAndLicense();

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
