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
exports.ChequePrintTemplateRepository = void 0;
const typeorm_1 = require("typeorm");
const common_1 = require("@nestjs/common");
const typeorm_2 = require("@nestjs/typeorm");
const cheque_print_template_entity_1 = require("../../domain/entities/cheque-print-template.entity");
const typeorm_query_builder_1 = require("../../../../core/utils/typeorm-query-builder");
const id_generation_service_1 = require("../../../../core/services/id-generation.service");
const request_context_service_1 = require("../../../../core/services/request-context.service");
let ChequePrintTemplateRepository = class ChequePrintTemplateRepository {
    constructor(repository, idGenService, requestContextService) {
        this.repository = repository;
        this.idGenService = idGenService;
        this.requestContextService = requestContextService;
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
        catch (e) {
            isShared = false;
        }
        return { bsId, compId, isShared };
    }
    async create(data) {
        const { bsId, compId, isShared } = await this.getScope();
        if (data.title) {
            const qb = this.repository.createQueryBuilder('template')
                .where('template.title = :title', { title: data.title });
            if (isShared) {
                qb.andWhere('template.businessStructureRef = :bsId', { bsId });
            }
            else {
                qb.andWhere('template.companyRef = :compId', { compId });
            }
            const existing = await qb.getOne();
            if (existing) {
                throw new Error("ChequePrintTemplate with this title already exists in the current scope.");
            }
        }
        if (!data.chequePrintTemplateId) {
            data.chequePrintTemplateId = await this.idGenService.generateNextId('ChequePrintTemplate');
        }
        const entity = this.repository.create({
            ...data,
            businessStructureRef: bsId,
            companyRef: compId,
        });
        return await this.repository.save(entity);
    }
    async update(id, data) {
        await this.repository.update({ chequePrintTemplateId: id }, data);
        return await this.findById(id);
    }
    async delete(id) {
        await this.repository.delete({ chequePrintTemplateId: id });
    }
    async findById(id) {
        const { bsId, compId, isShared } = await this.getScope();
        const qb = this.repository.createQueryBuilder('template')
            .where('template.chequePrintTemplateId = :id', { id });
        if (isShared) {
            qb.andWhere('template.businessStructureRef = :bsId', { bsId });
        }
        else {
            qb.andWhere('template.companyRef = :compId', { compId });
        }
        return await qb.getOne();
    }
    async findAll() {
        const { bsId, compId, isShared } = await this.getScope();
        const qb = this.repository.createQueryBuilder('template');
        if (isShared) {
            qb.where('template.businessStructureRef = :bsId', { bsId });
        }
        else {
            qb.where('template.companyRef = :compId', { compId });
        }
        return await qb.getMany();
    }
    async findAdvanced(params) {
        const qb = this.repository.createQueryBuilder('template');
        const { bsId, compId, isShared } = await this.getScope();
        if (isShared) {
            qb.where('template.businessStructureRef = :bsId', { bsId });
        }
        else {
            qb.where('template.companyRef = :compId', { compId });
        }
        Object.assign(params, { globalSearchFields: ['template.title'] });
        (0, typeorm_query_builder_1.applyDataGridParams)(qb, params, 'template');
        return qb.getManyAndCount();
    }
};
exports.ChequePrintTemplateRepository = ChequePrintTemplateRepository;
exports.ChequePrintTemplateRepository = ChequePrintTemplateRepository = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_2.InjectRepository)(cheque_print_template_entity_1.ChequePrintTemplate)),
    __metadata("design:paramtypes", [typeorm_1.Repository,
        id_generation_service_1.IdGenerationService,
        request_context_service_1.RequestContextService])
], ChequePrintTemplateRepository);
//# sourceMappingURL=cheque-print-template.repository.js.map