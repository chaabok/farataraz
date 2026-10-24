import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PurchaseInvoice } from '../../domain/entities/purchase-invoice.entity';
import { PurchaseInvoiceDetail } from '../../domain/entities/purchase-invoice-detail.entity';
import { PurchaseInvoiceFactor } from '../../domain/entities/purchase-invoice-factor.entity';
import { TemporaryItemReceipt } from '../../domain/entities/temporary-item-receipt.entity';
import { TemporaryItemReceiptDetail } from '../../domain/entities/temporary-item-receipt-detail.entity';
import { TemporaryItemReceiptFactor } from '../../domain/entities/temporary-item-receipt-factor.entity';
import { ItemSupplyRequest } from '../../domain/entities/item-supply-request.entity';
import { ItemSupplyRequestDetail } from '../../domain/entities/item-supply-request-detail.entity';
import { ItemRequest } from '../../domain/entities/item-request.entity';
import { ItemRequestDetail } from '../../domain/entities/item-request-detail.entity';
import { WarehouseReceipt } from '../../domain/entities/warehouse-receipt.entity';
import { WarehouseReceiptDetail } from '../../domain/entities/warehouse-receipt-detail.entity';
import { WarehouseReceiptFactor } from '../../domain/entities/warehouse-receipt-factor.entity';
import { RequestContextService } from '../../../../core/services/request-context.service';

function isStatusApprovedOrReviewed(status: any): boolean {
  if (status === null || status === undefined || status === '') return false;
  if (typeof status === 'number') {
    return status === 4 || status === 5;
  }
  const str = String(status).trim();
  return (
    str === '4' ||
    str === '5' ||
    str === 'بررسی شده' ||
    str === 'تایید شده' ||
    str.includes('بررسی شده') ||
    str.includes('تایید شده')
  );
}

@Injectable()
export class BaseDocumentService {
  constructor(
    @InjectRepository(PurchaseInvoice)
    private readonly piRepository: Repository<PurchaseInvoice>,
    @InjectRepository(PurchaseInvoiceDetail)
    private readonly piDetailRepository: Repository<PurchaseInvoiceDetail>,
    @InjectRepository(PurchaseInvoiceFactor)
    private readonly piFactorRepository: Repository<PurchaseInvoiceFactor>,

    @InjectRepository(TemporaryItemReceipt)
    private readonly trRepository: Repository<TemporaryItemReceipt>,
    @InjectRepository(TemporaryItemReceiptDetail)
    private readonly trDetailRepository: Repository<TemporaryItemReceiptDetail>,
    @InjectRepository(TemporaryItemReceiptFactor)
    private readonly trFactorRepository: Repository<TemporaryItemReceiptFactor>,

    @InjectRepository(ItemSupplyRequest)
    private readonly srRepository: Repository<ItemSupplyRequest>,
    @InjectRepository(ItemSupplyRequestDetail)
    private readonly srDetailRepository: Repository<ItemSupplyRequestDetail>,

    @InjectRepository(ItemRequest)
    private readonly irRepository: Repository<ItemRequest>,
    @InjectRepository(ItemRequestDetail)
    private readonly irDetailRepository: Repository<ItemRequestDetail>,

    @InjectRepository(WarehouseReceipt)
    private readonly wrRepository: Repository<WarehouseReceipt>,
    @InjectRepository(WarehouseReceiptDetail)
    private readonly wrDetailRepository: Repository<WarehouseReceiptDetail>,
    @InjectRepository(WarehouseReceiptFactor)
    private readonly wrFactorRepository: Repository<WarehouseReceiptFactor>,

    private readonly requestContextService: RequestContextService,
  ) {}

  private getScope() {
    let bsId = this.requestContextService.getBusinessStructureId() ?? 2;
    let compId = this.requestContextService.getCompanyId() ?? 2;
    let fiscalYearId = this.requestContextService.getFiscalYearId() ?? 1;

    if (bsId <= 1) bsId = 2;
    if (compId <= 1) compId = 2;

    return { bsId, compId, fiscalYearId };
  }

