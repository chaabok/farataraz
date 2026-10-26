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
exports.SalesProformaInvoiceService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const sales_proforma_invoice_entity_1 = require("../../domain/entities/sales-proforma-invoice.entity");
const sales_proforma_invoice_item_entity_1 = require("../../domain/entities/sales-proforma-invoice-item.entity");
const sales_proforma_invoice_factor_entity_1 = require("../../domain/entities/sales-proforma-invoice-factor.entity");
const id_generation_service_1 = require("../../../../core/services/id-generation.service");
const request_context_service_1 = require("../../../../core/services/request-context.service");
const typeorm_query_builder_1 = require("../../../../core/utils/typeorm-query-builder");
let SalesProformaInvoiceService = class SalesProformaInvoiceService {
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
            .select('MAX(sp.ProformaNumber)', 'max')
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
        let proformaNumber = dto.ProformaNumber ? Number(dto.ProformaNumber) : 0;
        if (!proformaNumber || proformaNumber <= 0) {
            const next = await this.getNextNumber();
            proformaNumber = next.documentNumber;
        }
        const salesProformaId = await this.idGenerationService.generateNextIdBlock('SalesProformaInvoices', 1);
        const proforma = this.repository.create({
            SalesProformaID: salesProformaId,
            ProformaNumber: proformaNumber,
            ProformaDate: dto.ProformaDate || null,
            ValidityDate: dto.ValidityDate || null,
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
        await this.repository.save(proforma);
        const validItems = (Array.isArray(dto.items) ? dto.items : []).filter((i) => i.ItemRef && !isNaN(Number(i.ItemRef)));
        if (validItems.length > 0) {
            await this.saveItems(salesProformaId, validItems);
        }
        const validFactors = (Array.isArray(dto.factors) ? dto.factors : []).filter((f) => f.FactorTitle && Number(f.Amount || 0) > 0);
        if (validFactors.length > 0) {
            await this.saveFactors(salesProformaId, validFactors);
        }
        return this.findOne(salesProformaId);
    }
    async saveItems(salesProformaId, items) {
        const startItemId = await this.idGenerationService.generateNextIdBlock('SalesProformaInvoiceItems', items.length);
        const itemsToSave = items.map((d, idx) => {
            const qty = Number(d.Quantity || 0);
            const price = Number(d.UnitPrice || 0);
            return this.itemRepository.create({
                SalesProformaInvoiceItemID: startItemId + idx,
                SalesProformaRef: salesProformaId,
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
    async saveFactors(salesProformaId, factors) {
        const startFactorId = await this.idGenerationService.generateNextIdBlock('SalesProformaInvoiceFactors', factors.length);
        const factorsToSave = factors.map((f, idx) => this.factorRepository.create({
            SalesProformaInvoiceFactorID: startFactorId + idx,
            SalesProformaRef: salesProformaId,
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
            .orderBy('sp.ProformaNumber', 'DESC');
        const searchQ = (0, typeorm_query_builder_1.toLatinDigits)(String(query?.search ?? query?.globalFilter ?? '')).trim();
        if (searchQ) {
            qb.andWhere(new typeorm_2.Brackets((b) => {
                b.where('CAST(sp.ProformaNumber AS VARCHAR) ILIKE :spSearch', { spSearch: `%${searchQ}%` })
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
        const proforma = await this.repository.findOne({
            where: { SalesProformaID: id },
            relations: ['items', 'factors'],
        });
        if (!proforma) {
            throw new common_1.NotFoundException(`پیش فاکتور فروش با شناسه ${id} یافت نشد`);
        }
        return proforma;
    }
    async update(id, dto) {
        const proforma = await this.findOne(id);
        const userId = this.requestContextService.getUserId() || 1;
        this.validateRequiredRefs(dto);
        if (dto.ProformaNumber !== undefined && dto.ProformaNumber !== null && Number(dto.ProformaNumber) > 0) {
            proforma.ProformaNumber = Number(dto.ProformaNumber);
        }
        proforma.ProformaDate = dto.ProformaDate !== undefined ? dto.ProformaDate : proforma.ProformaDate;
        proforma.ValidityDate = dto.ValidityDate !== undefined ? (dto.ValidityDate || null) : proforma.ValidityDate;
        proforma.CustomerRef = dto.CustomerRef !== undefined ? (dto.CustomerRef ? Number(dto.CustomerRef) : null) : proforma.CustomerRef;
        proforma.CustomerName = dto.CustomerName !== undefined ? dto.CustomerName : proforma.CustomerName;
        proforma.SalesTypeRef = dto.SalesTypeRef !== undefined ? (dto.SalesTypeRef ? Number(dto.SalesTypeRef) : null) : proforma.SalesTypeRef;
        proforma.SalesCenterRef = dto.SalesCenterRef !== undefined ? (dto.SalesCenterRef ? Number(dto.SalesCenterRef) : null) : proforma.SalesCenterRef;
        proforma.DeliveryLocationRef = dto.DeliveryLocationRef !== undefined ? (dto.DeliveryLocationRef ? Number(dto.DeliveryLocationRef) : null) : proforma.DeliveryLocationRef;
        proforma.SettlementMethodRef = dto.SettlementMethodRef !== undefined ? (dto.SettlementMethodRef ? Number(dto.SettlementMethodRef) : null) : proforma.SettlementMethodRef;
        proforma.Status = dto.Status !== undefined ? Number(dto.Status || 1) : proforma.Status;
        proforma.Description = dto.Description !== undefined ? dto.Description : proforma.Description;
        proforma.BaseDocumentTypeRef = dto.BaseDocumentTypeRef !== undefined ? (Number(dto.BaseDocumentTypeRef) > 0 ? Number(dto.BaseDocumentTypeRef) : null) : proforma.BaseDocumentTypeRef;
        proforma.BaseDocumentRef = dto.BaseDocumentRef !== undefined ? (dto.BaseDocumentRef ? Number(dto.BaseDocumentRef) : null) : proforma.BaseDocumentRef;
        proforma.lastModifier = userId;
        await this.repository.save(proforma);
        await this.itemRepository.delete({ SalesProformaRef: id });
        const validItems = (Array.isArray(dto.items) ? dto.items : []).filter((i) => i.ItemRef && !isNaN(Number(i.ItemRef)));
        if (validItems.length > 0) {
            await this.saveItems(id, validItems);
        }
        await this.factorRepository.delete({ SalesProformaRef: id });
        const validFactors = (Array.isArray(dto.factors) ? dto.factors : []).filter((f) => f.FactorTitle && Number(f.Amount || 0) > 0);
        if (validFactors.length > 0) {
            await this.saveFactors(id, validFactors);
        }
        return this.findOne(id);
    }
    async remove(id) {
        const proforma = await this.findOne(id);
        await this.itemRepository.delete({ SalesProformaRef: id });
        await this.factorRepository.delete({ SalesProformaRef: id });
        await this.repository.remove(proforma);
        return { success: true };
    }
};
exports.SalesProformaInvoiceService = SalesProformaInvoiceService;
exports.SalesProformaInvoiceService = SalesProformaInvoiceService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(sales_proforma_invoice_entity_1.SalesProformaInvoice)),
    __param(1, (0, typeorm_1.InjectRepository)(sales_proforma_invoice_item_entity_1.SalesProformaInvoiceItem)),
    __param(2, (0, typeorm_1.InjectRepository)(sales_proforma_invoice_factor_entity_1.SalesProformaInvoiceFactor)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        id_generation_service_1.IdGenerationService,
        request_context_service_1.RequestContextService])
], SalesProformaInvoiceService);
//# sourceMappingURL=sales-proforma-invoice.service.js.map