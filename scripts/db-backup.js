/**
 * Parsa ERP — full logical backup of parsaDb (schema + data) as plain SQL.
 * Replacement for pg_dump (not available in this sandbox's minimal pg-local install).
 *
 * Produces a restorable SQL file containing:
 *   1. Header + restore notes
 *   2. CREATE SCHEMA IF NOT EXISTS for every user schema
 *   3. CREATE TABLE IF NOT EXISTS for every user table (columns, NOT NULL, defaults, PK)
 *   4. Data as batched INSERT statements (FK enforcement disabled via session_replication_role)
 *   5. UNIQUE / FK / CHECK constraints (idempotent DO-block guards)
 *   6. Indexes (PK-backing indexes skipped)
 *
 * Usage: node scripts/db-backup.js [outputFile]
 * Default output: download/parsa-erp-db-backup.sql
 */
const fs = require('fs');
const path = require('path');
const { Client } = require('pg');

const OUT = process.argv[2] || path.join(__dirname, '..', 'download', 'parsa-erp-db-backup.sql');

// Keep raw text for temporal types (avoid TZ shifting) and exact numerics/bigints
const pgTypes = require('pg').types;
pgTypes.setTypeParser(1114, v => v); // timestamp without time zone
pgTypes.setTypeParser(1184, v => v); // timestamp with time zone
pgTypes.setTypeParser(1082, v => v); // date
pgTypes.setTypeParser(1083, v => v); // time
pgTypes.setTypeParser(1700, v => v); // numeric
pgTypes.setTypeParser(20, v => v);   // bigint

const NUMERIC_TYPES = new Set([
  'smallint', 'integer', 'bigint', 'decimal', 'numeric', 'real',
  'double precision', 'money',
]);

