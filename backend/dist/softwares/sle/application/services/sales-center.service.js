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
exports.SalesCenterService = void 0;
const common_1 = require("@nestjs/common");
const sales_center_repository_interface_1 = require("../../domain/repositories/sales-center.repository.interface");
const sales_center_entity_1 = require("../../domain/entities/sales-center.entity");
const id_generation_service_1 = require("../../../../core/services/id-generation.service");
const request_context_service_1 = require("../../../../core/services/request-context.service");
let SalesCenterService = class SalesCenterService {
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
            throw new common_1.NotFoundException(`Sales center with ID ${id} not found`);
        }
        return item;
    }
    async getNextNumber() {
        const { bsId, compId, isShared } = await this.getScope();
        const qb = this.repository.manager.createQueryBuilder(sales_center_entity_1.SalesCenter, 'sc');
        if (isShared) {
            qb.andWhere('sc.BusinessStructureRef = :bsId', { bsId });
        }
        else {
            qb.andWhere('sc.CompanyRef = :compId', { compId });
        }
        const maxResult = await qb.select('MAX(sc.Code)', 'max').getRawOne();
        const max = maxResult?.max ? Number(maxResult.max) : 0;
        return {
            documentNumber: max + 1,
            isDocumentNumberAuto: false,
        };
    }
    async checkDuplicate(field, value, excludeId) {
        if (value === undefined || value === null || String(value).trim() === '')
            return false;
        const { bsId, compId, isShared } = await this.getScope();
        const qb = this.repository.manager.createQueryBuilder(sales_center_entity_1.SalesCenter, 'sc');
        qb.where(`sc.${field} = :value`, { value });
        if (isShared) {
            qb.andWhere('sc.BusinessStructureRef = :bsId', { bsId });
        }
        else {
            qb.andWhere('sc.CompanyRef = :compId', { compId });
        }
        if (excludeId) {
            qb.andWhere('sc.SalesCenterID != :excludeId', { excludeId });
        }
        const count = await qb.getCount();
        return count > 0;
    }
    async create(dto) {
        const { bsId, compId, isShared } = await this.getScope();
        const userId = this.requestContextService.getUserId() || 1;
        if (!dto.Code && dto.Code !== 0) {
            const nextNum = await this.getNextNumber();
            dto.Code = nextNum.documentNumber;
        }
        const rawTitle = dto.Title ?? dto.title;
        const rawTitle2 = dto.Title2 ?? dto.title2;
        if (rawTitle !== undefined && rawTitle !== null) {
            dto.Title = String(rawTitle).trim();
        }
        if (rawTitle2 !== undefined && rawTitle2 !== null && String(rawTitle2).trim() !== '') {
            dto.Title2 = String(rawTitle2).trim();
        }
        else {
            dto.Title2 = dto.Title;
        }
        if (!dto.Title || String(dto.Title).trim() === '') {
            throw new common_1.BadRequestException('فیلد عنوان اجباری است.');
        }
        if (await this.checkDuplicate('Code', dto.Code)) {
            const nextNum = await this.getNextNumber();
            dto.Code = nextNum.documentNumber;
            if (await this.checkDuplicate('Code', dto.Code)) {
                dto.Code = Date.now() % 100000;
            }
        }
        if (await this.checkDuplicate('Title', dto.Title)) {
            throw new common_1.BadRequestException('عنوان مرکز فروش تکراری است.');
        }
        const title2 = dto.Title2 && String(dto.Title2).trim() !== '' ? dto.Title2 : dto.Title;
        const id = await this.idGenerationService.generateNextId('SalesCenters');
        const entity = this.repository.manager.create(sales_center_entity_1.SalesCenter, {
            SalesCenterID: id,
            Code: Number(dto.Code),
            Type: Number(dto.Type || 4),
            ReferenceRef: dto.ReferenceRef ? Number(dto.ReferenceRef) : undefined,
            Title: dto.Title,
            Title2: title2,
            IsActive: dto.IsActive !== undefined ? dto.IsActive : true,
            Description: dto.Description || '',
            CreatorRef: userId,
            LastModifierRef: userId,
            CompanyRef: compId,
            BusinessStructureRef: bsId,
        });
        return this.repository.create(entity);
    }
    async update(id, dto) {
        const existing = await this.findById(id);
        const rawTitle = dto.Title ?? dto.title;
        const rawTitle2 = dto.Title2 ?? dto.title2;
        if (rawTitle !== undefined) {
            dto.Title = rawTitle;
        }
        if (rawTitle2 !== undefined) {
            dto.Title2 = rawTitle2;
        }
        if (dto.Code !== undefined && dto.Code !== existing.Code) {
            if (await this.checkDuplicate('Code', dto.Code, id)) {
                const nextNum = await this.getNextNumber();
                dto.Code = nextNum.documentNumber;
                if (await this.checkDuplicate('Code', dto.Code, id)) {
                    dto.Code = Date.now() % 100000;
                }
            }
        }
        if (dto.Title !== undefined && dto.Title !== existing.Title) {
            if (await this.checkDuplicate('Title', dto.Title, id)) {
                throw new common_1.BadRequestException('عنوان مرکز فروش تکراری است.');
            }
        }
        const title2 = dto.Title2 !== undefined
            ? (dto.Title2 && String(dto.Title2).trim() !== '' ? dto.Title2 : (dto.Title || existing.Title))
            : existing.Title2;
        const userId = this.requestContextService.getUserId() || 1;
        const updateData = {
            Code: dto.Code !== undefined ? Number(dto.Code) : existing.Code,
            Type: dto.Type !== undefined ? Number(dto.Type) : existing.Type,
            ReferenceRef: dto.ReferenceRef !== undefined ? (dto.ReferenceRef ? Number(dto.ReferenceRef) : undefined) : existing.ReferenceRef,
            Title: dto.Title !== undefined ? dto.Title : existing.Title,
            Title2: title2,
            IsActive: dto.IsActive !== undefined ? dto.IsActive : existing.IsActive,
            Description: dto.Description !== undefined ? dto.Description : existing.Description,
            LastModifierRef: userId,
        };
        return this.repository.update(id, updateData);
    }
    async remove(id) {
        await this.findById(id);
        await this.repository.delete(id);
    }
};
exports.SalesCenterService = SalesCenterService;
exports.SalesCenterService = SalesCenterService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, common_1.Inject)(sales_center_repository_interface_1.ISalesCenterRepositoryToken)),
    __metadata("design:paramtypes", [Object, id_generation_service_1.IdGenerationService,
        request_context_service_1.RequestContextService])
], SalesCenterService);
//# sourceMappingURL=sales-center.service.js.map