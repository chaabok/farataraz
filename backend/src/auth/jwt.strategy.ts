import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable } from '@nestjs/common';
import { Request } from 'express';
import * as crypto from 'crypto';

/**
 * Resolves the JWT signing secret securely.
 * - Production: fails fast if JWT_SECRET is not configured.
 * - Development: uses a random per-boot secret (tokens invalidate on restart)
 *   instead of a well-known hardcoded fallback string.
 */
function resolveJwtSecret(): string {
  const secret = process.env.JWT_SECRET;
  if (secret && secret.length >= 16) return secret;
  if (process.env.NODE_ENV === 'production') {
    throw new Error('JWT_SECRET is not defined in production environment');
  }
  console.warn('[SECURITY WARNING] JWT_SECRET is missing or too short. Using a random per-boot secret (sessions will reset on restart). Set a strong JWT_SECRET in .env!');
  return crypto.randomBytes(48).toString('hex');
}

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor() {
    super({
      jwtFromRequest: ExtractJwt.fromExtractors([
        (request: Request) => {
          let data = request?.cookies?.['authentication'];
          if (!data) {
            return null;
          }
          return data;
        },
        ExtractJwt.fromAuthHeaderAsBearerToken(),
      ]),
      ignoreExpiration: false,
      secretOrKey: resolveJwtSecret(),
    });
  }

  async validate(payload: any) {
    return { 
      userId: payload.sub, 
      username: payload.username,
      permissions: payload.permissions || []
    };
  }
}
