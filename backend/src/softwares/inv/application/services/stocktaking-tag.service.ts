import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { StocktakingTagHeader } from '../../domain/entities/stocktaking-tag-header.entity';
import { StocktakingTagDetail } from '../../domain/entities/stocktaking-tag-detail.entity';
import { StocktakingTag } from '../../domain/entities/stocktaking-tag.entity';
import { StocktakingSetting } from '../../domain/entities/stocktaking-setting.entity';
import { StocktakingSettingWarehouse } from '../../domain/entities/stocktaking-setting-warehouse.entity';
import { ItemPhysicalLocation } from '../../domain/entities/item-physical-location.entity';
import { Item } from '../../domain/entities/item.entity';
import { Warehouse } from '../../domain/entities/warehouse.entity';
import { IdGenerationService } from '../../../../core/services/id-generation.service';
import { CreateStocktakingTagHeaderDto, UpdateStocktakingTagHeaderDto } from '../dtos/stocktaking-tag.dto';

@Injectable()
export class StocktakingTagService {
  constructor(
    @InjectRepository(StocktakingTagHeader)
    private readonly headerRepo: Repository<StocktakingTagHeader>,
    @InjectRepository(StocktakingTagDetail)
    private readonly detailRepo: Repository<StocktakingTagDetail>,
    @InjectRepository(StocktakingTag)
    private readonly tagRepo: Repository<StocktakingTag>,
    @InjectRepository(StocktakingSettingWarehouse)
    private readonly settingWhRepo: Repository<StocktakingSettingWarehouse>,
    @InjectRepository(ItemPhysicalLocation)
    private readonly itemLocationRepo: Repository<ItemPhysicalLocation>,
    @InjectRepository(Item)
    private readonly itemRepo: Repository<Item>,
    @InjectRepository(Warehouse)
    private readonly warehouseRepo: Repository<Warehouse>,
    private readonly idGenService: IdGenerationService,
  ) {}

