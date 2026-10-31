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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.WarehouseReceiptService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const moment_jalaali_1 = __importDefault(require("moment-jalaali"));
const warehouse_receipt_entity_1 = require("../../domain/entities/warehouse-receipt.entity");
const warehouse_document_type_entity_1 = require("../../domain/entities/warehouse-document-type.entity");
const warehouse_receipt_detail_entity_1 = require("../../domain/entities/warehouse-receipt-detail.entity");
const warehouse_receipt_factor_entity_1 = require("../../domain/entities/warehouse-receipt-factor.entity");
const warehouse_issue_tracking_factor_entity_1 = require("../../domain/entities/warehouse-issue-tracking-factor.entity");
const warehouse_receipt_tracking_factor_entity_1 = require("../../domain/entities/warehouse-receipt-tracking-factor.entity");
const warehouse_vouchers_pricing_entity_1 = require("../../domain/entities/warehouse-vouchers-pricing.entity");
const pricing_type_enum_1 = require("../../domain/enums/pricing-type.enum");
const id_generation_service_1 = require("../../../../core/services/id-generation.service");
const request_context_service_1 = require("../../../../core/services/request-context.service");
const date_parser_1 = require("../../../../core/utils/date-parser");
const stocktaking_tag_lock_util_1 = require("../utils/stocktaking-tag-lock.util");
let WarehouseReceiptService = class WarehouseReceiptService {
    constructor(repository, detailRepository, factorRepository, issueTfRepository, receiptTfRepository, pricingRepository, idGenService, requestContextService) {
        this.repository = repository;
        this.detailRepository = detailRepository;
        this.factorRepository = factorRepository;
        this.issueTfRepository = issueTfRepository;
        this.receiptTfRepository = receiptTfRepository;
        this.pricingRepository = pricingRepository;
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
            .createQueryBuilder('wr')
            .select('MAX(wr.ReceiptNumber)', 'max')
            .where('wr.businessStructureRef = :bsId', { bsId })
            .andWhere('wr.companyRef = :compId', { compId })
            .andWhere('wr.FiscalYearRef = :fiscalYearId', { fiscalYearId })
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
    async saveTrackingFactorsBatch(detailTasks) {
        if (!detailTasks || detailTasks.length === 0)
            return;
        const flatTasks = [];
        for (const task of detailTasks) {
            if (!task.tfData)
                continue;
            const rows = Array.isArray(task.tfData) ? task.tfData : [task.tfData];
            const validRows = rows.filter((r) => r && typeof r === 'object' && Object.keys(r).length > 0);
            for (const r of validRows) {
                flatTasks.push({ detailId: task.detailId, row: r });
            }
        }
        if (flatTasks.length === 0)
            return;
        const { bsId, compId } = this.getScope();
        const userId = this.requestContextService.getUserId() || 1;
        const nowTime = new Date().toTimeString().split(' ')[0];
        const startTfIdIssue = await this.idGenService.generateNextIdBlock('WarehouseIssueTrackingFactor', flatTasks.length);
        const issueTfEntities = flatTasks.map((t, idx) => {
            const r = t.row;
            const tfRef = this.parseRef(r.TrackingFactorRef ?? r.trackingFactorRef ?? r.id ?? r.TrackingFactorID ?? r.trackingFactorId);
            return this.issueTfRepository.create({
                WarehouseIssueTrackingFactorID: startTfIdIssue + idx,
                WarehouseIssueDetailRef: t.detailId,
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
        await this.issueTfRepository.save(issueTfEntities);
        const startTfIdReceipt = await this.idGenService.generateNextIdBlock('WarehouseReceiptTrackingFactor', flatTasks.length);
        const receiptTfEntities = flatTasks.map((t, idx) => {
            const r = t.row;
            const tfRef = this.parseRef(r.TrackingFactorRef ?? r.trackingFactorRef ?? r.id ?? r.TrackingFactorID ?? r.trackingFactorId);
            return this.receiptTfRepository.create({
                WarehouseReceiptTrackingFactorID: startTfIdReceipt + idx,
                WarehouseReceiptDetailRef: t.detailId,
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
        await this.receiptTfRepository.save(receiptTfEntities);
    }
    async saveTrackingFactorsForDetail(detailId, tfData) {
        return this.saveTrackingFactorsBatch([{ detailId, tfData }]);
    }
    async create(dto) {
        const { bsId, compId, fiscalYearId } = this.getScope();
        const userId = this.requestContextService.getUserId() || 1;
        const warehouseRefs = [
            this.parseRef(dto.WarehouseRef),
            ...(dto.details || []).map((d) => this.parseRef(d.WarehouseRef)),
        ];
        await (0, stocktaking_tag_lock_util_1.validateStocktakingTagLock)(this.repository.manager.connection, warehouseRefs, dto.ReceiptDate);
        let receiptNum = dto.ReceiptNumber;
        if (!receiptNum) {
            const next = await this.getNextNumber();
            receiptNum = next.documentNumber;
        }
        const warehouseReceiptId = await this.idGenService.generateNextIdBlock('WarehouseReceipt', 1);
        const nowTime = new Date().toTimeString().split(' ')[0];
        const entity = this.repository.create({
            WarehouseReceiptID: warehouseReceiptId,
            BaseType: Number(dto.BaseType || 1),
            WarehouseDocumentTypeRef: this.parseRef(dto.WarehouseDocumentTypeRef),
            WarehouseRef: this.parseRef(dto.WarehouseRef),
            WarehouseName: dto.WarehouseName || undefined,
            TemporaryReceiptRef: this.parseRef(dto.TemporaryReceiptRef),
            SupplyRequestRef: this.parseRef(dto.SupplyRequestRef),
            PurchaseInvoiceRef: this.parseRef(dto.PurchaseInvoiceRef),
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
                const startDetailId = await this.idGenService.generateNextIdBlock('WarehouseReceiptDetail', validDetails.length);
                const detailsToSave = validDetails.map((d, idx) => {
                    const itemRef = this.parseRef(d.ItemRef);
                    return this.detailRepository.create({
                        WarehouseReceiptDetailID: startDetailId + idx,
                        WarehouseReceiptRef: warehouseReceiptId,
                        RowNo: d.RowNo || idx + 1,
                        ItemRef: itemRef,
                        WarehouseRef: this.parseRef(d.WarehouseRef) || this.parseRef(dto.WarehouseRef),
                        BaseNumber: d.BaseNumber || undefined,
                        UnitName: d.UnitName || undefined,
                        UnitType: Number(d.UnitType || 1),
                        Quantity: Number(d.Quantity || 1),
                        Description: d.Description || undefined,
                        TrackingFactorValues: d.trackingFactorValues || d.TrackingFactorValues || undefined,
                    });
                });
                await this.detailRepository.save(detailsToSave);
                const startPricingId = await this.idGenService.generateNextIdBlock('WarehouseVouchersPricing', detailsToSave.length);
                const pricingEntities = detailsToSave.map((savedDet, idx) => {
                    const origDet = validDetails[idx];
                    const qty = Number(savedDet.Quantity || 1);
                    const unitPrice = Number(origDet?.UnitPrice || 0);
                    const totalPrice = Number(origDet?.TotalPrice ?? (qty * unitPrice));
                    const deductions = Number(origDet?.Discount || origDet?.Deductions || 0);
                    const priceAfterDiscount = Number(origDet?.PriceAfterDiscount ?? Math.max(0, totalPrice - deductions));
                    const additions = Number(origDet?.Additions ?? origDet?.VatTax ?? 0);
                    const netPrice = origDet?.NetPrice !== undefined && origDet?.NetPrice !== null
                        ? Number(origDet.NetPrice)
                        : (priceAfterDiscount + additions);
                    return this.pricingRepository.create({
                        WarehouseVouchersPricingID: startPricingId + idx,
                        PricingType: pricing_type_enum_1.PricingType.Receipt,
                        WarehouseVoucherRef: warehouseReceiptId,
                        WarehouseVoucherDetailRef: savedDet.WarehouseReceiptDetailID,
                        ItemRef: savedDet.ItemRef,
                        UnitPrice: unitPrice,
                        Additions: additions,
                        Deductions: deductions,
                        NetPrice: netPrice,
                        Description: savedDet.Description,
                        businessStructureRef: bsId,
                        companyRef: compId,
                        FiscalYearRef: fiscalYearId,
                        creator: userId,
                        lastModifier: userId,
                        createTime: nowTime,
                        lastModificationTime: nowTime,
                    });
                });
                await this.pricingRepository.save(pricingEntities);
                const tfTasks = [];
                for (let i = 0; i < detailsToSave.length; i++) {
                    const savedDet = detailsToSave[i];
                    const origDet = validDetails[i];
                    const tfVal = origDet.trackingFactorValues || origDet.TrackingFactorValues;
                    if (tfVal) {
                        tfTasks.push({ detailId: savedDet.WarehouseReceiptDetailID, tfData: tfVal });
                    }
                }
                if (tfTasks.length > 0) {
                    await this.saveTrackingFactorsBatch(tfTasks);
                }
            }
        }
        if (dto.factors && dto.factors.length > 0) {
            const validFactors = dto.factors.filter((f) => f.FactorTitle && Number(f.Amount || 0) > 0);
            if (validFactors.length > 0) {
                const startFactorId = await this.idGenService.generateNextIdBlock('WarehouseReceiptFactor', validFactors.length);
                const factorsToSave = validFactors.map((f, idx) => this.factorRepository.create({
                    WarehouseReceiptFactorID: startFactorId + idx,
                    WarehouseReceiptRef: warehouseReceiptId,
                    RowNo: f.RowNo || idx + 1,
                    FactorTitle: f.FactorTitle,
                    FactorType: Number(f.FactorType || 1),
                    Amount: Number(f.Amount || 0),
                    Description: f.Description || undefined,
                }));
                await this.factorRepository.save(factorsToSave);
            }
        }
        return this.findOne(warehouseReceiptId);
    }
    async findAll(query) {
        const { bsId, compId, fiscalYearId } = this.getScope();
        const qb = this.repository
            .createQueryBuilder('wr')
            .leftJoinAndSelect('wr.details', 'details')
            .leftJoinAndSelect('details.item', 'item')
            .leftJoinAndSelect('item.MeasurementUnit', 'unit')
            .leftJoinAndSelect('wr.factors', 'factors')
            .leftJoin(warehouse_document_type_entity_1.WarehouseDocumentType, 'docType', 'docType.WarehouseDocumentTypeID = wr.WarehouseDocumentTypeRef')
            .where('wr.businessStructureRef = :bsId', { bsId })
            .andWhere('wr.companyRef = :compId', { compId })
            .andWhere('wr.FiscalYearRef = :fiscalYearId', { fiscalYearId });
        if (query?.ReceiptNumber) {
            qb.andWhere('wr.ReceiptNumber = :num', { num: query.ReceiptNumber });
        }
        if (query?.nature !== undefined && query?.nature !== null && query?.nature !== '') {
            const nat = Number(query.nature);
            if (!isNaN(nat) && nat > 0) {
                if (nat === 1) {
                    qb.andWhere('(docType.WarehouseDocumentNature = 1 OR wr.WarehouseDocumentTypeRef IS NULL)');
                }
                else {
                    qb.andWhere('docType.WarehouseDocumentNature = :nat', { nat });
                }
            }
        }
        qb.orderBy('wr.ReceiptNumber', 'DESC');
        const records = await qb.getMany();
        const voucherIds = records.map((r) => r.WarehouseReceiptID);
        if (voucherIds.length > 0) {
            const pricings = await this.pricingRepository.find({
                where: { WarehouseVoucherRef: (0, typeorm_2.In)(voucherIds), PricingType: pricing_type_enum_1.PricingType.Receipt },
            });
            const pricingMap = new Map();
            pricings.forEach((p) => {
                if (p.WarehouseVoucherDetailRef) {
                    pricingMap.set(String(p.WarehouseVoucherDetailRef), p);
                }
                else {
                    pricingMap.set(`${p.WarehouseVoucherRef}_${p.ItemRef}`, p);
                }
            });
            records.forEach((r) => {
                r.IssueNumber = r.IssueNumber || r.ReceiptNumber;
                r.IssueDate = r.IssueDate || r.ReceiptDate;
                r.ReceiverName = r.ReceiverName || r.SupplierName;
                r.ReceiverRef = r.ReceiverRef || r.SupplierRef;
                (r.details || []).forEach((d) => {
                    const pricing = pricingMap.get(String(d.WarehouseReceiptDetailID)) || pricingMap.get(`${r.WarehouseReceiptID}_${d.ItemRef}`);
                    if (pricing) {
                        d.UnitPrice = Number(pricing.UnitPrice || 0);
                        d.Discount = Number(pricing.Deductions || 0);
                        d.Deductions = Number(pricing.Deductions || 0);
                        d.Additions = Number(pricing.Additions || 0);
                        d.NetPrice = Number(pricing.NetPrice || 0);
                        d.TotalPrice = (Number(d.Quantity) || 1) * Number(pricing.UnitPrice || 0);
                        d.PriceAfterDiscount = Math.max(0, d.TotalPrice - d.Discount);
                    }
                });
            });
        }
        else {
            records.forEach((r) => {
                r.IssueNumber = r.IssueNumber || r.ReceiptNumber;
                r.IssueDate = r.IssueDate || r.ReceiptDate;
                r.ReceiverName = r.ReceiverName || r.SupplierName;
                r.ReceiverRef = r.ReceiverRef || r.SupplierRef;
            });
        }
        return records;
    }
    async findOne(id) {
        const { bsId, compId, fiscalYearId } = this.getScope();
        const record = await this.repository
            .createQueryBuilder('wr')
            .leftJoinAndSelect('wr.details', 'details')
            .leftJoinAndSelect('details.item', 'item')
            .leftJoinAndSelect('item.MeasurementUnit', 'unit')
            .leftJoinAndSelect('wr.factors', 'factors')
            .where('wr.WarehouseReceiptID = :id', { id })
            .andWhere('wr.businessStructureRef = :bsId', { bsId })
            .andWhere('wr.companyRef = :compId', { compId })
            .andWhere('wr.FiscalYearRef = :fiscalYearId', { fiscalYearId })
            .getOne();
        if (!record) {
            throw new common_1.NotFoundException(`رسید انبار با شناسه ${id} یافت نشد`);
        }
        const pricings = await this.pricingRepository.find({
            where: { WarehouseVoucherRef: id, PricingType: pricing_type_enum_1.PricingType.Receipt },
        });
        const pricingMap = new Map();
        pricings.forEach((p) => {
            if (p.WarehouseVoucherDetailRef) {
                pricingMap.set(String(p.WarehouseVoucherDetailRef), p);
            }
            else {
                pricingMap.set(`${p.WarehouseVoucherRef}_${p.ItemRef}`, p);
            }
        });
        (record.details || []).forEach((d) => {
            const pricing = pricingMap.get(String(d.WarehouseReceiptDetailID)) || pricingMap.get(`${record.WarehouseReceiptID}_${d.ItemRef}`);
            if (pricing) {
                d.UnitPrice = Number(pricing.UnitPrice || 0);
                d.Discount = Number(pricing.Deductions || 0);
                d.Deductions = Number(pricing.Deductions || 0);
                d.Additions = Number(pricing.Additions || 0);
                d.NetPrice = Number(pricing.NetPrice || 0);
                d.TotalPrice = (Number(d.Quantity) || 1) * Number(pricing.UnitPrice || 0);
                d.PriceAfterDiscount = Math.max(0, d.TotalPrice - d.Discount);
            }
        });
        record.IssueNumber = record.ReceiptNumber;
        record.IssueDate = record.ReceiptDate;
        record.ReceiverName = record.SupplierName;
        record.ReceiverRef = record.SupplierRef;
        return record;
    }
    async update(id, dto) {
        const record = await this.findOne(id);
        const { bsId, compId, fiscalYearId } = this.getScope();
        const userId = this.requestContextService.getUserId() || 1;
        const nowTime = new Date().toTimeString().split(' ')[0];
        const warehouseRefs = [
            this.parseRef(dto.WarehouseRef) || record.WarehouseRef,
            ...(dto.details || []).map((d) => this.parseRef(d.WarehouseRef)),
        ];
        await (0, stocktaking_tag_lock_util_1.validateStocktakingTagLock)(this.repository.manager.connection, warehouseRefs, dto.ReceiptDate || record.ReceiptDate);
        record.BaseType = Number(dto.BaseType || record.BaseType);
        record.WarehouseDocumentTypeRef = this.parseRef(dto.WarehouseDocumentTypeRef) ?? record.WarehouseDocumentTypeRef;
        record.WarehouseRef = this.parseRef(dto.WarehouseRef) ?? record.WarehouseRef;
        record.WarehouseName = dto.WarehouseName !== undefined ? dto.WarehouseName : record.WarehouseName;
        record.TemporaryReceiptRef = this.parseRef(dto.TemporaryReceiptRef) ?? record.TemporaryReceiptRef;
        record.SupplyRequestRef = this.parseRef(dto.SupplyRequestRef) ?? record.SupplyRequestRef;
        record.PurchaseInvoiceRef = this.parseRef(dto.PurchaseInvoiceRef) ?? record.PurchaseInvoiceRef;
        record.SupplierRef = this.parseRef(dto.SupplierRef) ?? record.SupplierRef;
        record.SupplierName = dto.SupplierName !== undefined ? dto.SupplierName : record.SupplierName;
        record.ReceiptNumber = dto.ReceiptNumber ? Number(dto.ReceiptNumber) : record.ReceiptNumber;
        record.ReceiptDate = dto.ReceiptDate ? (0, date_parser_1.ensureIsoTimestamp)(dto.ReceiptDate) : record.ReceiptDate;
        record.BaseDocumentNumber = dto.BaseDocumentNumber !== undefined ? dto.BaseDocumentNumber : record.BaseDocumentNumber;
        record.Status = dto.Status ? Number(dto.Status) : record.Status;
        record.CurrencyRef = dto.CurrencyRef ? Number(dto.CurrencyRef) : record.CurrencyRef;
        record.Description = dto.Description !== undefined ? dto.Description : record.Description;
        record.lastModifier = userId;
        record.lastModificationTime = nowTime;
        await this.repository.save(record);
        await this.detailRepository.delete({ WarehouseReceiptRef: id });
        await this.factorRepository.delete({ WarehouseReceiptRef: id });
        await this.pricingRepository.delete({ WarehouseVoucherRef: id, PricingType: pricing_type_enum_1.PricingType.Receipt });
        if (dto.details && dto.details.length > 0) {
            const validDetails = dto.details.filter((d) => !!this.parseRef(d.ItemRef));
            if (validDetails.length > 0) {
                const startDetailId = await this.idGenService.generateNextIdBlock('WarehouseReceiptDetail', validDetails.length);
                const detailsToSave = validDetails.map((d, idx) => {
                    const itemRef = this.parseRef(d.ItemRef);
                    return this.detailRepository.create({
                        WarehouseReceiptDetailID: startDetailId + idx,
                        WarehouseReceiptRef: id,
                        RowNo: d.RowNo || idx + 1,
                        ItemRef: itemRef,
                        WarehouseRef: this.parseRef(d.WarehouseRef) || this.parseRef(dto.WarehouseRef),
                        BaseNumber: d.BaseNumber || undefined,
                        UnitName: d.UnitName || undefined,
                        UnitType: Number(d.UnitType || 1),
                        Quantity: Number(d.Quantity || 1),
                        Description: d.Description || undefined,
                        TrackingFactorValues: d.trackingFactorValues || d.TrackingFactorValues || undefined,
                    });
                });
                await this.detailRepository.save(detailsToSave);
                const startPricingId = await this.idGenService.generateNextIdBlock('WarehouseVouchersPricing', detailsToSave.length);
                const pricingEntities = detailsToSave.map((savedDet, idx) => {
                    const origDet = validDetails[idx];
                    const qty = Number(savedDet.Quantity || 1);
                    const unitPrice = Number(origDet?.UnitPrice || 0);
                    const totalPrice = Number(origDet?.TotalPrice ?? (qty * unitPrice));
                    const deductions = Number(origDet?.Discount || origDet?.Deductions || 0);
                    const priceAfterDiscount = Number(origDet?.PriceAfterDiscount ?? Math.max(0, totalPrice - deductions));
                    const additions = Number(origDet?.Additions ?? origDet?.VatTax ?? 0);
                    const netPrice = origDet?.NetPrice !== undefined && origDet?.NetPrice !== null
                        ? Number(origDet.NetPrice)
                        : (priceAfterDiscount + additions);
                    return this.pricingRepository.create({
                        WarehouseVouchersPricingID: startPricingId + idx,
                        PricingType: pricing_type_enum_1.PricingType.Receipt,
                        WarehouseVoucherRef: id,
                        WarehouseVoucherDetailRef: savedDet.WarehouseReceiptDetailID,
                        ItemRef: savedDet.ItemRef,
                        UnitPrice: unitPrice,
                        Additions: additions,
                        Deductions: deductions,
                        NetPrice: netPrice,
                        Description: savedDet.Description,
                        businessStructureRef: bsId,
                        companyRef: compId,
                        FiscalYearRef: fiscalYearId,
                        creator: userId,
                        lastModifier: userId,
                        createTime: nowTime,
                        lastModificationTime: nowTime,
                    });
                });
                await this.pricingRepository.save(pricingEntities);
                const tfTasks = [];
                for (let i = 0; i < detailsToSave.length; i++) {
                    const savedDet = detailsToSave[i];
                    const origDet = validDetails[i];
                    const tfVal = origDet.trackingFactorValues || origDet.TrackingFactorValues;
                    if (tfVal) {
                        tfTasks.push({ detailId: savedDet.WarehouseReceiptDetailID, tfData: tfVal });
                    }
                }
                if (tfTasks.length > 0) {
                    await this.saveTrackingFactorsBatch(tfTasks);
                }
            }
        }
        if (dto.factors && dto.factors.length > 0) {
            const validFactors = dto.factors.filter((f) => f.FactorTitle && Number(f.Amount || 0) > 0);
            if (validFactors.length > 0) {
                const startFactorId = await this.idGenService.generateNextIdBlock('WarehouseReceiptFactor', validFactors.length);
                const factorsToSave = validFactors.map((f, idx) => this.factorRepository.create({
                    WarehouseReceiptFactorID: startFactorId + idx,
                    WarehouseReceiptRef: id,
                    RowNo: f.RowNo || idx + 1,
                    FactorTitle: f.FactorTitle,
                    FactorType: Number(f.FactorType || 1),
                    Amount: Number(f.Amount || 0),
                    Description: f.Description || undefined,
                }));
                await this.factorRepository.save(factorsToSave);
            }
        }
        return this.findOne(id);
    }
    async remove(id) {
        const record = await this.repository.findOne({ where: { WarehouseReceiptID: id } });
        if (!record) {
            throw new common_1.NotFoundException(`سند انبار با شناسه ${id} یافت نشد`);
        }
        await this.detailRepository.delete({ WarehouseReceiptRef: id });
        await this.factorRepository.delete({ WarehouseReceiptRef: id });
        await this.pricingRepository.delete({ WarehouseVoucherRef: id });
        await this.repository.remove(record);
    }
    async getRegisteredTrackingFactors(itemRef, warehouseRef, itemCode) {
        const { bsId, compId } = this.getScope();
        let targetItemRef = itemRef;
        if (!targetItemRef && itemCode) {
            try {
                const itemRows = await this.repository.manager.connection.query(`SELECT "ItemID" FROM "Inv"."Items" WHERE "ItemCode" = $1 LIMIT 1`, [itemCode]);
                if (itemRows && itemRows.length > 0) {
                    targetItemRef = Number(itemRows[0].ItemID);
                }
            }
            catch (err) { }
        }
        if (!targetItemRef) {
            return [];
        }
        const toJalaliString = (val) => {
            if (!val)
                return '';
            try {
                if (typeof val === 'string') {
                    const trimmed = val.trim();
                    if (/^1[34]\d{2}[\/\-]\d{1,2}[\/\-]\d{1,2}/.test(trimmed)) {
                        return trimmed.replace(/-/g, '/');
                    }
                    const m = (0, moment_jalaali_1.default)(trimmed);
                    if (m.isValid())
                        return m.format('jYYYY/jMM/jDD');
                }
                if (val instanceof Date) {
                    const m = (0, moment_jalaali_1.default)(val);
                    if (m.isValid())
                        return m.format('jYYYY/jMM/jDD');
                }
            }
            catch (e) { }
            return String(val || '').split('T')[0];
        };
        let sql = `
      SELECT 
        d."WarehouseReceiptDetailID" AS "detailId",
        v."WarehouseReceiptID" AS "voucherId",
        COALESCE(v."ReceiptNumber"::text, v."WarehouseReceiptID"::text) AS "voucherNumber",
        v."ReceiptDate" AS "voucherDate",
        COALESCE(t."WarehouseDocumentNature", 1) AS "nature",
        d."ItemRef" AS "itemRef",
        COALESCE(d."WarehouseRef", v."WarehouseRef") AS "warehouseRef",
        d."Quantity" AS "quantity",
        d."TrackingFactorValues" AS "trackingFactorValues"
      FROM "Inv"."WarehouseVouchersDetails" d
      JOIN "Inv"."WarehouseVouchers" v ON v."WarehouseReceiptID" = d."WarehouseReceiptRef"
      LEFT JOIN "Inv"."WarehouseDocumentTypes" t ON t."WarehouseDocumentTypeID" = v."WarehouseDocumentTypeRef"
      WHERE (d."ItemRef" = $1 OR d."ItemRef"::text = $1::text)
        AND (v."BusinessStructureRef" = $2 OR v."BusinessStructureRef" IS NULL)
        AND (v."CompanyRef" = $3 OR v."CompanyRef" IS NULL)
    `;
        const params = [targetItemRef, bsId, compId];
        if (warehouseRef) {
            sql += ` AND (d."WarehouseRef" = $4 OR v."WarehouseRef" = $4 OR d."WarehouseRef" IS NULL)`;
            params.push(warehouseRef);
        }
        sql += ` ORDER BY v."ReceiptDate" ASC, v."WarehouseReceiptID" ASC`;
        const rawRows = await this.repository.manager.connection.query(sql, params);
        const results = [];
        for (const row of rawRows) {
            const vId = Number(row.voucherId);
            const vNum = String(row.voucherNumber || '');
            const vDateRaw = row.voucherDate;
            const vDateJalali = toJalaliString(vDateRaw);
            const nature = Number(row.nature || 1);
            const tfVal = row.trackingFactorValues;
            if (!tfVal)
                continue;
            const rows = Array.isArray(tfVal) ? tfVal : [tfVal];
            for (const r of rows) {
                if (r && typeof r === 'object') {
                    results.push({
                        detailId: Number(row.detailId),
                        voucherId: vId,
                        voucherNumber: vNum,
                        voucherDate: vDateRaw,
                        voucherDateJalali: vDateJalali,
                        nature,
                        receiptNumber: vNum,
                        receiptDate: vDateJalali || String(vDateRaw || '').split('T')[0],
                        itemRef: Number(row.itemRef),
                        warehouseRef: row.warehouseRef ? Number(row.warehouseRef) : undefined,
                        quantity: Number(r.Quantity || row.quantity || 0),
                        trackingFactorValues: r,
                    });
                }
            }
        }
        try {
            const rtfQuery = await this.repository.manager.connection.query(`SELECT 
          rtf."WarehouseReceiptTrackingFactorID" AS "id",
          rtf."WarehouseReceiptDetailRef" AS "detailId",
          rtf."Quantity" AS "quantity",
          rtf."FactorValue" AS "factorValue",
          rtf."TrackingFactorRef" AS "trackingFactorRef",
          rtf."TrackingFactorValues" AS "trackingFactorValues",
          v."WarehouseReceiptID" AS "voucherId",
          COALESCE(v."ReceiptNumber"::text, v."WarehouseReceiptID"::text) AS "voucherNumber",
          v."ReceiptDate" AS "voucherDate",
          1 AS "nature",
          d."ItemRef" AS "itemRef",
          COALESCE(d."WarehouseRef", v."WarehouseRef") AS "warehouseRef"
        FROM "Inv"."WarehouseReceiptTrackingFactors" rtf
        JOIN "Inv"."WarehouseVouchersDetails" d ON d."WarehouseReceiptDetailID" = rtf."WarehouseReceiptDetailRef"
        JOIN "Inv"."WarehouseVouchers" v ON v."WarehouseReceiptID" = d."WarehouseReceiptRef"
        WHERE (d."ItemRef" = $1 OR d."ItemRef"::text = $1::text)
          AND (v."BusinessStructureRef" = $2 OR v."BusinessStructureRef" IS NULL)
          AND (v."CompanyRef" = $3 OR v."CompanyRef" IS NULL)`, [targetItemRef, bsId, compId]);
            for (const r of rtfQuery) {
                let tfObj = r.trackingFactorValues ? { ...r.trackingFactorValues } : {};
                if (r.trackingFactorRef && r.factorValue) {
                    tfObj[String(r.trackingFactorRef)] = r.factorValue;
                }
                const vDateJalali = toJalaliString(r.voucherDate);
                results.push({
                    detailId: Number(r.detailId),
                    voucherId: Number(r.voucherId),
                    voucherNumber: String(r.voucherNumber || ''),
                    voucherDate: r.voucherDate,
                    voucherDateJalali: vDateJalali,
                    nature: 1,
                    receiptNumber: String(r.voucherNumber || ''),
                    receiptDate: vDateJalali,
                    itemRef: Number(r.itemRef),
                    warehouseRef: r.warehouseRef ? Number(r.warehouseRef) : undefined,
                    quantity: Number(r.quantity || 0),
                    trackingFactorValues: tfObj,
                });
            }
            const itfQuery = await this.repository.manager.connection.query(`SELECT 
          itf."WarehouseIssueTrackingFactorID" AS "id",
          itf."WarehouseIssueDetailRef" AS "detailId",
          itf."Quantity" AS "quantity",
          itf."FactorValue" AS "factorValue",
          itf."TrackingFactorRef" AS "trackingFactorRef",
          itf."TrackingFactorValues" AS "trackingFactorValues",
          v."WarehouseReceiptID" AS "voucherId",
          COALESCE(v."ReceiptNumber"::text, v."WarehouseReceiptID"::text) AS "voucherNumber",
          v."ReceiptDate" AS "voucherDate",
          2 AS "nature",
          d."ItemRef" AS "itemRef",
          COALESCE(d."WarehouseRef", v."WarehouseRef") AS "warehouseRef"
        FROM "Inv"."WarehouseIssueTrackingFactors" itf
        JOIN "Inv"."WarehouseVouchersDetails" d ON d."WarehouseReceiptDetailID" = itf."WarehouseIssueDetailRef"
        JOIN "Inv"."WarehouseVouchers" v ON v."WarehouseReceiptID" = d."WarehouseReceiptRef"
        WHERE (d."ItemRef" = $1 OR d."ItemRef"::text = $1::text)
          AND (v."BusinessStructureRef" = $2 OR v."BusinessStructureRef" IS NULL)
          AND (v."CompanyRef" = $3 OR v."CompanyRef" IS NULL)`, [targetItemRef, bsId, compId]);
            for (const r of itfQuery) {
                let tfObj = r.trackingFactorValues ? { ...r.trackingFactorValues } : {};
                if (r.trackingFactorRef && r.factorValue) {
                    tfObj[String(r.trackingFactorRef)] = r.factorValue;
                }
                const vDateJalali = toJalaliString(r.voucherDate);
                results.push({
                    detailId: Number(r.detailId),
                    voucherId: Number(r.voucherId),
                    voucherNumber: String(r.voucherNumber || ''),
                    voucherDate: r.voucherDate,
                    voucherDateJalali: vDateJalali,
                    nature: 2,
                    receiptNumber: String(r.voucherNumber || ''),
                    receiptDate: vDateJalali,
                    itemRef: Number(r.itemRef),
                    warehouseRef: r.warehouseRef ? Number(r.warehouseRef) : undefined,
                    quantity: Number(r.quantity || 0),
                    trackingFactorValues: tfObj,
                });
            }
        }
        catch (err) { }
        return results;
    }
    async priceReceiptItems(dto) {
        const { bsId, compId, fiscalYearId } = this.getScope();
        const { pricingMethod, ReceiptDate, WarehouseReceiptID, items = [] } = dto;
        const toJalaliString = (val) => {
            if (!val)
                return '';
            try {
                let str = String(val).trim().replace(/-/g, '/');
                str = str.replace(/[۰-۹]/g, (d) => String(d.charCodeAt(0) - 0x06f0));
                str = str.replace(/[٠-٩]/g, (d) => String(d.charCodeAt(0) - 0x0660));
                const jm = str.match(/^(\d{4})\/(\d{1,2})\/(\d{1,2})/);
                if (jm) {
                    const y = parseInt(jm[1], 10);
                    if (y >= 1300 && y <= 1499) {
                        return `${y}/${jm[2].padStart(2, '0')}/${jm[3].padStart(2, '0')}`;
                    }
                }
                const m = (0, moment_jalaali_1.default)(val);
                if (m.isValid()) {
                    return m.clone().locale('en').format('jYYYY/jMM/jDD');
                }
            }
            catch (e) { }
            return String(val || '').split('T')[0];
        };
        const receiptDateJalali = toJalaliString(ReceiptDate || new Date());
        let methodTitle = 'نرخ استاندارد';
        if (pricingMethod === 'lastPurchase') {
            methodTitle = 'آخرین نرخ خرید';
        }
        else if (pricingMethod === 'lastConsumption') {
            methodTitle = 'آخرین نرخ مصرف';
        }
        const processedResults = [];
        for (let idx = 0; idx < items.length; idx++) {
            const itm = items[idx];
            const rowNo = itm.RowNo || idx + 1;
            const rawItemRef = this.parseRef(itm.ItemRef);
            let targetItemRef = rawItemRef;
            let itemCodeStr = String(itm.ItemCode || '');
            let itemNameStr = String(itm.ItemName || '');
            if (targetItemRef && (!itemCodeStr || !itemNameStr)) {
                try {
                    const dbItem = await this.repository.manager.connection.query(`SELECT "ItemID", "ItemCode", "ItemName" FROM "Inv"."Items" WHERE "ItemID" = $1 LIMIT 1`, [targetItemRef]);
                    if (dbItem && dbItem.length > 0) {
                        itemCodeStr = String(dbItem[0].ItemCode || itemCodeStr);
                        itemNameStr = String(dbItem[0].ItemName || itemNameStr);
                    }
                }
                catch (e) { }
            }
            else if (!targetItemRef && itemCodeStr) {
                try {
                    const dbItem = await this.repository.manager.connection.query(`SELECT "ItemID", "ItemCode", "ItemName" FROM "Inv"."Items" WHERE "ItemCode"::text = $1::text LIMIT 1`, [itemCodeStr]);
                    if (dbItem && dbItem.length > 0) {
                        targetItemRef = Number(dbItem[0].ItemID);
                        itemNameStr = String(dbItem[0].ItemName || itemNameStr);
                    }
                }
                catch (e) { }
            }
            const oldUnitPrice = Number(itm.UnitPrice || 0);
            if (!targetItemRef) {
                processedResults.push({
                    rowNo,
                    itemRef: 0,
                    itemCode: itemCodeStr || '-',
                    itemName: itemNameStr || 'کالای نامشخص',
                    oldUnitPrice,
                    newUnitPrice: oldUnitPrice,
                    isPriced: false,
                    statusMessage: 'کالا مشخص نشده است',
                });
                continue;
            }
            if (pricingMethod === 'standardRate') {
                try {
                    let isShared = false;
                    try {
                        const bsRows = await this.repository.manager.connection.query(`SELECT "IsBasicInfoShared" FROM "Gnr"."BusinessStructure" WHERE "BusinessStructureID" = $1 OR "BusinessStructureID" = 1 ORDER BY "BusinessStructureID" DESC`, [bsId]);
                        if (bsRows && bsRows.length > 0) {
                            const val = bsRows[0].IsBasicInfoShared;
                            isShared = val === true || val === 'true' || val === 1;
                        }
                    }
                    catch (e) {
                        isShared = true;
                    }
                    const scopeCondition = isShared
                        ? `(s."BusinessStructureRef" = $2 OR s."BusinessStructureRef" IS NULL)`
                        : `(s."CompanyRef" = $3 OR (s."CompanyRef" IS NULL AND s."BusinessStructureRef" = $2))`;
                    const queryParams = isShared ? [targetItemRef, bsId] : [targetItemRef, bsId, compId];
                    const standardRatesQuery = await this.repository.manager.connection.query(`SELECT 
              s."StandardItemRateID",
              s."EffectiveDate",
              s."FiscalYearRef",
              d."UnitRate"
             FROM "Inv"."StandardItemRateDetails" d
             JOIN "Inv"."StandardItemRates" s ON s."StandardItemRateID" = d."StandardItemRateRef"
             WHERE (d."ItemRef" = $1 OR d."ItemRef"::text = $1::text)
               AND ${scopeCondition}
             ORDER BY s."EffectiveDate" DESC, s."StandardItemRateID" DESC`, queryParams);
                    if (!standardRatesQuery || standardRatesQuery.length === 0) {
                        processedResults.push({
                            rowNo,
                            itemRef: targetItemRef,
                            itemCode: itemCodeStr,
                            itemName: itemNameStr,
                            oldUnitPrice,
                            newUnitPrice: oldUnitPrice,
                            isPriced: false,
                            statusMessage: `نرخ استاندارد برای کالای با کد [${itemCodeStr}] عنوان : [${itemNameStr}] ثبت نشده است`,
                        });
                        continue;
                    }
                    const normReceiptDate = receiptDateJalali.replace(/-/g, '/');
                    const validRates = standardRatesQuery.filter((r) => {
                        const rEff = toJalaliString(r.EffectiveDate).replace(/-/g, '/');
                        return rEff && rEff <= normReceiptDate;
                    });
                    if (validRates.length === 0) {
                        const latestRateRow = standardRatesQuery[0];
                        const effectiveDateJalali = toJalaliString(latestRateRow.EffectiveDate);
                        processedResults.push({
                            rowNo,
                            itemRef: targetItemRef,
                            itemCode: itemCodeStr,
                            itemName: itemNameStr,
                            oldUnitPrice,
                            newUnitPrice: oldUnitPrice,
                            isPriced: false,
                            effectiveDate: effectiveDateJalali,
                            receiptDate: receiptDateJalali,
                            statusMessage: `تاریخ رسید انبار (${receiptDateJalali}) کوچکتر از تاریخ موثر آخرین نرخ استاندارد (${effectiveDateJalali}) است`,
                        });
                        continue;
                    }
                    const chosenRateRow = validRates[0];
                    const rawEffectiveDate = chosenRateRow.EffectiveDate;
                    const effectiveDateJalali = toJalaliString(rawEffectiveDate);
                    const unitRate = Number(chosenRateRow.UnitRate || 0);
                    if (unitRate <= 0) {
                        processedResults.push({
                            rowNo,
                            itemRef: targetItemRef,
                            itemCode: itemCodeStr,
                            itemName: itemNameStr,
                            oldUnitPrice,
                            newUnitPrice: oldUnitPrice,
                            isPriced: false,
                            effectiveDate: effectiveDateJalali,
                            receiptDate: receiptDateJalali,
                            statusMessage: `نرخ استاندارد تعریف شده برای کالا صفر یا نامعتبر است`,
                        });
                        continue;
                    }
                    processedResults.push({
                        rowNo,
                        itemRef: targetItemRef,
                        itemCode: itemCodeStr,
                        itemName: itemNameStr,
                        oldUnitPrice,
                        newUnitPrice: unitRate,
                        isPriced: true,
                        effectiveDate: effectiveDateJalali,
                        receiptDate: receiptDateJalali,
                        statusMessage: 'قیمت‌گذاری با نرخ استاندارد با موفقیت انجام شد',
                    });
                }
                catch (err) {
                    processedResults.push({
                        rowNo,
                        itemRef: targetItemRef,
                        itemCode: itemCodeStr,
                        itemName: itemNameStr,
                        oldUnitPrice,
                        newUnitPrice: oldUnitPrice,
                        isPriced: false,
                        statusMessage: `خطا در واکشی نرخ استاندارد: ${err?.message || ''}`,
                    });
                }
            }
            else if (pricingMethod === 'lastPurchase') {
                try {
                    const excludeClause = WarehouseReceiptID ? `AND v."WarehouseReceiptID" != ${Number(WarehouseReceiptID)}` : '';
                    const lastReceiptQuery = await this.repository.manager.connection.query(`SELECT 
              d."UnitPrice" AS "detailUnitPrice",
              p."UnitPrice" AS "pricingUnitPrice",
              v."WarehouseReceiptID",
              v."ReceiptNumber",
              v."ReceiptDate"
             FROM "Inv"."WarehouseVouchersDetails" d
             JOIN "Inv"."WarehouseVouchers" v ON v."WarehouseReceiptID" = d."WarehouseReceiptRef"
             LEFT JOIN "Inv"."WarehouseDocumentTypes" t ON t."WarehouseDocumentTypeID" = v."WarehouseDocumentTypeRef"
             LEFT JOIN "Inv"."WarehouseVouchersPricing" p ON p."WarehouseVoucherDetailRef" = d."WarehouseReceiptDetailID" AND p."PricingType" = 1
             WHERE (d."ItemRef" = $1 OR d."ItemRef"::text = $1::text)
               AND (COALESCE(p."UnitPrice", d."UnitPrice") > 0)
               AND (COALESCE(t."WarehouseDocumentNature", 1) = 1)
               AND (v."BusinessStructureRef" = $2 OR v."BusinessStructureRef" IS NULL)
               ${excludeClause}
             ORDER BY v."ReceiptDate" DESC, v."ReceiptNumber" DESC, v."WarehouseReceiptID" DESC
             LIMIT 1`, [targetItemRef, bsId]);
                    let foundPrice = null;
                    let sourceDocNo = '';
                    if (lastReceiptQuery && lastReceiptQuery.length > 0) {
                        const row = lastReceiptQuery[0];
                        foundPrice = Number(row.pricingUnitPrice || row.detailUnitPrice || 0);
                        sourceDocNo = String(row.ReceiptNumber || row.WarehouseReceiptID || '');
                    }
                    else {
                        const lastInvoiceQuery = await this.repository.manager.connection.query(`SELECT 
                d."UnitPrice",
                pi."InvoiceNumber",
                pi."InvoiceDate"
               FROM "Inv"."PurchaseInvoiceDetails" d
               JOIN "Inv"."PurchaseInvoices" pi ON pi."PurchaseInvoiceID" = d."PurchaseInvoiceRef"
               WHERE (d."ItemRef" = $1 OR d."ItemRef"::text = $1::text)
                 AND (d."UnitPrice" > 0)
                 AND (pi."BusinessStructureRef" = $2 OR pi."BusinessStructureRef" IS NULL)
               ORDER BY pi."InvoiceDate" DESC, pi."PurchaseInvoiceID" DESC
               LIMIT 1`, [targetItemRef, bsId]);
                        if (lastInvoiceQuery && lastInvoiceQuery.length > 0) {
                            const row = lastInvoiceQuery[0];
                            foundPrice = Number(row.UnitPrice || 0);
                            sourceDocNo = String(row.InvoiceNumber || '');
                        }
                    }
                    if (foundPrice && foundPrice > 0) {
                        processedResults.push({
                            rowNo,
                            itemRef: targetItemRef,
                            itemCode: itemCodeStr,
                            itemName: itemNameStr,
                            oldUnitPrice,
                            newUnitPrice: foundPrice,
                            isPriced: true,
                            sourceDocumentNumber: sourceDocNo,
                            statusMessage: `فی بر مبنای آخرین خرید (سند شماره ${sourceDocNo}) درج گردید`,
                        });
                    }
                    else {
                        processedResults.push({
                            rowNo,
                            itemRef: targetItemRef,
                            itemCode: itemCodeStr,
                            itemName: itemNameStr,
                            oldUnitPrice,
                            newUnitPrice: oldUnitPrice,
                            isPriced: false,
                            statusMessage: `سابقه رسید خرید یا فاکتور خرید دارای فی برای کالای با کد [${itemCodeStr}] یافت نشد`,
                        });
                    }
                }
                catch (err) {
                    processedResults.push({
                        rowNo,
                        itemRef: targetItemRef,
                        itemCode: itemCodeStr,
                        itemName: itemNameStr,
                        oldUnitPrice,
                        newUnitPrice: oldUnitPrice,
                        isPriced: false,
                        statusMessage: `خطا در واکشی آخرین نرخ خرید: ${err?.message || ''}`,
                    });
                }
            }
            else if (pricingMethod === 'lastConsumption') {
                try {
                    const lastIssueQuery = await this.repository.manager.connection.query(`SELECT 
              d."UnitPrice" AS "detailUnitPrice",
              p."UnitPrice" AS "pricingUnitPrice",
              v."WarehouseReceiptID",
              v."ReceiptNumber",
              v."ReceiptDate"
             FROM "Inv"."WarehouseVouchersDetails" d
             JOIN "Inv"."WarehouseVouchers" v ON v."WarehouseReceiptID" = d."WarehouseReceiptRef"
             JOIN "Inv"."WarehouseDocumentTypes" t ON t."WarehouseDocumentTypeID" = v."WarehouseDocumentTypeRef"
             LEFT JOIN "Inv"."WarehouseVouchersPricing" p ON p."WarehouseVoucherDetailRef" = d."WarehouseReceiptDetailID"
             WHERE (d."ItemRef" = $1 OR d."ItemRef"::text = $1::text)
               AND (COALESCE(p."UnitPrice", d."UnitPrice") > 0)
               AND (t."WarehouseDocumentNature" = 2)
               AND (v."BusinessStructureRef" = $2 OR v."BusinessStructureRef" IS NULL)
             ORDER BY v."ReceiptDate" DESC, v."ReceiptNumber" DESC, v."WarehouseReceiptID" DESC
             LIMIT 1`, [targetItemRef, bsId]);
                    if (lastIssueQuery && lastIssueQuery.length > 0) {
                        const row = lastIssueQuery[0];
                        const foundPrice = Number(row.pricingUnitPrice || row.detailUnitPrice || 0);
                        const sourceDocNo = String(row.ReceiptNumber || row.WarehouseReceiptID || '');
                        processedResults.push({
                            rowNo,
                            itemRef: targetItemRef,
                            itemCode: itemCodeStr,
                            itemName: itemNameStr,
                            oldUnitPrice,
                            newUnitPrice: foundPrice,
                            isPriced: true,
                            sourceDocumentNumber: sourceDocNo,
                            statusMessage: `فی بر مبنای آخرین خروج انبار (حواله شماره ${sourceDocNo}) درج گردید`,
                        });
                    }
                    else {
                        processedResults.push({
                            rowNo,
                            itemRef: targetItemRef,
                            itemCode: itemCodeStr,
                            itemName: itemNameStr,
                            oldUnitPrice,
                            newUnitPrice: oldUnitPrice,
                            isPriced: false,
                            statusMessage: `سابقه خروج انبار دارای فی برای کالای با کد [${itemCodeStr}] یافت نشد`,
                        });
                    }
                }
                catch (err) {
                    processedResults.push({
                        rowNo,
                        itemRef: targetItemRef,
                        itemCode: itemCodeStr,
                        itemName: itemNameStr,
                        oldUnitPrice,
                        newUnitPrice: oldUnitPrice,
                        isPriced: false,
                        statusMessage: `خطا در واکشی آخرین نرخ مصرف: ${err?.message || ''}`,
                    });
                }
            }
        }
        const pricedItemsCount = processedResults.filter((r) => r.isPriced).length;
        const unpricedItemsCount = processedResults.filter((r) => !r.isPriced).length;
        return {
            success: pricedItemsCount > 0,
            method: pricingMethod,
            methodTitle,
            totalItems: processedResults.length,
            pricedItemsCount,
            unpricedItemsCount,
            items: processedResults,
        };
    }
};
exports.WarehouseReceiptService = WarehouseReceiptService;
exports.WarehouseReceiptService = WarehouseReceiptService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(warehouse_receipt_entity_1.WarehouseReceipt)),
    __param(1, (0, typeorm_1.InjectRepository)(warehouse_receipt_detail_entity_1.WarehouseReceiptDetail)),
    __param(2, (0, typeorm_1.InjectRepository)(warehouse_receipt_factor_entity_1.WarehouseReceiptFactor)),
    __param(3, (0, typeorm_1.InjectRepository)(warehouse_issue_tracking_factor_entity_1.WarehouseIssueTrackingFactor)),
    __param(4, (0, typeorm_1.InjectRepository)(warehouse_receipt_tracking_factor_entity_1.WarehouseReceiptTrackingFactor)),
    __param(5, (0, typeorm_1.InjectRepository)(warehouse_vouchers_pricing_entity_1.WarehouseVouchersPricing)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        id_generation_service_1.IdGenerationService,
        request_context_service_1.RequestContextService])
], WarehouseReceiptService);
//# sourceMappingURL=warehouse-receipt.service.js.map