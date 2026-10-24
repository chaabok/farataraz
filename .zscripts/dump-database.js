/**
 * Full PostgreSQL database backup (schema DDL + data + sequences + constraints + indexes)
 * Used because pg_dump binary is not available in this sandbox.
 * Usage: node .zscripts/dump-database.js [outputFile]
 * Output: portable SQL file (restorable via psql -f or .zscripts/restore-database.js)
 */
const { Client } = require(require('path').join('/home/z/my-project', 'node_modules', 'pg'));
const fs = require('fs');
const path = require('path');

const CFG = { host: 'localhost', port: 5432, user: 'postgres', password: 'parsa', database: 'parsaDb' };
const OUT = process.argv[2] || path.join('/home/z/my-project', 'backups', `parsa-db-backup-${new Date().toISOString().slice(0, 19).replace(/[:T]/g, '-')}.sql`);

function q(ident) { return '"' + String(ident).replace(/"/g, '""') + '"'; }
function lit(v) {
  if (v === null || v === undefined) return 'NULL';
  if (typeof v === 'boolean') return v ? 'true' : 'false';
  if (typeof v === 'number') return isFinite(v) ? String(v) : 'NULL';
  if (typeof v === 'bigint') return v.toString();
  if (Buffer.isBuffer(v)) return `decode('${v.toString('hex')}','hex')`;
  if (v instanceof Date) {
    if (isNaN(v.getTime())) return 'NULL';
    // Preserve exact timestamp string
    return `'${v.toISOString().replace('T', ' ').replace('Z', '')}'`;
  }
  if (typeof v === 'object') v = JSON.stringify(v);
  let s = String(v);
  if (s.includes('\\')) return `E'${s.replace(/\\/g, '\\\\').replace(/'/g, "''")}'`;
  return `'${s.replace(/'/g, "''")}'`;
}

(async () => {
  const client = new Client(CFG);
  await client.connect();
  const out = [];
  const meta = await client.query('SELECT current_database() db, version() v, NOW() ts');
  out.push(`-- ============================================================`);
  out.push(`-- Parsa ERP Full Database Backup`);
  out.push(`-- Database : ${meta.rows[0].db}`);
  out.push(`-- Server   : ${meta.rows[0].v}`);
  out.push(`-- Taken at : ${meta.rows[0].ts.toISOString()}`);
  out.push(`-- Encoding : UTF8`);
  out.push(`-- ============================================================`);
  out.push(`SET client_encoding = 'UTF8';`);
  out.push(`SET standard_conforming_strings = on;`);
  out.push(``);

  // Schemas
  const schemas = await client.query(
    `SELECT schema_name FROM information_schema.schemata
     WHERE schema_name NOT IN ('pg_catalog','information_schema','pg_toast') AND schema_name NOT LIKE 'pg_temp%' ORDER BY schema_name`);
  for (const s of schemas.rows) out.push(`CREATE SCHEMA IF NOT EXISTS ${q(s.schema_name)};`);

  // Enum types
  const enums = await client.query(
    `SELECT n.nspname sch, t.typname name, string_agg(e.enumlabel, ',' ORDER BY e.enumsortorder) labels
     FROM pg_type t JOIN pg_namespace n ON n.oid = t.typnamespace
     JOIN pg_enum e ON e.enumtypid = t.oid
     WHERE n.nspname NOT IN ('pg_catalog','information_schema') GROUP BY n.nspname, t.typname`);
  for (const e of enums.rows)
    out.push(`DO $$ BEGIN CREATE TYPE ${e.sch}.${e.name} AS ENUM (${e.labels.split(',').map(l => `'${l.replace(/'/g, "''")}'`).join(', ')}); EXCEPTION WHEN duplicate_object THEN NULL; END $$;`);

  // Tables DDL
  const tables = await client.query(
    `SELECT table_schema sch, table_name tbl FROM information_schema.tables
     WHERE table_type='BASE TABLE' AND table_schema NOT IN ('pg_catalog','information_schema')
       AND table_schema NOT LIKE 'pg_temp%' ORDER BY table_schema, table_name`);

  const tablesList = [];
  for (const t of tables.rows) {
    const fq = `${q(t.sch)}.${q(t.tbl)}`;
    const cols = await client.query(
      `SELECT column_name, data_type, character_maximum_length clen, numeric_precision prec, numeric_scale scale,
              is_nullable, column_default, datetime_precision dtl
       FROM information_schema.columns WHERE table_schema=$1 AND table_name=$2 ORDER BY ordinal_position`, [t.sch, t.tbl]);
    const typeOf = (c) => {
      switch (c.data_type) {
        case 'character varying': return c.clen ? `varchar(${c.clen})` : 'varchar';
        case 'character': return c.clen ? `char(${c.clen})` : 'char';
        case 'numeric': return (c.prec && c.scale !== null) ? `numeric(${c.prec},${c.scale})` : 'numeric';
        case 'bigint': return 'bigint';
        case 'integer': return 'integer';
        case 'smallint': return 'smallint';
        case 'boolean': return 'boolean';
        case 'text': return 'text';
        case 'date': return 'date';
        case 'timestamp without time zone': return 'timestamp';
        case 'timestamp with time zone': return 'timestamptz';
        case 'time without time zone': return 'time';
        case 'json': return 'json';
        case 'jsonb': return 'jsonb';
        case 'bytea': return 'bytea';
        case 'double precision': return 'double precision';
        case 'real': return 'real';
        case 'uuid': return 'uuid';
        case 'USER-DEFINED': return 'text';
        default: return c.data_type;
      }
    };
    const defs = cols.rows.map(c => {
      let d = `  ${q(c.column_name)} ${typeOf(c)}`;
      if (c.is_nullable === 'NO' && c.column_default === null) d += ' NOT NULL';
      if (c.column_default !== null && !/^nextval\(/i.test(c.column_default)) d += ` DEFAULT ${c.column_default}`;
      return d;
    });
    // Primary key inline
    const pk = await client.query(
      `SELECT a.attname col FROM pg_index i
       JOIN pg_class c ON c.oid = i.indrelid JOIN pg_namespace n ON n.oid = c.relnamespace
       JOIN pg_attribute a ON a.attrelid = c.oid AND a.attnum = ANY(i.indkey)
       WHERE i.indisprimary AND n.nspname=$1 AND c.relname=$2 ORDER BY a.attnum`, [t.sch, t.tbl]);
    if (pk.rows.length) defs.push(`  PRIMARY KEY (${pk.rows.map(r => q(r.col)).join(', ')})`);
    out.push(`CREATE TABLE IF NOT EXISTS ${fq} (\n${defs.join(',\n')}\n);`);
    tablesList.push(t);
  }

  // Sequences
  const seqs = await client.query(
    `SELECT schemaname sch, sequencename name, last_value, start_value, increment_by, min_value, max_value, data_type
     FROM pg_sequences WHERE schemaname NOT IN ('pg_catalog','information_schema') ORDER BY schemaname, sequencename`);
  const seqRestore = [];
  for (const s of seqs.rows) {
    out.push(`CREATE SEQUENCE IF NOT EXISTS ${q(s.sch)}.${q(s.name)} AS ${s.data_type} INCREMENT ${s.increment_by} MINVALUE ${s.min_value} MAXVALUE ${s.max_value} START ${s.start_value};`);
    if (s.last_value !== null) seqRestore.push(`SELECT setval(${q(`${s.sch}.${s.name}`)}::regclass, ${s.last_value}, true);`);
  }

  // Data
  out.push(``);
  out.push(`-- ==================== DATA ====================`);
  let totalRows = 0;
  for (const t of tablesList) {
    const fq = `${q(t.sch)}.${q(t.tbl)}`;
    const cols = (await client.query(
      `SELECT column_name FROM information_schema.columns WHERE table_schema=$1 AND table_name=$2 ORDER BY ordinal_position`, [t.sch, t.tbl])).rows.map(r => r.column_name);
    const res = await client.query(`SELECT * FROM ${fq}`);
    if (res.rows.length === 0) continue;
    out.push(``);
    out.push(`-- Data for ${t.sch}.${t.tbl} (${res.rows.length} rows)`);
    const colList = cols.map(q).join(', ');
    for (const row of res.rows) {
      const vals = cols.map(c => lit(row[c])).join(', ');
      out.push(`INSERT INTO ${fq} (${colList}) VALUES (${vals});`);
    }
    totalRows += res.rows.length;
  }

  // Constraints (FK / UNIQUE / CHECK) after data
  out.push(``);
  out.push(`-- ==================== CONSTRAINTS ====================`);
  const cons = await client.query(
    `SELECT n.nspname sch, c.relname tbl, con.conname name, pg_get_constraintdef(con.oid, true) def
     FROM pg_constraint con JOIN pg_class c ON c.oid = con.conrelid JOIN pg_namespace n ON n.oid = c.relnamespace
     WHERE n.nspname NOT IN ('pg_catalog','information_schema') AND con.contype IN ('f','u','c') ORDER BY n.nspname, c.relname, con.conname`);
  for (const k of cons.rows)
    out.push(`ALTER TABLE ${q(k.sch)}.${q(k.tbl)} ADD CONSTRAINT ${q(k.name)} ${k.def};`);

  // Indexes (non-PK, non-unique-constraint backed)
  out.push(``);
  out.push(`-- ==================== INDEXES ====================`);
  const idxs = await client.query(
    `SELECT schemaname sch, tablename tbl, indexname name, indexdef def FROM pg_indexes
     WHERE schemaname NOT IN ('pg_catalog','information_schema') ORDER BY schemaname, tablename, indexname`);
  for (const ix of idxs.rows) {
    if (/ ON ${''}/.test(ix.def)) continue;
    const isPkOrUq = cons.rows.some(k => k.sch === ix.sch && k.tbl === ix.tbl && k.name === ix.name);
    if (isPkOrUq) continue;
    if (/^CREATE (UNIQUE )?INDEX .* ON /i.test(ix.def)) out.push(ix.def.replace(/^CREATE INDEX /i, 'CREATE INDEX IF NOT EXISTS ').replace(/^CREATE UNIQUE INDEX /i, 'CREATE UNIQUE INDEX IF NOT EXISTS ') + ';');
  }

  // Sequence sync at end
  if (seqRestore.length) { out.push(``); out.push(`-- Sequence positions`); out.push(...seqRestore); }

  out.push(``);
  out.push(`-- END OF BACKUP — ${tablesList.length} tables, ${totalRows} rows`);
  fs.mkdirSync(path.dirname(OUT), { recursive: true });
  fs.writeFileSync(OUT, out.join('\n'), 'utf8');
  console.log('DUMP_OK:', OUT);
  console.log('tables:', tablesList.length, '| rows:', totalRows, '| size:', (fs.statSync(OUT).size / 1024 / 1024).toFixed(2), 'MB');
  await client.end();
})().catch(e => { console.error('DUMP_ERR:', e.message); process.exit(1); });
