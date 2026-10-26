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
exports.SalesItemGroupRepository = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const sales_item_group_entity_1 = require("../../domain/entities/sales-item-group.entity");
const entity_numbering_entity_1 = require("../../../common/domain/entities/entity-numbering.entity");
const request_context_service_1 = require("../../../../core/services/request-context.service");
let SalesItemGroupRepository = class SalesItemGroupRepository {
    constructor(repository, requestContextService) {
        this.repository = repository;
        this.requestContextService = requestContextService;
    }
    get manager() {
        return this.repository.manager;
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
    async checkDuplicate(field, value, excludeId) {
        const { bsId, compId, isShared } = await this.getScope();
        const where = { [field]: value };
        if (isShared) {
            where.businessStructureRef = bsId;
        }
        else {
            where.companyRef = compId;
        }
        if (excludeId) {
            where.SalesItemGroupID = (0, typeorm_2.Not)(parseInt(excludeId, 10));
        }
        const count = await this.repository.count({ where });
        return count > 0;
    }
    async findAll(criteria) {
        const { bsId, compId, isShared } = await this.getScope();
        const where = criteria?.where ? { ...criteria.where } : {};
        if (isShared)
            where.businessStructureRef = bsId;
        else
            where.companyRef = compId;
        return this.repository.find({ ...criteria, where });
    }
    async findById(id) {
        const { bsId, compId, isShared } = await this.getScope();
        const where = { SalesItemGroupID: id };
        if (isShared)
            where.businessStructureRef = bsId;
        else
            where.companyRef = compId;
        return this.repository.findOne({ where });
    }
    async create(entity) {
        const { bsId, compId } = await this.getScope();
        if (!entity.businessStructureRef || entity.businessStructureRef <= 1)
            entity.businessStructureRef = bsId;
        if (!entity.companyRef || entity.companyRef <= 1)
            entity.companyRef = compId;
        const newEntity = this.repository.create(entity);
        return this.repository.save(newEntity);
    }
    async update(id, entity) {
        await this.repository.update(id, entity);
        return this.findById(id);
    }
    async delete(id) {
        await this.repository.delete(id);
    }
    async count(criteria) {
        return this.repository.count(criteria);
    }
    async calculateNextCode(businessStructureId, companyId) {
        const manager = this.repository.manager;
        let config = await manager.getRepository(entity_numbering_entity_1.EntityNumbering).findOne({
            where: {
                entityRef: 'sales_item_group',
                companyRef: companyId,
            }
        });
        if (!config) {
            config = await manager.getRepository(entity_numbering_entity_1.EntityNumbering).findOne({
                where: {
                    entityRef: 'sales_item_group',
                    businessStructureRef: businessStructureId,
                }
            });
        }
        let numberingMethod = '2';
        let items = null;
        if (config) {
            numberingMethod = config.numberingMethod || '2';
            items = config.items;
        }
        let startNumber = 1;
        let endNumber = 999999;
        let fixedChar = '';
        if (items) {
            let fYears = items.fiscalYears || [];
            if (Array.isArray(items))
                fYears = items;
            if (fYears.length > 0) {
                startNumber = parseInt(fYears[0].startNumber || '1', 10);
                endNumber = parseInt(fYears[0].endNumber || '999999', 10);
                fixedChar = fYears[0].fixedChar || '';
            }
        }
        const { isShared } = await this.getScope();
        let query = this.repository.createQueryBuilder('p');
        if (isShared) {
            query.where('p.businessStructureRef = :bsId', { bsId: businessStructureId });
        }
        else {
            query.where('p.companyRef = :compId', { compId: companyId });
        }
        const maxCodeRow = await query.select('MAX(p.SalesItemGroupCode)', 'maxCode').getRawOne();
        let nextNum = startNumber;
        if (maxCodeRow && maxCodeRow.maxCode) {
            const parsed = parseInt(maxCodeRow.maxCode, 10);
            if (!isNaN(parsed) && parsed >= startNumber) {
                nextNum = parsed + 1;
            }
        }
        if (nextNum > endNumber) {
            return { numberingMethod, nextValue: '', error: 'شماره‌گذاری از حد مجاز فراتر رفته است' };
        }
        const documentNumber = fixedChar ? `${fixedChar}${nextNum}` : `${nextNum}`;
        return { numberingMethod, nextValue: documentNumber };
    }
};
exports.SalesItemGroupRepository = SalesItemGroupRepository;
exports.SalesItemGroupRepository = SalesItemGroupRepository = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(sales_item_group_entity_1.SalesItemGroup)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        request_context_service_1.RequestContextService])
], SalesItemGroupRepository);
//# sourceMappingURL=sales-item-group.repository.js.map