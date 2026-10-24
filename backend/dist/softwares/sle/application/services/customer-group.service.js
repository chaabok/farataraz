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
exports.CustomerGroupService = void 0;
const common_1 = require("@nestjs/common");
const customer_group_repository_interface_1 = require("../../domain/repositories/customer-group.repository.interface");
const customer_group_entity_1 = require("../../domain/entities/customer-group.entity");
const id_generation_service_1 = require("../../../../core/services/id-generation.service");
const request_context_service_1 = require("../../../../core/services/request-context.service");
const usage_check_service_1 = require("../../../../core/services/usage-check.service");
const detailed_account_entity_1 = require("../../../accounting/domain/entities/detailed-account.entity");
const detailed_type_entity_1 = require("../../../accounting/domain/entities/detailed-type.entity");
let CustomerGroupService = class CustomerGroupService {
    constructor(repository, idGenerationService, requestContextService, usageCheckService) {
        this.repository = repository;
        this.idGenerationService = idGenerationService;
        this.requestContextService = requestContextService;
        this.usageCheckService = usageCheckService;
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
    enrichGroupsWithAncestors(items) {
        const map = new Map();
        items.forEach(i => map.set(String(i.CustomerGroupID), i));
        const chainOf = (item) => {
            const chain = [];
            const visited = new Set([String(item.CustomerGroupID)]);
            let cur = item.ParentRef === null || item.ParentRef === undefined ? null : String(item.ParentRef);
            while (cur !== null && map.has(cur) && !visited.has(cur)) {
                const p = map.get(cur);
                chain.push({ code: p.Code || '', title: p.Title || '' });
                visited.add(cur);
                const next = p.ParentRef;
                cur = next === null || next === undefined ? null : String(next);
            }
            return chain;
        };
        let maxDepth = 0;
        const chains = new Map();
        items.forEach(item => {
            const chain = chainOf(item);
            chains.set(String(item.CustomerGroupID), chain);
            if (chain.length > maxDepth)
                maxDepth = chain.length;
        });
        return items.map(item => {
            const chain = chains.get(String(item.CustomerGroupID)) || [];
            const enriched = { ...item };
            for (let level = 1; level <= maxDepth; level++) {
                const anc = chain[level - 1];
                enriched[`ParentCode${level}`] = anc ? anc.code : '';
                enriched[`ParentTitle${level}`] = anc ? anc.title : '';
            }
            return enriched;
        });
    }
    async findAll() {
        const { bsId, compId, isShared } = await this.getScope();
        const where = isShared ? { businessStructureRef: bsId } : { companyRef: compId };
        const items = await this.repository.findAll({ where });
        return this.enrichGroupsWithAncestors(items);
    }
    async getTree() {
        const { bsId, compId, isShared } = await this.getScope();
        let where = {};
        if (isShared) {
            where.businessStructureRef = bsId;
        }
        else {
            where.companyRef = compId;
        }
        let items = await this.repository.findAll({ where });
        if (!items || items.length === 0) {
            const userId = this.requestContextService.getUserId() || 1;
            const rootId = await this.idGenerationService.generateNextId('CustomerGroups');
            await this.repository.create({
                CustomerGroupID: rootId,
                Code: '0',
                Title: 'گروه بندی مشتریان',
                Title2: '',
                Description: '',
                ParentRef: null,
                creator: userId,
                lastModifier: userId,
                companyRef: compId,
                businessStructureRef: bsId,
            });
            items = await this.repository.findAll({ where });
        }
        const map = new Map();
        const roots = [];
        items.forEach(item => {
            map.set(item.CustomerGroupID, {
                id: String(item.CustomerGroupID),
                name: item.Title,
                isRoot: item.ParentRef === null,
                deletable: item.ParentRef !== null,
                data: {
                    code: item.Code || '',
                    name2: item.Title2 || '',
                    detailedAccountRef: item.DetailedAccountRef || null,
                    detailedAccountCode: item.detailedAccount?.code || '',
                    description: item.Description || '',
                    recordId: item.CustomerGroupID,
                },
                children: []
            });
        });
        items.forEach(item => {
            const node = map.get(item.CustomerGroupID);
            if (item.ParentRef === null || !map.has(item.ParentRef)) {
                roots.push(node);
            }
            else {
                const parentNode = map.get(item.ParentRef);
                if (parentNode) {
                    parentNode.children.push(node);
                }
                else {
                    roots.push(node);
                }
            }
        });
        return roots.length > 0 ? roots[0] : {
            id: 'root',
            name: 'گروه بندی مشتریان',
            isRoot: true,
            deletable: false,
            data: { code: '0', name2: '', detailedAccountRef: null, description: '', recordId: 0 },
            children: []
        };
    }
    async getNextCode(parentRef) {
        const { bsId, compId, isShared } = await this.getScope();
        const where = isShared ? { businessStructureRef: bsId } : { companyRef: compId };
        let targetParentRef = parentRef;
        if (!targetParentRef) {
            const rootNode = await this.repository.manager.findOne(customer_group_entity_1.CustomerGroup, {
                where: { ...where, ParentRef: null }
            });
            if (rootNode) {
                targetParentRef = rootNode.CustomerGroupID;
            }
        }
        where.ParentRef = targetParentRef ?? null;
        const siblings = await this.repository.findAll({ where });
        let max = 0;
        for (const sib of siblings) {
            const c = parseInt(sib.Code || '0', 10);
            if (!isNaN(c) && c > max) {
                max = c;
            }
        }
        return String(max + 1);
    }
    async checkDuplicate(field, value, excludeId, parentRef) {
        if (!value || String(value).trim() === '')
            return false;
        const { bsId, compId, isShared } = await this.getScope();
        if (field === 'detailedAccountCode') {
            const qb = this.repository.manager.createQueryBuilder(detailed_account_entity_1.DetailedAccount, 'da');
            qb.where('da.code = :value', { value });
            if (isShared) {
                qb.andWhere('da.businessStructureRef = :bsId', { bsId });
            }
            else {
                qb.andWhere('da.companyRef = :compId', { compId });
            }
            if (excludeId) {
                const cg = await this.repository.findById(excludeId);
                if (cg && cg.DetailedAccountRef) {
                    qb.andWhere('da.detailedAccountId != :detailedAccRef', { detailedAccRef: cg.DetailedAccountRef });
                }
            }
            const count = await qb.getCount();
            return count > 0;
        }
        if (field === 'Title' || field === 'Title2') {
            const qb = this.repository.manager.createQueryBuilder(customer_group_entity_1.CustomerGroup, 'cg');
            qb.where(`cg.${field} = :value`, { value });
            if (isShared) {
                qb.andWhere('cg.businessStructureRef = :bsId', { bsId });
            }
            else {
                qb.andWhere('cg.companyRef = :compId', { compId });
            }
            if (excludeId) {
                qb.andWhere('cg.CustomerGroupID != :excludeId', { excludeId });
            }
            const count = await qb.getCount();
            return count > 0;
        }
        if (field === 'Code') {
            const allGroups = await this.repository.findAll({
                where: isShared ? { businessStructureRef: bsId } : { companyRef: compId }
            });
            const getFullCodeOfGroup = (groupId) => {
                const parts = [];
                let currId = groupId;
                while (currId !== null) {
                    const g = allGroups.find(x => x.CustomerGroupID === currId);
                    if (!g)
                        break;
                    parts.unshift(g.Code || '');
                    currId = g.ParentRef;
                }
                return parts.join('');
            };
            const getParentFullCode = (pRef) => {
                if (!pRef)
                    return '';
                return getFullCodeOfGroup(pRef);
            };
            let targetParentRef = parentRef;
            if (!targetParentRef) {
                const rootNode = allGroups.find(x => x.ParentRef === null);
                if (rootNode) {
                    targetParentRef = rootNode.CustomerGroupID;
                }
            }
            const parentFullCode = getParentFullCode(targetParentRef);
            const targetFullCode = parentFullCode + value;
            for (const g of allGroups) {
                if (excludeId && g.CustomerGroupID === excludeId)
                    continue;
                const gFullCode = getFullCodeOfGroup(g.CustomerGroupID);
                if (gFullCode === targetFullCode) {
                    return true;
                }
            }
            return false;
        }
        return false;
    }
    async create(dto) {
        const { bsId, compId, isShared } = await this.getScope();
        const userId = this.requestContextService.getUserId() || 1;
        const id = dto.CustomerGroupID || (await this.idGenerationService.generateNextId('CustomerGroups'));
        if (!dto.Code || String(dto.Code).trim() === '' || (await this.checkDuplicate('Code', dto.Code, undefined, dto.ParentRef))) {
            dto.Code = await this.getNextCode(dto.ParentRef);
        }
        if (dto.Title && (await this.checkDuplicate('Title', dto.Title))) {
            throw new common_1.BadRequestException('عنوان گروه مشتری تکراری است.');
        }
        if (dto.Title2 && (await this.checkDuplicate('Title2', dto.Title2))) {
            throw new common_1.BadRequestException('عنوان (2) گروه مشتری تکراری است.');
        }
        if (dto.detailedAccountCode && (await this.checkDuplicate('detailedAccountCode', dto.detailedAccountCode))) {
            throw new common_1.BadRequestException('کد تفصیلی گروه مشتری تکراری است.');
        }
        let detailedAccountRef = dto.DetailedAccountRef;
        const detailedTypes = await this.repository.manager.find(detailed_type_entity_1.DetailedType, {});
        const typeGroup = detailedTypes.find(t => t.code === '13' || t.Code === '13');
        if (!detailedAccountRef && dto.Title) {
            try {
                const detailedAccId = await this.idGenerationService.generateNextId('DetailedAccount');
                const detailedAccCode = dto.detailedAccountCode || dto.Code || detailedAccId.toString();
                const newDetailedAcc = this.repository.manager.create(detailed_account_entity_1.DetailedAccount, {
                    detailedAccountId: detailedAccId,
                    code: detailedAccCode,
                    title: dto.Title,
                    detailedTypesId: typeGroup ? typeGroup.detailedTypesId : null,
                    isActive: true,
                    creator: userId,
                    lastModifier: userId,
                    companyRef: compId,
                    businessStructureRef: bsId,
                });
                const savedAcc = await this.repository.manager.save(detailed_account_entity_1.DetailedAccount, newDetailedAcc);
                detailedAccountRef = savedAcc.detailedAccountId;
            }
            catch (err) {
                console.error('Failed to auto-generate detailed account:', err);
            }
        }
        else if (detailedAccountRef && dto.detailedAccountCode) {
            await this.repository.manager.update(detailed_account_entity_1.DetailedAccount, { detailedAccountId: detailedAccountRef }, {
                code: dto.detailedAccountCode,
                title: dto.Title
            });
        }
        const entity = this.repository.manager.create(customer_group_entity_1.CustomerGroup, {
            CustomerGroupID: id,
            Code: dto.Code,
            Title: dto.Title,
            Title2: dto.Title2,
            DetailedAccountRef: detailedAccountRef || null,
            Description: dto.Description,
            IsMandatory: dto.IsMandatory,
            ParentRef: dto.ParentRef || null,
            creator: userId,
            lastModifier: userId,
            companyRef: dto.CompanyRef || compId,
            businessStructureRef: dto.BusinessStructureRef || bsId,
        });
        return this.repository.create(entity);
    }
    async update(id, dto) {
        const existing = await this.repository.findById(id);
        if (!existing) {
            throw new common_1.NotFoundException(`CustomerGroup with ID ${id} not found`);
        }
        const { bsId, compId, isShared } = await this.getScope();
        if (dto.Code !== undefined) {
            if (!dto.Code || String(dto.Code).trim() === '') {
                throw new common_1.BadRequestException('فیلد کد الزامی است و نمی‌تواند خالی باشد.');
            }
            const targetParentRef = dto.ParentRef !== undefined && dto.ParentRef !== null ? dto.ParentRef : existing.ParentRef;
            const codeChanged = dto.Code !== existing.Code;
            const parentChanged = dto.ParentRef !== undefined && dto.ParentRef !== null && dto.ParentRef !== existing.ParentRef;
            if ((codeChanged || parentChanged) && (await this.checkDuplicate('Code', dto.Code, id, targetParentRef))) {
                throw new common_1.BadRequestException('کد گروه مشتری با احتساب کد سرشاخه تکراری است.');
            }
        }
        if (dto.Title && dto.Title !== existing.Title && (await this.checkDuplicate('Title', dto.Title, id))) {
            throw new common_1.BadRequestException('عنوان گروه مشتری تکراری است.');
        }
        if (dto.Title2 && dto.Title2 !== existing.Title2 && (await this.checkDuplicate('Title2', dto.Title2, id))) {
            throw new common_1.BadRequestException('عنوان (2) گروه مشتری تکراری است.');
        }
        if (dto.detailedAccountCode && (await this.checkDuplicate('detailedAccountCode', dto.detailedAccountCode, id))) {
            throw new common_1.BadRequestException('کد تفصیلی گروه مشتری تکراری است.');
        }
        if (existing.DetailedAccountRef && (dto.detailedAccountCode || dto.Title)) {
            try {
                await this.repository.manager.update(detailed_account_entity_1.DetailedAccount, { detailedAccountId: existing.DetailedAccountRef }, {
                    ...(dto.detailedAccountCode ? { code: dto.detailedAccountCode } : {}),
                    ...(dto.Title ? { title: dto.Title } : {})
                });
            }
            catch (err) {
                console.error('Failed to update associated detailed account:', err);
            }
        }
        const { detailedAccountCode, RelatedParties, relatedParties, ...restDto } = dto;
        const userId = this.requestContextService.getUserId() || 1;
        Object.assign(existing, {
            ...restDto,
            lastModifier: userId,
        });
        return this.repository.update(id, existing);
    }
    async remove(id) {
        const existing = await this.repository.findById(id);
        if (!existing) {
            throw new common_1.NotFoundException(`CustomerGroup with ID ${id} not found`);
        }
        const children = await this.repository.findAll({ where: { ParentRef: id } });
        if (children && children.length > 0) {
            throw new common_1.BadRequestException('این گروه دارای زیرمجموعه است و امکان حذف آن وجود ندارد.');
        }
        const detailedAccRef = existing.DetailedAccountRef;
        if (detailedAccRef) {
            const usage = await this.usageCheckService.isRecordUsed('DetailedAccounts', detailedAccRef);
            if (usage.isUsed) {
                throw new common_1.BadRequestException(`این آیتم در جدول/سند «${usage.usedInTable || 'سایر فرم‌ها'}» استفاده شده است و امکان حذف آن وجود ندارد.`);
            }
        }
        await this.repository.delete(id);
        if (detailedAccRef) {
            try {
                await this.repository.manager.delete(detailed_account_entity_1.DetailedAccount, { detailedAccountId: detailedAccRef });
            }
            catch (err) {
                console.error('Failed to delete associated detailed account:', err);
            }
        }
    }
    async findById(id) {
        const group = await this.repository.findById(id);
        if (!group) {
            throw new common_1.NotFoundException(`CustomerGroup with ID ${id} not found`);
        }
        return group;
    }
    async upsert(dto) {
        const { bsId, compId, isShared } = await this.getScope();
        if (dto.CustomerGroupID) {
            const existing = await this.repository.findById(dto.CustomerGroupID);
            if (existing) {
                return this.update(dto.CustomerGroupID, dto);
            }
        }
        if (dto.Code) {
            const where = isShared ? { businessStructureRef: bsId } : { companyRef: compId };
            if (dto.ParentRef !== undefined) {
                where.ParentRef = dto.ParentRef;
            }
            where.Code = dto.Code;
            const existingByCode = await this.repository.findAll({ where });
            if (existingByCode && existingByCode.length > 0) {
                return this.update(existingByCode[0].CustomerGroupID, dto);
            }
        }
        return this.create(dto);
    }
};
exports.CustomerGroupService = CustomerGroupService;
exports.CustomerGroupService = CustomerGroupService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, common_1.Inject)(customer_group_repository_interface_1.ICustomerGroupRepositoryToken)),
    __metadata("design:paramtypes", [Object, id_generation_service_1.IdGenerationService,
        request_context_service_1.RequestContextService,
        usage_check_service_1.UsageCheckService])
], CustomerGroupService);
//# sourceMappingURL=customer-group.service.js.map