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
exports.StocktakingTagService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const stocktaking_tag_header_entity_1 = require("../../domain/entities/stocktaking-tag-header.entity");
const stocktaking_tag_detail_entity_1 = require("../../domain/entities/stocktaking-tag-detail.entity");
const stocktaking_tag_entity_1 = require("../../domain/entities/stocktaking-tag.entity");
const stocktaking_setting_entity_1 = require("../../domain/entities/stocktaking-setting.entity");
const stocktaking_setting_warehouse_entity_1 = require("../../domain/entities/stocktaking-setting-warehouse.entity");
const item_physical_location_entity_1 = require("../../domain/entities/item-physical-location.entity");
const item_entity_1 = require("../../domain/entities/item.entity");
const warehouse_entity_1 = require("../../domain/entities/warehouse.entity");
const id_generation_service_1 = require("../../../../core/services/id-generation.service");
let StocktakingTagService = class StocktakingTagService {
    constructor(headerRepo, detailRepo, tagRepo, settingWhRepo, itemLocationRepo, itemRepo, warehouseRepo, idGenService) {
        this.headerRepo = headerRepo;
        this.detailRepo = detailRepo;
        this.tagRepo = tagRepo;
        this.settingWhRepo = settingWhRepo;
        this.itemLocationRepo = itemLocationRepo;
        this.itemRepo = itemRepo;
        this.warehouseRepo = warehouseRepo;
        this.idGenService = idGenService;
    }
    async findAll() {
        const list = await this.headerRepo.find({
            relations: ['stocktakingSetting', 'officerParty', 'details'],
            order: { StocktakingTagHeaderID: 'DESC' },
        });
        return list.map((h) => {
            let officerName = '';
            if (h.officerParty) {
                officerName = `${h.officerParty.firstName || ''} ${h.officerParty.lastName || ''}`.trim() || h.officerParty.lastName || h.officerParty.firstName || '';
            }
            const methodName = h.stocktakingSetting?.MethodName || '';
            return {
                ...h,
                StocktakingPeriod: h.StocktakingPeriod || '',
                stocktakingPeriod: h.StocktakingPeriod || '',
                OfficerName: officerName,
                officerName: officerName,
                MethodName: methodName,
                methodName: methodName,
                Description: h.Description || '',
                description: h.Description || '',
            };
        });
    }
    async getNextHeaderNumber(fiscalYearId) {
        const qb = this.headerRepo
            .createQueryBuilder('h')
            .select('MAX(h.StocktakingNumber)', 'max');
        if (fiscalYearId) {
            qb.andWhere('h.FiscalYearRef = :fiscalYearId', { fiscalYearId });
        }
        const maxResult = await qb.getRawOne();
        const maxVal = maxResult?.max ? parseInt(maxResult.max, 10) : 0;
        return { nextNumber: maxVal + 1 };
    }
    normalizeDate(dStr) {
        if (!dStr)
            return '';
        const cleaned = String(dStr).trim().slice(0, 10).replace(/-/g, '/');
        const parts = cleaned.split('/');
        if (parts.length === 3) {
            const y = parts[0];
            const m = parts[1].padStart(2, '0');
            const d = parts[2].padStart(2, '0');
            return `${y}/${m}/${d}`;
        }
        return cleaned;
    }
    async getLatestStocktaking(fiscalYearId, excludeHeaderId) {
        const qb = this.headerRepo.createQueryBuilder('h');
        if (fiscalYearId && !isNaN(fiscalYearId) && fiscalYearId > 0) {
            qb.andWhere('(h.FiscalYearRef = :fiscalYearId OR h.FiscalYearRef IS NULL)', { fiscalYearId });
        }
        if (excludeHeaderId && !isNaN(excludeHeaderId) && excludeHeaderId > 0) {
            qb.andWhere('h.StocktakingTagHeaderID != :excludeHeaderId', { excludeHeaderId });
        }
        qb.orderBy('h.StocktakingDate', 'DESC')
            .addOrderBy('h.StocktakingNumber', 'DESC')
            .addOrderBy('h.StocktakingTagHeaderID', 'DESC');
        const headers = await qb.getMany();
        if (!headers || headers.length === 0) {
            return { latestDate: null, count: 0, header: null };
        }
        headers.sort((a, b) => {
            const normA = this.normalizeDate(a.StocktakingDate);
            const normB = this.normalizeDate(b.StocktakingDate);
            if (normA !== normB) {
                return normB.localeCompare(normA);
            }
            return Number(b.StocktakingTagHeaderID) - Number(a.StocktakingTagHeaderID);
        });
        const top = headers[0];
        return {
            latestDate: top.StocktakingDate,
            count: headers.length,
            header: {
                StocktakingTagHeaderID: top.StocktakingTagHeaderID,
                StocktakingNumber: top.StocktakingNumber,
                StocktakingPeriod: top.StocktakingPeriod,
                StocktakingDate: top.StocktakingDate,
            },
        };
    }
    async findOne(id, manager) {
        const numId = Number(id);
        if (!numId || isNaN(numId)) {
            throw new common_1.NotFoundException(`Stocktaking Tag Header #${id} not found`);
        }
        const repo = manager ? manager.getRepository(stocktaking_tag_header_entity_1.StocktakingTagHeader) : this.headerRepo;
        const header = await repo.findOne({
            where: { StocktakingTagHeaderID: numId },
            relations: ['stocktakingSetting', 'officerParty', 'details', 'details.item', 'details.warehouse'],
        });
        if (!header) {
            throw new common_1.NotFoundException(`Stocktaking Tag Header #${id} not found`);
        }
        return header;
    }
    async getWarehousesForSetting(settingId, headerId) {
        let sId = settingId ? Number(settingId) : 0;
        const hId = headerId && Number(headerId) > 0 ? Number(headerId) : undefined;
        if ((!sId || sId <= 0) && hId) {
            const header = await this.headerRepo.findOne({
                where: { StocktakingTagHeaderID: hId },
            });
            if (header && header.StocktakingSettingRef) {
                sId = Number(header.StocktakingSettingRef);
            }
        }
        const addedWhIds = new Set();
        const results = [];
        if (sId > 0) {
            const settingWhs = await this.settingWhRepo.find({
                where: { StocktakingSettingRef: sId },
                relations: ['warehouse'],
            });
            if (settingWhs && settingWhs.length > 0) {
                for (const sw of settingWhs) {
                    const whId = Number(sw.WarehouseRef);
                    if (whId > 0)
                        addedWhIds.add(whId);
                }
            }
        }
        if (hId) {
            const existingDetails = await this.detailRepo.find({
                where: { StocktakingTagHeaderRef: hId },
            });
            for (const d of existingDetails) {
                const whId = Number(d.WarehouseRef);
                if (whId > 0)
                    addedWhIds.add(whId);
            }
        }
        if (addedWhIds.size === 0) {
            if (sId <= 0) {
                const firstSettings = await this.settingWhRepo.find({
                    take: 1,
                    relations: ['warehouse'],
                });
                if (firstSettings.length > 0 && firstSettings[0].WarehouseRef) {
                    addedWhIds.add(Number(firstSettings[0].WarehouseRef));
                }
            }
        }
        for (const whId of addedWhIds) {
            const wh = await this.warehouseRepo.findOne({
                where: { WarehouseID: whId },
            });
            if (!wh) {
                continue;
            }
            const issuedCount = hId
                ? await this.detailRepo.count({
                    where: {
                        StocktakingTagHeaderRef: hId,
                        WarehouseRef: whId,
                    },
                })
                : 0;
            results.push({
                WarehouseID: whId,
                Code: String(wh?.WarehouseCode || wh?.Code || whId),
                Title: String(wh?.WarehouseTitle ||
                    wh?.WarehouseName ||
                    wh?.Title ||
                    `انبار ${whId}`),
                Type: wh?.IsActive !== false ? 'فعال' : 'غیرفعال',
                issuedTagCount: issuedCount,
            });
        }
        return results;
    }
    async getWarehouseItems(warehouseId, settingId, headerId) {
        const rawWhId = Number(warehouseId);
        let effectiveSettingId = settingId ? Number(settingId) : 0;
        const hId = headerId && Number(headerId) > 0 ? Number(headerId) : undefined;
        if ((!effectiveSettingId || effectiveSettingId <= 0) && hId) {
            const header = await this.headerRepo.findOne({
                where: { StocktakingTagHeaderID: hId },
            });
            if (header && header.StocktakingSettingRef) {
                effectiveSettingId = Number(header.StocktakingSettingRef);
            }
        }
        let settingObj = null;
        if (effectiveSettingId > 0) {
            settingObj = await this.headerRepo.manager.getRepository(stocktaking_setting_entity_1.StocktakingSetting).findOne({
                where: { StocktakingSettingID: effectiveSettingId },
            });
        }
        const minQty = settingObj ? Number(settingObj.Count1MinQty || 0) : 0;
        const minRial = settingObj ? Number(settingObj.Count1MinRial || 0) : 0;
        const minTurnover = settingObj ? Number(settingObj.Count1MinTurnover || 0) : 0;
        const hasCount1Filters = minQty > 0 || minRial > 0 || minTurnover > 0;
        let targetWhIds = [];
        if (rawWhId <= 0) {
            const summaries = await this.getWarehousesForSetting(effectiveSettingId, hId);
            targetWhIds = summaries.map((s) => s.WarehouseID).filter((id) => id > 0);
        }
        else {
            targetWhIds = [rawWhId];
        }
        if (targetWhIds.length === 0) {
            return [];
        }
        const allItemsCombined = [];
        for (const whId of targetWhIds) {
            const locations = await this.itemLocationRepo.find({
                where: { WarehouseRef: whId },
                relations: ['Item', 'Item.MeasurementUnit'],
            });
            let itemsList = [];
            if (locations && locations.length > 0) {
                itemsList = locations
                    .filter((loc) => loc && loc.ItemRef)
                    .map((loc) => {
                    const itemObj = loc.Item || {};
                    return {
                        ItemID: Number(loc.ItemRef),
                        Code: String(itemObj.ItemCode || itemObj.Code || loc.ItemRef),
                        Title: itemObj.ItemName || itemObj.Title || '',
                        MeasurementUnitName: itemObj.MeasurementUnit?.MeasurementUnitName || 'عدد',
                        WarehouseID: whId,
                    };
                })
                    .filter((i) => i.ItemID > 0);
            }
            if (itemsList.length === 0) {
                const whProducts = await this.warehouseRepo.manager
                    .query(`SELECT wp.*, i."ItemID", i."ItemCode", i."ItemName", mu."MeasurementUnitName"
             FROM "Inv"."WarehouseProducts" wp
             LEFT JOIN "Inv"."Items" i ON CAST(i."ItemCode" AS text) = wp."ProductCode" OR CAST(i."ItemID" AS text) = wp."ProductCode"
             LEFT JOIN "Inv"."MeasurementUnits" mu ON mu."MeasurementUnitID" = i."MeasurementUnitRef"
             WHERE wp."WarehouseRef" = $1`, [whId])
                    .catch(() => []);
                if (whProducts && whProducts.length > 0) {
                    itemsList = whProducts
                        .filter((wp) => wp && (wp.ItemID || wp.ProductCode))
                        .map((wp) => ({
                        ItemID: Number(wp.ItemID || wp.WarehouseProductID),
                        Code: String(wp.ItemCode || wp.ProductCode || wp.WarehouseProductID),
                        Title: wp.ItemName || wp.ProductTitle || '',
                        MeasurementUnitName: wp.MeasurementUnitName || 'عدد',
                        WarehouseID: whId,
                    }));
                }
            }
            if (itemsList.length === 0) {
                const allItems = await this.itemRepo.find({
                    relations: ['MeasurementUnit'],
                    order: { ItemID: 'ASC' },
                });
                itemsList = (allItems || []).map((item) => ({
                    ItemID: Number(item.ItemID),
                    Code: String(item.ItemCode || item.Code || item.ItemID),
                    Title: String(item.ItemName || item.Title || `کالای ${item.ItemID}`),
                    MeasurementUnitName: item.MeasurementUnit?.MeasurementUnitName || 'عدد',
                    WarehouseID: whId,
                }));
            }
            const tagMap = new Map();
            if (hId) {
                const existingTags = await this.detailRepo.find({
                    where: {
                        StocktakingTagHeaderRef: hId,
                        WarehouseRef: whId,
                    },
                    relations: ['item', 'item.MeasurementUnit'],
                });
                const existingItemIdsInList = new Set(itemsList.map((i) => i.ItemID));
                existingTags.forEach((t) => {
                    const itemRef = Number(t.ItemRef);
                    if (t.TagNumber !== null && t.TagNumber !== undefined && String(t.TagNumber).trim() !== '') {
                        tagMap.set(itemRef, String(t.TagNumber).trim());
                    }
                    if (itemRef > 0 && !existingItemIdsInList.has(itemRef)) {
                        existingItemIdsInList.add(itemRef);
                        const itemObj = t.item || {};
                        itemsList.push({
                            ItemID: itemRef,
                            Code: String(itemObj.ItemCode || itemObj.Code || itemRef),
                            Title: itemObj.ItemName || itemObj.Title || `کالای ${itemRef}`,
                            MeasurementUnitName: itemObj.MeasurementUnit?.MeasurementUnitName || 'عدد',
                            WarehouseID: whId,
                        });
                    }
                });
            }
            if (hasCount1Filters) {
                const statsRows = await this.warehouseRepo.manager
                    .query(`SELECT 
              COALESCE(i."ItemID", d."ItemRef") AS "ItemRef",
              COUNT(d."WarehouseReceiptDetailID") AS "turnoverCount",
              SUM(CASE WHEN COALESCE(t."WarehouseDocumentNature", v."BaseType", 1) = 1 THEN COALESCE(d."Quantity", 0) ELSE -COALESCE(d."Quantity", 0) END) AS "balanceQty",
              SUM(CASE WHEN COALESCE(t."WarehouseDocumentNature", v."BaseType", 1) = 1 THEN COALESCE(d."Quantity", 0) ELSE 0 END) AS "inQty",
              SUM(CASE WHEN COALESCE(t."WarehouseDocumentNature", v."BaseType", 1) = 1 
                  THEN (
                    CASE 
                      WHEN COALESCE(pr."NetPrice", pr."UnitPrice", 0) > 0 
                        THEN COALESCE(d."Quantity", 0) * COALESCE(pr."NetPrice", pr."UnitPrice", 0)
                      WHEN COALESCE(d."TotalPrice", 0) > 0 
                        THEN COALESCE(d."TotalPrice", 0)
                      ELSE COALESCE(d."Quantity", 0) * COALESCE(d."UnitPrice", 0)
                    END
                  )
                  ELSE 0 END) AS "inAmount",
              SUM(CASE WHEN COALESCE(t."WarehouseDocumentNature", v."BaseType", 1) = 2 
                  THEN (
                    CASE 
                      WHEN COALESCE(pr."NetPrice", pr."UnitPrice", 0) > 0 
                        THEN COALESCE(d."Quantity", 0) * COALESCE(pr."NetPrice", pr."UnitPrice", 0)
                      WHEN COALESCE(d."TotalPrice", 0) > 0 
                        THEN COALESCE(d."TotalPrice", 0)
                      ELSE COALESCE(d."Quantity", 0) * COALESCE(d."UnitPrice", 0)
                    END
                  )
                  ELSE 0 END) AS "outAmount",
              MAX(COALESCE(pr."NetPrice", pr."UnitPrice", d."UnitPrice", 0)) AS "maxUnitPrice"
             FROM "Inv"."WarehouseVouchersDetails" d
             JOIN "Inv"."WarehouseVouchers" v ON v."WarehouseReceiptID" = d."WarehouseReceiptRef"
             LEFT JOIN "Inv"."Items" i ON (i."ItemID" = d."ItemRef" OR i."ItemCode"::text = d."ItemRef"::text)
             LEFT JOIN LATERAL (
               SELECT pr."UnitPrice", pr."NetPrice", pr."WarehouseVouchersPricingID"
               FROM "Inv"."WarehouseVouchersPricing" pr
               WHERE pr."WarehouseVoucherDetailRef" = d."WarehouseReceiptDetailID"
                  OR (pr."WarehouseVoucherRef" = v."WarehouseReceiptID" AND (pr."ItemRef" = d."ItemRef" OR pr."ItemRef" = i."ItemID"))
               ORDER BY 
                 CASE WHEN pr."WarehouseVoucherDetailRef" = d."WarehouseReceiptDetailID" THEN 1 ELSE 2 END,
                 pr."WarehouseVouchersPricingID" DESC
               LIMIT 1
             ) pr ON TRUE
             LEFT JOIN "Inv"."WarehouseDocumentTypes" t ON t."WarehouseDocumentTypeID" = v."WarehouseDocumentTypeRef"
             WHERE (d."WarehouseRef" = $1 OR v."WarehouseRef" = $1)
             GROUP BY COALESCE(i."ItemID", d."ItemRef")`, [whId])
                    .catch((err) => {
                    console.error('Failed to calculate stock stats for stocktaking tag:', err);
                    return [];
                });
                const stdRateRows = await this.warehouseRepo.manager
                    .query(`SELECT srd."ItemRef", MAX(srd."UnitRate") AS "stdUnitRate"
             FROM "Inv"."StandardItemRates" sir
             INNER JOIN "Inv"."StandardItemRateDetails" srd ON srd."StandardItemRateRef" = sir."StandardItemRateID"
             GROUP BY srd."ItemRef"`)
                    .catch(() => []);
                const stdRateMap = new Map();
                for (const sr of stdRateRows) {
                    if (sr.ItemRef) {
                        stdRateMap.set(Number(sr.ItemRef), Number(sr.stdUnitRate || 0));
                    }
                }
                const statsMap = new Map();
                for (const row of statsRows) {
                    const itemRef = Number(row.ItemRef);
                    if (!itemRef)
                        continue;
                    const bQty = Number(row.balanceQty || 0);
                    const inQ = Number(row.inQty || 0);
                    const inAmt = Number(row.inAmount || 0);
                    const outAmt = Number(row.outAmount || 0);
                    const tCount = Number(row.turnoverCount || 0);
                    const maxPrice = Number(row.maxUnitPrice || 0);
                    let bRial = 0;
                    if (bQty > 0) {
                        if (inQ > 0 && inAmt > 0) {
                            bRial = bQty * (inAmt / inQ);
                        }
                        else if (inAmt > outAmt && (inAmt - outAmt) > 0) {
                            bRial = inAmt - outAmt;
                        }
                        else if (maxPrice > 0) {
                            bRial = bQty * maxPrice;
                        }
                        else if (stdRateMap.has(itemRef) && stdRateMap.get(itemRef) > 0) {
                            bRial = bQty * stdRateMap.get(itemRef);
                        }
                    }
                    statsMap.set(itemRef, {
                        balanceQty: bQty,
                        balanceRial: bRial,
                        turnoverCount: tCount,
                    });
                }
                itemsList = itemsList.filter((item) => {
                    if (tagMap.has(Number(item.ItemID))) {
                        return true;
                    }
                    const itemStat = statsMap.get(Number(item.ItemID))
                        || statsMap.get(Number(item.Code))
                        || { balanceQty: 0, balanceRial: 0, turnoverCount: 0 };
                    if (minQty > 0 && itemStat.balanceQty < minQty) {
                        return false;
                    }
                    if (minRial > 0 && itemStat.balanceRial < minRial) {
                        return false;
                    }
                    if (minTurnover > 0 && itemStat.turnoverCount < minTurnover) {
                        return false;
                    }
                    return true;
                });
            }
            const warehouseMappedItems = itemsList.map((item) => {
                const tagNumber = tagMap.get(Number(item.ItemID));
                return {
                    ...item,
                    WarehouseID: whId,
                    TagNumber: tagNumber || null,
                    IsIssued: Boolean(tagNumber),
                };
            });
            allItemsCombined.push(...warehouseMappedItems);
        }
        return allItemsCombined;
    }
    parseBigIntSafe(val, defaultVal = null) {
        if (val === null || val === undefined || val === '')
            return defaultVal;
        if (typeof val === 'number') {
            return isNaN(val) ? defaultVal : val;
        }
        const parsed = parseInt(String(val), 10);
        return isNaN(parsed) ? defaultVal : parsed;
    }
    extractValidDetails(rawDetails) {
        if (!Array.isArray(rawDetails))
            return [];
        const result = [];
        for (const d of rawDetails) {
            if (!d)
                continue;
            const rawWh = d.WarehouseRef ?? d.warehouseRef ?? d.WarehouseID ?? d.warehouseId;
            const rawItem = d.ItemRef ?? d.itemRef ?? d.ItemID ?? d.itemId;
            const rawTag = d.TagNumber ?? d.tagNumber;
            const whRef = this.parseBigIntSafe(rawWh, 0);
            const itemRef = this.parseBigIntSafe(rawItem, 0);
            const tagStr = rawTag !== null && rawTag !== undefined ? String(rawTag).trim() : '';
            if (whRef && whRef > 0 && itemRef && itemRef > 0 && tagStr !== '') {
                result.push({
                    warehouseRef: whRef,
                    itemRef: itemRef,
                    tagNumber: tagStr,
                });
            }
        }
        return result;
    }
    async create(dto) {
        try {
            const savedHeaderId = await this.headerRepo.manager.transaction(async (manager) => {
                const headerRepo = manager.getRepository(stocktaking_tag_header_entity_1.StocktakingTagHeader);
                const detailRepo = manager.getRepository(stocktaking_tag_detail_entity_1.StocktakingTagDetail);
                const tagRepo = manager.getRepository(stocktaking_tag_entity_1.StocktakingTag);
                const rawHeaderId = await this.idGenService.generateNextId('StocktakingTagHeader');
                const headerId = this.parseBigIntSafe(rawHeaderId, 1);
                const rawPeriod = dto.StocktakingPeriod ?? dto.stocktakingPeriod;
                const period = rawPeriod ? String(rawPeriod).trim() : '';
                if (!period) {
                    throw new common_1.BadRequestException('ورود دوره انبارگردانی الزامی است');
                }
                const rawSettingVal = this.parseBigIntSafe(dto.StocktakingSettingRef ?? dto.stocktakingSettingRef ?? dto.methodRef, null);
                let settingRef = rawSettingVal && rawSettingVal > 0 ? rawSettingVal : null;
                if (!settingRef) {
                    const firstSettings = await this.settingWhRepo.find({ take: 1 });
                    settingRef = firstSettings.length > 0 ? Number(firstSettings[0].StocktakingSettingRef) : 1;
                }
                const stockNumber = this.parseBigIntSafe(dto.StocktakingNumber ?? dto.stocktakingNumber, 1);
                const officerRef = this.parseBigIntSafe(dto.OfficerPartyRef ?? dto.officerPartyRef, null);
                const fiscalYearRef = this.parseBigIntSafe(dto.FiscalYearRef ?? dto.fiscalYearRef, null);
                const rawDate = dto.StocktakingDate ||
                    dto.stocktakingDate ||
                    dto.Stocktakingdate ||
                    '';
                let formattedDate = String(rawDate).trim();
                if (formattedDate.includes('T')) {
                    formattedDate = formattedDate.split('T')[0].replace(/-/g, '/');
                }
                if (!formattedDate) {
                    const today = new Date();
                    const y = today.getFullYear();
                    const m = String(today.getMonth() + 1).padStart(2, '0');
                    const d = String(today.getDate()).padStart(2, '0');
                    formattedDate = `${y}/${m}/${d}`;
                }
                const effectiveFy = fiscalYearRef ? Number(fiscalYearRef) : undefined;
                const latestInfo = await this.getLatestStocktaking(effectiveFy);
                if (latestInfo && latestInfo.latestDate) {
                    const normInput = this.normalizeDate(formattedDate);
                    const normLatest = this.normalizeDate(latestInfo.latestDate);
                    if (normInput < normLatest) {
                        throw new common_1.BadRequestException(`امکان صدور تگ انبارگردانی به تاریخ قبل از آخرین انبارگردانی ثبت‌شده (${latestInfo.latestDate}) در سال مالی جاری وجود ندارد.`);
                    }
                }
                const validDetails = this.extractValidDetails(dto.details);
                if (validDetails.length === 0) {
                    throw new common_1.BadRequestException('امکان ذخیره اطلاعات وجود ندارد؛ حداقل باید برای یک کالا شماره تگ صادر شده باشد.');
                }
                const rawDescription = dto.Description ?? dto.description;
                const description = rawDescription !== undefined && rawDescription !== null ? String(rawDescription).trim() : undefined;
                const header = headerRepo.create({
                    StocktakingTagHeaderID: headerId,
                    StocktakingPeriod: period,
                    StocktakingSettingRef: settingRef,
                    StocktakingDate: formattedDate,
                    StocktakingNumber: stockNumber,
                    OfficerPartyRef: officerRef,
                    Description: description,
                    FiscalYearRef: fiscalYearRef,
                    businessStructureRef: 2,
                    companyRef: 2,
                    version: 1,
                    creator: 1,
                    lastModifier: 1,
                });
                await headerRepo.save(header);
                if (validDetails.length > 0) {
                    const rawStartId = await this.idGenService.generateNextIdBlock('StocktakingTagDetails', validDetails.length);
                    const startDetailId = this.parseBigIntSafe(rawStartId, 1);
                    const detailsToSave = validDetails.map((d, index) => {
                        return detailRepo.create({
                            StocktakingTagDetailID: startDetailId + index,
                            StocktakingTagHeaderRef: headerId,
                            WarehouseRef: d.warehouseRef,
                            ItemRef: d.itemRef,
                            TagNumber: d.tagNumber,
                        });
                    });
                    await detailRepo.save(detailsToSave);
                    const rawStartTagId = await this.idGenService.generateNextIdBlock('StocktakingTags', validDetails.length);
                    const startTagId = this.parseBigIntSafe(rawStartTagId, 1);
                    const tagsToSave = validDetails.map((d, index) => {
                        return tagRepo.create({
                            StocktakingTagID: startTagId + index,
                            StocktakingRef: headerId,
                            WarehouseRef: d.warehouseRef,
                            ItemRef: d.itemRef,
                            TagNumber: d.tagNumber,
                            businessStructureRef: 2,
                            companyRef: 2,
                            version: 1,
                            creator: 1,
                            lastModifier: 1,
                        });
                    });
                    await tagRepo.save(tagsToSave);
                }
                return headerId;
            });
            return await this.findOne(savedHeaderId);
        }
        catch (err) {
            console.error('Error creating stocktaking tag:', err);
            throw err;
        }
    }
    async update(id, dto) {
        try {
            return await this.headerRepo.manager.transaction(async (manager) => {
                const headerRepo = manager.getRepository(stocktaking_tag_header_entity_1.StocktakingTagHeader);
                const detailRepo = manager.getRepository(stocktaking_tag_detail_entity_1.StocktakingTagDetail);
                const tagRepo = manager.getRepository(stocktaking_tag_entity_1.StocktakingTag);
                const header = await headerRepo.findOne({
                    where: { StocktakingTagHeaderID: Number(id) },
                });
                if (!header) {
                    throw new common_1.NotFoundException(`Stocktaking Tag Header #${id} not found`);
                }
                const rawPeriod = dto.StocktakingPeriod ?? dto.stocktakingPeriod;
                if (rawPeriod !== undefined) {
                    const period = rawPeriod ? String(rawPeriod).trim() : '';
                    if (!period) {
                        throw new common_1.BadRequestException('ورود دوره انبارگردانی الزامی است');
                    }
                    header.StocktakingPeriod = period;
                }
                const rawSettingRef = dto.StocktakingSettingRef ?? dto.stocktakingSettingRef ?? dto.methodRef;
                const existingSettingRef = this.parseBigIntSafe(header.StocktakingSettingRef, null);
                const parsedSettingRef = this.parseBigIntSafe(rawSettingRef, existingSettingRef) || existingSettingRef;
                if (parsedSettingRef && parsedSettingRef > 0) {
                    header.StocktakingSettingRef = parsedSettingRef;
                }
                const rawDate = dto.StocktakingDate ?? dto.stocktakingDate;
                if (rawDate !== undefined && rawDate !== null) {
                    let formattedDate = String(rawDate).trim();
                    if (formattedDate.includes('T')) {
                        formattedDate = formattedDate.split('T')[0].replace(/-/g, '/');
                    }
                    if (formattedDate) {
                        header.StocktakingDate = formattedDate;
                    }
                }
                const rawNumber = dto.StocktakingNumber ?? dto.stocktakingNumber;
                if (rawNumber !== undefined) {
                    header.StocktakingNumber = this.parseBigIntSafe(rawNumber, header.StocktakingNumber);
                }
                const rawOfficer = dto.OfficerPartyRef ?? dto.officerPartyRef;
                if (rawOfficer !== undefined) {
                    header.OfficerPartyRef = this.parseBigIntSafe(rawOfficer, null);
                }
                const rawDescription = dto.Description ?? dto.description;
                if (rawDescription !== undefined) {
                    header.Description = rawDescription !== null && String(rawDescription).trim() !== '' ? String(rawDescription).trim() : null;
                }
                const rawFiscalYear = dto.FiscalYearRef ?? dto.fiscalYearRef;
                if (rawFiscalYear !== undefined && rawFiscalYear !== null) {
                    header.FiscalYearRef = this.parseBigIntSafe(rawFiscalYear, header.FiscalYearRef);
                }
                const effectiveFy = header.FiscalYearRef ? Number(header.FiscalYearRef) : undefined;
                const latestInfo = await this.getLatestStocktaking(effectiveFy, Number(id));
                if (latestInfo && latestInfo.latestDate) {
                    const normInput = this.normalizeDate(header.StocktakingDate);
                    const normLatest = this.normalizeDate(latestInfo.latestDate);
                    if (normInput < normLatest) {
                        throw new common_1.BadRequestException(`امکان صدور تگ انبارگردانی به تاریخ قبل از آخرین انبارگردانی ثبت‌شده (${latestInfo.latestDate}) در سال مالی جاری وجود ندارد.`);
                    }
                }
                if (!header.businessStructureRef)
                    header.businessStructureRef = 2;
                if (!header.companyRef)
                    header.companyRef = 2;
                await headerRepo.save(header);
                if (Array.isArray(dto.details)) {
                    const validDetails = this.extractValidDetails(dto.details);
                    if (validDetails.length === 0) {
                        throw new common_1.BadRequestException('امکان ذخیره اطلاعات وجود ندارد؛ حداقل باید برای یک کالا شماره تگ صادر شده باشد.');
                    }
                    const warehouseIds = Array.from(new Set(validDetails.map((d) => d.warehouseRef)));
                    if (warehouseIds.length > 0) {
                        await detailRepo.delete({
                            StocktakingTagHeaderRef: Number(id),
                            WarehouseRef: (0, typeorm_2.In)(warehouseIds),
                        });
                        await tagRepo.delete({
                            StocktakingRef: Number(id),
                            WarehouseRef: (0, typeorm_2.In)(warehouseIds),
                        });
                    }
                    if (validDetails.length > 0) {
                        const rawStartId = await this.idGenService.generateNextIdBlock('StocktakingTagDetails', validDetails.length);
                        const startDetailId = this.parseBigIntSafe(rawStartId, 1);
                        const detailsToSave = validDetails.map((d, index) => {
                            return detailRepo.create({
                                StocktakingTagDetailID: startDetailId + index,
                                StocktakingTagHeaderRef: Number(id),
                                WarehouseRef: d.warehouseRef,
                                ItemRef: d.itemRef,
                                TagNumber: d.tagNumber,
                            });
                        });
                        await detailRepo.save(detailsToSave);
                        const rawStartTagId = await this.idGenService.generateNextIdBlock('StocktakingTags', validDetails.length);
                        const startTagId = this.parseBigIntSafe(rawStartTagId, 1);
                        const tagsToSave = validDetails.map((d, index) => {
                            return tagRepo.create({
                                StocktakingTagID: startTagId + index,
                                StocktakingRef: Number(id),
                                WarehouseRef: d.warehouseRef,
                                ItemRef: d.itemRef,
                                TagNumber: d.tagNumber,
                                businessStructureRef: header.businessStructureRef || 2,
                                companyRef: header.companyRef || 2,
                                version: 1,
                                creator: 1,
                                lastModifier: 1,
                            });
                        });
                        await tagRepo.save(tagsToSave);
                    }
                }
                return Number(id);
            });
            return await this.findOne(Number(id));
        }
        catch (err) {
            console.error('Error updating stocktaking tag:', err);
            throw err;
        }
    }
    async remove(id) {
        const header = await this.findOne(id);
        await this.detailRepo.delete({ StocktakingTagHeaderRef: id });
        await this.tagRepo.delete({ StocktakingRef: id });
        await this.headerRepo.remove(header);
        return { success: true };
    }
    async deleteWarehouseTags(headerId, warehouseId, itemIds) {
        if (Array.isArray(itemIds)) {
            if (itemIds.length === 0) {
                return { success: true, deletedCount: 0 };
            }
            await this.detailRepo.delete({
                StocktakingTagHeaderRef: headerId,
                WarehouseRef: warehouseId,
                ItemRef: (0, typeorm_2.In)(itemIds),
            });
            await this.tagRepo.delete({
                StocktakingRef: headerId,
                WarehouseRef: warehouseId,
                ItemRef: (0, typeorm_2.In)(itemIds),
            });
        }
        else {
            await this.detailRepo.delete({
                StocktakingTagHeaderRef: headerId,
                WarehouseRef: warehouseId,
            });
            await this.tagRepo.delete({
                StocktakingRef: headerId,
                WarehouseRef: warehouseId,
            });
        }
        return { success: true };
    }
};
exports.StocktakingTagService = StocktakingTagService;
exports.StocktakingTagService = StocktakingTagService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(stocktaking_tag_header_entity_1.StocktakingTagHeader)),
    __param(1, (0, typeorm_1.InjectRepository)(stocktaking_tag_detail_entity_1.StocktakingTagDetail)),
    __param(2, (0, typeorm_1.InjectRepository)(stocktaking_tag_entity_1.StocktakingTag)),
    __param(3, (0, typeorm_1.InjectRepository)(stocktaking_setting_warehouse_entity_1.StocktakingSettingWarehouse)),
    __param(4, (0, typeorm_1.InjectRepository)(item_physical_location_entity_1.ItemPhysicalLocation)),
    __param(5, (0, typeorm_1.InjectRepository)(item_entity_1.Item)),
    __param(6, (0, typeorm_1.InjectRepository)(warehouse_entity_1.Warehouse)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        id_generation_service_1.IdGenerationService])
], StocktakingTagService);
//# sourceMappingURL=stocktaking-tag.service.js.map