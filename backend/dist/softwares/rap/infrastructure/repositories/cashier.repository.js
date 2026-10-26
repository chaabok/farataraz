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
exports.CashierRepository = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const cashier_entity_1 = require("../../domain/entities/cashier.entity");
const id_generation_service_1 = require("../../../../core/services/id-generation.service");
const request_context_service_1 = require("../../../../core/services/request-context.service");
let CashierRepository = class CashierRepository {
    constructor(typeOrmRepo, idGenService, requestContextService) {
        this.typeOrmRepo = typeOrmRepo;
        this.idGenService = idGenService;
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
        if (!data.cashierId) {
            data.cashierId = await this.idGenService.generateNextId('Cashiers');
        }
        const { bsId, compId } = await this.getScope();
        const item = this.typeOrmRepo.create({
            ...data,
            businessStructureRef: (data.businessStructureRef && data.businessStructureRef > 1) ? data.businessStructureRef : bsId,
            companyRef: (data.companyRef && data.companyRef > 1) ? data.companyRef : compId,
        });
        return this.typeOrmRepo.save(item);
    }
    async update(id, data) {
        await this.typeOrmRepo.update(id, data);
        return this.findById(id);
    }
    async delete(id) {
        await this.typeOrmRepo.delete(id);
    }
    async findById(id) {
        const { bsId, compId, isShared } = await this.getScope();
        const where = { cashierId: id };
        if (isShared)
            where.businessStructureRef = bsId;
        else
            where.companyRef = compId;
        return this.typeOrmRepo.findOne({ where, relations: ['user', 'cash'] });
    }
    async findByCashId(cashId) {
        const { bsId, compId, isShared } = await this.getScope();
        const where = { cashId };
        if (isShared)
            where.businessStructureRef = bsId;
        else
            where.companyRef = compId;
        return this.typeOrmRepo.find({ where, relations: ['user'] });
    }
};
exports.CashierRepository = CashierRepository;
exports.CashierRepository = CashierRepository = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(cashier_entity_1.Cashier)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        id_generation_service_1.IdGenerationService,
        request_context_service_1.RequestContextService])
], CashierRepository);
//# sourceMappingURL=cashier.repository.js.map