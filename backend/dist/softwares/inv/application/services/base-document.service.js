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
exports.BaseDocumentService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const purchase_invoice_entity_1 = require("../../domain/entities/purchase-invoice.entity");
const purchase_invoice_detail_entity_1 = require("../../domain/entities/purchase-invoice-detail.entity");
const purchase_invoice_factor_entity_1 = require("../../domain/entities/purchase-invoice-factor.entity");
const temporary_item_receipt_entity_1 = require("../../domain/entities/temporary-item-receipt.entity");
const temporary_item_receipt_detail_entity_1 = require("../../domain/entities/temporary-item-receipt-detail.entity");
const temporary_item_receipt_factor_entity_1 = require("../../domain/entities/temporary-item-receipt-factor.entity");
const item_supply_request_entity_1 = require("../../domain/entities/item-supply-request.entity");
const item_supply_request_detail_entity_1 = require("../../domain/entities/item-supply-request-detail.entity");
const item_request_entity_1 = require("../../domain/entities/item-request.entity");
const item_request_detail_entity_1 = require("../../domain/entities/item-request-detail.entity");
const warehouse_receipt_entity_1 = require("../../domain/entities/warehouse-receipt.entity");
const warehouse_receipt_detail_entity_1 = require("../../domain/entities/warehouse-receipt-detail.entity");
const warehouse_receipt_factor_entity_1 = require("../../domain/entities/warehouse-receipt-factor.entity");
const request_context_service_1 = require("../../../../core/services/request-context.service");
function isStatusApprovedOrReviewed(status) {
    if (status === null || status === undefined || status === '')
        return false;
    if (typeof status === 'number') {
        return status === 4 || status === 5;
    }
    const str = String(status).trim();
    return (str === '4' ||
        str === '5' ||
        str === 'بررسی شده' ||
        str === 'تایید شده' ||
        str.includes('بررسی شده') ||
        str.includes('تایید شده'));
}
let BaseDocumentService = class BaseDocumentService {
    constructor(piRepository, piDetailRepository, piFactorRepository, trRepository, trDetailRepository, trFactorRepository, srRepository, srDetailRepository, irRepository, irDetailRepository, wrRepository, wrDetailRepository, wrFactorRepository, dataSource, requestContextService) {
        this.piRepository = piRepository;
        this.piDetailRepository = piDetailRepository;
        this.piFactorRepository = piFactorRepository;
        this.trRepository = trRepository;
        this.trDetailRepository = trDetailRepository;
        this.trFactorRepository = trFactorRepository;
        this.srRepository = srRepository;
        this.srDetailRepository = srDetailRepository;
        this.irRepository = irRepository;
        this.irDetailRepository = irDetailRepository;
        this.wrRepository = wrRepository;
        this.wrDetailRepository = wrDetailRepository;
        this.wrFactorRepository = wrFactorRepository;
        this.dataSource = dataSource;
        this.requestContextService = requestContextService;
    }
    async getSleSalesInvoiceUsedQuantities(invoiceId, currentDocId) {
        const usedMap = {};
        try {
            const params = [invoiceId];
            let excludeSql = '';
            if (currentDocId && Number(currentDocId) > 0) {
                params.push(Number(currentDocId));
                excludeSql = ` AND h."WarehouseReceiptID" != $${params.length}`;
            }
            const rows = await this.dataSource.query(`SELECT d."ItemRef" AS "itemRef", COALESCE(SUM(d."Quantity"), 0) AS "totalQty"
         FROM "Inv"."WarehouseVouchersDetails" d
         INNER JOIN "Inv"."WarehouseVouchers" h ON d."WarehouseReceiptRef" = h."WarehouseReceiptID"
         WHERE h."SalesInvoiceRef" = $1${excludeSql}
         GROUP BY d."ItemRef"`, params);
            for (const r of rows || []) {
                const itemRef = Number(r.itemRef);
                if (!itemRef)
                    continue;
                usedMap[itemRef] = (usedMap[itemRef] || 0) + Number(r.totalQty || 0);
            }
        }
        catch {
        }
        return usedMap;
    }
    async getSleSalesInvoiceDetailsById(id) {
        const numId = Number(id);
        if (!numId || !Number.isFinite(numId))
            return null;
        const headers = await this.dataSource.query(`SELECT * FROM "Sle"."SalesInvoices" WHERE "SalesInvoiceID" = $1 LIMIT 1`, [numId]);
        const doc = headers && headers[0];
        if (!doc)
            return null;
        const details = await this.dataSource.query(`SELECT * FROM "Sle"."SalesInvoiceItems" WHERE "SalesInvoiceRef" = $1 ORDER BY "RowNo" ASC`, [numId]);
        return { doc, details: details || [] };
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
    async getUsedQuantities(baseDocType, docId, targetDocType, currentDocId) {
        const usedMap = {};
        if (baseDocType === 'PurchaseInvoice') {
            const trQb = this.trDetailRepository
                .createQueryBuilder('d')
                .innerJoin('d.temporaryItemReceipt', 'h')
                .select('d.ItemRef', 'itemRef')
                .addSelect('SUM(d.Quantity)', 'totalQty')
                .where('h.BaseDocumentNumber = :docIdStr', { docIdStr: String(docId) });
            if (currentDocId && targetDocType === 'TemporaryItemReceipt') {
                trQb.andWhere('h.TemporaryItemReceiptID != :currentDocId', { currentDocId });
            }
            const trRes = await trQb.groupBy('d.ItemRef').getRawMany();
            for (const r of trRes) {
                const itemRef = Number(r.itemRef);
                const qty = Number(r.totalQty || 0);
                usedMap[itemRef] = (usedMap[itemRef] || 0) + qty;
            }
            const wrQb = this.wrDetailRepository
                .createQueryBuilder('d')
                .innerJoin('d.warehouseReceipt', 'h')
                .select('d.ItemRef', 'itemRef')
                .addSelect('SUM(d.Quantity)', 'totalQty')
                .where('(h.PurchaseInvoiceRef = :docId OR h.BaseDocumentNumber = :docIdStr)', { docId, docIdStr: String(docId) });
            if (currentDocId && targetDocType === 'WarehouseReceipt') {
                wrQb.andWhere('h.WarehouseReceiptID != :currentDocId', { currentDocId });
            }
            const wrRes = await wrQb.groupBy('d.ItemRef').getRawMany();
            for (const r of wrRes) {
                const itemRef = Number(r.itemRef);
                const qty = Number(r.totalQty || 0);
                usedMap[itemRef] = (usedMap[itemRef] || 0) + qty;
            }
        }
        else if (baseDocType === 'TemporaryItemReceipt') {
            const wrQb = this.wrDetailRepository
                .createQueryBuilder('d')
                .innerJoin('d.warehouseReceipt', 'h')
                .select('d.ItemRef', 'itemRef')
                .addSelect('SUM(d.Quantity)', 'totalQty')
                .where('(h.TemporaryReceiptRef = :docId OR h.BaseDocumentNumber = :docIdStr)', { docId, docIdStr: String(docId) });
            if (currentDocId && targetDocType === 'WarehouseReceipt') {
                wrQb.andWhere('h.WarehouseReceiptID != :currentDocId', { currentDocId });
            }
            const wrRes = await wrQb.groupBy('d.ItemRef').getRawMany();
            for (const r of wrRes) {
                const itemRef = Number(r.itemRef);
                const qty = Number(r.totalQty || 0);
                usedMap[itemRef] = (usedMap[itemRef] || 0) + qty;
            }
        }
        else if (baseDocType === 'ItemSupplyRequest') {
            const piQb = this.piDetailRepository
                .createQueryBuilder('d')
                .innerJoin('d.purchaseInvoice', 'h')
                .select('d.ItemRef', 'itemRef')
                .addSelect('SUM(d.Quantity)', 'totalQty')
                .where('(h.SupplyRequestRef = :docId OR h.BaseDocumentNumber = :docIdStr)', { docId, docIdStr: String(docId) });
            if (currentDocId && targetDocType === 'PurchaseInvoice') {
                piQb.andWhere('h.PurchaseInvoiceID != :currentDocId', { currentDocId });
            }
            const piRes = await piQb.groupBy('d.ItemRef').getRawMany();
            for (const r of piRes) {
                const itemRef = Number(r.itemRef);
                const qty = Number(r.totalQty || 0);
                usedMap[itemRef] = (usedMap[itemRef] || 0) + qty;
            }
            const trQb = this.trDetailRepository
                .createQueryBuilder('d')
                .innerJoin('d.temporaryItemReceipt', 'h')
                .select('d.ItemRef', 'itemRef')
                .addSelect('SUM(d.Quantity)', 'totalQty')
                .where('h.BaseDocumentNumber = :docIdStr', { docIdStr: String(docId) });
            if (currentDocId && targetDocType === 'TemporaryItemReceipt') {
                trQb.andWhere('h.TemporaryItemReceiptID != :currentDocId', { currentDocId });
            }
            const trRes = await trQb.groupBy('d.ItemRef').getRawMany();
            for (const r of trRes) {
                const itemRef = Number(r.itemRef);
                const qty = Number(r.totalQty || 0);
                usedMap[itemRef] = (usedMap[itemRef] || 0) + qty;
            }
            const wrQb = this.wrDetailRepository
                .createQueryBuilder('d')
                .innerJoin('d.warehouseReceipt', 'h')
                .select('d.ItemRef', 'itemRef')
                .addSelect('SUM(d.Quantity)', 'totalQty')
                .where('(h.SupplyRequestRef = :docId OR h.BaseDocumentNumber = :docIdStr)', { docId, docIdStr: String(docId) });
            if (currentDocId && targetDocType === 'WarehouseReceipt') {
                wrQb.andWhere('h.WarehouseReceiptID != :currentDocId', { currentDocId });
            }
            const wrRes = await wrQb.groupBy('d.ItemRef').getRawMany();
            for (const r of wrRes) {
                const itemRef = Number(r.itemRef);
                const qty = Number(r.totalQty || 0);
                usedMap[itemRef] = (usedMap[itemRef] || 0) + qty;
            }
        }
        else if (baseDocType === 'ItemRequest') {
            const srQb = this.srDetailRepository
                .createQueryBuilder('d')
                .innerJoin('d.itemSupplyRequest', 'h')
                .select('d.ItemRef', 'itemRef')
                .addSelect('SUM(COALESCE(d.ApprovedQuantity, d.RequestQuantity, 0))', 'totalQty')
                .where('h.BaseDocumentNumber = :docIdStr', { docIdStr: String(docId) });
            if (currentDocId && targetDocType === 'ItemSupplyRequest') {
                srQb.andWhere('h.ItemSupplyRequestID != :currentDocId', { currentDocId });
            }
            const srRes = await srQb.groupBy('d.ItemRef').getRawMany();
            for (const r of srRes) {
                const itemRef = Number(r.itemRef);
                const qty = Number(r.totalQty || 0);
                usedMap[itemRef] = (usedMap[itemRef] || 0) + qty;
            }
            const wrQb = this.wrDetailRepository
                .createQueryBuilder('d')
                .innerJoin('d.warehouseReceipt', 'h')
                .select('d.ItemRef', 'itemRef')
                .addSelect('SUM(d.Quantity)', 'totalQty')
                .where('h.BaseDocumentNumber = :docIdStr', { docIdStr: String(docId) });
            if (currentDocId && targetDocType === 'WarehouseReceipt') {
                wrQb.andWhere('h.WarehouseReceiptID != :currentDocId', { currentDocId });
            }
            const wrRes = await wrQb.groupBy('d.ItemRef').getRawMany();
            for (const r of wrRes) {
                const itemRef = Number(r.itemRef);
                const qty = Number(r.totalQty || 0);
                usedMap[itemRef] = (usedMap[itemRef] || 0) + qty;
            }
        }
        return usedMap;
    }
    async getAvailableBaseDocuments(docType, targetDocType) {
        const { bsId, compId, fiscalYearId } = this.getScope();
        if (docType === 'PurchaseInvoice') {
            const qb = this.piRepository
                .createQueryBuilder('pi')
                .leftJoinAndSelect('pi.details', 'details')
                .leftJoinAndSelect('details.item', 'item')
                .leftJoinAndSelect('item.MeasurementUnit', 'mUnit')
                .leftJoinAndSelect('pi.factors', 'factors');
            if (bsId && bsId > 1) {
                qb.andWhere('(pi.businessStructureRef = :bsId OR pi.businessStructureRef IS NULL)', { bsId });
            }
            if (compId && compId > 1) {
                qb.andWhere('(pi.companyRef = :compId OR pi.companyRef IS NULL)', { compId });
            }
            if (fiscalYearId) {
                qb.andWhere('(pi.FiscalYearRef = :fiscalYearId OR pi.FiscalYearRef IS NULL OR pi.FiscalYearRef = 1 OR pi.FiscalYearRef = 3)', { fiscalYearId });
            }
            qb.orderBy('pi.InvoiceNumber', 'DESC');
            const docs = await qb.getMany();
            const availableDocs = [];
            for (const doc of docs) {
                if (!isStatusApprovedOrReviewed(doc.Status)) {
                    continue;
                }
                const docIdStr = String(doc.PurchaseInvoiceID);
                const docNumStr = doc.InvoiceNumber ? String(doc.InvoiceNumber) : '';
                const trUsageCount = await this.trRepository
                    .createQueryBuilder('tr')
                    .leftJoin('tr.details', 'trDetail')
                    .where('(tr.BaseDocumentNumber = :docIdStr OR (tr.BaseDocumentNumber = :docNumStr AND :docNumStr != \'\') OR trDetail.BaseNumber = :docIdStr OR (trDetail.BaseNumber = :docNumStr AND :docNumStr != \'\'))', { docIdStr, docNumStr })
                    .getCount();
                if (trUsageCount > 0) {
                    continue;
                }
                const usedMap = await this.getUsedQuantities('PurchaseInvoice', doc.PurchaseInvoiceID, targetDocType);
                let totalRemaining = 0;
                const mappedItems = [];
                for (const det of doc.details || []) {
                    const origQty = Number(det.Quantity || 0);
                    const itemRef = Number(det.ItemRef || 0);
                    const usedQty = usedMap[itemRef] || 0;
                    const remainingQty = Math.max(0, origQty - usedQty);
                    totalRemaining += remainingQty;
                    if (remainingQty > 0) {
                        mappedItems.push({
                            ItemRef: itemRef,
                            ItemCode: det.item?.ItemCode ? String(det.item.ItemCode) : '',
                            ItemName: det.item?.ItemName || '',
                            UnitName: det.item?.MeasurementUnit?.MeasurementUnitName || 'عدد',
                            UnitType: det.UnitType || 1,
                            originalQuantity: origQty,
                            usedQuantity: usedQty,
                            remainingQuantity: remainingQty,
                            maxQuantity: remainingQty,
                            Quantity: remainingQty,
                            UnitPrice: Number(det.UnitPrice || 0),
                            Discount: Number(det.Discount || 0),
                            Description: det.Description || '',
                            TrackingFactorValues: det.TrackingFactorValues || null,
                            trackingFactorValues: det.TrackingFactorValues || null,
                        });
                    }
                }
                if (mappedItems.length > 0) {
                    availableDocs.push({
                        id: doc.PurchaseInvoiceID,
                        PurchaseInvoiceID: doc.PurchaseInvoiceID,
                        code: String(doc.InvoiceNumber),
                        InvoiceNumber: String(doc.InvoiceNumber),
                        InvoiceDate: doc.InvoiceDate,
                        SupplierName: doc.SupplierName || 'نامشخص',
                        SupplierRef: doc.SupplierRef,
                        BaseType: doc.BaseType,
                        Status: doc.Status,
                        CurrencyRef: doc.CurrencyRef,
                        Description: doc.Description,
                        title: `فاکتور ${doc.InvoiceNumber} - ${doc.SupplierName || 'نامشخص'}`,
                        items: mappedItems,
                        factors: (doc.factors || []).map((f) => ({
                            FactorTitle: f.FactorTitle,
                            FactorType: Number(f.FactorType || 1),
                            Amount: Number(f.Amount || 0),
                            Description: f.Description || '',
                        })),
                    });
                }
            }
            return availableDocs;
        }
        if (docType === 'TemporaryItemReceipt') {
            const qb = this.trRepository
                .createQueryBuilder('tr')
                .leftJoinAndSelect('tr.details', 'details')
                .leftJoinAndSelect('details.item', 'item')
                .leftJoinAndSelect('item.MeasurementUnit', 'mUnit')
                .leftJoinAndSelect('tr.factors', 'factors')
                .leftJoinAndSelect('details.trackingFactors', 'trackingFactors');
            if (bsId && bsId > 1) {
                qb.andWhere('(tr.businessStructureRef = :bsId OR tr.businessStructureRef IS NULL)', { bsId });
            }
            if (compId && compId > 1) {
                qb.andWhere('(tr.companyRef = :compId OR tr.companyRef IS NULL)', { compId });
            }
            if (fiscalYearId) {
                qb.andWhere('(tr.FiscalYearRef = :fiscalYearId OR tr.FiscalYearRef IS NULL OR tr.FiscalYearRef = 1 OR tr.FiscalYearRef = 3)', { fiscalYearId });
            }
            qb.orderBy('tr.ReceiptNumber', 'DESC');
            const docs = await qb.getMany();
            const availableDocs = [];
            for (const doc of docs) {
                if (!isStatusApprovedOrReviewed(doc.Status)) {
                    continue;
                }
                const usedMap = await this.getUsedQuantities('TemporaryItemReceipt', doc.TemporaryItemReceiptID);
                let totalRemaining = 0;
                const mappedItems = [];
                for (const det of doc.details || []) {
                    const origQty = Number(det.Quantity || 0);
                    const itemRef = Number(det.ItemRef || 0);
                    const usedQty = usedMap[itemRef] || 0;
                    const remainingQty = Math.max(0, origQty - usedQty);
                    totalRemaining += remainingQty;
                    if (remainingQty > 0) {
                        mappedItems.push({
                            ItemRef: itemRef,
                            ItemCode: det.item?.ItemCode ? String(det.item.ItemCode) : '',
                            ItemName: det.item?.ItemName || '',
                            UnitName: det.item?.MeasurementUnit?.MeasurementUnitName || det.UnitName || 'عدد',
                            UnitType: det.UnitType || 1,
                            originalQuantity: origQty,
                            usedQuantity: usedQty,
                            remainingQuantity: remainingQty,
                            maxQuantity: remainingQty,
                            Quantity: remainingQty,
                            UnitPrice: Number(det.UnitPrice || 0),
                            Discount: Number(det.Discount || 0),
                            Description: det.Description || '',
                            TrackingFactorValues: det.TrackingFactorValues || null,
                            trackingFactors: det.trackingFactors || [],
                        });
                    }
                }
                const hasNoDetails = !doc.details || doc.details.length === 0;
                if (hasNoDetails || (totalRemaining > 0 && mappedItems.length > 0)) {
                    availableDocs.push({
                        id: doc.TemporaryItemReceiptID,
                        TemporaryItemReceiptID: doc.TemporaryItemReceiptID,
                        code: String(doc.ReceiptNumber),
                        ReceiptNumber: String(doc.ReceiptNumber),
                        ReceiptDate: doc.ReceiptDate,
                        SupplierName: doc.SupplierName || 'نامشخص',
                        SupplierRef: doc.SupplierRef,
                        BaseType: doc.BaseType,
                        Status: doc.Status,
                        CurrencyRef: doc.CurrencyRef,
                        Description: doc.Description,
                        title: `رسید موقت ${doc.ReceiptNumber} - ${doc.SupplierName || 'نامشخص'}`,
                        items: mappedItems,
                        factors: (doc.factors || []).map((f) => ({
                            FactorTitle: f.FactorTitle,
                            FactorType: Number(f.FactorType || 1),
                            Amount: Number(f.Amount || 0),
                            Description: f.Description || '',
                        })),
                    });
                }
            }
            return availableDocs;
        }
        if (docType === 'ItemSupplyRequest') {
            const qb = this.srRepository
                .createQueryBuilder('sr')
                .leftJoinAndSelect('sr.details', 'details')
                .leftJoinAndSelect('details.item', 'item')
                .leftJoinAndSelect('item.MeasurementUnit', 'mUnit');
            if (bsId && bsId > 1) {
                qb.andWhere('(sr.businessStructureRef = :bsId OR sr.businessStructureRef IS NULL)', { bsId });
            }
            if (compId && compId > 1) {
                qb.andWhere('(sr.companyRef = :compId OR sr.companyRef IS NULL)', { compId });
            }
            if (fiscalYearId) {
                qb.andWhere('(sr.FiscalYearRef = :fiscalYearId OR sr.FiscalYearRef IS NULL OR sr.FiscalYearRef = 1 OR sr.FiscalYearRef = 3)', { fiscalYearId });
            }
            qb.orderBy('sr.RequestNumber', 'DESC');
            const docs = await qb.getMany();
            const availableDocs = [];
            for (const doc of docs) {
                if (!isStatusApprovedOrReviewed(doc.Status)) {
                    continue;
                }
                const usedMap = await this.getUsedQuantities('ItemSupplyRequest', doc.ItemSupplyRequestID);
                let totalRemaining = 0;
                const mappedItems = [];
                for (const det of doc.details || []) {
                    const origQty = Number(det.ApprovedQuantity || det.RequestQuantity || 0);
                    const itemRef = Number(det.ItemRef || 0);
                    const usedQty = usedMap[itemRef] || 0;
                    const remainingQty = Math.max(0, origQty - usedQty);
                    totalRemaining += remainingQty;
                    if (remainingQty > 0) {
                        mappedItems.push({
                            ItemRef: itemRef,
                            ItemCode: det.item?.ItemCode ? String(det.item.ItemCode) : '',
                            ItemName: det.item?.ItemName || '',
                            UnitName: det.item?.MeasurementUnit?.MeasurementUnitName || 'عدد',
                            UnitType: 1,
                            originalQuantity: origQty,
                            usedQuantity: usedQty,
                            remainingQuantity: remainingQty,
                            maxQuantity: remainingQty,
                            Quantity: remainingQty,
                            UnitPrice: 0,
                            Discount: 0,
                            Description: det.Description || '',
                        });
                    }
                }
                const hasNoDetails = !doc.details || doc.details.length === 0;
                if (hasNoDetails || (totalRemaining > 0 && mappedItems.length > 0)) {
                    availableDocs.push({
                        id: doc.ItemSupplyRequestID,
                        ItemSupplyRequestID: doc.ItemSupplyRequestID,
                        code: String(doc.RequestNumber),
                        RequestNumber: String(doc.RequestNumber),
                        RequestDate: doc.RequestDate,
                        Requester: doc.Requester || 'نامشخص',
                        RequesterRef: doc.RequesterRef,
                        BasisType: doc.BasisType,
                        Status: doc.Status,
                        Description: doc.Description,
                        title: `درخواست تامین ${doc.RequestNumber} - ${doc.Requester || 'نامشخص'}`,
                        items: mappedItems,
                        factors: [],
                    });
                }
            }
            return availableDocs;
        }
        if (docType === 'ItemRequest') {
            const qb = this.irRepository
                .createQueryBuilder('ir')
                .leftJoinAndSelect('ir.details', 'details')
                .leftJoinAndSelect('details.item', 'item')
                .leftJoinAndSelect('item.MeasurementUnit', 'mUnit');
            if (bsId && bsId > 1) {
                qb.andWhere('(ir.businessStructureRef = :bsId OR ir.businessStructureRef IS NULL)', { bsId });
            }
            if (compId && compId > 1) {
                qb.andWhere('(ir.companyRef = :compId OR ir.companyRef IS NULL)', { compId });
            }
            if (fiscalYearId) {
                qb.andWhere('(ir.FiscalYearRef = :fiscalYearId OR ir.FiscalYearRef IS NULL OR ir.FiscalYearRef = 1 OR ir.FiscalYearRef = 3)', { fiscalYearId });
            }
            qb.orderBy('ir.RequestNumber', 'DESC');
            const docs = await qb.getMany();
            const availableDocs = [];
            for (const doc of docs) {
                if (!isStatusApprovedOrReviewed(doc.Status)) {
                    continue;
                }
                const usedMap = await this.getUsedQuantities('ItemRequest', doc.ItemRequestID);
                let totalRemaining = 0;
                const mappedItems = [];
                for (const det of doc.details || []) {
                    const origQty = Number(det.ApprovedQuantity || det.RequestQuantity || 0);
                    const itemRef = Number(det.ItemRef || 0);
                    const usedQty = usedMap[itemRef] || 0;
                    const remainingQty = Math.max(0, origQty - usedQty);
                    totalRemaining += remainingQty;
                    if (remainingQty > 0) {
                        mappedItems.push({
                            ItemRef: itemRef,
                            ItemCode: det.item?.ItemCode ? String(det.item.ItemCode) : '',
                            ItemName: det.item?.ItemName || '',
                            UnitName: det.item?.MeasurementUnit?.MeasurementUnitName || 'عدد',
                            UnitType: 1,
                            originalQuantity: origQty,
                            usedQuantity: usedQty,
                            remainingQuantity: remainingQty,
                            maxQuantity: remainingQty,
                            Quantity: remainingQty,
                            UnitPrice: 0,
                            Discount: 0,
                            Description: det.Description || '',
                        });
                    }
                }
                const hasNoDetails = !doc.details || doc.details.length === 0;
                if (hasNoDetails || (totalRemaining > 0 && mappedItems.length > 0)) {
                    availableDocs.push({
                        id: doc.ItemRequestID,
                        ItemRequestID: doc.ItemRequestID,
                        code: String(doc.RequestNumber),
                        RequestNumber: String(doc.RequestNumber),
                        RequestDate: doc.RequestDate,
                        Requester: doc.Requester || 'نامشخص',
                        RequesterRef: doc.RequesterRef,
                        WarehouseRef: doc.WarehouseRef,
                        BasisType: doc.BasisType,
                        Status: doc.Status,
                        Description: doc.Description,
                        title: `درخواست کالا ${doc.RequestNumber} - ${doc.Requester || 'نامشخص'}`,
                        items: mappedItems,
                        factors: [],
                    });
                }
            }
            return availableDocs;
        }
        return [];
    }
    async getBaseDocumentDetails(docType, id, currentDocId, targetDocType = 'WarehouseReceipt') {
        const numId = Number(id);
        if (docType === 'PurchaseInvoice') {
            const pi = await this.piRepository.findOne({
                where: [{ PurchaseInvoiceID: numId }, { InvoiceNumber: numId }],
                relations: ['details', 'details.item', 'details.item.MeasurementUnit', 'factors'],
            });
            if (!pi)
                throw new common_1.NotFoundException(`فاکتور خرید ${id} یافت نشد`);
            const usedMap = await this.getUsedQuantities('PurchaseInvoice', pi.PurchaseInvoiceID, targetDocType, currentDocId);
            const mappedItems = (pi.details || []).map((det) => {
                const origQty = Number(det.Quantity || 0);
                const usedQty = usedMap[Number(det.ItemRef)] || 0;
                const remainingQty = Math.max(0, origQty - usedQty);
                const qtyToUse = remainingQty > 0 ? remainingQty : origQty;
                return {
                    ItemRef: Number(det.ItemRef),
                    ItemCode: det.item?.ItemCode ? String(det.item.ItemCode) : '',
                    ItemName: det.item?.ItemName || '',
                    UnitName: det.item?.MeasurementUnit?.MeasurementUnitName || 'عدد',
                    UnitType: det.UnitType || 1,
                    originalQuantity: origQty,
                    usedQuantity: usedQty,
                    remainingQuantity: remainingQty,
                    maxQuantity: qtyToUse,
                    Quantity: qtyToUse,
                    UnitPrice: Number(det.UnitPrice || 0),
                    Discount: Number(det.Discount || 0),
                    Description: det.Description || '',
                    TrackingFactorValues: det.TrackingFactorValues || null,
                    trackingFactorValues: det.TrackingFactorValues || null,
                };
            });
            return {
                id: pi.PurchaseInvoiceID,
                docType,
                InvoiceNumber: pi.InvoiceNumber,
                InvoiceDate: pi.InvoiceDate,
                SupplierRef: pi.SupplierRef,
                SupplierName: pi.SupplierName,
                CurrencyRef: pi.CurrencyRef,
                Description: pi.Description,
                items: mappedItems,
                factors: (pi.factors || []).map((f) => ({
                    FactorTitle: f.FactorTitle,
                    FactorType: Number(f.FactorType || 1),
                    Amount: Number(f.Amount || 0),
                    Description: f.Description || '',
                })),
            };
        }
        if (docType === 'SleSalesInvoice') {
            const found = await this.getSleSalesInvoiceDetailsById(numId);
            if (!found)
                throw new common_1.NotFoundException(`فاکتور فروش ${id} یافت نشد`);
            const { doc, details } = found;
            const usedMap = await this.getSleSalesInvoiceUsedQuantities(numId, currentDocId);
            const mappedItems = details.map((det) => {
                const origQty = Number(det.Quantity || 0);
                const itemRef = Number(det.ItemRef || 0);
                const usedQty = usedMap[itemRef] || 0;
                const remainingQty = Math.max(0, origQty - usedQty);
                const qtyToUse = remainingQty > 0 ? remainingQty : origQty;
                return {
                    ItemRef: itemRef,
                    ItemCode: det.ItemCode ? String(det.ItemCode) : '',
                    ItemName: det.ItemName || '',
                    UnitName: det.UnitName || 'عدد',
                    UnitType: 1,
                    originalQuantity: origQty,
                    usedQuantity: usedQty,
                    remainingQuantity: remainingQty,
                    maxQuantity: qtyToUse,
                    Quantity: qtyToUse,
                    UnitPrice: 0,
                    Discount: 0,
                    Description: det.Description || '',
                    TrackingFactorValues: det.TrackingFactorValues || null,
                    trackingFactorValues: det.TrackingFactorValues || null,
                };
            });
            return {
                id: Number(doc.SalesInvoiceID),
                docType,
                InvoiceNumber: doc.InvoiceNumber,
                InvoiceDate: doc.InvoiceDate,
                CustomerRef: doc.CustomerRef,
                CustomerName: doc.CustomerName,
                CurrencyRef: doc.CurrencyRef || 1,
                Description: doc.Description,
                items: mappedItems,
                factors: [],
            };
        }
        if (docType === 'TemporaryItemReceipt') {
            const tr = await this.trRepository.findOne({
                where: [{ TemporaryItemReceiptID: numId }, { ReceiptNumber: numId }],
                relations: ['details', 'details.item', 'details.item.MeasurementUnit', 'factors', 'details.trackingFactors'],
            });
            if (!tr)
                throw new common_1.NotFoundException(`رسید موقت ${id} یافت نشد`);
            const usedMap = await this.getUsedQuantities('TemporaryItemReceipt', tr.TemporaryItemReceiptID, targetDocType, currentDocId);
            const mappedItems = (tr.details || []).map((det) => {
                const origQty = Number(det.Quantity || 0);
                const usedQty = usedMap[Number(det.ItemRef)] || 0;
                const remainingQty = Math.max(0, origQty - usedQty);
                const qtyToUse = remainingQty > 0 ? remainingQty : origQty;
                return {
                    ItemRef: Number(det.ItemRef),
                    ItemCode: det.item?.ItemCode ? String(det.item.ItemCode) : '',
                    ItemName: det.item?.ItemName || '',
                    UnitName: det.item?.MeasurementUnit?.MeasurementUnitName || det.UnitName || 'عدد',
                    UnitType: det.UnitType || 1,
                    originalQuantity: origQty,
                    usedQuantity: usedQty,
                    remainingQuantity: remainingQty,
                    maxQuantity: qtyToUse,
                    Quantity: qtyToUse,
                    UnitPrice: Number(det.UnitPrice || 0),
                    Discount: Number(det.Discount || 0),
                    Description: det.Description || '',
                    TrackingFactorValues: det.TrackingFactorValues || null,
                    trackingFactors: det.trackingFactors || [],
                };
            });
            return {
                id: tr.TemporaryItemReceiptID,
                docType,
                ReceiptNumber: tr.ReceiptNumber,
                ReceiptDate: tr.ReceiptDate,
                SupplierRef: tr.SupplierRef,
                SupplierName: tr.SupplierName,
                CurrencyRef: tr.CurrencyRef,
                Description: tr.Description,
                items: mappedItems,
                factors: (tr.factors || []).map((f) => ({
                    FactorTitle: f.FactorTitle,
                    FactorType: Number(f.FactorType || 1),
                    Amount: Number(f.Amount || 0),
                    Description: f.Description || '',
                })),
            };
        }
        if (docType === 'ItemSupplyRequest') {
            const sr = await this.srRepository.findOne({
                where: [{ ItemSupplyRequestID: numId }, { RequestNumber: numId }],
                relations: ['details', 'details.item', 'details.item.MeasurementUnit'],
            });
            if (!sr)
                throw new common_1.NotFoundException(`درخواست تامین ${id} یافت نشد`);
            const usedMap = await this.getUsedQuantities('ItemSupplyRequest', sr.ItemSupplyRequestID, targetDocType, currentDocId);
            const mappedItems = (sr.details || []).map((det) => {
                const origQty = Number(det.ApprovedQuantity || det.RequestQuantity || 0);
                const usedQty = usedMap[Number(det.ItemRef)] || 0;
                const remainingQty = Math.max(0, origQty - usedQty);
                const qtyToUse = remainingQty > 0 ? remainingQty : origQty;
                return {
                    ItemRef: Number(det.ItemRef),
                    ItemCode: det.item?.ItemCode ? String(det.item.ItemCode) : '',
                    ItemName: det.item?.ItemName || '',
                    UnitName: det.item?.MeasurementUnit?.MeasurementUnitName || 'عدد',
                    UnitType: 1,
                    originalQuantity: origQty,
                    usedQuantity: usedQty,
                    remainingQuantity: remainingQty,
                    maxQuantity: qtyToUse,
                    Quantity: qtyToUse,
                    UnitPrice: 0,
                    Discount: 0,
                    Description: det.Description || '',
                };
            });
            return {
                id: sr.ItemSupplyRequestID,
                docType,
                RequestNumber: sr.RequestNumber,
                RequestDate: sr.RequestDate,
                RequesterRef: sr.RequesterRef,
                Requester: sr.Requester,
                Description: sr.Description,
                items: mappedItems,
                factors: [],
            };
        }
        if (docType === 'ItemRequest') {
            const ir = await this.irRepository.findOne({
                where: [{ ItemRequestID: numId }, { RequestNumber: numId }],
                relations: ['details', 'details.item', 'details.item.MeasurementUnit'],
            });
            if (!ir)
                throw new common_1.NotFoundException(`درخواست کالا ${id} یافت نشد`);
            const usedMap = await this.getUsedQuantities('ItemRequest', ir.ItemRequestID, docType, currentDocId);
            const mappedItems = (ir.details || []).map((det) => {
                const origQty = Number(det.ApprovedQuantity || det.RequestQuantity || 0);
                const usedQty = usedMap[Number(det.ItemRef)] || 0;
                const remainingQty = Math.max(0, origQty - usedQty);
                const qtyToUse = remainingQty > 0 ? remainingQty : origQty;
                return {
                    ItemRef: Number(det.ItemRef),
                    ItemCode: det.item?.ItemCode ? String(det.item.ItemCode) : '',
                    ItemName: det.item?.ItemName || '',
                    UnitName: det.item?.MeasurementUnit?.MeasurementUnitName || 'عدد',
                    UnitType: 1,
                    originalQuantity: origQty,
                    usedQuantity: usedQty,
                    remainingQuantity: remainingQty,
                    maxQuantity: qtyToUse,
                    Quantity: qtyToUse,
                    UnitPrice: 0,
                    Discount: 0,
                    Description: det.Description || '',
                };
            });
            return {
                id: ir.ItemRequestID,
                docType,
                RequestNumber: ir.RequestNumber,
                RequestDate: ir.RequestDate,
                RequesterRef: ir.RequesterRef,
                Requester: ir.Requester,
                WarehouseRef: ir.WarehouseRef,
                Description: ir.Description,
                items: mappedItems,
                factors: [],
            };
        }
        return null;
    }
    async getBaseDocumentDate(docType, id) {
        const numId = Number(id);
        if (!numId || !Number.isFinite(numId))
            return '';
        const iso = (v) => {
            if (!v)
                return '';
            try {
                return new Date(v).toISOString();
            }
            catch {
                return String(v);
            }
        };
        if (docType === 'PurchaseInvoice' || docType === 'SalesInvoice') {
            const doc = await this.piRepository.findOne({
                where: [{ PurchaseInvoiceID: numId }, { InvoiceNumber: numId }],
            });
            return iso(doc?.InvoiceDate);
        }
        if (docType === 'SleSalesInvoice') {
            const rows = await this.dataSource.query(`SELECT "InvoiceDate" FROM "Sle"."SalesInvoices" WHERE "SalesInvoiceID" = $1 LIMIT 1`, [numId]);
            return iso(rows && rows[0] ? rows[0].InvoiceDate : '');
        }
        if (docType === 'TemporaryItemReceipt') {
            const doc = await this.trRepository.findOne({
                where: [{ TemporaryItemReceiptID: numId }, { ReceiptNumber: numId }],
            });
            return iso(doc?.ReceiptDate);
        }
        if (docType === 'ItemSupplyRequest') {
            const doc = await this.srRepository.findOne({
                where: [{ ItemSupplyRequestID: numId }, { RequestNumber: numId }],
            });
            return iso(doc?.RequestDate);
        }
        if (docType === 'ItemRequest') {
            const doc = await this.irRepository.findOne({
                where: [{ ItemRequestID: numId }, { RequestNumber: numId }],
            });
            return iso(doc?.RequestDate);
        }
        return '';
    }
};
exports.BaseDocumentService = BaseDocumentService;
exports.BaseDocumentService = BaseDocumentService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(purchase_invoice_entity_1.PurchaseInvoice)),
    __param(1, (0, typeorm_1.InjectRepository)(purchase_invoice_detail_entity_1.PurchaseInvoiceDetail)),
    __param(2, (0, typeorm_1.InjectRepository)(purchase_invoice_factor_entity_1.PurchaseInvoiceFactor)),
    __param(3, (0, typeorm_1.InjectRepository)(temporary_item_receipt_entity_1.TemporaryItemReceipt)),
    __param(4, (0, typeorm_1.InjectRepository)(temporary_item_receipt_detail_entity_1.TemporaryItemReceiptDetail)),
    __param(5, (0, typeorm_1.InjectRepository)(temporary_item_receipt_factor_entity_1.TemporaryItemReceiptFactor)),
    __param(6, (0, typeorm_1.InjectRepository)(item_supply_request_entity_1.ItemSupplyRequest)),
    __param(7, (0, typeorm_1.InjectRepository)(item_supply_request_detail_entity_1.ItemSupplyRequestDetail)),
    __param(8, (0, typeorm_1.InjectRepository)(item_request_entity_1.ItemRequest)),
    __param(9, (0, typeorm_1.InjectRepository)(item_request_detail_entity_1.ItemRequestDetail)),
    __param(10, (0, typeorm_1.InjectRepository)(warehouse_receipt_entity_1.WarehouseReceipt)),
    __param(11, (0, typeorm_1.InjectRepository)(warehouse_receipt_detail_entity_1.WarehouseReceiptDetail)),
    __param(12, (0, typeorm_1.InjectRepository)(warehouse_receipt_factor_entity_1.WarehouseReceiptFactor)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.DataSource,
        request_context_service_1.RequestContextService])
], BaseDocumentService);
//# sourceMappingURL=base-document.service.js.map