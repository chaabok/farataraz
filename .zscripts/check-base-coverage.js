const { Client } = require('/home/z/my-project/node_modules/pg');
const c = new Client({ host: '127.0.0.1', port: 5432, user: 'postgres', password: 'parsa', database: 'parsaDb' });
c.connect().then(async () => {
  const orders = await c.query(`SELECT "SalesOrderID", "OrderNumber", "Status" FROM "Sle"."SalesOrders" ORDER BY "SalesOrderID"`);
  console.log('=== SalesOrders ===');
  orders.rows.forEach(r => console.log(` id=${r.SalesOrderID} no=${r.OrderNumber} status=${r.Status}`));

  const items = await c.query(`SELECT "SalesOrderRef", "ItemRef", "ItemName", "Quantity" FROM "Sle"."SalesOrderItems" ORDER BY "SalesOrderRef", "RowNo"`);
  console.log('=== SalesOrderItems ===');
  items.rows.forEach(r => console.log(` order=${r.SalesOrderRef} item=${r.ItemRef} qty=${r.Quantity} | ${r.ItemName}`));

  const pros = await c.query(`SELECT "SalesProformaID", "ProformaNumber", "Status", "BaseDocumentTypeRef", "BaseDocumentRef" FROM "Sle"."SalesProformaInvoices" ORDER BY 1`);
  console.log('=== Proformas ===');
  pros.rows.forEach(r => console.log(` id=${r.SalesProformaID} no=${r.ProformaNumber} status=${r.Status} baseType=${r.BaseDocumentTypeRef} baseRef=${r.BaseDocumentRef}`));

  const pitems = await c.query(`SELECT "SalesProformaRef", "ItemRef", "ItemName", "Quantity" FROM "Sle"."SalesProformaInvoiceItems" ORDER BY "SalesProformaRef", "RowNo"`);
  console.log('=== ProformaItems ===');
  pitems.rows.forEach(r => console.log(` proforma=${r.SalesProformaRef} item=${r.ItemRef} qty=${r.Quantity} | ${r.ItemName}`));
  await c.end();
}).catch(e => { console.error('ERR', e.message); process.exit(1); });
