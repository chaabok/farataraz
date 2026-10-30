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
exports.SalesPermissionService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const sales_permission_entity_1 = require("../../domain/entities/sales-permission.entity");
const sales_permission_item_entity_1 = require("../../domain/entities/sales-permission-item.entity");
const sales_permission_factor_entity_1 = require("../../domain/entities/sales-permission-factor.entity");
const id_generation_service_1 = require("../../../../core/services/id-generation.service");
const request_context_service_1 = require("../../../../core/services/request-context.service");
const typeorm_query_builder_1 = require("../../../../core/utils/typeorm-query-builder");
let SalesPermissionService = class SalesPermissionService {
    constructor(repository, itemRepository, factorRepository, idGenerationService, requestContextService) {
        this.repository = repository;
        this.itemRepository = itemRepository;
        this.factorRepository = factorRepository;
        this.idGenerationService = idGenerationService;
        this.requestContextService = requestContextService;
    }
    getScope() {
        let bsId = this.requestContextService.getBusinessStructureId() ?? 2;
        let compId = this.requestContextService.getCompanyId() ?? 2;
        let fiscalYearId = this.requestContextService.getFiscalYearId() ?? 1;
        if (bsId <= 1)
            bsId = 2;
        if (compId <= 1)
            compId = 2;
        return { bsId, compId, fiscalYearId };
    }
    async getNextNumber() {
        const { bsId, compId, fiscalYearId } = this.getScope();
        const maxResult = await this.repository
            .createQueryBuilder('sp')
            .select('MAX(sp.PermissionNumber)', 'max')
            .where('sp.businessStructureRef = :bsId', { bsId })
            .andWhere('sp.companyRef = :compId', { compId })
            .andWhere('sp.FiscalYearRef = :fiscalYearId', { fiscalYearId })
            .getRawOne();
        const maxVal = maxResult?.max ? parseInt(maxResult.max, 10) : 0;
        return { documentNumber: maxVal + 1 };
    }
    validateRequiredRefs(dto) {
        const missing = [];
        if (!dto.SalesTypeRef || !Number(dto.SalesTypeRef))
            missing.push('نوع فروش');
        if (!dto.SalesCenterRef || !Number(dto.SalesCenterRef))
            missing.push('مرکز فروش');
        if (!dto.DeliveryLocationRef || !Number(dto.DeliveryLocationRef))
            missing.push('محل تحویل');
        if (!dto.SettlementMethodRef || !Number(dto.SettlementMethodRef))
            missing.push('روش تسویه');
        if (missing.length > 0) {
            throw new common_1.BadRequestException(`لطفاً ${missing.join('، ')} را انتخاب کنید`);
        }
    }
    async create(dto) {
        const { bsId, compId, fiscalYearId } = this.getScope();
        const userId = this.requestContextService.getUserId() || 1;
        this.validateRequiredRefs(dto);
        let permissionNumber = dto.PermissionNumber ? Number(dto.PermissionNumber) : 0;
        if (!permissionNumber || permissionNumber <= 0) {
            const next = await this.getNextNumber();
            permissionNumber = next.documentNumber;
        }
        const salesPermissionId = await this.idGenerationService.generateNextIdBlock('SalesPermissions', 1);
        const permission = this.repository.create({
            SalesPermissionID: salesPermissionId,
            PermissionNumber: permissionNumber,
            PermissionDate: dto.PermissionDate || null,
            CustomerRef: dto.CustomerRef ? Number(dto.CustomerRef) : null,
            CustomerName: dto.CustomerName || null,
            SalesTypeRef: dto.SalesTypeRef ? Number(dto.SalesTypeRef) : null,
            SalesCenterRef: dto.SalesCenterRef ? Number(dto.SalesCenterRef) : null,
            DeliveryLocationRef: dto.DeliveryLocationRef ? Number(dto.DeliveryLocationRef) : null,
            SettlementMethodRef: dto.SettlementMethodRef ? Number(dto.SettlementMethodRef) : null,
            Status: Number(dto.Status || 1),
            Description: dto.Description || null,
            BaseDocumentTypeRef: dto.BaseDocumentTypeRef !== undefined && dto.BaseDocumentTypeRef !== null && Number(dto.BaseDocumentTypeRef) > 0 ? Number(dto.BaseDocumentTypeRef) : null,
            BaseDocumentRef: dto.BaseDocumentRef ? Number(dto.BaseDocumentRef) : null,
            businessStructureRef: bsId,
            companyRef: compId,
            FiscalYearRef: fiscalYearId,
            creator: userId,
        });
        await this.repository.save(permission);
        const validItems = (Array.isArray(dto.items) ? dto.items : []).filter((i) => i.ItemRef && !isNaN(Number(i.ItemRef)));
        if (validItems.length > 0) {
            await this.saveItems(salesPermissionId, validItems);
        }
        const validFactors = (Array.isArray(dto.factors) ? dto.factors : []).filter((f) => f.FactorTitle && Number(f.Amount || 0) > 0);
        if (validFactors.length > 0) {
            await this.saveFactors(salesPermissionId, validFactors);
        }
        return this.findOne(salesPermissionId);
    }
    async saveItems(salesPermissionId, items) {
        const startItemId = await this.idGenerationService.generateNextIdBlock('SalesPermissionItems', items.length);
        const itemsToSave = items.map((d, idx) => {
            const qty = Number(d.Quantity || 0);
            const price = Number(d.UnitPrice || 0);
            return this.itemRepository.create({
                SalesPermissionItemID: startItemId + idx,
                SalesPermissionRef: salesPermissionId,
                RowNo: idx + 1,
                ItemRef: Number(d.ItemRef),
                ItemCode: d.ItemCode || null,
                ItemName: d.ItemName || null,
                UnitName: d.UnitName || null,
                Quantity: qty,
                UnitPrice: price,
                TotalPrice: d.TotalPrice !== undefined && d.TotalPrice !== null && d.TotalPrice !== ''
                    ? Math.round(Number(d.TotalPrice))
                    : Math.round(qty * price),
                Description: d.Description || null,
                TrackingFactorValues: d.trackingFactorValues ?? d.TrackingFactorValues ?? d.trackingFactors ?? null,
            });
        });
        await this.itemRepository.save(itemsToSave);
    }
    async saveFactors(salesPermissionId, factors) {
        const startFactorId = await this.idGenerationService.generateNextIdBlock('SalesPermissionFactors', factors.length);
        const factorsToSave = factors.map((f, idx) => this.factorRepository.create({
            SalesPermissionFactorID: startFactorId + idx,
            SalesPermissionRef: salesPermissionId,
            RowNo: idx + 1,
            FactorTitle: f.FactorTitle || null,
            FactorType: Number(f.FactorType || 1),
            Amount: Number(f.Amount || 0),
            Description: f.Description || null,
        }));
        await this.factorRepository.save(factorsToSave);
    }
    async findAll(query) {
        const { bsId, compId, fiscalYearId } = this.getScope();
        const qb = this.repository
            .createQueryBuilder('sp')
            .where('sp.businessStructureRef = :bsId', { bsId })
            .andWhere('sp.companyRef = :compId', { compId })
            .andWhere('sp.FiscalYearRef = :fiscalYearId', { fiscalYearId })
            .orderBy('sp.PermissionNumber', 'DESC');
        const searchQ = (0, typeorm_query_builder_1.toLatinDigits)(String(query?.search ?? query?.globalFilter ?? '')).trim();
        if (searchQ) {
            qb.andWhere(new typeorm_2.Brackets((b) => {
                b.where('CAST(sp.PermissionNumber AS VARCHAR) ILIKE :spSearch', { spSearch: `%${searchQ}%` })
                    .orWhere('sp.CustomerName ILIKE :spSearch', { spSearch: `%${searchQ}%` })
                    .orWhere('sp.Description ILIKE :spSearch', { spSearch: `%${searchQ}%` });
            }));
        }
        const hasPageSize = query && query.pageSize !== undefined && query.pageSize !== null && String(query.pageSize).trim() !== '';
        (0, typeorm_query_builder_1.applyDataGridParams)(qb, query, 'sp', { skipPagination: !hasPageSize });
        const [items, total] = await qb.getManyAndCount();
        return { items, total };
    }
    async findOne(id) {
        const permission = await this.repository.findOne({
            where: { SalesPermissionID: id },
            relations: ['items', 'factors'],
        });
        if (!permission) {
            throw new common_1.NotFoundException(`مجوز فروش با شناسه ${id} یافت نشد`);
        }
        return permission;
    }
    async update(id, dto) {
        const permission = await this.findOne(id);
        const userId = this.requestContextService.getUserId() || 1;
        this.validateRequiredRefs(dto);
        if (dto.PermissionNumber !== undefined && dto.PermissionNumber !== null && Number(dto.PermissionNumber) > 0) {
            permission.PermissionNumber = Number(dto.PermissionNumber);
        }
        permission.PermissionDate = dto.PermissionDate !== undefined ? dto.PermissionDate : permission.PermissionDate;
        permission.CustomerRef = dto.CustomerRef !== undefined ? (dto.CustomerRef ? Number(dto.CustomerRef) : null) : permission.CustomerRef;
        permission.CustomerName = dto.CustomerName !== undefined ? dto.CustomerName : permission.CustomerName;
        permission.SalesTypeRef = dto.SalesTypeRef !== undefined ? (dto.SalesTypeRef ? Number(dto.SalesTypeRef) : null) : permission.SalesTypeRef;
        permission.SalesCenterRef = dto.SalesCenterRef !== undefined ? (dto.SalesCenterRef ? Number(dto.SalesCenterRef) : null) : permission.SalesCenterRef;
        permission.DeliveryLocationRef = dto.DeliveryLocationRef !== undefined ? (dto.DeliveryLocationRef ? Number(dto.DeliveryLocationRef) : null) : permission.DeliveryLocationRef;
        permission.SettlementMethodRef = dto.SettlementMethodRef !== undefined ? (dto.SettlementMethodRef ? Number(dto.SettlementMethodRef) : null) : permission.SettlementMethodRef;
        permission.Status = dto.Status !== undefined ? Number(dto.Status || 1) : permission.Status;
        permission.Description = dto.Description !== undefined ? dto.Description : permission.Description;
        permission.BaseDocumentTypeRef = dto.BaseDocumentTypeRef !== undefined ? (Number(dto.BaseDocumentTypeRef) > 0 ? Number(dto.BaseDocumentTypeRef) : null) : permission.BaseDocumentTypeRef;
        permission.BaseDocumentRef = dto.BaseDocumentRef !== undefined ? (dto.BaseDocumentRef ? Number(dto.BaseDocumentRef) : null) : permission.BaseDocumentRef;
        permission.lastModifier = userId;
        await this.repository.save(permission);
        await this.itemRepository.delete({ SalesPermissionRef: id });
        const validItems = (Array.isArray(dto.items) ? dto.items : []).filter((i) => i.ItemRef && !isNaN(Number(i.ItemRef)));
        if (validItems.length > 0) {
            await this.saveItems(id, validItems);
        }
        await this.factorRepository.delete({ SalesPermissionRef: id });
        const validFactors = (Array.isArray(dto.factors) ? dto.factors : []).filter((f) => f.FactorTitle && Number(f.Amount || 0) > 0);
        if (validFactors.length > 0) {
            await this.saveFactors(id, validFactors);
        }
        return this.findOne(id);
    }
    async remove(id) {
        const permission = await this.findOne(id);
        await this.itemRepository.delete({ SalesPermissionRef: id });
        await this.factorRepository.delete({ SalesPermissionRef: id });
        await this.repository.remove(permission);
        return { success: true };
    }
};
exports.SalesPermissionService = SalesPermissionService;
exports.SalesPermissionService = SalesPermissionService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(sales_permission_entity_1.SalesPermission)),
    __param(1, (0, typeorm_1.InjectRepository)(sales_permission_item_entity_1.SalesPermissionItem)),
    __param(2, (0, typeorm_1.InjectRepository)(sales_permission_factor_entity_1.SalesPermissionFactor)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        id_generation_service_1.IdGenerationService,
        request_context_service_1.RequestContextService])
], SalesPermissionService);
//# sourceMappingURL=sales-permission.service.js.map