import { CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { DataSource } from 'typeorm';
export declare class TenantValidationGuard implements CanActivate {
    private readonly reflector;
    private readonly dataSource;
    private static readonly CACHE_TTL_MS;
    private static readonly CACHE_MAX_ENTRIES;
    private readonly existenceCache;
    private readonly membershipCache;
    constructor(reflector: Reflector, dataSource: DataSource);
    canActivate(context: ExecutionContext): Promise<boolean>;
    private hasWildcardAccess;
    private parseId;
    private businessStructureExists;
    private fiscalYearExists;
    private isCompanyMember;
    private cached;
}
