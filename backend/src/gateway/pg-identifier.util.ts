/**
 * Validates a PostgreSQL identifier (schema, table or column name) coming from
 * the client before it is interpolated into SQL. Prevents SQL injection via
 * quoted identifiers.
 *
 * Ported verbatim from the former Next.js lib/server-auth.ts (Task 5-a).
 */
export function isValidPgIdentifier(name: unknown): name is string {
  return typeof name === 'string' && /^[A-Za-z_][A-Za-z0-9_]*$/.test(name);
}

/** Root directory of the frontend (public assets live under it). */
export function frontendRoot(): string {
  return process.env.FRONTEND_ROOT || process.cwd();
}

/** Public directory of the frontend that is served statically by Next.js. */
export function frontendPublicDir(): string {
  return process.env.FRONTEND_PUBLIC_DIR || frontendRoot();
}
