import { Injectable, Inject, NotFoundException, BadRequestException } from '@nestjs/common';
import { ISalesItemGroupRepository, ISalesItemGroupRepositoryToken } from '../../domain/repositories/sales-item-group.repository.interface';
import { SalesItemGroup } from '../../domain/entities/sales-item-group.entity';
import { SalesItemGroupRelatedProduct } from '../../domain/entities/sales-item-group-related-product.entity';
import { CreateSalesItemGroupDto, UpdateSalesItemGroupDto } from '../dtos/sales-item-group.dto';
import { IdGenerationService } from '../../../../core/services/id-generation.service';
import { RequestContextService } from '../../../../core/services/request-context.service';

@Injectable()
export class SalesItemGroupService {
  constructor(
    @Inject(ISalesItemGroupRepositoryToken)
    private readonly repository: ISalesItemGroupRepository,
    private readonly idGenerationService: IdGenerationService,
    private readonly requestContextService: RequestContextService,
  ) {}

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

  /**
   * Idempotent, race-safe seeding of the default group tree.
   *
   * Bug fixed: two concurrent requests (e.g. React StrictMode double-mount in
   * dev, or double tab open) both saw an empty table and each seeded the
   * default rows, leaving duplicated "کالا"/"خدمت" entries in the tree.
   * Seeding now runs inside a PostgreSQL advisory-lock transaction and
   * re-checks existence by (ParentRef, Code) before inserting.
   */
  private async ensureDefaultTree(scopeWhere: any, bsId: number, compId: number): Promise<void> {
    await this.repository.manager.transaction(async (em: any) => {
      // Serialize concurrent seed attempts across all connections
      await em.query(`SELECT pg_advisory_xact_lock(hashtext('Sle:SalesItemGroups:seed'))`);

      const userId = this.requestContextService.getUserId() || 1;
      let rows: SalesItemGroup[] = await em.find(SalesItemGroup, { where: scopeWhere });

      // Ensure exactly one root
      let root = rows.find((r) => !r.ParentRef);
      if (!root) {
        const rootId = await this.idGenerationService.generateNextId('SalesItemGroups');
        root = await em.save(SalesItemGroup, em.create(SalesItemGroup, {
          SalesItemGroupID: rootId,
          SalesItemGroupCode: '0',
          SalesItemGroupName: 'گروه بندی کالا فروش',
          SalesItemGroupName2: '',
          Description: '',
          IsMandatory: false,
          ParentRef: null,
          creator: userId,
          lastModifier: userId,
          companyRef: compId,
          businessStructureRef: bsId,
        } as any));
      }

      // Ensure default children exist — check by (ParentRef, Code) so a
      // re-run can never create duplicates
      const children: SalesItemGroup[] = await em.find(SalesItemGroup, {
        where: { ...scopeWhere, ParentRef: root.SalesItemGroupID },
      });
      const hasCode = (code: string) => children.some((c) => String(c.SalesItemGroupCode) === code);

      const defaults = [
        { code: '10', name: 'کالا', name2: 'Goods' },
        { code: '20', name: 'خدمت', name2: 'Services' },
      ];
      for (const d of defaults) {
        if (hasCode(d.code)) continue;
        const newId = await this.idGenerationService.generateNextId('SalesItemGroups');
        await em.save(SalesItemGroup, em.create(SalesItemGroup, {
          SalesItemGroupID: newId,
          SalesItemGroupCode: d.code,
          SalesItemGroupName: d.name,
          SalesItemGroupName2: d.name2,
          Description: '',
          IsMandatory: false,
          ParentRef: root.SalesItemGroupID,
          creator: userId,
          lastModifier: userId,
          companyRef: compId,
          businessStructureRef: bsId,
        } as any));
      }
    });
  }

