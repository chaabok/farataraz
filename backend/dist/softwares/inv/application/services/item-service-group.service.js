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
exports.ItemServiceGroupService = void 0;
const common_1 = require("@nestjs/common");
const item_service_group_repository_interface_1 = require("../../domain/repositories/item-service-group.repository.interface");
const item_service_group_entity_1 = require("../../domain/entities/item-service-group.entity");
const item_service_group_field_entity_1 = require("../../domain/entities/item-service-group-field.entity");
const item_service_group_related_product_entity_1 = require("../../domain/entities/item-service-group-related-product.entity");
const id_generation_service_1 = require("../../../../core/services/id-generation.service");
const request_context_service_1 = require("../../../../core/services/request-context.service");
let ItemServiceGroupService = class ItemServiceGroupService {
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
            await em.query(`SELECT pg_advisory_xact_lock(hashtext('Inv:ItemServiceGroups:seed'))`);
            const userId = this.requestContextService.getUserId() || 1;
            let rows = await em.find(item_service_group_entity_1.ItemServiceGroup, { where: scopeWhere });
            let root = rows.find((r) => !r.ParentRef);
            if (!root) {
                const rootId = await this.idGenerationService.generateNextId('ItemServiceGroups');
                root = await em.save(item_service_group_entity_1.ItemServiceGroup, em.create(item_service_group_entity_1.ItemServiceGroup, {
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
                }));
            }
            const children = await em.find(item_service_group_entity_1.ItemServiceGroup, {
                where: { ...scopeWhere, ParentRef: root.ItemServiceGroupID },
            });
            const hasCode = (code) => children.some((c) => String(c.ItemServiceGroupCode) === code);
            const defaults = [
                { code: '10', name: 'کالا', name2: 'Goods' },
                { code: '20', name: 'خدمت', name2: 'Services' },
            ];
            for (const d of defaults) {
                if (hasCode(d.code))
                    continue;
                const newId = await this.idGenerationService.generateNextId('ItemServiceGroups');
                await em.save(item_service_group_entity_1.ItemServiceGroup, em.create(item_service_group_entity_1.ItemServiceGroup, {
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
                }));
            }
        });
    }
    async cleanupDuplicateRows() {
        try {
            const dupRows = await this.repository.manager.query(`
        SELECT "ItemServiceGroupID" AS id,
               ROW_NUMBER() OVER (
                 PARTITION BY COALESCE("ParentRef", 0), "ItemServiceGroupCode", "ItemServiceGroupName"
                 ORDER BY "ItemServiceGroupID"
               ) AS rn
        FROM "Inv"."ItemServiceGroups"
      `);
            const dups = dupRows.filter((r) => Number(r.rn) > 1).map((r) => Number(r.id));
            if (dups.length === 0)
                return;
            const pairs = await this.repository.manager.query(`
        SELECT "ItemServiceGroupID"::bigint AS dup,
               MIN("ItemServiceGroupID") OVER (
                 PARTITION BY COALESCE("ParentRef", 0), "ItemServiceGroupCode", "ItemServiceGroupName"
               )::bigint AS kept
        FROM "Inv"."ItemServiceGroups"
        WHERE "ItemServiceGroupID" = ANY($1::bigint[])
      `, [dups]);
            for (const { dup, kept } of pairs) {
                if (Number(dup) === Number(kept))
                    continue;
                await this.repository.manager.query(`UPDATE "Inv"."ItemServiceGroups" SET "ParentRef" = $1 WHERE "ParentRef" = $2`, [kept, dup]);
                await this.repository.manager.query(`UPDATE "Inv"."ItemServiceGroupRelatedProducts" SET "ItemServiceGroupRef" = $1 WHERE "ItemServiceGroupRef" = $2`, [kept, dup]);
                await this.repository.manager.query(`UPDATE "Inv"."ItemServiceGroupFields" SET "ItemServiceGroupRef" = $1 WHERE "ItemServiceGroupRef" = $2`, [kept, dup]).catch(() => { });
                await this.repository.manager.query(`DELETE FROM "Inv"."ItemServiceGroups" WHERE "ItemServiceGroupID" = $1`, [dup]);
            }
        }
        catch (err) {
            console.error('ItemServiceGroupService.cleanupDuplicateRows failed:', err);
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
        items = [...items].sort((a, b) => Number(a.ItemServiceGroupID) - Number(b.ItemServiceGroupID));
        const seenNaturalKeys = new Set();
        items = items.filter((item) => {
            const key = `${item.ParentRef ?? 0}|${String(item.ItemServiceGroupCode ?? '')}|${String(item.ItemServiceGroupName ?? '')}`;
            if (seenNaturalKeys.has(key))
                return false;
            seenNaturalKeys.add(key);
            return true;
        });
        let displayItems = items;
        if (search && search.trim() !== '') {
            const q = search.trim().toLowerCase();
            const matchingItems = items.filter((item) => {
                const code = String(item.ItemServiceGroupCode || '').toLowerCase();
                const name = String(item.ItemServiceGroupName || '').toLowerCase();
                const name2 = String(item.ItemServiceGroupName2 || '').toLowerCase();
                return code.includes(q) || name.includes(q) || name2.includes(q);
            });
            const keepIds = new Set();
            const itemMapById = new Map();
            items.forEach((item) => itemMapById.set(Number(item.ItemServiceGroupID), item));
            matchingItems.forEach((item) => {
                let current = item;
                while (current) {
                    const cId = Number(current.ItemServiceGroupID);
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
            if (rootItem) {
                keepIds.add(Number(rootItem.ItemServiceGroupID));
            }
            displayItems = items.filter((item) => keepIds.has(Number(item.ItemServiceGroupID)));
        }
        const itemMap = new Map();
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
        let rootNode = null;
        displayItems.forEach((item) => {
            const node = itemMap.get(Number(item.ItemServiceGroupID));
            if (item.ParentRef && itemMap.has(Number(item.ParentRef))) {
                const parentNode = itemMap.get(Number(item.ParentRef));
                parentNode.children.push(node);
            }
            else {
                if (!rootNode || ['گروه بندی کالا انبار', 'گروه بندی کالا خدمت'].includes(item.ItemServiceGroupName)) {
                    rootNode = node;
                }
            }
        });
        return rootNode;
    }
    validateTreeDuplicates(node) {
        if (!node)
            return;
        if (Array.isArray(node.children) && node.children.length > 0) {
            const seenCodes = new Set();
            const seenNames = new Set();
            const seenName2s = new Set();
            for (const child of node.children) {
                const code = String(child.code || child.data?.code || '').trim().toLowerCase();
                const name = String(child.name || child.data?.name || '').trim().toLowerCase();
                const name2 = String(child.data?.name2 || '').trim().toLowerCase();
                if (code) {
                    if (seenCodes.has(code)) {
                        throw new common_1.BadRequestException(`کد گروه "${code}" در این سرشاخه تکراری است.`);
                    }
                    seenCodes.add(code);
                }
                if (name) {
                    if (seenNames.has(name)) {
                        throw new common_1.BadRequestException(`عنوان گروه "${child.name || child.data?.name || name}" در این سرشاخه تکراری است.`);
                    }
                    seenNames.add(name);
                }
                if (name2) {
                    if (seenName2s.has(name2)) {
                        throw new common_1.BadRequestException(`عنوان (2) گروه "${name2}" در این سرشاخه تکراری است.`);
                    }
                    seenName2s.add(name2);
                }
                this.validateTreeDuplicates(child);
            }
        }
    }
    async validateDuplicates(code, name, name2, parentRef, excludeId) {
        const { bsId, compId, isShared } = await this.getScope();
        const qb = this.repository.manager.createQueryBuilder(item_service_group_entity_1.ItemServiceGroup, 'g');
        if (isShared) {
            qb.where('g.businessStructureRef = :bsId', { bsId });
        }
        else {
            qb.where('g.companyRef = :compId', { compId });
        }
        if (parentRef !== null && parentRef !== undefined) {
            qb.andWhere('g.ParentRef = :parentRef', { parentRef });
        }
        else {
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
                throw new common_1.BadRequestException('کد گروه در این سرشاخه تکراری است.');
            }
            if (normName && sibName === normName) {
                throw new common_1.BadRequestException('عنوان گروه در این سرشاخه تکراری است.');
            }
            if (normName2 && sibName2 && sibName2 === normName2) {
                throw new common_1.BadRequestException('عنوان (2) گروه در این سرشاخه تکراری است.');
            }
        }
    }
    async saveTree(treeData) {
        if (treeData) {
            this.validateTreeDuplicates(treeData);
        }
        const userId = this.requestContextService.getUserId() || 1;
        const { bsId, compId, isShared } = await this.getScope();
        const idsInTree = new Set();
        const collectIds = (node) => {
            if (node && node.id && !isNaN(Number(node.id)) && Number(node.id) > 0) {
                idsInTree.add(Number(node.id));
            }
            if (Array.isArray(node?.children)) {
                node.children.forEach(collectIds);
            }
        };
        if (treeData)
            collectIds(treeData);
        const where = {};
        if (isShared) {
            where.businessStructureRef = bsId;
        }
        else {
            where.companyRef = compId;
        }
        try {
            const currentDbItems = await this.repository.findAll({ where });
            for (const dbItem of currentDbItems) {
                if (!idsInTree.has(Number(dbItem.ItemServiceGroupID))) {
                    await this.repository.delete(Number(dbItem.ItemServiceGroupID));
                }
            }
        }
        catch (e) {
            console.warn('ItemServiceGroupService: Error cleaning deleted items:', e);
        }
        const processNode = async (node, parentId) => {
            let isNew = false;
            let nodeId = node.id && !isNaN(Number(node.id)) && Number(node.id) > 0 ? Number(node.id) : null;
            if (typeof node.id === 'string' && (node.id.startsWith('mock-') || node.id.startsWith('temp-') || isNaN(Number(node.id)))) {
                nodeId = null;
            }
            if (!nodeId) {
                isNew = true;
                nodeId = await this.idGenerationService.generateNextId('ItemServiceGroups');
            }
            else {
                const existing = await this.repository.findById(nodeId);
                if (!existing) {
                    isNew = true;
                }
            }
            if (parentId !== null && nodeId === parentId) {
                parentId = null;
            }
            const name = node.name || node.data?.name || 'گروه کالا خدمت';
            const code = node.code || node.data?.code || '';
            const name2 = node.data?.name2 || '';
            const description = node.data?.description || '';
            const isMandatory = node.data?.isMandatory || false;
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
            }
            else {
                await this.repository.update(nodeId, entityData);
            }
            if (Array.isArray(node.data?.additionalFields)) {
                await this.repository.manager.delete(item_service_group_field_entity_1.ItemServiceGroupField, { ItemServiceGroupRef: nodeId });
                for (const field of node.data.additionalFields) {
                    const fieldId = await this.idGenerationService.generateNextId('ItemServiceGroupFields');
                    const fieldEntity = this.repository.manager.create(item_service_group_field_entity_1.ItemServiceGroupField, {
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
            if (Array.isArray(node.data?.relatedProducts)) {
                await this.repository.manager.delete(item_service_group_related_product_entity_1.ItemServiceGroupRelatedProduct, { ItemServiceGroupRef: nodeId });
                for (const prod of node.data.relatedProducts) {
                    const prodId = await this.idGenerationService.generateNextId('ItemServiceGroupRelatedProducts');
                    const prodEntity = this.repository.manager.create(item_service_group_related_product_entity_1.ItemServiceGroupRelatedProduct, {
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
    async create(dto) {
        const userId = this.requestContextService.getUserId() || 1;
        const { bsId, compId } = await this.getScope();
        let parentRef = null;
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
                const fieldEntity = this.repository.manager.create(item_service_group_field_entity_1.ItemServiceGroupField, {
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
                const prodEntity = this.repository.manager.create(item_service_group_related_product_entity_1.ItemServiceGroupRelatedProduct, {
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
    async update(id, dto) {
        const existing = await this.findOne(id);
        const userId = this.requestContextService.getUserId() || 1;
        const { bsId, compId } = await this.getScope();
        let parentRef = existing.ParentRef;
        if (dto.parentId !== undefined) {
            if (dto.parentId === null || dto.parentId === 'root' || dto.parentId === '0' || dto.parentId === 0) {
                parentRef = null;
            }
            else {
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
        const updateData = {
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
            await this.repository.manager.delete(item_service_group_field_entity_1.ItemServiceGroupField, { ItemServiceGroupRef: id });
            for (const field of dto.additionalFields) {
                const fieldId = await this.idGenerationService.generateNextId('ItemServiceGroupFields');
                const fieldEntity = this.repository.manager.create(item_service_group_field_entity_1.ItemServiceGroupField, {
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
            await this.repository.manager.delete(item_service_group_related_product_entity_1.ItemServiceGroupRelatedProduct, { ItemServiceGroupRef: id });
            for (const prod of dto.relatedProducts) {
                const prodId = await this.idGenerationService.generateNextId('ItemServiceGroupRelatedProducts');
                const prodEntity = this.repository.manager.create(item_service_group_related_product_entity_1.ItemServiceGroupRelatedProduct, {
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
            this.repository.count({ where }),
        ]);
        return { data, total, success: true };
    }
    async findOne(id) {
        const entity = await this.repository.findById(id);
        if (!entity)
            throw new common_1.NotFoundException('گروه کالا خدمت یافت نشد');
        return entity;
    }
    async remove(id) {
        await this.findOne(id);
        const { bsId, compId, isShared } = await this.getScope();
        let where = { ParentRef: id };
        if (isShared) {
            where.businessStructureRef = bsId;
        }
        else {
            where.companyRef = compId;
        }
        const children = await this.repository.findAll({ where });
        if (children && children.length > 0) {
            throw new common_1.BadRequestException('شاخه دارای فرزند قابل حذف نیست');
        }
        await this.repository.delete(id);
    }
};
exports.ItemServiceGroupService = ItemServiceGroupService;
exports.ItemServiceGroupService = ItemServiceGroupService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, common_1.Inject)(item_service_group_repository_interface_1.IItemServiceGroupRepositoryToken)),
    __metadata("design:paramtypes", [Object, id_generation_service_1.IdGenerationService,
        request_context_service_1.RequestContextService])
], ItemServiceGroupService);
//# sourceMappingURL=item-service-group.service.js.map