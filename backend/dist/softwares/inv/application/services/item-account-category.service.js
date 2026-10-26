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
exports.ItemAccountCategoryService = void 0;
const common_1 = require("@nestjs/common");
const item_account_category_repository_interface_1 = require("../../domain/repositories/item-account-category.repository.interface");
const id_generation_service_1 = require("../../../../core/services/id-generation.service");
const request_context_service_1 = require("../../../../core/services/request-context.service");
let ItemAccountCategoryService = class ItemAccountCategoryService {
    constructor(repository, idGenerationService, requestContextService) {
        this.repository = repository;
        this.idGenerationService = idGenerationService;
        this.requestContextService = requestContextService;
    }
    async getScope() {
        let bsId = this.requestContextService.getBusinessStructureId() ?? 2;
        let compId = this.requestContextService.getCompanyId() ?? 2;
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
        return { bsId, compId, isShared };
    }
    async findAll(query) {
        const { skip, take } = query;
        const { bsId, compId, isShared } = await this.getScope();
        let where = {};
        if (isShared) {
            where.businessStructureRef = bsId;
        }
        else {
            where.companyRef = compId;
        }
        const [data, total] = await Promise.all([
            this.repository.findAll({ where, skip: skip ? parseInt(skip) : undefined, take: take ? parseInt(take) : undefined }),
            this.repository.count({ where })
        ]);
        return { data, total, success: true };
    }
    async getItemsByCategory(categoryId) {
        const { bsId, compId, isShared } = await this.getScope();
        let whereClause = '';
        const params = [categoryId];
        if (isShared) {
            whereClause = 'WHERE i."ItemAccountCategoryRef" = $1 AND i."BusinessStructureRef" = $2 AND (i."IsActive" IS TRUE OR i."IsActive" IS NULL)';
            params.push(bsId);
        }
        else {
            whereClause = 'WHERE i."ItemAccountCategoryRef" = $1 AND i."CompanyRef" = $2 AND (i."IsActive" IS TRUE OR i."IsActive" IS NULL)';
            params.push(compId);
        }
        try {
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
            return (rows || []).map((r) => ({
                ItemID: Number(r.ItemID),
                ItemRef: Number(r.ItemID),
                ItemCode: r.ItemCode !== null && r.ItemCode !== undefined ? String(r.ItemCode) : '',
                ItemName: r.ItemName || '',
                ItemName2: r.ItemName2 || '',
                MeasurementUnitRef: r.MeasurementUnitRef ? Number(r.MeasurementUnitRef) : null,
                MeasurementUnitName: r.MeasurementUnitName || '',
            }));
        }
        catch (err) {
            console.error('Error in getItemsByCategory:', err);
            return [];
        }
    }
    async updateCategoryItems(categoryId, items) {
        try {
            await this.repository.manager.connection.query(`UPDATE "Inv"."Items" SET "ItemAccountCategoryRef" = NULL WHERE "ItemAccountCategoryRef" = $1`, [categoryId]);
            if (items && Array.isArray(items) && items.length > 0) {
                const itemIds = items
                    .map((i) => Number(i.ItemID || i.ItemRef || i))
                    .filter((id) => !isNaN(id) && id > 0);
                if (itemIds.length > 0) {
                    const cat = await this.repository.findById(categoryId);
                    const catPricingMethod = cat?.PricingMethod || 1;
                    await this.repository.manager.connection.query(`UPDATE "Inv"."Items" SET "ItemAccountCategoryRef" = $1, "PricingMethod" = $2 WHERE "ItemID" IN (${itemIds.join(',')})`, [categoryId, catPricingMethod]);
                }
            }
        }
        catch (err) {
            console.error('Error in updateCategoryItems:', err);
        }
    }
    async findOne(id) {
        const entity = await this.repository.findById(id);
        if (!entity)
            throw new common_1.NotFoundException('طبقه حساب کالا یافت نشد');
        const items = await this.getItemsByCategory(id);
        return {
            ...entity,
            Items: items,
        };
    }
    async getNextNumber() {
        const companyId = (this.requestContextService.getCompanyId() && this.requestContextService.getCompanyId() > 1) ? this.requestContextService.getCompanyId() : 2;
        const bsId = (this.requestContextService.getBusinessStructureId() && this.requestContextService.getBusinessStructureId() > 1) ? this.requestContextService.getBusinessStructureId() : 2;
        const res = await this.repository.calculateNextCode(bsId, companyId);
        return {
            documentNumber: res.nextValue,
            isDocumentNumberAuto: res.numberingMethod === '2',
            error: res.error,
        };
    }
    async checkDuplicate(field, value, excludeId) {
        return this.repository.checkDuplicate(field, value, excludeId);
    }
    async validateDuplicates(dto, excludeId) {
        if (dto.ItemAccountCategoryCode !== undefined) {
            const isDuplicateCode = await this.checkDuplicate('ItemAccountCategoryCode', dto.ItemAccountCategoryCode, excludeId);
            if (isDuplicateCode) {
                throw new common_1.BadRequestException('کد طبقه حساب کالا تکراری است');
            }
        }
        if (dto.ItemAccountCategoryName !== undefined) {
            const isDuplicateTitle = await this.checkDuplicate('ItemAccountCategoryName', dto.ItemAccountCategoryName, excludeId);
            if (isDuplicateTitle) {
                throw new common_1.BadRequestException('عنوان طبقه حساب کالا تکراری است');
            }
        }
        if (dto.ItemAccountCategoryName2 !== undefined && dto.ItemAccountCategoryName2 !== null && dto.ItemAccountCategoryName2 !== '') {
            const isDuplicateTitle2 = await this.checkDuplicate('ItemAccountCategoryName2', dto.ItemAccountCategoryName2, excludeId);
            if (isDuplicateTitle2) {
                throw new common_1.BadRequestException('عنوان دوم طبقه حساب کالا تکراری است');
            }
        }
    }
    async create(createDto) {
        const userId = this.requestContextService.getUserId();
        const companyId = (this.requestContextService.getCompanyId() && this.requestContextService.getCompanyId() > 1) ? this.requestContextService.getCompanyId() : 2;
        const bsId = (this.requestContextService.getBusinessStructureId() && this.requestContextService.getBusinessStructureId() > 1) ? this.requestContextService.getBusinessStructureId() : 2;
        if (!String(createDto.ItemAccountCategoryName2 ?? '').trim()) {
            createDto.ItemAccountCategoryName2 = String(createDto.ItemAccountCategoryName ?? '').trim();
        }
        let codeToSave = createDto.ItemAccountCategoryCode;
        const docRes = await this.repository.calculateNextCode(bsId, companyId);
        if (docRes.numberingMethod === '2' || !codeToSave) {
            if (docRes.error) {
                throw new common_1.BadRequestException(docRes.error);
            }
            codeToSave = parseInt(docRes.nextValue, 10);
        }
        createDto.ItemAccountCategoryCode = codeToSave;
        await this.validateDuplicates(createDto);
        const id = await this.idGenerationService.generateNextId('ItemAccountCategories');
        const { Items, ...dtoWithoutItems } = createDto;
        const entity = {
            ...dtoWithoutItems,
            ItemAccountCategoryCode: codeToSave,
            ItemAccountCategoryID: id,
            creator: userId || 1,
            companyRef: createDto.companyRef || companyId,
            businessStructureRef: createDto.businessStructureRef || bsId
        };
        const result = await this.repository.create(entity);
        if (Items && Array.isArray(Items)) {
            await this.updateCategoryItems(id, Items);
        }
        return result;
    }
    async update(id, updateDto) {
        const existing = await this.findOne(id);
        if (updateDto.ItemAccountCategoryCode === undefined) {
            updateDto.ItemAccountCategoryCode = existing.ItemAccountCategoryCode;
        }
        if (updateDto.ItemAccountCategoryName2 !== undefined && !String(updateDto.ItemAccountCategoryName2 ?? '').trim()) {
            updateDto.ItemAccountCategoryName2 = String(updateDto.ItemAccountCategoryName ?? existing.ItemAccountCategoryName ?? '').trim();
        }
        await this.validateDuplicates(updateDto, id);
        const userId = this.requestContextService.getUserId();
        const { Items, ...dtoWithoutItems } = updateDto;
        const entityToUpdate = {
            ...dtoWithoutItems,
            lastModifier: userId || 1,
        };
        const result = await this.repository.update(id, entityToUpdate);
        if (result && updateDto.PricingMethod !== undefined) {
            await this.repository.manager.connection.query(`UPDATE "Inv"."Items" SET "PricingMethod" = $1 WHERE "ItemAccountCategoryRef" = $2`, [updateDto.PricingMethod, id]);
        }
        if (Items && Array.isArray(Items)) {
            await this.updateCategoryItems(id, Items);
        }
        return result;
    }
    async remove(id) {
        await this.findOne(id);
        await this.repository.delete(id);
    }
};
exports.ItemAccountCategoryService = ItemAccountCategoryService;
exports.ItemAccountCategoryService = ItemAccountCategoryService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, common_1.Inject)(item_account_category_repository_interface_1.IItemAccountCategoryRepositoryToken)),
    __metadata("design:paramtypes", [Object, id_generation_service_1.IdGenerationService,
        request_context_service_1.RequestContextService])
], ItemAccountCategoryService);
//# sourceMappingURL=item-account-category.service.js.map