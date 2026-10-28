const { Client } = require('pg');
const c = new Client({ host: '127.0.0.1', port: 5432, user: 'postgres', password: 'parsa', database: 'parsaDb' });
c.connect().then(async () => {
  for (const t of ['SalesOrder', 'SalesOrderDetail', 'SalesOrderFactor']) {
    await c.query(`
      INSERT INTO "Gnr"."IDGeneration" ("IDGenerationID", "TableName", "LastID")
      SELECT (COALESCE(MAX("IDGenerationID"), 0) + 1), '${t}', 1
      FROM "Gnr"."IDGeneration"
      WHERE NOT EXISTS (SELECT 1 FROM "Gnr"."IDGeneration" WHERE "TableName" = '${t}')
    `);
  }
  const g = await c.query('SELECT "TableName", "LastID" FROM "Gnr"."IDGeneration" WHERE "TableName" LIKE \'SalesOrder%\' ORDER BY "IDGenerationID"');
  console.log('IDGen rows:', JSON.stringify(g.rows));
  await c.end();
}).catch(e => { console.error('ERR', e.message); process.exit(1); });
