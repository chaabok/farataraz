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
exports.ContractService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const contract_entity_1 = require("../../domain/entities/contract.entity");
const detailed_type_entity_1 = require("../../../accounting/domain/entities/detailed-type.entity");
const detailed_accounts_numbering_entity_1 = require("../../../common/domain/entities/detailed-accounts-numbering.entity");
const detailed_accounts_numbering_service_1 = require("../../../common/application/services/detailed-accounts-numbering.service");
const detailed_account_service_1 = require("../../../accounting/application/services/detailed-account.service");
const request_context_service_1 = require("../../../../core/services/request-context.service");
let ContractService = class ContractService {
    constructor(contractRepository, detailedTypeRepository, numberingRepository, detailedAccountsNumberingService, detailedAccountService, dataSource, requestContextService) {
        this.contractRepository = contractRepository;
        this.detailedTypeRepository = detailedTypeRepository;
        this.numberingRepository = numberingRepository;
        this.detailedAccountsNumberingService = detailedAccountsNumberingService;
        this.detailedAccountService = detailedAccountService;
        this.dataSource = dataSource;
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
            const rows = await this.contractRepository.manager.connection.query(`SELECT "IsBasicInfoShared" FROM "Gnr"."BusinessStructure" WHERE "BusinessStructureID" IN ($1, 1)`, [bsId]);
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
        return this.contractRepository.find({ where, order: { documentNumber: 'ASC' } });
    }
    async findOne(id) {
        const { bsId, compId, isShared } = await this.getScope();
        const where = { contractId: id };
        if (isShared)
            where.businessStructureRef = bsId;
        else
            where.companyRef = compId;
        return this.contractRepository.findOne({ where });
    }
    async create(data) {
        const { bsId, compId } = await this.getScope();
        if (!data.businessStructureRef || data.businessStructureRef <= 1)
            data.businessStructureRef = bsId;
        if (!data.companyRef || data.companyRef <= 1)
            data.companyRef = compId;
        const detailedType = await this.detailedTypeRepository.findOne({
            where: { code: '9' }
        });
        if (!detailedType) {
            throw new common_1.BadRequestException('Detailed type with code "9" (قرارداد) not found in accounting.');
        }
        if (!data.detailedAccountCode) {
            const viewList = await this.detailedAccountsNumberingService.getViewList();
            const numbering = viewList.find(n => n.detailedTypesId === detailedType.detailedTypesId);
            if (!numbering) {
                throw new common_1.BadRequestException('Detailed account numbering range not defined for Contracts.');
            }
            const nextCodeStr = await this.detailedAccountsNumberingService.getNextCode(detailedType.detailedTypesId);
            const nextCode = parseInt(nextCodeStr, 10);
            if (nextCode > numbering.endNumber) {
                throw new common_1.BadRequestException(`Detailed account numbering range exhausted for Contracts. Max: ${numbering.endNumber}`);
            }
            data.detailedAccountCode = nextCodeStr;
        }
        const queryRunner = this.dataSource.createQueryRunner();
        await queryRunner.connect();
        await queryRunner.startTransaction();
        try {
            const newDa = await this.detailedAccountService.create({
                code: data.detailedAccountCode,
                title: data.detailedAccountTitle || `قرارداد ${data.documentNumber}`,
                title_en: '',
                detailedTypesId: detailedType.detailedTypesId,
                isActive: data.isActive ?? true,
            });
            data.detailedAccountId = newDa.detailedAccountId;
            const contract = this.contractRepository.create(data);
            const saved = await queryRunner.manager.save(contract);
            await queryRunner.commitTransaction();
            return saved;
        }
        catch (err) {
            await queryRunner.rollbackTransaction();
            throw err;
        }
        finally {
            await queryRunner.release();
        }
    }
    async update(id, data) {
        const existing = await this.findOne(id);
        if (!existing)
            throw new common_1.BadRequestException('قرارداد یافت نشد');
        const queryRunner = this.dataSource.createQueryRunner();
        await queryRunner.connect();
        await queryRunner.startTransaction();
        try {
            if (existing.detailedAccountId) {
                await this.detailedAccountService.update(existing.detailedAccountId, {
                    code: data.detailedAccountCode || existing.detailedAccountCode,
                    title: data.detailedAccountTitle || existing.detailedAccountTitle,
                    detailedTypesId: existing.detailedAccount?.detailedTypesId || 9,
                    isActive: data.isActive ?? existing.isActive,
                });
            }
            await queryRunner.manager.update(contract_entity_1.Contract, id, data);
            await queryRunner.commitTransaction();
            return this.findOne(id);
        }
        catch (err) {
            await queryRunner.rollbackTransaction();
            throw err;
        }
        finally {
            await queryRunner.release();
        }
    }
    async remove(id) {
        const existing = await this.findOne(id);
        if (!existing)
            return;
        const detailedAccountId = existing.detailedAccountId;
        const queryRunner = this.dataSource.createQueryRunner();
        await queryRunner.connect();
        await queryRunner.startTransaction();
        try {
            if (detailedAccountId) {
                await this.detailedAccountService.remove(detailedAccountId, queryRunner.manager);
            }
            else {
                await queryRunner.manager.delete(contract_entity_1.Contract, id);
            }
            await queryRunner.commitTransaction();
        }
        catch (err) {
            await queryRunner.rollbackTransaction();
            throw err;
        }
        finally {
            await queryRunner.release();
        }
    }
    async checkDuplicate(field, value, excludeId) {
        const where = {
            [field]: value
        };
        const count = await this.contractRepository.count({ where });
        return count > (excludeId ? 1 : 0);
    }
};
exports.ContractService = ContractService;
exports.ContractService = ContractService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(contract_entity_1.Contract)),
    __param(1, (0, typeorm_1.InjectRepository)(detailed_type_entity_1.DetailedType)),
    __param(2, (0, typeorm_1.InjectRepository)(detailed_accounts_numbering_entity_1.DetailedAccountsNumbering)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        detailed_accounts_numbering_service_1.DetailedAccountsNumberingService,
        detailed_account_service_1.DetailedAccountService,
        typeorm_2.DataSource,
        request_context_service_1.RequestContextService])
], ContractService);
//# sourceMappingURL=contract.service.js.map