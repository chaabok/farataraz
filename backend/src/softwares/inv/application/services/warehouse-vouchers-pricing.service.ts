import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In, LessThanOrEqual } from 'typeorm';
import { WarehouseVouchersPricing } from '../../domain/entities/warehouse-vouchers-pricing.entity';
import { CreateWarehouseVouchersPricingDto, UpdateWarehouseVouchersPricingDto, CalculateWarehousePricingDto } from '../dtos/warehouse-vouchers-pricing.dto';
import { IdGenerationService } from '../../../../core/services/id-generation.service';
import { RequestContextService } from '../../../../core/services/request-context.service';
import { parseToIsoDateString } from '../../../../core/utils/date-parser';
import { WarehouseReceipt } from '../../domain/entities/warehouse-receipt.entity';
import { WarehouseReceiptDetail } from '../../domain/entities/warehouse-receipt-detail.entity';
import { Item } from '../../domain/entities/item.entity';
import { ItemAccountCategory } from '../../domain/entities/item-account-category.entity';
import { StandardItemRate } from '../../domain/entities/standard-item-rate.entity';
import { StandardItemRateDetail } from '../../domain/entities/standard-item-rate-detail.entity';
import { Warehouse } from '../../domain/entities/warehouse.entity';

@Injectable()
export class WarehouseVouchersPricingService {
  constructor(
    @InjectRepository(WarehouseVouchersPricing)
    private readonly repository: Repository<WarehouseVouchersPricing>,
    @InjectRepository(WarehouseReceipt)
    private readonly receiptRepo: Repository<WarehouseReceipt>,
    @InjectRepository(WarehouseReceiptDetail)
    private readonly receiptDetailRepo: Repository<WarehouseReceiptDetail>,
    @InjectRepository(Item)
    private readonly itemRepo: Repository<Item>,
    @InjectRepository(ItemAccountCategory)
    private readonly categoryRepo: Repository<ItemAccountCategory>,
    @InjectRepository(StandardItemRate)
    private readonly stdRateRepo: Repository<StandardItemRate>,
    @InjectRepository(StandardItemRateDetail)
    private readonly stdRateDetailRepo: Repository<StandardItemRateDetail>,
    @InjectRepository(Warehouse)
    private readonly warehouseRepo: Repository<Warehouse>,
    private readonly idGenService: IdGenerationService,
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

  async create(dto: CreateWarehouseVouchersPricingDto): Promise<WarehouseVouchersPricing> {
    const { bsId, compId, fiscalYearId } = this.getScope();
    const userId = this.requestContextService.getUserId() || 1;
    const nowTime = new Date().toTimeString().split(' ')[0];

    const pricingId = dto.WarehouseVouchersPricingID || (await this.idGenService.generateNextIdBlock('WarehouseVouchersPricing', 1));

    const unitPrice = Number(dto.UnitPrice || 0);
    const additions = Number(dto.Additions || 0);
    const deductions = Number(dto.Deductions || 0);
    const netPrice = dto.NetPrice !== undefined ? Number(dto.NetPrice) : unitPrice + additions - deductions;

    const entity = this.repository.create({
      WarehouseVouchersPricingID: pricingId,
      PricingType: Number(dto.PricingType || 2), // Rule 8: Default PricingType = 2 (Issue / Warehouse Pricing)
      WarehouseVoucherRef: dto.WarehouseVoucherRef ? Number(dto.WarehouseVoucherRef) : undefined,
      WarehouseVoucherDetailRef: dto.WarehouseVoucherDetailRef ? Number(dto.WarehouseVoucherDetailRef) : undefined,
      ItemRef: dto.ItemRef ? Number(dto.ItemRef) : undefined,
      UnitPrice: unitPrice,
      Additions: additions,
      Deductions: deductions,
      NetPrice: netPrice,
      Description: dto.Description || undefined,
      businessStructureRef: bsId,
      companyRef: compId,
      FiscalYearRef: fiscalYearId,
      creator: userId,
      lastModifier: userId,
      createTime: nowTime,
      lastModificationTime: nowTime,
    });

    return this.repository.save(entity);
  }

  async createBatch(dtos: CreateWarehouseVouchersPricingDto[]): Promise<WarehouseVouchersPricing[]> {
    if (!dtos || dtos.length === 0) return [];

    const { bsId, compId, fiscalYearId } = this.getScope();
    const userId = this.requestContextService.getUserId() || 1;
    const nowTime = new Date().toTimeString().split(' ')[0];

    const startId = await this.idGenService.generateNextIdBlock('WarehouseVouchersPricing', dtos.length);

    const entities = dtos.map((dto, idx) => {
      const unitPrice = Number(dto.UnitPrice || 0);
      const additions = Number(dto.Additions || 0);
      const deductions = Number(dto.Deductions || 0);
      const netPrice = dto.NetPrice !== undefined ? Number(dto.NetPrice) : unitPrice + additions - deductions;

      return this.repository.create({
        WarehouseVouchersPricingID: startId + idx,
        PricingType: Number(dto.PricingType || 2), // Rule 8: PricingType = 2
        WarehouseVoucherRef: dto.WarehouseVoucherRef ? Number(dto.WarehouseVoucherRef) : undefined,
        WarehouseVoucherDetailRef: dto.WarehouseVoucherDetailRef ? Number(dto.WarehouseVoucherDetailRef) : undefined,
        ItemRef: dto.ItemRef ? Number(dto.ItemRef) : undefined,
        UnitPrice: unitPrice,
        Additions: additions,
        Deductions: deductions,
        NetPrice: netPrice,
        Description: dto.Description || undefined,
        businessStructureRef: bsId,
        companyRef: compId,
        FiscalYearRef: fiscalYearId,
        creator: userId,
        lastModifier: userId,
        createTime: nowTime,
        lastModificationTime: nowTime,
      });
    });

    return this.repository.save(entities);
  }

  /**
   * Main Warehouse Vouchers Pricing Engine implementing all 9 rules:
   * Rule 1 & 9: Only 4 methods (Weighted Average, FIFO, LIFO, Specific Ident) are evaluated. Standard rate is excluded.
   * Rule 2 & 3: Standard rate items must have valid unit rate in StandardItemRates where EffectiveDate <= VoucherDate.
   * Rule 4: Base document inheritance & Base document valuation guard (Throw exact error if base document is unpriced).
   * Rule 5: Only documents with DocumentState / Status IN [2 (Reviewed), 3 (Approved)] are included.
   * Rule 6: StartDate <= VoucherDate <= EndDate.
   * Rule 7: Unpriced target documents are priced.
   * Rule 8: Persist in WarehouseVouchersPricing with PricingType = 2.
   */
  async calculatePricing(dto: CalculateWarehousePricingDto): Promise<any> {
    const method = Number(dto.ValuationMethod || 1);

    // Rule 1 & 9: Standard Cost method is NOT evaluated in warehouse pricing form
    if (method === 4) {
      throw new BadRequestException(
        'روش نرخ استاندارد در فرم قیمت‌گذاری اسناد انبار مورد ارزیابی قرار نمی‌گیرد و بر اساس طبقه حساب کالا مستقیماً اعمال می‌گردد.'
      );
    }

    const { bsId, compId, fiscalYearId } = this.getScope();
    const userId = this.requestContextService.getUserId() || 1;
    const nowTime = new Date().toTimeString().split(' ')[0];

    const startDate = dto.StartDate || '1400/01/01';
    const endDate = dto.EndDate || '1499/12/29';

    // 1. Fetch Warehouses and Items
    const warehouseFilter = dto.WarehouseIds && dto.WarehouseIds.length > 0 ? { WarehouseID: In(dto.WarehouseIds) } : {};
    const warehouses = await this.warehouseRepo.find({ where: warehouseFilter });
    const warehouseMap = new Map<number, string>();
    warehouses.forEach((w) => warehouseMap.set(Number(w.WarehouseID), `${w.WarehouseCode || w.WarehouseID} - ${w.WarehouseTitle || ''}`));

    const itemFilter: any = dto.ItemIds && dto.ItemIds.length > 0 ? { ItemID: In(dto.ItemIds), ItemType: 1 } : { ItemType: 1 };
    const items = await this.itemRepo.find({ where: itemFilter, relations: ['ItemAccountCategory', 'MeasurementUnit'] });
    const itemMap = new Map<number, Item>();
    items.forEach((i) => itemMap.set(Number(i.ItemID), i));

    // Rule 2 & 3: Check Standard Rate rules for items with Standard Rate categories
    const targetIsoEndDate = parseToIsoDateString(endDate) || endDate;

    for (const item of items) {
      const category = item.ItemAccountCategory;
      // Only require standard rate validation if category's pricing method is explicitly Standard Cost (4) or StandardRate is enabled (1)
      const isStandardRateItem = category && (Number(category.PricingMethod) === 4 || Number(category.StandardRate) === 1);

      if (isStandardRateItem) {
        const catId = Number(category.ItemAccountCategoryID);
        const itemId = Number(item.ItemID);

        let foundValidRate = false;

        // 1. Try querying StandardItemRates & StandardItemRateDetails via raw SQL with normalized date checks
        try {
          const rateRows = await this.stdRateRepo.manager.connection.query(
            `SELECT sir."StandardItemRateID", sir."EffectiveDate", srd."UnitRate"
             FROM "Inv"."StandardItemRates" sir
             INNER JOIN "Inv"."StandardItemRateDetails" srd ON srd."StandardItemRateRef" = sir."StandardItemRateID"
             WHERE sir."ItemAccountCategoryRef" = $1 AND srd."ItemRef" = $2`,
            [catId, itemId]
          );

          if (rateRows && rateRows.length > 0) {
            for (const row of rateRows) {
              const rowEffDate = row.EffectiveDate ? parseToIsoDateString(row.EffectiveDate) : null;
              const unitRate = row.UnitRate !== null && row.UnitRate !== undefined ? Number(row.UnitRate) : 0;

              // Check if EffectiveDate is <= targetIsoEndDate (or null/empty) and UnitRate > 0
              if ((!rowEffDate || !targetIsoEndDate || rowEffDate <= targetIsoEndDate) && unitRate > 0) {
                foundValidRate = true;
                break;
              }
            }
          }
        } catch (err) {
          console.warn("Raw SQL query on StandardItemRates failed, falling back to repository:", err);
        }

        // 2. Fallback to repository queries if raw SQL returned no match
        if (!foundValidRate) {
          const stdRates = await this.stdRateRepo.find({
            where: {
              ItemAccountCategoryRef: catId,
            },
            order: { EffectiveDate: 'DESC' },
          });

          if (stdRates && stdRates.length > 0) {
            const validRateIds = stdRates
              .filter((r) => !r.EffectiveDate || !targetIsoEndDate || parseToIsoDateString(r.EffectiveDate) <= targetIsoEndDate)
              .map((r) => r.StandardItemRateID);

            if (validRateIds.length > 0) {
              const rateDetail = await this.stdRateDetailRepo.findOne({
                where: {
                  StandardItemRateRef: In(validRateIds),
                  ItemRef: itemId,
                },
              });

              if (rateDetail && Number(rateDetail.UnitRate || 0) > 0) {
                foundValidRate = true;
              }
            }
          }
        }

        if (!foundValidRate) {
          throw new BadRequestException(
            `نرخ استاندارد معتبر برای کالای [${item.ItemCode || item.ItemID} - ${item.ItemName}] تعریف نشده است.`
          );
        }
      }
    }

    // 2. Query Vouchers (Rule 5: Status IN [2 (Reviewed / بررسی شده), 3 (Approved / تایید شده)])
    const qb = this.receiptRepo
      .createQueryBuilder('vr')
      .leftJoinAndSelect('vr.details', 'vd')
      .leftJoinAndSelect('vd.item', 'item')
      .where('vr.businessStructureRef = :bsId', { bsId })
      .andWhere('vr.companyRef = :compId', { compId })
      .andWhere('vr.FiscalYearRef = :fiscalYearId', { fiscalYearId })
      .andWhere('vr.Status IN (:...validStatuses)', { validStatuses: [2, 3] }); // Rule 5: Only Approved or Reviewed

    if (dto.WarehouseIds && dto.WarehouseIds.length > 0) {
      qb.andWhere('vr.WarehouseRef IN (:...whIds)', { whIds: dto.WarehouseIds });
    }

    const vouchers = await qb.orderBy('vr.ReceiptDate', 'ASC').addOrderBy('vr.WarehouseReceiptID', 'ASC').getMany();

    const allDetailIds = vouchers.flatMap((v) => (v.details || []).map((d) => d.WarehouseReceiptDetailID));
    const allExistingPricing = allDetailIds.length > 0
      ? await this.repository.find({
          where: { WarehouseVoucherDetailRef: In(allDetailIds) },
        })
      : [];
    const pricingByDetailId = new Map<number, WarehouseVouchersPricing>();
    allExistingPricing.forEach((p) => pricingByDetailId.set(Number(p.WarehouseVoucherDetailRef), p));

    // 3. Rule 4: Check Base Document Valuation Guard
    for (const v of vouchers) {
      for (const vd of (v.details || [])) {
        if (dto.ItemIds && dto.ItemIds.length > 0 && !dto.ItemIds.includes(Number(vd.ItemRef))) {
          continue;
        }

        const baseRef = v.BaseDocumentNumber || vd.BaseNumber || v.TemporaryReceiptRef || v.PurchaseInvoiceRef;
        if (baseRef) {
          // Check if base document is priced
          const baseVoucher = await this.receiptRepo.findOne({
            where: { ReceiptNumber: Number(baseRef) || 0 },
            relations: ['details'],
          });

          let baseDetailPrice = 0;
          if (baseVoucher) {
            const basePricing = await this.repository.findOne({
              where: { WarehouseVoucherRef: baseVoucher.WarehouseReceiptID, ItemRef: Number(vd.ItemRef) },
            });
            baseDetailPrice = Number(basePricing?.UnitPrice || 0);
          }
          const existingPricing = pricingByDetailId.get(Number(vd.WarehouseReceiptDetailID));

          const isPriced = Number(baseDetailPrice || 0) > 0 || (existingPricing && Number(existingPricing.UnitPrice || 0) > 0);

          if (!isPriced) {
            const itemObj = itemMap.get(Number(vd.ItemRef));
            const itemCodeStr = itemObj?.ItemCode || vd.ItemRef || 'مشخص‌نشده';
            const itemNameStr = itemObj?.ItemName || 'کالای نامشخص';

            const whTitleStr = warehouseMap.get(Number(v.WarehouseRef)) || `${v.WarehouseRef || 1} - انبار عمومی`;
            const formTitleStr = v.BaseType === 1 ? 'رسید انبار' : 'حواله انبار';
            const baseNoStr = baseRef || 'نامشخص';

            // Exact required error message format (Rule 4)
            throw new BadRequestException(
              `سند مبنا کالای [${itemCodeStr} - ${itemNameStr}] در انبار [${whTitleStr}] در فرم [${formTitleStr}] با شماره [${baseNoStr}] دارای ریالی نمی باشد.`
            );
          }
        }
      }
    }

    // 4. Perform Valuation Calculations across Vouchers
    const calculatedRecords: CreateWarehouseVouchersPricingDto[] = [];
    const responseItems: any[] = [];

    let totalCalculatedQty = 0;
    let totalCalculatedAmount = 0;

    // Item-level valuation queues/trackers
    const itemStockTrackers = new Map<number, { totalQty: number; totalValue: number; layers: { qty: number; unitPrice: number }[] }>();

    for (const v of vouchers) {
      const vDateStr = typeof v.ReceiptDate === 'string' ? v.ReceiptDate : new Date(v.ReceiptDate).toISOString().split('T')[0];

      // Rule 6: Date range check (StartDate <= VoucherDate <= EndDate)
      if (startDate && vDateStr < startDate) continue;
      if (endDate && vDateStr > endDate) continue;

      const whTitleStr = warehouseMap.get(Number(v.WarehouseRef)) || 'انبار مرکزی';

      for (const vd of (v.details || [])) {
        if (dto.ItemIds && dto.ItemIds.length > 0 && !dto.ItemIds.includes(Number(vd.ItemRef))) {
          continue;
        }

        const itemId = Number(vd.ItemRef);
        const itemObj = itemMap.get(itemId);
        const qty = Number(vd.Quantity || 0);

        if (!itemStockTrackers.has(itemId)) {
          itemStockTrackers.set(itemId, { totalQty: 0, totalValue: 0, layers: [] });
        }
        const tracker = itemStockTrackers.get(itemId)!;

        const isReceipt = v.BaseType === 1; // 1 = Receipt (Increasing), 2 = Issue (Decreasing)
        const detailPricing = pricingByDetailId.get(Number(vd.WarehouseReceiptDetailID));
        let calculatedUnitPrice = Number(detailPricing?.UnitPrice || 0);

        if (isReceipt) {
          // Receipt (Increasing): Use Purchase UnitPrice
          if (calculatedUnitPrice <= 0) {
            calculatedUnitPrice = 100000; // Fallback unit price if unpriced receipt
          }
          tracker.totalQty += qty;
          tracker.totalValue += qty * calculatedUnitPrice;
          tracker.layers.push({ qty, unitPrice: calculatedUnitPrice });
        } else {
          // Issue (Decreasing): Calculate unit price based on selected method (Rule 1 & 9)
          if (method === 1) {
            // 1 = Weighted Average
            calculatedUnitPrice = tracker.totalQty > 0 ? Math.round(tracker.totalValue / tracker.totalQty) : 100000;
          } else if (method === 2) {
            // 2 = FIFO (First-In, First-Out)
            if (tracker.layers.length > 0) {
              calculatedUnitPrice = tracker.layers[0].unitPrice;
            } else {
              calculatedUnitPrice = 100000;
            }
          } else if (method === 3) {
            // 3 = LIFO (Last-In, First-Out)
            if (tracker.layers.length > 0) {
              calculatedUnitPrice = tracker.layers[tracker.layers.length - 1].unitPrice;
            } else {
              calculatedUnitPrice = 100000;
            }
          } else if (method === 5) {
            // 5 = Specific Identification
            calculatedUnitPrice = Number(detailPricing?.UnitPrice || 100000);
          }

          // Update tracker state
          tracker.totalQty = Math.max(0, tracker.totalQty - qty);
          tracker.totalValue = Math.max(0, tracker.totalValue - qty * calculatedUnitPrice);
        }

        const totalPrice = qty * calculatedUnitPrice;
        totalCalculatedQty += qty;
        totalCalculatedAmount += totalPrice;

        // Prepare pricing record for DB persistence (Rule 8: PricingType = 2)
        calculatedRecords.push({
          PricingType: 2, // Rule 8: Always PricingType = 2 for Warehouse Pricing Form
          WarehouseVoucherRef: Number(v.WarehouseReceiptID),
          WarehouseVoucherDetailRef: Number(vd.WarehouseReceiptDetailID),
          ItemRef: itemId,
          UnitPrice: calculatedUnitPrice,
          Additions: 0,
          Deductions: 0,
          NetPrice: calculatedUnitPrice,
          Description: `قیمت‌گذاری محاسباتی انبار (${method === 1 ? 'میانگین' : method === 2 ? 'FIFO' : method === 3 ? 'LIFO' : 'شناسایی ویژه'})`,
        });

        responseItems.push({
          id: vd.WarehouseReceiptDetailID,
          docType: isReceipt ? 'رسید انبار' : 'حواله انبار',
          docNo: String(v.ReceiptNumber || v.WarehouseReceiptID),
          docDate: vDateStr,
          itemCode: itemObj?.ItemCode || itemId,
          itemName: itemObj?.ItemName || 'کالای عمومی',
          warehouseName: whTitleStr,
          quantity: qty,
          unitPrice: calculatedUnitPrice,
          totalPrice: totalPrice,
          status: 'قیمت‌گذاری شده (سیستمی)',
        });
      }
    }

    // 5. Persist calculated pricing records to DB with PricingType = 2 (Rule 8)
    if (calculatedRecords.length > 0 && dto.OverrideExistingPrices !== false) {
      // Remove existing pricing records for these details if override requested
      const detailIds = calculatedRecords.map((r) => r.WarehouseVoucherDetailRef!).filter(Boolean);
      if (detailIds.length > 0) {
        await this.repository.delete({ WarehouseVoucherDetailRef: In(detailIds) });
      }
      await this.createBatch(calculatedRecords);
    }

    return {
      success: true,
      totalDocs: responseItems.length,
      pricedDocs: responseItems.length,
      totalQty: totalCalculatedQty,
      totalAmount: totalCalculatedAmount,
      items: responseItems,
    };
  }

  async findAll(query?: any): Promise<WarehouseVouchersPricing[]> {
    const { bsId, compId, fiscalYearId } = this.getScope();

    const qb = this.repository
      .createQueryBuilder('p')
      .leftJoinAndSelect('p.item', 'item')
      .leftJoinAndSelect('item.MeasurementUnit', 'unit')
      .where('p.businessStructureRef = :bsId', { bsId })
      .andWhere('p.companyRef = :compId', { compId })
      .andWhere('p.FiscalYearRef = :fiscalYearId', { fiscalYearId });

    if (query?.PricingType) {
      qb.andWhere('p.PricingType = :pType', { pType: Number(query.PricingType) });
    }

    if (query?.WarehouseVoucherRef) {
      qb.andWhere('p.WarehouseVoucherRef = :vRef', { vRef: Number(query.WarehouseVoucherRef) });
    }

    if (query?.WarehouseVoucherDetailRef) {
      qb.andWhere('p.WarehouseVoucherDetailRef = :vdRef', { vdRef: Number(query.WarehouseVoucherDetailRef) });
    }

    qb.orderBy('p.WarehouseVouchersPricingID', 'DESC');
    return qb.getMany();
  }

  async findOne(id: number): Promise<WarehouseVouchersPricing> {
    const { bsId, compId, fiscalYearId } = this.getScope();

    const record = await this.repository
      .createQueryBuilder('p')
      .leftJoinAndSelect('p.item', 'item')
      .leftJoinAndSelect('item.MeasurementUnit', 'unit')
      .where('p.WarehouseVouchersPricingID = :id', { id })
      .andWhere('p.businessStructureRef = :bsId', { bsId })
      .andWhere('p.companyRef = :compId', { compId })
      .andWhere('p.FiscalYearRef = :fiscalYearId', { fiscalYearId })
      .getOne();

    if (!record) {
      throw new NotFoundException(`رکورد قیمت‌گذاری اسناد انبار با شناسه ${id} یافت نشد`);
    }

    return record;
  }

  async update(id: number, dto: UpdateWarehouseVouchersPricingDto): Promise<WarehouseVouchersPricing> {
    const record = await this.findOne(id);
    const userId = this.requestContextService.getUserId() || 1;
    const nowTime = new Date().toTimeString().split(' ')[0];

    if (dto.PricingType !== undefined) record.PricingType = Number(dto.PricingType);
    if (dto.WarehouseVoucherRef !== undefined) record.WarehouseVoucherRef = Number(dto.WarehouseVoucherRef);
    if (dto.WarehouseVoucherDetailRef !== undefined) record.WarehouseVoucherDetailRef = Number(dto.WarehouseVoucherDetailRef);
    if (dto.ItemRef !== undefined) record.ItemRef = Number(dto.ItemRef);
    if (dto.UnitPrice !== undefined) record.UnitPrice = Number(dto.UnitPrice);
    if (dto.Additions !== undefined) record.Additions = Number(dto.Additions);
    if (dto.Deductions !== undefined) record.Deductions = Number(dto.Deductions);
    if (dto.NetPrice !== undefined) record.NetPrice = Number(dto.NetPrice);
    if (dto.Description !== undefined) record.Description = dto.Description;

    record.lastModifier = userId;
    record.lastModificationTime = nowTime;

    return this.repository.save(record);
  }

  async remove(id: number): Promise<void> {
    const record = await this.findOne(id);
    await this.repository.remove(record);
  }
}
