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
Object.defineProperty(exports, "__esModule", { value: true });
exports.LicenseEnforcementGuard = void 0;
const common_1 = require("@nestjs/common");
const core_1 = require("@nestjs/core");
const public_decorator_1 = require("../../auth/public.decorator");
const license_service_1 = require("../license/license.service");
let LicenseEnforcementGuard = class LicenseEnforcementGuard {
    constructor(reflector, licenseService) {
        this.reflector = reflector;
        this.licenseService = licenseService;
    }
    canActivate(context) {
        if (process.env.LICENSE_ENFORCEMENT === 'false') {
            return true;
        }
        const isPublic = this.reflector.getAllAndOverride(public_decorator_1.IS_PUBLIC_KEY, [
            context.getHandler(),
            context.getClass(),
        ]);
        if (isPublic) {
            return true;
        }
        const request = context.switchToHttp().getRequest();
        const rawPath = request?.path || request?.url || '';
        if (this.isExemptPath(rawPath)) {
            return true;
        }
        if (this.licenseService.isLicenseValid()) {
            return true;
        }
        throw new common_1.ForbiddenException({
            error: 'لایسنس نرم‌افزار نامعتبر یا منقضی شده است. لطفاً از طریق پنجره فعال‌سازی، لایسنس را وارد کنید.',
        });
    }
    isExemptPath(rawPath) {
        const p = (rawPath || '').split('?')[0];
        return /^\/(api\/)?(license|auth|health)(\/|$)/.test(p);
    }
};
exports.LicenseEnforcementGuard = LicenseEnforcementGuard;
exports.LicenseEnforcementGuard = LicenseEnforcementGuard = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [core_1.Reflector,
        license_service_1.LicenseService])
], LicenseEnforcementGuard);
//# sourceMappingURL=license-enforcement.guard.js.map