  /**
   * Calculate used quantities for a base document detail items
   */
  private async getUsedQuantities(
    baseDocType: string,
    docId: number,
    targetDocType?: string,
    currentDocId?: number,
  ): Promise<Record<number, number>> {
    const usedMap: Record<number, number> = {};

    if (baseDocType === 'PurchaseInvoice') {
      // Used in TemporaryItemReceipt
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

      // Used in WarehouseReceipt
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
    } else if (baseDocType === 'TemporaryItemReceipt') {
      // Used in WarehouseReceipt
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
    } else if (baseDocType === 'ItemSupplyRequest') {
      // Used in PurchaseInvoice
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

      // Used in TemporaryItemReceipt
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

      // Used in WarehouseReceipt
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
    } else if (baseDocType === 'ItemRequest') {
      // Used in ItemSupplyRequest
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

      // Used in WarehouseReceipt (Issue)
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

  /**
   * Get available base documents where remaining quantity > 0
   */
  async getAvailableBaseDocuments(docType: string, targetDocType?: string): Promise<any[]> {
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

      const availableDocs: any[] = [];
      for (const doc of docs) {
        if (!isStatusApprovedOrReviewed(doc.Status)) {
          continue;
        }
        // If a purchase invoice has been used in a Temporary Item Receipt (رسید موقت) as a base document,
        // it must NOT be displayed in Warehouse Receipt (رسید انبار).
        const docIdStr = String(doc.PurchaseInvoiceID);
        const docNumStr = doc.InvoiceNumber ? String(doc.InvoiceNumber) : '';

        const trUsageCount = await this.trRepository
          .createQueryBuilder('tr')
          .leftJoin('tr.details', 'trDetail')
          .where(
            '(tr.BaseDocumentNumber = :docIdStr OR (tr.BaseDocumentNumber = :docNumStr AND :docNumStr != \'\') OR trDetail.BaseNumber = :docIdStr OR (trDetail.BaseNumber = :docNumStr AND :docNumStr != \'\'))',
            { docIdStr, docNumStr }
          )
          .getCount();

        if (trUsageCount > 0) {
          continue;
        }

        const usedMap = await this.getUsedQuantities('PurchaseInvoice', doc.PurchaseInvoiceID, targetDocType);
        let totalRemaining = 0;
        const mappedItems: any[] = [];

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

      const availableDocs: any[] = [];
      for (const doc of docs) {
        if (!isStatusApprovedOrReviewed(doc.Status)) {
          continue;
        }
        const usedMap = await this.getUsedQuantities('TemporaryItemReceipt', doc.TemporaryItemReceiptID);
        let totalRemaining = 0;
        const mappedItems: any[] = [];

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

      const availableDocs: any[] = [];
      for (const doc of docs) {
        if (!isStatusApprovedOrReviewed(doc.Status)) {
          continue;
        }
        const usedMap = await this.getUsedQuantities('ItemSupplyRequest', doc.ItemSupplyRequestID);
        let totalRemaining = 0;
        const mappedItems: any[] = [];

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

      const availableDocs: any[] = [];
      for (const doc of docs) {
        if (!isStatusApprovedOrReviewed(doc.Status)) {
          continue;
        }
        const usedMap = await this.getUsedQuantities('ItemRequest', doc.ItemRequestID);
        let totalRemaining = 0;
        const mappedItems: any[] = [];

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

  /**
   * Get complete details of a selected base document
   */
  async getBaseDocumentDetails(docType: string, id: number, currentDocId?: number, targetDocType: string = 'WarehouseReceipt'): Promise<any> {
    const numId = Number(id);

    if (docType === 'PurchaseInvoice') {
      const pi = await this.piRepository.findOne({
        where: [{ PurchaseInvoiceID: numId }, { InvoiceNumber: numId }],
        relations: ['details', 'details.item', 'details.item.MeasurementUnit', 'factors'],
      });
      if (!pi) throw new NotFoundException(`فاکتور خرید ${id} یافت نشد`);

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

    if (docType === 'TemporaryItemReceipt') {
      const tr = await this.trRepository.findOne({
        where: [{ TemporaryItemReceiptID: numId }, { ReceiptNumber: numId }],
        relations: ['details', 'details.item', 'details.item.MeasurementUnit', 'factors', 'details.trackingFactors'],
      });
      if (!tr) throw new NotFoundException(`رسید موقت ${id} یافت نشد`);

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
      if (!sr) throw new NotFoundException(`درخواست تامین ${id} یافت نشد`);

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
      if (!ir) throw new NotFoundException(`درخواست کالا ${id} یافت نشد`);

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
}
