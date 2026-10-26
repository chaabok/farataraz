import { CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { LicenseService } from '../license/license.service';
export declare class LicenseEnforcementGuard implements CanActivate {
    private readonly reflector;
    private readonly licenseService;
    constructor(reflector: Reflector, licenseService: LicenseService);
    canActivate(context: ExecutionContext): boolean;
    private isExemptPath;
}
