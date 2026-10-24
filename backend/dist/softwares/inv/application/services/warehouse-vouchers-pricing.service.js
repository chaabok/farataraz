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
exports.WarehouseVouchersPricingService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const warehouse_vouchers_pricing_entity_1 = require("../../domain/entities/warehouse-vouchers-pricing.entity");
const id_generation_service_1 = require("../../../../core/services/id-generation.service");
const request_context_service_1 = require("../../../../core/services/request-context.service");
const date_parser_1 = require("../../../../core/utils/date-parser");
const warehouse_receipt_entity_1 = require("../../domain/entities/warehouse-receipt.entity");
const warehouse_receipt_detail_entity_1 = require("../../domain/entities/warehouse-receipt-detail.entity");
const item_entity_1 = require("../../domain/entities/item.entity");
const item_account_category_entity_1 = require("../../domain/entities/item-account-category.entity");
const standard_item_rate_entity_1 = require("../../domain/entities/standard-item-rate.entity");
const standard_item_rate_detail_entity_1 = require("../../domain/entities/standard-item-rate-detail.entity");
const warehouse_entity_1 = require("../../domain/entities/warehouse.entity");
let WarehouseVouchersPricingService = class WarehouseVouchersPricingService {
    constructor(repository, receiptRepo, receiptDetailRepo, itemRepo, categoryRepo, stdRateRepo, stdRateDetailRepo, warehouseRepo, idGenService, requestContextService) {
        this.repository = repository;
        this.receiptRepo = receiptRepo;
        this.receiptDetailRepo = receiptDetailRepo;
        this.itemRepo = itemRepo;
        this.categoryRepo = categoryRepo;
        this.stdRateRepo = stdRateRepo;
        this.stdRateDetailRepo = stdRateDetailRepo;
        this.warehouseRepo = warehouseRepo;
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
    async create(dto) {
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
            PricingType: Number(dto.PricingType || 2),
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
    async createBatch(dtos) {
        if (!dtos || dtos.length === 0)
            return [];
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
                PricingType: Number(dto.PricingType || 2),
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
    async calculatePricing(dto) {
        const method = Number(dto.ValuationMethod || 1);
        if (method === 4) {
            throw new common_1.BadRequestException('روش نرخ استاندارد در فرم قیمت‌گذاری اسناد انبار مورد ارزیابی قرار نمی‌گیرد و بر اساس طبقه حساب کالا مستقیماً اعمال می‌گردد.');
        }
        const { bsId, compId, fiscalYearId } = this.getScope();
        const userId = this.requestContextService.getUserId() || 1;
        const nowTime = new Date().toTimeString().split(' ')[0];
        const startDate = dto.StartDate || '1400/01/01';
        const endDate = dto.EndDate || '1499/12/29';
        const warehouseFilter = dto.WarehouseIds && dto.WarehouseIds.length > 0 ? { WarehouseID: (0, typeorm_2.In)(dto.WarehouseIds) } : {};
        const warehouses = await this.warehouseRepo.find({ where: warehouseFilter });
        const warehouseMap = new Map();
        warehouses.forEach((w) => warehouseMap.set(Number(w.WarehouseID), `${w.WarehouseCode || w.WarehouseID} - ${w.WarehouseTitle || ''}`));
        const itemFilter = dto.ItemIds && dto.ItemIds.length > 0 ? { ItemID: (0, typeorm_2.In)(dto.ItemIds), ItemType: 1 } : { ItemType: 1 };
        const items = await this.itemRepo.find({ where: itemFilter, relations: ['ItemAccountCategory', 'MeasurementUnit'] });
        const itemMap = new Map();
        items.forEach((i) => itemMap.set(Number(i.ItemID), i));
        const targetIsoEndDate = (0, date_parser_1.parseToIsoDateString)(endDate) || endDate;
        for (const item of items) {
            const category = item.ItemAccountCategory;
            const isStandardRateItem = category && (Number(category.PricingMethod) === 4 || Number(category.StandardRate) === 1);
            if (isStandardRateItem) {
                const catId = Number(category.ItemAccountCategoryID);
                const itemId = Number(item.ItemID);
                let foundValidRate = false;
                try {
                    const rateRows = await this.stdRateRepo.manager.connection.query(`SELECT sir."StandardItemRateID", sir."EffectiveDate", srd."UnitRate"
             FROM "Inv"."StandardItemRates" sir
             INNER JOIN "Inv"."StandardItemRateDetails" srd ON srd."StandardItemRateRef" = sir."StandardItemRateID"
             WHERE sir."ItemAccountCategoryRef" = $1 AND srd."ItemRef" = $2`, [catId, itemId]);
                    if (rateRows && rateRows.length > 0) {
                        for (const row of rateRows) {
                            const rowEffDate = row.EffectiveDate ? (0, date_parser_1.parseToIsoDateString)(row.EffectiveDate) : null;
                            const unitRate = row.UnitRate !== null && row.UnitRate !== undefined ? Number(row.UnitRate) : 0;
                            if ((!rowEffDate || !targetIsoEndDate || rowEffDate <= targetIsoEndDate) && unitRate > 0) {
                                foundValidRate = true;
                                break;
                            }
                        }
                    }
                }
                catch (err) {
                    console.warn("Raw SQL query on StandardItemRates failed, falling back to repository:", err);
                }
                if (!foundValidRate) {
                    const stdRates = await this.stdRateRepo.find({
                        where: {
                            ItemAccountCategoryRef: catId,
                        },
                        order: { EffectiveDate: 'DESC' },
                    });
                    if (stdRates && stdRates.length > 0) {
                        const validRateIds = stdRates
                            .filter((r) => !r.EffectiveDate || !targetIsoEndDate || (0, date_parser_1.parseToIsoDateString)(r.EffectiveDate) <= targetIsoEndDate)
                            .map((r) => r.StandardItemRateID);
                        if (validRateIds.length > 0) {
                            const rateDetail = await this.stdRateDetailRepo.findOne({
                                where: {
                                    StandardItemRateRef: (0, typeorm_2.In)(validRateIds),
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
                    throw new common_1.BadRequestException(`نرخ استاندارد معتبر برای کالای [${item.ItemCode || item.ItemID} - ${item.ItemName}] تعریف نشده است.`);
                }
            }
        }
        const qb = this.receiptRepo
            .createQueryBuilder('vr')
            .leftJoinAndSelect('vr.details', 'vd')
            .leftJoinAndSelect('vd.item', 'item')
            .where('vr.businessStructureRef = :bsId', { bsId })
            .andWhere('vr.companyRef = :compId', { compId })
            .andWhere('vr.FiscalYearRef = :fiscalYearId', { fiscalYearId })
            .andWhere('vr.Status IN (:...validStatuses)', { validStatuses: [2, 3] });
        if (dto.WarehouseIds && dto.WarehouseIds.length > 0) {
            qb.andWhere('vr.WarehouseRef IN (:...whIds)', { whIds: dto.WarehouseIds });
        }
        const vouchers = await qb.orderBy('vr.ReceiptDate', 'ASC').addOrderBy('vr.WarehouseReceiptID', 'ASC').getMany();
        const allDetailIds = vouchers.flatMap((v) => (v.details || []).map((d) => d.WarehouseReceiptDetailID));
        const allExistingPricing = allDetailIds.length > 0
            ? await this.repository.find({
                where: { WarehouseVoucherDetailRef: (0, typeorm_2.In)(allDetailIds) },
            })
            : [];
        const pricingByDetailId = new Map();
        allExistingPricing.forEach((p) => pricingByDetailId.set(Number(p.WarehouseVoucherDetailRef), p));
        for (const v of vouchers) {
            for (const vd of (v.details || [])) {
                if (dto.ItemIds && dto.ItemIds.length > 0 && !dto.ItemIds.includes(Number(vd.ItemRef))) {
                    continue;
                }
                const baseRef = v.BaseDocumentNumber || vd.BaseNumber || v.TemporaryReceiptRef || v.PurchaseInvoiceRef;
                if (baseRef) {
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
                        throw new common_1.BadRequestException(`سند مبنا کالای [${itemCodeStr} - ${itemNameStr}] در انبار [${whTitleStr}] در فرم [${formTitleStr}] با شماره [${baseNoStr}] دارای ریالی نمی باشد.`);
                    }
                }
            }
        }
        const calculatedRecords = [];
        const responseItems = [];
        let totalCalculatedQty = 0;
        let totalCalculatedAmount = 0;
        const itemStockTrackers = new Map();
        for (const v of vouchers) {
            const vDateStr = typeof v.ReceiptDate === 'string' ? v.ReceiptDate : new Date(v.ReceiptDate).toISOString().split('T')[0];
            if (startDate && vDateStr < startDate)
                continue;
            if (endDate && vDateStr > endDate)
                continue;
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
                const tracker = itemStockTrackers.get(itemId);
                const isReceipt = v.BaseType === 1;
                const detailPricing = pricingByDetailId.get(Number(vd.WarehouseReceiptDetailID));
                let calculatedUnitPrice = Number(detailPricing?.UnitPrice || 0);
                if (isReceipt) {
                    if (calculatedUnitPrice <= 0) {
                        calculatedUnitPrice = 100000;
                    }
                    tracker.totalQty += qty;
                    tracker.totalValue += qty * calculatedUnitPrice;
                    tracker.layers.push({ qty, unitPrice: calculatedUnitPrice });
                }
                else {
                    if (method === 1) {
                        calculatedUnitPrice = tracker.totalQty > 0 ? Math.round(tracker.totalValue / tracker.totalQty) : 100000;
                    }
                    else if (method === 2) {
                        if (tracker.layers.length > 0) {
                            calculatedUnitPrice = tracker.layers[0].unitPrice;
                        }
                        else {
                            calculatedUnitPrice = 100000;
                        }
                    }
                    else if (method === 3) {
                        if (tracker.layers.length > 0) {
                            calculatedUnitPrice = tracker.layers[tracker.layers.length - 1].unitPrice;
                        }
                        else {
                            calculatedUnitPrice = 100000;
                        }
                    }
                    else if (method === 5) {
                        calculatedUnitPrice = Number(detailPricing?.UnitPrice || 100000);
                    }
                    tracker.totalQty = Math.max(0, tracker.totalQty - qty);
                    tracker.totalValue = Math.max(0, tracker.totalValue - qty * calculatedUnitPrice);
                }
                const totalPrice = qty * calculatedUnitPrice;
                totalCalculatedQty += qty;
                totalCalculatedAmount += totalPrice;
                calculatedRecords.push({
                    PricingType: 2,
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
        if (calculatedRecords.length > 0 && dto.OverrideExistingPrices !== false) {
            const detailIds = calculatedRecords.map((r) => r.WarehouseVoucherDetailRef).filter(Boolean);
            if (detailIds.length > 0) {
                await this.repository.delete({ WarehouseVoucherDetailRef: (0, typeorm_2.In)(detailIds) });
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
    async findAll(query) {
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
    async findOne(id) {
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
            throw new common_1.NotFoundException(`رکورد قیمت‌گذاری اسناد انبار با شناسه ${id} یافت نشد`);
        }
        return record;
    }
    async update(id, dto) {
        const record = await this.findOne(id);
        const userId = this.requestContextService.getUserId() || 1;
        const nowTime = new Date().toTimeString().split(' ')[0];
        if (dto.PricingType !== undefined)
            record.PricingType = Number(dto.PricingType);
        if (dto.WarehouseVoucherRef !== undefined)
            record.WarehouseVoucherRef = Number(dto.WarehouseVoucherRef);
        if (dto.WarehouseVoucherDetailRef !== undefined)
            record.WarehouseVoucherDetailRef = Number(dto.WarehouseVoucherDetailRef);
        if (dto.ItemRef !== undefined)
            record.ItemRef = Number(dto.ItemRef);
        if (dto.UnitPrice !== undefined)
            record.UnitPrice = Number(dto.UnitPrice);
        if (dto.Additions !== undefined)
            record.Additions = Number(dto.Additions);
        if (dto.Deductions !== undefined)
            record.Deductions = Number(dto.Deductions);
        if (dto.NetPrice !== undefined)
            record.NetPrice = Number(dto.NetPrice);
        if (dto.Description !== undefined)
            record.Description = dto.Description;
        record.lastModifier = userId;
        record.lastModificationTime = nowTime;
        return this.repository.save(record);
    }
    async remove(id) {
        const record = await this.findOne(id);
        await this.repository.remove(record);
    }
};
exports.WarehouseVouchersPricingService = WarehouseVouchersPricingService;
exports.WarehouseVouchersPricingService = WarehouseVouchersPricingService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(warehouse_vouchers_pricing_entity_1.WarehouseVouchersPricing)),
    __param(1, (0, typeorm_1.InjectRepository)(warehouse_receipt_entity_1.WarehouseReceipt)),
    __param(2, (0, typeorm_1.InjectRepository)(warehouse_receipt_detail_entity_1.WarehouseReceiptDetail)),
    __param(3, (0, typeorm_1.InjectRepository)(item_entity_1.Item)),
    __param(4, (0, typeorm_1.InjectRepository)(item_account_category_entity_1.ItemAccountCategory)),
    __param(5, (0, typeorm_1.InjectRepository)(standard_item_rate_entity_1.StandardItemRate)),
    __param(6, (0, typeorm_1.InjectRepository)(standard_item_rate_detail_entity_1.StandardItemRateDetail)),
    __param(7, (0, typeorm_1.InjectRepository)(warehouse_entity_1.Warehouse)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        id_generation_service_1.IdGenerationService,
        request_context_service_1.RequestContextService])
], WarehouseVouchersPricingService);
//# sourceMappingURL=warehouse-vouchers-pricing.service.js.map