  /**
   * Self-heal: the legacy race-condition bug left duplicated seed rows
   * (same ParentRef + Code + Name) in the table. Keep the lowest ID of each
   * natural-key group, re-point children / related products to the kept row
   * and delete the redundant ones. Runs on every tree load but is a no-op
   * (single cheap SELECT) once the table is clean.
   */
  private async cleanupDuplicateRows(): Promise<void> {
    try {
      const dupRows: any[] = await this.repository.manager.query(`
        SELECT "SalesItemGroupID" AS id,
               ROW_NUMBER() OVER (
                 PARTITION BY COALESCE("ParentRef", 0), "SalesItemGroupCode", "SalesItemGroupName"
                 ORDER BY "SalesItemGroupID"
               ) AS rn
        FROM "Sle"."SalesItemGroups"
      `);
      const dups = dupRows.filter((r) => Number(r.rn) > 1).map((r) => Number(r.id));
      if (dups.length === 0) return;

      const pairs: any[] = await this.repository.manager.query(`
        SELECT "SalesItemGroupID"::bigint AS dup,
               MIN("SalesItemGroupID") OVER (
                 PARTITION BY COALESCE("ParentRef", 0), "SalesItemGroupCode", "SalesItemGroupName"
               )::bigint AS kept
        FROM "Sle"."SalesItemGroups"
        WHERE "SalesItemGroupID" = ANY($1::bigint[])
      `, [dups]);

      for (const { dup, kept } of pairs) {
        if (Number(dup) === Number(kept)) continue;
        await this.repository.manager.query(
          `UPDATE "Sle"."SalesItemGroups" SET "ParentRef" = $1 WHERE "ParentRef" = $2`,
          [kept, dup]
        );
        await this.repository.manager.query(
          `UPDATE "Sle"."SalesItemGroupRelatedProducts" SET "SalesItemGroupRef" = $1 WHERE "SalesItemGroupRef" = $2`,
          [kept, dup]
        );
        await this.repository.manager.query(
          `DELETE FROM "Sle"."SalesItemGroups" WHERE "SalesItemGroupID" = $1`,
          [dup]
        );
      }
    } catch (err) {
      // Never break tree loading because of the self-heal
      console.error('SalesItemGroupService.cleanupDuplicateRows failed:', err);
    }
  }

