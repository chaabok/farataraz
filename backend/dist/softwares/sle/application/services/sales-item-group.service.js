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
exports.SalesItemGroupService = void 0;
const common_1 = require("@nestjs/common");
const sales_item_group_repository_interface_1 = require("../../domain/repositories/sales-item-group.repository.interface");
const sales_item_group_entity_1 = require("../../domain/entities/sales-item-group.entity");
const sales_item_group_related_product_entity_1 = require("../../domain/entities/sales-item-group-related-product.entity");
const id_generation_service_1 = require("../../../../core/services/id-generation.service");
const request_context_service_1 = require("../../../../core/services/request-context.service");
let SalesItemGroupService = class SalesItemGroupService {
    constructor(repository, idGenerationService, requestContextService) {
        this.repository = repository;
        this.idGenerationService = idGenerationService;
        this.requestContextService = requestContextService;
    }
    async getScope() {
        let bsId = this.requestContextService.getBusinessStructureId() ?? 2;
        let compId = this.requestContextService.getCompanyId() ?? 2;
        if (bsId <= 1)
            bsId = 2;
        if (compId <= 1)
            compId = 2;
        let isShared = true;
        try {
            const rows = await this.repository.manager.connection.query(`SELECT "IsBasicInfoShared" FROM "Gnr"."BusinessStructure" WHERE "BusinessStructureID" IN ($1, 1)`, [bsId]);
            if (rows && rows.length > 0) {
                if (rows.some((r) => {
                    const val = r.IsBasicInfoShared !== undefined ? r.IsBasicInfoShared : r.isBasicInfoShared;
                    return val === false || val === 0 || val === 'false' || val === null;
                })) {
                    isShared = false;
                }
            }
            else {
                isShared = false;
            }
        }
        catch (err) {
            isShared = false;
        }
        return { bsId, compId, isShared };
    }
    async ensureDefaultTree(scopeWhere, bsId, compId) {
        await this.repository.manager.transaction(async (em) => {
            await em.query(`SELECT pg_advisory_xact_lock(hashtext('Sle:SalesItemGroups:seed'))`);
            const userId = this.requestContextService.getUserId() || 1;
            let rows = await em.find(sales_item_group_entity_1.SalesItemGroup, { where: scopeWhere });
            let root = rows.find((r) => !r.ParentRef);
            if (!root) {
                const rootId = await this.idGenerationService.generateNextId('SalesItemGroups');
                root = await em.save(sales_item_group_entity_1.SalesItemGroup, em.create(sales_item_group_entity_1.SalesItemGroup, {
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
                }));
            }
            const children = await em.find(sales_item_group_entity_1.SalesItemGroup, {
                where: { ...scopeWhere, ParentRef: root.SalesItemGroupID },
            });
            const hasCode = (code) => children.some((c) => String(c.SalesItemGroupCode) === code);
            const defaults = [
                { code: '10', name: 'کالا', name2: 'Goods' },
                { code: '20', name: 'خدمت', name2: 'Services' },
            ];
            for (const d of defaults) {
                if (hasCode(d.code))
                    continue;
                const newId = await this.idGenerationService.generateNextId('SalesItemGroups');
                await em.save(sales_item_group_entity_1.SalesItemGroup, em.create(sales_item_group_entity_1.SalesItemGroup, {
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
                }));
            }
        });
    }
    async cleanupDuplicateRows() {
        try {
            const dupRows = await this.repository.manager.query(`
        SELECT "SalesItemGroupID" AS id,
               ROW_NUMBER() OVER (
                 PARTITION BY COALESCE("ParentRef", 0), "SalesItemGroupCode", "SalesItemGroupName"
                 ORDER BY "SalesItemGroupID"
               ) AS rn
        FROM "Sle"."SalesItemGroups"
      `);
            const dups = dupRows.filter((r) => Number(r.rn) > 1).map((r) => Number(r.id));
            if (dups.length === 0)
                return;
            const pairs = await this.repository.manager.query(`
        SELECT "SalesItemGroupID"::bigint AS dup,
               MIN("SalesItemGroupID") OVER (
                 PARTITION BY COALESCE("ParentRef", 0), "SalesItemGroupCode", "SalesItemGroupName"
               )::bigint AS kept
        FROM "Sle"."SalesItemGroups"
        WHERE "SalesItemGroupID" = ANY($1::bigint[])
      `, [dups]);
            for (const { dup, kept } of pairs) {
                if (Number(dup) === Number(kept))
                    continue;
                await this.repository.manager.query(`UPDATE "Sle"."SalesItemGroups" SET "ParentRef" = $1 WHERE "ParentRef" = $2`, [kept, dup]);
                await this.repository.manager.query(`UPDATE "Sle"."SalesItemGroupRelatedProducts" SET "SalesItemGroupRef" = $1 WHERE "SalesItemGroupRef" = $2`, [kept, dup]);
                await this.repository.manager.query(`DELETE FROM "Sle"."SalesItemGroups" WHERE "SalesItemGroupID" = $1`, [dup]);
            }
        }
        catch (err) {
            console.error('SalesItemGroupService.cleanupDuplicateRows failed:', err);
        }
    }
    async getTree(search) {
        const { bsId, compId, isShared } = await this.getScope();
        let where = {};
        if (isShared) {
            where.businessStructureRef = bsId;
        }
        else {
            where.companyRef = compId;
        }
        await this.cleanupDuplicateRows();
        await this.ensureDefaultTree(where, bsId, compId);
        let items = await this.repository.findAll({ where });
        items = [...items].sort((a, b) => Number(a.SalesItemGroupID) - Number(b.SalesItemGroupID));
        const seenNaturalKeys = new Set();
        items = items.filter((item) => {
            const key = `${item.ParentRef ?? 0}|${String(item.SalesItemGroupCode ?? '')}|${String(item.SalesItemGroupName ?? '')}`;
            if (seenNaturalKeys.has(key))
                return false;
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
            const keepIds = new Set();
            const itemMapById = new Map();
            items.forEach((item) => itemMapById.set(Number(item.SalesItemGroupID), item));
            matchingItems.forEach((item) => {
                let current = item;
                while (current) {
                    const cId = Number(current.SalesItemGroupID);
                    keepIds.add(cId);
                    if (current.ParentRef && itemMapById.has(Number(current.ParentRef))) {
                        current = itemMapById.get(Number(current.ParentRef));
                    }
                    else {
                        current = null;
                    }
                }
            });
            const rootItem = items.find((i) => !i.ParentRef);
            if (rootItem)
                keepIds.add(Number(rootItem.SalesItemGroupID));
            displayItems = items.filter((item) => keepIds.has(Number(item.SalesItemGroupID)));
        }
        const itemMap = new Map();
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
                    relatedProducts: (item.relatedProducts || []).map((p) => ({
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
        let rootNode = null;
        displayItems.forEach((item) => {
            const node = itemMap.get(Number(item.SalesItemGroupID));
            if (item.ParentRef && itemMap.has(Number(item.ParentRef))) {
                const parentNode = itemMap.get(Number(item.ParentRef));
                parentNode.children.push(node);
            }
            else {
                if (!rootNode || item.SalesItemGroupName === 'گروه بندی کالا فروش') {
                    rootNode = node;
                }
            }
        });
        return rootNode;
    }
    async saveTree(treeData) {
        const { bsId, compId, isShared } = await this.getScope();
        const userId = this.requestContextService.getUserId() || 1;
        const processNode = async (node, parentRef) => {
            if (!node)
                return;
            let id = node.id && /^\d+$/.test(node.id) ? parseInt(node.id, 10) : null;
            const data = node.data || {};
            if (!id) {
                const code = String(node.code || data.code || '').trim();
                const existingSibling = await this.findByParentAndCode(parentRef, code);
                if (existingSibling) {
                    id = existingSibling.SalesItemGroupID;
                }
                else {
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
            }
            else {
                await this.repository.create(payload);
            }
            if (Array.isArray(data.relatedProducts)) {
                await this.repository.manager.delete(sales_item_group_related_product_entity_1.SalesItemGroupRelatedProduct, { SalesItemGroupRef: id });
                for (let idx = 0; idx < data.relatedProducts.length; idx++) {
                    const p = data.relatedProducts[idx];
                    if (!p.product_code)
                        continue;
                    const prodId = await this.idGenerationService.generateNextId('SalesItemGroupRelatedProducts');
                    const prodEntity = this.repository.manager.create(sales_item_group_related_product_entity_1.SalesItemGroupRelatedProduct, {
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
    async findByParentAndCode(parentRef, code) {
        if (!code)
            return null;
        try {
            const candidates = await this.repository.findAll({ where: { SalesItemGroupCode: code } });
            return candidates.find((c) => (c.ParentRef ?? null) === (parentRef ?? null)) || null;
        }
        catch {
            return null;
        }
    }
    async findAll(query) {
        const { skip, take } = query;
        const { bsId, compId, isShared } = await this.getScope();
        let where = {};
        if (isShared) {
            where.businessStructureRef = bsId;
        }
        else {
            where.companyRef = compId;
        }
        const [data, total] = await Promise.all([
            this.repository.findAll({ where, skip: skip ? parseInt(skip) : undefined, take: take ? parseInt(take) : undefined }),
            this.repository.count({ where })
        ]);
        return { data, total, success: true };
    }
    async findOne(id) {
        const entity = await this.repository.findById(id);
        if (!entity)
            throw new common_1.NotFoundException('گروه‌بندی کالا فروش یافت نشد');
        return entity;
    }
    async create(dto) {
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
        const result = await this.repository.create(entity);
        return { data: result, success: true };
    }
    async update(id, dto) {
        await this.findOne(id);
        const userId = this.requestContextService.getUserId() || 1;
        const updateData = {
            lastModifier: userId,
        };
        if (dto.code !== undefined)
            updateData.SalesItemGroupCode = dto.code;
        if (dto.name !== undefined)
            updateData.SalesItemGroupName = dto.name;
        if (dto.name2 !== undefined)
            updateData.SalesItemGroupName2 = dto.name2;
        if (dto.description !== undefined)
            updateData.Description = dto.description;
        if (dto.isMandatory !== undefined)
            updateData.IsMandatory = dto.isMandatory;
        if (dto.parentId !== undefined)
            updateData.ParentRef = dto.parentId;
        const result = await this.repository.update(id, updateData);
        return { data: result, success: true };
    }
    async remove(id) {
        await this.findOne(id);
        await this.repository.delete(id);
    }
};
exports.SalesItemGroupService = SalesItemGroupService;
exports.SalesItemGroupService = SalesItemGroupService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, common_1.Inject)(sales_item_group_repository_interface_1.ISalesItemGroupRepositoryToken)),
    __metadata("design:paramtypes", [Object, id_generation_service_1.IdGenerationService,
        request_context_service_1.RequestContextService])
], SalesItemGroupService);
//# sourceMappingURL=sales-item-group.service.js.map