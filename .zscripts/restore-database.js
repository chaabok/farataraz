/**
 * Restore a full database backup produced by dump-database.js
 * Usage: node .zscripts/restore-database.js <sqlFile> [targetDatabase] [dropFirst]
 *   targetDatabase default: parsaDb
 *   dropFirst = "drop" to DROP the target database first (full clean restore)
 */
const { Client } = require(require('path').join('/home/z/my-project', 'node_modules', 'pg'));
const fs = require('fs');

const sqlFile = process.argv[2];
const targetDb = process.argv[3] || 'parsaDb';
const dropFirst = process.argv[4] === 'drop';
const CFG = { host: 'localhost', port: 5432, user: 'postgres', password: 'parsa', database: 'postgres' };

if (!sqlFile || !fs.existsSync(sqlFile)) { console.error('ERR: sql file not found:', sqlFile); process.exit(1); }

(async () => {
  const admin = new Client(CFG);
  await admin.connect();
  if (dropFirst) {
    await admin.query(`SELECT pg_terminate_backend(pid) FROM pg_stat_activity WHERE datname='${targetDb}' AND pid<>pg_backend_pid()`);
    await admin.query(`DROP DATABASE IF EXISTS ${JSON.stringify(targetDb).replace(/"/g, '"')}`);
    console.log('dropped:', targetDb);
  }
  const exists = await admin.query(`SELECT 1 FROM pg_database WHERE datname='${targetDb}'`);
  if (exists.rowCount === 0) {
    await admin.query(`CREATE DATABASE ${JSON.stringify(targetDb).replace(/"/g, '"')} ENCODING 'UTF8'`);
    console.log('created database:', targetDb);
  }
  await admin.end();

  const db = new Client({ ...CFG, database: targetDb });
  await db.connect();
  const sql = fs.readFileSync(sqlFile, 'utf8');
  await db.query(sql);
  const t = await db.query(`SELECT COUNT(*)::int n FROM information_schema.tables WHERE table_schema NOT IN ('pg_catalog','information_schema')`);
  console.log('RESTORE_OK:', targetDb, '| tables:', t.rows[0].n);
  await db.end();
})().catch(e => { console.error('RESTORE_ERR:', e.message); process.exit(1); });
