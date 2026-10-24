import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource, In } from 'typeorm';
import { StocktakingCount } from '../../domain/entities/stocktaking-count.entity';
import { StocktakingCountDetail } from '../../domain/entities/stocktaking-count-detail.entity';
import { StocktakingCountTrackingFactor } from '../../domain/entities/stocktaking-count-tracking-factor.entity';
import { StocktakingTagHeader } from '../../domain/entities/stocktaking-tag-header.entity';
import { StocktakingTagDetail } from '../../domain/entities/stocktaking-tag-detail.entity';
import { Warehouse } from '../../domain/entities/warehouse.entity';
import { Item } from '../../domain/entities/item.entity';
import { ItemSubUnit } from '../../domain/entities/item-sub-unit.entity';
import { TrackingFactorItemRelated } from '../../domain/entities/tracking-factor-item-related.entity';
import { EntityNumbering } from '../../../common/domain/entities/entity-numbering.entity';
import { FiscalYear } from '../../../common/domain/entities/fiscal-year.entity';
import { IdGenerationService } from '../../../../core/services/id-generation.service';
import { RequestContextService } from '../../../../core/services/request-context.service';
import { CreateStocktakingCountDto, UpdateStocktakingCountDto } from '../dtos/stocktaking-count.dto';

@Injectable()
export class StocktakingCountService {
  constructor(
    @InjectRepository(StocktakingCount)
    private readonly countRepo: Repository<StocktakingCount>,
    @InjectRepository(StocktakingCountDetail)
    private readonly detailRepo: Repository<StocktakingCountDetail>,
    @InjectRepository(StocktakingCountTrackingFactor)
    private readonly trackingFactorRepo: Repository<StocktakingCountTrackingFactor>,
    @InjectRepository(StocktakingTagHeader)
    private readonly tagHeaderRepo: Repository<StocktakingTagHeader>,
    @InjectRepository(StocktakingTagDetail)
    private readonly tagDetailRepo: Repository<StocktakingTagDetail>,
    @InjectRepository(Warehouse)
    private readonly warehouseRepo: Repository<Warehouse>,
    @InjectRepository(Item)
    private readonly itemRepo: Repository<Item>,
    @InjectRepository(TrackingFactorItemRelated)
    private readonly tfItemRelatedRepo: Repository<TrackingFactorItemRelated>,
    private readonly idGenService: IdGenerationService,
    private readonly requestContext: RequestContextService,
    private readonly dataSource: DataSource,
  ) {}

  async getPeriods(fiscalYearId?: number) {
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
        if (countTimes === 1) countMethodTitle = 'تک شمارشی';
        else if (countTimes === 2) countMethodTitle = 'دو شمارشی';
        else if (countTimes === 3) countMethodTitle = 'سه شمارشی';
      }

