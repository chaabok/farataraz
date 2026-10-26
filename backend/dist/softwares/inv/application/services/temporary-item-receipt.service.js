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
exports.TemporaryItemReceiptService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const temporary_item_receipt_entity_1 = require("../../domain/entities/temporary-item-receipt.entity");
const temporary_item_receipt_detail_entity_1 = require("../../domain/entities/temporary-item-receipt-detail.entity");
const temporary_item_receipt_factor_entity_1 = require("../../domain/entities/temporary-item-receipt-factor.entity");
const temporary_item_receipt_tracking_factor_entity_1 = require("../../domain/entities/temporary-item-receipt-tracking-factor.entity");
const id_generation_service_1 = require("../../../../core/services/id-generation.service");
const request_context_service_1 = require("../../../../core/services/request-context.service");
const date_parser_1 = require("../../../../core/utils/date-parser");
let TemporaryItemReceiptService = class TemporaryItemReceiptService {
    constructor(repository, detailRepository, factorRepository, tfRepository, idGenService, requestContextService) {
        this.repository = repository;
        this.detailRepository = detailRepository;
        this.factorRepository = factorRepository;
        this.tfRepository = tfRepository;
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
    async getNextNumber(type = 1) {
        const { bsId, compId, fiscalYearId } = this.getScope();
        const maxResult = await this.repository
            .createQueryBuilder('tr')
            .select('MAX(tr.ReceiptNumber)', 'max')
            .where('tr.businessStructureRef = :bsId', { bsId })
            .andWhere('tr.companyRef = :compId', { compId })
            .andWhere('tr.FiscalYearRef = :fiscalYearId', { fiscalYearId })
            .andWhere('tr.Type = :type', { type })
            .getRawOne();
        const maxVal = maxResult?.max ? parseInt(maxResult.max, 10) : 0;
        return { documentNumber: maxVal + 1 };
    }
    parseRef(val) {
        if (val === null || val === undefined || val === '' || val === 0 || val === '0')
            return undefined;
        if (typeof val === 'object') {
            const innerId = val.id ?? val.ItemID ?? val.value ?? val.TrackingFactorID ?? val.trackingFactorId;
            if (innerId !== undefined && innerId !== null) {
                const num = Number(innerId);
                return !isNaN(num) && num > 0 ? num : undefined;
            }
            return undefined;
        }
        const num = Number(val);
        return !isNaN(num) && num > 0 ? num : undefined;
    }
    async saveTrackingFactorsForDetail(detailId, tfData) {
        if (!tfData)
            return;
        const rows = Array.isArray(tfData) ? tfData : [tfData];
        const validRows = rows.filter((r) => r && typeof r === 'object' && Object.keys(r).length > 0);
        if (validRows.length === 0)
            return;
        const startTfId = await this.idGenService.generateNextIdBlock('TemporaryItemReceiptTrackingFactor', validRows.length);
        const { bsId, compId } = this.getScope();
        const userId = this.requestContextService.getUserId() || 1;
        const nowTime = new Date().toTimeString().split(' ')[0];
        const tfEntities = validRows.map((r, idx) => {
            const tfRef = this.parseRef(r.TrackingFactorRef ?? r.trackingFactorRef ?? r.id ?? r.TrackingFactorID ?? r.trackingFactorId);
            return this.tfRepository.create({
                TemporaryItemReceiptTrackingFactorID: startTfId + idx,
                TemporaryItemReceiptDetailRef: detailId,
                TrackingFactorRef: tfRef,
                TrackingFactorCode: r.TrackingFactorCode || r.trackingFactorCode ? Number(r.TrackingFactorCode || r.trackingFactorCode) : undefined,
                TrackingFactorName: r.TrackingFactorName || r.trackingFactorName || undefined,
                Quantity: Number(r.Quantity || r.quantity || 0),
                FactorValue: r.FactorValue || r.factorValue || (typeof r.value === 'string' ? r.value : (typeof r.FactorValue === 'object' ? JSON.stringify(r.FactorValue) : undefined)),
                StartValue: r.StartValue || r.startValue || undefined,
                EndValue: r.EndValue || r.endValue || undefined,
                TrackingFactorValues: r,
                businessStructureRef: bsId,
                companyRef: compId,
                creator: userId,
                lastModifier: userId,
                createTime: nowTime,
                lastModificationTime: nowTime,
            });
        });
        await this.tfRepository.save(tfEntities);
    }
    async create(dto) {
        const { bsId, compId, fiscalYearId } = this.getScope();
        const userId = this.requestContextService.getUserId() || 1;
        let receiptNum = dto.ReceiptNumber;
        const docType = Number(dto.Type || 1);
        if (!receiptNum) {
            const next = await this.getNextNumber(docType);
            receiptNum = next.documentNumber;
        }
        const temporaryItemReceiptId = await this.idGenService.generateNextIdBlock('TemporaryItemReceipt', 1);
        const nowTime = new Date().toTimeString().split(' ')[0];
        const entity = this.repository.create({
            TemporaryItemReceiptID: temporaryItemReceiptId,
            Type: docType,
            BaseType: Number(dto.BaseType || 1),
            SupplyRequestRef: this.parseRef(dto.SupplyRequestRef),
            SupplierRef: this.parseRef(dto.SupplierRef),
            SupplierName: dto.SupplierName || undefined,
            ReceiptNumber: receiptNum,
            ReceiptDate: (0, date_parser_1.ensureIsoTimestamp)(dto.ReceiptDate),
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
        if (dto.details && dto.details.length > 0) {
            const validDetails = dto.details.filter((d) => !!this.parseRef(d.ItemRef));
            if (validDetails.length > 0) {
                const startDetailId = await this.idGenService.generateNextIdBlock('TemporaryItemReceiptDetail', validDetails.length);
                const detailsToSave = validDetails.map((d, idx) => {
                    const itemRef = this.parseRef(d.ItemRef);
                    const tfVal = d.trackingFactorValues ?? d.TrackingFactorValues ?? d.trackingFactors ?? null;
                    return this.detailRepository.create({
                        TemporaryItemReceiptDetailID: startDetailId + idx,
                        TemporaryItemReceiptRef: temporaryItemReceiptId,
                        RowNo: d.RowNo || idx + 1,
                        ItemRef: itemRef,
                        BaseNumber: d.BaseNumber || undefined,
                        UnitName: d.UnitName || undefined,
                        UnitType: Number(d.UnitType || 1),
                        Quantity: Number(d.Quantity || 1),
                        UnitPrice: Number(d.UnitPrice || 0),
                        Discount: Number(d.Discount || 0),
                        Description: d.Description || undefined,
                        TrackingFactorValues: tfVal,
                    });
                });
                const savedDetails = await this.detailRepository.save(detailsToSave);
                for (let i = 0; i < validDetails.length; i++) {
                    const d = validDetails[i];
                    const savedDetail = savedDetails[i];
                    const tfVal = d.trackingFactorValues ?? d.TrackingFactorValues ?? d.trackingFactors;
                    if (tfVal) {
                        await this.saveTrackingFactorsForDetail(savedDetail.TemporaryItemReceiptDetailID, tfVal);
                    }
                }
            }
        }
        if (dto.factors && dto.factors.length > 0) {
            const validFactors = dto.factors.filter((f) => f.FactorTitle && Number(f.Amount || 0) > 0);
            if (validFactors.length > 0) {
                const startFactorId = await this.idGenService.generateNextIdBlock('TemporaryItemReceiptFactor', validFactors.length);
                const factorsToSave = validFactors.map((f, idx) => {
                    return this.factorRepository.create({
                        TemporaryItemReceiptFactorID: startFactorId + idx,
                        TemporaryItemReceiptRef: temporaryItemReceiptId,
                        RowNo: f.RowNo || idx + 1,
                        FactorTitle: f.FactorTitle,
                        FactorType: Number(f.FactorType || 1),
                        Amount: Number(f.Amount || 0),
                        Description: f.Description || undefined,
                    });
                });
                await this.factorRepository.save(factorsToSave);
            }
        }
        return this.findOne(temporaryItemReceiptId);
    }
    async findAll(query) {
        const { bsId, compId, fiscalYearId } = this.getScope();
        const type = query?.type ? Number(query.type) : (query?.Type ? Number(query.Type) : undefined);
        const qb = this.repository
            .createQueryBuilder('tr')
            .where('tr.businessStructureRef = :bsId', { bsId })
            .andWhere('tr.companyRef = :compId', { compId })
            .andWhere('tr.FiscalYearRef = :fiscalYearId', { fiscalYearId });
        if (type) {
            qb.andWhere('tr.Type = :type', { type });
        }
        return qb.orderBy('tr.ReceiptNumber', 'DESC').getMany();
    }
    async findOne(id) {
        const tr = await this.repository.findOne({
            where: { TemporaryItemReceiptID: id },
            relations: ['details', 'details.item', 'details.item.MeasurementUnit', 'details.trackingFactors', 'factors'],
        });
        if (!tr) {
            throw new common_1.NotFoundException(`رسید موقت کالا با شناسه ${id} یافت نشد`);
        }
        return tr;
    }
    async update(id, dto) {
        const tr = await this.findOne(id);
        const userId = this.requestContextService.getUserId() || 1;
        tr.Type = dto.Type ? Number(dto.Type) : tr.Type;
        tr.BaseType = Number(dto.BaseType || tr.BaseType);
        tr.SupplyRequestRef = this.parseRef(dto.SupplyRequestRef) ?? tr.SupplyRequestRef;
        tr.SupplierRef = this.parseRef(dto.SupplierRef) ?? tr.SupplierRef;
        tr.SupplierName = dto.SupplierName ?? tr.SupplierName;
        tr.ReceiptNumber = dto.ReceiptNumber ? Number(dto.ReceiptNumber) : tr.ReceiptNumber;
        tr.ReceiptDate = dto.ReceiptDate ? (0, date_parser_1.ensureIsoTimestamp)(dto.ReceiptDate) : tr.ReceiptDate;
        tr.BaseDocumentNumber = dto.BaseDocumentNumber ?? tr.BaseDocumentNumber;
        tr.Status = dto.Status ? Number(dto.Status) : tr.Status;
        tr.CurrencyRef = dto.CurrencyRef ? Number(dto.CurrencyRef) : tr.CurrencyRef;
        tr.Description = dto.Description ?? tr.Description;
        tr.lastModifier = userId;
        await this.repository.save(tr);
        const existingDetails = await this.detailRepository.find({ where: { TemporaryItemReceiptRef: id } });
        if (existingDetails.length > 0) {
            const detailIds = existingDetails.map((d) => d.TemporaryItemReceiptDetailID);
            await this.tfRepository.createQueryBuilder()
                .delete()
                .where('TemporaryItemReceiptDetailRef IN (:...detailIds)', { detailIds })
                .execute();
        }
        await this.detailRepository.delete({ TemporaryItemReceiptRef: id });
        await this.factorRepository.delete({ TemporaryItemReceiptRef: id });
        if (dto.details && dto.details.length > 0) {
            const validDetails = dto.details.filter((d) => !!this.parseRef(d.ItemRef));
            if (validDetails.length > 0) {
                const startDetailId = await this.idGenService.generateNextIdBlock('TemporaryItemReceiptDetail', validDetails.length);
                const detailsToSave = validDetails.map((d, idx) => {
                    const itemRef = this.parseRef(d.ItemRef);
                    const tfVal = d.trackingFactorValues ?? d.TrackingFactorValues ?? d.trackingFactors ?? null;
                    return this.detailRepository.create({
                        TemporaryItemReceiptDetailID: startDetailId + idx,
                        TemporaryItemReceiptRef: id,
                        RowNo: d.RowNo || idx + 1,
                        ItemRef: itemRef,
                        BaseNumber: d.BaseNumber || undefined,
                        UnitName: d.UnitName || undefined,
                        UnitType: Number(d.UnitType || 1),
                        Quantity: Number(d.Quantity || 1),
                        UnitPrice: Number(d.UnitPrice || 0),
                        Discount: Number(d.Discount || 0),
                        Description: d.Description || undefined,
                        TrackingFactorValues: tfVal,
                    });
                });
                const savedDetails = await this.detailRepository.save(detailsToSave);
                for (let i = 0; i < validDetails.length; i++) {
                    const d = validDetails[i];
                    const savedDetail = savedDetails[i];
                    const tfVal = d.trackingFactorValues ?? d.TrackingFactorValues ?? d.trackingFactors;
                    if (tfVal) {
                        await this.saveTrackingFactorsForDetail(savedDetail.TemporaryItemReceiptDetailID, tfVal);
                    }
                }
            }
        }
        if (dto.factors && dto.factors.length > 0) {
            const validFactors = dto.factors.filter((f) => f.FactorTitle && Number(f.Amount || 0) > 0);
            if (validFactors.length > 0) {
                const startFactorId = await this.idGenService.generateNextIdBlock('TemporaryItemReceiptFactor', validFactors.length);
                const factorsToSave = validFactors.map((f, idx) => {
                    return this.factorRepository.create({
                        TemporaryItemReceiptFactorID: startFactorId + idx,
                        TemporaryItemReceiptRef: id,
                        RowNo: f.RowNo || idx + 1,
                        FactorTitle: f.FactorTitle,
                        FactorType: Number(f.FactorType || 1),
                        Amount: Number(f.Amount || 0),
                        Description: f.Description || undefined,
                    });
                });
                await this.factorRepository.save(factorsToSave);
            }
        }
        return this.findOne(id);
    }
    async remove(id) {
        const tr = await this.findOne(id);
        const existingDetails = await this.detailRepository.find({ where: { TemporaryItemReceiptRef: id } });
        if (existingDetails.length > 0) {
            const detailIds = existingDetails.map((d) => d.TemporaryItemReceiptDetailID);
            await this.tfRepository.createQueryBuilder()
                .delete()
                .where('TemporaryItemReceiptDetailRef IN (:...detailIds)', { detailIds })
                .execute();
        }
        await this.detailRepository.delete({ TemporaryItemReceiptRef: id });
        await this.factorRepository.delete({ TemporaryItemReceiptRef: id });
        await this.repository.remove(tr);
    }
};
exports.TemporaryItemReceiptService = TemporaryItemReceiptService;
exports.TemporaryItemReceiptService = TemporaryItemReceiptService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(temporary_item_receipt_entity_1.TemporaryItemReceipt)),
    __param(1, (0, typeorm_1.InjectRepository)(temporary_item_receipt_detail_entity_1.TemporaryItemReceiptDetail)),
    __param(2, (0, typeorm_1.InjectRepository)(temporary_item_receipt_factor_entity_1.TemporaryItemReceiptFactor)),
    __param(3, (0, typeorm_1.InjectRepository)(temporary_item_receipt_tracking_factor_entity_1.TemporaryItemReceiptTrackingFactor)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        id_generation_service_1.IdGenerationService,
        request_context_service_1.RequestContextService])
], TemporaryItemReceiptService);
//# sourceMappingURL=temporary-item-receipt.service.js.map