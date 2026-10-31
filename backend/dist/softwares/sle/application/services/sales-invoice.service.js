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
exports.SalesInvoiceService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const sales_invoice_entity_1 = require("../../domain/entities/sales-invoice.entity");
const sales_invoice_item_entity_1 = require("../../domain/entities/sales-invoice-item.entity");
const sales_invoice_factor_entity_1 = require("../../domain/entities/sales-invoice-factor.entity");
const id_generation_service_1 = require("../../../../core/services/id-generation.service");
const request_context_service_1 = require("../../../../core/services/request-context.service");
const typeorm_query_builder_1 = require("../../../../core/utils/typeorm-query-builder");
let SalesInvoiceService = class SalesInvoiceService {
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
            .createQueryBuilder('si')
            .select('MAX(si.InvoiceNumber)', 'max')
            .where('si.businessStructureRef = :bsId', { bsId })
            .andWhere('si.companyRef = :compId', { compId })
            .andWhere('si.FiscalYearRef = :fiscalYearId', { fiscalYearId })
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
        let invoiceNumber = dto.InvoiceNumber ? Number(dto.InvoiceNumber) : 0;
        if (!invoiceNumber || invoiceNumber <= 0) {
            const next = await this.getNextNumber();
            invoiceNumber = next.documentNumber;
        }
        const salesInvoiceId = await this.idGenerationService.generateNextIdBlock('SalesInvoices', 1);
        const invoice = this.repository.create({
            SalesInvoiceID: salesInvoiceId,
            InvoiceNumber: invoiceNumber,
            InvoiceDate: dto.InvoiceDate || null,
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
        await this.repository.save(invoice);
        const validItems = (Array.isArray(dto.items) ? dto.items : []).filter((i) => i.ItemRef && !isNaN(Number(i.ItemRef)));
        if (validItems.length > 0) {
            await this.saveItems(salesInvoiceId, validItems);
        }
        const validFactors = (Array.isArray(dto.factors) ? dto.factors : []).filter((f) => f.FactorTitle && Number(f.Amount || 0) > 0);
        if (validFactors.length > 0) {
            await this.saveFactors(salesInvoiceId, validFactors);
        }
        return this.findOne(salesInvoiceId);
    }
    async saveItems(salesInvoiceId, items) {
        const startItemId = await this.idGenerationService.generateNextIdBlock('SalesInvoiceItems', items.length);
        const itemsToSave = items.map((d, idx) => {
            const qty = Number(d.Quantity || 0);
            const price = Number(d.UnitPrice || 0);
            return this.itemRepository.create({
                SalesInvoiceItemID: startItemId + idx,
                SalesInvoiceRef: salesInvoiceId,
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
    async saveFactors(salesInvoiceId, factors) {
        const startFactorId = await this.idGenerationService.generateNextIdBlock('SalesInvoiceFactors', factors.length);
        const factorsToSave = factors.map((f, idx) => this.factorRepository.create({
            SalesInvoiceFactorID: startFactorId + idx,
            SalesInvoiceRef: salesInvoiceId,
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
            .createQueryBuilder('si')
            .where('si.businessStructureRef = :bsId', { bsId })
            .andWhere('si.companyRef = :compId', { compId })
            .andWhere('si.FiscalYearRef = :fiscalYearId', { fiscalYearId })
            .orderBy('si.InvoiceNumber', 'DESC');
        const searchQ = (0, typeorm_query_builder_1.toLatinDigits)(String(query?.search ?? query?.globalFilter ?? '')).trim();
        if (searchQ) {
            qb.andWhere(new typeorm_2.Brackets((b) => {
                b.where('CAST(si.InvoiceNumber AS VARCHAR) ILIKE :siSearch', { siSearch: `%${searchQ}%` })
                    .orWhere('si.CustomerName ILIKE :siSearch', { siSearch: `%${searchQ}%` })
                    .orWhere('si.Description ILIKE :siSearch', { siSearch: `%${searchQ}%` });
            }));
        }
        const hasPageSize = query && query.pageSize !== undefined && query.pageSize !== null && String(query.pageSize).trim() !== '';
        (0, typeorm_query_builder_1.applyDataGridParams)(qb, query, 'si', { skipPagination: !hasPageSize });
        const [items, total] = await qb.getManyAndCount();
        return { items, total };
    }
    async findOne(id) {
        const invoice = await this.repository.findOne({
            where: { SalesInvoiceID: id },
            relations: ['items', 'factors'],
        });
        if (!invoice) {
            throw new common_1.NotFoundException(`فاکتور فروش با شناسه ${id} یافت نشد`);
        }
        return invoice;
    }
    async update(id, dto) {
        const invoice = await this.findOne(id);
        const userId = this.requestContextService.getUserId() || 1;
        this.validateRequiredRefs(dto);
        if (dto.InvoiceNumber !== undefined && dto.InvoiceNumber !== null && Number(dto.InvoiceNumber) > 0) {
            invoice.InvoiceNumber = Number(dto.InvoiceNumber);
        }
        invoice.InvoiceDate = dto.InvoiceDate !== undefined ? dto.InvoiceDate : invoice.InvoiceDate;
        invoice.CustomerRef = dto.CustomerRef !== undefined ? (dto.CustomerRef ? Number(dto.CustomerRef) : null) : invoice.CustomerRef;
        invoice.CustomerName = dto.CustomerName !== undefined ? dto.CustomerName : invoice.CustomerName;
        invoice.SalesTypeRef = dto.SalesTypeRef !== undefined ? (dto.SalesTypeRef ? Number(dto.SalesTypeRef) : null) : invoice.SalesTypeRef;
        invoice.SalesCenterRef = dto.SalesCenterRef !== undefined ? (dto.SalesCenterRef ? Number(dto.SalesCenterRef) : null) : invoice.SalesCenterRef;
        invoice.DeliveryLocationRef = dto.DeliveryLocationRef !== undefined ? (dto.DeliveryLocationRef ? Number(dto.DeliveryLocationRef) : null) : invoice.DeliveryLocationRef;
        invoice.SettlementMethodRef = dto.SettlementMethodRef !== undefined ? (dto.SettlementMethodRef ? Number(dto.SettlementMethodRef) : null) : invoice.SettlementMethodRef;
        invoice.Status = dto.Status !== undefined ? Number(dto.Status || 1) : invoice.Status;
        invoice.Description = dto.Description !== undefined ? dto.Description : invoice.Description;
        invoice.BaseDocumentTypeRef = dto.BaseDocumentTypeRef !== undefined ? (Number(dto.BaseDocumentTypeRef) > 0 ? Number(dto.BaseDocumentTypeRef) : null) : invoice.BaseDocumentTypeRef;
        invoice.BaseDocumentRef = dto.BaseDocumentRef !== undefined ? (dto.BaseDocumentRef ? Number(dto.BaseDocumentRef) : null) : invoice.BaseDocumentRef;
        invoice.lastModifier = userId;
        await this.repository.save(invoice);
        await this.itemRepository.delete({ SalesInvoiceRef: id });
        const validItems = (Array.isArray(dto.items) ? dto.items : []).filter((i) => i.ItemRef && !isNaN(Number(i.ItemRef)));
        if (validItems.length > 0) {
            await this.saveItems(id, validItems);
        }
        await this.factorRepository.delete({ SalesInvoiceRef: id });
        const validFactors = (Array.isArray(dto.factors) ? dto.factors : []).filter((f) => f.FactorTitle && Number(f.Amount || 0) > 0);
        if (validFactors.length > 0) {
            await this.saveFactors(id, validFactors);
        }
        return this.findOne(id);
    }
    async remove(id) {
        const invoice = await this.findOne(id);
        await this.itemRepository.delete({ SalesInvoiceRef: id });
        await this.factorRepository.delete({ SalesInvoiceRef: id });
        await this.repository.remove(invoice);
        return { success: true };
    }
};
exports.SalesInvoiceService = SalesInvoiceService;
exports.SalesInvoiceService = SalesInvoiceService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(sales_invoice_entity_1.SalesInvoice)),
    __param(1, (0, typeorm_1.InjectRepository)(sales_invoice_item_entity_1.SalesInvoiceItem)),
    __param(2, (0, typeorm_1.InjectRepository)(sales_invoice_factor_entity_1.SalesInvoiceFactor)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        id_generation_service_1.IdGenerationService,
        request_context_service_1.RequestContextService])
], SalesInvoiceService);
//# sourceMappingURL=sales-invoice.service.js.map