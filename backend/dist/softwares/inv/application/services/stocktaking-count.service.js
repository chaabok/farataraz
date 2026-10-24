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
exports.StocktakingCountService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const stocktaking_count_entity_1 = require("../../domain/entities/stocktaking-count.entity");
const stocktaking_count_detail_entity_1 = require("../../domain/entities/stocktaking-count-detail.entity");
const stocktaking_count_tracking_factor_entity_1 = require("../../domain/entities/stocktaking-count-tracking-factor.entity");
const stocktaking_tag_header_entity_1 = require("../../domain/entities/stocktaking-tag-header.entity");
const stocktaking_tag_detail_entity_1 = require("../../domain/entities/stocktaking-tag-detail.entity");
const warehouse_entity_1 = require("../../domain/entities/warehouse.entity");
const item_entity_1 = require("../../domain/entities/item.entity");
const item_sub_unit_entity_1 = require("../../domain/entities/item-sub-unit.entity");
const tracking_factor_item_related_entity_1 = require("../../domain/entities/tracking-factor-item-related.entity");
const entity_numbering_entity_1 = require("../../../common/domain/entities/entity-numbering.entity");
const fiscal_year_entity_1 = require("../../../common/domain/entities/fiscal-year.entity");
const id_generation_service_1 = require("../../../../core/services/id-generation.service");
const request_context_service_1 = require("../../../../core/services/request-context.service");
let StocktakingCountService = class StocktakingCountService {
    constructor(countRepo, detailRepo, trackingFactorRepo, tagHeaderRepo, tagDetailRepo, warehouseRepo, itemRepo, tfItemRelatedRepo, idGenService, requestContext, dataSource) {
        this.countRepo = countRepo;
        this.detailRepo = detailRepo;
        this.trackingFactorRepo = trackingFactorRepo;
        this.tagHeaderRepo = tagHeaderRepo;
        this.tagDetailRepo = tagDetailRepo;
        this.warehouseRepo = warehouseRepo;
        this.itemRepo = itemRepo;
        this.tfItemRelatedRepo = tfItemRelatedRepo;
        this.idGenService = idGenService;
        this.requestContext = requestContext;
        this.dataSource = dataSource;
    }
    async getPeriods(fiscalYearId) {
        const qb = this.tagHeaderRepo.createQueryBuilder('header')
            .leftJoinAndSelect('header.stocktakingSetting', 'setting')
            .leftJoinAndSelect('header.officerParty', 'officer')
            .orderBy('header.StocktakingDate', 'DESC')
            .addOrderBy('header.StocktakingNumber', 'DESC');
        if (fiscalYearId && !isNaN(fiscalYearId) && Number(fiscalYearId) > 0) {
            qb.andWhere('header.FiscalYearRef = :fyId', { fyId: Number(fiscalYearId) });
        }
        const headers = await qb.getMany();
        return headers.map((h) => {
            const countTimes = h.stocktakingSetting?.CountTimes || 1;
            let countMethodTitle = h.stocktakingSetting?.MethodName || '';
            if (!countMethodTitle) {
                if (countTimes === 1)
                    countMethodTitle = 'تک شمارشی';
                else if (countTimes === 2)
                    countMethodTitle = 'دو شمارشی';
                else if (countTimes === 3)
                    countMethodTitle = 'سه شمارشی';
            }
            return {
                StocktakingTagHeaderID: Number(h.StocktakingTagHeaderID),
                StocktakingPeriod: h.StocktakingPeriod || `دوره شماره ${h.StocktakingNumber} - ${h.StocktakingDate}`,
                StocktakingNumber: Number(h.StocktakingNumber),
                StocktakingDate: h.StocktakingDate,
                OfficerPartyRef: h.OfficerPartyRef ? Number(h.OfficerPartyRef) : null,
                OfficerPartyTitle: h.officerParty
                    ? (h.officerParty.firstName
                        ? `${h.officerParty.firstName} ${h.officerParty.lastName || ''}`.trim()
                        : h.officerParty.title || h.officerParty.name || '')
                    : '',
                StocktakingSettingRef: Number(h.StocktakingSettingRef),
                MethodName: countMethodTitle,
                CountTimes: countTimes,
                CountWithTrackingFactors: Boolean(h.stocktakingSetting?.CountWithTrackingFactors),
                Count2ListType: h.stocktakingSetting?.Count2ListType || 'all_first',
                Count2DiscrepancyPercent: Number(h.stocktakingSetting?.Count2DiscrepancyPercent || 0),
                Count3CombineType: h.stocktakingSetting?.Count3CombineType || 'OR',
                Count3DiscrepancyPercent: Number(h.stocktakingSetting?.Count3DiscrepancyPercent || 0),
                Count3Discrepancy1And2: Boolean(h.stocktakingSetting?.Count3Discrepancy1And2),
                Count3Discrepancy1AndInv: Boolean(h.stocktakingSetting?.Count3Discrepancy1AndInv),
                Count3Discrepancy2AndInv: Boolean(h.stocktakingSetting?.Count3Discrepancy2AndInv),
                FiscalYearRef: h.FiscalYearRef ? Number(h.FiscalYearRef) : null,
            };
        });
    }
    async getWarehousesForTagHeader(tagHeaderId, excludeCompleted = true, currentCountId) {
        if (!tagHeaderId || isNaN(tagHeaderId))
            return [];
        const tagHeaderSetting = await this.dataSource.query(`
      SELECT COALESCE(s."CountTimes", 1) AS "CountTimes"
      FROM "Inv"."StocktakingTagHeaders" h
      LEFT JOIN "Inv"."StocktakingSettings" s ON s."StocktakingSettingID" = h."StocktakingSettingRef"
      WHERE h."StocktakingTagHeaderID"::text = $1::text
      LIMIT 1
      `, [String(tagHeaderId)]);
        const maxCountTimes = Number(tagHeaderSetting?.[0]?.CountTimes || tagHeaderSetting?.[0]?.counttimes || 1);
        const rawWarehouses = await this.dataSource.query(`
      SELECT DISTINCT 
        w."WarehouseID", 
        w."WarehouseCode", 
        COALESCE(w."WarehouseTitle", '') AS "WarehouseName",
        COALESCE(w."WarehouseTitle", '') AS "WarehouseTitle",
        w."WarehouseType"
      FROM "Inv"."StocktakingTagDetails" d
      INNER JOIN "Inv"."Warehouses" w ON w."WarehouseID" = d."WarehouseRef"
      LEFT JOIN "Inv"."ItemPhysicalLocations" pl ON pl."ItemRef" = d."ItemRef" AND pl."WarehouseRef" = d."WarehouseRef"
      WHERE d."StocktakingTagHeaderRef"::text = $1::text
        AND d."TagNumber" IS NOT NULL
        AND TRIM(d."TagNumber") != ''
      ORDER BY w."WarehouseCode" ASC
      `, [String(tagHeaderId)]);
        let filteredWarehouses = rawWarehouses || [];
        if (excludeCompleted) {
            const queryParams = [String(tagHeaderId)];
            let excludeCountClause = '';
            if (currentCountId && !isNaN(currentCountId) && currentCountId > 0) {
                queryParams.push(String(currentCountId));
                excludeCountClause = `AND "StocktakingCountID"::text != $2::text`;
            }
            const completedCounts = await this.dataSource.query(`
        SELECT "WarehouseRef", COUNT(DISTINCT "CountRound") AS "roundsCount"
        FROM "Inv"."StocktakingCounts"
        WHERE "StocktakingTagHeaderRef"::text = $1::text ${excludeCountClause}
        GROUP BY "WarehouseRef"
        `, queryParams);
            const completedWarehouseMap = new Map();
            for (const row of completedCounts || []) {
                const whId = Number(row.WarehouseRef || row.warehouseref);
                const rounds = Number(row.roundsCount || row.roundscount || row.count || 0);
                if (!isNaN(whId) && whId > 0) {
                    completedWarehouseMap.set(whId, rounds);
                }
            }
            filteredWarehouses = filteredWarehouses.filter((rw) => {
                const whId = Number(rw.WarehouseID || rw.warehouseid);
                const doneRounds = completedWarehouseMap.get(whId) || 0;
                return doneRounds < maxCountTimes;
            });
        }
        return filteredWarehouses.map((rw) => ({
            WarehouseID: Number(rw.WarehouseID || rw.warehouseid),
            WarehouseCode: String(rw.WarehouseCode || rw.warehousecode || ''),
            WarehouseName: String(rw.WarehouseTitle || rw.warehousetitle || rw.WarehouseName || rw.warehousename || ''),
            WarehouseTitle: String(rw.WarehouseTitle || rw.warehousetitle || rw.WarehouseName || rw.warehousename || ''),
            WarehouseType: rw.WarehouseType || rw.warehousetype,
            title: `${rw.WarehouseCode || ''} - ${rw.WarehouseTitle || rw.WarehouseName || ''}`.trim(),
        }));
    }
    async getWarehouseCountStatus(tagHeaderId, warehouseId) {
        if (!tagHeaderId || !warehouseId) {
            return {
                nextRound: 1,
                countTimes: 1,
                existingCounts: [],
                isCompleted: false,
            };
        }
        const tagHeader = await this.tagHeaderRepo.findOne({
            where: { StocktakingTagHeaderID: tagHeaderId },
            relations: ['stocktakingSetting'],
        });
        const countTimes = tagHeader?.stocktakingSetting?.CountTimes || 1;
        const existingCounts = await this.countRepo.find({
            where: {
                StocktakingTagHeaderRef: tagHeaderId,
                WarehouseRef: warehouseId,
            },
            order: { CountRound: 'ASC' },
            relations: ['details'],
        });
        const existingRounds = new Set(existingCounts.map(c => Number(c.CountRound || 1)));
        let nextRound = null;
        let isCompleted = false;
        if (!existingRounds.has(1)) {
            nextRound = 1;
        }
        else if (countTimes >= 2 && !existingRounds.has(2)) {
            nextRound = 2;
        }
        else if (countTimes >= 3 && !existingRounds.has(3)) {
            nextRound = 3;
        }
        else {
            isCompleted = true;
            nextRound = null;
        }
        return {
            tagHeaderId,
            warehouseId,
            countTimes,
            nextRound,
            isCompleted,
            existingCounts: existingCounts.map(c => ({
                StocktakingCountID: Number(c.StocktakingCountID),
                CountRound: Number(c.CountRound || 1),
                StocktakingNumber: Number(c.StocktakingNumber),
                StocktakingDate: c.StocktakingDate,
                itemsCount: (c.details || []).length,
            })),
            setting: {
                Count2ListType: tagHeader?.stocktakingSetting?.Count2ListType || 'all_first',
                Count2DiscrepancyPercent: Number(tagHeader?.stocktakingSetting?.Count2DiscrepancyPercent || 0),
                Count3CombineType: tagHeader?.stocktakingSetting?.Count3CombineType || 'OR',
                Count3DiscrepancyPercent: Number(tagHeader?.stocktakingSetting?.Count3DiscrepancyPercent || 0),
                Count3Discrepancy1And2: Boolean(tagHeader?.stocktakingSetting?.Count3Discrepancy1And2),
                Count3Discrepancy1AndInv: Boolean(tagHeader?.stocktakingSetting?.Count3Discrepancy1AndInv),
                Count3Discrepancy2AndInv: Boolean(tagHeader?.stocktakingSetting?.Count3Discrepancy2AndInv),
            },
        };
    }
    async getItemsForCount(tagHeaderId, warehouseId, countId, round) {
        if (!tagHeaderId || !warehouseId)
            return [];
        const tagHeader = await this.tagHeaderRepo.findOne({
            where: { StocktakingTagHeaderID: tagHeaderId },
            relations: ['stocktakingSetting'],
        });
        let savedCount = null;
        if (countId && !isNaN(countId) && countId > 0) {
            savedCount = await this.countRepo.findOne({
                where: { StocktakingCountID: countId },
                relations: ['details', 'details.trackingFactors', 'details.trackingFactors.trackingFactor'],
            });
        }
        const targetRound = savedCount ? Number(savedCount.CountRound || 1) : (round || 1);
        const rawTagItems = await this.dataSource.query(`
      SELECT 
        d."StocktakingTagDetailID",
        d."TagNumber",
        d."ItemRef",
        i."ItemCode",
        COALESCE(i."ItemName", '') as "ItemTitle",
        COALESCE(i."ItemName", '') as "ItemName",
        i."MeasurementUnitRef",
        COALESCE(u."MeasurementUnitName", '') as "MeasurementUnitName"
      FROM "Inv"."StocktakingTagDetails" d
      LEFT JOIN "Inv"."ItemPhysicalLocations" pl ON pl."ItemRef" = d."ItemRef" AND pl."WarehouseRef" = d."WarehouseRef"
      INNER JOIN "Inv"."Items" i ON i."ItemID" = d."ItemRef"
      LEFT JOIN "Inv"."MeasurementUnits" u ON u."MeasurementUnitID" = i."MeasurementUnitRef"
      WHERE d."StocktakingTagHeaderRef" = $1
        AND d."WarehouseRef" = $2
        AND d."TagNumber" IS NOT NULL
        AND TRIM(d."TagNumber") != ''
      ORDER BY i."ItemCode" ASC, d."TagNumber" ASC
      `, [tagHeaderId, warehouseId]);
        const tagItemsMap = new Map();
        for (const r of rawTagItems || []) {
            tagItemsMap.set(Number(r.ItemRef || r.itemref), r);
        }
        const stockRows = await this.dataSource.query(`
      SELECT 
        i."ItemID",
        SUM(
          CASE 
            WHEN COALESCE(t."WarehouseDocumentNature", v."BaseType", 1) = 1 THEN 
              CASE WHEN (d."UnitType" = 2 OR d."UnitType"::text = '2' OR d."UnitType"::text = 'فرعی') AND COALESCE(su."MainToSubRatio", 1) > 0 
                THEN COALESCE(d."Quantity", 0) * COALESCE(su."MainToSubRatio", 1)
                ELSE COALESCE(d."Quantity", 0)
              END
            ELSE 
              - (CASE WHEN (d."UnitType" = 2 OR d."UnitType"::text = '2' OR d."UnitType"::text = 'فرعی') AND COALESCE(su."MainToSubRatio", 1) > 0 
                THEN COALESCE(d."Quantity", 0) * COALESCE(su."MainToSubRatio", 1)
                ELSE COALESCE(d."Quantity", 0)
              END)
          END
        ) AS "balanceQty"
      FROM "Inv"."WarehouseVouchersDetails" d
      JOIN "Inv"."WarehouseVouchers" v ON v."WarehouseReceiptID" = d."WarehouseReceiptRef"
      JOIN "Inv"."Items" i ON (
        i."ItemID" = d."ItemRef" 
        OR (i."ItemCode"::text = d."ItemRef"::text AND d."ItemRef"::text NOT IN (SELECT "ItemID"::text FROM "Inv"."Items"))
      )
      LEFT JOIN "Inv"."WarehouseDocumentTypes" t ON t."WarehouseDocumentTypeID" = v."WarehouseDocumentTypeRef"
      LEFT JOIN "Inv"."Warehouses" w ON (
        w."WarehouseID" = COALESCE(d."WarehouseRef", v."WarehouseRef")
        OR w."WarehouseCode"::text = COALESCE(d."WarehouseRef", v."WarehouseRef")::text
        OR w."WarehouseTitle" = COALESCE(d."WarehouseRef", v."WarehouseRef")::text
      )
      LEFT JOIN LATERAL (
        SELECT "MainToSubRatio" FROM "Inv"."ItemSubUnits" isu WHERE isu."ItemRef" = i."ItemID" LIMIT 1
      ) su ON TRUE
      WHERE (
        w."WarehouseID" = $1 
        OR d."WarehouseRef" = $1 
        OR v."WarehouseRef" = $1
      )
      GROUP BY i."ItemID"
      `, [warehouseId]).catch((err) => {
            console.error('Failed to calculate system stock for stocktaking count:', err);
            return [];
        });
        const systemStockMap = new Map();
        for (const sr of stockRows || []) {
            const itemKey = Number(sr.ItemID || sr.itemid || sr.ItemRef || sr.itemref);
            if (itemKey > 0) {
                systemStockMap.set(itemKey, Number(sr.balanceQty || sr.balanceqty || 0));
            }
        }
        let count1Record = null;
        let count2Record = null;
        if (targetRound >= 2) {
            count1Record = await this.countRepo.findOne({
                where: { StocktakingTagHeaderRef: tagHeaderId, WarehouseRef: warehouseId, CountRound: 1 },
                relations: ['details', 'details.item', 'details.item.MeasurementUnit', 'details.trackingFactors'],
            });
        }
        if (targetRound >= 3) {
            count2Record = await this.countRepo.findOne({
                where: { StocktakingTagHeaderRef: tagHeaderId, WarehouseRef: warehouseId, CountRound: 2 },
                relations: ['details', 'details.item', 'details.item.MeasurementUnit', 'details.trackingFactors'],
            });
        }
        const count1QtyMap = new Map();
        const count1DetMap = new Map();
        if (count1Record?.details) {
            for (const d of count1Record.details) {
                count1QtyMap.set(Number(d.ItemRef), Number(d.CountedQuantity || 0));
                count1DetMap.set(Number(d.ItemRef), d);
            }
        }
        const count2QtyMap = new Map();
        const count2DetMap = new Map();
        if (count2Record?.details) {
            for (const d of count2Record.details) {
                count2QtyMap.set(Number(d.ItemRef), Number(d.CountedQuantity || 0));
                count2DetMap.set(Number(d.ItemRef), d);
            }
        }
        let itemsToProcess = [];
        if (savedCount && savedCount.details && savedCount.details.length > 0) {
            itemsToProcess = savedCount.details.map((det) => {
                const itemRef = Number(det.ItemRef);
                const tagItem = tagItemsMap.get(itemRef);
                const q1 = count1QtyMap.get(itemRef) ?? 0;
                const q2 = count2QtyMap.get(itemRef) ?? 0;
                const qBook = systemStockMap.get(itemRef) ?? 0;
                return {
                    ItemRef: itemRef,
                    TagNumber: String(det.TagNumber || tagItem?.TagNumber || ''),
                    StocktakingTagDetailID: Number(tagItem?.StocktakingTagDetailID || 0),
                    ItemCode: String(det.item?.ItemCode || tagItem?.ItemCode || ''),
                    ItemTitle: String(det.item?.ItemName || tagItem?.ItemTitle || ''),
                    MeasurementUnitName: String(det.item?.MeasurementUnit?.MeasurementUnitName || tagItem?.MeasurementUnitName || ''),
                    CountedQuantity: Number(det.CountedQuantity || 0),
                    Description: det.Description || '',
                    PreviousCount1Qty: targetRound >= 2 ? q1 : undefined,
                    PreviousCount2Qty: targetRound >= 3 ? q2 : undefined,
                    SystemStockQty: targetRound >= 2 ? qBook : undefined,
                    savedDetail: det,
                };
            });
        }
        else {
            if (targetRound === 1) {
                itemsToProcess = (rawTagItems || []).map((row) => ({
                    ItemRef: Number(row.ItemRef || row.itemref),
                    TagNumber: String(row.TagNumber || row.tagnumber || ''),
                    StocktakingTagDetailID: Number(row.StocktakingTagDetailID || row.stocktakingtagdetailid),
                    ItemCode: String(row.ItemCode || row.itemcode || ''),
                    ItemTitle: String(row.ItemTitle || row.itemtitle || ''),
                    MeasurementUnitName: String(row.MeasurementUnitName || row.measurementunitname || ''),
                    CountedQuantity: 0,
                    Description: '',
                }));
            }
            else if (targetRound === 2) {
                if (count1Record && count1Record.details && count1Record.details.length > 0) {
                    const listType = tagHeader?.stocktakingSetting?.Count2ListType || 'all_first';
                    const thresholdPct = Number(tagHeader?.stocktakingSetting?.Count2DiscrepancyPercent || 0);
                    for (const det of count1Record.details) {
                        const itemRef = Number(det.ItemRef);
                        const tagItem = tagItemsMap.get(itemRef);
                        const qCount1 = Number(det.CountedQuantity || 0);
                        const qBook = systemStockMap.get(itemRef) ?? 0;
                        const diff = Math.abs(qCount1 - qBook);
                        let include = false;
                        if (listType === 'all_first') {
                            include = true;
                        }
                        else {
                            if (diff > 0.0001) {
                                if (thresholdPct > 0) {
                                    const absBook = Math.abs(qBook);
                                    const pct = absBook > 0 ? (diff / absBook) * 100 : (qCount1 > 0 ? 100 : 0);
                                    if (pct > thresholdPct) {
                                        include = true;
                                    }
                                }
                                else {
                                    include = true;
                                }
                            }
                        }
                        if (include) {
                            itemsToProcess.push({
                                ItemRef: itemRef,
                                TagNumber: String(det.TagNumber || tagItem?.TagNumber || ''),
                                StocktakingTagDetailID: Number(tagItem?.StocktakingTagDetailID || 0),
                                ItemCode: String(tagItem?.ItemCode || det.item?.ItemCode || ''),
                                ItemTitle: String(tagItem?.ItemTitle || det.item?.ItemName || ''),
                                MeasurementUnitName: String(tagItem?.MeasurementUnitName || det.item?.MeasurementUnit?.MeasurementUnitName || ''),
                                CountedQuantity: 0,
                                Description: '',
                                PreviousCount1Qty: qCount1,
                                SystemStockQty: qBook,
                            });
                        }
                    }
                }
            }
            else if (targetRound === 3) {
                if (count2Record && count2Record.details && count2Record.details.length > 0) {
                    const setting = tagHeader?.stocktakingSetting;
                    const combineType = setting?.Count3CombineType === 'AND' ? 'AND' : 'OR';
                    const p3 = Number(setting?.Count3DiscrepancyPercent || 0);
                    for (const det of count2Record.details) {
                        const itemRef = Number(det.ItemRef);
                        const tagItem = tagItemsMap.get(itemRef);
                        const qCount1 = count1QtyMap.get(itemRef) ?? 0;
                        const qCount2 = Number(det.CountedQuantity || 0);
                        const qBook = systemStockMap.get(itemRef) ?? 0;
                        const diff12 = Math.abs(qCount1 - qCount2);
                        const pct12 = qCount1 > 0 ? (diff12 / qCount1) * 100 : (qCount2 > 0 ? 100 : 0);
                        const match12 = diff12 > 0.0001 && (p3 === 0 || pct12 > p3);
                        const diff1Inv = Math.abs(qCount1 - qBook);
                        const pct1Inv = qBook > 0 ? (diff1Inv / qBook) * 100 : (qCount1 > 0 ? 100 : 0);
                        const match1Inv = diff1Inv > 0.0001 && (p3 === 0 || pct1Inv > p3);
                        const diff2Inv = Math.abs(qCount2 - qBook);
                        const pct2Inv = qBook > 0 ? (diff2Inv / qBook) * 100 : (qCount2 > 0 ? 100 : 0);
                        const match2Inv = diff2Inv > 0.0001 && (p3 === 0 || pct2Inv > p3);
                        const activeConditions = [];
                        if (setting?.Count3Discrepancy1And2)
                            activeConditions.push(match12);
                        if (setting?.Count3Discrepancy1AndInv)
                            activeConditions.push(match1Inv);
                        if (setting?.Count3Discrepancy2AndInv)
                            activeConditions.push(match2Inv);
                        let keep = false;
                        if (activeConditions.length === 0) {
                            keep = match12 || match1Inv || match2Inv;
                        }
                        else if (combineType === 'AND') {
                            keep = activeConditions.every(c => c === true);
                        }
                        else {
                            keep = activeConditions.some(c => c === true);
                        }
                        if (keep) {
                            itemsToProcess.push({
                                ItemRef: itemRef,
                                TagNumber: String(det.TagNumber || tagItem?.TagNumber || ''),
                                StocktakingTagDetailID: Number(tagItem?.StocktakingTagDetailID || 0),
                                ItemCode: String(tagItem?.ItemCode || ''),
                                ItemTitle: String(tagItem?.ItemTitle || ''),
                                MeasurementUnitName: String(tagItem?.MeasurementUnitName || ''),
                                CountedQuantity: 0,
                                Description: '',
                                PreviousCount1Qty: qCount1,
                                PreviousCount2Qty: qCount2,
                                SystemStockQty: qBook,
                            });
                        }
                    }
                }
            }
        }
        const allItemRefs = itemsToProcess.map(r => r.ItemRef);
        const relatedTfMap = new Map();
        if (allItemRefs.length > 0) {
            try {
                const tfRelations = await this.tfItemRelatedRepo.createQueryBuilder('rel')
                    .leftJoinAndSelect('rel.trackingFactor', 'tf')
                    .leftJoinAndSelect('tf.constantValues', 'cv')
                    .where('rel.ItemRef IN (:...itemRefs)', { itemRefs: allItemRefs })
                    .orderBy('tf.DisplayPriority', 'ASC')
                    .getMany();
                for (const rel of tfRelations) {
                    const itemRef = Number(rel.ItemRef);
                    if (!relatedTfMap.has(itemRef)) {
                        relatedTfMap.set(itemRef, []);
                    }
                    if (rel.trackingFactor) {
                        relatedTfMap.get(itemRef).push({
                            TrackingFactorID: Number(rel.trackingFactor.TrackingFactorID),
                            TrackingFactorCode: rel.trackingFactor.TrackingFactorCode,
                            TrackingFactorName: rel.trackingFactor.TrackingFactorName,
                            TrackingFactorName2: rel.trackingFactor.TrackingFactorName2,
                            TrackingFactorType: rel.trackingFactor.TrackingFactorType,
                            IsConstantValue: rel.trackingFactor.IsConstantValue,
                            DisplayPriority: rel.trackingFactor.DisplayPriority,
                            StartValue: rel.trackingFactor.StartValue,
                            EndValue: rel.trackingFactor.EndValue,
                            constantValues: (rel.trackingFactor.constantValues || []).map(cv => ({
                                ConstantValueID: Number(cv.TrackingFactorConstantValueID),
                                ConstantValue: cv.ConstantValue,
                                RowNumber: cv.RowNumber,
                            })),
                        });
                    }
                }
            }
            catch (err) {
                console.warn('Could not load tracking factors for stocktaking count:', err);
            }
        }
        const subUnitsMap = new Map();
        if (allItemRefs.length > 0) {
            try {
                const itemSubUnitRepo = this.dataSource.getRepository(item_sub_unit_entity_1.ItemSubUnit);
                const subUnitsList = await itemSubUnitRepo.find({
                    where: { ItemRef: (0, typeorm_2.In)(allItemRefs) },
                    relations: ['SubUnit'],
                    order: { ItemSubUnitID: 'ASC' },
                });
                for (const su of (subUnitsList || [])) {
                    const iRef = Number(su.ItemRef);
                    if (!subUnitsMap.has(iRef))
                        subUnitsMap.set(iRef, []);
                    subUnitsMap.get(iRef).push({
                        ItemSubUnitID: Number(su.ItemSubUnitID),
                        SubUnitRef: Number(su.SubUnitRef),
                        SubUnitName: String(su.SubUnit?.MeasurementUnitName || ''),
                        MainToSubRatio: Number(su.MainToSubRatio || 1),
                        IsVariableRatio: su.IsVariableRatio === 1 || su.IsVariableRatio === true || String(su.IsVariableRatio) === '1',
                        TolerancePercent: Number(su.TolerancePercent || 0),
                    });
                }
            }
            catch (err) {
                console.warn('Could not load item sub-units for stocktaking count:', err);
            }
        }
        return itemsToProcess.map((item, index) => {
            const itemTrackingFactors = relatedTfMap.get(item.ItemRef) || [];
            const hasTrackingFactors = itemTrackingFactors.length > 0;
            const itemSubUnits = subUnitsMap.get(item.ItemRef) || [];
            const hasSubUnits = itemSubUnits.length > 0;
            const savedDet = item.savedDetail;
            return {
                RowNumber: index + 1,
                StocktakingTagDetailID: item.StocktakingTagDetailID,
                ItemRef: item.ItemRef,
                ItemCode: item.ItemCode,
                ItemTitle: item.ItemTitle,
                MeasurementUnitName: item.MeasurementUnitName,
                TagNumber: item.TagNumber,
                CountedQuantity: item.CountedQuantity,
                Description: item.Description || '',
                PreviousCount1Qty: item.PreviousCount1Qty,
                PreviousCount2Qty: item.PreviousCount2Qty,
                SystemStockQty: item.SystemStockQty,
                hasTrackingFactors,
                trackingFactors: itemTrackingFactors,
                savedTrackingFactorValues: savedDet?.trackingFactors ? savedDet.trackingFactors.map(tf => ({
                    StocktakingCountTrackingFactorID: Number(tf.StocktakingCountTrackingFactorID),
                    TrackingFactorRef: Number(tf.TrackingFactorRef),
                    FactorValue: tf.FactorValue,
                    CountedQuantity: Number(tf.CountedQuantity),
                    TrackingFactorName: tf.trackingFactor?.TrackingFactorName || '',
                })) : [],
                hasSubUnits,
                subUnits: itemSubUnits,
            };
        });
    }
    async getNextNumber(fiscalYearId, warehouseId) {
        const businessStructureRef = this.requestContext.getBusinessStructureId() || 2;
        const companyRef = this.requestContext.getCompanyId() || 2;
        let startNumber = 1;
        let fixedChar = '';
        try {
            const entityNumberingRepo = this.dataSource.getRepository(entity_numbering_entity_1.EntityNumbering);
            const allConfigs = await entityNumberingRepo.find();
            const numberingConfig = allConfigs.find(c => {
                const r = String(c.entityRef || '').toLowerCase().replace(/^entity\./, '');
                return r === 'stocktaking_count' || r === 'stocktakingform' || r === 'stocktaking_form';
            }) || null;
            if (numberingConfig && numberingConfig.items) {
                let items = numberingConfig.items;
                if (typeof items === 'string') {
                    try {
                        items = JSON.parse(items);
                    }
                    catch { }
                }
                if (items) {
                    let itemsList = items.fiscalYears || (Array.isArray(items) ? items : []);
                    if (!Array.isArray(itemsList) && typeof items === 'object') {
                        itemsList = [];
                        Object.values(items).forEach((v) => {
                            if (Array.isArray(v))
                                itemsList.push(...v);
                        });
                    }
                    if (Array.isArray(itemsList) && itemsList.length > 0) {
                        let matched = itemsList[0];
                        let targetFyTitle = '';
                        if (fiscalYearId && !isNaN(fiscalYearId) && Number(fiscalYearId) > 0) {
                            try {
                                const fyRepo = this.dataSource.getRepository(fiscal_year_entity_1.FiscalYear);
                                const fy = await fyRepo.findOne({ where: { fiscalYearID: Number(fiscalYearId) } });
                                if (fy && fy.title)
                                    targetFyTitle = String(fy.title).trim().toLowerCase();
                            }
                            catch (e) { }
                        }
                        let targetWhTitle = '';
                        if (warehouseId && !isNaN(warehouseId) && Number(warehouseId) > 0) {
                            try {
                                const wh = await this.warehouseRepo.findOne({ where: { WarehouseID: Number(warehouseId) } });
                                if (wh && wh.WarehouseTitle)
                                    targetWhTitle = String(wh.WarehouseTitle).trim().toLowerCase();
                            }
                            catch (e) { }
                        }
                        const foundMatch = itemsList.find((it) => {
                            if (!it)
                                return false;
                            const fyMatch = !targetFyTitle || (it.fiscalYearTitle && String(it.fiscalYearTitle).trim().toLowerCase() === targetFyTitle);
                            const whMatch = !targetWhTitle || (it.warehouseTitle && String(it.warehouseTitle).trim().toLowerCase() === targetWhTitle);
                            return fyMatch && whMatch;
                        }) || itemsList.find((it) => {
                            if (!it)
                                return false;
                            if (targetWhTitle && it.warehouseTitle && String(it.warehouseTitle).trim().toLowerCase() === targetWhTitle)
                                return true;
                            if (targetFyTitle && it.fiscalYearTitle && String(it.fiscalYearTitle).trim().toLowerCase() === targetFyTitle)
                                return true;
                            return false;
                        });
                        if (foundMatch) {
                            matched = foundMatch;
                        }
                        if (matched) {
                            const parsedStart = parseInt(matched.startNumber, 10);
                            if (!isNaN(parsedStart) && parsedStart > 0) {
                                startNumber = parsedStart;
                            }
                            if (matched.fixedChar) {
                                fixedChar = String(matched.fixedChar).trim();
                            }
                        }
                    }
                }
            }
        }
        catch (e) {
            console.error('Error finding entity numbering for stocktaking_count:', e);
        }
        const qb = this.countRepo.createQueryBuilder('c')
            .select('MAX(c.StocktakingNumber)', 'maxNumber')
            .where('(c.businessStructureRef = :bsRef OR c.businessStructureRef IS NULL)', { bsRef: businessStructureRef });
        if (companyRef) {
            qb.andWhere('(c.companyRef = :compRef OR c.companyRef IS NULL)', { compRef: companyRef });
        }
        if (fiscalYearId && !isNaN(fiscalYearId) && Number(fiscalYearId) > 0) {
            qb.andWhere('(c.FiscalYearRef = :fyId OR c.FiscalYearRef IS NULL)', { fyId: Number(fiscalYearId) });
        }
        const res = await qb.getRawOne();
        const rawMax = res ? (res.maxNumber ?? res.maxnumber ?? res.max ?? (Object.values(res)[0])) : 0;
        const currentMax = rawMax ? parseInt(String(rawMax), 10) : 0;
        const nextSeq = currentMax > 0 ? currentMax + 1 : startNumber;
        const finalSeq = Math.max(nextSeq, startNumber);
        if (fixedChar) {
            return `${fixedChar}${finalSeq}`;
        }
        return finalSeq;
    }
    async findAll() {
        const businessStructureRef = this.requestContext.getBusinessStructureId() || 2;
        const companyRef = this.requestContext.getCompanyId() || null;
        const qb = this.countRepo.createQueryBuilder('c')
            .leftJoinAndSelect('c.tagHeader', 'tagHeader')
            .leftJoinAndSelect('c.warehouse', 'warehouse')
            .leftJoinAndSelect('tagHeader.stocktakingSetting', 'setting')
            .leftJoinAndSelect('tagHeader.officerParty', 'officer')
            .orderBy('c.StocktakingDate', 'DESC')
            .addOrderBy('c.StocktakingNumber', 'DESC');
        if (businessStructureRef) {
            qb.andWhere('c.businessStructureRef = :bsRef', { bsRef: businessStructureRef });
        }
        if (companyRef) {
            qb.andWhere('c.companyRef = :compRef', { compRef: companyRef });
        }
        return qb.getMany();
    }
    async findOne(id) {
        const count = await this.countRepo.findOne({
            where: { StocktakingCountID: id },
            relations: [
                'tagHeader',
                'tagHeader.stocktakingSetting',
                'tagHeader.officerParty',
                'warehouse',
                'details',
                'details.item',
                'details.item.MeasurementUnit',
                'details.trackingFactors',
                'details.trackingFactors.trackingFactor',
            ],
            order: {
                details: {
                    RowNumber: 'ASC',
                },
            },
        });
        if (!count) {
            throw new common_1.NotFoundException(`شمارش انبارگردانی با شناسه ${id} یافت نشد.`);
        }
        return count;
    }
    async create(dto) {
        const countId = await this.idGenService.generateNextId('StocktakingCounts');
        const businessStructureRef = dto.BusinessStructureRef || this.requestContext.getBusinessStructureId() || 2;
        const companyRef = dto.CompanyRef || this.requestContext.getCompanyId() || null;
        const fyRef = dto.FiscalYearRef ? Number(dto.FiscalYearRef) : undefined;
        const whRef = dto.WarehouseRef ? Number(dto.WarehouseRef) : undefined;
        let finalStocktakingNumber = dto.StocktakingNumber ? Number(dto.StocktakingNumber) : 0;
        if (finalStocktakingNumber <= 0) {
            const calculated = await this.getNextNumber(fyRef, whRef);
            finalStocktakingNumber = typeof calculated === 'number' ? calculated : parseInt(String(calculated).replace(/\D/g, ''), 10) || 1;
        }
        else {
            const qbCheck = this.countRepo.createQueryBuilder('c')
                .where('c.StocktakingNumber = :num', { num: finalStocktakingNumber })
                .andWhere('(c.businessStructureRef = :bsRef OR c.businessStructureRef IS NULL)', { bsRef: businessStructureRef });
            if (companyRef) {
                qbCheck.andWhere('(c.companyRef = :compRef OR c.companyRef IS NULL)', { compRef: companyRef });
            }
            if (fyRef) {
                qbCheck.andWhere('(c.FiscalYearRef = :fyId OR c.FiscalYearRef IS NULL)', { fyId: fyRef });
            }
            const duplicateCount = await qbCheck.getCount();
            if (duplicateCount > 0) {
                const calculated = await this.getNextNumber(fyRef, whRef);
                finalStocktakingNumber = typeof calculated === 'number' ? calculated : parseInt(String(calculated).replace(/\D/g, ''), 10) || (finalStocktakingNumber + 1);
            }
        }
        const requestedRound = dto.CountRound ? Number(dto.CountRound) : 1;
        const existingSameRound = await this.countRepo.findOne({
            where: {
                StocktakingTagHeaderRef: Number(dto.StocktakingTagHeaderRef),
                WarehouseRef: Number(dto.WarehouseRef),
                CountRound: requestedRound,
            },
        });
        if (existingSameRound) {
            throw new common_1.BadRequestException(`شمارش شماره ${requestedRound} برای این انبار در این دوره قبلاً ثبت شده است.`);
        }
        const newCount = this.countRepo.create({
            StocktakingCountID: countId,
            StocktakingTagHeaderRef: Number(dto.StocktakingTagHeaderRef),
            WarehouseRef: Number(dto.WarehouseRef),
            StocktakingDate: dto.StocktakingDate,
            StocktakingNumber: finalStocktakingNumber,
            CountRound: dto.CountRound ? Number(dto.CountRound) : 1,
            Status: dto.Status ? Number(dto.Status) : 1,
            Description: dto.Description || '',
            FiscalYearRef: dto.FiscalYearRef ? Number(dto.FiscalYearRef) : null,
            businessStructureRef,
            companyRef,
        });
        const savedCount = await this.countRepo.save(newCount);
        if (dto.details && dto.details.length > 0) {
            for (const d of dto.details) {
                const detailId = await this.idGenService.generateNextId('StocktakingCountDetails');
                const detail = this.detailRepo.create({
                    StocktakingCountDetailID: detailId,
                    StocktakingCountRef: countId,
                    RowNumber: d.RowNumber,
                    ItemRef: Number(d.ItemRef),
                    TagNumber: d.TagNumber || '',
                    CountedQuantity: Number(d.CountedQuantity || 0),
                    Description: d.Description || '',
                });
                await this.detailRepo.save(detail);
                if (d.trackingFactors && d.trackingFactors.length > 0) {
                    for (const tf of d.trackingFactors) {
                        const tfRef = Number(tf.TrackingFactorRef);
                        if (isNaN(tfRef) || tfRef <= 0)
                            continue;
                        const tfId = await this.idGenService.generateNextId('StocktakingCountTrackingFactors');
                        const newTf = this.trackingFactorRepo.create({
                            StocktakingCountTrackingFactorID: tfId,
                            StocktakingCountDetailRef: detailId,
                            TrackingFactorRef: tfRef,
                            FactorValue: tf.FactorValue || '',
                            CountedQuantity: Number(tf.CountedQuantity || 0),
                        });
                        await this.trackingFactorRepo.save(newTf);
                    }
                }
            }
        }
        return this.findOne(countId);
    }
    async update(id, dto) {
        const existing = await this.countRepo.findOne({
            where: { StocktakingCountID: id },
            relations: ['details'],
        });
        if (!existing) {
            throw new common_1.NotFoundException(`شمارش انبارگردانی با شناسه ${id} یافت نشد.`);
        }
        const requestedRound = dto.CountRound !== undefined ? Number(dto.CountRound) : Number(existing.CountRound);
        const targetTagHeader = dto.StocktakingTagHeaderRef ? Number(dto.StocktakingTagHeaderRef) : Number(existing.StocktakingTagHeaderRef);
        const targetWarehouse = dto.WarehouseRef ? Number(dto.WarehouseRef) : Number(existing.WarehouseRef);
        const targetStatus = dto.Status !== undefined ? Number(dto.Status) : Number(existing.Status);
        if (Number(existing.Status) !== 2 && targetStatus !== 2 && dto.details && dto.details.length > 0) {
            const existingQtyMap = new Map();
            if (existing.details) {
                for (const det of existing.details) {
                    existingQtyMap.set(Number(det.ItemRef), Number(det.CountedQuantity || 0));
                }
            }
            const hasQtyChanged = dto.details.some(d => {
                const oldQty = existingQtyMap.get(Number(d.ItemRef));
                return oldQty === undefined || Math.abs(Number(d.CountedQuantity || 0) - oldQty) > 0.0001;
            });
            if (hasQtyChanged) {
                throw new common_1.BadRequestException('امکان تغییر مقادیر شمارش در وضعیت تایید شده وجود ندارد. برای تغییر شمارش، ابتدا وضعیت را به ثبت اولیه تغییر دهید.');
            }
        }
        const duplicateRound = await this.countRepo.findOne({
            where: {
                StocktakingTagHeaderRef: targetTagHeader,
                WarehouseRef: targetWarehouse,
                CountRound: requestedRound,
            },
        });
        if (duplicateRound && Number(duplicateRound.StocktakingCountID) !== Number(id)) {
            throw new common_1.BadRequestException(`شمارش شماره ${requestedRound} برای این انبار در این دوره قبلاً ثبت شده است.`);
        }
        existing.StocktakingTagHeaderRef = targetTagHeader;
        existing.WarehouseRef = targetWarehouse;
        existing.StocktakingDate = dto.StocktakingDate;
        existing.StocktakingNumber = Number(dto.StocktakingNumber);
        existing.CountRound = requestedRound;
        if (dto.Status !== undefined)
            existing.Status = Number(dto.Status);
        existing.Description = dto.Description || '';
        if (dto.FiscalYearRef !== undefined)
            existing.FiscalYearRef = dto.FiscalYearRef ? Number(dto.FiscalYearRef) : undefined;
        await this.countRepo.save(existing);
        if (existing.details && existing.details.length > 0) {
            await this.detailRepo.remove(existing.details);
        }
        if (dto.details && dto.details.length > 0) {
            for (const d of dto.details) {
                const detailId = await this.idGenService.generateNextId('StocktakingCountDetails');
                const detail = this.detailRepo.create({
                    StocktakingCountDetailID: detailId,
                    StocktakingCountRef: id,
                    RowNumber: d.RowNumber,
                    ItemRef: Number(d.ItemRef),
                    TagNumber: d.TagNumber || '',
                    CountedQuantity: Number(d.CountedQuantity || 0),
                    Description: d.Description || '',
                });
                await this.detailRepo.save(detail);
                if (d.trackingFactors && d.trackingFactors.length > 0) {
                    for (const tf of d.trackingFactors) {
                        const tfRef = Number(tf.TrackingFactorRef);
                        if (isNaN(tfRef) || tfRef <= 0)
                            continue;
                        const tfId = await this.idGenService.generateNextId('StocktakingCountTrackingFactors');
                        const newTf = this.trackingFactorRepo.create({
                            StocktakingCountTrackingFactorID: tfId,
                            StocktakingCountDetailRef: detailId,
                            TrackingFactorRef: tfRef,
                            FactorValue: tf.FactorValue || '',
                            CountedQuantity: Number(tf.CountedQuantity || 0),
                        });
                        await this.trackingFactorRepo.save(newTf);
                    }
                }
            }
        }
        return this.findOne(id);
    }
    async remove(id) {
        const existing = await this.countRepo.findOne({
            where: { StocktakingCountID: id },
            relations: ['details'],
        });
        if (!existing) {
            throw new common_1.NotFoundException(`شمارش انبارگردانی با شناسه ${id} یافت نشد.`);
        }
        return this.countRepo.remove(existing);
    }
};
exports.StocktakingCountService = StocktakingCountService;
exports.StocktakingCountService = StocktakingCountService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(stocktaking_count_entity_1.StocktakingCount)),
    __param(1, (0, typeorm_1.InjectRepository)(stocktaking_count_detail_entity_1.StocktakingCountDetail)),
    __param(2, (0, typeorm_1.InjectRepository)(stocktaking_count_tracking_factor_entity_1.StocktakingCountTrackingFactor)),
    __param(3, (0, typeorm_1.InjectRepository)(stocktaking_tag_header_entity_1.StocktakingTagHeader)),
    __param(4, (0, typeorm_1.InjectRepository)(stocktaking_tag_detail_entity_1.StocktakingTagDetail)),
    __param(5, (0, typeorm_1.InjectRepository)(warehouse_entity_1.Warehouse)),
    __param(6, (0, typeorm_1.InjectRepository)(item_entity_1.Item)),
    __param(7, (0, typeorm_1.InjectRepository)(tracking_factor_item_related_entity_1.TrackingFactorItemRelated)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        id_generation_service_1.IdGenerationService,
        request_context_service_1.RequestContextService,
        typeorm_2.DataSource])
], StocktakingCountService);
//# sourceMappingURL=stocktaking-count.service.js.map