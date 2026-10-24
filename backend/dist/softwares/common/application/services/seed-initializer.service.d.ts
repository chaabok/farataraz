import { OnModuleInit } from '@nestjs/common';
import { CurrencyService } from './currency.service';
import { VoucherTypeService } from '../../../accounting/application/services/voucher-type.service';
import { DetailedTypeService } from '../../../accounting/application/services/detailed-type.service';
import { BaseSettingsService } from './base-settings.service';
import { DataSource } from 'typeorm';
import { IdGenerationService } from '../../../../core/services/id-generation.service';
import { BusinessStructureService } from './business-structure.service';
import { AccountService } from '../../../accounting/application/services/account.service';
export declare class SeedInitializerService implements OnModuleInit {
    private readonly currencyService;
    private readonly voucherTypeService;
    private readonly detailedTypeService;
    private readonly baseSettingsService;
    private readonly dataSource;
    private readonly idGenerationService;
    private readonly accountService;
    private readonly businessStructureService;
    constructor(currencyService: CurrencyService, voucherTypeService: VoucherTypeService, detailedTypeService: DetailedTypeService, baseSettingsService: BaseSettingsService, dataSource: DataSource, idGenerationService: IdGenerationService, accountService: AccountService, businessStructureService: BusinessStructureService);
    onModuleInit(): Promise<void>;
    initializeSeeds(businessStructureId: number): Promise<void>;
    runStep(businessStructureId: number, step: string): Promise<{
        success: boolean;
        message?: string;
    }>;
    private executeUnseedStep;
    unseedAll(businessStructureId: number): Promise<{
        success: boolean;
        message?: string;
    }>;
    unseedStep(businessStructureId: number, step: string): Promise<{
        success: boolean;
        message?: string;
    }>;
    private generateNextId;
    private getRefs;
    private isBasicShared;
    private seedGeoLocations;
    private seedBanks;
    private seedBankAccountTypes;
    private seedAccounts;
    private seedAccountingSettings;
    private seedWarehouses;
    seedWarehouseDocumentTypes(companyId: number): Promise<void>;
}
