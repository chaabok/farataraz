"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var TenantValidationGuard_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.TenantValidationGuard = void 0;
const common_1 = require("@nestjs/common");
const core_1 = require("@nestjs/core");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const public_decorator_1 = require("../../auth/public.decorator");
let TenantValidationGuard = TenantValidationGuard_1 = class TenantValidationGuard {
    constructor(reflector, dataSource) {
        this.reflector = reflector;
        this.dataSource = dataSource;
        this.existenceCache = new Map();
        this.membershipCache = new Map();
    }
    async canActivate(context) {
        const isPublic = this.reflector.getAllAndOverride(public_decorator_1.IS_PUBLIC_KEY, [
            context.getHandler(),
            context.getClass(),
        ]);
        if (isPublic) {
            return true;
        }
        const request = context.switchToHttp().getRequest();
        const headers = request?.headers || {};
        const user = request?.user;
        const companyId = this.parseId(headers['x-company-id']);
        if (companyId !== null) {
            const companyExists = await this.businessStructureExists(companyId);
            if (!companyExists) {
                throw new common_1.ForbiddenException({ error: 'شرکت انتخابی معتبر نیست یا به شما تعلق ندارد.' });
            }
            if (user?.userId && !this.hasWildcardAccess(user)) {
                const member = await this.isCompanyMember(Number(user.userId), companyId);
                if (!member) {
                    throw new common_1.ForbiddenException({ error: 'شرکت انتخابی معتبر نیست یا به شما تعلق ندارد.' });
                }
            }
        }
        const branchId = this.parseId(headers['x-branch-id']);
        if (branchId !== null && !(await this.businessStructureExists(branchId))) {
            throw new common_1.ForbiddenException({ error: 'شعبه انتخابی معتبر نیست.' });
        }
        const agencyId = this.parseId(headers['x-agency-id']);
        if (agencyId !== null && !(await this.businessStructureExists(agencyId))) {
            throw new common_1.ForbiddenException({ error: 'نمایندگی انتخابی معتبر نیست.' });
        }
        const fiscalYearId = this.parseId(headers['x-fiscal-year-id']);
        if (fiscalYearId !== null && !(await this.fiscalYearExists(fiscalYearId))) {
            throw new common_1.ForbiddenException({ error: 'سال مالی انتخابی معتبر نیست.' });
        }
        return true;
    }
    hasWildcardAccess(user) {
        return ((Array.isArray(user?.permissions) && user.permissions.includes('*')) ||
            String(user?.username || '').toLowerCase() === 'admin');
    }
    parseId(raw) {
        if (raw === undefined || raw === null)
            return null;
        const value = parseInt(String(Array.isArray(raw) ? raw[0] : raw).trim(), 10);
        return isNaN(value) ? null : value;
    }
    async businessStructureExists(id) {
        return this.cached(this.existenceCache, `bs:${id}`, async () => {
            try {
                const rows = await this.dataSource.query('SELECT 1 FROM "Gnr"."BusinessStructure" WHERE "BusinessStructureID" = $1 LIMIT 1', [id]);
                return rows.length > 0;
            }
            catch (e) {
                console.warn(`[TenantValidationGuard] existence lookup failed (fail-open): ${e?.message}`);
                return true;
            }
        });
    }
    async fiscalYearExists(id) {
        return this.cached(this.existenceCache, `fy:${id}`, async () => {
            try {
                const rows = await this.dataSource.query('SELECT 1 FROM "Gnr"."FiscalYear" WHERE "FiscalYearID" = $1 LIMIT 1', [id]);
                return rows.length > 0;
            }
            catch (e) {
                console.warn(`[TenantValidationGuard] fiscal-year lookup failed (fail-open): ${e?.message}`);
                return true;
            }
        });
    }
    async isCompanyMember(userId, companyId) {
        return this.cached(this.membershipCache, `${userId}:${companyId}`, async () => {
            try {
                const rows = await this.dataSource.query('SELECT 1 FROM "Iam"."BusinessStructureUsers" WHERE "UserRef" = $1 AND "BusinessStructureRef" = $2 LIMIT 1', [userId, companyId]);
                return rows.length > 0;
            }
            catch (e) {
                console.warn(`[TenantValidationGuard] membership lookup failed (fail-open): ${e?.message}`);
                return true;
            }
        });
    }
    async cached(cache, key, resolver) {
        const now = Date.now();
        const hit = cache.get(key);
        if (hit && hit.expires > now) {
            return hit.value;
        }
        const value = await resolver();
        if (cache.size > TenantValidationGuard_1.CACHE_MAX_ENTRIES) {
            cache.clear();
        }
        cache.set(key, { value, expires: now + TenantValidationGuard_1.CACHE_TTL_MS });
        return value;
    }
};
exports.TenantValidationGuard = TenantValidationGuard;
TenantValidationGuard.CACHE_TTL_MS = 30_000;
TenantValidationGuard.CACHE_MAX_ENTRIES = 5_000;
exports.TenantValidationGuard = TenantValidationGuard = TenantValidationGuard_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(1, (0, typeorm_1.InjectDataSource)()),
    __metadata("design:paramtypes", [core_1.Reflector,
        typeorm_2.DataSource])
], TenantValidationGuard);
//# sourceMappingURL=tenant-validation.guard.js.map