  async getTree(search?: string): Promise<any> {
    const { bsId, compId, isShared } = await this.getScope();
    let where: any = {};
    if (isShared) {
      where.businessStructureRef = bsId;
    } else {
      where.companyRef = compId;
    }

    // 1) Merge/delete duplicated seed rows left by the legacy race bug
    await this.cleanupDuplicateRows();

    // 2) Race-safe idempotent seeding of the default tree
    await this.ensureDefaultTree(where, bsId, compId);

    let items = await this.repository.findAll({ where });

    // Defense-in-depth: never render the same natural-key node twice,
    // even if duplicate rows somehow reappear in the table.
    items = [...items].sort(
      (a, b) => Number(a.SalesItemGroupID) - Number(b.SalesItemGroupID)
    );
    const seenNaturalKeys = new Set<string>();
    items = items.filter((item) => {
      const key = `${item.ParentRef ?? 0}|${String(item.SalesItemGroupCode ?? '')}|${String(item.SalesItemGroupName ?? '')}`;
      if (seenNaturalKeys.has(key)) return false;
      seenNaturalKeys.add(key);
      return true;
    });

    let displayItems = items;
    if (search && search.trim() !== '') {
      const q = search.trim().toLowerCase();
      const matchingItems = items.filter((item) => {
        const code = String(item.SalesItemGroupCode || '').toLowerCase();
        const name = String(item.SalesItemGroupName || '').toLowerCase();
        const name2 = String(item.SalesItemGroupName2 || '').toLowerCase();
        return code.includes(q) || name.includes(q) || name2.includes(q);
      });

      const keepIds = new Set<number>();
      const itemMapById = new Map<number, any>();
      items.forEach((item) => itemMapById.set(Number(item.SalesItemGroupID), item));

      matchingItems.forEach((item) => {
        let current: any = item;
        while (current) {
          const cId = Number(current.SalesItemGroupID);
          keepIds.add(cId);
          if (current.ParentRef && itemMapById.has(Number(current.ParentRef))) {
            current = itemMapById.get(Number(current.ParentRef));
          } else {
            current = null;
          }
        }
      });

      const rootItem = items.find((i) => !i.ParentRef);
      if (rootItem) keepIds.add(Number(rootItem.SalesItemGroupID));

      displayItems = items.filter((item) => keepIds.has(Number(item.SalesItemGroupID)));
    }

    const itemMap = new Map<number, any>();
    displayItems.forEach((item) => {
      itemMap.set(Number(item.SalesItemGroupID), {
        id: String(item.SalesItemGroupID),
        name: item.SalesItemGroupName,
        code: item.SalesItemGroupCode,
        isRoot: !item.ParentRef,
        children: [],
        data: {
          code: item.SalesItemGroupCode,
          name2: item.SalesItemGroupName2 || '',
          description: item.Description || '',
          isMandatory: item.IsMandatory || false,
          relatedProducts: (item.relatedProducts || []).map((p: any) => ({
            _id: String(p.SalesItemGroupRelatedProductID),
            product_code: p.ProductCode,
            product_name: p.ProductName,
            unit: p.Unit,
            is_active: p.IsActive,
            description: p.Description,
          })),
        },
      });
    });

    let rootNode: any = null;
    displayItems.forEach((item) => {
      const node = itemMap.get(Number(item.SalesItemGroupID));
      if (item.ParentRef && itemMap.has(Number(item.ParentRef))) {
        const parentNode = itemMap.get(Number(item.ParentRef));
        parentNode.children.push(node);
      } else {
        if (!rootNode || item.SalesItemGroupName === 'گروه بندی کالا فروش') {
          rootNode = node;
        }
      }
    });

    return rootNode;
  }

  async saveTree(treeData: any): Promise<any> {
    const { bsId, compId, isShared } = await this.getScope();
    const userId = this.requestContextService.getUserId() || 1;

    const processNode = async (node: any, parentRef: number | null) => {
      if (!node) return;
      let id = node.id && /^\d+$/.test(node.id) ? parseInt(node.id, 10) : null;
      const data = node.data || {};

      if (!id) {
        // Reuse an existing row with the same (ParentRef, Code) instead of
        // creating a duplicate. Legacy localStorage trees carry string ids
        // like 'goods-default'/'services-default' which used to be inserted
        // as brand-new rows on every save, duplicating the default entries.
        const code = String(node.code || data.code || '').trim();
        const existingSibling = await this.findByParentAndCode(parentRef, code);
        if (existingSibling) {
          id = existingSibling.SalesItemGroupID;
        } else {
          id = await this.idGenerationService.generateNextId('SalesItemGroups');
        }
        node.id = String(id);
      }

      const existing = await this.repository.findById(id).catch(() => null);
      const payload = {
        SalesItemGroupID: id,
        SalesItemGroupCode: String(node.code || data.code || '').trim(),
        SalesItemGroupName: node.name || data.name || '',
        SalesItemGroupName2: data.name2 || '',
        Description: data.description || '',
        IsMandatory: !!data.isMandatory,
        ParentRef: parentRef,
        creator: existing ? existing.creator : userId,
        lastModifier: userId,
        companyRef: compId,
        businessStructureRef: bsId,
      };

      if (existing) {
        await this.repository.update(id, payload);
      } else {
        await this.repository.create(payload as any);
      }

      // Handle related products
      if (Array.isArray(data.relatedProducts)) {
        await this.repository.manager.delete(SalesItemGroupRelatedProduct, { SalesItemGroupRef: id });
        for (let idx = 0; idx < data.relatedProducts.length; idx++) {
          const p = data.relatedProducts[idx];
          if (!p.product_code) continue;
          const prodId = await this.idGenerationService.generateNextId('SalesItemGroupRelatedProducts');
          const prodEntity = this.repository.manager.create(SalesItemGroupRelatedProduct, {
            SalesItemGroupRelatedProductID: prodId,
            SalesItemGroupRef: id,
            ProductCode: p.product_code,
            ProductName: p.product_name || '',
            Unit: p.unit || '',
            IsActive: p.is_active ?? true,
            Description: p.description || '',
            creator: userId,
            lastModifier: userId,
            companyRef: compId,
            businessStructureRef: bsId,
          });
          await this.repository.manager.save(prodEntity);
        }
      }

      if (Array.isArray(node.children)) {
        for (const child of node.children) {
          await processNode(child, id);
        }
      }
    };

    if (treeData) {
      await processNode(treeData, null);
    }

    return await this.getTree();
  }

