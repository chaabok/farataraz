import { CanActivate, ExecutionContext, ForbiddenException, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { IS_PUBLIC_KEY } from '../../auth/public.decorator';

/**
 * Tenant header validation / IDOR hardening (Task 5-b, Part 4).
 * Registered as a global APP_GUARD AFTER PermissionsGuard and BEFORE
 * LicenseEnforcementGuard.
 *
 * The frontend apiFetch (lib/utils.ts) sends tenant context from localStorage:
 *   x-company-id      <- companyStore currentCompany.businessStructureId
 *                        (zustand persist key 'app-company-storage')
 *   x-branch-id       <- currentBranch.businessStructureId (same store)
 *   x-agency-id       <- currentRep.businessStructureId    (same store)
 *   x-fiscal-year-id  <- localStorage 'app-fiscal-year' (FiscalYear id)
 *
 * Semantics (conservative, per investigation of the real frontend):
 *  - @Public() routes are skipped.
 *  - MISSING headers pass through untouched (pre-company-selection flows,
 *    health checks, first login, etc. must keep working).
 *  - x-company-id: existence check in Gnr."BusinessStructure" + membership
 *    enforcement for non-admin users via the EXISTING Iam."BusinessStructureUsers"
 *    relation (mirrors iamService.getMyBusinessStructures + the Header company
 *    filter). Users with the '*' permission or username 'admin' pass with
 *    existence-only validation (the membership table is optional for them).
 *  - x-branch-id / x-agency-id (same BusinessStructure table) and
 *    x-fiscal-year-id (Gnr."FiscalYear"): existence-only validation.
 *  - Unexpected DB errors FAIL OPEN (logged) so an infrastructure hiccup can
 *    never hard-lock the whole ERP; nonexistent ids still fail closed.
 */
@Injectable()
export class TenantValidationGuard implements CanActivate {
  private static readonly CACHE_TTL_MS = 30_000;
  private static readonly CACHE_MAX_ENTRIES = 5_000;

  private readonly existenceCache = new Map<string, { value: boolean; expires: number }>();
  private readonly membershipCache = new Map<string, { value: boolean; expires: number }>();

  constructor(
    private readonly reflector: Reflector,
    @InjectDataSource() private readonly dataSource: DataSource,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (isPublic) {
      return true;
    }

    const request = context.switchToHttp().getRequest();
    const headers = request?.headers || {};
    const user = request?.user; // populated by JwtAuthGuard (JWT payload)

    const companyId = this.parseId(headers['x-company-id']);
    if (companyId !== null) {
      const companyExists = await this.businessStructureExists(companyId);
      if (!companyExists) {
        throw new ForbiddenException({ error: 'شرکت انتخابی معتبر نیست یا به شما تعلق ندارد.' });
      }

      if (user?.userId && !this.hasWildcardAccess(user)) {
        const member = await this.isCompanyMember(Number(user.userId), companyId);
        if (!member) {
          throw new ForbiddenException({ error: 'شرکت انتخابی معتبر نیست یا به شما تعلق ندارد.' });
        }
      }
    }

    // Existence-only validation for the remaining tenant headers.
    const branchId = this.parseId(headers['x-branch-id']);
    if (branchId !== null && !(await this.businessStructureExists(branchId))) {
      throw new ForbiddenException({ error: 'شعبه انتخابی معتبر نیست.' });
    }

    const agencyId = this.parseId(headers['x-agency-id']);
    if (agencyId !== null && !(await this.businessStructureExists(agencyId))) {
      throw new ForbiddenException({ error: 'نمایندگی انتخابی معتبر نیست.' });
    }

    const fiscalYearId = this.parseId(headers['x-fiscal-year-id']);
    if (fiscalYearId !== null && !(await this.fiscalYearExists(fiscalYearId))) {
      throw new ForbiddenException({ error: 'سال مالی انتخابی معتبر نیست.' });
    }

    return true;
  }

  private hasWildcardAccess(user: any): boolean {
    return (
      (Array.isArray(user?.permissions) && user.permissions.includes('*')) ||
      String(user?.username || '').toLowerCase() === 'admin'
    );
  }

  private parseId(raw: any): number | null {
    if (raw === undefined || raw === null) return null;
    const value = parseInt(String(Array.isArray(raw) ? raw[0] : raw).trim(), 10);
    return isNaN(value) ? null : value;
  }

  private async businessStructureExists(id: number): Promise<boolean> {
    return this.cached(this.existenceCache, `bs:${id}`, async () => {
      try {
        const rows = await this.dataSource.query(
          'SELECT 1 FROM "Gnr"."BusinessStructure" WHERE "BusinessStructureID" = $1 LIMIT 1',
          [id],
        );
        return rows.length > 0;
      } catch (e: any) {
        console.warn(`[TenantValidationGuard] existence lookup failed (fail-open): ${e?.message}`);
        return true; // fail-open on infrastructure errors only
      }
    });
  }

  private async fiscalYearExists(id: number): Promise<boolean> {
    return this.cached(this.existenceCache, `fy:${id}`, async () => {
      try {
        const rows = await this.dataSource.query(
          'SELECT 1 FROM "Gnr"."FiscalYear" WHERE "FiscalYearID" = $1 LIMIT 1',
          [id],
        );
        return rows.length > 0;
      } catch (e: any) {
        console.warn(`[TenantValidationGuard] fiscal-year lookup failed (fail-open): ${e?.message}`);
        return true;
      }
    });
  }

  private async isCompanyMember(userId: number, companyId: number): Promise<boolean> {
    return this.cached(this.membershipCache, `${userId}:${companyId}`, async () => {
      try {
        const rows = await this.dataSource.query(
          'SELECT 1 FROM "Iam"."BusinessStructureUsers" WHERE "UserRef" = $1 AND "BusinessStructureRef" = $2 LIMIT 1',
          [userId, companyId],
        );
        return rows.length > 0;
      } catch (e: any) {
        console.warn(`[TenantValidationGuard] membership lookup failed (fail-open): ${e?.message}`);
        return true;
      }
    });
  }

  private async cached(
    cache: Map<string, { value: boolean; expires: number }>,
    key: string,
    resolver: () => Promise<boolean>,
  ): Promise<boolean> {
    const now = Date.now();
    const hit = cache.get(key);
    if (hit && hit.expires > now) {
      return hit.value;
    }
    const value = await resolver();
    if (cache.size > TenantValidationGuard.CACHE_MAX_ENTRIES) {
      cache.clear();
    }
    cache.set(key, { value, expires: now + TenantValidationGuard.CACHE_TTL_MS });
    return value;
  }
}
