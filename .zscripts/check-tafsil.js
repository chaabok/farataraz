const { Client } = require('/home/z/my-project/node_modules/pg');
const c = new Client({ host: '127.0.0.1', port: 5432, user: 'postgres', password: 'parsa', database: 'parsaDb' });
c.connect().then(async () => {
  const r = await c.query('select count(*)::int n from "Gnr"."DetailedAccountsNumbering"');
  console.log('DetailedAccountsNumbering rows:', r.rows[0].n);
  const r2 = await c.query(
    'select dt."Title" as type_title, da."Title" as account_title, da."Code" from "Acc"."DetailedAccounts" da join "Acc"."DetailedTypes" dt on dt."DetailedTypesID" = da."DetailedTypesID" order by da."DetailedAccountID"'
  );
  console.log('DetailedAccounts with their type:');
  r2.rows.forEach(x => console.log(` - [${x.type_title}] ${x.Code} | ${x.account_title}`));
  await c.end();
}).catch(e => { console.error('ERR', e.message); process.exit(1); });