      return {
        StocktakingTagHeaderID: Number(h.StocktakingTagHeaderID),
        StocktakingPeriod: h.StocktakingPeriod || `دوره شماره ${h.StocktakingNumber} - ${h.StocktakingDate}`,
        StocktakingNumber: Number(h.StocktakingNumber),
        StocktakingDate: h.StocktakingDate,
        OfficerPartyRef: h.OfficerPartyRef ? Number(h.OfficerPartyRef) : null,
        OfficerPartyTitle: h.officerParty
          ? ((h.officerParty as any).firstName
              ? `${(h.officerParty as any).firstName} ${(h.officerParty as any).lastName || ''}`.trim()
              : (h.officerParty as any).title || (h.officerParty as any).name || '')
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

  async getWarehousesForTagHeader(tagHeaderId: number, excludeCompleted: boolean = true, currentCountId?: number) {
    if (!tagHeaderId || isNaN(tagHeaderId)) return [];

    // Query Tag Header & Setting to get CountTimes directly via SQL with ::text casting
    const tagHeaderSetting = await this.dataSource.query(
      `
      SELECT COALESCE(s."CountTimes", 1) AS "CountTimes"
      FROM "Inv"."StocktakingTagHeaders" h
      LEFT JOIN "Inv"."StocktakingSettings" s ON s."StocktakingSettingID" = h."StocktakingSettingRef"
      WHERE h."StocktakingTagHeaderID"::text = $1::text
      LIMIT 1
      `,
      [String(tagHeaderId)]
    );

    const maxCountTimes = Number(tagHeaderSetting?.[0]?.CountTimes || tagHeaderSetting?.[0]?.counttimes || 1);

    // Only warehouses that have issued tags for items with physical locations in that warehouse
    const rawWarehouses = await this.dataSource.query(
      `
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
      `,
      [String(tagHeaderId)]
    );

    let filteredWarehouses = rawWarehouses || [];

    if (excludeCompleted) {
      // Find count of existing rounds per warehouse for this tag header
      const queryParams: any[] = [String(tagHeaderId)];
      let excludeCountClause = '';
      if (currentCountId && !isNaN(currentCountId) && currentCountId > 0) {
        queryParams.push(String(currentCountId));
        excludeCountClause = `AND "StocktakingCountID"::text != $2::text`;
      }

      const completedCounts = await this.dataSource.query(
        `
        SELECT "WarehouseRef", COUNT(DISTINCT "CountRound") AS "roundsCount"
        FROM "Inv"."StocktakingCounts"
        WHERE "StocktakingTagHeaderRef"::text = $1::text ${excludeCountClause}
        GROUP BY "WarehouseRef"
        `,
        queryParams
      );

      const completedWarehouseMap = new Map<number, number>();
      for (const row of completedCounts || []) {
        const whId = Number(row.WarehouseRef || row.warehouseref);
        const rounds = Number(row.roundsCount || row.roundscount || row.count || 0);
        if (!isNaN(whId) && whId > 0) {
          completedWarehouseMap.set(whId, rounds);
        }
      }

      filteredWarehouses = filteredWarehouses.filter((rw: any) => {
        const whId = Number(rw.WarehouseID || rw.warehouseid);
        const doneRounds = completedWarehouseMap.get(whId) || 0;
        return doneRounds < maxCountTimes;
      });
    }

    return filteredWarehouses.map((rw: any) => ({
      WarehouseID: Number(rw.WarehouseID || rw.warehouseid),
      WarehouseCode: String(rw.WarehouseCode || rw.warehousecode || ''),
      WarehouseName: String(rw.WarehouseTitle || rw.warehousetitle || rw.WarehouseName || rw.warehousename || ''),
      WarehouseTitle: String(rw.WarehouseTitle || rw.warehousetitle || rw.WarehouseName || rw.warehousename || ''),
      WarehouseType: rw.WarehouseType || rw.warehousetype,
      title: `${rw.WarehouseCode || ''} - ${rw.WarehouseTitle || rw.WarehouseName || ''}`.trim(),
    }));
  }

  async getWarehouseCountStatus(tagHeaderId: number, warehouseId: number) {
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

    let nextRound: number | null = null;
    let isCompleted = false;

    if (!existingRounds.has(1)) {
      nextRound = 1;
    } else if (countTimes >= 2 && !existingRounds.has(2)) {
      nextRound = 2;
    } else if (countTimes >= 3 && !existingRounds.has(3)) {
      nextRound = 3;
    } else {
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

  async getItemsForCount(tagHeaderId: number, warehouseId: number, countId?: number, round?: number) {
    if (!tagHeaderId || !warehouseId) return [];

    const tagHeader = await this.tagHeaderRepo.findOne({
      where: { StocktakingTagHeaderID: tagHeaderId },
      relations: ['stocktakingSetting'],
    });

    // 1. Check if viewing an existing count
    let savedCount: StocktakingCount | null = null;
    if (countId && !isNaN(countId) && countId > 0) {
      savedCount = await this.countRepo.findOne({
        where: { StocktakingCountID: countId },
        relations: ['details', 'details.trackingFactors', 'details.trackingFactors.trackingFactor'],
      });
    }

    const targetRound = savedCount ? Number(savedCount.CountRound || 1) : (round || 1);

    // 2. Query tagged items for base item info
    const rawTagItems = await this.dataSource.query(
      `
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
      `,
      [tagHeaderId, warehouseId]
    );

    const tagItemsMap = new Map<number, any>();
    for (const r of rawTagItems || []) {
      tagItemsMap.set(Number(r.ItemRef || r.itemref), r);
    }

    // 3. Query system inventory stock in this warehouse
    const stockRows = await this.dataSource.query(
      `
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
      `,
      [warehouseId]
    ).catch((err) => {
      console.error('Failed to calculate system stock for stocktaking count:', err);
      return [];
    });

    const systemStockMap = new Map<number, number>();
    for (const sr of stockRows || []) {
      const itemKey = Number(sr.ItemID || sr.itemid || sr.ItemRef || sr.itemref);
      if (itemKey > 0) {
        systemStockMap.set(itemKey, Number(sr.balanceQty || sr.balanceqty || 0));
      }
    }

    // 4. Query prior counts (Count 1 and Count 2) if applicable
    let count1Record: StocktakingCount | null = null;
    let count2Record: StocktakingCount | null = null;

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

    const count1QtyMap = new Map<number, number>();
    const count1DetMap = new Map<number, StocktakingCountDetail>();
    if (count1Record?.details) {
      for (const d of count1Record.details) {
        count1QtyMap.set(Number(d.ItemRef), Number(d.CountedQuantity || 0));
        count1DetMap.set(Number(d.ItemRef), d);
      }
    }

    const count2QtyMap = new Map<number, number>();
    const count2DetMap = new Map<number, StocktakingCountDetail>();
    if (count2Record?.details) {
      for (const d of count2Record.details) {
        count2QtyMap.set(Number(d.ItemRef), Number(d.CountedQuantity || 0));
        count2DetMap.set(Number(d.ItemRef), d);
      }
    }

    // 5. Build base items list based on target round
    let itemsToProcess: Array<{
      ItemRef: number;
      TagNumber: string;
      StocktakingTagDetailID: number;
      ItemCode: string;
      ItemTitle: string;
      MeasurementUnitName: string;
      CountedQuantity: number;
      Description?: string;
      PreviousCount1Qty?: number;
      PreviousCount2Qty?: number;
      SystemStockQty?: number;
      savedDetail?: StocktakingCountDetail;
    }> = [];

    if (savedCount && savedCount.details && savedCount.details.length > 0) {
      // Editing existing count
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
    } else {
      // Creating NEW count
      if (targetRound === 1) {
        // Round 1: all tagged items
        itemsToProcess = (rawTagItems || []).map((row: any) => ({
          ItemRef: Number(row.ItemRef || row.itemref),
          TagNumber: String(row.TagNumber || row.tagnumber || ''),
          StocktakingTagDetailID: Number(row.StocktakingTagDetailID || row.stocktakingtagdetailid),
          ItemCode: String(row.ItemCode || row.itemcode || ''),
          ItemTitle: String(row.ItemTitle || row.itemtitle || ''),
          MeasurementUnitName: String(row.MeasurementUnitName || row.measurementunitname || ''),
          CountedQuantity: 0,
          Description: '',
        }));
      } else if (targetRound === 2) {
        // Round 2: filter items from Count 1 based on Count2ListType and Count2DiscrepancyPercent
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
            } else {
              // discrepancy_first_inv
              if (diff > 0.0001) {
                if (thresholdPct > 0) {
                  const absBook = Math.abs(qBook);
                  const pct = absBook > 0 ? (diff / absBook) * 100 : (qCount1 > 0 ? 100 : 0);
                  if (pct > thresholdPct) {
                    include = true;
                  }
                } else {
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
      } else if (targetRound === 3) {
        // Round 3: filter items based on Count 3 box settings (Count3CombineType, Count3DiscrepancyPercent, and checkboxes)
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

            const activeConditions: boolean[] = [];
            if (setting?.Count3Discrepancy1And2) activeConditions.push(match12);
            if (setting?.Count3Discrepancy1AndInv) activeConditions.push(match1Inv);
            if (setting?.Count3Discrepancy2AndInv) activeConditions.push(match2Inv);

            let keep = false;
            if (activeConditions.length === 0) {
              keep = match12 || match1Inv || match2Inv;
            } else if (combineType === 'AND') {
              keep = activeConditions.every(c => c === true);
            } else {
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

    // 6. Get tracking factor related configurations
    const allItemRefs = itemsToProcess.map(r => r.ItemRef);
    const relatedTfMap = new Map<number, any[]>();
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
            relatedTfMap.get(itemRef)!.push({
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
      } catch (err) {
        console.warn('Could not load tracking factors for stocktaking count:', err);
      }
    }

    // 7. Get item sub-units
    const subUnitsMap = new Map<number, any[]>();
    if (allItemRefs.length > 0) {
      try {
        const itemSubUnitRepo = this.dataSource.getRepository(ItemSubUnit);
        const subUnitsList = await itemSubUnitRepo.find({
          where: { ItemRef: In(allItemRefs) },
          relations: ['SubUnit'],
          order: { ItemSubUnitID: 'ASC' },
        });
        for (const su of (subUnitsList || [])) {
          const iRef = Number(su.ItemRef);
          if (!subUnitsMap.has(iRef)) subUnitsMap.set(iRef, []);
          subUnitsMap.get(iRef)!.push({
            ItemSubUnitID: Number(su.ItemSubUnitID),
            SubUnitRef: Number(su.SubUnitRef),
            SubUnitName: String(su.SubUnit?.MeasurementUnitName || ''),
            MainToSubRatio: Number(su.MainToSubRatio || 1),
            IsVariableRatio: su.IsVariableRatio === 1 || (su.IsVariableRatio as any) === true || String(su.IsVariableRatio) === '1',
            TolerancePercent: Number(su.TolerancePercent || 0),
          });
        }
      } catch (err) {
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

  async getNextNumber(fiscalYearId?: number, warehouseId?: number): Promise<number | string> {
    const businessStructureRef = this.requestContext.getBusinessStructureId() || 2;
    const companyRef = this.requestContext.getCompanyId() || 2;

    let startNumber = 1;
    let fixedChar = '';

    try {
      const entityNumberingRepo = this.dataSource.getRepository(EntityNumbering);
      const allConfigs = await entityNumberingRepo.find();
      
      const numberingConfig = allConfigs.find(c => {
        const r = String(c.entityRef || '').toLowerCase().replace(/^entity\./, '');
        return r === 'stocktaking_count' || r === 'stocktakingform' || r === 'stocktaking_form';
      }) || null;

      if (numberingConfig && numberingConfig.items) {
        let items: any = numberingConfig.items;
        if (typeof items === 'string') {
          try { items = JSON.parse(items); } catch {}
        }
        if (items) {
          let itemsList: any[] = items.fiscalYears || (Array.isArray(items) ? items : []);
          if (!Array.isArray(itemsList) && typeof items === 'object') {
            itemsList = [];
            Object.values(items).forEach((v) => {
              if (Array.isArray(v)) itemsList.push(...v);
            });
          }

          if (Array.isArray(itemsList) && itemsList.length > 0) {
            let matched = itemsList[0];

            let targetFyTitle = '';
            if (fiscalYearId && !isNaN(fiscalYearId) && Number(fiscalYearId) > 0) {
              try {
                const fyRepo = this.dataSource.getRepository(FiscalYear);
                const fy = await fyRepo.findOne({ where: { fiscalYearID: Number(fiscalYearId) } });
                if (fy && fy.title) targetFyTitle = String(fy.title).trim().toLowerCase();
              } catch (e) {}
            }

            let targetWhTitle = '';
            if (warehouseId && !isNaN(warehouseId) && Number(warehouseId) > 0) {
              try {
                const wh = await this.warehouseRepo.findOne({ where: { WarehouseID: Number(warehouseId) } });
                if (wh && wh.WarehouseTitle) targetWhTitle = String(wh.WarehouseTitle).trim().toLowerCase();
              } catch (e) {}
            }

            const foundMatch = itemsList.find((it: any) => {
              if (!it) return false;
              const fyMatch = !targetFyTitle || (it.fiscalYearTitle && String(it.fiscalYearTitle).trim().toLowerCase() === targetFyTitle);
              const whMatch = !targetWhTitle || (it.warehouseTitle && String(it.warehouseTitle).trim().toLowerCase() === targetWhTitle);
              return fyMatch && whMatch;
            }) || itemsList.find((it: any) => {
              if (!it) return false;
              if (targetWhTitle && it.warehouseTitle && String(it.warehouseTitle).trim().toLowerCase() === targetWhTitle) return true;
              if (targetFyTitle && it.fiscalYearTitle && String(it.fiscalYearTitle).trim().toLowerCase() === targetFyTitle) return true;
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
    } catch (e) {
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

  async findOne(id: number) {
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
      throw new NotFoundException(`شمارش انبارگردانی با شناسه ${id} یافت نشد.`);
    }

    return count;
  }

  async create(dto: CreateStocktakingCountDto) {
    const countId = await this.idGenService.generateNextId('StocktakingCounts');
    const businessStructureRef = dto.BusinessStructureRef || this.requestContext.getBusinessStructureId() || 2;
    const companyRef = dto.CompanyRef || this.requestContext.getCompanyId() || null;
    const fyRef = dto.FiscalYearRef ? Number(dto.FiscalYearRef) : undefined;
    const whRef = dto.WarehouseRef ? Number(dto.WarehouseRef) : undefined;

    let finalStocktakingNumber = dto.StocktakingNumber ? Number(dto.StocktakingNumber) : 0;

    if (finalStocktakingNumber <= 0) {
      const calculated = await this.getNextNumber(fyRef, whRef);
      finalStocktakingNumber = typeof calculated === 'number' ? calculated : parseInt(String(calculated).replace(/\D/g, ''), 10) || 1;
    } else {
      // Check for duplicate StocktakingNumber within same scope
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
      throw new BadRequestException(`شمارش شماره ${requestedRound} برای این انبار در این دوره قبلاً ثبت شده است.`);
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
            if (isNaN(tfRef) || tfRef <= 0) continue;
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

  async update(id: number, dto: UpdateStocktakingCountDto) {
    const existing = await this.countRepo.findOne({
      where: { StocktakingCountID: id },
      relations: ['details'],
    });

    if (!existing) {
      throw new NotFoundException(`شمارش انبارگردانی با شناسه ${id} یافت نشد.`);
    }

    const requestedRound = dto.CountRound !== undefined ? Number(dto.CountRound) : Number(existing.CountRound);
    const targetTagHeader = dto.StocktakingTagHeaderRef ? Number(dto.StocktakingTagHeaderRef) : Number(existing.StocktakingTagHeaderRef);
    const targetWarehouse = dto.WarehouseRef ? Number(dto.WarehouseRef) : Number(existing.WarehouseRef);
    const targetStatus = dto.Status !== undefined ? Number(dto.Status) : Number(existing.Status);

    // Prevent changing counted quantities if status is not Initial Registration (2) and target status is not Initial Registration
    if (Number(existing.Status) !== 2 && targetStatus !== 2 && dto.details && dto.details.length > 0) {
      const existingQtyMap = new Map<number, number>();
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
        throw new BadRequestException('امکان تغییر مقادیر شمارش در وضعیت تایید شده وجود ندارد. برای تغییر شمارش، ابتدا وضعیت را به ثبت اولیه تغییر دهید.');
      }
    }

    // Ensure no other record has the same round for this warehouse in this period
    const duplicateRound = await this.countRepo.findOne({
      where: {
        StocktakingTagHeaderRef: targetTagHeader,
        WarehouseRef: targetWarehouse,
        CountRound: requestedRound,
      },
    });
    if (duplicateRound && Number(duplicateRound.StocktakingCountID) !== Number(id)) {
      throw new BadRequestException(`شمارش شماره ${requestedRound} برای این انبار در این دوره قبلاً ثبت شده است.`);
    }

    existing.StocktakingTagHeaderRef = targetTagHeader;
    existing.WarehouseRef = targetWarehouse;
    existing.StocktakingDate = dto.StocktakingDate;
    existing.StocktakingNumber = Number(dto.StocktakingNumber);
    existing.CountRound = requestedRound;
    if (dto.Status !== undefined) existing.Status = Number(dto.Status);
    existing.Description = dto.Description || '';
    if (dto.FiscalYearRef !== undefined) existing.FiscalYearRef = dto.FiscalYearRef ? Number(dto.FiscalYearRef) : undefined;

    await this.countRepo.save(existing);

    // Delete existing details and recreate
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
            if (isNaN(tfRef) || tfRef <= 0) continue;
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

  async remove(id: number) {
    const existing = await this.countRepo.findOne({
      where: { StocktakingCountID: id },
      relations: ['details'],
    });

    if (!existing) {
      throw new NotFoundException(`شمارش انبارگردانی با شناسه ${id} یافت نشد.`);
    }

    return this.countRepo.remove(existing);
  }
}
