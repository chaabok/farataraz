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
Object.defineProperty(exports, "__esModule", { value: true });
exports.SeedInitializerService = void 0;
const common_1 = require("@nestjs/common");
const currency_service_1 = require("./currency.service");
const voucher_type_service_1 = require("../../../accounting/application/services/voucher-type.service");
const detailed_type_service_1 = require("../../../accounting/application/services/detailed-type.service");
const base_settings_service_1 = require("./base-settings.service");
const typeorm_1 = require("typeorm");
const id_generation_service_1 = require("../../../../core/services/id-generation.service");
const business_structure_service_1 = require("./business-structure.service");
const account_service_1 = require("../../../accounting/application/services/account.service");
let SeedInitializerService = class SeedInitializerService {
    constructor(currencyService, voucherTypeService, detailedTypeService, baseSettingsService, dataSource, idGenerationService, accountService, businessStructureService) {
        this.currencyService = currencyService;
        this.voucherTypeService = voucherTypeService;
        this.detailedTypeService = detailedTypeService;
        this.baseSettingsService = baseSettingsService;
        this.dataSource = dataSource;
        this.idGenerationService = idGenerationService;
        this.accountService = accountService;
        this.businessStructureService = businessStructureService;
    }
    async onModuleInit() {
        console.log('SeedInitializerService: onModuleInit - Seeding trigger moved to BusinessStructureService');
        try {
            await this.seedWarehouseDocumentTypes(2);
        }
        catch (e) {
            console.warn('SeedInitializerService: Failed auto-seeding warehouse document types:', e);
        }
    }
    async initializeSeeds(businessStructureId) {
        if (businessStructureId === 1) {
            console.log('SeedInitializerService: Skipping seeding for System Root (ID 1)');
            return;
        }
        console.log(`SeedInitializerService: Initializing seeds for BusinessStructure ${businessStructureId}`);
        try {
            const q = `
        SELECT tc.table_schema, tc.table_name, tc.constraint_name
        FROM information_schema.table_constraints AS tc
        WHERE tc.constraint_type = 'UNIQUE'
          AND tc.table_schema = 'Acc'
          AND tc.table_name IN ('VoucherType', 'DetailedTypes', 'CostCenter', 'DetailedAccounts', 'OtherDetails');
      `;
            const constraints = await this.dataSource.query(q);
            for (const c of constraints) {
                await this.dataSource.query(`ALTER TABLE "${c.table_schema}"."${c.table_name}" DROP CONSTRAINT IF EXISTS "${c.constraint_name}" CASCADE;`);
            }
            console.log(`SeedInitializerService: Cleaning up existing seeds for BS ${businessStructureId}...`);
            const del1 = await this.dataSource.query(`DELETE FROM "Acc"."DetailedTypes" WHERE "BusinessStructureRef" = $1 OR "CompanyRef" = $1`, [businessStructureId]);
            const del2 = await this.dataSource.query(`DELETE FROM "Acc"."VoucherType" WHERE "BusinessStructureRef" = $1 OR "CompanyRef" = $1`, [businessStructureId]);
            console.log(`SeedInitializerService: Cleanup results: DetailedTypes: ${del1[1] || 0}, VoucherType: ${del2[1] || 0}`);
        }
        catch (e) {
            console.error('Failed to cleanup seeds or constraints:', e);
        }
        try {
            const steps = ['currencies', 'voucherTypes', 'detailedTypes', 'baseSettings', 'geoLocations', 'banks', 'bankAccountTypes', 'accounts', 'accountingSettings', 'warehouses', 'warehouseDocumentTypes'];
            for (const step of steps) {
                await this.runStep(businessStructureId, step);
            }
            console.log(`SeedInitializerService: Seeding completed for BusinessStructure ${businessStructureId}`);
        }
        catch (error) {
            console.error(`SeedInitializerService: Error seeding for BusinessStructure ${businessStructureId}`, error);
        }
    }
    async runStep(businessStructureId, step) {
        if (businessStructureId === 1) {
            console.log('SeedInitializerService: Skipping runStep for System Root (ID 1)');
            return { success: true };
        }
        try {
            switch (step) {
                case 'currencies':
                    await this.currencyService.seedForBusinessStructure(businessStructureId);
                    break;
                case 'voucherTypes':
                    await this.voucherTypeService.seedForBusinessStructure(businessStructureId);
                    break;
                case 'detailedTypes':
                    await this.detailedTypeService.seedForBusinessStructure(businessStructureId);
                    break;
                case 'baseSettings':
                    await this.baseSettingsService.saveSettings(2, { settings: [
                            { key: 'detailedLevelsCount', value: '10' },
                            { key: 'showTrackingColumnsInVoucher', value: 'true' },
                            { key: 'requireTrackingInfoIfEnabled', value: 'false' },
                            { key: 'showCurrencyColumnsInVoucher', value: 'false' },
                            { key: 'enableLedgerAccessControl', value: 'false' },
                            { key: 'defaultCurrency', value: 'ریال' },
                            { key: 'detailedCodeLength', value: '6' },
                            { key: 'totalAccountCodeLength', value: '6' }
                        ] }, businessStructureId);
                    await this.baseSettingsService.saveSettings(1, { settings: [
                            { key: 'systemDate', value: 'Jalali' },
                            { key: 'enable2StepLogin', value: 'false' },
                            { key: 'twoStepMethod', value: 'sms' }
                        ] }, businessStructureId);
                    const isSharedVal = await this.isBasicShared(businessStructureId);
                    await this.baseSettingsService.saveSettings(7, { settings: [
                            { key: 'shareHeadquarterData', value: isSharedVal ? 'true' : 'false' },
                            { key: 'activeBusinessStructures', value: '1,2,3,4' }
                        ] }, businessStructureId);
                    await this.baseSettingsService.saveSettings(3, { settings: [
                            { key: 'itemCodeLength', value: '10' },
                            { key: 'isItemCodeLengthFixed', value: 'false' },
                            { key: 'allowItemCodeLetters', value: 'false' },
                            { key: 'isItemCodeLatin', value: 'false' },
                            { key: 'allowDuplicateItemName', value: 'false' },
                            { key: 'itemCodingMethod', value: '1' },
                            { key: 'counterStart', value: '1' },
                            { key: 'totalProductServiceGroupLength', value: '6' },
                            { key: 'mainBranchLength', value: '2' },
                            { key: 'level1BranchLength', value: '2' },
                            { key: 'level2BranchLength', value: '2' },
                            { key: 'level3BranchLength', value: '0' },
                            { key: 'level4BranchLength', value: '0' },
                            { key: 'level5BranchLength', value: '0' },
                            { key: 'trackingFactorLevelsCount', value: '20' },
                            { key: 'isTrackingFactorActiveInWarehouse', value: 'false' },
                            { key: 'isTrackingFactorActiveInItemRequest', value: 'false' },
                            { key: 'isTrackingFactorActiveInItemSupplyRequest', value: 'false' },
                            { key: 'isTrackingFactorActiveInPurchaseInvoice', value: 'false' },
                            { key: 'isTrackingFactorActiveInTemporaryReceipt', value: 'false' }
                        ] }, businessStructureId);
                    await this.baseSettingsService.saveSettings(4, { settings: [
                            { key: 'isWalletActive', value: 'true' }
                        ] }, businessStructureId);
                    break;
                case 'geoLocations':
                    await this.seedGeoLocations(businessStructureId);
                    break;
                case 'banks':
                    await this.seedBanks(businessStructureId);
                    break;
                case 'bankAccountTypes':
                    await this.seedBankAccountTypes(businessStructureId);
                    break;
                case 'accounts':
                    await this.seedAccounts(businessStructureId);
                    break;
                case 'accountingSettings':
                    await this.seedAccountingSettings(businessStructureId);
                    break;
                case 'warehouses':
                    await this.seedWarehouses(businessStructureId);
                    break;
                case 'warehouseDocumentTypes':
                    await this.seedWarehouseDocumentTypes(businessStructureId);
                    break;
                default:
                    return { success: false, message: 'Unknown step' };
            }
            return { success: true };
        }
        catch (e) {
            console.error(`Failed at step ${step} for BS ${businessStructureId}: ${e.message}`);
            return { success: false, message: e.message };
        }
    }
    async executeUnseedStep(queryExecutor, businessStructureId, step) {
        switch (step) {
            case 'currencies':
                await queryExecutor.query(`DELETE FROM "Gnr"."Currency" WHERE "CompanyRef" = $1 OR "BusinessStructureRef" = $1`, [businessStructureId]);
                break;
            case 'voucherTypes':
                await queryExecutor.query(`DELETE FROM "Acc"."VoucherItem" WHERE "CompanyRef" = $1 OR "BusinessStructureRef" = $1`, [businessStructureId]);
                await queryExecutor.query(`DELETE FROM "Acc"."Voucher" WHERE "CompanyRef" = $1 OR "BusinessStructureRef" = $1`, [businessStructureId]);
                await queryExecutor.query(`DELETE FROM "Acc"."VoucherType" WHERE "CompanyRef" = $1 OR "BusinessStructureRef" = $1`, [businessStructureId]);
                break;
            case 'detailedTypes':
                await queryExecutor.query(`DELETE FROM "Acc"."VoucherItem" WHERE "CompanyRef" = $1 OR "BusinessStructureRef" = $1`, [businessStructureId]);
                await queryExecutor.query(`DELETE FROM "Acc"."Voucher" WHERE "CompanyRef" = $1 OR "BusinessStructureRef" = $1`, [businessStructureId]);
                await queryExecutor.query(`DELETE FROM "Acc"."AccountsRelatedDeatailedAccounts" WHERE "CompanyRef" = $1 OR "BusinessStructureRef" = $1`, [businessStructureId]);
                await queryExecutor.query(`DELETE FROM "Cnt"."Contracts" WHERE "CompanyRef" = $1 OR "BusinessStructureRef" = $1`, [businessStructureId]);
                await queryExecutor.query(`DELETE FROM "Cnt"."Projects" WHERE "CompanyRef" = $1 OR "BusinessStructureRef" = $1`, [businessStructureId]);
                await queryExecutor.query(`DELETE FROM "Gnr"."Parties" WHERE "CompanyRef" = $1 OR "BusinessStructureRef" = $1`, [businessStructureId]);
                await queryExecutor.query(`DELETE FROM "Rap"."Cashes" WHERE "CompanyRef" = $1 OR "BusinessStructureRef" = $1`, [businessStructureId]);
                await queryExecutor.query(`DELETE FROM "Acc"."DetailedAccounts" WHERE "CompanyRef" = $1 OR "BusinessStructureRef" = $1`, [businessStructureId]);
                await queryExecutor.query(`DELETE FROM "Gnr"."DetailedAccountsNumbering" WHERE "CompanyRef" = $1 OR "BusinessStructureRef" = $1`, [businessStructureId]);
                await queryExecutor.query(`DELETE FROM "Acc"."DetailedTypes" WHERE "CompanyRef" = $1 OR "BusinessStructureRef" = $1`, [businessStructureId]);
                break;
            case 'baseSettings':
                await queryExecutor.query(`DELETE FROM "Gnr"."BaseSettings" WHERE "CompanyRef" = $1 OR "BusinessStructureRef" = $1`, [businessStructureId]);
                break;
            case 'geoLocations':
                await queryExecutor.query(`DELETE FROM "Gnr"."GeoLocations" WHERE "CompanyRef" = $1 OR "BusinessStructureRef" = $1`, [businessStructureId]);
                break;
            case 'banks':
                await queryExecutor.query(`DELETE FROM "Rap"."Banks" WHERE "CompanyRef" = $1 OR "BusinessStructureRef" = $1`, [businessStructureId]);
                break;
            case 'bankAccountTypes':
                await queryExecutor.query(`DELETE FROM "Rap"."BankAccountTypes" WHERE "CompanyRef" = $1 OR "BusinessStructureRef" = $1`, [businessStructureId]);
                break;
            case 'accounts':
                await queryExecutor.query(`DELETE FROM "Acc"."VoucherItem" WHERE "CompanyRef" = $1 OR "BusinessStructureRef" = $1`, [businessStructureId]);
                await queryExecutor.query(`DELETE FROM "Acc"."Voucher" WHERE "CompanyRef" = $1 OR "BusinessStructureRef" = $1`, [businessStructureId]);
                await queryExecutor.query(`DELETE FROM "Acc"."AccountsRelatedDeatailedAccounts" WHERE "CompanyRef" = $1 OR "BusinessStructureRef" = $1`, [businessStructureId]);
                await queryExecutor.query(`DELETE FROM "Acc"."Accounts" WHERE "CompanyRef" = $1 OR "BusinessStructureRef" = $1`, [businessStructureId]);
                break;
            case 'accountingSettings':
                await queryExecutor.query(`DELETE FROM "Rap"."RecieptAndPaymentAccountingSetting" WHERE "CompanyRef" = $1 OR "BusinessStructureRef" = $1`, [businessStructureId]);
                break;
            case 'warehouses':
                await queryExecutor.query(`DELETE FROM "Inv"."WarehouseUsers" WHERE "CompanyRef" = $1 OR "BusinessStructureRef" = $1`, [businessStructureId]);
                await queryExecutor.query(`DELETE FROM "Inv"."WarehouseProducts" WHERE "CompanyRef" = $1 OR "BusinessStructureRef" = $1`, [businessStructureId]);
                await queryExecutor.query(`DELETE FROM "Inv"."WarehouseAddresses" WHERE "CompanyRef" = $1 OR "BusinessStructureRef" = $1`, [businessStructureId]);
                await queryExecutor.query(`DELETE FROM "Inv"."WarehouseKeepers" WHERE "CompanyRef" = $1 OR "BusinessStructureRef" = $1`, [businessStructureId]);
                await queryExecutor.query(`DELETE FROM "Inv"."Warehouses" WHERE "CompanyRef" = $1 OR "BusinessStructureRef" = $1`, [businessStructureId]);
                break;
            case 'warehouseDocumentTypes':
                await queryExecutor.query(`DELETE FROM "Inv"."WarehouseDocumentTypes" WHERE "CompanyRef" = $1 OR "BusinessStructureRef" = $1`, [businessStructureId]);
                break;
            default:
                throw new Error('Unknown step');
        }
    }
    async unseedAll(businessStructureId) {
        const queryRunner = this.dataSource.createQueryRunner();
        await queryRunner.connect();
        await queryRunner.startTransaction();
        try {
            const steps = ['warehouses', 'accountingSettings', 'accounts', 'detailedTypes', 'voucherTypes', 'currencies', 'baseSettings', 'geoLocations', 'banks', 'bankAccountTypes'];
            for (const step of steps) {
                await this.executeUnseedStep(queryRunner, businessStructureId, step);
            }
            await queryRunner.commitTransaction();
            return { success: true };
        }
        catch (e) {
            await queryRunner.rollbackTransaction();
            if (e.code === '23503') {
                return { success: false, message: 'اطلاعات پیش‌فرض در فرم‌های دیگر استفاده شده است و قابل حذف نمی‌باشد.' };
            }
            return { success: false, message: e.message };
        }
        finally {
            queryRunner.release();
        }
    }
    async unseedStep(businessStructureId, step) {
        try {
            await this.executeUnseedStep(this.dataSource, businessStructureId, step);
            return { success: true };
        }
        catch (e) {
            if (e.code === '23503') {
                return { success: false, message: 'اطلاعات پیش‌فرض در فرم‌های دیگر استفاده شده است و قابل حذف نمی‌باشد.' };
            }
            return { success: false, message: e.message };
        }
    }
    async generateNextId(tableName, schema = 'Gnr') {
        return this.idGenerationService.generateNextId(tableName);
    }
    async getRefs(bsId) {
        const structures = await this.dataSource.query(`SELECT "BusinessStructureID", "ParentRef", "BusinessStructure" FROM "Gnr"."BusinessStructure" WHERE "BusinessStructureID" = $1`, [bsId]);
        if (structures && structures.length > 0) {
            const bs = structures[0];
            const bsType = parseInt(bs.BusinessStructure || bs.businessStructure || '0', 10);
            if (bsType === 2) {
                const parentRef = parseInt(bs.ParentRef || bs.parentRef || '0', 10);
                return { companyRef: bsId, businessStructureRef: parentRef || bsId };
            }
        }
        return { companyRef: bsId, businessStructureRef: bsId };
    }
    async isBasicShared(companyId) {
        const { businessStructureRef } = await this.getRefs(companyId);
        let isShared = true;
        try {
            const bs = await this.dataSource.query(`SELECT "IsBasicInfoShared" FROM "Gnr"."BusinessStructure" WHERE "BusinessStructureID" IN ($1, 1)`, [businessStructureRef]);
            if (bs && bs.length > 0) {
                if (bs.some((r) => {
                    const val = r.IsBasicInfoShared !== undefined ? r.IsBasicInfoShared : r.isBasicInfoShared;
                    return val === false || val === 0 || val === 'false' || val === null;
                })) {
                    isShared = false;
                }
            }
            else {
                isShared = false;
            }
        }
        catch (err) {
            isShared = false;
        }
        return isShared;
    }
    async seedGeoLocations(companyId) {
        const { companyRef, businessStructureRef } = await this.getRefs(companyId);
        const isShared = await this.isBasicShared(companyId);
        if (isShared) {
            await this.dataSource.query(`DELETE FROM "Gnr"."GeoLocations" WHERE "BusinessStructureRef" = $1`, [businessStructureRef]);
        }
        else {
            await this.dataSource.query(`DELETE FROM "Gnr"."GeoLocations" WHERE "CompanyRef" = $1`, [companyRef]);
        }
        const iranId = await this.generateNextId('GeoLocation');
        await this.dataSource.query(`INSERT INTO "Gnr"."GeoLocations" ("GeolocationID", "ParentRef", "GeographicType", "Code", "Title", "Title_En", "IsActive", "CompanyRef", "BusinessStructureRef", "CreationDate", "LastModificationDate") VALUES ($1, 0, 1, 'IR', 'ایران', 'Iran', true, $2, $3, NOW(), NOW())`, [iranId, companyRef, businessStructureRef]);
        const provinces = [];
        for (const p of provinces) {
            const pid = await this.generateNextId('GeoLocation');
            await this.dataSource.query(`INSERT INTO "Gnr"."GeoLocations" ("GeolocationID", "ParentRef", "GeographicType", "Code", "Title", "Title_En", "IsActive", "CompanyRef", "BusinessStructureRef", "CreationDate", "LastModificationDate") VALUES ($1, $2, 2, $3, $4, $5, true, $6, $7, NOW(), NOW())`, [pid, iranId, p.code, p.title, p.titleEn, companyRef, businessStructureRef]);
            const cityid = await this.generateNextId('GeoLocation');
            await this.dataSource.query(`INSERT INTO "Gnr"."GeoLocations" ("GeolocationID", "ParentRef", "GeographicType", "Code", "Title", "Title_En", "IsActive", "CompanyRef", "BusinessStructureRef", "CreationDate", "LastModificationDate") VALUES ($1, $2, 3, $3, $4, $5, true, $6, $7, NOW(), NOW())`, [cityid, pid, p.code + '-C', p.title, p.titleEn, companyRef, businessStructureRef]);
        }
    }
    async seedBanks(companyId) {
        const { companyRef, businessStructureRef } = await this.getRefs(companyId);
        const isShared = await this.isBasicShared(companyId);
        const checkQuery = isShared
            ? `SELECT COUNT(*) as count FROM "Rap"."Banks" WHERE "BusinessStructureRef" = $1`
            : `SELECT COUNT(*) as count FROM "Rap"."Banks" WHERE "CompanyRef" = $1`;
        const checkParam = isShared ? businessStructureRef : companyRef;
        let res = await this.dataSource.query(checkQuery, [checkParam]);
        if (parseInt(res[0].count, 10) > 0)
            return;
        const banks = [
            { code: 1, title: 'بانک ملی ایران', latinTitle: 'Bank Melli Iran', bankType: 1 },
            { code: 2, title: 'بانک سپه', latinTitle: 'Bank Sepah', bankType: 1 },
            { code: 3, title: 'بانک صنعت و معدن', latinTitle: 'Bank of Industry and Mine', bankType: 1 },
            { code: 4, title: 'بانک کشاورزی', latinTitle: 'Bank Keshavarzi', bankType: 1 },
            { code: 5, title: 'بانک مسکن', latinTitle: 'Bank Maskan', bankType: 1 },
            { code: 6, title: 'بانک توسعه صادرات', latinTitle: 'Export Development Bank', bankType: 1 },
            { code: 7, title: 'بانک اقتصاد نوین', latinTitle: 'Eghtesad Novin Bank', bankType: 2 },
            { code: 8, title: 'بانک پارسیان', latinTitle: 'Parsian Bank', bankType: 2 },
            { code: 9, title: 'بانک کارآفرین', latinTitle: 'Karafarin Bank', bankType: 2 },
            { code: 10, title: 'بانک سامان', latinTitle: 'Saman Bank', bankType: 2 },
            { code: 11, title: 'بانک پاسارگاد', latinTitle: 'Bank Pasargad', bankType: 2 },
            { code: 12, title: 'بانک سرمایه', latinTitle: 'Sarmayeh Bank', bankType: 2 },
            { code: 13, title: 'بانک سینا', latinTitle: 'Sina Bank', bankType: 2 },
            { code: 14, title: 'بانک شهر', latinTitle: 'Shahr Bank', bankType: 2 },
            { code: 15, title: 'بانک دی', latinTitle: 'Day Bank', bankType: 2 },
            { code: 16, title: 'بانک صادرات', latinTitle: 'Bank Saderat', bankType: 2 },
            { code: 17, title: 'بانک ملت', latinTitle: 'Bank Mellat', bankType: 2 },
            { code: 18, title: 'بانک تجارت', latinTitle: 'Bank Tejarat', bankType: 2 },
            { code: 19, title: 'بانک رفاه کارگران', latinTitle: 'Refah Bank', bankType: 2 },
            { code: 20, title: 'بانک آینده', latinTitle: 'Ayandeh Bank', bankType: 2 },
            { code: 21, title: 'بانک گردشگری', latinTitle: 'Tourism Bank', bankType: 2 },
            { code: 22, title: 'بانک خاورمیانه', latinTitle: 'Middle East Bank', bankType: 2 },
            { code: 23, title: 'بانک ایران زمین', latinTitle: 'Iran Zamin Bank', bankType: 2 },
            { code: 24, title: 'پست بانک ایران', latinTitle: 'Post Bank of Iran', bankType: 1 },
        ];
        for (const b of banks) {
            const bankId = await this.generateNextId('Bank');
            await this.dataSource.query(`INSERT INTO "Rap"."Banks" ("BankID", "Code", "Title", "LatinTitle", "BankType", "CompanyRef", "BusinessStructureRef", "CreationDate", "LastModificationDate") VALUES ($1, $2, $3, $4, $5, $6, $7, NOW(), NOW())`, [bankId, b.code, b.title, b.latinTitle, b.bankType, companyRef, businessStructureRef]);
        }
    }
    async seedBankAccountTypes(companyId) {
        const { companyRef, businessStructureRef } = await this.getRefs(companyId);
        const isShared = await this.isBasicShared(companyId);
        const checkQuery = isShared
            ? `SELECT COUNT(*) as count FROM "Rap"."BankAccountTypes" WHERE "BusinessStructureRef" = $1`
            : `SELECT COUNT(*) as count FROM "Rap"."BankAccountTypes" WHERE "CompanyRef" = $1`;
        const checkParam = isShared ? businessStructureRef : companyRef;
        let res = await this.dataSource.query(checkQuery, [checkParam]);
        if (parseInt(res[0].count, 10) > 0)
            return;
        const types = [
            { code: 1, title: 'جاری', latinTitle: 'Current' },
            { code: 2, title: 'پس انداز', latinTitle: 'Savings' },
            { code: 3, title: 'کوتاه مدت', latinTitle: 'Short Term' },
            { code: 4, title: 'بلند مدت', latinTitle: 'Long Term' },
            { code: 5, title: 'ارزی', latinTitle: 'Foreign Currency' },
        ];
        for (const t of types) {
            const nextId = await this.generateNextId('BankAccountType', 'Rap');
            await this.dataSource.query(`INSERT INTO "Rap"."BankAccountTypes" ("BankAccountTypeID", "Code", "Title", "LatinTitle", "CompanyRef", "BusinessStructureRef", "CreationDate", "LastModificationDate") VALUES ($1, $2, $3, $4, $5, $6, NOW(), NOW())`, [nextId, t.code, t.title, t.latinTitle, companyRef, businessStructureRef]);
        }
    }
    async seedAccounts(companyId) {
        const { companyRef, businessStructureRef } = await this.getRefs(companyId);
        const isShared = await this.isBasicShared(companyId);
        const checkQuery = isShared
            ? `SELECT COUNT(*) as count FROM "Acc"."Accounts" WHERE "BusinessStructureRef" = $1 AND "Code" = '0'`
            : `SELECT COUNT(*) as count FROM "Acc"."Accounts" WHERE "CompanyRef" = $1 AND "Code" = '0'`;
        const checkParam = isShared ? businessStructureRef : companyRef;
        let res = await this.dataSource.query(checkQuery, [checkParam]);
        if (parseInt(res[0]?.count || '0', 10) > 0) {
            return;
        }
        const accountId = await this.generateNextId('Account', 'Acc');
        await this.dataSource.query(`INSERT INTO "Acc"."Accounts" ("AccountID", "Code", "Title", "IsActive", "CompanyRef", "BusinessStructureRef", "CreationDate", "LastModificationDate") VALUES ($1, $2, $3, $4, $5, $6, NOW(), NOW())`, [accountId, '0', 'کدینگ حسابها', true, companyRef, businessStructureRef]);
    }
    async seedAccountingSettings(companyId) {
        const { companyRef, businessStructureRef } = await this.getRefs(companyId);
        const isShared = await this.isBasicShared(companyId);
        const checkQuery = isShared
            ? `SELECT COUNT(*) as count FROM "Rap"."RecieptAndPaymentAccountingSetting" WHERE "BusinessStructureRef" = $1`
            : `SELECT COUNT(*) as count FROM "Rap"."RecieptAndPaymentAccountingSetting" WHERE "CompanyRef" = $1`;
        const checkParam = isShared ? businessStructureRef : companyRef;
        let res = await this.dataSource.query(checkQuery, [checkParam]);
        if (parseInt(res[0].count, 10) >= 54)
            return;
        if (parseInt(res[0].count, 10) > 0) {
            const delQuery = isShared
                ? `DELETE FROM "Rap"."RecieptAndPaymentAccountingSetting" WHERE "BusinessStructureRef" = $1`
                : `DELETE FROM "Rap"."RecieptAndPaymentAccountingSetting" WHERE "CompanyRef" = $1`;
            await this.dataSource.query(delQuery, [checkParam]);
        }
        const settings = [
            { code: '1', title: 'دریافت چک تضمینی', opType: '10', entryType: '1', detType: '1', termType: '4' },
            { code: '2', title: 'دریافت چک عادی تجاری', opType: '1', entryType: '1', detType: '1', termType: '1' },
            { code: '3', title: 'دریافت چک عادی غیر تجاری', opType: '1', entryType: '1', detType: '1', termType: '1' },
            { code: '4', title: 'دریافت سفته تضمینی', opType: '10', entryType: '2', detType: '1', termType: '4' },
            { code: '5', title: 'دریافت سفته عادی تجاری', opType: '1', entryType: '2', detType: '1', termType: '1' },
            { code: '6', title: 'دریافت سفته عادی غیر تجاری', opType: '1', entryType: '2', detType: '1', termType: '1' },
            { code: '7', title: 'اعلامیه واریز ریالی', opType: '1', entryType: '5', detType: '3', termType: '1' },
            { code: '8', title: 'اعلامیه واریز ارزی', opType: '1', entryType: '5', detType: '3', termType: '1' },
            { code: '9', title: 'تبدیل چک دریافتی تضمینی به عادی', opType: '1', entryType: '1', detType: '1', termType: '2' },
            { code: '10', title: 'تبدیل سفته دریافتی تضمینی به عادی', opType: '1', entryType: '2', detType: '1', termType: '2' },
            { code: '11', title: 'پرداخت چک عادی روز ریالی', opType: '2', entryType: '1', detType: '1', termType: '1' },
            { code: '12', title: 'پرداخت چک تضمینی', opType: '2', entryType: '1', detType: '1', termType: '4' },
            { code: '13', title: 'پرداخت چک عادی روز ارزی', opType: '2', entryType: '1', detType: '1', termType: '1' },
            { code: '14', title: 'پرداخت چک کوتاه مدت تجاری', opType: '2', entryType: '1', detType: '1', termType: '2' },
            { code: '15', title: 'پرداخت چک کوتاه مدت غیر تجاری', opType: '2', entryType: '1', detType: '1', termType: '2' },
            { code: '16', title: 'پرداخت چک بلند مدت تجاری', opType: '2', entryType: '1', detType: '1', termType: '3' },
            { code: '17', title: 'پرداخت چک بلند مدت غیر تجاری', opType: '2', entryType: '1', detType: '1', termType: '3' },
            { code: '18', title: 'پرداخت سفته کوتاه مدت تجاری', opType: '2', entryType: '2', detType: '1', termType: '2' },
            { code: '19', title: 'پرداخت سفته تضمینی', opType: '2', entryType: '2', detType: '1', termType: '4' },
            { code: '20', title: 'پرداخت سفته کوتاه مدت غیر تجاری', opType: '2', entryType: '2', detType: '1', termType: '2' },
            { code: '21', title: 'پرداخت سفته بلند مدت تجاری', opType: '2', entryType: '2', detType: '1', termType: '3' },
            { code: '22', title: 'پرداخت سفته بلند مدت غیر تجاری', opType: '2', entryType: '2', detType: '1', termType: '3' },
            { code: '23', title: 'اعلامیه برداشت ریالی', opType: '2', entryType: '7', detType: '3', termType: '1' },
            { code: '24', title: 'اعلامیه برداشت ارزی', opType: '2', entryType: '7', detType: '3', termType: '1' },
            { code: '25', title: 'تبدیل چک پرداختی تضمینی به عادی', opType: '2', entryType: '1', detType: '1', termType: '2' },
            { code: '26', title: 'تبدیل سفته پرداختی تضمینی به عادی', opType: '2', entryType: '2', detType: '1', termType: '2' },
            { code: '27', title: 'واگذار چک به بانک', opType: '6', entryType: '1', detType: '1', termType: '4' },
            { code: '28', title: 'واگذار سفته به بانک', opType: '6', entryType: '2', detType: '1', termType: '4' },
            { code: '29', title: 'وصول چک ریالی', opType: '7', entryType: '1', detType: '1', termType: '4' },
            { code: '30', title: 'وصول چک ارزی', opType: '7', entryType: '1', detType: '1', termType: '4' },
            { code: '31', title: 'وصول سفته', opType: '7', entryType: '2', detType: '1', termType: '4' },
            { code: '32', title: 'واخواست چک', opType: '8', entryType: '1', detType: '1', termType: '4' },
            { code: '33', title: 'واخواست سفته', opType: '8', entryType: '2', detType: '1', termType: '4' },
            { code: '34', title: 'تغییر مدت چک کوتاه مدت به روز', opType: '9', entryType: '1', detType: '1', termType: '1' },
            { code: '35', title: 'تغییر مدت چک بلند مدت تجاری به کوتاه مدت تجاری', opType: '9', entryType: '1', detType: '1', termType: '2' },
            { code: '36', title: 'تغییر مدت چک بلند مدت غیر تجاری به کوتاه مدت غیر تجاری', opType: '9', entryType: '1', detType: '1', termType: '2' },
            { code: '37', title: 'تغییر مدت چک کوتاه مدت تجاری به بلندمدت تجاری', opType: '9', entryType: '1', detType: '1', termType: '3' },
            { code: '38', title: 'تغییر مدت چک کوتاه مدت غیر تجاری به بلندمدت غیر تجاری', opType: '9', entryType: '1', detType: '1', termType: '3' },
            { code: '39', title: 'تغییر مدت چک روز به کوتاه مدت تجاری', opType: '9', entryType: '1', detType: '1', termType: '2' },
            { code: '40', title: 'تغییر مدت چک روز به کوتاه مدت غیر تجاری', opType: '9', entryType: '1', detType: '1', termType: '2' },
            { code: '41', title: 'تغییر مدت سفته کوتاه مدت به روز', opType: '9', entryType: '2', detType: '1', termType: '1' },
            { code: '42', title: 'تغییر مدت سفته بلند مدت تجاری به کوتاه مدت تجاری', opType: '9', entryType: '2', detType: '1', termType: '2' },
            { code: '43', title: 'تغییر مدت سفته بلند مدت غیر تجاری به کوتاه مدت غیر تجاری', opType: '9', entryType: '2', detType: '1', termType: '2' },
            { code: '44', title: 'تغییر مدت سفته کوتاه مدت تجاری به بلندمدت تجاری', opType: '9', entryType: '2', detType: '1', termType: '3' },
            { code: '45', title: 'تغییر مدت سفته کوتاه مدت غیر تجاری به بلندمدت غیر تجاری', opType: '9', entryType: '2', detType: '1', termType: '3' },
            { code: '46', title: 'تغییر مدت سفته روز به کوتاه مدت تجاری', opType: '9', entryType: '2', detType: '1', termType: '2' },
            { code: '47', title: 'تغییر مدت سفته روز به کوتاه مدت غیر تجاری', opType: '9', entryType: '2', detType: '1', termType: '2' },
            { code: '48', title: 'انتقالی بانک به بانک', opType: '2', entryType: '7', detType: '3', termType: '1' },
            { code: '49', title: 'انتقالی صندوق به بانک', opType: '2', entryType: '7', detType: '2', termType: '1' },
            { code: '50', title: 'تبدیل چک پرداختی تضمینی به عادی روز', opType: '9', entryType: '1', detType: '1', termType: '1' },
            { code: '51', title: 'تبدیل چک پرداختی تضمینی به عادی بلند مدت', opType: '9', entryType: '1', detType: '1', termType: '3' },
            { code: '52', title: 'تبدیل چک پرداختی تضمینی به عادی کوتاه مدت', opType: '9', entryType: '1', detType: '1', termType: '2' },
            { code: '53', title: 'انتقالی بانک به صندوق', opType: '2', entryType: '7', detType: '3', termType: '1' },
            { code: '54', title: 'دریافت نقدی کارتخوان', opType: '1', entryType: '6', detType: '4', termType: '4' },
            { code: '55', title: 'دریافت ضمانت‌نامه بانکی', opType: '1', entryType: '8', detType: '1', termType: '4' },
            { code: '56', title: 'دریافت سفته تضمینی', opType: '1', entryType: '8', detType: '1', termType: '4' },
            { code: '57', title: 'دریافت چک تضمینی', opType: '1', entryType: '8', detType: '1', termType: '4' },
        ];
        for (const s of settings) {
            const settingId = await this.generateNextId('RecieptAndPaymentAccountingSetting', 'Rap');
            await this.dataSource.query(`INSERT INTO "Rap"."RecieptAndPaymentAccountingSetting" ("RecieptAndPaymentAccountingSettingID", "Code", "Title", "operationType", "usedEntryType", "detailedType", "termType", "isActive", "isDefault", "CompanyRef", "BusinessStructureRef", "CreationDate", "LastModificationDate") VALUES ($1, $2, $3, $4, $5, $6, $7, true, false, $8, $9, NOW(), NOW())`, [settingId, s.code, s.title, s.opType, s.entryType, s.detType, s.termType, companyRef, businessStructureRef]);
        }
    }
    async seedWarehouses(companyId) {
        const { companyRef, businessStructureRef } = await this.getRefs(companyId);
        const isShared = await this.isBasicShared(companyId);
        const checkQuery = isShared
            ? `SELECT COUNT(*) as count FROM "Inv"."Warehouses" WHERE "BusinessStructureRef" = $1`
            : `SELECT COUNT(*) as count FROM "Inv"."Warehouses" WHERE "CompanyRef" = $1`;
        const checkParam = isShared ? businessStructureRef : companyRef;
        let res = await this.dataSource.query(checkQuery, [checkParam]);
        if (parseInt(res[0]?.count || '0', 10) > 0)
            return;
        const defaultWarehouses = [
            { code: '1', title: 'انبار', type: 1, nature: 1 },
            { code: '2', title: 'انبار مواد اولیه', type: 1, nature: 1 },
            { code: '3', title: 'انبار نیمه ساخته', type: 1, nature: 2 },
        ];
        for (const w of defaultWarehouses) {
            const warehouseId = await this.generateNextId('Warehouses', 'Inv');
            await this.dataSource.query(`INSERT INTO "Inv"."Warehouses" ("WarehouseID", "WarehouseCode", "WarehouseTitle", "WarehouseType", "WarehouseNature", "CompanyRef", "BusinessStructureRef", "CreationDate", "LastModificationDate") VALUES ($1, $2, $3, $4, $5, $6, $7, NOW(), NOW())`, [warehouseId, w.code, w.title, w.type, w.nature, companyRef, businessStructureRef]);
        }
    }
    async seedWarehouseDocumentTypes(companyId) {
        const { companyRef, businessStructureRef } = await this.getRefs(companyId);
        const isShared = await this.isBasicShared(companyId);
        const items = [
            { code: 1, title: 'موجودی ابتدای دوره', nature: 1 },
            { code: 2, title: 'رسید خرید', nature: 1 },
            { code: 3, title: 'رسید موقت', nature: 1 },
            { code: 4, title: 'دریافت از تولید', nature: 1 },
            { code: 5, title: 'برگشت از مصرف مرکز', nature: 1 },
            { code: 7, title: 'برگشت از مصرف پروژه', nature: 1 },
            { code: 12, title: 'اضافی انبارگردانی', nature: 1 },
            { code: 16, title: 'رسید برگشت از ضایعات', nature: 1 },
            { code: 17, title: 'رسید انتقال بین انبارها', nature: 1 },
            { code: 18, title: 'برگشت از فروش', nature: 1 },
            { code: 19, title: 'رسید تبدیل کالا', nature: 1 },
            { code: 20, title: 'برگشت از تولید', nature: 1 },
            { code: 22, title: 'دریافت از پروژه', nature: 1 },
            { code: 23, title: 'دریافت امانی دیگران نزد ما', nature: 1 },
            { code: 24, title: 'برگشت امانی ما نزد دیگران', nature: 1 },
            { code: 25, title: 'رسید تغییر عامل کنترل موجودی', nature: 1 },
            { code: 26, title: 'مرجوعی از فروش جهت اصلاح', nature: 1 },
            { code: 51, title: 'مصرف مرکز', nature: 2 },
            { code: 52, title: 'مرجوعی به تولید', nature: 2 },
            { code: 53, title: 'مصرف پروژه', nature: 2 },
            { code: 55, title: 'برگشت به خرید داخلی', nature: 2 },
            { code: 57, title: 'ارسال به تولید', nature: 2 },
            { code: 62, title: 'کسری انبارگردانی', nature: 2 },
            { code: 64, title: 'برگشت به خرید خارجی', nature: 2 },
            { code: 66, title: 'تحویل ضایعات', nature: 2 },
            { code: 68, title: 'حواله انتقال بین انبارها', nature: 2 },
            { code: 69, title: 'تحویل فروش', nature: 2 },
            { code: 70, title: 'حواله تبدیل کالا', nature: 2 },
            { code: 71, title: 'تحویل دارایی ثابت', nature: 2 },
            { code: 72, title: 'مرجوعی به پروژه', nature: 2 },
            { code: 73, title: 'ارسال امانی ما نزد دیگران', nature: 2 },
            { code: 74, title: 'برگشت امانی دیگران نزد ما', nature: 2 },
            { code: 75, title: 'حواله تغییر عامل کنترل موجودی', nature: 2 },
            { code: 79, title: 'تخفیفات و جوایز جنسی', nature: 2 },
            { code: 100, title: 'امحاء / ضایعات', nature: 2 },
            { code: 9999, title: 'فاکتور خرید کالا', nature: 3 },
            { code: 9998, title: 'درخواست تامین کالا', nature: 3 },
            { code: 9997, title: 'درخواست کالا', nature: 3 },
            { code: 9996, title: 'رسید موقت', nature: 3 },
            { code: 9995, title: 'شمارش انبارگردانی', nature: 3 },
        ];
        for (const item of items) {
            const checkQuery = isShared
                ? `SELECT COUNT(*) as count FROM "Inv"."WarehouseDocumentTypes" WHERE "BusinessStructureRef" = $1 AND "WarehouseDocumentTypeCode" = $2`
                : `SELECT COUNT(*) as count FROM "Inv"."WarehouseDocumentTypes" WHERE "CompanyRef" = $1 AND "WarehouseDocumentTypeCode" = $2`;
            const checkParam = isShared ? businessStructureRef : companyRef;
            const res = await this.dataSource.query(checkQuery, [checkParam, item.code]);
            if (parseInt(res[0]?.count || '0', 10) === 0) {
                const id = await this.generateNextId('WarehouseDocumentTypes', 'Inv');
                await this.dataSource.query(`INSERT INTO "Inv"."WarehouseDocumentTypes" (
            "WarehouseDocumentTypeID",
            "WarehouseDocumentTypeCode",
            "WarehouseDocumentTypeTitle",
            "WarehouseDocumentNature",
            "WarehouseName",
            "DisplayableItemNatures",
            "HasBaseDocument",
            "IsActive",
            "CompanyRef",
            "BusinessStructureRef",
            "CreationDate",
            "LastModificationDate"
          ) VALUES ($1, $2, $3, $4, $5, $6, false, true, $7, $8, NOW(), NOW())`, [
                    id,
                    item.code,
                    item.title,
                    item.nature,
                    'انبار اصلی',
                    JSON.stringify([1, 2, 3]),
                    companyRef,
                    businessStructureRef,
                ]);
            }
        }
    }
};
exports.SeedInitializerService = SeedInitializerService;
exports.SeedInitializerService = SeedInitializerService = __decorate([
    (0, common_1.Injectable)(),
    __param(6, (0, common_1.Inject)((0, common_1.forwardRef)(() => account_service_1.AccountService))),
    __param(7, (0, common_1.Inject)((0, common_1.forwardRef)(() => business_structure_service_1.BusinessStructureService))),
    __metadata("design:paramtypes", [currency_service_1.CurrencyService,
        voucher_type_service_1.VoucherTypeService,
        detailed_type_service_1.DetailedTypeService,
        base_settings_service_1.BaseSettingsService,
        typeorm_1.DataSource,
        id_generation_service_1.IdGenerationService,
        account_service_1.AccountService,
        business_structure_service_1.BusinessStructureService])
], SeedInitializerService);
//# sourceMappingURL=seed-initializer.service.js.map