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
exports.BankAccountTypeRepository = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const bank_account_type_entity_1 = require("../../domain/entities/bank-account-type.entity");
const request_context_service_1 = require("../../../../core/services/request-context.service");
const id_generation_service_1 = require("../../../../core/services/id-generation.service");
let BankAccountTypeRepository = class BankAccountTypeRepository {
    constructor(repository, requestContextService, idGenService) {
        this.repository = repository;
        this.requestContextService = requestContextService;
        this.idGenService = idGenService;
    }
    async getScope() {
        const bsId = this.requestContextService.getBusinessStructureId() ?? 2;
        const compId = this.requestContextService.getCompanyId() ?? 2;
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
    async findAll() {
        const { bsId, compId, isShared } = await this.getScope();
        const where = isShared ? { businessStructureRef: bsId } : { companyRef: compId };
        return await this.repository.find({
            where,
            order: { code: 'ASC' }
        });
    }
    async findById(id) {
        const { bsId, compId, isShared } = await this.getScope();
        const where = { bankAccountTypeId: id };
        if (isShared)
            where.businessStructureRef = bsId;
        else
            where.companyRef = compId;
        return await this.repository.findOne({ where });
    }
    async create(entity) {
        const { bsId, compId } = await this.getScope();
        if (!entity.businessStructureRef || entity.businessStructureRef <= 1)
            entity.businessStructureRef = bsId;
        if (!entity.companyRef || entity.companyRef <= 1)
            entity.companyRef = compId;
        if (!entity.bankAccountTypeId || entity.bankAccountTypeId <= 0) {
            entity.bankAccountTypeId = await this.idGenService.generateNextId('BankAccountTypes');
        }
        const newEntity = this.repository.create(entity);
        return await this.repository.save(newEntity);
    }
    async update(id, entity) {
        await this.repository.update({ bankAccountTypeId: id }, entity);
        return await this.findById(id);
    }
    async delete(id) {
        await this.repository.delete({ bankAccountTypeId: id });
    }
    async count() {
        const { bsId, compId, isShared } = await this.getScope();
        const where = isShared ? { businessStructureRef: bsId } : { companyRef: compId };
        return await this.repository.count({ where });
    }
    async getMaxId() {
        const { bsId, compId, isShared } = await this.getScope();
        const qb = this.repository
            .createQueryBuilder('bat')
            .select('MAX(bat.bankAccountTypeId)', 'max');
        if (isShared) {
            qb.where('bat.businessStructureRef = :bsId', { bsId });
        }
        else {
            qb.where('bat.companyRef = :compId', { compId });
        }
        const result = await qb.getRawOne();
        return result?.max ? parseInt(result.max, 10) : 0;
    }
    async findAdvanced(params) {
        const { bsId, compId, isShared } = await this.getScope();
        const qb = this.repository.createQueryBuilder('bat');
        if (isShared) {
            qb.where('bat.businessStructureRef = :bsId', { bsId });
        }
        else {
            qb.where('bat.companyRef = :compId', { compId });
        }
        Object.assign(params, { globalSearchFields: ['bat.code', 'bat.title', 'bat.latinTitle'] });
        const { applyDataGridParams } = require('../../../../core/utils/typeorm-query-builder');
        applyDataGridParams(qb, params, 'bat');
        return qb.getManyAndCount();
    }
};
exports.BankAccountTypeRepository = BankAccountTypeRepository;
exports.BankAccountTypeRepository = BankAccountTypeRepository = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(bank_account_type_entity_1.BankAccountType)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        request_context_service_1.RequestContextService,
        id_generation_service_1.IdGenerationService])
], BankAccountTypeRepository);
//# sourceMappingURL=bank-account-type.repository.js.map