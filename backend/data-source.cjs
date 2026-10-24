/**
 * TypeORM CLI DataSource (Task 5-a).
 *
 * Usage (from the backend directory):
 *   npm run migration:generate -- -n SomeMigration
 *   npm run migration:run
 *   npm run migration:revert
 *
 * Reads the same environment variables as backend/src/app.module.ts:
 *   DATABASE_URL  (preferred)  or  DB_HOST / DB_PORT / DB_USERNAME / DB_PASSWORD / DB_DATABASE
 *
 * Entities are collected recursively from the compiled backend output
 * (every *.entity.js under dist/), migrations from dist/migrations/*.js.
 * `synchronize` is ALWAYS false here - schema changes must go through
 * migrations, never the CLI.
 */
const fs = require('fs');
const path = require('path');
const { DataSource } = require('typeorm');

const backendDir = __dirname;
const distDir = path.join(backendDir, 'dist');

function collectEntities() {
  const entities = [];
  if (!fs.existsSync(distDir)) {
    console.warn(`[data-source] dist directory not found at ${distDir} - run "npm run build" first.`);
    return entities;
  }
  const files = fs.readdirSync(distDir, { recursive: true });
  for (const rel of files) {
    if (typeof rel !== 'string' || !rel.endsWith('.entity.js')) continue;
    const full = path.join(distDir, rel);
    let mod;
    try {
      mod = require(full);
    } catch (err) {
      console.warn(`[data-source] Could not require entity ${rel}: ${err.message}`);
      continue;
    }
    for (const exported of Object.values(mod)) {
      if (typeof exported === 'function' && exported.prototype && exported.name) {
        entities.push(exported);
      }
    }
  }
  console.log(`[data-source] Collected ${entities.length} entities from ${distDir}`);
  return entities;
}

// Connection settings mirror app.module.ts precedence: DATABASE_URL first,
// then the discrete DB_* variables.
const rawDbUrl = (process.env.DATABASE_URL || '').trim();
let connectionOptions;

if (rawDbUrl && rawDbUrl !== '""' && rawDbUrl !== "''") {
  let cleanUrl = rawDbUrl;
  if (cleanUrl.startsWith('"') && cleanUrl.endsWith('"')) cleanUrl = cleanUrl.slice(1, -1);
  if (cleanUrl.startsWith("'") && cleanUrl.endsWith("'")) cleanUrl = cleanUrl.slice(1, -1);
  cleanUrl = cleanUrl.trim();
  const isLocal = cleanUrl.includes('localhost') || cleanUrl.includes('127.0.0.1') || cleanUrl.includes('::1');
  connectionOptions = {
    url: cleanUrl,
    ssl: isLocal ? false : { rejectUnauthorized: false },
  };
} else {
  const host = (process.env.DB_HOST || 'localhost').trim();
  const isLocalHost = host === 'localhost' || host === '127.0.0.1' || host === '::1';
  connectionOptions = {
    host,
    port: parseInt(process.env.DB_PORT || '5432', 10),
    username: (process.env.DB_USERNAME || 'postgres').trim(),
    password: process.env.DB_PASSWORD !== undefined ? String(process.env.DB_PASSWORD).trim() : '',
    database: (process.env.DB_DATABASE || 'postgres').trim(),
    ssl: isLocalHost ? false : { rejectUnauthorized: false },
  };
}

module.exports = new DataSource({
  type: 'postgres',
  ...connectionOptions,
  entities: collectEntities(),
  migrations: [path.join(backendDir, 'dist', 'migrations', '*.js')],
  synchronize: false,
  logging: ['error'],
});