  async findAll() {
    const list = await this.headerRepo.find({
      relations: ['stocktakingSetting', 'officerParty', 'details'],
      order: { StocktakingTagHeaderID: 'DESC' },
    });
    return list.map((h: any) => {
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

  async getNextHeaderNumber(fiscalYearId?: number): Promise<{ nextNumber: number }> {
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

  normalizeDate(dStr: any): string {
    if (!dStr) return '';
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

  async getLatestStocktaking(fiscalYearId?: number, excludeHeaderId?: number): Promise<{ latestDate: string | null; count: number; header: any }> {
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

  async findOne(id: number, manager?: any) {
    const numId = Number(id);
    if (!numId || isNaN(numId)) {
      throw new NotFoundException(`Stocktaking Tag Header #${id} not found`);
    }
    const repo = manager ? manager.getRepository(StocktakingTagHeader) : this.headerRepo;
    const header = await repo.findOne({
      where: { StocktakingTagHeaderID: numId },
      relations: ['stocktakingSetting', 'officerParty', 'details', 'details.item', 'details.warehouse'],
    });
    if (!header) {
      throw new NotFoundException(`Stocktaking Tag Header #${id} not found`);
    }
    return header;
  }

  async getWarehousesForSetting(settingId?: number, headerId?: number) {
    let sId = settingId ? Number(settingId) : 0;
    const hId = headerId && Number(headerId) > 0 ? Number(headerId) : undefined;

    // If settingId is 0/invalid, but headerId is provided, fetch settingId from header
    if ((!sId || sId <= 0) && hId) {
      const header = await this.headerRepo.findOne({
        where: { StocktakingTagHeaderID: hId },
      });
      if (header && header.StocktakingSettingRef) {
        sId = Number(header.StocktakingSettingRef);
      }
    }

    const addedWhIds = new Set<number>();
    const results: any[] = [];

    // 1. Get warehouses assigned to this stocktaking setting
    if (sId > 0) {
      const settingWhs = await this.settingWhRepo.find({
        where: { StocktakingSettingRef: sId },
        relations: ['warehouse'],
      });

      if (settingWhs && settingWhs.length > 0) {
        for (const sw of settingWhs) {
          const whId = Number(sw.WarehouseRef);
          if (whId > 0) addedWhIds.add(whId);
        }
      }
    }

    // 2. Also include any warehouses that already have issued tags in this header
    if (hId) {
      const existingDetails = await this.detailRepo.find({
        where: { StocktakingTagHeaderRef: hId },
      });
      for (const d of existingDetails) {
        const whId = Number(d.WarehouseRef);
        if (whId > 0) addedWhIds.add(whId);
      }
    }

    // 3. Fallback: if no warehouses found yet, try finding any active setting or warehouses
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
        Code: String((wh as any)?.WarehouseCode || (wh as any)?.Code || whId),
        Title: String(
          (wh as any)?.WarehouseTitle ||
            (wh as any)?.WarehouseName ||
            (wh as any)?.Title ||
            `انبار ${whId}`,
        ),
        Type: (wh as any)?.IsActive !== false ? 'فعال' : 'غیرفعال',
        issuedTagCount: issuedCount,
      });
    }

    return results;
  }

  async getWarehouseItems(warehouseId: number, settingId?: number, headerId?: number) {
    const rawWhId = Number(warehouseId);
    let effectiveSettingId = settingId ? Number(settingId) : 0;
    const hId = headerId && Number(headerId) > 0 ? Number(headerId) : undefined;

    // If settingId was not provided, but headerId is available, load header to get its settingRef
    if ((!effectiveSettingId || effectiveSettingId <= 0) && hId) {
      const header = await this.headerRepo.findOne({
        where: { StocktakingTagHeaderID: hId },
      });
      if (header && header.StocktakingSettingRef) {
        effectiveSettingId = Number(header.StocktakingSettingRef);
      }
    }

    // Load StocktakingSetting to apply Count 1 filters (Min Qty, Min Rial, Min Turnover)
    let settingObj: StocktakingSetting | null = null;
    if (effectiveSettingId > 0) {
      settingObj = await this.headerRepo.manager.getRepository(StocktakingSetting).findOne({
        where: { StocktakingSettingID: effectiveSettingId },
      });
    }

    const minQty = settingObj ? Number(settingObj.Count1MinQty || 0) : 0;
    const minRial = settingObj ? Number(settingObj.Count1MinRial || 0) : 0;
    const minTurnover = settingObj ? Number(settingObj.Count1MinTurnover || 0) : 0;
    const hasCount1Filters = minQty > 0 || minRial > 0 || minTurnover > 0;

    // If warehouseId is 0 or negative ("همه انبارها"), determine all target warehouses
    let targetWhIds: number[] = [];
    if (rawWhId <= 0) {
      const summaries = await this.getWarehousesForSetting(effectiveSettingId, hId);
      targetWhIds = summaries.map((s) => s.WarehouseID).filter((id) => id > 0);
    } else {
      targetWhIds = [rawWhId];
    }

    if (targetWhIds.length === 0) {
      return [];
    }

    const allItemsCombined: any[] = [];

    for (const whId of targetWhIds) {
      // 1. Get physical locations for this specific warehouse
      const locations = await this.itemLocationRepo.find({
        where: { WarehouseRef: whId },
        relations: ['Item', 'Item.MeasurementUnit'],
      });

      let itemsList: any[] = [];
      if (locations && locations.length > 0) {
        itemsList = locations
          .filter((loc) => loc && loc.ItemRef)
          .map((loc) => {
            const itemObj = loc.Item || {};
            return {
              ItemID: Number(loc.ItemRef),
              Code: String((itemObj as any).ItemCode || (itemObj as any).Code || loc.ItemRef),
              Title: (itemObj as any).ItemName || (itemObj as any).Title || '',
              MeasurementUnitName: (itemObj as any).MeasurementUnit?.MeasurementUnitName || 'عدد',
              WarehouseID: whId,
            };
          })
          .filter((i) => i.ItemID > 0);
      }

      // 2. If no physical locations, check WarehouseProducts table
      if (itemsList.length === 0) {
        const whProducts = await this.warehouseRepo.manager
          .query(
            `SELECT wp.*, i."ItemID", i."ItemCode", i."ItemName", mu."MeasurementUnitName"
             FROM "Inv"."WarehouseProducts" wp
             LEFT JOIN "Inv"."Items" i ON CAST(i."ItemCode" AS text) = wp."ProductCode" OR CAST(i."ItemID" AS text) = wp."ProductCode"
             LEFT JOIN "Inv"."MeasurementUnits" mu ON mu."MeasurementUnitID" = i."MeasurementUnitRef"
             WHERE wp."WarehouseRef" = $1`,
            [whId],
          )
          .catch(() => []);

        if (whProducts && whProducts.length > 0) {
          itemsList = whProducts
            .filter((wp: any) => wp && (wp.ItemID || wp.ProductCode))
            .map((wp: any) => ({
              ItemID: Number(wp.ItemID || wp.WarehouseProductID),
              Code: String(wp.ItemCode || wp.ProductCode || wp.WarehouseProductID),
              Title: wp.ItemName || wp.ProductTitle || '',
              MeasurementUnitName: wp.MeasurementUnitName || 'عدد',
              WarehouseID: whId,
            }));
        }
      }

      // 3. If neither ItemPhysicalLocations nor WarehouseProducts are defined for this warehouse,
      // fetch all active inventory items
      if (itemsList.length === 0) {
        const allItems = await this.itemRepo.find({
          relations: ['MeasurementUnit'],
          order: { ItemID: 'ASC' },
        });

        itemsList = (allItems || []).map((item: any) => ({
          ItemID: Number(item.ItemID),
          Code: String(item.ItemCode || item.Code || item.ItemID),
          Title: String(item.ItemName || item.Title || `کالای ${item.ItemID}`),
          MeasurementUnitName: item.MeasurementUnit?.MeasurementUnitName || 'عدد',
          WarehouseID: whId,
        }));
      }

      // Check existing issued tags for this warehouse and header
      const tagMap = new Map<number, string>();
      if (hId) {
        const existingTags = await this.detailRepo.find({
          where: {
            StocktakingTagHeaderRef: hId,
            WarehouseRef: whId,
          },
          relations: ['item', 'item.MeasurementUnit'],
        });

        const existingItemIdsInList = new Set<number>(itemsList.map((i) => i.ItemID));

        existingTags.forEach((t) => {
          const itemRef = Number(t.ItemRef);
          if (t.TagNumber !== null && t.TagNumber !== undefined && String(t.TagNumber).trim() !== '') {
            tagMap.set(itemRef, String(t.TagNumber).trim());
          }

          // If this item already has a tag in this header but was not in locations/itemsList, add it
          if (itemRef > 0 && !existingItemIdsInList.has(itemRef)) {
            existingItemIdsInList.add(itemRef);
            const itemObj = t.item || {};
            itemsList.push({
              ItemID: itemRef,
              Code: String((itemObj as any).ItemCode || (itemObj as any).Code || itemRef),
              Title: (itemObj as any).ItemName || (itemObj as any).Title || `کالای ${itemRef}`,
              MeasurementUnitName: (itemObj as any).MeasurementUnit?.MeasurementUnitName || 'عدد',
              WarehouseID: whId,
            });
          }
        });
      }

      // Apply Count 1 criteria if defined in stocktaking setting:
      // Minimum quantity, minimum rial, and minimum turnover
      if (hasCount1Filters) {
        const statsRows: any[] = await this.warehouseRepo.manager
          .query(
            `SELECT 
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
             GROUP BY COALESCE(i."ItemID", d."ItemRef")`,
            [whId],
          )
          .catch((err) => {
            console.error('Failed to calculate stock stats for stocktaking tag:', err);
            return [];
          });

        // Also query standard item rates as fallback if an item has standard rate defined
        const stdRateRows: any[] = await this.warehouseRepo.manager
          .query(
            `SELECT srd."ItemRef", MAX(srd."UnitRate") AS "stdUnitRate"
             FROM "Inv"."StandardItemRates" sir
             INNER JOIN "Inv"."StandardItemRateDetails" srd ON srd."StandardItemRateRef" = sir."StandardItemRateID"
             GROUP BY srd."ItemRef"`
          )
          .catch(() => []);

        const stdRateMap = new Map<number, number>();
        for (const sr of stdRateRows) {
          if (sr.ItemRef) {
            stdRateMap.set(Number(sr.ItemRef), Number(sr.stdUnitRate || 0));
          }
        }

        const statsMap = new Map<number, { balanceQty: number; balanceRial: number; turnoverCount: number }>();
        for (const row of statsRows) {
          const itemRef = Number(row.ItemRef);
          if (!itemRef) continue;
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
            } else if (inAmt > outAmt && (inAmt - outAmt) > 0) {
              bRial = inAmt - outAmt;
            } else if (maxPrice > 0) {
              bRial = bQty * maxPrice;
            } else if (stdRateMap.has(itemRef) && stdRateMap.get(itemRef)! > 0) {
              bRial = bQty * stdRateMap.get(itemRef)!;
            }
          }

          statsMap.set(itemRef, {
            balanceQty: bQty,
            balanceRial: bRial,
            turnoverCount: tCount,
          });
        }

        itemsList = itemsList.filter((item) => {
          // If this item already has an issued tag in this existing header, preserve it
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

  private parseBigIntSafe(val: any, defaultVal: number | null = null): number | null {
    if (val === null || val === undefined || val === '') return defaultVal;
    if (typeof val === 'number') {
      return isNaN(val) ? defaultVal : val;
    }
    const parsed = parseInt(String(val), 10);
    return isNaN(parsed) ? defaultVal : parsed;
  }

  private extractValidDetails(rawDetails?: any[]): { warehouseRef: number; itemRef: number; tagNumber: string }[] {
    if (!Array.isArray(rawDetails)) return [];
    const result: { warehouseRef: number; itemRef: number; tagNumber: string }[] = [];

    for (const d of rawDetails) {
      if (!d) continue;
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

  async create(dto: CreateStocktakingTagHeaderDto) {
    try {
      const savedHeaderId = await this.headerRepo.manager.transaction(async (manager) => {
        const headerRepo = manager.getRepository(StocktakingTagHeader);
        const detailRepo = manager.getRepository(StocktakingTagDetail);
        const tagRepo = manager.getRepository(StocktakingTag);

        const rawHeaderId = await this.idGenService.generateNextId('StocktakingTagHeader');
        const headerId = this.parseBigIntSafe(rawHeaderId, 1)!;

        const rawPeriod = dto.StocktakingPeriod ?? (dto as any).stocktakingPeriod;
        const period = rawPeriod ? String(rawPeriod).trim() : '';
        if (!period) {
          throw new BadRequestException('ورود دوره انبارگردانی الزامی است');
        }

        const rawSettingVal = this.parseBigIntSafe(
          dto.StocktakingSettingRef ?? (dto as any).stocktakingSettingRef ?? (dto as any).methodRef,
          null,
        );
        let settingRef = rawSettingVal && rawSettingVal > 0 ? rawSettingVal : null;
        if (!settingRef) {
          const firstSettings = await this.settingWhRepo.find({ take: 1 });
          settingRef = firstSettings.length > 0 ? Number(firstSettings[0].StocktakingSettingRef) : 1;
        }
        const stockNumber = this.parseBigIntSafe(
          dto.StocktakingNumber ?? (dto as any).stocktakingNumber,
          1,
        )!;
        const officerRef = this.parseBigIntSafe(
          dto.OfficerPartyRef ?? (dto as any).officerPartyRef,
          null,
        );
        const fiscalYearRef = this.parseBigIntSafe(
          (dto as any).FiscalYearRef ?? (dto as any).fiscalYearRef,
          null,
        );

        const rawDate =
          dto.StocktakingDate ||
          (dto as any).stocktakingDate ||
          (dto as any).Stocktakingdate ||
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

        // Validate stocktaking date: cannot be before the latest stocktaking in this fiscal year
        const effectiveFy = fiscalYearRef ? Number(fiscalYearRef) : undefined;
        const latestInfo = await this.getLatestStocktaking(effectiveFy);
        if (latestInfo && latestInfo.latestDate) {
          const normInput = this.normalizeDate(formattedDate);
          const normLatest = this.normalizeDate(latestInfo.latestDate);
          if (normInput < normLatest) {
            throw new BadRequestException(
              `امکان صدور تگ انبارگردانی به تاریخ قبل از آخرین انبارگردانی ثبت‌شده (${latestInfo.latestDate}) در سال مالی جاری وجود ندارد.`,
            );
          }
        }

        // Validate that at least one item has an issued tag number
        const validDetails = this.extractValidDetails(dto.details);
        if (validDetails.length === 0) {
          throw new BadRequestException('امکان ذخیره اطلاعات وجود ندارد؛ حداقل باید برای یک کالا شماره تگ صادر شده باشد.');
        }

        const rawDescription = (dto as any).Description ?? (dto as any).description;
        const description = rawDescription !== undefined && rawDescription !== null ? String(rawDescription).trim() : undefined;

        const header = headerRepo.create({
          StocktakingTagHeaderID: headerId,
          StocktakingPeriod: period,
          StocktakingSettingRef: settingRef,
          StocktakingDate: formattedDate,
          StocktakingNumber: stockNumber,
          OfficerPartyRef: officerRef as any,
          Description: description,
          FiscalYearRef: fiscalYearRef as any,
          businessStructureRef: 2,
          companyRef: 2,
          version: 1,
          creator: 1,
          lastModifier: 1,
        });

        await headerRepo.save(header);

        if (validDetails.length > 0) {
          // 1. Save in StocktakingTagDetails
          const rawStartId = await this.idGenService.generateNextIdBlock(
            'StocktakingTagDetails',
            validDetails.length,
          );
          const startDetailId = this.parseBigIntSafe(rawStartId, 1)!;

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

          // 2. Save in StocktakingTags
          const rawStartTagId = await this.idGenService.generateNextIdBlock(
            'StocktakingTags',
            validDetails.length,
          );
          const startTagId = this.parseBigIntSafe(rawStartTagId, 1)!;

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
    } catch (err: any) {
      console.error('Error creating stocktaking tag:', err);
      throw err;
    }
  }

  async update(id: number, dto: UpdateStocktakingTagHeaderDto) {
    try {
      return await this.headerRepo.manager.transaction(async (manager) => {
        const headerRepo = manager.getRepository(StocktakingTagHeader);
        const detailRepo = manager.getRepository(StocktakingTagDetail);
        const tagRepo = manager.getRepository(StocktakingTag);

        const header = await headerRepo.findOne({
          where: { StocktakingTagHeaderID: Number(id) },
        });
        if (!header) {
          throw new NotFoundException(`Stocktaking Tag Header #${id} not found`);
        }

        const rawPeriod = dto.StocktakingPeriod ?? (dto as any).stocktakingPeriod;
        if (rawPeriod !== undefined) {
          const period = rawPeriod ? String(rawPeriod).trim() : '';
          if (!period) {
            throw new BadRequestException('ورود دوره انبارگردانی الزامی است');
          }
          header.StocktakingPeriod = period;
        }

        const rawSettingRef = dto.StocktakingSettingRef ?? (dto as any).stocktakingSettingRef ?? (dto as any).methodRef;
        const existingSettingRef = this.parseBigIntSafe(header.StocktakingSettingRef, null);
        const parsedSettingRef = this.parseBigIntSafe(rawSettingRef, existingSettingRef) || existingSettingRef;
        if (parsedSettingRef && parsedSettingRef > 0) {
          header.StocktakingSettingRef = parsedSettingRef;
        }

        const rawDate = dto.StocktakingDate ?? (dto as any).stocktakingDate;
        if (rawDate !== undefined && rawDate !== null) {
          let formattedDate = String(rawDate).trim();
          if (formattedDate.includes('T')) {
            formattedDate = formattedDate.split('T')[0].replace(/-/g, '/');
          }
          if (formattedDate) {
            header.StocktakingDate = formattedDate;
          }
        }

        const rawNumber = dto.StocktakingNumber ?? (dto as any).stocktakingNumber;
        if (rawNumber !== undefined) {
          header.StocktakingNumber = this.parseBigIntSafe(rawNumber, header.StocktakingNumber)!;
        }

        const rawOfficer = dto.OfficerPartyRef ?? (dto as any).officerPartyRef;
        if (rawOfficer !== undefined) {
          header.OfficerPartyRef = this.parseBigIntSafe(rawOfficer, null) as any;
        }

        const rawDescription = (dto as any).Description ?? (dto as any).description;
        if (rawDescription !== undefined) {
          header.Description = rawDescription !== null && String(rawDescription).trim() !== '' ? String(rawDescription).trim() : (null as any);
        }

        const rawFiscalYear = (dto as any).FiscalYearRef ?? (dto as any).fiscalYearRef;
        if (rawFiscalYear !== undefined && rawFiscalYear !== null) {
          header.FiscalYearRef = this.parseBigIntSafe(rawFiscalYear, header.FiscalYearRef) as any;
        }

        // Validate stocktaking date if changed: cannot be before the latest stocktaking in this fiscal year
        const effectiveFy = header.FiscalYearRef ? Number(header.FiscalYearRef) : undefined;
        const latestInfo = await this.getLatestStocktaking(effectiveFy, Number(id));
        if (latestInfo && latestInfo.latestDate) {
          const normInput = this.normalizeDate(header.StocktakingDate);
          const normLatest = this.normalizeDate(latestInfo.latestDate);
          if (normInput < normLatest) {
            throw new BadRequestException(
              `امکان صدور تگ انبارگردانی به تاریخ قبل از آخرین انبارگردانی ثبت‌شده (${latestInfo.latestDate}) در سال مالی جاری وجود ندارد.`,
            );
          }
        }

        if (!header.businessStructureRef) header.businessStructureRef = 2;
        if (!header.companyRef) header.companyRef = 2;

        await headerRepo.save(header);

        if (Array.isArray(dto.details)) {
          const validDetails = this.extractValidDetails(dto.details);
          if (validDetails.length === 0) {
            throw new BadRequestException('امکان ذخیره اطلاعات وجود ندارد؛ حداقل باید برای یک کالا شماره تگ صادر شده باشد.');
          }

          // Remove old details for affected warehouses
          const warehouseIds = Array.from(
            new Set(validDetails.map((d) => d.warehouseRef)),
          );

          if (warehouseIds.length > 0) {
            await detailRepo.delete({
              StocktakingTagHeaderRef: Number(id),
              WarehouseRef: In(warehouseIds),
            });
            await tagRepo.delete({
              StocktakingRef: Number(id),
              WarehouseRef: In(warehouseIds),
            });
          }

          if (validDetails.length > 0) {
            // 1. Save in StocktakingTagDetails
            const rawStartId = await this.idGenService.generateNextIdBlock(
              'StocktakingTagDetails',
              validDetails.length,
            );
            const startDetailId = this.parseBigIntSafe(rawStartId, 1)!;

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

            // 2. Save in StocktakingTags
            const rawStartTagId = await this.idGenService.generateNextIdBlock(
              'StocktakingTags',
              validDetails.length,
            );
            const startTagId = this.parseBigIntSafe(rawStartTagId, 1)!;

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
    } catch (err: any) {
      console.error('Error updating stocktaking tag:', err);
      throw err;
    }
  }

  async remove(id: number) {
    const header = await this.findOne(id);
    await this.detailRepo.delete({ StocktakingTagHeaderRef: id });
    await this.tagRepo.delete({ StocktakingRef: id });
    await this.headerRepo.remove(header);
    return { success: true };
  }

  async deleteWarehouseTags(headerId: number, warehouseId: number, itemIds?: number[]) {
    if (Array.isArray(itemIds)) {
      if (itemIds.length === 0) {
        return { success: true, deletedCount: 0 };
      }
      await this.detailRepo.delete({
        StocktakingTagHeaderRef: headerId,
        WarehouseRef: warehouseId,
        ItemRef: In(itemIds),
      });
      await this.tagRepo.delete({
        StocktakingRef: headerId,
        WarehouseRef: warehouseId,
        ItemRef: In(itemIds),
      });
    } else {
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
}