function q(ident) {
  return '"' + String(ident).replace(/"/g, '""') + '"';
}

function lit(v, colType) {
  if (v === null || v === undefined) return 'NULL';
  const baseType = colType ? colType.replace(/\[\]$/, '').trim() : '';
  if (Buffer.isBuffer(v)) return "'\\x" + v.toString('hex') + "'::bytea";
  // json/jsonb FIRST — pg driver parses json arrays into JS Arrays, which must NOT
  // be serialized as ARRAY[...] literals
  if (baseType === 'json' || baseType === 'jsonb') {
    const s = typeof v === 'string' ? v : JSON.stringify(v);
    return "'" + String(s).replace(/'/g, "''") + "'::" + baseType;
  }
  if (Array.isArray(v)) {
    const inner = v.map(x => lit(x, baseType)).join(', ');
    return 'ARRAY[' + inner + ']' + (colType && colType.endsWith('[]') ? '::' + colType : '');
  }
  if (baseType === 'boolean') return (v === true || v === 'true') ? 'TRUE' : 'FALSE';
  if (NUMERIC_TYPES.has(baseType)) {
    if (typeof v === 'number') return String(v);
    if (typeof v === 'string' && /^-?\d+(\.\d+)?$/.test(v.trim())) return v.trim();
    // Fallback: quote (should not normally happen)
    return "'" + String(v).replace(/'/g, "''") + "'";
  }
  // strings, timestamps (raw string preserved by parser), uuid, inet, everything else
  return "'" + String(v).replace(/'/g, "''") + "'";
}

function guard(statement) {
  // Idempotent execution for non-idempotent statements (ADD CONSTRAINT etc.)
  return [
    'DO $$',
    'BEGIN',
    '  ' + statement,
    'EXCEPTION',
    "  WHEN duplicate_object THEN NULL;",
    "  WHEN duplicate_table THEN NULL;",
    "  WHEN invalid_table_definition THEN NULL;",
    'END $$;',
  ].join('\n');
}

async function main() {
  const client = new Client({
    host: process.env.DB_HOST || '127.0.0.1',
    port: Number(process.env.DB_PORT || 5432),
    user: process.env.DB_USERNAME || 'postgres',
    password: process.env.DB_PASSWORD || 'parsa',
    database: process.env.DB_DATABASE || 'parsaDb',
  });
  await client.connect();

  const meta = await client.query('SELECT current_database() AS db, version() AS ver, NOW()::text AS ts');
  const dbName = meta.rows[0].db;

  const schemas = await client.query(
    `SELECT nspname FROM pg_namespace WHERE nspname NOT IN ('pg_catalog','information_schema')
     AND nspname NOT LIKE 'pg_%' AND nspname <> 'public' AND nspname <> 'toasted' ORDER BY 1`
  );

  const tables = await client.query(
    `SELECT c.oid AS oid, c.relname AS table_name, n.nspname AS schema, c.reltuples::bigint AS est_rows
     FROM pg_class c JOIN pg_namespace n ON n.oid = c.relnamespace
     WHERE c.relkind IN ('r','p')
       AND n.nspname NOT IN ('pg_catalog','information_schema')
       AND n.nspname NOT LIKE 'pg_%' AND n.nspname <> 'public'
     ORDER BY n.nspname, c.relname`
  );

  const out = [];
  out.push(`-- =====================================================================`);
  out.push(`-- Parsa ERP — Full database backup (schema + data)`);
  out.push(`-- Database : ${dbName}`);
  out.push(`-- Created  : ${meta.rows[0].ts} (server time)`);
  out.push(`-- Server   : ${meta.rows[0].ver}`);
  out.push(`-- Tables   : ${tables.rows.length} in ${schemas.rows.length} schemas (${schemas.rows.map(r => r.nspname).join(', ')})`);
  out.push(`-- Generator: scripts/db-backup.js (pg_dump unavailable in this environment)`);
  out.push(`--`);
  out.push(`-- Restore (on a machine with PostgreSQL client):`);
  out.push(`--   createdb -h <host> -U postgres parsaDb`);
  out.push(`--   psql -h <host> -U postgres -d parsaDb -f parsa-erp-db-backup.sql`);
  out.push(`-- Notes: script runs as one transaction; FK checks are disabled during`);
  out.push(`-- load (session_replication_role = replica) so insert order does not matter.`);
  out.push(`-- Run as a superuser (e.g. postgres) or remove that SET line and accept`);
  out.push(`-- the constraint timing at the end.`);
  out.push(`-- =====================================================================`);
  out.push(``);
  out.push(`SET statement_timeout = 0;`);
  out.push(`SET client_encoding = 'UTF8';`);
  out.push(`SET standard_conforming_strings = on;`);
  out.push(`SET check_function_bodies = false;`);
  out.push(`SET session_replication_role = replica;`);
  out.push(``);
  out.push(`BEGIN;`);
  out.push(``);

  for (const s of schemas.rows) {
    out.push(`CREATE SCHEMA IF NOT EXISTS ${q(s.nspname)};`);
  }
  out.push('');

  // ---------- CREATE TABLE ----------
  const colMetaByTable = new Map();
  for (const t of tables.rows) {
    const cols = await client.query(
      `SELECT a.attname AS name, pg_catalog.format_type(a.atttypid, a.atttypmod) AS fmt_type,
              a.attnotnull AS not_null, pg_get_expr(d.adbin, d.adrelid) AS default_expr
       FROM pg_attribute a
       LEFT JOIN pg_attrdef d ON d.adrelid = a.attrelid AND d.adnum = a.attnum
       WHERE a.attrelid = $1 AND a.attnum > 0 AND NOT a.attisdropped
       ORDER BY a.attnum`,
      [t.oid]
    );
    if (cols.rowCount === 0) continue; // system oddity, skip
    colMetaByTable.set(t.oid, cols.rows);

    const pk = await client.query(
      `SELECT pg_get_constraintdef(oid) AS def FROM pg_constraint WHERE conrelid = $1 AND contype = 'p' LIMIT 1`,
      [t.oid]
    );

    const lines = cols.rows.map(c => {
      let l = `  ${q(c.name)} ${c.fmt_type}`;
      if (c.not_null) l += ' NOT NULL';
      if (c.default_expr) l += ` DEFAULT ${c.default_expr}`;
      return l;
    });
    if (pk.rowCount > 0) lines.push(`  ${pk.rows[0].def}`);

    const tbl = `${q(t.schema)}.${q(t.table_name)}`;
    out.push(`CREATE TABLE IF NOT EXISTS ${tbl} (`);
    out.push(lines.join(',\n'));
    out.push(`);`);
    out.push('');
  }

  // ---------- DATA ----------
  let totalRows = 0;
  for (const t of tables.rows) {
    const cols = colMetaByTable.get(t.oid);
    if (!cols || cols.length === 0) continue;
    const colList = cols.map(c => q(c.name)).join(', ');
    const sel = cols.map(c => q(c.name)).join(', ');
    const res = await client.query(`SELECT ${sel} FROM ${q(t.schema)}.${q(t.table_name)}`);
    if (res.rowCount === 0) {
      out.push(`-- ${q(t.schema)}.${q(t.table_name)}: 0 rows`);
      out.push('');
      continue;
    }
    const CHUNK = 100;
    for (let i = 0; i < res.rows.length; i += CHUNK) {
      const slice = res.rows.slice(i, i + CHUNK);
      const values = slice.map(r =>
        '(' + cols.map(c => lit(r[c.name], c.fmt_type)).join(', ') + ')'
      ).join(',\n  ');
      out.push(`INSERT INTO ${q(t.schema)}.${q(t.table_name)} (${colList}) VALUES`);
      out.push('  ' + values + ';');
    }
    out.push(`-- ${q(t.schema)}.${q(t.table_name)}: ${res.rowCount} rows`);
    out.push('');
    totalRows += res.rowCount;
  }

  // ---------- CONSTRAINTS (unique / fk / check) ----------
  for (const t of tables.rows) {
    const cons = await client.query(
      `SELECT conname, pg_get_constraintdef(oid) AS def
       FROM pg_constraint
       WHERE conrelid = $1 AND contype IN ('u','f','c')`,
      [t.oid]
    );
    for (const con of cons.rows) {
      const stmt = `ALTER TABLE ${q(t.schema)}.${q(t.table_name)} ADD CONSTRAINT ${q(con.conname)} ${con.def};`;
      out.push(guard(stmt));
    }
  }

  // ---------- INDEXES (skip PK/constraint-backing) ----------
  for (const t of tables.rows) {
    const idxs = await client.query(
      `SELECT i.indexname, i.indexdef
       FROM pg_indexes i
       WHERE i.schemaname = $1 AND i.tablename = $2
         AND NOT EXISTS (
           SELECT 1 FROM pg_constraint con
           WHERE con.conindid = (
             SELECT c.oid FROM pg_class c
             JOIN pg_namespace n ON n.oid = c.relnamespace
             WHERE c.relname = i.indexname AND n.nspname = i.schemaname
           )
         )`,
      [t.schema, t.table_name]
    );
    for (const ix of idxs.rows) {
      let def = ix.indexdef;
      def = def.replace(/^CREATE (UNIQUE )?INDEX /, (m, u) => `CREATE ${u || ''}INDEX IF NOT EXISTS `);
      out.push(def + ';');
    }
  }

  out.push('');
  out.push(`COMMIT;`);
  out.push('');
  out.push(`-- ============================ END OF BACKUP ===========================`);
  out.push(`-- Total data rows dumped: ${totalRows}`);

  fs.mkdirSync(path.dirname(OUT), { recursive: true });
  fs.writeFileSync(OUT, out.join('\n'), 'utf8');

  console.log(`Backup written: ${OUT}`);
  console.log(`Tables: ${tables.rows.length}, data rows: ${totalRows}, size: ${(fs.statSync(OUT).size / 1024).toFixed(1)} KB`);
  await client.end();
}

main().catch(e => { console.error('BACKUP FAILED:', e.message); process.exit(1); });
