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
exports.PurchaseInvoiceService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const purchase_invoice_entity_1 = require("../../domain/entities/purchase-invoice.entity");
const purchase_invoice_detail_entity_1 = require("../../domain/entities/purchase-invoice-detail.entity");
const purchase_invoice_factor_entity_1 = require("../../domain/entities/purchase-invoice-factor.entity");
const id_generation_service_1 = require("../../../../core/services/id-generation.service");
const request_context_service_1 = require("../../../../core/services/request-context.service");
const date_parser_1 = require("../../../../core/utils/date-parser");
let PurchaseInvoiceService = class PurchaseInvoiceService {
    constructor(repository, detailRepository, factorRepository, idGenService, requestContextService) {
        this.repository = repository;
        this.detailRepository = detailRepository;
        this.factorRepository = factorRepository;
        this.idGenService = idGenService;
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
            .createQueryBuilder('pi')
            .select('MAX(pi.InvoiceNumber)', 'max')
            .where('pi.businessStructureRef = :bsId', { bsId })
            .andWhere('pi.companyRef = :compId', { compId })
            .andWhere('pi.FiscalYearRef = :fiscalYearId', { fiscalYearId })
            .getRawOne();
        const maxVal = maxResult?.max ? parseInt(maxResult.max, 10) : 0;
        return { documentNumber: maxVal + 1 };
    }
    parseRef(val) {
        if (val === null || val === undefined || val === '' || val === 0 || val === '0')
            return undefined;
        if (typeof val === 'object') {
            const innerId = val.id ?? val.ItemID ?? val.value;
            if (innerId !== undefined && innerId !== null) {
                const num = Number(innerId);
                return !isNaN(num) && num > 0 ? num : undefined;
            }
            return undefined;
        }
        const num = Number(val);
        return !isNaN(num) && num > 0 ? num : undefined;
    }
    async create(dto) {
        const { bsId, compId, fiscalYearId } = this.getScope();
        const userId = this.requestContextService.getUserId() || 1;
        let invoiceNum = dto.InvoiceNumber;
        if (!invoiceNum) {
            const next = await this.getNextNumber();
            invoiceNum = next.documentNumber;
        }
        const purchaseInvoiceId = await this.idGenService.generateNextIdBlock('PurchaseInvoice', 1);
        const nowTime = new Date().toTimeString().split(' ')[0];
        const entity = this.repository.create({
            PurchaseInvoiceID: purchaseInvoiceId,
            BaseType: Number(dto.BaseType || 1),
            SupplyRequestRef: this.parseRef(dto.SupplyRequestRef),
            SupplierRef: this.parseRef(dto.SupplierRef),
            SupplierName: dto.SupplierName || undefined,
            InvoiceNumber: invoiceNum,
            InvoiceDate: (0, date_parser_1.ensureIsoTimestamp)(dto.InvoiceDate),
            BaseDocumentNumber: dto.BaseDocumentNumber || undefined,
            Status: Number(dto.Status || 1),
            CurrencyRef: Number(dto.CurrencyRef || 1),
            Description: dto.Description || undefined,
            businessStructureRef: bsId,
            companyRef: compId,
            FiscalYearRef: fiscalYearId,
            creator: userId,
            lastModifier: userId,
            createTime: nowTime,
            lastModificationTime: nowTime,
        });
        await this.repository.save(entity);
        const rawItems = dto.details || dto.items || [];
        if (Array.isArray(rawItems) && rawItems.length > 0) {
            const validDetails = rawItems.filter((d) => !!this.parseRef(d.ItemRef ?? d.ItemID ?? d.itemRef ?? d.id));
            if (validDetails.length > 0) {
                const startDetailId = await this.idGenService.generateNextIdBlock('PurchaseInvoiceDetail', validDetails.length);
                const detailsToSave = validDetails.map((d, idx) => {
                    const itemRef = this.parseRef(d.ItemRef ?? d.ItemID ?? d.itemRef ?? d.id);
                    return {
                        PurchaseInvoiceDetailID: startDetailId + idx,
                        PurchaseInvoiceRef: purchaseInvoiceId,
                        RowNo: d.RowNo || idx + 1,
                        ItemRef: itemRef,
                        UnitType: d.UnitType === 'فرعی' || Number(d.UnitType) === 2 ? 2 : 1,
                        Quantity: Number(d.Quantity || 0),
                        UnitPrice: Number(d.UnitPrice || 0),
                        Discount: Number(d.Discount || 0),
                        Description: d.Description || undefined,
                        TrackingFactorValues: d.trackingFactorValues ?? d.TrackingFactorValues ?? d.trackingFactors ?? null,
                    };
                });
                await this.detailRepository.insert(detailsToSave);
            }
        }
        if (Array.isArray(dto.factors) && dto.factors.length > 0) {
            const validFactors = dto.factors.filter((f) => !!f.FactorTitle || Number(f.Amount) > 0);
            if (validFactors.length > 0) {
                const startFactorId = await this.idGenService.generateNextIdBlock('PurchaseInvoiceFactor', validFactors.length);
                const factorsToSave = validFactors.map((f, idx) => {
                    return {
                        PurchaseInvoiceFactorID: startFactorId + idx,
                        PurchaseInvoiceRef: purchaseInvoiceId,
                        RowNo: idx + 1,
                        FactorTitle: f.FactorTitle || '',
                        FactorType: Number(f.FactorType || 1),
                        Amount: Number(f.Amount || 0),
                        Description: f.Description || undefined,
                    };
                });
                await this.factorRepository.insert(factorsToSave);
            }
        }
        return this.findOne(purchaseInvoiceId);
    }
    async findAll(query) {
        const { bsId, compId, fiscalYearId } = this.getScope();
        const qb = this.repository
            .createQueryBuilder('pi')
            .orderBy('pi.InvoiceNumber', 'DESC');
        if (bsId && bsId > 1) {
            qb.andWhere('(pi.businessStructureRef = :bsId OR pi.businessStructureRef IS NULL)', { bsId });
        }
        if (compId && compId > 1) {
            qb.andWhere('(pi.companyRef = :compId OR pi.companyRef IS NULL)', { compId });
        }
        if (fiscalYearId) {
            qb.andWhere('(pi.FiscalYearRef = :fiscalYearId OR pi.FiscalYearRef IS NULL OR pi.FiscalYearRef = 1 OR pi.FiscalYearRef = 3)', { fiscalYearId });
        }
        return qb.getMany();
    }
    async findOne(id) {
        if (!id || isNaN(id)) {
            throw new common_1.NotFoundException(`شناسه ${id} نامعتبر است`);
        }
        const pi = await this.repository.findOne({
            where: { PurchaseInvoiceID: id },
            relations: ['details', 'details.item', 'details.item.MeasurementUnit', 'factors'],
        });
        if (!pi) {
            throw new common_1.NotFoundException(`فاکتور خرید کالا با شناسه ${id} یافت نشد`);
        }
        return pi;
    }
    async update(id, dto) {
        const pi = await this.findOne(id);
        const userId = this.requestContextService.getUserId() || 1;
        pi.BaseType = Number(dto.BaseType || pi.BaseType || 1);
        pi.SupplyRequestRef = dto.SupplyRequestRef !== undefined ? this.parseRef(dto.SupplyRequestRef) : pi.SupplyRequestRef;
        pi.SupplierRef = dto.SupplierRef !== undefined ? this.parseRef(dto.SupplierRef) : pi.SupplierRef;
        pi.SupplierName = dto.SupplierName !== undefined ? dto.SupplierName : pi.SupplierName;
        pi.InvoiceNumber = dto.InvoiceNumber || pi.InvoiceNumber;
        pi.InvoiceDate = dto.InvoiceDate ? (0, date_parser_1.ensureIsoTimestamp)(dto.InvoiceDate) : pi.InvoiceDate;
        pi.BaseDocumentNumber = dto.BaseDocumentNumber !== undefined ? dto.BaseDocumentNumber : pi.BaseDocumentNumber;
        pi.Status = Number(dto.Status || pi.Status);
        pi.CurrencyRef = Number(dto.CurrencyRef || pi.CurrencyRef);
        pi.Description = dto.Description !== undefined ? dto.Description : pi.Description;
        pi.lastModifier = userId;
        await this.repository.save(pi);
        await this.detailRepository.delete({ PurchaseInvoiceRef: id });
        const rawItemsUpdate = dto.details || dto.items || [];
        if (Array.isArray(rawItemsUpdate) && rawItemsUpdate.length > 0) {
            const validDetails = rawItemsUpdate.filter((d) => !!this.parseRef(d.ItemRef ?? d.ItemID ?? d.itemRef ?? d.id));
            if (validDetails.length > 0) {
                const startDetailId = await this.idGenService.generateNextIdBlock('PurchaseInvoiceDetail', validDetails.length);
                const detailsToSave = validDetails.map((d, idx) => {
                    const itemRef = this.parseRef(d.ItemRef ?? d.ItemID ?? d.itemRef ?? d.id);
                    return {
                        PurchaseInvoiceDetailID: startDetailId + idx,
                        PurchaseInvoiceRef: id,
                        RowNo: d.RowNo || idx + 1,
                        ItemRef: itemRef,
                        UnitType: d.UnitType === 'فرعی' || Number(d.UnitType) === 2 ? 2 : 1,
                        Quantity: Number(d.Quantity || 0),
                        UnitPrice: Number(d.UnitPrice || 0),
                        Discount: Number(d.Discount || 0),
                        Description: d.Description || undefined,
                        TrackingFactorValues: d.trackingFactorValues ?? d.TrackingFactorValues ?? d.trackingFactors ?? null,
                    };
                });
                await this.detailRepository.insert(detailsToSave);
            }
        }
        await this.factorRepository.delete({ PurchaseInvoiceRef: id });
        if (Array.isArray(dto.factors) && dto.factors.length > 0) {
            const validFactors = dto.factors.filter((f) => !!f.FactorTitle || Number(f.Amount) > 0);
            if (validFactors.length > 0) {
                const startFactorId = await this.idGenService.generateNextIdBlock('PurchaseInvoiceFactor', validFactors.length);
                const factorsToSave = validFactors.map((f, idx) => {
                    return {
                        PurchaseInvoiceFactorID: startFactorId + idx,
                        PurchaseInvoiceRef: id,
                        RowNo: idx + 1,
                        FactorTitle: f.FactorTitle || '',
                        FactorType: Number(f.FactorType || 1),
                        Amount: Number(f.Amount || 0),
                        Description: f.Description || undefined,
                    };
                });
                await this.factorRepository.insert(factorsToSave);
            }
        }
        return this.findOne(id);
    }
    async remove(id) {
        const pi = await this.findOne(id);
        await this.detailRepository.delete({ PurchaseInvoiceRef: id });
        await this.factorRepository.delete({ PurchaseInvoiceRef: id });
        await this.repository.remove(pi);
        return { success: true };
    }
};
exports.PurchaseInvoiceService = PurchaseInvoiceService;
exports.PurchaseInvoiceService = PurchaseInvoiceService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(purchase_invoice_entity_1.PurchaseInvoice)),
    __param(1, (0, typeorm_1.InjectRepository)(purchase_invoice_detail_entity_1.PurchaseInvoiceDetail)),
    __param(2, (0, typeorm_1.InjectRepository)(purchase_invoice_factor_entity_1.PurchaseInvoiceFactor)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        id_generation_service_1.IdGenerationService,
        request_context_service_1.RequestContextService])
], PurchaseInvoiceService);
//# sourceMappingURL=purchase-invoice.service.js.map