import { Injectable, Inject, NotFoundException, BadRequestException } from '@nestjs/common';
import { IItemServiceGroupRepository, IItemServiceGroupRepositoryToken } from '../../domain/repositories/item-service-group.repository.interface';
import { ItemServiceGroup } from '../../domain/entities/item-service-group.entity';
import { ItemServiceGroupField } from '../../domain/entities/item-service-group-field.entity';
import { ItemServiceGroupRelatedProduct } from '../../domain/entities/item-service-group-related-product.entity';
import { CreateItemServiceGroupDto, UpdateItemServiceGroupDto } from '../dtos/item-service-group.dto';
import { IdGenerationService } from '../../../../core/services/id-generation.service';
import { RequestContextService } from '../../../../core/services/request-context.service';

@Injectable()
export class ItemServiceGroupService {
  constructor(
    @Inject(IItemServiceGroupRepositoryToken)
    private readonly repository: IItemServiceGroupRepository,
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
   * Idempotent, race-safe seeding of the default tree (same fix as
   * SalesItemGroupService): runs inside a PostgreSQL advisory-lock transaction
   * and re-checks existence by (ParentRef, Code) before inserting, so
   * concurrent requests (React StrictMode double-mount, multiple tabs) can
   * never create duplicated default rows.
   */
  private async ensureDefaultTree(scopeWhere: any, bsId: number, compId: number): Promise<void> {
    await this.repository.manager.transaction(async (em: any) => {
      await em.query(`SELECT pg_advisory_xact_lock(hashtext('Inv:ItemServiceGroups:seed'))`);

      const userId = this.requestContextService.getUserId() || 1;
      let rows: ItemServiceGroup[] = await em.find(ItemServiceGroup, { where: scopeWhere });

      // Ensure exactly one root
      let root = rows.find((r) => !r.ParentRef);
      if (!root) {
        const rootId = await this.idGenerationService.generateNextId('ItemServiceGroups');
        root = await em.save(ItemServiceGroup, em.create(ItemServiceGroup, {
          ItemServiceGroupID: rootId,
          ItemServiceGroupCode: '0',
          ItemServiceGroupName: 'گروه بندی کالا انبار',
          ItemServiceGroupName2: '',
          Description: '',
          IsMandatory: false,
          ParentRef: null,
          creator: userId,
          lastModifier: userId,
          companyRef: compId,
          businessStructureRef: bsId,
        } as any));
      }

      // Ensure default children — check by (ParentRef, Code) to never duplicate
      const children: ItemServiceGroup[] = await em.find(ItemServiceGroup, {
        where: { ...scopeWhere, ParentRef: root.ItemServiceGroupID },
      });
      const hasCode = (code: string) => children.some((c) => String(c.ItemServiceGroupCode) === code);

      const defaults = [
        { code: '10', name: 'کالا', name2: 'Goods' },
        { code: '20', name: 'خدمت', name2: 'Services' },
      ];
      for (const d of defaults) {
        if (hasCode(d.code)) continue;
        const newId = await this.idGenerationService.generateNextId('ItemServiceGroups');
        await em.save(ItemServiceGroup, em.create(ItemServiceGroup, {
          ItemServiceGroupID: newId,
          ItemServiceGroupCode: d.code,
          ItemServiceGroupName: d.name,
          ItemServiceGroupName2: d.name2,
          Description: '',
          IsMandatory: false,
          ParentRef: root.ItemServiceGroupID,
          creator: userId,
          lastModifier: userId,
          companyRef: compId,
          businessStructureRef: bsId,
        } as any));
      }
    });
  }

  /**
   * Self-heal: merge/delete duplicated rows (same ParentRef + Code + Name),
   * keeping the lowest ID — mirrors SalesItemGroupService.cleanupDuplicateRows.
   */
  private async cleanupDuplicateRows(): Promise<void> {
    try {
      const dupRows: any[] = await this.repository.manager.query(`
        SELECT "ItemServiceGroupID" AS id,
               ROW_NUMBER() OVER (
                 PARTITION BY COALESCE("ParentRef", 0), "ItemServiceGroupCode", "ItemServiceGroupName"
                 ORDER BY "ItemServiceGroupID"
               ) AS rn
        FROM "Inv"."ItemServiceGroups"
      `);
      const dups = dupRows.filter((r) => Number(r.rn) > 1).map((r) => Number(r.id));
      if (dups.length === 0) return;

      const pairs: any[] = await this.repository.manager.query(`
        SELECT "ItemServiceGroupID"::bigint AS dup,
               MIN("ItemServiceGroupID") OVER (
                 PARTITION BY COALESCE("ParentRef", 0), "ItemServiceGroupCode", "ItemServiceGroupName"
               )::bigint AS kept
        FROM "Inv"."ItemServiceGroups"
        WHERE "ItemServiceGroupID" = ANY($1::bigint[])
      `, [dups]);

      for (const { dup, kept } of pairs) {
        if (Number(dup) === Number(kept)) continue;
        await this.repository.manager.query(
          `UPDATE "Inv"."ItemServiceGroups" SET "ParentRef" = $1 WHERE "ParentRef" = $2`,
          [kept, dup]
        );
        await this.repository.manager.query(
          `UPDATE "Inv"."ItemServiceGroupRelatedProducts" SET "ItemServiceGroupRef" = $1 WHERE "ItemServiceGroupRef" = $2`,
          [kept, dup]
        );
        await this.repository.manager.query(
          `UPDATE "Inv"."ItemServiceGroupFields" SET "ItemServiceGroupRef" = $1 WHERE "ItemServiceGroupRef" = $2`,
          [kept, dup]
        ).catch(() => {});
        await this.repository.manager.query(
          `DELETE FROM "Inv"."ItemServiceGroups" WHERE "ItemServiceGroupID" = $1`,
          [dup]
        );
      }
    } catch (err) {
      console.error('ItemServiceGroupService.cleanupDuplicateRows failed:', err);
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

    // Defense-in-depth: never render the same natural-key node twice
    items = [...items].sort(
      (a, b) => Number(a.ItemServiceGroupID) - Number(b.ItemServiceGroupID)
    );
    const seenNaturalKeys = new Set<string>();
    items = items.filter((item) => {
      const key = `${item.ParentRef ?? 0}|${String(item.ItemServiceGroupCode ?? '')}|${String(item.ItemServiceGroupName ?? '')}`;
      if (seenNaturalKeys.has(key)) return false;
      seenNaturalKeys.add(key);
      return true;
    });

    // Filter items if search is provided
    let displayItems = items;
    if (search && search.trim() !== '') {
      const q = search.trim().toLowerCase();

      const matchingItems = items.filter((item) => {
        const code = String(item.ItemServiceGroupCode || '').toLowerCase();
        const name = String(item.ItemServiceGroupName || '').toLowerCase();
        const name2 = String(item.ItemServiceGroupName2 || '').toLowerCase();
        return code.includes(q) || name.includes(q) || name2.includes(q);
      });

      const keepIds = new Set<number>();
      const itemMapById = new Map<number, any>();
      items.forEach((item) => itemMapById.set(Number(item.ItemServiceGroupID), item));

      matchingItems.forEach((item) => {
        let current: any = item;
        while (current) {
          const cId = Number(current.ItemServiceGroupID);
          keepIds.add(cId);
          if (current.ParentRef && itemMapById.has(Number(current.ParentRef))) {
            current = itemMapById.get(Number(current.ParentRef));
          } else {
            current = null;
          }
        }
      });

      // Always keep root node if present
      const rootItem = items.find((i) => !i.ParentRef);
      if (rootItem) {
        keepIds.add(Number(rootItem.ItemServiceGroupID));
      }

      displayItems = items.filter((item) => keepIds.has(Number(item.ItemServiceGroupID)));
    }

    // Map items to node objects
    const itemMap = new Map<number, any>();
    displayItems.forEach((item) => {
      itemMap.set(Number(item.ItemServiceGroupID), {
        id: String(item.ItemServiceGroupID),
        name: item.ItemServiceGroupName,
        code: item.ItemServiceGroupCode,
        isRoot: !item.ParentRef,
        children: [],
        data: {
          code: item.ItemServiceGroupCode,
          name2: item.ItemServiceGroupName2 || '',
          description: item.Description || '',
          isMandatory: item.IsMandatory || false,
          relatedProducts: (item.relatedProducts || []).map((p) => ({
            _id: String(p.ItemServiceGroupRelatedProductID),
            product_code: p.ProductCode,
            product_name: p.ProductName,
            unit: p.Unit,
            is_active: p.IsActive,
            description: p.Description,
          })),
          additionalFields: (item.fields || []).map((f) => ({
            _id: String(f.ItemServiceGroupFieldID),
            field_title: f.FieldTitle,
            field_title2: f.FieldTitle2,
            field_type: f.FieldType,
            is_required: f.IsRequired,
            options: f.Options,
            RowNo: f.RowNo,
          })),
        },
      });
    });

    let rootNode: any = null;
    displayItems.forEach((item) => {
      const node = itemMap.get(Number(item.ItemServiceGroupID));
      if (item.ParentRef && itemMap.has(Number(item.ParentRef))) {
        const parentNode = itemMap.get(Number(item.ParentRef));
        parentNode.children.push(node);
      } else {
        if (!rootNode || ['گروه بندی کالا انبار', 'گروه بندی کالا خدمت'].includes(item.ItemServiceGroupName)) {
          rootNode = node;
        }
      }
    });

    return rootNode;
  }

  private validateTreeDuplicates(node: any) {
    if (!node) return;

    if (Array.isArray(node.children) && node.children.length > 0) {
      const seenCodes = new Set<string>();
      const seenNames = new Set<string>();
      const seenName2s = new Set<string>();

      for (const child of node.children) {
        const code = String(child.code || child.data?.code || '').trim().toLowerCase();
        const name = String(child.name || child.data?.name || '').trim().toLowerCase();
        const name2 = String(child.data?.name2 || '').trim().toLowerCase();

        if (code) {
          if (seenCodes.has(code)) {
            throw new BadRequestException(`کد گروه "${code}" در این سرشاخه تکراری است.`);
          }
          seenCodes.add(code);
        }

        if (name) {
          if (seenNames.has(name)) {
            throw new BadRequestException(`عنوان گروه "${child.name || child.data?.name || name}" در این سرشاخه تکراری است.`);
          }
          seenNames.add(name);
        }

        if (name2) {
          if (seenName2s.has(name2)) {
            throw new BadRequestException(`عنوان (2) گروه "${name2}" در این سرشاخه تکراری است.`);
          }
          seenName2s.add(name2);
        }

        this.validateTreeDuplicates(child);
      }
    }
  }

  private async validateDuplicates(
    code: string,
    name: string,
    name2: string | undefined | null,
    parentRef: number | null,
    excludeId?: number,
  ) {
    const { bsId, compId, isShared } = await this.getScope();

    const qb = this.repository.manager.createQueryBuilder(ItemServiceGroup, 'g');

    if (isShared) {
      qb.where('g.businessStructureRef = :bsId', { bsId });
    } else {
      qb.where('g.companyRef = :compId', { compId });
    }

    if (parentRef !== null && parentRef !== undefined) {
      qb.andWhere('g.ParentRef = :parentRef', { parentRef });
    } else {
      qb.andWhere('g.ParentRef IS NULL');
    }

    if (excludeId) {
      qb.andWhere('g.ItemServiceGroupID != :excludeId', { excludeId });
    }

    const siblings = await qb.getMany();

    const normCode = (code || '').trim().toLowerCase();
    const normName = (name || '').trim().toLowerCase();
    const normName2 = (name2 || '').trim().toLowerCase();

    for (const sib of siblings) {
      const sibCode = (sib.ItemServiceGroupCode || '').trim().toLowerCase();
      const sibName = (sib.ItemServiceGroupName || '').trim().toLowerCase();
      const sibName2 = (sib.ItemServiceGroupName2 || '').trim().toLowerCase();

      if (normCode && sibCode === normCode) {
        throw new BadRequestException('کد گروه در این سرشاخه تکراری است.');
      }
      if (normName && sibName === normName) {
        throw new BadRequestException('عنوان گروه در این سرشاخه تکراری است.');
      }
      if (normName2 && sibName2 && sibName2 === normName2) {
        throw new BadRequestException('عنوان (2) گروه در این سرشاخه تکراری است.');
      }
    }
  }

  async saveTree(treeData: any): Promise<any> {
    if (treeData) {
      this.validateTreeDuplicates(treeData);
    }
    const userId = this.requestContextService.getUserId() || 1;
    const { bsId, compId, isShared } = await this.getScope();

    // Collect all valid existing DB IDs in incoming treeData
    const idsInTree = new Set<number>();
    const collectIds = (node: any) => {
      if (node && node.id && !isNaN(Number(node.id)) && Number(node.id) > 0) {
        idsInTree.add(Number(node.id));
      }
      if (Array.isArray(node?.children)) {
        node.children.forEach(collectIds);
      }
    };
    if (treeData) collectIds(treeData);

    // Delete database items for this company/bs that are no longer present in treeData
    const where: any = {};
    if (isShared) {
      where.businessStructureRef = bsId;
    } else {
      where.companyRef = compId;
    }

    try {
      const currentDbItems = await this.repository.findAll({ where });
      for (const dbItem of currentDbItems) {
        if (!idsInTree.has(Number(dbItem.ItemServiceGroupID))) {
          await this.repository.delete(Number(dbItem.ItemServiceGroupID));
        }
      }
    } catch (e) {
      console.warn('ItemServiceGroupService: Error cleaning deleted items:', e);
    }

    // Helper recursive function to save nodes and children
    const processNode = async (node: any, parentId: number | null): Promise<number> => {
      let isNew = false;
      let nodeId = node.id && !isNaN(Number(node.id)) && Number(node.id) > 0 ? Number(node.id) : null;
      
      // Safeguard against mock/temp string IDs from frontend that might parse to numbers
      if (typeof node.id === 'string' && (node.id.startsWith('mock-') || node.id.startsWith('temp-') || isNaN(Number(node.id)))) {
        nodeId = null;
      }

      if (!nodeId) {
        isNew = true;
        nodeId = await this.idGenerationService.generateNextId('ItemServiceGroups');
      } else {
        const existing = await this.repository.findById(nodeId);
        if (!existing) {
          isNew = true;
        }
      }

      // Safeguard against circular references
      if (parentId !== null && nodeId === parentId) {
        parentId = null; // Prevent self-referencing loop
      }

      const name = node.name || node.data?.name || 'گروه کالا خدمت';
      const code = node.code || node.data?.code || '';
      const name2 = node.data?.name2 || '';
      const description = node.data?.description || '';
      const isMandatory = node.data?.isMandatory || false;

      // Update or Create main entity
      const entityData = {
        ItemServiceGroupID: nodeId,
        ItemServiceGroupCode: code,
        ItemServiceGroupName: name,
        ItemServiceGroupName2: name2,
        Description: description,
        IsMandatory: isMandatory,
        ParentRef: parentId,
        creator: userId,
        lastModifier: userId,
        companyRef: compId,
        businessStructureRef: bsId,
      };

      if (isNew) {
        await this.repository.create(entityData);
      } else {
        await this.repository.update(nodeId, entityData);
      }

      // Save additional fields
      if (Array.isArray(node.data?.additionalFields)) {
        await this.repository.manager.delete(ItemServiceGroupField, { ItemServiceGroupRef: nodeId });
        for (const field of node.data.additionalFields) {
          const fieldId = await this.idGenerationService.generateNextId('ItemServiceGroupFields');
          const fieldEntity = this.repository.manager.create(ItemServiceGroupField, {
            ItemServiceGroupFieldID: fieldId,
            ItemServiceGroupRef: nodeId,
            FieldTitle: field.field_title || '',
            FieldTitle2: field.field_title2 || '',
            FieldType: field.field_type || 1,
            IsRequired: !!field.is_required,
            Options: field.options || '',
            RowNo: field.RowNo || 1,
            creator: userId,
            lastModifier: userId,
            companyRef: compId,
            businessStructureRef: bsId,
          });
          await this.repository.manager.save(fieldEntity);
        }
      }

      // Save related products
      if (Array.isArray(node.data?.relatedProducts)) {
        await this.repository.manager.delete(ItemServiceGroupRelatedProduct, { ItemServiceGroupRef: nodeId });
        for (const prod of node.data.relatedProducts) {
          const prodId = await this.idGenerationService.generateNextId('ItemServiceGroupRelatedProducts');
          const prodEntity = this.repository.manager.create(ItemServiceGroupRelatedProduct, {
            ItemServiceGroupRelatedProductID: prodId,
            ItemServiceGroupRef: nodeId,
            ProductCode: prod.product_code || '',
            ProductName: prod.product_name || '',
            Unit: prod.unit || '',
            IsActive: prod.is_active !== undefined ? prod.is_active : true,
            Description: prod.description || '',
            creator: userId,
            lastModifier: userId,
            companyRef: compId,
            businessStructureRef: bsId,
          });
          await this.repository.manager.save(prodEntity);
        }
      }

      // Process children
      if (Array.isArray(node.children)) {
        for (const child of node.children) {
          await processNode(child, nodeId);
        }
      }

      return nodeId;
    };

    if (treeData) {
      await processNode(treeData, null);
    }

    return this.getTree();
  }

  async create(dto: CreateItemServiceGroupDto): Promise<ItemServiceGroup> {
    const userId = this.requestContextService.getUserId() || 1;
    const { bsId, compId } = await this.getScope();

    let parentRef: number | null = null;
    if (dto.parentId !== undefined && dto.parentId !== null && dto.parentId !== 'root' && dto.parentId !== '0') {
      const pNum = Number(dto.parentId);
      if (!isNaN(pNum) && pNum > 0) {
        parentRef = pNum;
      }
    }

    await this.validateDuplicates(dto.code || '', dto.name || '', dto.name2 || '', parentRef);

    const newId = await this.idGenerationService.generateNextId('ItemServiceGroups');

    const entityData = {
      ItemServiceGroupID: newId,
      ItemServiceGroupCode: dto.code || '',
      ItemServiceGroupName: dto.name || '',
      ItemServiceGroupName2: dto.name2 || '',
      Description: dto.description || '',
      IsMandatory: !!dto.isMandatory,
      ParentRef: parentRef,
      creator: userId,
      lastModifier: userId,
      companyRef: compId,
      businessStructureRef: bsId,
    };

    const saved = await this.repository.create(entityData);

    if (Array.isArray(dto.additionalFields)) {
      for (const field of dto.additionalFields) {
        const fieldId = await this.idGenerationService.generateNextId('ItemServiceGroupFields');
        const fieldEntity = this.repository.manager.create(ItemServiceGroupField, {
          ItemServiceGroupFieldID: fieldId,
          ItemServiceGroupRef: newId,
          FieldTitle: field.field_title || '',
          FieldTitle2: field.field_title2 || '',
          FieldType: field.field_type || 1,
          IsRequired: !!field.is_required,
          Options: field.options || '',
          RowNo: field.RowNo || 1,
          creator: userId,
          lastModifier: userId,
          companyRef: compId,
          businessStructureRef: bsId,
        });
        await this.repository.manager.save(fieldEntity);
      }
    }

    if (Array.isArray(dto.relatedProducts)) {
      for (const prod of dto.relatedProducts) {
        const prodId = await this.idGenerationService.generateNextId('ItemServiceGroupRelatedProducts');
        const prodEntity = this.repository.manager.create(ItemServiceGroupRelatedProduct, {
          ItemServiceGroupRelatedProductID: prodId,
          ItemServiceGroupRef: newId,
          ProductCode: prod.product_code || '',
          ProductName: prod.product_name || '',
          Unit: prod.unit || '',
          IsActive: prod.is_active !== undefined ? prod.is_active : true,
          Description: prod.description || '',
          creator: userId,
          lastModifier: userId,
          companyRef: compId,
          businessStructureRef: bsId,
        });
        await this.repository.manager.save(prodEntity);
      }
    }

    return saved;
  }

  async update(id: number, dto: UpdateItemServiceGroupDto): Promise<ItemServiceGroup> {
    const existing = await this.findOne(id);
    const userId = this.requestContextService.getUserId() || 1;
    const { bsId, compId } = await this.getScope();

    let parentRef: number | null = existing.ParentRef;
    if (dto.parentId !== undefined) {
      if (dto.parentId === null || dto.parentId === 'root' || dto.parentId === '0' || dto.parentId === 0) {
        parentRef = null;
      } else {
        const pNum = Number(dto.parentId);
        if (!isNaN(pNum) && pNum > 0 && pNum !== id) {
          parentRef = pNum;
        }
      }
    }

    const code = dto.code !== undefined ? dto.code : existing.ItemServiceGroupCode;
    const name = dto.name !== undefined ? dto.name : existing.ItemServiceGroupName;
    const name2 = dto.name2 !== undefined ? dto.name2 : existing.ItemServiceGroupName2;

    await this.validateDuplicates(code, name, name2, parentRef, id);

    const updateData: any = {
      ItemServiceGroupCode: code,
      ItemServiceGroupName: name,
      ItemServiceGroupName2: name2,
      Description: dto.description !== undefined ? dto.description : existing.Description,
      IsMandatory: dto.isMandatory !== undefined ? !!dto.isMandatory : existing.IsMandatory,
      ParentRef: parentRef,
      lastModifier: userId,
    };

    await this.repository.update(id, updateData);

    if (Array.isArray(dto.additionalFields)) {
      await this.repository.manager.delete(ItemServiceGroupField, { ItemServiceGroupRef: id });
      for (const field of dto.additionalFields) {
        const fieldId = await this.idGenerationService.generateNextId('ItemServiceGroupFields');
        const fieldEntity = this.repository.manager.create(ItemServiceGroupField, {
          ItemServiceGroupFieldID: fieldId,
          ItemServiceGroupRef: id,
          FieldTitle: field.field_title || '',
          FieldTitle2: field.field_title2 || '',
          FieldType: field.field_type || 1,
          IsRequired: !!field.is_required,
          Options: field.options || '',
          RowNo: field.RowNo || 1,
          creator: userId,
          lastModifier: userId,
          companyRef: compId,
          businessStructureRef: bsId,
        });
        await this.repository.manager.save(fieldEntity);
      }
    }

    if (Array.isArray(dto.relatedProducts)) {
      await this.repository.manager.delete(ItemServiceGroupRelatedProduct, { ItemServiceGroupRef: id });
      for (const prod of dto.relatedProducts) {
        const prodId = await this.idGenerationService.generateNextId('ItemServiceGroupRelatedProducts');
        const prodEntity = this.repository.manager.create(ItemServiceGroupRelatedProduct, {
          ItemServiceGroupRelatedProductID: prodId,
          ItemServiceGroupRef: id,
          ProductCode: prod.product_code || '',
          ProductName: prod.product_name || '',
          Unit: prod.unit || '',
          IsActive: prod.is_active !== undefined ? prod.is_active : true,
          Description: prod.description || '',
          creator: userId,
          lastModifier: userId,
          companyRef: compId,
          businessStructureRef: bsId,
        });
        await this.repository.manager.save(prodEntity);
      }
    }

    return this.findOne(id);
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
      this.repository.count({ where }),
    ]);
    return { data, total, success: true };
  }

  async findOne(id: number): Promise<ItemServiceGroup> {
    const entity = await this.repository.findById(id);
    if (!entity) throw new NotFoundException('گروه کالا خدمت یافت نشد');
    return entity;
  }

  async remove(id: number): Promise<void> {
    await this.findOne(id);
    const { bsId, compId, isShared } = await this.getScope();
    let where: any = { ParentRef: id };
    if (isShared) {
      where.businessStructureRef = bsId;
    } else {
      where.companyRef = compId;
    }
    const children = await this.repository.findAll({ where });
    if (children && children.length > 0) {
      throw new BadRequestException('شاخه دارای فرزند قابل حذف نیست');
    }
    await this.repository.delete(id);
  }
}
