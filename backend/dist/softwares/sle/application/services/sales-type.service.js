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
exports.SalesTypeService = void 0;
const common_1 = require("@nestjs/common");
const sales_type_repository_interface_1 = require("../../domain/repositories/sales-type.repository.interface");
const sales_type_entity_1 = require("../../domain/entities/sales-type.entity");
const id_generation_service_1 = require("../../../../core/services/id-generation.service");
const request_context_service_1 = require("../../../../core/services/request-context.service");
let SalesTypeService = class SalesTypeService {
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
    async findAll() {
        const { bsId, compId, isShared } = await this.getScope();
        const where = isShared ? { BusinessStructureRef: bsId } : { CompanyRef: compId };
        return this.repository.findAll({ where });
    }
    async findById(id) {
        const item = await this.repository.findById(id);
        if (!item) {
            throw new common_1.NotFoundException(`SalesType with ID ${id} not found`);
        }
        return item;
    }
    async getNextCode() {
        const { bsId, compId, isShared } = await this.getScope();
        const qb = this.repository.manager.createQueryBuilder(sales_type_entity_1.SalesType, 'st');
        if (isShared) {
            qb.andWhere('st.BusinessStructureRef = :bsId', { bsId });
        }
        else {
            qb.andWhere('st.CompanyRef = :compId', { compId });
        }
        const maxResult = await qb.select('MAX(st.Code)', 'max').getRawOne();
        const max = maxResult?.max ? Number(maxResult.max) : 0;
        return { code: max + 1 };
    }
    async checkDuplicate(field, value, excludeId) {
        if (value === undefined || value === null || String(value).trim() === '')
            return false;
        const { bsId, compId, isShared } = await this.getScope();
        const qb = this.repository.manager.createQueryBuilder(sales_type_entity_1.SalesType, 'st');
        qb.where(`st.${field} = :value`, { value });
        if (isShared) {
            qb.andWhere('st.BusinessStructureRef = :bsId', { bsId });
        }
        else {
            qb.andWhere('st.CompanyRef = :compId', { compId });
        }
        if (excludeId) {
            qb.andWhere('st.SalesTypeID != :excludeId', { excludeId });
        }
        const count = await qb.getCount();
        return count > 0;
    }
    async create(dto) {
        const { bsId, compId, isShared } = await this.getScope();
        const userId = this.requestContextService.getUserId() || 1;
        if (!dto.Code && dto.Code !== 0) {
            const next = await this.getNextCode();
            dto.Code = next.code;
        }
        const rawTitle = dto.Title ?? dto.title;
        const rawTitle2 = dto.Title2 ?? dto.title2;
        if (!rawTitle || String(rawTitle).trim() === '') {
            throw new common_1.BadRequestException('فیلد عنوان الزامی است.');
        }
        const title = String(rawTitle).trim();
        const title2 = rawTitle2 !== undefined && rawTitle2 !== null && String(rawTitle2).trim() !== ''
            ? String(rawTitle2).trim()
            : title;
        if (await this.checkDuplicate('Code', dto.Code)) {
            const next = await this.getNextCode();
            dto.Code = next.code;
            if (await this.checkDuplicate('Code', dto.Code)) {
                dto.Code = Date.now() % 100000;
            }
        }
        if (await this.checkDuplicate('Title', title)) {
            throw new common_1.BadRequestException('عنوان نوع فروش تکراری است.');
        }
        const id = dto.SalesTypeID || (await this.idGenerationService.generateNextId('SalesTypes'));
        const entity = this.repository.manager.create(sales_type_entity_1.SalesType, {
            SalesTypeID: id,
            Code: Number(dto.Code),
            Title: title,
            Title2: title2,
            IsActive: dto.IsActive !== undefined ? dto.IsActive : true,
            Description: dto.Description || '',
            CreatorRef: userId,
            CreationDate: new Date(),
            LastModifierRef: userId,
            LastModificationDate: new Date(),
            CompanyRef: compId,
            BusinessStructureRef: bsId,
        });
        return this.repository.create(entity);
    }
    async update(id, dto) {
        const existing = await this.findById(id);
        const userId = this.requestContextService.getUserId() || 1;
        const rawTitle = dto.Title ?? existing.Title;
        const rawTitle2 = dto.Title2 ?? existing.Title2;
        const title = String(rawTitle).trim();
        const title2 = rawTitle2 !== undefined && rawTitle2 !== null && String(rawTitle2).trim() !== ''
            ? String(rawTitle2).trim()
            : title;
        if (dto.Code !== undefined && dto.Code !== existing.Code) {
            if (await this.checkDuplicate('Code', dto.Code, id)) {
                const next = await this.getNextCode();
                dto.Code = next.code;
            }
        }
        if (title !== existing.Title && (await this.checkDuplicate('Title', title, id))) {
            throw new common_1.BadRequestException('عنوان نوع فروش تکراری است.');
        }
        const updateData = {
            Code: dto.Code !== undefined ? Number(dto.Code) : existing.Code,
            Title: title,
            Title2: title2,
            IsActive: dto.IsActive !== undefined ? dto.IsActive : existing.IsActive,
            Description: dto.Description !== undefined ? dto.Description : existing.Description,
            LastModifierRef: userId,
            LastModificationDate: new Date(),
        };
        return this.repository.update(id, updateData);
    }
    async remove(id) {
        await this.findById(id);
        await this.repository.delete(id);
    }
};
exports.SalesTypeService = SalesTypeService;
exports.SalesTypeService = SalesTypeService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, common_1.Inject)(sales_type_repository_interface_1.ISalesTypeRepositoryToken)),
    __metadata("design:paramtypes", [Object, id_generation_service_1.IdGenerationService,
        request_context_service_1.RequestContextService])
], SalesTypeService);
//# sourceMappingURL=sales-type.service.js.map