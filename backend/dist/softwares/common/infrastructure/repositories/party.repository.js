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
exports.PartyRepository = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const party_entity_1 = require("../../domain/entities/party.entity");
const typeorm_query_builder_1 = require("../../../../core/utils/typeorm-query-builder");
const request_context_service_1 = require("../../../../core/services/request-context.service");
const base_settings_service_1 = require("../../../common/application/services/base-settings.service");
const id_generation_service_1 = require("../../../../core/services/id-generation.service");
let PartyRepository = class PartyRepository {
    constructor(repository, requestContextService, baseSettingsService, idGenerationService) {
        this.repository = repository;
        this.requestContextService = requestContextService;
        this.baseSettingsService = baseSettingsService;
        this.idGenerationService = idGenerationService;
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
            const rows = await this.repository.manager.query(`SELECT "IsBasicInfoShared" FROM "Gnr"."BusinessStructure" WHERE "BusinessStructureID" IN ($1, 1)`, [bsId]);
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
        const partyId = await this.idGenerationService.generateNextId('Party');
        if (data.partyRelatedPersons && data.partyRelatedPersons.length > 0) {
            for (const related of data.partyRelatedPersons) {
                if (!related.partyRelatedId) {
                    related.partyRelatedId = await this.idGenerationService.generateNextId('PartyRelated');
                }
            }
        }
        const addresses = data.partyAddresses || data.PartyAddresses;
        if (addresses && Array.isArray(addresses)) {
            for (const addr of addresses) {
                if (!addr.partyAddressId && !addr.PartyAddressID) {
                    addr.partyAddressId = await this.idGenerationService.generateNextId('PartyAddress');
                }
                else if (addr.PartyAddressID && !addr.partyAddressId) {
                    addr.partyAddressId = addr.PartyAddressID;
                }
            }
            data.partyAddresses = addresses;
            delete data.PartyAddresses;
        }
        const phones = data.partyPhones || data.PartyPhones;
        if (phones && Array.isArray(phones)) {
            for (const phone of phones) {
                if (!phone.partyPhoneId && !phone.PartyPhoneID) {
                    phone.partyPhoneId = await this.idGenerationService.generateNextId('PartyPhone');
                }
                else if (phone.PartyPhoneID && !phone.partyPhoneId) {
                    phone.partyPhoneId = phone.PartyPhoneID;
                }
            }
            data.partyPhones = phones;
            delete data.PartyPhones;
        }
        const entity = this.repository.create({
            ...data,
            partyId,
            businessStructureRef: bsId,
            companyRef: compId,
        });
        return this.repository.save(entity);
    }
    async update(id, data) {
        if (data.partyRelatedPersons && data.partyRelatedPersons.length > 0) {
            for (const related of data.partyRelatedPersons) {
                if (!related.partyRelatedId) {
                    related.partyRelatedId = await this.idGenerationService.generateNextId('PartyRelated');
                }
            }
        }
        const addresses = data.partyAddresses || data.PartyAddresses;
        if (addresses && Array.isArray(addresses)) {
            for (const addr of addresses) {
                if (!addr.partyAddressId && !addr.PartyAddressID) {
                    addr.partyAddressId = await this.idGenerationService.generateNextId('PartyAddress');
                }
                else if (addr.PartyAddressID && !addr.partyAddressId) {
                    addr.partyAddressId = addr.PartyAddressID;
                }
            }
            data.partyAddresses = addresses;
            delete data.PartyAddresses;
        }
        const phones = data.partyPhones || data.PartyPhones;
        if (phones && Array.isArray(phones)) {
            for (const phone of phones) {
                if (!phone.partyPhoneId && !phone.PartyPhoneID) {
                    phone.partyPhoneId = await this.idGenerationService.generateNextId('PartyPhone');
                }
                else if (phone.PartyPhoneID && !phone.partyPhoneId) {
                    phone.partyPhoneId = phone.PartyPhoneID;
                }
            }
            data.partyPhones = phones;
            delete data.PartyPhones;
        }
        if (data.partyRelatedPersons !== undefined || data.partyAddresses !== undefined || data.partyPhones !== undefined || data.PartyAddresses !== undefined || data.PartyPhones !== undefined) {
            const existingEntity = await this.findById(id);
            if (existingEntity) {
                const mergedEntity = this.repository.merge(existingEntity, data);
                await this.repository.save(mergedEntity);
                return this.findById(id);
            }
        }
        await this.repository.update(id, data);
        return this.findById(id);
    }
    async delete(id) {
        await this.repository.delete(id);
    }
    async findById(id) {
        return this.repository.findOne({ where: { partyId: id } });
    }
    async findAll(options) {
        const { bsId, compId, isShared } = await this.getScope();
        const qb = this.repository.createQueryBuilder('party');
        qb.leftJoinAndSelect('party.detailedAccount', 'da');
        if (isShared) {
            qb.where('party.businessStructureRef = :bsId', { bsId });
        }
        else {
            qb.where('party.companyRef = :compId', { compId });
        }
        if (options?.excludeAssignedCustomers) {
            const excludeCustId = options.excludeCustomerId ? Number(options.excludeCustomerId) : undefined;
            let subQuery = qb.subQuery()
                .select('c.PartyRef')
                .from('Sle.Customers', 'c')
                .where('c.PartyRef IS NOT NULL');
            if (excludeCustId) {
                subQuery = subQuery.andWhere('c.CustomerID != :excludeCustId', { excludeCustId });
            }
            qb.andWhere(`party.partyId NOT IN (${subQuery.getQuery()})`);
        }
        if (options?.where) {
            if (options.where.nature) {
                qb.andWhere('party.nature = :nature', { nature: options.where.nature });
            }
            if (options.where.isActive !== undefined) {
                qb.andWhere('party.isActive = :isActive', { isActive: options.where.isActive });
            }
            if (options.where.isCustomer !== undefined) {
                qb.andWhere('party.isCustomer = :isCustomer', { isCustomer: options.where.isCustomer });
            }
            if (options.where.isSupplier !== undefined) {
                qb.andWhere('party.isSupplier = :isSupplier', { isSupplier: options.where.isSupplier });
            }
        }
        return qb.getMany();
    }
    async findAdvanced(params) {
        const { bsId, compId, isShared } = await this.getScope();
        const qb = this.repository.createQueryBuilder('party');
        qb.leftJoinAndSelect('party.detailedAccount', 'da');
        if (isShared) {
            qb.where('party.businessStructureRef = :bsId', { bsId });
        }
        else {
            qb.where('party.companyRef = :compId', { compId });
        }
        if (params.excludeAssignedCustomers) {
            const excludeCustId = params.excludeCustomerId ? Number(params.excludeCustomerId) : undefined;
            let subQuery = qb.subQuery()
                .select('c.PartyRef')
                .from('Sle.Customers', 'c')
                .where('c.PartyRef IS NOT NULL');
            if (excludeCustId) {
                subQuery = subQuery.andWhere('c.CustomerID != :excludeCustId', { excludeCustId });
            }
            qb.andWhere(`party.partyId NOT IN (${subQuery.getQuery()})`);
        }
        (0, typeorm_query_builder_1.applyDataGridParams)(qb, this.mapDetailedAccountKeys(params), 'party');
        return qb.getManyAndCount();
    }
    mapDetailedAccountKeys(params) {
        const KEY_MAP = {
            'code': 'da.code',
            'detailedCode': 'da.code',
            'detailedAccount.code': 'da.code',
            'title': 'da.title',
            'companyTitle': 'da.title',
            'detailedAccount.title': 'da.title',
        };
        if (!params || typeof params !== 'object')
            return params;
        const remap = (state) => {
            if (typeof state === 'string') {
                if (state.trim() === '' || state === 'undefined' || state === 'null')
                    return state;
                try {
                    state = JSON.parse(state);
                }
                catch (e) {
                    return state;
                }
            }
            if (!Array.isArray(state))
                return state;
            return state.map((item) => {
                const id = item?.id ?? item?.columnId;
                if (id && KEY_MAP[id]) {
                    return item.id !== undefined ? { ...item, id: KEY_MAP[id] } : { ...item, columnId: KEY_MAP[id] };
                }
                return item;
            });
        };
        const mapped = { ...params };
        if (mapped.sorting !== undefined) {
            const v = remap(mapped.sorting);
            mapped.sorting = typeof v === 'string' ? v : JSON.stringify(v);
        }
        if (mapped.columnFilters !== undefined) {
            const v = remap(mapped.columnFilters);
            mapped.columnFilters = typeof v === 'string' ? v : JSON.stringify(v);
        }
        if (mapped.advancedFilters !== undefined) {
            const v = remap(mapped.advancedFilters);
            mapped.advancedFilters = typeof v === 'string' ? v : JSON.stringify(v);
        }
        return mapped;
    }
    async checkDuplicate(field, value, excludeId) {
        const { bsId, compId, isShared } = await this.getScope();
        const qb = this.repository.createQueryBuilder('party');
        qb.where(`party.${field} = :value`, { value });
        if (isShared) {
            qb.andWhere('party.businessStructureRef = :bsId', { bsId });
        }
        else {
            qb.andWhere('party.companyRef = :compId', { compId });
        }
        if (excludeId) {
            qb.andWhere('party.partyId != :excludeId', { excludeId: parseInt(excludeId, 10) });
        }
        const count = await qb.getCount();
        return count > 0;
    }
    async findDuplicatesByFullName(firstName, lastName, excludeId) {
        const { bsId, compId, isShared } = await this.getScope();
        const qb = this.repository.createQueryBuilder('party');
        qb.where('party.firstName = :firstName', { firstName })
            .andWhere('party.lastName = :lastName', { lastName });
        if (isShared) {
            qb.andWhere('party.businessStructureRef = :bsId', { bsId });
        }
        else {
            qb.andWhere('party.companyRef = :compId', { compId });
        }
        if (excludeId) {
            qb.andWhere('party.partyId != :excludeId', { excludeId: parseInt(excludeId, 10) });
        }
        const count = await qb.getCount();
        return count > 0;
    }
};
exports.PartyRepository = PartyRepository;
exports.PartyRepository = PartyRepository = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(party_entity_1.Party)),
    __param(2, (0, common_1.Inject)((0, common_1.forwardRef)(() => base_settings_service_1.BaseSettingsService))),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        request_context_service_1.RequestContextService,
        base_settings_service_1.BaseSettingsService,
        id_generation_service_1.IdGenerationService])
], PartyRepository);
//# sourceMappingURL=party.repository.js.map