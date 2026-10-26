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
exports.StandardItemRateService = void 0;
const common_1 = require("@nestjs/common");
const standard_item_rate_repository_interface_1 = require("../../domain/repositories/standard-item-rate.repository.interface");
const id_generation_service_1 = require("../../../../core/services/id-generation.service");
const request_context_service_1 = require("../../../../core/services/request-context.service");
const date_parser_1 = require("../../../../core/utils/date-parser");
let StandardItemRateService = class StandardItemRateService {
    constructor(repository, idGenerationService, requestContextService) {
        this.repository = repository;
        this.idGenerationService = idGenerationService;
        this.requestContextService = requestContextService;
        this.ensureTables();
    }
    async ensureTables() {
        try {
            await this.repository.manager.connection.query(`
        CREATE SCHEMA IF NOT EXISTS "Inv";

        CREATE TABLE IF NOT EXISTS "Inv"."StandardItemRates" (
          "StandardItemRateID" bigint PRIMARY KEY,
          "Version" bigint DEFAULT 1,
          "Creator" bigint DEFAULT 1,
          "CreationDate" timestamp DEFAULT CURRENT_TIMESTAMP,
          "CreateTime" varchar(8) DEFAULT '00:00:00',
          "LastModifier" bigint DEFAULT 1,
          "LastModificationDate" timestamp DEFAULT CURRENT_TIMESTAMP,
          "LastModificationTime" varchar(8) DEFAULT '00:00:00',
          "BusinessStructureRef" bigint DEFAULT 2,
          "CompanyRef" bigint DEFAULT 2,
          "BranchRef" bigint,
          "AgencyRef" bigint,
          "FiscalYearRef" bigint,
          "ItemAccountCategoryRef" bigint,
          "EffectiveDate" varchar(10),
          "Description" varchar(500)
        );

        ALTER TABLE "Inv"."StandardItemRates" ADD COLUMN IF NOT EXISTS "FiscalYearRef" bigint;

        CREATE TABLE IF NOT EXISTS "Inv"."StandardItemRateDetails" (
          "StandardItemRateDetailID" bigint PRIMARY KEY,
          "Version" bigint DEFAULT 1,
          "Creator" bigint DEFAULT 1,
          "CreationDate" timestamp DEFAULT CURRENT_TIMESTAMP,
          "CreateTime" varchar(8) DEFAULT '00:00:00',
          "LastModifier" bigint DEFAULT 1,
          "LastModificationDate" timestamp DEFAULT CURRENT_TIMESTAMP,
          "LastModificationTime" varchar(8) DEFAULT '00:00:00',
          "BusinessStructureRef" bigint DEFAULT 2,
          "CompanyRef" bigint DEFAULT 2,
          "BranchRef" bigint,
          "AgencyRef" bigint,
          "StandardItemRateRef" bigint NOT NULL,
          "ItemRef" bigint NOT NULL,
          "UnitRate" decimal(18, 4) DEFAULT 0
        );
      `);
        }
        catch (e) {
            console.warn("Ensuring Inv.StandardItemRates tables warning:", e);
        }
    }
    async getScope() {
        let bsId = this.requestContextService.getBusinessStructureId() ?? 2;
        let compId = this.requestContextService.getCompanyId() ?? 2;
        let fiscalYearId = this.requestContextService.getFiscalYearId();
        if (bsId <= 1)
            bsId = 2;
        if (compId <= 1)
            compId = 2;
        let isShared = true;
        try {
            const rows = await this.repository.manager.connection.query(`SELECT "IsBasicInfoShared" FROM "Gnr"."BusinessStructure" WHERE "BusinessStructureID" IN ($1, 1)`, [bsId]);
            if (rows && rows.length > 0) {
                if (rows.some((r) => {
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
        return { bsId, compId, isShared, fiscalYearId };
    }
    async findAll(query) {
        await this.ensureTables();
        const { skip, take, fiscalYearRef } = query;
        const { bsId, compId, isShared, fiscalYearId } = await this.getScope();
        const activeFyId = fiscalYearRef ? Number(fiscalYearRef) : fiscalYearId;
        let whereConditions = [];
        const params = [];
        if (isShared) {
            params.push(bsId);
            whereConditions.push(`sir."BusinessStructureRef" = $${params.length}`);
        }
        else {
            params.push(compId);
            whereConditions.push(`sir."CompanyRef" = $${params.length}`);
        }
        if (activeFyId) {
            params.push(activeFyId);
            whereConditions.push(`(sir."FiscalYearRef" = $${params.length} OR sir."FiscalYearRef" IS NULL)`);
        }
        const whereClause = whereConditions.length > 0 ? `WHERE ${whereConditions.join(' AND ')}` : '';
        try {
            const rows = await this.repository.manager.connection.query(`SELECT 
          sir."StandardItemRateID",
          sir."FiscalYearRef",
          sir."ItemAccountCategoryRef",
          sir."EffectiveDate",
          sir."Description",
          cat."ItemAccountCategoryCode",
          cat."ItemAccountCategoryName",
          cat."ItemAccountCategoryName2",
          cat."PricingMethod"
         FROM "Inv"."StandardItemRates" sir
         LEFT JOIN "Inv"."ItemAccountCategories" cat ON cat."ItemAccountCategoryID" = sir."ItemAccountCategoryRef"
         ${whereClause}
         ORDER BY sir."StandardItemRateID" DESC
         LIMIT ${take ? parseInt(take, 10) : 100} OFFSET ${skip ? parseInt(skip, 10) : 0}`, params);
            const countRows = await this.repository.manager.connection.query(`SELECT COUNT(*) as total FROM "Inv"."StandardItemRates" sir ${whereClause}`, params);
            const total = countRows && countRows[0] ? parseInt(countRows[0].total, 10) : 0;
            return { data: rows || [], total, success: true };
        }
        catch (err) {
            console.error('Error in StandardItemRateService.findAll:', err);
            return { data: [], total: 0, success: false };
        }
    }
    async getItemsByCategory(categoryId, rateId) {
        await this.ensureTables();
        const { bsId, compId, isShared } = await this.getScope();
        let whereClause = '';
        const params = [];
        if (categoryId && categoryId > 0) {
            params.push(categoryId);
            if (isShared) {
                whereClause = 'WHERE i."ItemAccountCategoryRef" = $1 AND i."BusinessStructureRef" = $2 AND (i."IsActive" IS TRUE OR i."IsActive" IS NULL)';
                params.push(bsId);
            }
            else {
                whereClause = 'WHERE i."ItemAccountCategoryRef" = $1 AND i."CompanyRef" = $2 AND (i."IsActive" IS TRUE OR i."IsActive" IS NULL)';
                params.push(compId);
            }
        }
        else {
            if (isShared) {
                params.push(bsId);
                whereClause = 'WHERE i."BusinessStructureRef" = $1 AND (i."IsActive" IS TRUE OR i."IsActive" IS NULL)';
            }
            else {
                params.push(compId);
                whereClause = 'WHERE i."CompanyRef" = $1 AND (i."IsActive" IS TRUE OR i."IsActive" IS NULL)';
            }
        }
        try {
            let existingRatesMap = new Map();
            if (rateId) {
                const rateDetails = await this.repository.manager.connection.query(`SELECT "ItemRef", "UnitRate" FROM "Inv"."StandardItemRateDetails" WHERE "StandardItemRateRef" = $1`, [rateId]);
                for (const rd of (rateDetails || [])) {
                    existingRatesMap.set(Number(rd.ItemRef), rd.UnitRate !== null && rd.UnitRate !== undefined ? Number(rd.UnitRate) : 0);
                }
            }
            const rows = await this.repository.manager.connection.query(`SELECT 
          i."ItemID",
          i."ItemCode",
          i."ItemName",
          i."ItemName2",
          i."MeasurementUnitRef",
          mu."MeasurementUnitName" AS "MeasurementUnitName"
         FROM "Inv"."Items" i
         LEFT JOIN "Inv"."MeasurementUnits" mu ON mu."MeasurementUnitID" = i."MeasurementUnitRef"
         ${whereClause}
         ORDER BY i."ItemCode" ASC, i."ItemID" ASC`, params);
            return (rows || []).map((r) => {
                const itemId = Number(r.ItemID);
                const unitRate = existingRatesMap.has(itemId) ? existingRatesMap.get(itemId) : 0;
                return {
                    ItemID: itemId,
                    ItemCode: r.ItemCode !== null && r.ItemCode !== undefined ? String(r.ItemCode) : '',
                    ItemName: r.ItemName || '',
                    ItemName2: r.ItemName2 || '',
                    MeasurementUnitRef: r.MeasurementUnitRef ? Number(r.MeasurementUnitRef) : null,
                    MeasurementUnitName: r.MeasurementUnitName || '',
                    UnitRate: unitRate,
                };
            });
        }
        catch (err) {
            console.error('Error fetching items by category:', err);
            return [];
        }
    }
    async findOne(id) {
        await this.ensureTables();
        const rows = await this.repository.manager.connection.query(`SELECT 
        sir."StandardItemRateID",
        sir."FiscalYearRef",
        sir."ItemAccountCategoryRef",
        sir."EffectiveDate",
        sir."Description",
        cat."ItemAccountCategoryCode",
        cat."ItemAccountCategoryName",
        cat."ItemAccountCategoryName2",
        cat."PricingMethod",
        cat."StandardRate"
       FROM "Inv"."StandardItemRates" sir
       LEFT JOIN "Inv"."ItemAccountCategories" cat ON cat."ItemAccountCategoryID" = sir."ItemAccountCategoryRef"
       WHERE sir."StandardItemRateID" = $1`, [id]);
        if (!rows || rows.length === 0) {
            throw new common_1.NotFoundException('نرخ استاندارد کالا یافت نشد');
        }
        const header = rows[0];
        const categoryRef = header.ItemAccountCategoryRef ? Number(header.ItemAccountCategoryRef) : null;
        const details = await this.getItemsByCategory(categoryRef, id);
        return {
            ...header,
            StandardItemRateID: Number(header.StandardItemRateID),
            FiscalYearRef: header.FiscalYearRef ? Number(header.FiscalYearRef) : null,
            ItemAccountCategoryRef: categoryRef,
            details,
        };
    }
    async validateEffectiveDate(categoryId, effectiveDate, excludeId) {
        await this.ensureTables();
        if (!categoryId || !effectiveDate)
            return { valid: true };
        const isoDate = (0, date_parser_1.parseToIsoDateString)(effectiveDate);
        if (!isoDate)
            return { valid: true };
        const { bsId, compId, isShared } = await this.getScope();
        let scopeWhere = '';
        const params = [categoryId];
        if (isShared) {
            params.push(bsId);
            scopeWhere = 'AND "BusinessStructureRef" = $2';
        }
        else {
            params.push(compId);
            scopeWhere = 'AND "CompanyRef" = $2';
        }
        let excludeWhere = '';
        if (excludeId) {
            params.push(excludeId);
            excludeWhere = `AND "StandardItemRateID" <> $${params.length}`;
        }
        const rows = await this.repository.manager.connection.query(`SELECT "StandardItemRateID", "EffectiveDate" 
       FROM "Inv"."StandardItemRates"
       WHERE "ItemAccountCategoryRef" = $1 ${scopeWhere} ${excludeWhere}`, params);
        if (!rows || rows.length === 0) {
            return { valid: true };
        }
        let maxIsoDate = '';
        let duplicateFound = false;
        let smallerFound = false;
        for (const r of rows) {
            if (!r.EffectiveDate)
                continue;
            const rIso = (0, date_parser_1.parseToIsoDateString)(r.EffectiveDate);
            if (!rIso)
                continue;
            if (!maxIsoDate || rIso > maxIsoDate) {
                maxIsoDate = rIso;
            }
            if (rIso === isoDate) {
                duplicateFound = true;
            }
            else if (rIso > isoDate) {
                smallerFound = true;
            }
        }
        if (duplicateFound) {
            return {
                valid: false,
                message: 'امکان ثبت نرخ مجدد برای این طبقه در تاریخ موثر تکراری وجود ندارد. تاریخ موثر جدید باید بزرگتر از تاریخ موثر قبلی باشد.',
                maxEffectiveDate: maxIsoDate,
            };
        }
        if (smallerFound || (maxIsoDate && isoDate <= maxIsoDate)) {
            return {
                valid: false,
                message: 'تاریخ موثر نرخ استاندارد برای این طبقه باید بزرگتر از آخرین تاریخ موثر ثبت شده باشد.',
                maxEffectiveDate: maxIsoDate,
            };
        }
        return { valid: true, maxEffectiveDate: maxIsoDate };
    }
    async create(createDto) {
        await this.ensureTables();
        const userId = this.requestContextService.getUserId();
        const companyId = (this.requestContextService.getCompanyId() && this.requestContextService.getCompanyId() > 1) ? this.requestContextService.getCompanyId() : 2;
        const bsId = (this.requestContextService.getBusinessStructureId() && this.requestContextService.getBusinessStructureId() > 1) ? this.requestContextService.getBusinessStructureId() : 2;
        const fyId = createDto.FiscalYearRef ? Number(createDto.FiscalYearRef) : (this.requestContextService.getFiscalYearId() || null);
        const catRef = createDto.ItemAccountCategoryRef ? Number(createDto.ItemAccountCategoryRef) : null;
        if (catRef && createDto.EffectiveDate) {
            const dateCheck = await this.validateEffectiveDate(catRef, createDto.EffectiveDate);
            if (!dateCheck.valid) {
                throw new common_1.BadRequestException(dateCheck.message);
            }
        }
        const id = await this.idGenerationService.generateNextId('StandardItemRates');
        await this.repository.manager.connection.query(`INSERT INTO "Inv"."StandardItemRates"
       ("StandardItemRateID", "ItemAccountCategoryRef", "EffectiveDate", "Description", "BusinessStructureRef", "CompanyRef", "Creator", "FiscalYearRef")
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`, [
            id,
            catRef,
            createDto.EffectiveDate || null,
            createDto.Description || null,
            createDto.businessStructureRef || bsId,
            createDto.companyRef || companyId,
            userId || 1,
            fyId
        ]);
        if (Array.isArray(createDto.details) && createDto.details.length > 0) {
            for (const d of createDto.details) {
                if (!d.ItemRef)
                    continue;
                const detailId = await this.idGenerationService.generateNextId('StandardItemRateDetails');
                await this.repository.manager.connection.query(`INSERT INTO "Inv"."StandardItemRateDetails"
           ("StandardItemRateDetailID", "StandardItemRateRef", "ItemRef", "UnitRate", "BusinessStructureRef", "CompanyRef", "Creator")
           VALUES ($1, $2, $3, $4, $5, $6, $7)`, [
                    detailId,
                    id,
                    Number(d.ItemRef),
                    d.UnitRate !== undefined && d.UnitRate !== null ? parseFloat(String(d.UnitRate)) : 0,
                    createDto.businessStructureRef || bsId,
                    createDto.companyRef || companyId,
                    userId || 1
                ]);
            }
        }
        return this.findOne(id);
    }
    async update(id, updateDto) {
        await this.ensureTables();
        await this.findOne(id);
        const userId = this.requestContextService.getUserId();
        const { bsId, compId } = await this.getScope();
        const fyId = updateDto.FiscalYearRef ? Number(updateDto.FiscalYearRef) : (this.requestContextService.getFiscalYearId() || null);
        const catRef = updateDto.ItemAccountCategoryRef ? Number(updateDto.ItemAccountCategoryRef) : null;
        if (catRef && updateDto.EffectiveDate) {
            const dateCheck = await this.validateEffectiveDate(catRef, updateDto.EffectiveDate, id);
            if (!dateCheck.valid) {
                throw new common_1.BadRequestException(dateCheck.message);
            }
        }
        await this.repository.manager.connection.query(`UPDATE "Inv"."StandardItemRates"
       SET "ItemAccountCategoryRef" = $1,
           "EffectiveDate" = $2,
           "Description" = $3,
           "LastModifier" = $4,
           "LastModificationDate" = CURRENT_TIMESTAMP,
           "FiscalYearRef" = COALESCE($5, "FiscalYearRef")
       WHERE "StandardItemRateID" = $6`, [
            catRef,
            updateDto.EffectiveDate || null,
            updateDto.Description || null,
            userId || 1,
            fyId,
            id
        ]);
        await this.repository.manager.connection.query(`DELETE FROM "Inv"."StandardItemRateDetails" WHERE "StandardItemRateRef" = $1`, [id]);
        if (Array.isArray(updateDto.details) && updateDto.details.length > 0) {
            for (const d of updateDto.details) {
                if (!d.ItemRef)
                    continue;
                const detailId = await this.idGenerationService.generateNextId('StandardItemRateDetails');
                await this.repository.manager.connection.query(`INSERT INTO "Inv"."StandardItemRateDetails"
           ("StandardItemRateDetailID", "StandardItemRateRef", "ItemRef", "UnitRate", "BusinessStructureRef", "CompanyRef", "Creator")
           VALUES ($1, $2, $3, $4, $5, $6, $7)`, [
                    detailId,
                    id,
                    Number(d.ItemRef),
                    d.UnitRate !== undefined && d.UnitRate !== null ? parseFloat(String(d.UnitRate)) : 0,
                    bsId,
                    compId,
                    userId || 1
                ]);
            }
        }
        return this.findOne(id);
    }
    async remove(id) {
        await this.ensureTables();
        await this.findOne(id);
        await this.repository.manager.connection.query(`DELETE FROM "Inv"."StandardItemRateDetails" WHERE "StandardItemRateRef" = $1`, [id]);
        await this.repository.manager.connection.query(`DELETE FROM "Inv"."StandardItemRates" WHERE "StandardItemRateID" = $1`, [id]);
    }
};
exports.StandardItemRateService = StandardItemRateService;
exports.StandardItemRateService = StandardItemRateService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, common_1.Inject)(standard_item_rate_repository_interface_1.IStandardItemRateRepositoryToken)),
    __metadata("design:paramtypes", [Object, id_generation_service_1.IdGenerationService,
        request_context_service_1.RequestContextService])
], StandardItemRateService);
//# sourceMappingURL=standard-item-rate.service.js.map