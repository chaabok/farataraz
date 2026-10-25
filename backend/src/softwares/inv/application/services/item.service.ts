import { Injectable, Inject, NotFoundException, BadRequestException, ConflictException, OnModuleInit } from '@nestjs/common';
import moment from 'moment-jalaali';
import { parseToIsoDateString } from '../../../../core/utils/date-parser';
import { IItemRepository, IItemRepositoryToken } from '../../domain/repositories/item.repository.interface';
import { Item } from '../../domain/entities/item.entity';
import { ItemType } from '../../domain/enums/item.enums';
import { CreateItemDto } from '../dtos/create-item.dto';
import { UpdateItemDto } from '../dtos/update-item.dto';
import { IdGenerationService } from '../../../../core/services/id-generation.service';
import { RequestContextService } from '../../../../core/services/request-context.service';
import { UsageCheckService } from '../../../../core/services/usage-check.service';

@Injectable()
export class ItemService implements OnModuleInit {
  constructor(
    @Inject(IItemRepositoryToken)
    private readonly repository: IItemRepository,
    private readonly idGenerationService: IdGenerationService,
    private readonly requestContextService: RequestContextService,
    private readonly usageCheckService: UsageCheckService,
  ) {}

  async onModuleInit() {
    try {
      await this.repository.manager.connection.query(`
        UPDATE "Inv"."Items" i
        SET "PricingMethod" = c."PricingMethod"
        FROM "Inv"."ItemAccountCategories" c
        WHERE i."ItemAccountCategoryRef" = c."ItemAccountCategoryID"
          AND c."PricingMethod" IS NOT NULL
          AND (i."PricingMethod" IS NULL OR i."PricingMethod" <> c."PricingMethod");
      `);
    } catch (err) {
      // Ignore if table not created yet
    }
  }

  private async getScope() {
    let bsId = this.requestContextService.getBusinessStructureId() ?? 2;
    let compId = this.requestContextService.getCompanyId() ?? 2;
    if (bsId <= 1) bsId = 2;
    if (compId <= 1) compId = 2;
    let isShared = true;

    try {
      const rows = await this.repository.manager.connection.query(
        `SELECT "IsBasicInfoShared" FROM "Gnr"."BusinessStructure" WHERE "BusinessStructureID" IN ($1, 1)`,
        [bsId]
      );
      if (rows && rows.length > 0) {
        if (rows.some((r: any) => {
          const val = r.IsBasicInfoShared !== undefined ? r.IsBasicInfoShared : r.isBasicInfoShared;
          return val === false || val === 0 || val === 'false' || val === null;
        })) {
          isShared = false;
        }
      } else {
        isShared = false;
      }
    } catch (err) {
      isShared = false;
    }

    return { bsId, compId, isShared };
  }

  async findAll(query: any): Promise<any> {
    const { skip, take, ItemType: qItemType, type } = query || {};
    const { bsId, compId, isShared } = await this.getScope();

    let where: any = {};
    if (isShared) {
      where.businessStructureRef = bsId;
    } else {
      where.companyRef = compId;
    }

    if (qItemType !== undefined || type !== undefined) {
      where.ItemType = Number(qItemType ?? type);
    }

    const [data, total] = await Promise.all([
      this.repository.findAll({
        where,
        relations: ['ItemAccountCategory', 'MeasurementUnit'],
        skip: skip ? parseInt(skip, 10) : undefined,
        take: take ? parseInt(take, 10) : undefined,
        order: { ItemID: 'DESC' },
      }),
      this.repository.count({ where }),
    ]);

    const mappedData = data.map((i: any) => {
      const cat = i.ItemAccountCategory;
      const pm = cat?.PricingMethod;
      let valMethod = '-';
      if (pm === 1) valMethod = 'میانگین موزون';
      else if (pm === 2) valMethod = 'FIFO (نخستین ورودی، نخستین خروجی)';
      else if (pm === 3) valMethod = 'LIFO (آخرین ورودی، نخستین خروجی)';
      else if (pm === 4) valMethod = 'نرخ استاندارد';

      const catName = cat?.ItemAccountCategoryName || '-';

      return {
        ...i,
        CategoryName: catName,
        categoryName: catName,
        ItemAccountCategoryName: catName,
        category: catName,
        CategoryPricingMethod: pm ?? null,
        MeasurementUnitName: i.MeasurementUnit?.MeasurementUnitName || '-',
        ValuationMethod: valMethod,
        valuationMethod: valMethod,
        PricingMethodName: valMethod,
      };
    });

    return { data: mappedData, total, success: true };
  }

  async getDropdownItems(type?: string | number, warehouseId?: string | number, onlyActive?: boolean | string): Promise<any[]> {
    const { bsId, compId, isShared } = await this.getScope();

    let whereClause = '';
    const params: any[] = [];

    if (isShared) {
      whereClause = 'WHERE i."BusinessStructureRef" = $1';
      params.push(bsId);
    } else {
      whereClause = 'WHERE i."CompanyRef" = $1';
      params.push(compId);
    }

    if (onlyActive === true || onlyActive === 'true' || onlyActive === '1') {
      whereClause += ' AND i."IsActive" IS TRUE';
    } else if (onlyActive === false || onlyActive === 'false' || onlyActive === '0') {
      // no condition on active
    } else {
      whereClause += ' AND (i."IsActive" IS TRUE OR i."IsActive" IS NULL)';
    }

    if (type !== undefined && type !== null && type !== '') {
      params.push(Number(type));
      whereClause += ` AND i."ItemType" = $${params.length}`;
    }

    if (warehouseId !== undefined && warehouseId !== null && warehouseId !== '' && Number(warehouseId) > 0) {
      params.push(Number(warehouseId));
      const whParamIdx = params.length;
      whereClause += ` AND (
        EXISTS (
          SELECT 1 FROM "Inv"."ItemPhysicalLocations" ipl
          LEFT JOIN "Inv"."Warehouses" w ON w."WarehouseID" = ipl."WarehouseRef"
          WHERE ipl."ItemRef" = i."ItemID" 
            AND (ipl."WarehouseRef" = $${whParamIdx} OR w."ParentRef" = $${whParamIdx})
        )
        OR EXISTS (
          SELECT 1 FROM "Inv"."WarehouseProducts" wp
          LEFT JOIN "Inv"."Warehouses" w ON w."WarehouseID" = wp."WarehouseRef"
          WHERE CAST(i."ItemCode" AS text) = wp."ProductCode"
            AND (wp."WarehouseRef" = $${whParamIdx} OR w."ParentRef" = $${whParamIdx})
        )
      )`;
    }

    try {
      const rows = await this.repository.manager.connection.query(
        `SELECT 
          i."ItemID",
          i."ItemCode",
          i."ItemName",
          i."ItemName2",
          i."ItemType",
          i."IsActive",
          i."MeasurementUnitRef",
          mu."MeasurementUnitName" AS "MeasurementUnitName"
         FROM "Inv"."Items" i
         LEFT JOIN "Inv"."MeasurementUnits" mu ON mu."MeasurementUnitID" = i."MeasurementUnitRef"
         ${whereClause}
         ORDER BY i."ItemCode" ASC, i."ItemID" ASC`,
        params
      );

      const subUnitsRows = await this.repository.manager.connection.query(
        `SELECT 
          isu."ItemSubUnitID",
          isu."ItemRef",
          isu."SubUnitRef",
          isu."MainToSubRatio",
          isu."IsVariableRatio",
          isu."TolerancePercent",
          mu."MeasurementUnitCode" AS "SubUnitCode",
          mu."MeasurementUnitName" AS "SubUnitName",
          mu."MeasurementUnitName2" AS "SubUnitName2"
         FROM "Inv"."ItemSubUnits" isu
         LEFT JOIN "Inv"."MeasurementUnits" mu ON mu."MeasurementUnitID" = isu."SubUnitRef"`
      ).catch(() => []);

      const physicalLocsRows = await this.repository.manager.connection.query(
        `SELECT ipl."ItemRef", ipl."WarehouseRef", w."ParentRef"
         FROM "Inv"."ItemPhysicalLocations" ipl
         LEFT JOIN "Inv"."Warehouses" w ON w."WarehouseID" = ipl."WarehouseRef"`
      ).catch(() => []);

      const warehouseProductsRows = await this.repository.manager.connection.query(
        `SELECT wp."WarehouseRef", wp."ProductCode", i."ItemID", w."ParentRef"
         FROM "Inv"."WarehouseProducts" wp
         LEFT JOIN "Inv"."Items" i ON CAST(i."ItemCode" AS text) = wp."ProductCode"
         LEFT JOIN "Inv"."Warehouses" w ON w."WarehouseID" = wp."WarehouseRef"`
      ).catch(() => []);

      const physicalMap = new Map<number, Set<number>>();
      const addWarehouseToItem = (itemRef: number, whId: any, parentWhId: any) => {
        if (!itemRef) return;
        if (!physicalMap.has(itemRef)) {
          physicalMap.set(itemRef, new Set<number>());
        }
        const set = physicalMap.get(itemRef)!;
        if (whId) set.add(Number(whId));
        if (parentWhId) set.add(Number(parentWhId));
      };

      for (const pl of (physicalLocsRows || [])) {
        addWarehouseToItem(Number(pl.ItemRef), pl.WarehouseRef, pl.ParentRef);
      }
      for (const wp of (warehouseProductsRows || [])) {
        addWarehouseToItem(Number(wp.ItemID), wp.WarehouseRef, wp.ParentRef);
      }

      const subUnitsMap = new Map<number, any[]>();
      for (const su of (subUnitsRows || [])) {
        const itemRef = Number(su.ItemRef);
        if (!subUnitsMap.has(itemRef)) {
          subUnitsMap.set(itemRef, []);
        }
        subUnitsMap.get(itemRef)!.push({
          ItemSubUnitID: Number(su.ItemSubUnitID || su.SubUnitRef),
          SubUnitRef: Number(su.SubUnitRef),
          MeasurementUnitID: Number(su.SubUnitRef),
          MeasurementUnitCode: su.SubUnitCode || '',
          MeasurementUnitName: su.SubUnitName || '',
          MeasurementUnitName2: su.SubUnitName2 || '',
          MainToSubRatio: su.MainToSubRatio !== null && su.MainToSubRatio !== undefined ? Number(su.MainToSubRatio) : 1,
          IsVariableRatio: su.IsVariableRatio === 1 || su.IsVariableRatio === true || su.IsVariableRatio === "1" || String(su.IsVariableRatio).toLowerCase() === "true",
          TolerancePercent: su.TolerancePercent !== null && su.TolerancePercent !== undefined ? Number(su.TolerancePercent) : 0,
          UnitType: 'فرعی'
        });
      }

      return (rows || []).map((r: any) => {
        const itemId = Number(r.ItemID);
        const mainUnit = r.MeasurementUnitRef ? {
          MeasurementUnitID: Number(r.MeasurementUnitRef),
          MeasurementUnitCode: r.MeasurementUnitCode || '',
          MeasurementUnitName: r.MeasurementUnitName || '',
          MeasurementUnitName2: r.MeasurementUnitName2 || '',
          UnitType: 'اصلی'
        } : null;

        const itemSubUnits = subUnitsMap.get(itemId) || [];
        const whIds = Array.from(physicalMap.get(itemId) || []);

        return {
          id: r.ItemCode !== null && r.ItemCode !== undefined ? String(r.ItemCode) : String(r.ItemID),
          ItemID: itemId,
          ItemCode: r.ItemCode || '',
          ItemName: r.ItemName || '',
          UnitName: r.MeasurementUnitName || 'عدد',
          product_code: r.ItemCode !== null && r.ItemCode !== undefined ? String(r.ItemCode) : String(r.ItemID),
          product_name: r.ItemName || '',
          name: r.ItemName || '',
          name2: r.ItemName2 || '',
          unit: r.MeasurementUnitName || '',
          ItemType: r.ItemType !== null && r.ItemType !== undefined ? Number(r.ItemType) : 1,
          IsActive: r.IsActive !== false,
          MeasurementUnitRef: r.MeasurementUnitRef ? Number(r.MeasurementUnitRef) : null,
          MeasurementUnitCode: r.MeasurementUnitCode || '',
          MeasurementUnitName: r.MeasurementUnitName || '',
          MeasurementUnitName2: r.MeasurementUnitName2 || '',
          mainUnit,
          subUnits: itemSubUnits,
          allUnits: mainUnit ? [mainUnit, ...itemSubUnits] : [...itemSubUnits],
          physicalWarehouseIds: whIds,
        };
      });
    } catch (err) {
      console.error('Error fetching dropdown items:', err);
      return [];
    }
  }

  private async ensurePhysicalLocationsTable() {
    try {
      await this.repository.manager.connection.query(`
        CREATE SCHEMA IF NOT EXISTS "Inv";
        CREATE TABLE IF NOT EXISTS "Inv"."ItemPhysicalLocations" (
          "ItemPhysicalLocationID" bigint PRIMARY KEY,
          "Version" bigint DEFAULT 1,
          "Creator" bigint DEFAULT 1,
          "CreationDate" timestamp DEFAULT CURRENT_TIMESTAMP,
          "CreateTime" varchar(8) DEFAULT '00:00:00',
          "LastModifier" bigint DEFAULT 1,
          "LastModificationDate" timestamp DEFAULT CURRENT_TIMESTAMP,
          "LastModificationTime" varchar(8) DEFAULT '00:00:00',
          "BusinessStructureRef" bigint DEFAULT 2,
          "CompanyRef" bigint DEFAULT 2,
          "BranchRef" bigint,
          "AgencyRef" bigint,
          "ItemRef" bigint NOT NULL,
          "WarehouseRef" bigint NOT NULL,
          "IsDefault" boolean DEFAULT false
        );
      `);
    } catch (e) {
      console.warn("Table Inv.ItemPhysicalLocations creation warning:", e);
    }
  }

  async getPhysicalLocations(itemId: number) {
    await this.ensurePhysicalLocationsTable();
    try {
      const rows = await this.repository.manager.connection.query(
        `SELECT ipl."ItemPhysicalLocationID", ipl."ItemRef", ipl."WarehouseRef", ipl."IsDefault",
                w."WarehouseCode", w."WarehouseTitle", w."WarehouseTitle2", w."WarehouseType"
         FROM "Inv"."ItemPhysicalLocations" ipl
         LEFT JOIN "Inv"."Warehouses" w ON w."WarehouseID" = ipl."WarehouseRef"
         WHERE ipl."ItemRef" = $1`,
        [itemId]
      );
      return (rows || []).map((r: any) => ({
        ItemPhysicalLocationID: r.ItemPhysicalLocationID,
        ItemRef: r.ItemRef,
        WarehouseRef: r.WarehouseRef,
        IsDefault: r.IsDefault === true || r.IsDefault === 'true' || r.IsDefault === 1,
        Code: r.WarehouseCode || '',
        Title: r.WarehouseTitle || '',
        Title2: r.WarehouseTitle2 || '',
      }));
    } catch {
      return [];
    }
  }

  async savePhysicalLocations(itemId: number, locations: any[], bsId: number, compId: number) {
    await this.ensurePhysicalLocationsTable();
    try {
      await this.repository.manager.connection.query(
        `DELETE FROM "Inv"."ItemPhysicalLocations" WHERE "ItemRef" = $1`,
        [itemId]
      );

      if (Array.isArray(locations) && locations.length > 0) {
        for (const loc of locations) {
          if (!loc.WarehouseRef) continue;
          const newId = await this.idGenerationService.generateNextId('ItemPhysicalLocations');
          await this.repository.manager.connection.query(
            `INSERT INTO "Inv"."ItemPhysicalLocations"
             ("ItemPhysicalLocationID", "ItemRef", "WarehouseRef", "IsDefault", "BusinessStructureRef", "CompanyRef")
             VALUES ($1, $2, $3, $4, $5, $6)`,
            [
              newId,
              itemId,
              loc.WarehouseRef,
              loc.IsDefault ? true : false,
              bsId,
              compId
            ]
          );
        }
      }
    } catch (e) {
      console.error("Error saving physical locations:", e);
    }
  }

