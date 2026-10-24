/**
 * One-off DB inspection/cleanup helper (Task 54 - DetailedTypes duplicates)
 * Usage: node /home/z/my-project/.zscripts/dbq.js "<sql>"
 */
const { Client } = require(require('path').join('/home/z/my-project', 'node_modules', 'pg'));
const CFG = { host: 'localhost', port: 5432, user: 'postgres', password: 'parsa', database: 'parsaDb' };

(async () => {
  const sql = process.argv[2];
  if (!sql) { console.error('No SQL given'); process.exit(1); }
  const client = new Client(CFG);
  await client.connect();
  try {
    const res = await client.query(sql);
    console.log(JSON.stringify(res.rows, null, 1));
    if (res.rowCount !== undefined && res.command !== 'SELECT') console.log('rowCount:', res.rowCount);
  } finally {
    await client.end();
  }
})().catch(e => { console.error('ERR:', e.message); process.exit(1); });
