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
exports.SleBaseDocumentService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const sales_order_entity_1 = require("../../domain/entities/sales-order.entity");
const sales_proforma_invoice_entity_1 = require("../../domain/entities/sales-proforma-invoice.entity");
const sales_contract_entity_1 = require("../../domain/entities/sales-contract.entity");
const sales_invoice_entity_1 = require("../../domain/entities/sales-invoice.entity");
const sales_permission_entity_1 = require("../../domain/entities/sales-permission.entity");
const sales_return_permission_entity_1 = require("../../domain/entities/sales-return-permission.entity");
const request_context_service_1 = require("../../../../core/services/request-context.service");
let SleBaseDocumentService = class SleBaseDocumentService {
    constructor(orderRepository, proformaRepository, contractRepository, invoiceRepository, permissionRepository, returnPermissionRepository, requestContextService) {
        this.orderRepository = orderRepository;
        this.proformaRepository = proformaRepository;
        this.contractRepository = contractRepository;
        this.invoiceRepository = invoiceRepository;
        this.permissionRepository = permissionRepository;
        this.returnPermissionRepository = returnPermissionRepository;
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
    async getFullyCoveredOrderIds(orderIds, excludeProformaId) {
        const closed = new Set();
        if (!orderIds.length)
            return closed;
        const manager = this.orderRepository.manager;
        const orderedRows = await manager.query(`SELECT "SalesOrderRef" AS "orderId", "ItemRef" AS "itemRef", SUM("Quantity") AS "ordered"
         FROM "Sle"."SalesOrderItems"
         WHERE "SalesOrderRef" = ANY($1::bigint[]) AND "ItemRef" IS NOT NULL
         GROUP BY 1, 2`, [orderIds]);
        const usedRows = await manager.query(`SELECT p."BaseDocumentRef" AS "orderId", i."ItemRef" AS "itemRef", SUM(i."Quantity") AS "used"
       FROM "Sle"."SalesProformaInvoices" p
       JOIN "Sle"."SalesProformaInvoiceItems" i ON i."SalesProformaRef" = p."SalesProformaID"
       WHERE p."BaseDocumentTypeRef" = 1
         AND p."BaseDocumentRef" = ANY($1::bigint[])
         AND COALESCE(p."Status", 0) <> 6
         AND ($2::bigint IS NULL OR p."SalesProformaID" <> $2::bigint)
         AND i."ItemRef" IS NOT NULL
       GROUP BY 1, 2`, [orderIds, excludeProformaId && excludeProformaId > 0 ? excludeProformaId : null]);
        if (!orderedRows.length)
            return closed;
        const EPS = 1e-9;
        const orderedMap = new Map();
        for (const r of orderedRows) {
            const oid = Number(r.orderId);
            const iid = Number(r.itemRef);
            if (!orderedMap.has(oid))
                orderedMap.set(oid, new Map());
            const m = orderedMap.get(oid);
            m.set(iid, (m.get(iid) || 0) + (Number(r.ordered) || 0));
        }
        const usedMap = new Map();
        for (const r of usedRows) {
            const oid = Number(r.orderId);
            const iid = Number(r.itemRef);
            if (!usedMap.has(oid))
                usedMap.set(oid, new Map());
            const m = usedMap.get(oid);
            m.set(iid, (m.get(iid) || 0) + (Number(r.used) || 0));
        }
        for (const [oid, items] of orderedMap.entries()) {
            if (!items.size)
                continue;
            const fullyCovered = Array.from(items.entries()).every(([iid, orderedQty]) => {
                const usedQty = usedMap.get(oid)?.get(iid) || 0;
                return usedQty + EPS >= orderedQty;
            });
            if (fullyCovered)
                closed.add(oid);
        }
        return closed;
    }
    async getAvailableBaseDocuments(type, excludeProformaId, customerRef) {
        const { bsId, compId, fiscalYearId } = this.getScope();
        const t = Number(type);
        if (customerRef !== undefined && (!Number.isFinite(customerRef) || customerRef <= 0)) {
            return [];
        }
        if (t === 1) {
            const qb = this.orderRepository
                .createQueryBuilder('so')
                .where('so.Status IN (4, 5)');
            if (bsId && bsId > 1)
                qb.andWhere('(so.businessStructureRef = :bsId OR so.businessStructureRef IS NULL)', { bsId });
            if (compId && compId > 1)
                qb.andWhere('(so.companyRef = :compId OR so.companyRef IS NULL)', { compId });
            if (fiscalYearId)
                qb.andWhere('(so.FiscalYearRef = :fiscalYearId OR so.FiscalYearRef IS NULL)', { fiscalYearId });
            if (customerRef)
                qb.andWhere('so.CustomerRef = :customerRef', { customerRef });
            qb.orderBy('so.OrderNumber', 'DESC');
            let docs = await qb.getMany();
            const excludeId = Number(excludeProformaId) > 0 ? Number(excludeProformaId) : undefined;
            const candidateIds = docs.map((d) => Number(d.SalesOrderID));
            const closedIds = await this.getFullyCoveredOrderIds(candidateIds, excludeId);
            if (closedIds.size)
                docs = docs.filter((d) => !closedIds.has(Number(d.SalesOrderID)));
            return docs.map((d) => ({
                id: Number(d.SalesOrderID),
                number: d.OrderNumber,
                date: d.OrderDate || '',
                customer: d.CustomerName || '',
                customerRef: d.CustomerRef != null ? Number(d.CustomerRef) : null,
            }));
        }
        if (t === 2) {
            const qb = this.proformaRepository
                .createQueryBuilder('sp')
                .where('sp.Status IN (4, 5)');
            if (bsId && bsId > 1)
                qb.andWhere('(sp.businessStructureRef = :bsId OR sp.businessStructureRef IS NULL)', { bsId });
            if (compId && compId > 1)
                qb.andWhere('(sp.companyRef = :compId OR sp.companyRef IS NULL)', { compId });
            if (fiscalYearId)
                qb.andWhere('(sp.FiscalYearRef = :fiscalYearId OR sp.FiscalYearRef IS NULL)', { fiscalYearId });
            if (customerRef)
                qb.andWhere('sp.CustomerRef = :customerRef', { customerRef });
            qb.orderBy('sp.ProformaNumber', 'DESC');
            const docs = await qb.getMany();
            return docs.map((d) => ({
                id: Number(d.SalesProformaID),
                number: d.ProformaNumber,
                date: d.ProformaDate || '',
                customer: d.CustomerName || '',
                customerRef: d.CustomerRef != null ? Number(d.CustomerRef) : null,
            }));
        }
        if (t === 3) {
            const qb = this.contractRepository
                .createQueryBuilder('sc')
                .where('sc.Status IN (4, 5)');
            if (bsId && bsId > 1)
                qb.andWhere('(sc.businessStructureRef = :bsId OR sc.businessStructureRef IS NULL)', { bsId });
            if (compId && compId > 1)
                qb.andWhere('(sc.companyRef = :compId OR sc.companyRef IS NULL)', { compId });
            if (fiscalYearId)
                qb.andWhere('(sc.FiscalYearRef = :fiscalYearId OR sc.FiscalYearRef IS NULL)', { fiscalYearId });
            if (customerRef)
                qb.andWhere('sc.CustomerRef = :customerRef', { customerRef });
            qb.orderBy('sc.ContractNumber', 'DESC');
            const docs = await qb.getMany();
            return docs.map((d) => ({
                id: Number(d.SalesContractID),
                number: d.ContractNumber,
                date: d.DocumentDate || d.ContractDate || '',
                customer: d.CustomerName || '',
                customerRef: d.CustomerRef != null ? Number(d.CustomerRef) : null,
            }));
        }
        if (t === 5) {
            const qb = this.invoiceRepository
                .createQueryBuilder('si')
                .where('si.Status IN (4, 5)');
            if (bsId && bsId > 1)
                qb.andWhere('(si.businessStructureRef = :bsId OR si.businessStructureRef IS NULL)', { bsId });
            if (compId && compId > 1)
                qb.andWhere('(si.companyRef = :compId OR si.companyRef IS NULL)', { compId });
            if (fiscalYearId)
                qb.andWhere('(si.FiscalYearRef = :fiscalYearId OR si.FiscalYearRef IS NULL)', { fiscalYearId });
            if (customerRef)
                qb.andWhere('si.CustomerRef = :customerRef', { customerRef });
            qb.orderBy('si.InvoiceNumber', 'DESC');
            const docs = await qb.getMany();
            return docs.map((d) => ({
                id: Number(d.SalesInvoiceID),
                number: d.InvoiceNumber,
                date: d.InvoiceDate || '',
                customer: d.CustomerName || '',
                customerRef: d.CustomerRef != null ? Number(d.CustomerRef) : null,
            }));
        }
        if (t === 4) {
            const qb = this.permissionRepository
                .createQueryBuilder('spm')
                .where('spm.Status IN (4, 5)');
            if (bsId && bsId > 1)
                qb.andWhere('(spm.businessStructureRef = :bsId OR spm.businessStructureRef IS NULL)', { bsId });
            if (compId && compId > 1)
                qb.andWhere('(spm.companyRef = :compId OR spm.companyRef IS NULL)', { compId });
            if (fiscalYearId)
                qb.andWhere('(spm.FiscalYearRef = :fiscalYearId OR spm.FiscalYearRef IS NULL)', { fiscalYearId });
            if (customerRef)
                qb.andWhere('spm.CustomerRef = :customerRef', { customerRef });
            qb.orderBy('spm.PermissionNumber', 'DESC');
            const docs = await qb.getMany();
            return docs.map((d) => ({
                id: Number(d.SalesPermissionID),
                number: d.PermissionNumber,
                date: d.PermissionDate || '',
                customer: d.CustomerName || '',
                customerRef: d.CustomerRef != null ? Number(d.CustomerRef) : null,
            }));
        }
        if (t === 6) {
            const qb = this.returnPermissionRepository
                .createQueryBuilder('srp')
                .where('srp.Status IN (4, 5)');
            if (bsId && bsId > 1)
                qb.andWhere('(srp.businessStructureRef = :bsId OR srp.businessStructureRef IS NULL)', { bsId });
            if (compId && compId > 1)
                qb.andWhere('(srp.companyRef = :compId OR srp.companyRef IS NULL)', { compId });
            if (fiscalYearId)
                qb.andWhere('(srp.FiscalYearRef = :fiscalYearId OR srp.FiscalYearRef IS NULL)', { fiscalYearId });
            if (customerRef)
                qb.andWhere('srp.CustomerRef = :customerRef', { customerRef });
            qb.orderBy('srp.PermissionNumber', 'DESC');
            const docs = await qb.getMany();
            return docs.map((d) => ({
                id: Number(d.SalesReturnPermissionID),
                number: d.PermissionNumber,
                date: d.PermissionDate || '',
                customer: d.CustomerName || '',
                customerRef: d.CustomerRef != null ? Number(d.CustomerRef) : null,
            }));
        }
        return [];
    }
    async getBaseDocumentDate(type, id) {
        const t = Number(type);
        const docId = Number(id);
        if (!docId || !Number.isFinite(docId))
            return '';
        if (t === 1) {
            const doc = await this.orderRepository.findOne({ where: { SalesOrderID: docId } });
            return doc?.OrderDate || '';
        }
        if (t === 2) {
            const doc = await this.proformaRepository.findOne({ where: { SalesProformaID: docId } });
            return doc?.ProformaDate || '';
        }
        if (t === 3) {
            const doc = await this.contractRepository.findOne({ where: { SalesContractID: docId } });
            return doc?.DocumentDate || doc?.ContractDate || '';
        }
        if (t === 5) {
            const doc = await this.invoiceRepository.findOne({ where: { SalesInvoiceID: docId } });
            return doc?.InvoiceDate || '';
        }
        if (t === 4) {
            const doc = await this.permissionRepository.findOne({ where: { SalesPermissionID: docId } });
            return doc?.PermissionDate || '';
        }
        if (t === 6) {
            const doc = await this.returnPermissionRepository.findOne({ where: { SalesReturnPermissionID: docId } });
            return doc?.PermissionDate || '';
        }
        return '';
    }
    async getBaseDocumentDetail(type, id) {
        const t = Number(type);
        const docId = Number(id);
        if (!docId || !Number.isFinite(docId))
            return null;
        if (t === 1) {
            const doc = await this.orderRepository.findOne({
                where: { SalesOrderID: docId },
                relations: ['items', 'factors'],
            });
            if (!doc)
                return null;
            return this.normalizeBaseDetail(doc, doc.OrderNumber, doc.OrderDate, doc.items, doc.factors);
        }
        if (t === 2) {
            const doc = await this.proformaRepository.findOne({
                where: { SalesProformaID: docId },
                relations: ['items', 'factors'],
            });
            if (!doc)
                return null;
            return this.normalizeBaseDetail(doc, doc.ProformaNumber, doc.ProformaDate, doc.items, doc.factors);
        }
        if (t === 6) {
            const doc = await this.returnPermissionRepository.findOne({
                where: { SalesReturnPermissionID: docId },
                relations: ['items', 'factors'],
            });
            if (!doc)
                return null;
            return this.normalizeBaseDetail(doc, doc.PermissionNumber, doc.PermissionDate, doc.items, doc.factors);
        }
        return null;
    }
    normalizeBaseDetail(header, number, date, items, factors) {
        return {
            id: Number(header.SalesOrderID ?? header.SalesProformaID ?? header.SalesContractID ?? header.SalesInvoiceID ?? header.SalesPermissionID ?? header.SalesReturnPermissionID),
            number: number ?? null,
            date: date || '',
            customer: header.CustomerName || '',
            CustomerRef: header.CustomerRef != null ? Number(header.CustomerRef) : null,
            CustomerName: header.CustomerName || '',
            SalesTypeRef: header.SalesTypeRef != null ? Number(header.SalesTypeRef) : null,
            SalesCenterRef: header.SalesCenterRef != null ? Number(header.SalesCenterRef) : null,
            DeliveryLocationRef: header.DeliveryLocationRef != null ? Number(header.DeliveryLocationRef) : null,
            SettlementMethodRef: header.SettlementMethodRef != null ? Number(header.SettlementMethodRef) : null,
            items: (items || [])
                .slice()
                .sort((a, b) => (Number(a.RowNo) || 0) - (Number(b.RowNo) || 0))
                .map((i) => ({
                ItemRef: i.ItemRef != null ? Number(i.ItemRef) : null,
                ItemCode: i.ItemCode || '',
                ItemName: i.ItemName || '',
                UnitName: i.UnitName || 'عدد',
                Quantity: Number(i.Quantity) || 0,
                UnitPrice: Number(i.UnitPrice) || 0,
                TotalPrice: Number(i.TotalPrice) || 0,
                Description: i.Description || '',
                trackingFactorValues: i.TrackingFactorValues ?? null,
            })),
            factors: (factors || [])
                .slice()
                .sort((a, b) => (Number(a.RowNo) || 0) - (Number(b.RowNo) || 0))
                .map((f) => ({
                RowNo: Number(f.RowNo) || 1,
                FactorTitle: f.FactorTitle || '',
                FactorType: Number(f.FactorType) === 2 ? 2 : 1,
                Amount: Number(f.Amount) || 0,
                Description: f.Description || '',
            })),
        };
    }
};
exports.SleBaseDocumentService = SleBaseDocumentService;
SleBaseDocumentService.BASE_ELIGIBLE_STATUSES = [4, 5];
exports.SleBaseDocumentService = SleBaseDocumentService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(sales_order_entity_1.SalesOrder)),
    __param(1, (0, typeorm_1.InjectRepository)(sales_proforma_invoice_entity_1.SalesProformaInvoice)),
    __param(2, (0, typeorm_1.InjectRepository)(sales_contract_entity_1.SalesContract)),
    __param(3, (0, typeorm_1.InjectRepository)(sales_invoice_entity_1.SalesInvoice)),
    __param(4, (0, typeorm_1.InjectRepository)(sales_permission_entity_1.SalesPermission)),
    __param(5, (0, typeorm_1.InjectRepository)(sales_return_permission_entity_1.SalesReturnPermission)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        request_context_service_1.RequestContextService])
], SleBaseDocumentService);
//# sourceMappingURL=base-document.service.js.map