import { CanActivate, ExecutionContext, ForbiddenException, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { IS_PUBLIC_KEY } from '../../auth/public.decorator';
import { LicenseService } from '../license/license.service';

/**
 * Global license enforcement (Task 5-b, Phase 2). Registered as the LAST
 * global APP_GUARD in app.module.ts — runs after JwtAuthGuard,
 * PermissionsGuard and TenantValidationGuard.
 *
 * Skipped when:
 *  - the route is @Public()
 *  - the route path is under /license, /auth or /health (login must keep
 *    working while unlicensed so the user can activate from the UI)
 *  - LICENSE_ENFORCEMENT=false (documented escape hatch for on-prem support)
 *
 * Otherwise, when no valid license is installed, every business endpoint
 * answers 403 with an activation instruction. The LicenseService re-verifies
 * signature/expiry/machine binding on every check, so an expired license
 * starts failing without a restart.
 */
@Injectable()
export class LicenseEnforcementGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly licenseService: LicenseService,
  ) {}

  canActivate(context: ExecutionContext): boolean {
    if (process.env.LICENSE_ENFORCEMENT === 'false') {
      return true;
    }

    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (isPublic) {
      return true;
    }

    const request = context.switchToHttp().getRequest();
    const rawPath: string = request?.path || request?.url || '';
    if (this.isExemptPath(rawPath)) {
      return true;
    }

    if (this.licenseService.isLicenseValid()) {
      return true;
    }

    throw new ForbiddenException({
      error: 'لایسنس نرم‌افزار نامعتبر یا منقضی شده است. لطفاً از طریق پنجره فعال‌سازی، لایسنس را وارد کنید.',
    });
  }

  private isExemptPath(rawPath: string): boolean {
    const p = (rawPath || '').split('?')[0];
    // Global prefix is 'api'; accept both prefixed and unprefixed forms.
    return /^\/(api\/)?(license|auth|health)(\/|$)/.test(p);
  }
}
