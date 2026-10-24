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
exports.AccountRepository = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const account_entity_1 = require("../../domain/entities/account.entity");
const accounts_related_detailed_account_entity_1 = require("../../domain/entities/accounts-related-detailed-account.entity");
const accounts_nature_adjusting_entity_1 = require("../../domain/entities/accounts-nature-adjusting.entity");
const accounts_voucher_decriptions_entity_1 = require("../../domain/entities/accounts-voucher-decriptions.entity");
const id_generation_service_1 = require("../../../../core/services/id-generation.service");
const request_context_service_1 = require("../../../../core/services/request-context.service");
const base_settings_entity_1 = require("../../../common/domain/entities/base-settings.entity");
let AccountRepository = class AccountRepository {
    constructor(typeOrmRepo, idGenerationService, requestContextService) {
        this.typeOrmRepo = typeOrmRepo;
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
            const rows = await this.typeOrmRepo.manager.query(`SELECT "IsBasicInfoShared" FROM "Gnr"."BusinessStructure" WHERE "BusinessStructureID" IN ($1, 1)`, [bsId]);
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
    async create(data) {
        const { bsId, compId } = await this.getScope();
        const manualId = data.id;
        const nextId = manualId || await this.idGenerationService.generateNextId('Account');
        const newEntity = this.typeOrmRepo.create({
            ...data,
            id: nextId,
            businessStructureRef: bsId,
            companyRef: compId
        });
        if (newEntity.relatedDetailedAccounts && newEntity.relatedDetailedAccounts.length > 0) {
            const count = newEntity.relatedDetailedAccounts.length;
            const startId = await this.idGenerationService.generateNextIdBlock('AccountsRelatedDetailedAccount', count);
            newEntity.relatedDetailedAccounts.forEach((r, idx) => {
                r.accountId = nextId;
                if (!r.id) {
                    r.id = startId + idx;
                }
            });
        }
        if (newEntity.natureAdjustments && newEntity.natureAdjustments.length > 0) {
            const count = newEntity.natureAdjustments.length;
            const startId = await this.idGenerationService.generateNextIdBlock('AccountsNatureAdjusting', count);
            newEntity.natureAdjustments.forEach((r, idx) => {
                r.accountId = nextId;
                if (!r.id) {
                    r.id = startId + idx;
                }
            });
        }
        if (newEntity.frequentDescriptions && newEntity.frequentDescriptions.length > 0) {
            const count = newEntity.frequentDescriptions.length;
            const startId = await this.idGenerationService.generateNextIdBlock('AccountsVoucherDecriptions', count);
            newEntity.frequentDescriptions.forEach((r, idx) => {
                r.accountId = nextId;
                if (!r.id) {
                    r.id = startId + idx;
                }
            });
        }
        return this.typeOrmRepo.save(newEntity);
    }
    async update(id, data) {
        const existingEntity = await this.typeOrmRepo.findOne({
            where: { id },
            relations: ['relatedDetailedAccounts', 'natureAdjustments', 'frequentDescriptions']
        });
        if (!existingEntity)
            throw new Error('Account not found');
        if (data.relatedDetailedAccounts) {
            const incoming = data.relatedDetailedAccounts || [];
            const existing = existingEntity.relatedDetailedAccounts || [];
            const incomingIds = incoming.map(x => x.id).filter(Boolean).map(x => Number(x));
            const toDelete = existing.filter(x => !incomingIds.includes(x.id));
            if (toDelete.length > 0) {
                await this.typeOrmRepo.manager.remove(accounts_related_detailed_account_entity_1.AccountsRelatedDetailedAccount, toDelete);
            }
            const nextCollection = [];
            for (const item of incoming) {
                if (item.id) {
                    const existRecord = existing.find(x => x.id === Number(item.id));
                    if (existRecord) {
                        existRecord.detailedLevel = item.detailedLevel;
                        existRecord.detailedTypeId = item.detailedTypeId;
                        existRecord.accountId = id;
                        nextCollection.push(existRecord);
                    }
                    else {
                        const newId = item.id || await this.idGenerationService.generateNextId('AccountsRelatedDetailedAccount');
                        const newRec = this.typeOrmRepo.manager.create(accounts_related_detailed_account_entity_1.AccountsRelatedDetailedAccount, {
                            ...item,
                            id: newId,
                            accountId: id
                        });
                        nextCollection.push(newRec);
                    }
                }
                else {
                    const newId = await this.idGenerationService.generateNextId('AccountsRelatedDetailedAccount');
                    const newRec = this.typeOrmRepo.manager.create(accounts_related_detailed_account_entity_1.AccountsRelatedDetailedAccount, {
                        ...item,
                        id: newId,
                        accountId: id
                    });
                    nextCollection.push(newRec);
                }
            }
            existingEntity.relatedDetailedAccounts = nextCollection;
            if (nextCollection.length > 0) {
                await this.typeOrmRepo.manager.save(accounts_related_detailed_account_entity_1.AccountsRelatedDetailedAccount, nextCollection);
            }
            delete data.relatedDetailedAccounts;
        }
        if (data.natureAdjustments) {
            const incoming = data.natureAdjustments || [];
            const existing = existingEntity.natureAdjustments || [];
            const incomingIds = incoming.map(x => x.id).filter(Boolean).map(x => Number(x));
            const toDelete = existing.filter(x => !incomingIds.includes(x.id));
            if (toDelete.length > 0) {
                await this.typeOrmRepo.manager.remove(accounts_nature_adjusting_entity_1.AccountsNatureAdjusting, toDelete);
            }
            const nextCollection = [];
            for (const item of incoming) {
                if (item.id) {
                    const existRecord = existing.find(x => x.id === Number(item.id));
                    if (existRecord) {
                        existRecord.moinCode = item.moinCode;
                        existRecord.moinTitle = item.moinTitle;
                        existRecord.nature = item.nature;
                        existRecord.description = item.description;
                        existRecord.description2 = item.description2;
                        existRecord.accountId = id;
                        nextCollection.push(existRecord);
                    }
                    else {
                        const newId = item.id || await this.idGenerationService.generateNextId('AccountsNatureAdjusting');
                        const newRec = this.typeOrmRepo.manager.create(accounts_nature_adjusting_entity_1.AccountsNatureAdjusting, {
                            ...item,
                            id: newId,
                            accountId: id
                        });
                        nextCollection.push(newRec);
                    }
                }
                else {
                    const newId = await this.idGenerationService.generateNextId('AccountsNatureAdjusting');
                    const newRec = this.typeOrmRepo.manager.create(accounts_nature_adjusting_entity_1.AccountsNatureAdjusting, {
                        ...item,
                        id: newId,
                        accountId: id
                    });
                    nextCollection.push(newRec);
                }
            }
            existingEntity.natureAdjustments = nextCollection;
            if (nextCollection.length > 0) {
                await this.typeOrmRepo.manager.save(accounts_nature_adjusting_entity_1.AccountsNatureAdjusting, nextCollection);
            }
            delete data.natureAdjustments;
        }
        if (data.frequentDescriptions) {
            const incoming = data.frequentDescriptions || [];
            const existing = existingEntity.frequentDescriptions || [];
            const incomingIds = incoming.map(x => x.id).filter(Boolean).map(x => Number(x));
            const toDelete = existing.filter(x => !incomingIds.includes(x.id));
            if (toDelete.length > 0) {
                await this.typeOrmRepo.manager.remove(accounts_voucher_decriptions_entity_1.AccountsVoucherDecriptions, toDelete);
            }
            const nextCollection = [];
            for (const item of incoming) {
                if (item.id) {
                    const existRecord = existing.find(x => x.id === Number(item.id));
                    if (existRecord) {
                        existRecord.description = item.description;
                        existRecord.description2 = item.description2;
                        existRecord.accountId = id;
                        nextCollection.push(existRecord);
                    }
                    else {
                        const newId = item.id || await this.idGenerationService.generateNextId('AccountsVoucherDecriptions');
                        const newRec = this.typeOrmRepo.manager.create(accounts_voucher_decriptions_entity_1.AccountsVoucherDecriptions, {
                            ...item,
                            id: newId,
                            accountId: id
                        });
                        nextCollection.push(newRec);
                    }
                }
                else {
                    const newId = await this.idGenerationService.generateNextId('AccountsVoucherDecriptions');
                    const newRec = this.typeOrmRepo.manager.create(accounts_voucher_decriptions_entity_1.AccountsVoucherDecriptions, {
                        ...item,
                        id: newId,
                        accountId: id
                    });
                    nextCollection.push(newRec);
                }
            }
            existingEntity.frequentDescriptions = nextCollection;
            if (nextCollection.length > 0) {
                await this.typeOrmRepo.manager.save(accounts_voucher_decriptions_entity_1.AccountsVoucherDecriptions, nextCollection);
            }
            delete data.frequentDescriptions;
        }
        const updatedEntity = this.typeOrmRepo.merge(existingEntity, data);
        const finalRelatedDetailedAccounts = existingEntity.relatedDetailedAccounts;
        const finalNatureAdjustments = existingEntity.natureAdjustments;
        const finalFrequentDescriptions = existingEntity.frequentDescriptions;
        updatedEntity.relatedDetailedAccounts = undefined;
        updatedEntity.natureAdjustments = undefined;
        updatedEntity.frequentDescriptions = undefined;
        const saved = await this.typeOrmRepo.save(updatedEntity);
        if (finalRelatedDetailedAccounts) {
            finalRelatedDetailedAccounts.forEach(r => {
                delete r.account;
            });
        }
        if (finalNatureAdjustments) {
            finalNatureAdjustments.forEach(r => {
                delete r.account;
            });
        }
        if (finalFrequentDescriptions) {
            finalFrequentDescriptions.forEach(r => {
                delete r.account;
            });
        }
        saved.relatedDetailedAccounts = finalRelatedDetailedAccounts;
        saved.natureAdjustments = finalNatureAdjustments;
        saved.frequentDescriptions = finalFrequentDescriptions;
        return saved;
    }
    async findAll(search, level, options) {
        const { bsId, compId, isShared } = await this.getScope();
        const where = isShared ? { businessStructureRef: bsId } : { companyRef: compId };
        if (options && options.isActive !== undefined) {
            where.isActive = options.isActive === 'true' || options.isActive === true;
        }
        const findOptions = { where, order: { code: 'ASC' } };
        if (options && options.limit !== undefined) {
            findOptions.take = options.limit;
        }
        const all = await this.typeOrmRepo.find(findOptions);
        if (level !== undefined) {
            const levelsMap = new Map();
            const root = all.find(x => x.code === '0');
            if (root) {
                levelsMap.set(root.id, 0);
                const setLevel = (parentIds, currentLevel) => {
                    const children = all.filter(x => x.parentId && parentIds.includes(x.parentId));
                    if (children.length > 0) {
                        children.forEach(c => levelsMap.set(c.id, currentLevel));
                        setLevel(children.map(c => c.id), currentLevel + 1);
                    }
                };
                setLevel([root.id], 1);
            }
            let filtered = all.filter(a => levelsMap.get(a.id) === level);
            if (options) {
                if (options.accountType !== undefined && options.accountType !== '' && options.accountType !== 'null') {
                    const reqType = parseInt(String(options.accountType), 10);
                    if (!isNaN(reqType)) {
                        const getGroupType = (acc) => {
                            if (acc.accountType !== null && acc.accountType !== undefined && Number(acc.accountType) > 0) {
                                return Number(acc.accountType);
                            }
                            let current = acc;
                            while (current && current.parentId) {
                                const parent = all.find(x => Number(x.id) === Number(current.parentId));
                                if (parent) {
                                    if (parent.accountType !== null && parent.accountType !== undefined && Number(parent.accountType) > 0) {
                                        return Number(parent.accountType);
                                    }
                                    current = parent;
                                }
                                else {
                                    break;
                                }
                            }
                            return undefined;
                        };
                        filtered = filtered.filter(a => getGroupType(a) === reqType);
                    }
                }
                if (options.filterByAdjustingNature !== undefined && options.filterByAdjustingNature !== '') {
                    const mainNature = String(options.filterByAdjustingNature);
                    const isMainDebtor = mainNature === '3' || mainNature === '5';
                    const isMainCreditor = mainNature === '4' || mainNature === '6';
                    filtered = filtered.filter(a => {
                        const targetNature = a.accountNature ? String(a.accountNature) : '';
                        if (isMainDebtor) {
                            if (targetNature !== '4' && targetNature !== '6')
                                return false;
                        }
                        else if (isMainCreditor) {
                            if (targetNature !== '3' && targetNature !== '5')
                                return false;
                        }
                        else {
                            return false;
                        }
                        return true;
                    });
                }
                const checkMatch = (key) => {
                    if (options[key] !== undefined && options[key] !== '') {
                        const reqBool = options[key] === 'true' || options[key] === true;
                        filtered = filtered.filter(a => {
                            const aBool = a[key] === true || a[key] === 'true';
                            return aBool === reqBool;
                        });
                    }
                };
                checkMatch('trackingFeature');
                checkMatch('currencyFeature');
                checkMatch('exchangeableFeature');
                checkMatch('trackingQuantity');
                checkMatch('trackingNumber');
                checkMatch('trackingDate');
            }
            if (search && search.trim() !== '') {
                const lowerSearch = search.toLowerCase().trim();
                filtered = filtered.filter(a => (a.code && a.code.toLowerCase().includes(lowerSearch)) ||
                    (a.title && a.title.toLowerCase().includes(lowerSearch)) ||
                    (a.title_en && a.title_en.toLowerCase().includes(lowerSearch)));
            }
            filtered.forEach(item => {
                let current = item;
                while (current.parentId && !current.parent) {
                    const parent = all.find(x => Number(x.id) === Number(current.parentId));
                    if (parent) {
                        current.parent = parent;
                        current = parent;
                    }
                    else {
                        break;
                    }
                }
            });
            if (options && options.columnFilters) {
                try {
                    const filters = typeof options.columnFilters === 'string'
                        ? JSON.parse(options.columnFilters)
                        : options.columnFilters;
                    if (Array.isArray(filters)) {
                        filters.forEach((f) => {
                            const fieldId = f.id;
                            const op = f.value?.op || 'contains';
                            const filterValue = String(f.value?.value || '').toLowerCase().trim();
                            if (!filterValue && op !== 'isEmpty' && op !== 'isNotEmpty')
                                return;
                            filtered = filtered.filter(a => {
                                let val = '';
                                if (fieldId.includes('.')) {
                                    const parts = fieldId.split('.');
                                    let temp = a;
                                    for (const part of parts) {
                                        if (temp && typeof temp === 'object') {
                                            temp = temp[part];
                                        }
                                        else {
                                            temp = undefined;
                                        }
                                    }
                                    val = temp;
                                }
                                else {
                                    val = a[fieldId];
                                }
                                const strVal = val !== undefined && val !== null ? String(val).toLowerCase() : '';
                                switch (op) {
                                    case 'contains':
                                        return strVal.includes(filterValue);
                                    case 'notContains':
                                        return !strVal.includes(filterValue);
                                    case 'startsWith':
                                        return strVal.startsWith(filterValue);
                                    case 'endsWith':
                                        return strVal.endsWith(filterValue);
                                    case 'equals':
                                        return strVal === filterValue;
                                    case 'notEquals':
                                        return strVal !== filterValue;
                                    case 'isEmpty':
                                        return strVal === '';
                                    case 'isNotEmpty':
                                        return strVal !== '';
                                    default:
                                        return true;
                                }
                            });
                        });
                    }
                }
                catch (err) {
                    console.error('Error parsing columnFilters in AccountRepository:', err);
                }
            }
            return filtered;
        }
        if (!search || search.trim() === '') {
            return all;
        }
        const lowerSearch = search.toLowerCase().trim();
        const matched = all.filter(a => (a.code && a.code.toLowerCase().includes(lowerSearch)) ||
            (a.title && a.title.toLowerCase().includes(lowerSearch)) ||
            (a.title_en && a.title_en.toLowerCase().includes(lowerSearch)));
        const resultSet = new Set();
        const addWithParents = (id) => {
            if (resultSet.has(id))
                return;
            resultSet.add(id);
            const acc = all.find(x => x.id === id);
            if (acc && acc.parentId) {
                addWithParents(acc.parentId);
            }
        };
        for (const m of matched) {
            addWithParents(m.id);
        }
        const root = all.find(x => x.code === '0');
        if (root)
            resultSet.add(root.id);
        return all.filter(x => resultSet.has(x.id));
    }
    async findById(id) {
        const { bsId, compId, isShared } = await this.getScope();
        const where = { id };
        if (isShared) {
            where.businessStructureRef = bsId;
        }
        else {
            where.companyRef = compId;
        }
        return this.typeOrmRepo.findOne({
            where,
            relations: ['relatedDetailedAccounts', 'natureAdjustments', 'frequentDescriptions']
        });
    }
    async findByCode(code) {
        const { bsId, compId, isShared } = await this.getScope();
        const where = { code };
        if (isShared) {
            where.businessStructureRef = bsId;
        }
        else {
            where.companyRef = compId;
        }
        return this.typeOrmRepo.findOne({
            where,
            relations: ['relatedDetailedAccounts', 'natureAdjustments', 'frequentDescriptions']
        });
    }
    async findByTitle(title) {
        const { bsId, compId, isShared } = await this.getScope();
        const where = { title };
        if (isShared) {
            where.businessStructureRef = bsId;
        }
        else {
            where.companyRef = compId;
        }
        return this.typeOrmRepo.findOne({ where });
    }
    async checkDuplicate(field, value, excludeId) {
        const { bsId, compId, isShared } = await this.getScope();
        const queryBuilder = this.typeOrmRepo.createQueryBuilder('entity');
        if (typeof value === 'string' && (field === 'title' || field === 'title_en')) {
            const normalizedValue = value.replace(/[\s\u200c]+/g, '').replace(/ي/g, 'ی').replace(/ك/g, 'ک');
            queryBuilder.where(`REPLACE(REPLACE(REPLACE(REPLACE(CAST(entity.${field} AS text), ' ', ''), CHR(8204), ''), 'ي', 'ی'), 'ك', 'ک') = :value`, { value: normalizedValue });
        }
        else {
            queryBuilder.where(`entity.${field} = :value`, { value });
        }
        if (isShared) {
            queryBuilder.andWhere('entity.businessStructureRef = :bsId', { bsId });
        }
        else {
            queryBuilder.andWhere('entity.companyRef = :compId', { compId });
        }
        if (excludeId) {
            queryBuilder.andWhere('entity.id != :excludeId', { excludeId: parseInt(excludeId, 10) });
        }
        const count = await queryBuilder.getCount();
        return count > 0;
    }
    async delete(id) {
        await this.typeOrmRepo.delete(id);
    }
    async getGroupAccountLength() {
        try {
            const compId = (this.requestContextService.getCompanyId() && this.requestContextService.getCompanyId() > 1) ? this.requestContextService.getCompanyId() : 2;
            const repo = this.typeOrmRepo.manager.getRepository(base_settings_entity_1.BaseSettings);
            const settings = await repo.find({ where: { tabRef: 2 } });
            const found = settings.find(s => s.key.trim() === 'groupAccountLength');
            if (found && found.value) {
                const val = parseInt(found.value, 10);
                if (!isNaN(val) && val > 0)
                    return val;
            }
        }
        catch (err) {
            console.error('getGroupAccountLength error:', err);
        }
        return 2;
    }
};
exports.AccountRepository = AccountRepository;
exports.AccountRepository = AccountRepository = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(account_entity_1.Account)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        id_generation_service_1.IdGenerationService,
        request_context_service_1.RequestContextService])
], AccountRepository);
//# sourceMappingURL=account.repository.js.map