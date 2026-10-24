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
exports.ServicePurchaseInvoiceService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const service_purchase_invoice_entity_1 = require("../../domain/entities/service-purchase-invoice.entity");
const service_purchase_invoice_detail_entity_1 = require("../../domain/entities/service-purchase-invoice-detail.entity");
const service_purchase_invoice_factor_entity_1 = require("../../domain/entities/service-purchase-invoice-factor.entity");
const id_generation_service_1 = require("../../../../core/services/id-generation.service");
const request_context_service_1 = require("../../../../core/services/request-context.service");
const date_parser_1 = require("../../../../core/utils/date-parser");
let ServicePurchaseInvoiceService = class ServicePurchaseInvoiceService {
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
            .createQueryBuilder('spi')
            .select('MAX(spi.InvoiceNumber)', 'max')
            .where('spi.businessStructureRef = :bsId', { bsId })
            .andWhere('spi.companyRef = :compId', { compId })
            .andWhere('spi.FiscalYearRef = :fiscalYearId', { fiscalYearId })
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
        const servicePurchaseInvoiceId = await this.idGenService.generateNextIdBlock('ServicePurchaseInvoice', 1);
        const nowTime = new Date().toTimeString().split(' ')[0];
        const entity = this.repository.create({
            ServicePurchaseInvoiceID: servicePurchaseInvoiceId,
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
        if (Array.isArray(dto.items) && dto.items.length > 0) {
            const validDetails = dto.items.filter((d) => !!this.parseRef(d.ItemRef ?? d.ItemID ?? d.itemRef));
            if (validDetails.length > 0) {
                const startDetailId = await this.idGenService.generateNextIdBlock('ServicePurchaseInvoiceDetail', validDetails.length);
                const detailsToSave = validDetails.map((d, idx) => {
                    const itemRef = this.parseRef(d.ItemRef ?? d.ItemID ?? d.itemRef);
                    return {
                        ServicePurchaseInvoiceDetailID: startDetailId + idx,
                        ServicePurchaseInvoiceRef: servicePurchaseInvoiceId,
                        RowNo: idx + 1,
                        ItemRef: itemRef,
                        UnitType: Number(d.UnitType || 1),
                        Quantity: Number(d.Quantity || 1),
                        UnitPrice: Number(d.UnitPrice || 0),
                        Discount: Number(d.Discount || 0),
                        Description: d.Description || undefined,
                    };
                });
                await this.detailRepository.insert(detailsToSave);
            }
        }
        if (Array.isArray(dto.factors) && dto.factors.length > 0) {
            const validFactors = dto.factors.filter((f) => !!f.FactorTitle || Number(f.Amount) > 0);
            if (validFactors.length > 0) {
                const startFactorId = await this.idGenService.generateNextIdBlock('ServicePurchaseInvoiceFactor', validFactors.length);
                const factorsToSave = validFactors.map((f, idx) => {
                    return {
                        ServicePurchaseInvoiceFactorID: startFactorId + idx,
                        ServicePurchaseInvoiceRef: servicePurchaseInvoiceId,
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
        return this.findOne(servicePurchaseInvoiceId);
    }
    async findAll(query) {
        const { bsId, compId, fiscalYearId } = this.getScope();
        return this.repository
            .createQueryBuilder('spi')
            .where('spi.businessStructureRef = :bsId', { bsId })
            .andWhere('spi.companyRef = :compId', { compId })
            .andWhere('spi.FiscalYearRef = :fiscalYearId', { fiscalYearId })
            .orderBy('spi.InvoiceNumber', 'DESC')
            .getMany();
    }
    async findOne(id) {
        if (!id || isNaN(id)) {
            throw new common_1.NotFoundException(`شناسه ${id} نامعتبر است`);
        }
        const spi = await this.repository.findOne({
            where: { ServicePurchaseInvoiceID: id },
            relations: ['details', 'details.item', 'details.item.MeasurementUnit', 'factors'],
        });
        if (!spi) {
            throw new common_1.NotFoundException(`فاکتور خرید خدمت با شناسه ${id} یافت نشد`);
        }
        return spi;
    }
    async update(id, dto) {
        const spi = await this.findOne(id);
        const userId = this.requestContextService.getUserId() || 1;
        spi.BaseType = Number(dto.BaseType || spi.BaseType || 1);
        spi.SupplyRequestRef = dto.SupplyRequestRef !== undefined ? this.parseRef(dto.SupplyRequestRef) : spi.SupplyRequestRef;
        spi.SupplierRef = dto.SupplierRef !== undefined ? this.parseRef(dto.SupplierRef) : spi.SupplierRef;
        spi.SupplierName = dto.SupplierName !== undefined ? dto.SupplierName : spi.SupplierName;
        spi.InvoiceNumber = dto.InvoiceNumber || spi.InvoiceNumber;
        spi.InvoiceDate = dto.InvoiceDate ? (0, date_parser_1.ensureIsoTimestamp)(dto.InvoiceDate) : spi.InvoiceDate;
        spi.BaseDocumentNumber = dto.BaseDocumentNumber !== undefined ? dto.BaseDocumentNumber : spi.BaseDocumentNumber;
        spi.Status = Number(dto.Status || spi.Status);
        spi.CurrencyRef = Number(dto.CurrencyRef || spi.CurrencyRef);
        spi.Description = dto.Description !== undefined ? dto.Description : spi.Description;
        spi.lastModifier = userId;
        await this.repository.save(spi);
        await this.detailRepository.delete({ ServicePurchaseInvoiceRef: id });
        if (Array.isArray(dto.items) && dto.items.length > 0) {
            const validDetails = dto.items.filter((d) => !!this.parseRef(d.ItemRef ?? d.ItemID ?? d.itemRef));
            if (validDetails.length > 0) {
                const startDetailId = await this.idGenService.generateNextIdBlock('ServicePurchaseInvoiceDetail', validDetails.length);
                const detailsToSave = validDetails.map((d, idx) => {
                    const itemRef = this.parseRef(d.ItemRef ?? d.ItemID ?? d.itemRef);
                    return {
                        ServicePurchaseInvoiceDetailID: startDetailId + idx,
                        ServicePurchaseInvoiceRef: id,
                        RowNo: idx + 1,
                        ItemRef: itemRef,
                        UnitType: Number(d.UnitType || 1),
                        Quantity: Number(d.Quantity || 1),
                        UnitPrice: Number(d.UnitPrice || 0),
                        Discount: Number(d.Discount || 0),
                        Description: d.Description || undefined,
                    };
                });
                await this.detailRepository.insert(detailsToSave);
            }
        }
        await this.factorRepository.delete({ ServicePurchaseInvoiceRef: id });
        if (Array.isArray(dto.factors) && dto.factors.length > 0) {
            const validFactors = dto.factors.filter((f) => !!f.FactorTitle || Number(f.Amount) > 0);
            if (validFactors.length > 0) {
                const startFactorId = await this.idGenService.generateNextIdBlock('ServicePurchaseInvoiceFactor', validFactors.length);
                const factorsToSave = validFactors.map((f, idx) => {
                    return {
                        ServicePurchaseInvoiceFactorID: startFactorId + idx,
                        ServicePurchaseInvoiceRef: id,
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
        const spi = await this.findOne(id);
        await this.detailRepository.delete({ ServicePurchaseInvoiceRef: id });
        await this.factorRepository.delete({ ServicePurchaseInvoiceRef: id });
        await this.repository.remove(spi);
        return { success: true };
    }
};
exports.ServicePurchaseInvoiceService = ServicePurchaseInvoiceService;
exports.ServicePurchaseInvoiceService = ServicePurchaseInvoiceService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(service_purchase_invoice_entity_1.ServicePurchaseInvoice)),
    __param(1, (0, typeorm_1.InjectRepository)(service_purchase_invoice_detail_entity_1.ServicePurchaseInvoiceDetail)),
    __param(2, (0, typeorm_1.InjectRepository)(service_purchase_invoice_factor_entity_1.ServicePurchaseInvoiceFactor)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        id_generation_service_1.IdGenerationService,
        request_context_service_1.RequestContextService])
], ServicePurchaseInvoiceService);
//# sourceMappingURL=service-purchase-invoice.service.js.map