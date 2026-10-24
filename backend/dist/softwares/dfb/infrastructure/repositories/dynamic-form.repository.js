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
exports.DynamicFormRepository = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const dynamic_form_entity_1 = require("../../domain/entities/dynamic-form.entity");
const request_context_service_1 = require("../../../../core/services/request-context.service");
let DynamicFormRepository = class DynamicFormRepository {
    constructor(repo, requestContext) {
        this.repo = repo;
        this.requestContext = requestContext;
    }
    async create(entity) {
        return this.repo.create(entity);
    }
    async save(entity) {
        return this.repo.save(entity);
    }
    async findOne(id) {
        const bsId = this.requestContext.getBusinessStructureId();
        const query = this.repo.createQueryBuilder('f')
            .where('f.dynamicFormId = :id', { id });
        if (bsId) {
            query.andWhere('f.businessStructureRef = :bsId', { bsId });
        }
        return query.getOne();
    }
    async findByCode(code, companyId) {
        const bsId = this.requestContext.getBusinessStructureId();
        const query = this.repo.createQueryBuilder('f')
            .where('f.formCode = :code', { code });
        if (companyId) {
            query.andWhere('f.companyRef = :companyId', { companyId });
        }
        if (bsId) {
            query.andWhere('f.businessStructureRef = :bsId', { bsId });
        }
        return query.getOne();
    }
    async findAll() {
        const bsId = this.requestContext.getBusinessStructureId();
        const query = this.repo.createQueryBuilder('f');
        if (bsId) {
            query.where('f.businessStructureRef = :bsId', { bsId });
        }
        query.orderBy('f.dynamicFormId', 'ASC');
        return query.getMany();
    }
    async remove(id) {
        await this.repo.delete(id);
    }
};
exports.DynamicFormRepository = DynamicFormRepository;
exports.DynamicFormRepository = DynamicFormRepository = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(dynamic_form_entity_1.DynamicForm)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        request_context_service_1.RequestContextService])
], DynamicFormRepository);
//# sourceMappingURL=dynamic-form.repository.js.map