  private async ensureSubUnitsTable() {
    try {
      await this.repository.manager.connection.query(`
        CREATE SCHEMA IF NOT EXISTS "Inv";
        CREATE TABLE IF NOT EXISTS "Inv"."ItemSubUnits" (
          "ItemSubUnitID" bigint PRIMARY KEY,
          "Version" bigint DEFAULT 1,
          "Creator" bigint DEFAULT 1,
          "CreationDate" timestamp DEFAULT CURRENT_TIMESTAMP,
          "CreateTime" varchar(8) DEFAULT '00:00:00',
          "LastModifier" bigint DEFAULT 1,
          "LastModificationDate" timestamp DEFAULT CURRENT_TIMESTAMP,
          "LastModificationTime" varchar(8) DEFAULT '00:00:00',
          "BusinessStructureRef" bigint DEFAULT 2,
          "CompanyRef" bigint DEFAULT 2,
          "BranchRef" bigint,
          "AgencyRef" bigint,
          "ItemRef" bigint NOT NULL,
          "SubUnitRef" bigint NOT NULL,
          "MainToSubRatio" decimal(18, 4) DEFAULT 1,
          "IsVariableRatio" int DEFAULT 2,
          "TolerancePercent" decimal(18, 4) DEFAULT 0
        );
      `);
    } catch (e) {
      console.warn("Table Inv.ItemSubUnits creation warning:", e);
    }
  }

  async getSubUnits(itemId: number) {
    await this.ensureSubUnitsTable();
    try {
      const rows = await this.repository.manager.connection.query(
        `SELECT isu."ItemSubUnitID", isu."ItemRef", isu."SubUnitRef", isu."MainToSubRatio",
                isu."IsVariableRatio", isu."TolerancePercent",
                mu."MeasurementUnitCode" AS "SubUnitCode",
                mu."MeasurementUnitName" AS "SubUnitName",
                mu."MeasurementUnitName2" AS "SubUnitName2"
         FROM "Inv"."ItemSubUnits" isu
         LEFT JOIN "Inv"."MeasurementUnits" mu ON mu."MeasurementUnitID" = isu."SubUnitRef"
         WHERE isu."ItemRef" = $1
         ORDER BY isu."ItemSubUnitID" ASC`,
        [itemId]
      );
      return (rows || []).map((r: any) => ({
        ItemSubUnitID: r.ItemSubUnitID,
        ItemRef: r.ItemRef,
        SubUnitRef: r.SubUnitRef,
        MainToSubRatio: r.MainToSubRatio !== null && r.MainToSubRatio !== undefined ? Number(r.MainToSubRatio) : 1,
        IsVariableRatio: r.IsVariableRatio !== null && r.IsVariableRatio !== undefined ? Number(r.IsVariableRatio) : 2,
        TolerancePercent: r.TolerancePercent !== null && r.TolerancePercent !== undefined ? Number(r.TolerancePercent) : 0,
        SubUnitCode: r.SubUnitCode || '',
        SubUnitName: r.SubUnitName || '',
        SubUnitName2: r.SubUnitName2 || '',
      }));
    } catch {
      return [];
    }
  }