  /**
   * Find an existing group by (ParentRef, Code) within the current scope.
   * Used by saveTree to reuse rows instead of inserting duplicates.
   */
  private async findByParentAndCode(parentRef: number | null, code: string): Promise<SalesItemGroup | null> {
    if (!code) return null;
    try {
      const candidates = await this.repository.findAll({ where: { SalesItemGroupCode: code } });
      return candidates.find((c) => (c.ParentRef ?? null) === (parentRef ?? null)) || null;
    } catch {
      return null;
    }
  }

  async findAll(query: any): Promise<any> {
    const { skip, take } = query;
    const { bsId, compId, isShared } = await this.getScope();
    let where: any = {};
    if (isShared) {
      where.businessStructureRef = bsId;
    } else {
      where.companyRef = compId;
    }

    const [data, total] = await Promise.all([
      this.repository.findAll({ where, skip: skip ? parseInt(skip) : undefined, take: take ? parseInt(take) : undefined }),
      this.repository.count({ where })
    ]);
    return { data, total, success: true };
  }

  async findOne(id: number): Promise<any> {
    const entity = await this.repository.findById(id);
    if (!entity) throw new NotFoundException('گروه‌بندی کالا فروش یافت نشد');
    return entity;
  }

  async create(dto: CreateSalesItemGroupDto): Promise<any> {
    const userId = this.requestContextService.getUserId() || 1;
    const companyId = this.requestContextService.getCompanyId() || 2;
    const bsId = this.requestContextService.getBusinessStructureId() || 2;

    const id = await this.idGenerationService.generateNextId('SalesItemGroups');
    const entity = {
      SalesItemGroupID: id,
      SalesItemGroupCode: dto.code || '',
      SalesItemGroupName: dto.name || '',
      SalesItemGroupName2: dto.name2 || '',
      Description: dto.description || '',
      IsMandatory: !!dto.isMandatory,
      ParentRef: dto.parentId || null,
      creator: userId,
      lastModifier: userId,
      companyRef: dto.companyRef || companyId,
      businessStructureRef: dto.businessStructureRef || bsId,
    };
    const result = await this.repository.create(entity as any);
    return { data: result, success: true };
  }

  async update(id: number, dto: UpdateSalesItemGroupDto): Promise<any> {
    await this.findOne(id);
    const userId = this.requestContextService.getUserId() || 1;
    const updateData: any = {
      lastModifier: userId,
    };
    if (dto.code !== undefined) updateData.SalesItemGroupCode = dto.code;
    if (dto.name !== undefined) updateData.SalesItemGroupName = dto.name;
    if (dto.name2 !== undefined) updateData.SalesItemGroupName2 = dto.name2;
    if (dto.description !== undefined) updateData.Description = dto.description;
    if (dto.isMandatory !== undefined) updateData.IsMandatory = dto.isMandatory;
    if (dto.parentId !== undefined) updateData.ParentRef = dto.parentId;

    const result = await this.repository.update(id, updateData);
    return { data: result, success: true };
  }

  async remove(id: number): Promise<void> {
    await this.findOne(id);
    await this.repository.delete(id);
  }
}
