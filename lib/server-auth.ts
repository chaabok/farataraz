import jwt from 'jsonwebtoken';
import { NextResponse } from 'next/server';

/**
 * Server-side authentication guard for Next.js API route handlers.
 *
 * Accepts the JWT from either:
 *  - the `Authorization: Bearer <token>` header (apiFetch), or
 *  - the httpOnly `authentication` cookie set by the NestJS login endpoint.
 *
 * Returns the decoded payload or null. Never trust client-supplied tenant
 * headers without this check.
 */
export function verifyRequestAuth(req: Request): { userId: number; username: string } | null {
  try {
    let token: string | undefined | null = null;

    const authHeader = req.headers.get('authorization');
    if (authHeader && authHeader.startsWith('Bearer ')) {
      token = authHeader.slice(7).trim();
    }

    if (!token) {
      const cookieHeader = req.headers.get('cookie') || '';
      const match = cookieHeader.match(/(?:^|;\s*)authentication=([^;]+)/);
      if (match) {
        try {
          token = decodeURIComponent(match[1]);
        } catch {
          token = match[1];
        }
      }
    }

    if (!token) return null;

    const secret = process.env.JWT_SECRET;
    if (!secret) return null;

    const payload = jwt.verify(token, secret) as any;
    if (!payload || !payload.sub) return null;

    return { userId: Number(payload.sub), username: String(payload.username || '') };
  } catch {
    return null;
  }
}

/** Standard 401 response for protected Next.js route handlers. */
export function unauthorizedResponse(): NextResponse {
  return NextResponse.json(
    { message: 'احراز هویت نامعتبر است. لطفاً مجدداً وارد سیستم شوید.' },
    { status: 401 }
  );
}

/**
 * Validates a PostgreSQL identifier (schema, table or column name) coming from
 * the client before it is interpolated into SQL. Prevents SQL injection via
 * quoted identifiers.
 */
export function isValidPgIdentifier(name: unknown): name is string {
  return typeof name === 'string' && /^[A-Za-z_][A-Za-z0-9_]*$/.test(name);
}