  async saveSubUnits(itemId: number, subUnits: any[], bsId: number, compId: number) {
    await this.ensureSubUnitsTable();
    try {
      await this.repository.manager.connection.query(
        `DELETE FROM "Inv"."ItemSubUnits" WHERE "ItemRef" = $1`,
        [itemId]
      );

      if (Array.isArray(subUnits) && subUnits.length > 0) {
        for (const su of subUnits) {
          if (!su.SubUnitRef) continue;
          const newId = await this.idGenerationService.generateNextId('ItemSubUnits');
          await this.repository.manager.connection.query(
            `INSERT INTO "Inv"."ItemSubUnits"
             ("ItemSubUnitID", "ItemRef", "SubUnitRef", "MainToSubRatio", "IsVariableRatio", "TolerancePercent", "BusinessStructureRef", "CompanyRef")
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
            [
              newId,
              itemId,
              su.SubUnitRef,
              su.MainToSubRatio !== undefined && su.MainToSubRatio !== null && su.MainToSubRatio !== "" ? parseFloat(su.MainToSubRatio) : 1,
              su.IsVariableRatio !== undefined && su.IsVariableRatio !== null && su.IsVariableRatio !== "" ? Number(su.IsVariableRatio) : 2,
              su.TolerancePercent !== undefined && su.TolerancePercent !== null && su.TolerancePercent !== "" ? parseFloat(su.TolerancePercent) : 0,
              bsId,
              compId
            ]
          );
        }
      }
    } catch (e) {
      console.error("Error saving sub units:", e);
    }
  }

  private async ensureInventoryControlsTable() {
    try {
      await this.repository.manager.connection.query(`
        CREATE SCHEMA IF NOT EXISTS "Inv";
        CREATE TABLE IF NOT EXISTS "Inv"."ItemInventoryControls" (
          "ItemInventoryControlID" bigint PRIMARY KEY,
          "Version" bigint DEFAULT 1,
          "Creator" bigint DEFAULT 1,
          "CreationDate" timestamp DEFAULT CURRENT_TIMESTAMP,
          "CreateTime" varchar(8) DEFAULT '00:00:00',
          "LastModifier" bigint DEFAULT 1,
          "LastModificationDate" timestamp DEFAULT CURRENT_TIMESTAMP,
          "LastModificationTime" varchar(8) DEFAULT '00:00:00',
          "BusinessStructureRef" bigint DEFAULT 2,
          "CompanyRef" bigint DEFAULT 2,
          "BranchRef" bigint,
          "AgencyRef" bigint,
          "ItemRef" bigint NOT NULL,
          "EffectiveDate" varchar(10),
          "MinQuantity" decimal(18, 4) DEFAULT 0,
          "MaxQuantity" decimal(18, 4) DEFAULT 0,
          "OrderQuantity" decimal(18, 4) DEFAULT 0,
          "ReorderPoint" decimal(18, 4) DEFAULT 0,
          "Description" varchar(500)
        );
      `);
    } catch (e) {
      console.warn("Table Inv.ItemInventoryControls creation warning:", e);
    }
  }

  async getInventoryControls(itemId: number) {
    await this.ensureInventoryControlsTable();
    try {
      const rows = await this.repository.manager.connection.query(
        `SELECT "ItemInventoryControlID", "ItemRef", "EffectiveDate", "MinQuantity",
                "MaxQuantity", "OrderQuantity", "ReorderPoint", "Description"
         FROM "Inv"."ItemInventoryControls"
         WHERE "ItemRef" = $1
         ORDER BY "ItemInventoryControlID" ASC`,
        [itemId]
      );
      return (rows || []).map((r: any) => ({
        ItemInventoryControlID: r.ItemInventoryControlID,
        ItemRef: r.ItemRef,
        EffectiveDate: r.EffectiveDate || '',
        MinQuantity: r.MinQuantity !== null && r.MinQuantity !== undefined ? Number(r.MinQuantity) : 0,
        MaxQuantity: r.MaxQuantity !== null && r.MaxQuantity !== undefined ? Number(r.MaxQuantity) : 0,
        OrderQuantity: r.OrderQuantity !== null && r.OrderQuantity !== undefined ? Number(r.OrderQuantity) : 0,
        ReorderPoint: r.ReorderPoint !== null && r.ReorderPoint !== undefined ? Number(r.ReorderPoint) : 0,
        Description: r.Description || '',
      }));
    } catch {
      return [];
    }
  }

  async saveInventoryControls(itemId: number, controls: any[], bsId: number, compId: number) {
    await this.ensureInventoryControlsTable();
    try {
      await this.repository.manager.connection.query(
        `DELETE FROM "Inv"."ItemInventoryControls" WHERE "ItemRef" = $1`,
        [itemId]
      );

      if (Array.isArray(controls) && controls.length > 0) {
        for (const ctrl of controls) {
          const newId = await this.idGenerationService.generateNextId('ItemInventoryControls');
          await this.repository.manager.connection.query(
            `INSERT INTO "Inv"."ItemInventoryControls"
             ("ItemInventoryControlID", "ItemRef", "EffectiveDate", "MinQuantity", "MaxQuantity", "OrderQuantity", "ReorderPoint", "Description", "BusinessStructureRef", "CompanyRef")
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)`,
            [
              newId,
              itemId,
              ctrl.EffectiveDate || null,
              ctrl.MinQuantity !== undefined && ctrl.MinQuantity !== null && ctrl.MinQuantity !== "" ? parseFloat(ctrl.MinQuantity) : 0,
              ctrl.MaxQuantity !== undefined && ctrl.MaxQuantity !== null && ctrl.MaxQuantity !== "" ? parseFloat(ctrl.MaxQuantity) : 0,
              ctrl.OrderQuantity !== undefined && ctrl.OrderQuantity !== null && ctrl.OrderQuantity !== "" ? parseFloat(ctrl.OrderQuantity) : 0,
              ctrl.ReorderPoint !== undefined && ctrl.ReorderPoint !== null && ctrl.ReorderPoint !== "" ? parseFloat(ctrl.ReorderPoint) : 0,
              ctrl.Description || null,
              bsId,
              compId
            ]
          );
        }
      }
    } catch (e) {
      console.error("Error saving inventory controls:", e);
    }
  }

  private async ensureVolumeCbmsTable() {
    try {
      await this.repository.manager.connection.query(`
        CREATE SCHEMA IF NOT EXISTS "Inv";
        CREATE TABLE IF NOT EXISTS "Inv"."ItemVolumeCbms" (
          "ItemVolumeCbmID" bigint PRIMARY KEY,
          "Version" bigint DEFAULT 1,
          "Creator" bigint DEFAULT 1,
          "CreationDate" timestamp DEFAULT CURRENT_TIMESTAMP,
          "CreateTime" varchar(8) DEFAULT '00:00:00',
          "LastModifier" bigint DEFAULT 1,
          "LastModificationDate" timestamp DEFAULT CURRENT_TIMESTAMP,
          "LastModificationTime" varchar(8) DEFAULT '00:00:00',
          "BusinessStructureRef" bigint DEFAULT 2,
          "CompanyRef" bigint DEFAULT 2,
          "BranchRef" bigint,
          "AgencyRef" bigint,
          "ItemRef" bigint NOT NULL,
          "Quantity" decimal(18, 4) DEFAULT 1,
          "MeasurementUnitRef" bigint,
          "Length" decimal(18, 4) DEFAULT 0,
          "Width" decimal(18, 4) DEFAULT 0,
          "Height" decimal(18, 4) DEFAULT 0,
          "Volume" decimal(18, 4) DEFAULT 0,
          "Description" varchar(500)
        );
      `);
    } catch (e) {
      console.warn("Table Inv.ItemVolumeCbms creation warning:", e);
    }
  }

  async getVolumeCbms(itemId: number) {
    await this.ensureVolumeCbmsTable();
    try {
      const rows = await this.repository.manager.connection.query(
        `SELECT ivc."ItemVolumeCbmID", ivc."ItemRef", ivc."Quantity", ivc."MeasurementUnitRef",
                ivc."Length", ivc."Width", ivc."Height", ivc."Volume", ivc."Description",
                mu."MeasurementUnitCode", mu."MeasurementUnitName", mu."MeasurementUnitName2"
         FROM "Inv"."ItemVolumeCbms" ivc
         LEFT JOIN "Inv"."MeasurementUnits" mu ON mu."MeasurementUnitID" = ivc."MeasurementUnitRef"
         WHERE ivc."ItemRef" = $1
         ORDER BY ivc."ItemVolumeCbmID" ASC`,
        [itemId]
      );
      return (rows || []).map((r: any) => ({
        ItemVolumeCbmID: r.ItemVolumeCbmID,
        ItemRef: r.ItemRef,
        Quantity: r.Quantity !== null && r.Quantity !== undefined ? Number(r.Quantity) : 1,
        MeasurementUnitRef: r.MeasurementUnitRef ? Number(r.MeasurementUnitRef) : null,
        Length: r.Length !== null && r.Length !== undefined ? Number(r.Length) : 0,
        Width: r.Width !== null && r.Width !== undefined ? Number(r.Width) : 0,
        Height: r.Height !== null && r.Height !== undefined ? Number(r.Height) : 0,
        Volume: r.Volume !== null && r.Volume !== undefined ? Number(r.Volume) : 0,
        Description: r.Description || '',
        MeasurementUnitCode: r.MeasurementUnitCode || '',
        MeasurementUnitName: r.MeasurementUnitName || '',
        MeasurementUnitName2: r.MeasurementUnitName2 || '',
      }));
    } catch {
      return [];
    }
  }

  async saveVolumeCbms(itemId: number, volumeCbms: any[], bsId: number, compId: number) {
    await this.ensureVolumeCbmsTable();
    try {
      await this.repository.manager.connection.query(
        `DELETE FROM "Inv"."ItemVolumeCbms" WHERE "ItemRef" = $1`,
        [itemId]
      );

      if (Array.isArray(volumeCbms) && volumeCbms.length > 0) {
        for (const vc of volumeCbms) {
          const newId = await this.idGenerationService.generateNextId('ItemVolumeCbms');
          const qty = vc.Quantity !== undefined && vc.Quantity !== null && vc.Quantity !== "" ? parseFloat(vc.Quantity) : 1;
          const len = vc.Length !== undefined && vc.Length !== null && vc.Length !== "" ? parseFloat(vc.Length) : 0;
          const wdt = vc.Width !== undefined && vc.Width !== null && vc.Width !== "" ? parseFloat(vc.Width) : 0;
          const hgt = vc.Height !== undefined && vc.Height !== null && vc.Height !== "" ? parseFloat(vc.Height) : 0;
          const vol = vc.Volume !== undefined && vc.Volume !== null && vc.Volume !== "" ? parseFloat(vc.Volume) : (qty * len * wdt * hgt);

          await this.repository.manager.connection.query(
            `INSERT INTO "Inv"."ItemVolumeCbms"
             ("ItemVolumeCbmID", "ItemRef", "Quantity", "MeasurementUnitRef", "Length", "Width", "Height", "Volume", "Description", "BusinessStructureRef", "CompanyRef")
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)`,
            [
              newId,
              itemId,
              qty,
              vc.MeasurementUnitRef ? Number(vc.MeasurementUnitRef) : null,
              len,
              wdt,
              hgt,
              vol,
              vc.Description || null,
              bsId,
              compId
            ]
          );
        }
      }
    } catch (e) {
      console.error("Error saving volume cbms:", e);
    }
  }

  private async ensureSimilarItemsTable() {
    try {
      await this.repository.manager.connection.query(`
        CREATE SCHEMA IF NOT EXISTS "Inv";
        CREATE TABLE IF NOT EXISTS "Inv"."ItemSimilarItems" (
          "ItemSimilarItemID" bigint PRIMARY KEY,
          "Version" bigint DEFAULT 1,
          "Creator" bigint DEFAULT 1,
          "CreationDate" timestamp DEFAULT CURRENT_TIMESTAMP,
          "CreateTime" varchar(8) DEFAULT '00:00:00',
          "LastModifier" bigint DEFAULT 1,
          "LastModificationDate" timestamp DEFAULT CURRENT_TIMESTAMP,
          "LastModificationTime" varchar(8) DEFAULT '00:00:00',
          "BusinessStructureRef" bigint DEFAULT 2,
          "CompanyRef" bigint DEFAULT 2,
          "BranchRef" bigint,
          "AgencyRef" bigint,
          "ItemRef" bigint NOT NULL,
          "SimilarItemRef" bigint NOT NULL,
          "MeasurementUnitRef" bigint,
          "QuantityRatio" decimal(18, 4) DEFAULT 1,
          "Priority" int DEFAULT 1,
          "Description" varchar(500)
        );
      `);
    } catch (e) {
      console.warn("Table Inv.ItemSimilarItems creation warning:", e);
    }
  }

  async getSimilarItems(itemId: number) {
    await this.ensureSimilarItemsTable();
    try {
      const rows = await this.repository.manager.connection.query(
        `SELECT isi."ItemSimilarItemID", isi."ItemRef", isi."SimilarItemRef", isi."MeasurementUnitRef",
                isi."QuantityRatio", isi."Priority", isi."Description",
                i."ItemCode" AS "SimilarItemCode",
                i."ItemName" AS "SimilarItemName",
                i."ItemName2" AS "SimilarItemName2",
                i."MeasurementUnitRef" AS "MainMeasurementUnitRef",
                mu."MeasurementUnitCode", mu."MeasurementUnitName", mu."MeasurementUnitName2"
         FROM "Inv"."ItemSimilarItems" isi
         LEFT JOIN "Inv"."Items" i ON i."ItemID" = isi."SimilarItemRef"
         LEFT JOIN "Inv"."MeasurementUnits" mu ON mu."MeasurementUnitID" = isi."MeasurementUnitRef"
         WHERE isi."ItemRef" = $1
         ORDER BY isi."Priority" ASC, isi."ItemSimilarItemID" ASC`,
        [itemId]
      );
      return (rows || []).map((r: any) => ({
        ItemSimilarItemID: r.ItemSimilarItemID,
        ItemRef: r.ItemRef,
        SimilarItemRef: Number(r.SimilarItemRef),
        SimilarItemCode: r.SimilarItemCode !== null && r.SimilarItemCode !== undefined ? String(r.SimilarItemCode) : '',
        SimilarItemName: r.SimilarItemName || '',
        SimilarItemName2: r.SimilarItemName2 || '',
        MeasurementUnitRef: r.MeasurementUnitRef ? Number(r.MeasurementUnitRef) : (r.MainMeasurementUnitRef ? Number(r.MainMeasurementUnitRef) : null),
        QuantityRatio: r.QuantityRatio !== null && r.QuantityRatio !== undefined ? Number(r.QuantityRatio) : 1,
        Priority: r.Priority !== null && r.Priority !== undefined ? Number(r.Priority) : 1,
        Description: r.Description || '',
        MeasurementUnitCode: r.MeasurementUnitCode || '',
        MeasurementUnitName: r.MeasurementUnitName || '',
        MeasurementUnitName2: r.MeasurementUnitName2 || '',
      }));
    } catch {
      return [];
    }
  }

  async saveSimilarItems(itemId: number, similarItems: any[], bsId: number, compId: number) {
    await this.ensureSimilarItemsTable();
    try {
      await this.repository.manager.connection.query(
        `DELETE FROM "Inv"."ItemSimilarItems" WHERE "ItemRef" = $1`,
        [itemId]
      );

      if (Array.isArray(similarItems) && similarItems.length > 0) {
        for (const item of similarItems) {
          if (!item.SimilarItemRef) continue;
          const newId = await this.idGenerationService.generateNextId('ItemSimilarItems');
          await this.repository.manager.connection.query(
            `INSERT INTO "Inv"."ItemSimilarItems"
             ("ItemSimilarItemID", "ItemRef", "SimilarItemRef", "MeasurementUnitRef", "QuantityRatio", "Priority", "Description", "BusinessStructureRef", "CompanyRef")
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`,
            [
              newId,
              itemId,
              item.SimilarItemRef,
              item.MeasurementUnitRef ? Number(item.MeasurementUnitRef) : null,
              item.QuantityRatio !== undefined && item.QuantityRatio !== null && item.QuantityRatio !== "" ? parseFloat(item.QuantityRatio) : 1,
              item.Priority !== undefined && item.Priority !== null && item.Priority !== "" ? parseInt(item.Priority, 10) : 1,
              item.Description || null,
              bsId,
              compId
            ]
          );
        }
      }
    } catch (e) {
      console.error("Error saving similar items:", e);
    }
  }

  private async ensureItemImagesTable() {
    try {
      await this.repository.manager.connection.query(`
        CREATE SCHEMA IF NOT EXISTS "Inv";
        CREATE TABLE IF NOT EXISTS "Inv"."ItemImages" (
          "ItemImageID" bigint PRIMARY KEY,
          "Version" bigint DEFAULT 1,
          "Creator" bigint DEFAULT 1,
          "CreationDate" timestamp DEFAULT CURRENT_TIMESTAMP,
          "CreateTime" varchar(8) DEFAULT '00:00:00',
          "LastModifier" bigint DEFAULT 1,
          "LastModificationDate" timestamp DEFAULT CURRENT_TIMESTAMP,
          "LastModificationTime" varchar(8) DEFAULT '00:00:00',
          "BusinessStructureRef" bigint DEFAULT 2,
          "CompanyRef" bigint DEFAULT 2,
          "ItemRef" bigint NOT NULL,
          "ImageName" varchar(250),
          "IsMain" boolean DEFAULT false,
          "ThumbnailUrl" text,
          "MediumUrl" text,
          "OriginalUrl" text,
          "FileSize" bigint DEFAULT 0
        );
      `);
    } catch (e) {
      console.warn("Table Inv.ItemImages creation warning:", e);
    }
  }

  async getItemImages(itemId: number) {
    await this.ensureItemImagesTable();
    try {
      const rows = await this.repository.manager.connection.query(
        `SELECT "ItemImageID", "ImageName", "IsMain", "ThumbnailUrl", "MediumUrl", "OriginalUrl", "FileSize", "CreationDate"
         FROM "Inv"."ItemImages" WHERE "ItemRef" = $1 ORDER BY "ItemImageID" ASC`,
        [itemId]
      );
      return (rows || []).map((r: any) => ({
        id: String(r.ItemImageID),
        name: r.ImageName || '',
        isMain: r.IsMain === true || r.IsMain === 'true' || r.IsMain === 1,
        thumbnailUrl: r.ThumbnailUrl || '',
        mediumUrl: r.MediumUrl || '',
        originalUrl: r.OriginalUrl || '',
        size: Number(r.FileSize || 0),
        createdAt: r.CreationDate ? new Date(r.CreationDate).toLocaleDateString("fa-IR") : '',
      }));
    } catch {
      return [];
    }
  }

  async saveItemImages(itemId: number, images: any[], bsId: number, compId: number) {
    await this.ensureItemImagesTable();
    try {
      await this.repository.manager.connection.query(
        `DELETE FROM "Inv"."ItemImages" WHERE "ItemRef" = $1`,
        [itemId]
      );

      if (Array.isArray(images) && images.length > 0) {
        for (const img of images) {
          const newId = await this.idGenerationService.generateNextId('ItemImages');
          await this.repository.manager.connection.query(
            `INSERT INTO "Inv"."ItemImages"
             ("ItemImageID", "ItemRef", "ImageName", "IsMain", "ThumbnailUrl", "MediumUrl", "OriginalUrl", "FileSize", "BusinessStructureRef", "CompanyRef")
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)`,
            [
              newId,
              itemId,
              img.name || 'image',
              img.isMain ? true : false,
              img.thumbnailUrl || null,
              img.mediumUrl || null,
              img.originalUrl || null,
              img.size || 0,
              bsId,
              compId
            ]
          );
        }
      }
    } catch (e) {
      console.error("Error saving item images:", e);
    }
  }

  async findOne(id: number): Promise<any> {
    const entity = await this.repository.findById(id);
    if (!entity) throw new NotFoundException('کالا / خدمت یافت نشد');
    const physicalLocations = await this.getPhysicalLocations(id);
    const subUnits = await this.getSubUnits(id);
    const inventoryControls = await this.getInventoryControls(id);
    const volumeCbms = await this.getVolumeCbms(id);
    const similarItems = await this.getSimilarItems(id);
    const images = await this.getItemImages(id);
    return {
      ...entity,
      ItemPhysicalLocations: physicalLocations,
      ItemSubUnits: subUnits,
      ItemInventoryControls: inventoryControls,
      ItemVolumeCbms: volumeCbms,
      ItemSimilarItems: similarItems,
      ItemImages: images,
    };
  }

  async getNextNumber(): Promise<{ documentNumber: string; isDocumentNumberAuto: boolean; error?: string }> {
    const settings = await this.getInventorySettings();
    if (settings.itemCodingMethod === '2') {
      return {
        documentNumber: '',
        isDocumentNumberAuto: false,
      };
    }

    const companyId = (this.requestContextService.getCompanyId() && this.requestContextService.getCompanyId()! > 1) ? this.requestContextService.getCompanyId()! : 2;
    const bsId = (this.requestContextService.getBusinessStructureId() && this.requestContextService.getBusinessStructureId()! > 1) ? this.requestContextService.getBusinessStructureId()! : 2;
    const res = await this.repository.calculateNextCode(bsId, companyId);
    let docNum = res.nextValue;

    if (docNum && settings.isItemCodeLengthFixed && docNum.length < settings.itemCodeLength) {
      docNum = docNum.padStart(settings.itemCodeLength, '0');
    }

    return {
      documentNumber: docNum,
      isDocumentNumberAuto: res.numberingMethod === '2',
      error: res.error,
    };
  }

  async checkDuplicate(field: string, value: any, excludeId?: number): Promise<boolean> {
    return this.repository.checkDuplicate(field, value, excludeId);
  }

  private async getInventorySettings() {
    try {
      const { bsId } = await this.getScope();
      const rows = await this.repository.manager.connection.query(
        `SELECT "Key", "Value" FROM "Gnr"."BaseSettings" WHERE "TabRef" = 3 AND "BusinessStructureRef" = $1 AND "Key" IN ('isItemCodeLengthFixed', 'itemCodeLength', 'allowItemCodeLetters', 'isItemCodeLatin', 'allowDuplicateItemName', 'itemCodingMethod')`,
        [bsId]
      );
      const settings = {
        isItemCodeLengthFixed: false,
        itemCodeLength: 10,
        allowItemCodeLetters: false,
        isItemCodeLatin: false,
        allowDuplicateItemName: false,
        itemCodingMethod: '1',
      };
      if (rows && rows.length > 0) {
        for (const row of rows) {
          if (row.Key === 'isItemCodeLengthFixed') settings.isItemCodeLengthFixed = row.Value === 'true' || row.Value === true;
          if (row.Key === 'itemCodeLength' && row.Value) settings.itemCodeLength = parseInt(row.Value, 10) || 10;
          if (row.Key === 'allowItemCodeLetters') settings.allowItemCodeLetters = row.Value === 'true' || row.Value === true;
          if (row.Key === 'isItemCodeLatin') settings.isItemCodeLatin = row.Value === 'true' || row.Value === true;
          if (row.Key === 'allowDuplicateItemName') settings.allowDuplicateItemName = row.Value === 'true' || row.Value === true;
          if (row.Key === 'itemCodingMethod' && row.Value) settings.itemCodingMethod = String(row.Value);
        }
      }
      return settings;
    } catch {
      return {
        isItemCodeLengthFixed: false,
        itemCodeLength: 10,
        allowItemCodeLetters: false,
        isItemCodeLatin: false,
        allowDuplicateItemName: false,
        itemCodingMethod: '1',
      };
    }
  }

  private async validateDuplicates(dto: Partial<CreateItemDto | UpdateItemDto>, excludeId?: number) {
    const settings = await this.getInventorySettings();

    if (dto.ItemCode !== undefined && dto.ItemCode !== null) {
      let codeStr = String(dto.ItemCode).trim();
      if (codeStr !== '') {
        if (settings.isItemCodeLengthFixed && codeStr.length < settings.itemCodeLength) {
          codeStr = codeStr.padStart(settings.itemCodeLength, '0');
          (dto as any).ItemCode = codeStr;
        }
        if (settings.itemCodeLength && codeStr.length > settings.itemCodeLength) {
          throw new BadRequestException(`طول کد کالا نمی‌تواند بیشتر از ${settings.itemCodeLength} رقم باشد`);
        }
        if (!settings.allowItemCodeLetters && /[^\d]/.test(codeStr)) {
          throw new BadRequestException('کد کالا نمی‌تواند شامل حرف باشد');
        }
        const persianRegex = /[\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF\uFB50-\uFDFF\uFE70-\uFEFF]/;
        if (settings.isItemCodeLatin && persianRegex.test(codeStr)) {
          throw new BadRequestException('کد کالا لاتین است و نمی‌تواند شامل حروف فارسی باشد');
        }
      }

      const isDuplicateCode = await this.checkDuplicate('ItemCode', dto.ItemCode, excludeId);
      if (isDuplicateCode) {
        throw new BadRequestException('کد کالا / خدمت تکراری است');
      }
    }

    if (dto.ItemName !== undefined && dto.ItemName !== null && dto.ItemName.trim() !== '') {
      if (!settings.allowDuplicateItemName) {
        const isDuplicateTitle = await this.checkDuplicate('ItemName', dto.ItemName, excludeId);
        if (isDuplicateTitle) {
          throw new BadRequestException('عنوان کالا / خدمت تکراری است');
        }
      }
    }
  }

  async create(createDto: CreateItemDto): Promise<Item> {
    if (createDto.ItemType === undefined || createDto.ItemType === null) {
      throw new BadRequestException('نوع کالا / خدمت اجباری است');
    }
    if (!createDto.MeasurementUnitRef) {
      throw new BadRequestException('واحد سنجش اجباری است');
    }
    if (!createDto.ItemAccountCategoryRef && Number(createDto.ItemType) !== ItemType.SERVICE) {
      throw new BadRequestException('طبقه کالا اجباری است');
    }

    const userId = this.requestContextService.getUserId();
    const companyId = (this.requestContextService.getCompanyId() && this.requestContextService.getCompanyId()! > 1) ? this.requestContextService.getCompanyId()! : 2;
    const bsId = (this.requestContextService.getBusinessStructureId() && this.requestContextService.getBusinessStructureId()! > 1) ? this.requestContextService.getBusinessStructureId()! : 2;

    let codeToSave = createDto.ItemCode;
    const settings = await this.getInventorySettings();

    if (!codeToSave || String(codeToSave).trim() === '') {
      if (settings.itemCodingMethod === '2') {
        throw new BadRequestException('کد کالا / خدمت اجباری است و باید توسط کاربر تعیین شود');
      }
      const docRes = await this.repository.calculateNextCode(bsId, companyId);
      if (docRes.error) {
        throw new BadRequestException(docRes.error);
      }
      codeToSave = parseInt(docRes.nextValue, 10) || docRes.nextValue as any;
    }

    createDto.ItemCode = codeToSave;
    await this.validateDuplicates(createDto);

    // نام کالا (2) اختیاری است: در صورت خالی بودن با همان «نام کالا» ذخیره می‌شود
    if (!String(createDto.ItemName2 ?? '').trim()) {
      createDto.ItemName2 = String(createDto.ItemName ?? '').trim();
    }

    const id = await this.idGenerationService.generateNextId('Items');

    const {
      ItemPhysicalLocations,
      ItemSubUnits,
      ItemInventoryControls,
      ItemVolumeCbms,
      ItemSimilarItems,
      ItemImages,
      ...coreItemData
    } = createDto as any;

    if (createDto.ItemAccountCategoryRef) {
      try {
        const catRows = await this.repository.manager.connection.query(
          `SELECT "PricingMethod" FROM "Inv"."ItemAccountCategories" WHERE "ItemAccountCategoryID" = $1`,
          [createDto.ItemAccountCategoryRef]
        );
        if (catRows && catRows[0] && catRows[0].PricingMethod !== undefined && catRows[0].PricingMethod !== null) {
          (coreItemData as any).PricingMethod = Number(catRows[0].PricingMethod);
        }
      } catch (e) {
        console.warn("Could not fetch pricing method from category:", e);
      }
    }

    const entity: Partial<Item> = {
      ...coreItemData,
      ItemCode: codeToSave,
      ItemID: id,
      creator: userId || 1,
      companyRef: createDto.companyRef || companyId,
      businessStructureRef: createDto.businessStructureRef || bsId,
    };

    const savedItem = await this.repository.create(entity);
    if (createDto.ItemPhysicalLocations) {
      await this.savePhysicalLocations(savedItem.ItemID, createDto.ItemPhysicalLocations, bsId, companyId);
    }
    if (createDto.ItemSubUnits) {
      await this.saveSubUnits(savedItem.ItemID, createDto.ItemSubUnits, bsId, companyId);
    }
    if (createDto.ItemInventoryControls) {
      await this.saveInventoryControls(savedItem.ItemID, createDto.ItemInventoryControls, bsId, companyId);
    }
    if (createDto.ItemVolumeCbms) {
      await this.saveVolumeCbms(savedItem.ItemID, createDto.ItemVolumeCbms, bsId, companyId);
    }
    if (createDto.ItemSimilarItems) {
      await this.saveSimilarItems(savedItem.ItemID, createDto.ItemSimilarItems, bsId, companyId);
    }
    if ((createDto as any).ItemImages) {
      await this.saveItemImages(savedItem.ItemID, (createDto as any).ItemImages, bsId, companyId);
    }
    return this.findOne(savedItem.ItemID);
  }

  async update(id: number, updateDto: UpdateItemDto): Promise<any> {
    const usage = await this.usageCheckService.isRecordUsed('Item', id);
    if (usage.isUsed) {
      throw new ConflictException(`این کالا در فرم ${usage.usedInEntity || usage.usedInTable} استفاده شده است و امکان ویرایش آن وجود ندارد.`);
    }

    const existing = await this.findOne(id);

    // نام کالا (2) اختیاری است: در صورت خالی بودن با همان «نام کالا» ذخیره می‌شود
    if (updateDto.ItemName2 !== undefined && !String(updateDto.ItemName2 ?? '').trim()) {
      updateDto.ItemName2 = String(updateDto.ItemName ?? existing.ItemName ?? '').trim();
    }

    const effectiveType = updateDto.ItemType !== undefined ? Number(updateDto.ItemType) : Number(existing.ItemType);
    const effectiveCategory = updateDto.ItemAccountCategoryRef !== undefined ? updateDto.ItemAccountCategoryRef : existing.ItemAccountCategoryRef;

    if (effectiveType !== ItemType.SERVICE && !effectiveCategory) {
      throw new BadRequestException('طبقه کالا اجباری است');
    }

    if (updateDto.ItemCode === undefined) {
      (updateDto as any).ItemCode = existing.ItemCode;
    }

    await this.validateDuplicates(updateDto, id);

    const userId = this.requestContextService.getUserId();
    const {
      ItemPhysicalLocations,
      ItemSubUnits,
      ItemInventoryControls,
      ItemVolumeCbms,
      ItemSimilarItems,
      ItemImages,
      ...coreUpdateData
    } = updateDto as any;

    if (effectiveCategory) {
      try {
        const catRows = await this.repository.manager.connection.query(
          `SELECT "PricingMethod" FROM "Inv"."ItemAccountCategories" WHERE "ItemAccountCategoryID" = $1`,
          [effectiveCategory]
        );
        if (catRows && catRows[0] && catRows[0].PricingMethod !== undefined && catRows[0].PricingMethod !== null) {
          (coreUpdateData as any).PricingMethod = Number(catRows[0].PricingMethod);
        }
      } catch (e) {
        console.warn("Could not fetch pricing method from category:", e);
      }
    }

    const entityToUpdate = {
      ...coreUpdateData,
      lastModifier: userId || 1,
    };

    await this.repository.update(id, entityToUpdate);
    const { bsId, compId } = await this.getScope();
    if (updateDto.ItemPhysicalLocations !== undefined) {
      await this.savePhysicalLocations(id, updateDto.ItemPhysicalLocations, bsId, compId);
    }
    if (updateDto.ItemSubUnits !== undefined) {
      await this.saveSubUnits(id, updateDto.ItemSubUnits, bsId, compId);
    }
    if (updateDto.ItemInventoryControls !== undefined) {
      await this.saveInventoryControls(id, updateDto.ItemInventoryControls, bsId, compId);
    }
    if (updateDto.ItemVolumeCbms !== undefined) {
      await this.saveVolumeCbms(id, updateDto.ItemVolumeCbms, bsId, compId);
    }
    if (updateDto.ItemSimilarItems !== undefined) {
      await this.saveSimilarItems(id, updateDto.ItemSimilarItems, bsId, compId);
    }
    if ((updateDto as any).ItemImages !== undefined) {
      await this.saveItemImages(id, (updateDto as any).ItemImages, bsId, compId);
    }
    return this.findOne(id);
  }

  async remove(id: number): Promise<void> {
    const usage = await this.usageCheckService.isRecordUsed('Item', id);
    if (usage.isUsed) {
      throw new ConflictException(`این کالا در فرم ${usage.usedInEntity || usage.usedInTable} استفاده شده است و امکان حذف آن وجود ندارد.`);
    }

    await this.findOne(id);
    await this.repository.delete(id);
  }

  async getStockSummary(
    itemId: number,
    warehouseId?: number,
    excludeVoucherId?: number,
    partyId?: number | string,
    currentDate?: string,
    docType?: string,
  ): Promise<any> {
    const { bsId, compId, isShared } = await this.getScope();

    // 1. Fetch Item info and Main Unit
    const itemRows = await this.repository.manager.connection.query(
      `SELECT 
        i."ItemID",
        i."ItemCode",
        i."ItemName",
        i."MeasurementUnitRef",
        mu."MeasurementUnitName" AS "MainUnitName"
       FROM "Inv"."Items" i
       LEFT JOIN "Inv"."MeasurementUnits" mu ON mu."MeasurementUnitID" = i."MeasurementUnitRef"
       WHERE i."ItemID" = $1 OR i."ItemCode"::text = $1::text`,
      [itemId]
    );

    let itemInfo: any = itemRows && itemRows.length > 0 ? itemRows[0] : null;
    let actualItemId = itemInfo ? Number(itemInfo.ItemID) : 0;

    if (!itemInfo) {
      if (docType === 'sales_order') {
        // فرم سفارش فروش: باکس خلاصه گردش حتی قبل از انتخاب کالا هم برای نمایش
        // «آخرین سفارش فروش به مشتری» فراخوانی می‌شود؛ نبود کالا در این حالت خطا نیست.
        itemInfo = { ItemID: 0, ItemCode: null, ItemName: null, MeasurementUnitRef: null, MainUnitName: null };
        actualItemId = 0;
      } else {
        throw new NotFoundException(`کالا با شناسه یا کد ${itemId} یافت نشد.`);
      }
    }

    // Fetch SubUnit info
    const subUnitRows = await this.repository.manager.connection.query(
      `SELECT 
        isu."SubUnitRef",
        isu."MainToSubRatio",
        mu."MeasurementUnitName" AS "SubUnitName"
       FROM "Inv"."ItemSubUnits" isu
       LEFT JOIN "Inv"."MeasurementUnits" mu ON mu."MeasurementUnitID" = isu."SubUnitRef"
       WHERE isu."ItemRef" = $1
       ORDER BY isu."ItemSubUnitID" ASC
       LIMIT 1`,
      [actualItemId]
    ).catch(() => []);

    const subUnitInfo = subUnitRows && subUnitRows.length > 0 ? subUnitRows[0] : null;
    const mainToSubRatio = subUnitInfo?.MainToSubRatio ? Number(subUnitInfo.MainToSubRatio) : 1;

    // Fetch Warehouse ID and Name from Warehouses table by WarehouseID or WarehouseCode or WarehouseTitle
    let targetWhId: number | null = null;
    let warehouseName = '';
    if (warehouseId && Number(warehouseId) > 0) {
      const parsedWhId = Number(warehouseId);
      const whRows = await this.repository.manager.connection.query(
        `SELECT "WarehouseID", COALESCE("WarehouseTitle", '') AS "WarehouseName" 
         FROM "Inv"."Warehouses" 
         WHERE "WarehouseID" = $1 OR "WarehouseCode"::text = $1::text OR "WarehouseTitle" = $1::text`,
        [parsedWhId]
      ).catch(() => []);

      if (whRows && whRows.length > 0) {
        targetWhId = Number(whRows[0].WarehouseID);
        warehouseName = whRows[0].WarehouseName || whRows[0].warehousename || '';
      } else {
        targetWhId = parsedWhId;
      }
    } else if (warehouseId) {
      const whRows = await this.repository.manager.connection.query(
        `SELECT "WarehouseID", COALESCE("WarehouseTitle", '') AS "WarehouseName" 
         FROM "Inv"."Warehouses" 
         WHERE "WarehouseCode"::text = $1::text OR "WarehouseTitle" = $1::text`,
        [String(warehouseId)]
      ).catch(() => []);

      if (whRows && whRows.length > 0) {
        targetWhId = Number(whRows[0].WarehouseID);
        warehouseName = whRows[0].WarehouseName || whRows[0].warehousename || '';
      }
    }

    const queryParams: any[] = [itemId, actualItemId];
    let excludeCondition = '';
    if (excludeVoucherId && Number(excludeVoucherId) > 0) {
      queryParams.push(Number(excludeVoucherId));
      excludeCondition = ` AND v."WarehouseReceiptID" != $${queryParams.length}`;
    }

    // 2. Fetch all voucher details for this item
    const detailsRows = await this.repository.manager.connection.query(
      `SELECT 
        d."WarehouseReceiptDetailID",
        d."Quantity",
        d."UnitType",
        COALESCE(d."WarehouseRef", v."WarehouseRef") AS "WarehouseRef",
        w."WarehouseID",
        COALESCE(w."WarehouseTitle", '') AS "WarehouseName",
        v."WarehouseReceiptID",
        v."WarehouseDocumentTypeRef",
        COALESCE(t."WarehouseDocumentNature", 1) AS "Nature",
        d."TrackingFactorValues"
       FROM "Inv"."WarehouseVouchersDetails" d
       JOIN "Inv"."WarehouseVouchers" v ON v."WarehouseReceiptID" = d."WarehouseReceiptRef"
       LEFT JOIN "Inv"."WarehouseDocumentTypes" t ON t."WarehouseDocumentTypeID" = v."WarehouseDocumentTypeRef"
       LEFT JOIN "Inv"."Warehouses" w ON (
         w."WarehouseID" = COALESCE(d."WarehouseRef", v."WarehouseRef")
         OR w."WarehouseCode"::text = COALESCE(d."WarehouseRef", v."WarehouseRef")::text
         OR w."WarehouseTitle" = COALESCE(d."WarehouseRef", v."WarehouseRef")::text
       )
       WHERE (d."ItemRef" = $1 OR d."ItemRef" = $2 OR d."ItemRef"::text = $1::text OR d."ItemRef"::text = $2::text)${excludeCondition}`,
      queryParams
    ).catch(() => []);

    // 3. Fetch tracking factor detail rows from Receipt and Issue Tracking Factor tables
    const receiptTfRows = await this.repository.manager.connection.query(
      `SELECT 
        rtf."WarehouseReceiptDetailRef",
        rtf."TrackingFactorRef",
        rtf."TrackingFactorCode",
        rtf."TrackingFactorName",
        rtf."Quantity",
        rtf."FactorValue",
        rtf."StartValue",
        rtf."EndValue",
        COALESCE(w."WarehouseID", d."WarehouseRef", v."WarehouseRef") AS "WarehouseRef",
        w."WarehouseID",
        COALESCE(t."WarehouseDocumentNature", 1) AS "Nature"
       FROM "Inv"."WarehouseReceiptTrackingFactors" rtf
       JOIN "Inv"."WarehouseVouchersDetails" d ON d."WarehouseReceiptDetailID" = rtf."WarehouseReceiptDetailRef"
       JOIN "Inv"."WarehouseVouchers" v ON v."WarehouseReceiptID" = d."WarehouseReceiptRef"
       LEFT JOIN "Inv"."WarehouseDocumentTypes" t ON t."WarehouseDocumentTypeID" = v."WarehouseDocumentTypeRef"
       LEFT JOIN "Inv"."Warehouses" w ON (
         w."WarehouseID" = COALESCE(d."WarehouseRef", v."WarehouseRef")
         OR w."WarehouseCode"::text = COALESCE(d."WarehouseRef", v."WarehouseRef")::text
         OR w."WarehouseTitle" = COALESCE(d."WarehouseRef", v."WarehouseRef")::text
       )
       WHERE (d."ItemRef" = $1 OR d."ItemRef" = $2 OR d."ItemRef"::text = $1::text OR d."ItemRef"::text = $2::text)${excludeCondition}`,
      queryParams
    ).catch(() => []);

    const issueTfRows = await this.repository.manager.connection.query(
      `SELECT 
        itf."WarehouseIssueDetailRef" AS "WarehouseReceiptDetailRef",
        itf."TrackingFactorRef",
        itf."TrackingFactorCode",
        itf."TrackingFactorName",
        itf."Quantity",
        itf."FactorValue",
        itf."StartValue",
        itf."EndValue",
        COALESCE(w."WarehouseID", d."WarehouseRef", v."WarehouseRef") AS "WarehouseRef",
        w."WarehouseID",
        COALESCE(t."WarehouseDocumentNature", 2) AS "Nature"
       FROM "Inv"."WarehouseIssueTrackingFactors" itf
       JOIN "Inv"."WarehouseVouchersDetails" d ON d."WarehouseReceiptDetailID" = itf."WarehouseIssueDetailRef"
       JOIN "Inv"."WarehouseVouchers" v ON v."WarehouseReceiptID" = d."WarehouseReceiptRef"
       LEFT JOIN "Inv"."WarehouseDocumentTypes" t ON t."WarehouseDocumentTypeID" = v."WarehouseDocumentTypeRef"
       LEFT JOIN "Inv"."Warehouses" w ON (
         w."WarehouseID" = COALESCE(d."WarehouseRef", v."WarehouseRef")
         OR w."WarehouseCode"::text = COALESCE(d."WarehouseRef", v."WarehouseRef")::text
         OR w."WarehouseTitle" = COALESCE(d."WarehouseRef", v."WarehouseRef")::text
       )
       WHERE (d."ItemRef" = $1 OR d."ItemRef" = $2 OR d."ItemRef"::text = $1::text OR d."ItemRef"::text = $2::text)${excludeCondition}`,
      queryParams
    ).catch(() => []);

    // 4. Calculate Main Unit & Sub Unit stock totals
    let companyMainStock = 0;
    let warehouseMainStock = 0;

    const warehouseBreakdownMap = new Map<number, { warehouseId: number; warehouseName: string; mainStock: number }>();

    for (const row of detailsRows) {
      const nature = Number(row.Nature);
      const sign = nature === 1 ? 1 : nature === 2 ? -1 : 0;
      const qty = Number(row.Quantity || 0);

      const isSubUnitRow = Number(row.UnitType) === 2 || row.UnitType === '2' || row.UnitType === 'فرعی';
      const rowMainQty = isSubUnitRow ? (mainToSubRatio > 0 ? qty / mainToSubRatio : qty) : qty;
      const rowSignedQty = rowMainQty * sign;

      companyMainStock += rowSignedQty;

      let rowWhId = Number(row.WarehouseID || row.warehouseid || row.WarehouseRef || row.warehouseref);
      if (isNaN(rowWhId) && (row.WarehouseRef || row.warehouseref)) {
        const rawWh = String(row.WarehouseRef || row.warehouseref).trim();
        if (targetWhId && (rawWh === String(targetWhId) || rawWh === warehouseName)) {
          rowWhId = targetWhId;
        }
      }

      if (rowWhId && !isNaN(rowWhId)) {
        if (!warehouseBreakdownMap.has(rowWhId)) {
          warehouseBreakdownMap.set(rowWhId, {
            warehouseId: rowWhId,
            warehouseName: row.WarehouseName || row.warehousename || `انبار ${rowWhId}`,
            mainStock: 0,
          });
        }
        warehouseBreakdownMap.get(rowWhId)!.mainStock += rowSignedQty;

        if (targetWhId && rowWhId === targetWhId) {
          warehouseMainStock += rowSignedQty;
        }
      }
    }

    if (!targetWhId && warehouseBreakdownMap.size > 0) {
      warehouseMainStock = companyMainStock;
    }

    const companySubStock = subUnitInfo ? companyMainStock * mainToSubRatio : 0;
    const warehouseSubStock = subUnitInfo ? warehouseMainStock * mainToSubRatio : 0;

    // 5. Aggregate Tracking Factors
    const tfMap = new Map<string, {
      trackingFactorRef: number;
      trackingFactorCode?: number;
      trackingFactorName: string;
      factorValue?: string;
      startValue?: string;
      endValue?: string;
      displayLabel: string;
      companyStock: number;
      warehouseStock: number;
    }>();

    const processTfRecord = (
      tfRef: number,
      tfCode: any,
      tfName: string,
      fVal: string | undefined,
      sVal: string | undefined,
      eVal: string | undefined,
      qty: number,
      nature: number,
      rowWhId: number
    ) => {
      const sign = nature === 1 ? 1 : nature === 2 ? -1 : 0;
      if (sign === 0) return;
      const signedQty = qty * sign;

      const factorValStr = fVal || '';
      const startValStr = sVal || '';
      const endValStr = eVal || '';
      const key = `${tfRef}_${factorValStr}_${startValStr}_${endValStr}`;

      let displayParts: string[] = [];
      if (factorValStr) displayParts.push(factorValStr);
      if (startValStr || endValStr) displayParts.push(`از ${startValStr} تا ${endValStr}`);
      const displayLabel = `${tfName || 'عامل ردیابی'}: ${displayParts.join(' - ') || 'بدون مقدار'}`;

      if (!tfMap.has(key)) {
        tfMap.set(key, {
          trackingFactorRef: tfRef,
          trackingFactorCode: tfCode ? Number(tfCode) : undefined,
          trackingFactorName: tfName || 'عامل ردیابی',
          factorValue: factorValStr || undefined,
          startValue: startValStr || undefined,
          endValue: endValStr || undefined,
          displayLabel,
          companyStock: 0,
          warehouseStock: 0,
        });
      }

      const tfRecord = tfMap.get(key)!;
      tfRecord.companyStock += signedQty;
      if (targetWhId && rowWhId === targetWhId) {
        tfRecord.warehouseStock += signedQty;
      }
    };

    // First process DB tracking factor tables
    const allTfRows = [...receiptTfRows, ...issueTfRows];
    for (const tf of allTfRows) {
      if (tf.TrackingFactorRef) {
        processTfRecord(
          Number(tf.TrackingFactorRef),
          tf.TrackingFactorCode,
          tf.TrackingFactorName,
          tf.FactorValue,
          tf.StartValue,
          tf.EndValue,
          Number(tf.Quantity || 0),
          Number(tf.Nature),
          Number(tf.WarehouseID || tf.WarehouseRef)
        );
      }
    }

    // Fallback: Check d.TrackingFactorValues if DB tf tables didn't capture it
    if (allTfRows.length === 0) {
      for (const row of detailsRows) {
        let tfVals = row.TrackingFactorValues;
        if (typeof tfVals === 'string') {
          try { tfVals = JSON.parse(tfVals); } catch {}
        }
        if (tfVals) {
          const list = Array.isArray(tfVals) ? tfVals : [tfVals];
          for (const item of list) {
            if (item && (item.TrackingFactorRef || item.trackingFactorRef || item.id)) {
              const ref = Number(item.TrackingFactorRef || item.trackingFactorRef || item.id);
              const name = item.TrackingFactorName || item.trackingFactorName || item.name || 'عامل ردیابی';
              const code = item.TrackingFactorCode || item.trackingFactorCode;
              const fVal = item.FactorValue || item.factorValue || item.value;
              const sVal = item.StartValue || item.startValue;
              const eVal = item.EndValue || item.endValue;
              const qty = Number(item.Quantity || item.quantity || row.Quantity || 0);

              processTfRecord(ref, code, name, fVal, sVal, eVal, qty, Number(row.Nature), Number(row.WarehouseID || row.WarehouseRef));
            }
          }
        }
      }
    }

    const warehousesSummary = Array.from(warehouseBreakdownMap.values()).map((w) => ({
      ...w,
      subStock: subUnitInfo ? w.mainStock * mainToSubRatio : 0,
    }));

    return {
      itemId: Number(itemInfo.ItemID),
      itemCode: itemInfo.ItemCode,
      itemName: itemInfo.ItemName,
      warehouseId: warehouseId ? Number(warehouseId) : undefined,
      warehouseName,

      // 1. موجودی واحد اصلی و انبار
      // 4. موجودی واحد اصلی و شرکت
      mainUnit: {
        unitName: itemInfo.MainUnitName || 'واحد اصلی',
        warehouseStock: warehouseMainStock,
        companyStock: companyMainStock,
      },

      // 2. موجودی واحد فرعی و انبار
      // 5. موجودی واحد فرعی و شرکت
      subUnit: subUnitInfo ? {
        subUnitRef: Number(subUnitInfo.SubUnitRef),
        unitName: subUnitInfo.SubUnitName || 'واحد فرعی',
        ratio: mainToSubRatio,
        warehouseStock: warehouseSubStock,
        companyStock: companySubStock,
      } : null,

      // 3. موجودی عامل ردیابی و انبار
      // 6. موجودی عامل ردیابی و شرکت
      trackingFactors: Array.from(tfMap.values()),

      // خلاصه موجودی به تفکیک تمام انبارهای شرکت
      warehousesSummary,

      // آخرین گردش‌ها قبل از سند جاری
      lastMovements: await this.fetchLastMovements(
        itemId,
        actualItemId,
        bsId,
        compId,
        isShared,
        excludeVoucherId,
        partyId,
        currentDate,
        docType || 'receipt',
      ),
    };
  }

  private async fetchLastMovements(
    itemId: number,
    actualItemId: number,
    bsId: number,
    compId: number,
    isShared: boolean,
    excludeVoucherId?: number,
    partyId?: number | string,
    currentDate?: string,
    docType: string = 'receipt',
  ): Promise<any[]> {
    let targetIsoDate: string | null = null;
    if (currentDate && typeof currentDate === 'string' && currentDate.trim() !== '') {
      try {
        targetIsoDate = parseToIsoDateString(currentDate.trim());
      } catch (e) {
        targetIsoDate = null;
      }
    }

    const scopeClause = (alias: string) => {
      if (isShared) {
        return `(${alias}."BusinessStructureRef" = ${bsId} OR ${alias}."BusinessStructureRef" IS NULL)`;
      }
      return `(${alias}."CompanyRef" = ${compId} OR ${alias}."CompanyRef" IS NULL)`;
    };

    let title1 = 'آخرین رسید انبار';
    let title2 = 'آخرین رسید انبار از تامین کننده';
    let priceLabel = 'مبلغ رسید';

    if (docType === 'issue') {
      title1 = 'آخرین حواله انبار';
      title2 = 'آخرین حواله انبار به تحویل‌گیرنده';
      priceLabel = 'مبلغ حواله';
    } else if (docType === 'temporary_receipt') {
      title1 = 'آخرین رسید موقت';
      title2 = 'آخرین رسید موقت از تامین کننده';
      priceLabel = 'مبلغ رسید';
    } else if (docType === 'return_temporary_receipt') {
      title1 = 'آخرین برگشت رسید کالا';
      title2 = 'آخرین برگشت به تامین کننده';
      priceLabel = 'مبلغ برگشت';
    } else if (docType === 'purchase_invoice') {
      title1 = 'آخرین فاکتور خرید';
      title2 = 'آخرین فاکتور خرید از تامین کننده';
      priceLabel = 'مبلغ فاکتور';
    } else if (docType === 'sales_order') {
      // Task 84: در فرم سفارش فروش بجای حواله انبار، آخرین سفارش فروش (قبل از این سند) نمایش داده می‌شود
      title1 = 'آخرین سفارش فروش';
      title2 = 'آخرین سفارش فروش به مشتری';
      priceLabel = 'مبلغ سفارش';
    }

    const formatJalaliDate = (val: any): string => {
      if (!val) return '-';
      try {
        // تاریخ سفارش فروش در دیتابیس به‌صورت رشته 'YYYY/MM/DD' ذخیره می‌شود؛ برای پارس مطمئن اسلش به خط تیره تبدیل می‌شود
        const m = moment(String(val).replace(/\//g, '-'));
        if (m.isValid()) return m.format('jYYYY/jMM/jDD');
      } catch (e) {}
      return String(val);
    };

    let row1: any = null;
    let row2: any = null;

    try {
      if (docType === 'receipt' || docType === 'issue') {
        const nature = docType === 'issue' ? 2 : 1;

        const executeQuery = async (withParty: boolean) => {
          const params: any[] = [itemId, actualItemId];
          let q = `
            SELECT 
              v."ReceiptDate" AS "docDate",
              d."Quantity" AS "quantity",
              COALESCE(p."UnitPrice", d."UnitPrice", 0) AS "price"
            FROM "Inv"."WarehouseVouchersDetails" d
            JOIN "Inv"."WarehouseVouchers" v ON v."WarehouseReceiptID" = d."WarehouseReceiptRef"
            LEFT JOIN "Inv"."WarehouseDocumentTypes" t ON t."WarehouseDocumentTypeID" = v."WarehouseDocumentTypeRef"
            LEFT JOIN "Inv"."WarehouseVouchersPricing" p ON p."WarehouseVoucherDetailRef" = d."WarehouseReceiptDetailID" AND p."PricingType" = 1
            WHERE (d."ItemRef" = $1 OR d."ItemRef" = $2 OR d."ItemRef"::text = $1::text OR d."ItemRef"::text = $2::text)
              AND COALESCE(t."WarehouseDocumentNature", ${nature}) = ${nature}
              AND ${scopeClause('v')}
          `;

          if (excludeVoucherId && Number(excludeVoucherId) > 0) {
            params.push(Number(excludeVoucherId));
            q += ` AND v."WarehouseReceiptID" != $${params.length}`;
          }

          if (targetIsoDate) {
            params.push(targetIsoDate);
            q += ` AND v."ReceiptDate" < ($${params.length}::date + INTERVAL '1 day')`;
          }

          if (withParty && partyId) {
            params.push(String(partyId));
            params.push(Number(partyId) || 0);
            q += ` AND (v."SupplierRef"::text = $${params.length - 1} OR v."SupplierRef" = $${params.length})`;
          }

          q += ` ORDER BY v."ReceiptDate" DESC, v."WarehouseReceiptID" DESC LIMIT 1`;

          const res = await this.repository.manager.connection.query(q, params);
          return res && res.length > 0 ? res[0] : null;
        };

        row1 = await executeQuery(false);
        if (partyId) {
          row2 = await executeQuery(true);
        }
      } else if (docType === 'temporary_receipt' || docType === 'return_temporary_receipt') {
        const trType = docType === 'return_temporary_receipt' ? 2 : 1;

        const executeQuery = async (withParty: boolean) => {
          const params: any[] = [itemId, actualItemId];
          let q = `
            SELECT 
              v."ReceiptDate" AS "docDate",
              d."Quantity" AS "quantity",
              COALESCE(d."UnitPrice", 0) AS "price"
            FROM "Inv"."TemporaryItemReceiptDetails" d
            JOIN "Inv"."TemporaryItemReceipts" v ON v."TemporaryItemReceiptID" = d."TemporaryItemReceiptRef"
            WHERE (d."ItemRef" = $1 OR d."ItemRef" = $2 OR d."ItemRef"::text = $1::text OR d."ItemRef"::text = $2::text)
              AND COALESCE(v."Type", ${trType}) = ${trType}
              AND ${scopeClause('v')}
          `;

          if (excludeVoucherId && Number(excludeVoucherId) > 0) {
            params.push(Number(excludeVoucherId));
            q += ` AND v."TemporaryItemReceiptID" != $${params.length}`;
          }

          if (targetIsoDate) {
            params.push(targetIsoDate);
            q += ` AND v."ReceiptDate" < ($${params.length}::date + INTERVAL '1 day')`;
          }

          if (withParty && partyId) {
            params.push(String(partyId));
            params.push(Number(partyId) || 0);
            q += ` AND (v."SupplierRef"::text = $${params.length - 1} OR v."SupplierRef" = $${params.length})`;
          }

          q += ` ORDER BY v."ReceiptDate" DESC, v."TemporaryItemReceiptID" DESC LIMIT 1`;

          const res = await this.repository.manager.connection.query(q, params);
          return res && res.length > 0 ? res[0] : null;
        };

        row1 = await executeQuery(false);
        if (partyId) {
          row2 = await executeQuery(true);
        }
      } else if (docType === 'purchase_invoice') {
        const executeQuery = async (withParty: boolean) => {
          const params: any[] = [itemId, actualItemId];
          let q = `
            SELECT 
              v."InvoiceDate" AS "docDate",
              d."Quantity" AS "quantity",
              COALESCE(d."UnitPrice", 0) AS "price"
            FROM "Inv"."PurchaseInvoiceDetails" d
            JOIN "Inv"."PurchaseInvoices" v ON v."PurchaseInvoiceID" = d."PurchaseInvoiceRef"
            WHERE (d."ItemRef" = $1 OR d."ItemRef" = $2 OR d."ItemRef"::text = $1::text OR d."ItemRef"::text = $2::text)
              AND ${scopeClause('v')}
          `;

          if (excludeVoucherId && Number(excludeVoucherId) > 0) {
            params.push(Number(excludeVoucherId));
            q += ` AND v."PurchaseInvoiceID" != $${params.length}`;
          }

          if (targetIsoDate) {
            params.push(targetIsoDate);
            q += ` AND v."InvoiceDate" < ($${params.length}::date + INTERVAL '1 day')`;
          }

          if (withParty && partyId) {
            params.push(String(partyId));
            params.push(Number(partyId) || 0);
            q += ` AND (v."SupplierRef"::text = $${params.length - 1} OR v."SupplierRef" = $${params.length})`;
          }

          q += ` ORDER BY v."InvoiceDate" DESC, v."PurchaseInvoiceID" DESC LIMIT 1`;

          const res = await this.repository.manager.connection.query(q, params);
          return res && res.length > 0 ? res[0] : null;
        };

        row1 = await executeQuery(false);
        if (partyId) {
          row2 = await executeQuery(true);
        }
      } else if (docType === 'sales_order') {
        // Task 84: آخرین سفارش فروش انجام‌شده قبل از سند جاری (در سطح سفارش — نه ردیف کالا):
        // ردیف اول: آخرین سفارش فروش (در صورت انتخاب مشتری، همان مشتری)
        // ردیف دوم: آخرین سفارش فروش به مشتریِ سند جاری
        const executeQuery = async (withParty: boolean) => {
          const params: any[] = [];
          // مبلغ آخرین سفارش = جمع TotalPrice اقلام آن سفارش؛ مقدار = جمع مقدار کالای انتخابی در آن سفارش
          const quantitySelect = actualItemId > 0
            ? `(
                SELECT COALESCE(SUM(d2."Quantity"), 0)
                FROM "Sle"."SalesOrderItems" d2
                WHERE d2."SalesOrderRef" = v."SalesOrderID"
                  AND (d2."ItemRef" = ${Number(actualItemId)} OR d2."ItemRef"::text = '${Number(actualItemId)}')
              )`
            : `0`;
          let q = `
            SELECT 
              v."OrderDate" AS "docDate",
              ${quantitySelect} AS "quantity",
              (
                SELECT COALESCE(SUM(d3."TotalPrice"), 0)
                FROM "Sle"."SalesOrderItems" d3
                WHERE d3."SalesOrderRef" = v."SalesOrderID"
              ) AS "price"
            FROM "Sle"."SalesOrders" v
            WHERE ${scopeClause('v')}
          `;

          if (excludeVoucherId && Number(excludeVoucherId) > 0) {
            params.push(Number(excludeVoucherId));
            q += ` AND v."SalesOrderID" != $${params.length}`;
          }

          if (targetIsoDate) {
            params.push(targetIsoDate);
            q += ` AND (NULLIF(REPLACE(v."OrderDate", '/', '-'), ''))::date < ($${params.length}::date + INTERVAL '1 day')`;
          }

          if (withParty && partyId) {
            params.push(String(partyId));
            params.push(Number(partyId) || 0);
            q += ` AND (v."CustomerRef"::text = $${params.length - 1} OR v."CustomerRef" = $${params.length})`;
          }

          q += ` ORDER BY v."OrderDate" DESC NULLS LAST, v."SalesOrderID" DESC LIMIT 1`;

          const res = await this.repository.manager.connection.query(q, params);
          return res && res.length > 0 ? res[0] : null;
        };

        row1 = await executeQuery(false);
        if (partyId) {
          row2 = await executeQuery(true);
        }
      }
    } catch (err) {
      console.error('Error fetching last movements in item.service:', err);
    }

    const mov1 = {
      title: title1,
      date: row1 ? formatJalaliDate(row1.docDate) : '-',
      quantity: row1 ? Number(row1.quantity || 0) : 0,
      price: row1 ? Number(row1.price || 0) : 0,
      priceLabel,
    };

    const mov2 = {
      title: title2,
      date: row2 ? formatJalaliDate(row2.docDate) : '-',
      quantity: row2 ? Number(row2.quantity || 0) : 0,
      price: row2 ? Number(row2.price || 0) : 0,
      priceLabel,
    };

    return [mov1, mov2];
  }

  async getKardexActiveItems(
    warehouseId?: string,
    fromDate?: string,
    toDate?: string,
    fiscalYearId?: string,
    companyId?: string,
  ) {
    const { bsId, compId, isShared } = await this.getScope();
    const effectiveCompId = companyId && Number(companyId) > 0 ? Number(companyId) : compId;

    const params: any[] = [];
    let scopeWhere = '';

    if (isShared) {
      params.push(bsId);
      scopeWhere = `(i."BusinessStructureRef" = $1 OR v."BusinessStructureRef" = $1)`;
    } else {
      params.push(effectiveCompId);
      scopeWhere = `(i."CompanyRef" = $1 OR v."CompanyRef" = $1)`;
    }

    let whereClause = `WHERE ${scopeWhere}`;

    if (warehouseId && warehouseId !== 'all' && Number(warehouseId) > 0) {
      params.push(Number(warehouseId));
      whereClause += ` AND (d."WarehouseRef" = $${params.length} OR v."WarehouseRef" = $${params.length})`;
    }

    if (fromDate && fromDate.trim() !== '') {
      params.push(fromDate.trim());
      whereClause += ` AND COALESCE(v."ReceiptDate"::text, '') >= $${params.length}`;
    }

    if (toDate && toDate.trim() !== '') {
      params.push(toDate.trim());
      whereClause += ` AND COALESCE(v."ReceiptDate"::text, '') <= $${params.length}`;
    }

    if (fiscalYearId && Number(fiscalYearId) > 0) {
      params.push(Number(fiscalYearId));
      whereClause += ` AND v."FiscalYearRef" = $${params.length}`;
    }

    const queryStr = `
      SELECT DISTINCT
        i."ItemID",
        i."ItemID" AS "id",
        i."ItemCode",
        i."ItemCode" AS "code",
        i."ItemName",
        i."ItemName" AS "title",
        COALESCE(i."ItemName2", '-') AS "ItemName2",
        COALESCE(i."ItemName2", '-') AS "latinTitle",
        COALESCE(mu."MeasurementUnitName", '-') AS "MeasurementUnitName",
        COALESCE(mu."MeasurementUnitName", '-') AS "unit",
        COALESCE(cat."ItemAccountCategoryName", '-') AS "CategoryName",
        COALESCE(cat."ItemAccountCategoryName", '-') AS "category",
        COALESCE(cat."ItemAccountCategoryName", '-') AS "ItemAccountCategoryName",
        cat."ItemAccountCategoryID" AS "ItemAccountCategoryRef",
        cat."PricingMethod" AS "CategoryPricingMethod",
        cat."PricingMethod" AS "PricingMethod",
        COALESCE(i."IranCode", '-') AS "Barcode",
        COALESCE(i."IranCode", '-') AS "barcode",
        CASE 
          WHEN cat."PricingMethod" = 1 THEN 'میانگین موزون'
          WHEN cat."PricingMethod" = 2 THEN 'FIFO (نخستین ورودی، نخستین خروجی)'
          WHEN cat."PricingMethod" = 3 THEN 'LIFO (آخرین ورودی، نخستین خروجی)'
          WHEN cat."PricingMethod" = 4 THEN 'نرخ استاندارد'
          ELSE '-'
        END AS "ValuationMethod",
        CASE 
          WHEN cat."PricingMethod" = 1 THEN 'میانگین موزون'
          WHEN cat."PricingMethod" = 2 THEN 'FIFO (نخستین ورودی، نخستین خروجی)'
          WHEN cat."PricingMethod" = 3 THEN 'LIFO (آخرین ورودی، نخستین خروجی)'
          WHEN cat."PricingMethod" = 4 THEN 'نرخ استاندارد'
          ELSE '-'
        END AS "valuationMethod"
      FROM "Inv"."Items" i
      JOIN "Inv"."WarehouseVouchersDetails" d ON (d."ItemRef" = i."ItemID" OR d."ItemRef"::text = i."ItemCode"::text)
      JOIN "Inv"."WarehouseVouchers" v ON v."WarehouseReceiptID" = d."WarehouseReceiptRef"
      LEFT JOIN "Inv"."MeasurementUnits" mu ON mu."MeasurementUnitID" = i."MeasurementUnitRef"
      LEFT JOIN "Inv"."ItemAccountCategories" cat ON cat."ItemAccountCategoryID" = i."ItemAccountCategoryRef"
      ${whereClause}
      ORDER BY i."ItemCode" ASC, i."ItemID" ASC
    `;

    try {
      const rows = await this.repository.manager.connection.query(queryStr, params);
      if (rows && rows.length > 0) {
        return rows;
      }
    } catch (err) {
      console.error('getKardexActiveItems query error:', err);
    }

    // Fallback: Return all active items in the database
    try {
      const fallbackRows = await this.repository.manager.connection.query(
        `SELECT 
          i."ItemID",
          i."ItemID" AS "id",
          i."ItemCode",
          i."ItemCode" AS "code",
          i."ItemName",
          i."ItemName" AS "title",
          COALESCE(i."ItemName2", '-') AS "ItemName2",
          COALESCE(i."ItemName2", '-') AS "latinTitle",
          COALESCE(mu."MeasurementUnitName", '-') AS "MeasurementUnitName",
          COALESCE(mu."MeasurementUnitName", '-') AS "unit",
          COALESCE(cat."ItemAccountCategoryName", '-') AS "CategoryName",
          COALESCE(cat."ItemAccountCategoryName", '-') AS "category",
          COALESCE(cat."ItemAccountCategoryName", '-') AS "ItemAccountCategoryName",
          cat."ItemAccountCategoryID" AS "ItemAccountCategoryRef",
          cat."PricingMethod" AS "CategoryPricingMethod",
          cat."PricingMethod" AS "PricingMethod",
          COALESCE(i."IranCode", '-') AS "Barcode",
          COALESCE(i."IranCode", '-') AS "barcode",
          CASE 
            WHEN cat."PricingMethod" = 1 THEN 'میانگین موزون'
            WHEN cat."PricingMethod" = 2 THEN 'FIFO (نخستین ورودی، نخستین خروجی)'
            WHEN cat."PricingMethod" = 3 THEN 'LIFO (آخرین ورودی، نخستین خروجی)'
            WHEN cat."PricingMethod" = 4 THEN 'نرخ استاندارد'
            ELSE '-'
          END AS "ValuationMethod",
          CASE 
            WHEN cat."PricingMethod" = 1 THEN 'میانگین موزون'
            WHEN cat."PricingMethod" = 2 THEN 'FIFO (نخستین ورودی، نخستین خروجی)'
            WHEN cat."PricingMethod" = 3 THEN 'LIFO (آخرین ورودی، نخستین خروجی)'
            WHEN cat."PricingMethod" = 4 THEN 'نرخ استاندارد'
            ELSE '-'
          END AS "valuationMethod"
         FROM "Inv"."Items" i
         LEFT JOIN "Inv"."MeasurementUnits" mu ON mu."MeasurementUnitID" = i."MeasurementUnitRef"
         LEFT JOIN "Inv"."ItemAccountCategories" cat ON cat."ItemAccountCategoryID" = i."ItemAccountCategoryRef"
         ORDER BY i."ItemCode" ASC, i."ItemID" ASC`,
        []
      );
      return fallbackRows || [];
    } catch (err) {
      return [];
    }
  }

  async getItemKardex(
    itemId: number,
    warehouseId?: string,
    fromDate?: string,
    toDate?: string
  ) {
    // 1. Get item info
    const itemRows = await this.repository.manager.connection.query(
      `SELECT i."ItemID", i."ItemCode", i."ItemName", COALESCE(mu."MeasurementUnitName", 'عدد') AS "MainUnitName"
       FROM "Inv"."Items" i
       LEFT JOIN "Inv"."MeasurementUnits" mu ON mu."MeasurementUnitID" = i."MeasurementUnitRef"
       WHERE i."ItemID" = $1 OR i."ItemCode"::text = $1::text LIMIT 1`,
      [itemId]
    ).catch(() => []);

    const mainUnitName = itemRows[0]?.MainUnitName || 'عدد';
    const actualItemId = itemRows[0]?.ItemID || itemId;

    // Fetch all sub-units for this item to get their conversion ratios
    const subUnits = await this.repository.manager.connection.query(
      `SELECT 
        isu."ItemSubUnitID",
        isu."ItemRef",
        isu."SubUnitRef",
        isu."MainToSubRatio",
        mu."MeasurementUnitName" AS "SubUnitName"
       FROM "Inv"."ItemSubUnits" isu
       LEFT JOIN "Inv"."MeasurementUnits" mu ON mu."MeasurementUnitID" = isu."SubUnitRef"
       WHERE isu."ItemRef" = $1 OR isu."ItemRef"::text = $1::text`,
      [actualItemId]
    ).catch(() => []);

    const subUnitRatioMap = new Map<string, number>();
    for (const su of (subUnits || [])) {
      const r = Number(su.MainToSubRatio || 1);
      const validR = r > 0 ? r : 1;
      if (su.SubUnitName) {
        subUnitRatioMap.set(String(su.SubUnitName).trim(), validR);
      }
      if (su.SubUnitRef) {
        subUnitRatioMap.set(String(su.SubUnitRef), validR);
      }
    }

    const queryParams: any[] = [actualItemId];
    let whereConditions = `WHERE (d."ItemRef" = $1 OR d."ItemRef"::text = $1::text)`;

    if (warehouseId && warehouseId !== 'all' && Number(warehouseId) > 0) {
      queryParams.push(Number(warehouseId));
      whereConditions += ` AND (d."WarehouseRef" = $${queryParams.length} OR v."WarehouseRef" = $${queryParams.length})`;
    }

    const rows = await this.repository.manager.connection.query(
      `SELECT 
        d."WarehouseReceiptDetailID",
        d."Quantity",
        COALESCE(pr."UnitPrice", d."UnitPrice", 0) AS "UnitPrice",
        COALESCE(pr."NetPrice", d."TotalPrice", pr."UnitPrice", 0) AS "TotalPrice",
        d."UnitType",
        d."UnitName",
        v."WarehouseReceiptID",
        COALESCE(v."ReceiptNumber"::text, v."WarehouseReceiptID"::text) AS "VoucherNo",
        COALESCE(v."BaseDocumentNumber", '') AS "RefNo",
        v."ReceiptDate" AS "VoucherDate",
        v."WarehouseDocumentTypeRef",
        COALESCE(t."WarehouseDocumentTypeTitle", '') AS "VoucherTypeName",
        COALESCE(t."WarehouseDocumentNature", 1) AS "Nature"
       FROM "Inv"."WarehouseVouchersDetails" d
       JOIN "Inv"."WarehouseVouchers" v ON v."WarehouseReceiptID" = d."WarehouseReceiptRef"
       LEFT JOIN "Inv"."WarehouseVouchersPricing" pr ON pr."WarehouseVoucherDetailRef" = d."WarehouseReceiptDetailID"
       LEFT JOIN "Inv"."WarehouseDocumentTypes" t ON t."WarehouseDocumentTypeID" = v."WarehouseDocumentTypeRef"
       ${whereConditions}
       ORDER BY v."ReceiptDate" ASC NULLS FIRST, v."WarehouseReceiptID" ASC, d."WarehouseReceiptDetailID" ASC`,
      queryParams
    ).catch(() => []);

    const cleanFrom = fromDate ? fromDate.trim().replace(/-/g, '/') : '';
    const cleanTo = toDate ? toDate.trim().replace(/-/g, '/') : '';

    // Convert each row's date to Jalali string and prepare for running balance
    const mappedRows = rows.map((row: any) => {
      const jDate = this.toJalaliString(row.VoucherDate) || '1403/01/01';
      return {
        ...row,
        jDate,
      };
    });

    // Sort strictly by Jalali Date ascending, then by Receipt/Voucher No, then Detail ID
    mappedRows.sort((a: any, b: any) => {
      const dateCmp = String(a.jDate).localeCompare(String(b.jDate));
      if (dateCmp !== 0) return dateCmp;
      return Number(a.WarehouseReceiptDetailID || 0) - Number(b.WarehouseReceiptDetailID || 0);
    });

    let runningBalanceQty = 0;
    let runningBalanceAmount = 0;
    const result: any[] = [];

    for (const row of mappedRows) {
      const nature = Number(row.Nature);
      const rawQty = Number(row.Quantity || 0);
      const rawRate = Number(row.UnitPrice || 0);
      const rawUnitName = String(row.UnitName || '').trim();
      const unitType = Number(row.UnitType || 1);

      // Check if recorded with a sub-unit
      let ratio = 1;
      const isSubUnitRecorded = unitType === 2 || (rawUnitName && rawUnitName !== mainUnitName && subUnitRatioMap.has(rawUnitName));
      if (isSubUnitRecorded) {
        if (rawUnitName && subUnitRatioMap.has(rawUnitName)) {
          ratio = subUnitRatioMap.get(rawUnitName)!;
        } else if (subUnits.length > 0) {
          ratio = Number(subUnits[0].MainToSubRatio || 1);
        }
      }

      // Quantity in Main Unit = Quantity recorded in Sub Unit * MainToSubRatio
      const mainUnitQty = isSubUnitRecorded ? (rawQty * ratio) : rawQty;
      const amount = Number(row.TotalPrice || (rawQty * rawRate));
      const mainUnitRate = mainUnitQty > 0 ? (amount / mainUnitQty) : (isSubUnitRecorded ? (rawRate / ratio) : rawRate);

      let inQty = 0;
      let inRate = 0;
      let inAmount = 0;
      let outQty = 0;
      let outRate = 0;
      let outAmount = 0;

      let voucherType = row.VoucherTypeName;
      if (!voucherType) {
        voucherType = nature === 1 ? 'رسید انبار' : 'حواله انبار';
      }

      if (nature === 1) {
        // Receipt (ورود)
        inQty = mainUnitQty;
        inRate = mainUnitRate;
        inAmount = amount;
        runningBalanceQty += inQty;
        runningBalanceAmount += inAmount;
      } else {
        // Issue (خروج)
        outQty = mainUnitQty;
        outRate = mainUnitRate;
        outAmount = amount;
        runningBalanceQty -= outQty;
        runningBalanceAmount -= outAmount;
      }

      // Filter by fromDate / toDate
      if (cleanFrom && row.jDate < cleanFrom) {
        continue;
      }
      if (cleanTo && row.jDate > cleanTo) {
        continue;
      }

      result.push({
        id: row.WarehouseReceiptDetailID || row.WarehouseReceiptID,
        voucherId: Number(row.WarehouseReceiptID),
        warehouseReceiptId: Number(row.WarehouseReceiptID),
        voucherDetailId: Number(row.WarehouseReceiptDetailID),
        nature,
        documentTypeRef: row.WarehouseDocumentTypeRef ? Number(row.WarehouseDocumentTypeRef) : undefined,
        voucherType,
        voucherNo: String(row.VoucherNo || ''),
        refNo: String(row.RefNo || '-'),
        date: row.jDate,
        inQty,
        inUnit: inQty > 0 ? mainUnitName : '',
        inRate: Math.round(inRate),
        inAmount,
        outQty,
        outUnit: outQty > 0 ? mainUnitName : '',
        outRate: Math.round(outRate),
        outAmount,
        balanceQty: runningBalanceQty,
        balanceAmount: runningBalanceAmount,
        unitName: mainUnitName,
        mainUnitName,
        unitType: 1,
        rawQty,
        rawUnitName: rawUnitName || mainUnitName,
        rawUnitType: unitType,
        subRatio: ratio,
      });
    }

    return result;
  }

  async getItemTrackingFactorMovements(
    itemId: number,
    warehouseId?: string,
    fromDate?: string,
    toDate?: string
  ) {
    const itemRows = await this.repository.manager.connection.query(
      `SELECT i."ItemID", i."ItemCode", i."ItemName"
       FROM "Inv"."Items" i
       WHERE i."ItemID" = $1 OR i."ItemCode"::text = $1::text LIMIT 1`,
      [itemId]
    ).catch(() => []);

    const actualItemId = itemRows[0]?.ItemID || itemId;

    // Fetch tracking factor definitions for this item
    let tfDefs = await this.repository.manager.connection.query(
      `SELECT DISTINCT
        tf."TrackingFactorID",
        tf."TrackingFactorCode",
        tf."TrackingFactorName",
        tf."TrackingFactorName2",
        tf."TrackingFactorType",
        tf."StartValue",
        tf."EndValue",
        tf."IsConstantValue",
        tf."DisplayPriority"
       FROM "Inv"."TrackingFactors" tf
       JOIN "Inv"."TrackingFactorItemRelated" rel ON rel."TrackingFactorRef" = tf."TrackingFactorID"
       WHERE (rel."ItemRef" = $1 OR rel."ItemRef"::text = $1::text) AND tf."IsActive" = true
       ORDER BY tf."DisplayPriority" ASC, tf."TrackingFactorID" ASC`,
      [actualItemId]
    ).catch(() => []);

    if (!tfDefs || tfDefs.length === 0) {
      tfDefs = await this.repository.manager.connection.query(
        `SELECT DISTINCT
          COALESCE(rtf."TrackingFactorRef", rtf."TrackingFactorCode") AS "TrackingFactorID",
          rtf."TrackingFactorCode",
          rtf."TrackingFactorName",
          1 AS "TrackingFactorType",
          rtf."StartValue",
          rtf."EndValue"
         FROM "Inv"."WarehouseReceiptTrackingFactors" rtf
         JOIN "Inv"."WarehouseVouchersDetails" d ON d."WarehouseReceiptDetailID" = rtf."WarehouseReceiptDetailRef"
         WHERE (d."ItemRef" = $1 OR d."ItemRef"::text = $1::text)
         UNION
         SELECT DISTINCT
          COALESCE(itf."TrackingFactorRef", itf."TrackingFactorCode") AS "TrackingFactorID",
          itf."TrackingFactorCode",
          itf."TrackingFactorName",
          1 AS "TrackingFactorType",
          itf."StartValue",
          itf."EndValue"
         FROM "Inv"."WarehouseIssueTrackingFactors" itf
         JOIN "Inv"."WarehouseVouchersDetails" d ON d."WarehouseReceiptDetailID" = itf."WarehouseIssueDetailRef"
         WHERE (d."ItemRef" = $1 OR d."ItemRef"::text = $1::text)`,
        [actualItemId]
      ).catch(() => []);
    }

    const queryParams: any[] = [actualItemId];
    let whereConditions = `WHERE (d."ItemRef" = $1 OR d."ItemRef"::text = $1::text)`;

    if (warehouseId && warehouseId !== 'all' && Number(warehouseId) > 0) {
      queryParams.push(Number(warehouseId));
      whereConditions += ` AND (d."WarehouseRef" = $${queryParams.length} OR v."WarehouseRef" = $${queryParams.length})`;
    }

    // Receipts tracking factors
    const receiptRows = await this.repository.manager.connection.query(
      `SELECT 
        rtf."WarehouseReceiptTrackingFactorID" AS "id",
        d."WarehouseReceiptDetailID" AS "voucherDetailId",
        rtf."TrackingFactorRef",
        COALESCE(rtf."TrackingFactorCode"::text, rtf."TrackingFactorRef"::text, 'TF-1') AS "code",
        COALESCE(rtf."TrackingFactorName", 'عامل ردیابی') AS "name",
        COALESCE(rtf."FactorValue", rtf."StartValue"::text, '') AS "factorValue",
        rtf."StartValue",
        rtf."EndValue",
        rtf."Quantity" AS "tfQty",
        rtf."TrackingFactorValues",
        d."Quantity" AS "detailQty",
        v."WarehouseReceiptID",
        COALESCE(v."ReceiptNumber"::text, v."WarehouseReceiptID"::text) AS "voucherNo",
        v."ReceiptDate" AS "voucherDate",
        COALESCE(t."WarehouseDocumentTypeTitle", 'رسید انبار') AS "voucherTypeName",
        1 AS "nature"
       FROM "Inv"."WarehouseReceiptTrackingFactors" rtf
       JOIN "Inv"."WarehouseVouchersDetails" d ON d."WarehouseReceiptDetailID" = rtf."WarehouseReceiptDetailRef"
       JOIN "Inv"."WarehouseVouchers" v ON v."WarehouseReceiptID" = d."WarehouseReceiptRef"
       LEFT JOIN "Inv"."WarehouseDocumentTypes" t ON t."WarehouseDocumentTypeID" = v."WarehouseDocumentTypeRef"
       ${whereConditions}`,
      queryParams
    ).catch(() => []);

    // Issue tracking factors
    const issueRows = await this.repository.manager.connection.query(
      `SELECT 
        itf."WarehouseIssueTrackingFactorID" AS "id",
        d."WarehouseReceiptDetailID" AS "voucherDetailId",
        itf."TrackingFactorRef",
        COALESCE(itf."TrackingFactorCode"::text, itf."TrackingFactorRef"::text, 'TF-1') AS "code",
        COALESCE(itf."TrackingFactorName", 'عامل ردیابی') AS "name",
        COALESCE(itf."FactorValue", itf."StartValue"::text, '') AS "factorValue",
        itf."StartValue",
        itf."EndValue",
        itf."Quantity" AS "tfQty",
        itf."TrackingFactorValues",
        d."Quantity" AS "detailQty",
        v."WarehouseReceiptID",
        COALESCE(v."ReceiptNumber"::text, v."WarehouseReceiptID"::text) AS "voucherNo",
        v."ReceiptDate" AS "voucherDate",
        COALESCE(t."WarehouseDocumentTypeTitle", 'حواله انبار') AS "voucherTypeName",
        2 AS "nature"
       FROM "Inv"."WarehouseIssueTrackingFactors" itf
       JOIN "Inv"."WarehouseVouchersDetails" d ON d."WarehouseReceiptDetailID" = itf."WarehouseIssueDetailRef"
       JOIN "Inv"."WarehouseVouchers" v ON v."WarehouseReceiptID" = d."WarehouseReceiptRef"
       LEFT JOIN "Inv"."WarehouseDocumentTypes" t ON t."WarehouseDocumentTypeID" = v."WarehouseDocumentTypeRef"
       ${whereConditions}`,
      queryParams
    ).catch(() => []);

    // JSON tracking factor values on voucher details
    const jsonRows = await this.repository.manager.connection.query(
      `SELECT 
        d."WarehouseReceiptDetailID" AS "id",
        d."WarehouseReceiptDetailID" AS "voucherDetailId",
        d."TrackingFactorValues",
        d."Quantity" AS "detailQty",
        v."WarehouseReceiptID",
        COALESCE(v."ReceiptNumber"::text, v."WarehouseReceiptID"::text) AS "voucherNo",
        v."ReceiptDate" AS "voucherDate",
        COALESCE(t."WarehouseDocumentTypeTitle", CASE WHEN COALESCE(t."WarehouseDocumentNature", 1) = 1 THEN 'رسید انبار' ELSE 'حواله انبار' END) AS "voucherTypeName",
        COALESCE(t."WarehouseDocumentNature", 1) AS "nature"
       FROM "Inv"."WarehouseVouchersDetails" d
       JOIN "Inv"."WarehouseVouchers" v ON v."WarehouseReceiptID" = d."WarehouseReceiptRef"
       LEFT JOIN "Inv"."WarehouseDocumentTypes" t ON t."WarehouseDocumentTypeID" = v."WarehouseDocumentTypeRef"
       ${whereConditions} AND d."TrackingFactorValues" IS NOT NULL AND d."TrackingFactorValues"::text != '{}'`,
      queryParams
    ).catch(() => []);

    const cleanFrom = fromDate ? fromDate.trim().replace(/-/g, '/') : '';
    const cleanTo = toDate ? toDate.trim().replace(/-/g, '/') : '';

    const groupedMap = new Map<string, any>();
    const processedDetailIds = new Set<number>();
    let idCounter = 1;

    const computeFactorSig = (obj: any) => {
      const sortedKeys = Object.keys(obj)
        .filter(k => k !== 'id' && k !== 'voucherDetailIds' && k !== 'factorValueSig' && k !== 'value' && k !== 'code' && k !== 'name' && k !== 'factorValue')
        .sort();
      return sortedKeys.map(k => `${k}:${obj[k]}`).join('|');
    };

    const processRow = (row: any, isReceipt: boolean) => {
      const jDate = this.toJalaliString(row.voucherDate) || '1405/01/01';
      if (cleanFrom && jDate < cleanFrom) return;
      if (cleanTo && jDate > cleanTo) return;

      const detailId = Number(row.voucherDetailId || row.id || 0);
      if (detailId > 0) processedDetailIds.add(detailId);
      const rowObj: any = {};

      if (row.TrackingFactorValues && typeof row.TrackingFactorValues === 'object') {
        Object.assign(rowObj, row.TrackingFactorValues);
      }

      const tfRefKey = String(row.TrackingFactorRef || row.code || '');
      if (tfRefKey) {
        if (row.StartValue !== null && row.StartValue !== undefined) {
          rowObj[`${tfRefKey}_Start`] = row.StartValue;
        }
        if (row.EndValue !== null && row.EndValue !== undefined) {
          rowObj[`${tfRefKey}_End`] = row.EndValue;
        }
        if (row.factorValue !== undefined && row.factorValue !== null && row.factorValue !== '') {
          rowObj[tfRefKey] = row.factorValue;
        }
      }

      if (row.code) rowObj.code = String(row.code);
      if (row.name) rowObj.name = String(row.name);

      const rName = String(row.name || '').trim();
      const rNameLower = rName.toLowerCase();
      const rVal = String(row.factorValue || '');
      if (rVal) {
        if (rName.includes('بچ') || rNameLower.includes('batch')) {
          rowObj.batchNumber = rVal;
        } else if (rName.includes('انقض') || rNameLower.includes('expir')) {
          rowObj.expireDate = rVal;
        } else if (rName.includes('سریال') || rNameLower.includes('serial')) {
          rowObj.serialNumber = rVal;
        }
      }

      // Extract start and end serial values from row or rowObj
      let startVal = row.StartValue;
      let endVal = row.EndValue;
      if (startVal === null || startVal === undefined) {
        for (const k of Object.keys(rowObj)) {
          if (k.endsWith('_Start') && rowObj[k] !== undefined && rowObj[k] !== null && rowObj[k] !== '') {
            startVal = rowObj[k];
            const endKey = k.replace('_Start', '_End');
            if (rowObj[endKey] !== undefined && rowObj[endKey] !== null && rowObj[endKey] !== '') {
              endVal = rowObj[endKey];
            }
            break;
          }
        }
      }

      const startNum = Number(startVal);
      const endNum = Number(endVal);
      const isNumericRange =
        startVal !== null &&
        startVal !== undefined &&
        endVal !== null &&
        endVal !== undefined &&
        !isNaN(startNum) &&
        !isNaN(endNum) &&
        endNum >= startNum &&
        endNum - startNum + 1 <= 2000;

      if (isNumericRange) {
        for (let s = startNum; s <= endNum; s++) {
          const serialVal = String(s);
          const singleObj: any = { ...rowObj };
          if (tfRefKey) {
            singleObj[tfRefKey] = serialVal;
          }
          singleObj.serialNumber = serialVal;
          singleObj.factorValue = serialVal;

          tfDefs.forEach((tf: any) => {
            const tfType = Number(tf.TrackingFactorType || 0);
            const tfName = String(tf.TrackingFactorName || tf.Name || tf.Title || '').trim();
            const tfNameLower = tfName.toLowerCase();
            const isSerial = tfName.includes('سریال') || tfNameLower.includes('serial') || tfType === 8 || tfType === 2;
            if (isSerial) {
              const factorKey = String(tf.TrackingFactorID || tf.ItemTrackingFactorID || tf.TrackingFactorRef || tf.id || tf.Code || tf.TrackingFactorCode);
              const factorCode = String(tf.TrackingFactorCode || tf.Code || '');
              singleObj[factorKey] = serialVal;
              if (factorCode) singleObj[factorCode] = serialVal;
            }
          });

          const parts: string[] = [`سریال: ${serialVal}`];
          if (singleObj.batchNumber || singleObj.BatchNumber) parts.push(`سری/بچ: ${singleObj.batchNumber || singleObj.BatchNumber}`);
          if (singleObj.expireDate || singleObj.ExpireDate) parts.push(`انقضا: ${singleObj.expireDate || singleObj.ExpireDate}`);
          singleObj.value = parts.join(' | ');

          const sig = computeFactorSig(singleObj);
          if (!sig || sig.trim() === '') continue;

          if (groupedMap.has(sig)) {
            const existing = groupedMap.get(sig);
            if (detailId > 0 && !existing.voucherDetailIds.includes(detailId)) {
              existing.voucherDetailIds.push(detailId);
              existing.quantity = (Number(existing.quantity) || 1) + 1;
            }
          } else {
            singleObj.id = idCounter++;
            singleObj.factorValueSig = sig;
            singleObj.voucherDetailIds = detailId > 0 ? [detailId] : [];
            singleObj.quantity = 1;
            groupedMap.set(sig, singleObj);
          }
        }
        return;
      }

      let valStr = String(row.factorValue || '');
      if (startVal !== null && startVal !== undefined && endVal !== null && endVal !== undefined && startVal !== '' && endVal !== '') {
        valStr = startVal === endVal ? String(startVal) : `از سری ${startVal} تا ${endVal}`;
      } else if (row.TrackingFactorValues && typeof row.TrackingFactorValues === 'object') {
        const tfv = row.TrackingFactorValues;
        const parts: string[] = [];
        if (tfv.serialNumber || tfv.SerialNumber) parts.push(`سریال: ${tfv.serialNumber || tfv.SerialNumber}`);
        if (tfv.batchNumber || tfv.BatchNumber) parts.push(`سری/بچ: ${tfv.batchNumber || tfv.BatchNumber}`);
        if (tfv.expireDate || tfv.ExpireDate) parts.push(`انقضا: ${tfv.expireDate || tfv.ExpireDate}`);
        if (parts.length > 0) valStr = parts.join(' | ');
      }
      rowObj.value = valStr || '-';

      tfDefs.forEach((tf: any) => {
        const factorKey = String(tf.TrackingFactorID || tf.ItemTrackingFactorID || tf.TrackingFactorRef || tf.id || tf.Code || tf.TrackingFactorCode);
        const factorCode = String(tf.TrackingFactorCode || tf.Code || '');
        const tfName = String(tf.TrackingFactorName || tf.Name || tf.Title || '').trim();
        const tfNameLower = tfName.toLowerCase();
        const tfType = Number(tf.TrackingFactorType || 0);

        const isBatch = tfName.includes('بچ') || tfNameLower.includes('batch') || tfType === 6;
        const isExpire = tfName.includes('انقض') || tfNameLower.includes('expir') || tfType === 4;
        const isSerial = tfName.includes('سریال') || tfNameLower.includes('serial') || tfType === 8 || tfType === 2;

        let val = rowObj[factorKey] ?? rowObj[factorCode];
        if (val === undefined || val === null || val === '') {
          if (isBatch) {
            val = rowObj.batchNumber || rowObj.BatchNumber || rowObj.batch_number;
          } else if (isExpire) {
            val = rowObj.expireDate || rowObj.ExpireDate || rowObj.expire_date;
          } else if (isSerial) {
            val = rowObj.serialNumber || rowObj.SerialNumber || rowObj.serial_number;
            if (!val && (rowObj[`${factorKey}_Start`] || rowObj[`${factorCode}_Start`])) {
              const s = rowObj[`${factorKey}_Start`] || rowObj[`${factorCode}_Start`];
              const e = rowObj[`${factorKey}_End`] || rowObj[`${factorCode}_End`];
              val = s && e ? (s === e ? String(s) : `از ${s} تا ${e}`) : String(s || '');
            }
          }
        }
        if (val !== undefined && val !== null && val !== '') {
          let strVal = '';
          if (typeof val === 'object') {
            if (isBatch) strVal = String(val.batchNumber || val.BatchNumber || val['1'] || '');
            else if (isExpire) strVal = String(val.expireDate || val.ExpireDate || val['2'] || '');
            else if (isSerial) strVal = String(val.serialNumber || val.SerialNumber || val['3'] || val.StartValue || '');
            else strVal = String(val.value || val.factorValue || '');
          } else {
            strVal = String(val);
          }

          if (strVal) {
            rowObj[factorKey] = strVal;
            if (factorCode) rowObj[factorCode] = strVal;
            if (isBatch && !rowObj.batchNumber) rowObj.batchNumber = strVal;
            if (isExpire && !rowObj.expireDate) rowObj.expireDate = strVal;
            if (isSerial && !rowObj.serialNumber) rowObj.serialNumber = strVal;
          }
        }
      });

      const sig = computeFactorSig(rowObj);
      if (!sig || sig.trim() === '') return;

      if (groupedMap.has(sig)) {
        const existing = groupedMap.get(sig);
        if (detailId > 0 && !existing.voucherDetailIds.includes(detailId)) {
          existing.voucherDetailIds.push(detailId);
        }
      } else {
        rowObj.id = idCounter++;
        rowObj.factorValueSig = sig;
        rowObj.voucherDetailIds = detailId > 0 ? [detailId] : [];
        groupedMap.set(sig, rowObj);
      }
    };

    receiptRows.forEach((r: any) => processRow(r, true));
    issueRows.forEach((r: any) => processRow(r, false));

    jsonRows.forEach((r: any) => {
      const jDate = this.toJalaliString(r.voucherDate) || '1405/01/01';
      if (cleanFrom && jDate < cleanFrom) return;
      if (cleanTo && jDate > cleanTo) return;

      const detailId = Number(r.voucherDetailId || r.id || 0);
      if (detailId > 0 && processedDetailIds.has(detailId)) return;
      let tfv = r.TrackingFactorValues;
      if (typeof tfv === 'string') {
        try {
          tfv = JSON.parse(tfv);
        } catch {
          tfv = null;
        }
      }

      if (tfv && typeof tfv === 'object') {
        const processItem = (itemObj: any) => {
          if (!itemObj || typeof itemObj !== 'object') return;
          const rowObj: any = {};
          
          // Copy primitive fields
          Object.keys(itemObj).forEach((k) => {
            const val = itemObj[k];
            if (val !== null && val !== undefined && typeof val !== 'object') {
              rowObj[k] = String(val);
            } else if (val && typeof val === 'object') {
              // Extract primitive values if nested object
              if (val.serialNumber || val.SerialNumber) rowObj.serialNumber = String(val.serialNumber || val.SerialNumber);
              if (val.batchNumber || val.BatchNumber) rowObj.batchNumber = String(val.batchNumber || val.BatchNumber);
              if (val.expireDate || val.ExpireDate) rowObj.expireDate = String(val.expireDate || val.ExpireDate);
              if (val.value || val.FactorValue) rowObj.factorValue = String(val.value || val.FactorValue);
            }
          });

          // Extract range start/end from itemObj or rowObj
          let startVal = itemObj.startValue ?? itemObj.StartValue ?? rowObj.startValue ?? rowObj.StartValue;
          let endVal = itemObj.endValue ?? itemObj.EndValue ?? rowObj.endValue ?? rowObj.EndValue;
          if (startVal === null || startVal === undefined) {
            for (const k of Object.keys(itemObj)) {
              if (k.endsWith('_Start') && itemObj[k] !== undefined && itemObj[k] !== null && itemObj[k] !== '') {
                startVal = itemObj[k];
                const endKey = k.replace('_Start', '_End');
                if (itemObj[endKey] !== undefined && itemObj[endKey] !== null && itemObj[endKey] !== '') {
                  endVal = itemObj[endKey];
                }
                break;
              }
            }
          }

          // Ensure tracking factor column keys are populated
          tfDefs.forEach((tf: any) => {
            const factorKey = String(tf.TrackingFactorID || tf.ItemTrackingFactorID || tf.TrackingFactorRef || tf.id || tf.Code || tf.TrackingFactorCode);
            const factorCode = String(tf.TrackingFactorCode || tf.Code || '');
            const tfName = String(tf.TrackingFactorName || tf.Name || tf.Title || '').trim();
            const tfNameLower = tfName.toLowerCase();
            const tfType = Number(tf.TrackingFactorType || 0);

            const isBatch = tfName.includes('بچ') || tfNameLower.includes('batch') || tfType === 6;
            const isExpire = tfName.includes('انقض') || tfNameLower.includes('expir') || tfType === 4;
            const isSerial = tfName.includes('سریال') || tfNameLower.includes('serial') || tfType === 8 || tfType === 2;

            let val = rowObj[factorKey] ?? rowObj[factorCode] ?? itemObj[factorKey] ?? itemObj[factorCode];
            if (val === undefined || val === null || val === '') {
              if (isBatch) {
                val = rowObj.batchNumber || itemObj.batchNumber || itemObj.BatchNumber;
              } else if (isExpire) {
                val = rowObj.expireDate || itemObj.expireDate || itemObj.ExpireDate;
              } else if (isSerial) {
                val = rowObj.serialNumber || itemObj.serialNumber || itemObj.SerialNumber || startVal;
                if (!val && (itemObj[`${factorKey}_Start`] || itemObj[`${factorCode}_Start`])) {
                  const s = itemObj[`${factorKey}_Start`] || itemObj[`${factorCode}_Start`];
                  const e = itemObj[`${factorKey}_End`] || itemObj[`${factorCode}_End`];
                  val = s && e ? (s === e ? String(s) : `از ${s} تا ${e}`) : String(s || '');
                }
              }
            }
            if (val !== undefined && val !== null && val !== '') {
              let strVal = '';
              if (typeof val === 'object') {
                if (isBatch) strVal = String(val.batchNumber || val.BatchNumber || val['1'] || '');
                else if (isExpire) strVal = String(val.expireDate || val.ExpireDate || val['2'] || '');
                else if (isSerial) strVal = String(val.serialNumber || val.SerialNumber || val['3'] || val.StartValue || '');
                else strVal = String(val.value || val.factorValue || '');
              } else {
                strVal = String(val);
              }

              if (strVal) {
                rowObj[factorKey] = strVal;
                if (factorCode) rowObj[factorCode] = strVal;
                if (isBatch && !rowObj.batchNumber) rowObj.batchNumber = strVal;
                if (isExpire && !rowObj.expireDate) rowObj.expireDate = strVal;
                if (isSerial && !rowObj.serialNumber) rowObj.serialNumber = strVal;
              }
            }
          });

          const startNum = Number(startVal);
          const endNum = Number(endVal);
          const isNumericRange =
            startVal !== null &&
            startVal !== undefined &&
            endVal !== null &&
            endVal !== undefined &&
            !isNaN(startNum) &&
            !isNaN(endNum) &&
            endNum >= startNum &&
            endNum - startNum + 1 <= 2000;

          if (isNumericRange) {
            for (let s = startNum; s <= endNum; s++) {
              const serialVal = String(s);
              const singleObj: any = { ...rowObj };
              singleObj.serialNumber = serialVal;
              singleObj.factorValue = serialVal;

              tfDefs.forEach((tf: any) => {
                const tfType = Number(tf.TrackingFactorType || 0);
                const tfName = String(tf.TrackingFactorName || tf.Name || tf.Title || '').trim();
                const tfNameLower = tfName.toLowerCase();
                const isSerial = tfName.includes('سریال') || tfNameLower.includes('serial') || tfType === 8 || tfType === 2;
                if (isSerial) {
                  const factorKey = String(tf.TrackingFactorID || tf.ItemTrackingFactorID || tf.TrackingFactorRef || tf.id || tf.Code || tf.TrackingFactorCode);
                  const factorCode = String(tf.TrackingFactorCode || tf.Code || '');
                  singleObj[factorKey] = serialVal;
                  if (factorCode) singleObj[factorCode] = serialVal;
                }
              });

              const parts: string[] = [`سریال: ${serialVal}`];
              if (singleObj.batchNumber || singleObj.BatchNumber) parts.push(`سری/بچ: ${singleObj.batchNumber || singleObj.BatchNumber}`);
              if (singleObj.expireDate || singleObj.ExpireDate) parts.push(`انقضا: ${singleObj.expireDate || singleObj.ExpireDate}`);
              singleObj.value = parts.join(' | ');

              const sig = computeFactorSig(singleObj);
              if (!sig || sig.trim() === '') continue;

              if (groupedMap.has(sig)) {
                const existing = groupedMap.get(sig);
                if (detailId > 0 && !existing.voucherDetailIds.includes(detailId)) {
                  existing.voucherDetailIds.push(detailId);
                  existing.quantity = (Number(existing.quantity) || 1) + 1;
                }
              } else {
                singleObj.id = idCounter++;
                singleObj.factorValueSig = sig;
                singleObj.voucherDetailIds = detailId > 0 ? [detailId] : [];
                singleObj.quantity = 1;
                groupedMap.set(sig, singleObj);
              }
            }
            return;
          }

          let valStr = '';
          const parts: string[] = [];
          if (rowObj.serialNumber || itemObj.serialNumber || itemObj.SerialNumber) parts.push(`سریال: ${rowObj.serialNumber || itemObj.serialNumber || itemObj.SerialNumber}`);
          if (rowObj.batchNumber || itemObj.batchNumber || itemObj.BatchNumber) parts.push(`سری/بچ: ${rowObj.batchNumber || itemObj.batchNumber || itemObj.BatchNumber}`);
          if (rowObj.expireDate || itemObj.expireDate || itemObj.ExpireDate) parts.push(`انقضا: ${rowObj.expireDate || itemObj.expireDate || itemObj.ExpireDate}`);
          if (rowObj.factorValue || itemObj.value || itemObj.FactorValue) parts.push(`${rowObj.factorValue || itemObj.value || itemObj.FactorValue}`);
          if (parts.length > 0) valStr = parts.join(' | ');
          rowObj.value = valStr || '-';

          const sig = computeFactorSig(rowObj);
          if (!sig || sig.trim() === '') return;

          if (groupedMap.has(sig)) {
            const existing = groupedMap.get(sig);
            if (detailId > 0 && !existing.voucherDetailIds.includes(detailId)) {
              existing.voucherDetailIds.push(detailId);
            }
          } else {
            rowObj.id = idCounter++;
            rowObj.factorValueSig = sig;
            rowObj.voucherDetailIds = detailId > 0 ? [detailId] : [];
            groupedMap.set(sig, rowObj);
          }
        };

        if (Array.isArray(tfv)) {
          tfv.forEach((item: any) => processItem(item));
        } else if (Object.keys(tfv).length > 0) {
          processItem(tfv);
        }
      }
    });

    const uniqueMovements = Array.from(groupedMap.values());

    const finalTfDefs: any[] = Array.isArray(tfDefs) ? [...tfDefs] : [];

    const hasBatch = uniqueMovements.some((m: any) => m.batchNumber || m["1"] || m.batch_number || m.batch);
    const hasExpire = uniqueMovements.some((m: any) => m.expireDate || m["2"] || m.expire_date || m.expirationDate);
    const hasSerial = uniqueMovements.some((m: any) => m.serialNumber || m["3"] || m.serial_number || m.serial || m.StartValue || m["3_Start"]);

    if (hasBatch && !finalTfDefs.some((tf: any) => Number(tf.TrackingFactorType) === 6 || String(tf.TrackingFactorName).includes("بچ") || String(tf.TrackingFactorCode) === "1")) {
      finalTfDefs.push({ TrackingFactorID: 1, TrackingFactorCode: "1", TrackingFactorName: "شماره سری/بچ", TrackingFactorType: 6 });
    }
    if (hasExpire && !finalTfDefs.some((tf: any) => Number(tf.TrackingFactorType) === 4 || String(tf.TrackingFactorName).includes("انقض") || String(tf.TrackingFactorCode) === "2")) {
      finalTfDefs.push({ TrackingFactorID: 2, TrackingFactorCode: "2", TrackingFactorName: "تاریخ انقضاء", TrackingFactorType: 4 });
    }
    if (hasSerial && !finalTfDefs.some((tf: any) => Number(tf.TrackingFactorType) === 8 || Number(tf.TrackingFactorType) === 2 || String(tf.TrackingFactorName).includes("سریال") || String(tf.TrackingFactorCode) === "3")) {
      finalTfDefs.push({ TrackingFactorID: 3, TrackingFactorCode: "3", TrackingFactorName: "شماره سریال", TrackingFactorType: 8 });
    }

    uniqueMovements.forEach((m: any) => {
      finalTfDefs.forEach((tf: any) => {
        const tfId = String(tf.TrackingFactorID || tf.id || tf.TrackingFactorRef || tf.TrackingFactorCode || '');
        const tfCode = String(tf.TrackingFactorCode || tf.code || '');
        const tfName = String(tf.TrackingFactorName || tf.name || '').toLowerCase();
        const tfType = Number(tf.TrackingFactorType || 0);

        const isBatch = tfType === 6 || tfName.includes("بچ") || (tfCode === "1" && !tfName.includes("انقض") && !tfName.includes("سریال"));
        const isExpire = tfType === 4 || tfName.includes("انقض") || (tfCode === "2" && !tfName.includes("بچ") && !tfName.includes("سریال"));
        const isSerial = tfType === 8 || tfType === 2 || tfName.includes("سریال") || (tfCode === "3" && !tfName.includes("بچ") && !tfName.includes("انقض"));

        if (isBatch) {
          const val = m.batchNumber || m.batch_number || m.batch || (m[tfId] && String(m[tfId]) !== String(m.expireDate) ? m[tfId] : '') || (m[tfCode] && String(m[tfCode]) !== String(m.expireDate) ? m[tfCode] : '');
          if (val) {
            if (tfId) m[tfId] = val;
            if (tfCode) m[tfCode] = val;
            m.batchNumber = val;
          }
        } else if (isExpire) {
          const val = m.expireDate || m.expire_date || m.expirationDate || (m[tfId] && String(m[tfId]) !== String(m.batchNumber) ? m[tfId] : '') || (m[tfCode] && String(m[tfCode]) !== String(m.batchNumber) ? m[tfCode] : '');
          if (val) {
            if (tfId) m[tfId] = val;
            if (tfCode) m[tfCode] = val;
            m.expireDate = val;
          }
        } else if (isSerial) {
          const val = m.serialNumber || m.serial_number || m.serial || (m[tfId] ?? m[tfCode] ?? '') || (m.StartValue ? (m.StartValue === m.EndValue ? String(m.StartValue) : `از ${m.StartValue} تا ${m.EndValue}`) : '');
          if (val) {
            if (tfId) m[tfId] = val;
            if (tfCode) m[tfCode] = val;
            m.serialNumber = val;
          }
        }
      });
    });

    return {
      trackingFactors: finalTfDefs,
      movements: uniqueMovements,
    };
  }

  private toJalaliString(dateValue: any): string {
    if (!dateValue) return '';
    try {
      if (typeof dateValue === 'string') {
        const clean = dateValue.trim();
        if (/^1[34]\d{2}[\/\-]\d{1,2}[\/\-]\d{1,2}/.test(clean)) {
          return clean.replace(/-/g, '/');
        }
        const m = moment(clean);
        if (m.isValid()) {
          return m.format('jYYYY/jMM/jDD');
        }
      }
      if (dateValue instanceof Date) {
        const m = moment(dateValue);
        if (m.isValid()) {
          return m.format('jYYYY/jMM/jDD');
        }
      }
    } catch (err) {}
    return String(dateValue || '');
  }

  async getKardexWarehouses(fiscalYearId?: string, companyId?: string) {
    let whereClause = '';
    const params: any[] = [];

    if (fiscalYearId && Number(fiscalYearId) > 0) {
      params.push(Number(fiscalYearId));
      whereClause += ` AND v."FiscalYearRef" = $${params.length}`;
    }

    if (companyId && Number(companyId) > 0) {
      params.push(Number(companyId));
      whereClause += ` AND (v."CompanyRef" = $${params.length} OR w."CompanyRef" = $${params.length})`;
    }

    const queryStr = `
      SELECT DISTINCT
        w."WarehouseID",
        w."WarehouseID" AS "id",
        w."WarehouseCode",
        w."WarehouseCode" AS "code",
        w."WarehouseTitle",
        w."WarehouseTitle" AS "title",
        w."WarehouseTitle" AS "name",
        COALESCE(w."WarehouseTitle2", '-') AS "WarehouseTitle2",
        COALESCE(w."WarehouseTitle2", '-') AS "title2"
      FROM "Inv"."Warehouses" w
      JOIN "Inv"."WarehouseVouchers" v ON v."WarehouseRef" = w."WarehouseID"
      WHERE 1=1 ${whereClause}
      ORDER BY w."WarehouseCode" ASC, w."WarehouseTitle" ASC
    `;

    try {
      const rows = await this.repository.manager.connection.query(queryStr, params);
      if (rows && rows.length > 0) {
        return rows;
      }
    } catch (err) {
      console.error('getKardexWarehouses query error:', err);
    }

    try {
      const fallbackRows = await this.repository.manager.connection.query(
        `SELECT 
          w."WarehouseID",
          w."WarehouseID" AS "id",
          w."WarehouseCode",
          w."WarehouseCode" AS "code",
          w."WarehouseTitle",
          w."WarehouseTitle" AS "title",
          w."WarehouseTitle" AS "name",
          COALESCE(w."WarehouseTitle2", '-') AS "WarehouseTitle2",
          COALESCE(w."WarehouseTitle2", '-') AS "title2"
         FROM "Inv"."Warehouses" w
         ORDER BY w."WarehouseCode" ASC, w."WarehouseTitle" ASC`,
        []
      );
      return fallbackRows || [];
    } catch (err) {
      return [];
    }
  }

  async getKardexDateBounds(fiscalYearId?: string, companyId?: string) {
    let resolvedFyId: number | null = fiscalYearId && Number(fiscalYearId) > 0 ? Number(fiscalYearId) : null;
    let fromDate = '1403/01/01';
    let toDate = '1403/12/29';
    let fiscalYearTitle = '';

    try {
      let fyRows: any[] = [];
      if (resolvedFyId) {
        fyRows = await this.repository.manager.connection.query(
          `SELECT "FiscalYearID", "Title", "StartDate", "EndDate" FROM "Gnr"."FiscalYear" WHERE "FiscalYearID" = $1 LIMIT 1`,
          [resolvedFyId]
        );
      } else {
        fyRows = await this.repository.manager.connection.query(
          `SELECT "FiscalYearID", "Title", "StartDate", "EndDate" FROM "Gnr"."FiscalYear" WHERE "IsActive" = true ORDER BY "FiscalYearID" DESC LIMIT 1`,
          []
        );
      }

      if (fyRows && fyRows.length > 0) {
        const fy = fyRows[0];
        resolvedFyId = Number(fy.FiscalYearID);
        fiscalYearTitle = fy.Title || '';
        if (fy.StartDate) {
          const jStart = this.toJalaliString(fy.StartDate);
          if (jStart) fromDate = jStart;
        }
        if (fy.EndDate) {
          const jEnd = this.toJalaliString(fy.EndDate);
          if (jEnd) toDate = jEnd;
        }
      }
    } catch (err) {
      console.error('getKardexDateBounds fiscal year error:', err);
    }

    try {
      let vParams: any[] = [];
      let vWhere = 'WHERE v."ReceiptDate" IS NOT NULL';
      if (resolvedFyId) {
        vParams.push(resolvedFyId);
        vWhere += ` AND v."FiscalYearRef" = $1`;
      }

      const latestVoucherRows = await this.repository.manager.connection.query(
        `SELECT MAX(v."ReceiptDate") AS "MaxDate" FROM "Inv"."WarehouseVouchers" v ${vWhere}`,
        vParams
      );

      if (latestVoucherRows && latestVoucherRows.length > 0 && latestVoucherRows[0]?.MaxDate) {
        const jLatest = this.toJalaliString(latestVoucherRows[0].MaxDate);
        if (jLatest) {
          toDate = jLatest;
        }
      }
    } catch (err) {
      console.error('getKardexDateBounds latest voucher error:', err);
    }

    return {
      fromDate,
      toDate,
      fiscalYearId: resolvedFyId,
      fiscalYearTitle,
    };
  }
}
