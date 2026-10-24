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
exports.DetailedAccountsNumberingRepository = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const detailed_accounts_numbering_entity_1 = require("../../domain/entities/detailed-accounts-numbering.entity");
const id_generation_service_1 = require("../../../../core/services/id-generation.service");
let DetailedAccountsNumberingRepository = class DetailedAccountsNumberingRepository {
    constructor(repo, idGenerationService) {
        this.repo = repo;
        this.idGenerationService = idGenerationService;
    }
    async create(data) {
        const nextId = await this.idGenerationService.generateNextId('DetailedAccountsNumbering');
        const entity = this.repo.create({ ...data, id: nextId });
        return this.repo.save(entity);
    }
    async update(id, data) {
        await this.repo.update(id, data);
        return this.repo.findOne({ where: { id: id } });
    }
    async findAll() {
        return this.repo.find();
    }
    async findByDetailedTypeId(detailedTypesId) {
        return this.repo.findOne({ where: { detailedTypesId: detailedTypesId } });
    }
    async upsert(detailedTypesId, data) {
        const existing = await this.findByDetailedTypeId(detailedTypesId);
        if (existing) {
            return this.update(existing.id, data);
        }
        else {
            return this.create({ ...data, detailedTypesId });
        }
    }
    async deleteByDetailedTypeId(detailedTypesId) {
        await this.repo.delete({ detailedTypesId: detailedTypesId });
    }
};
exports.DetailedAccountsNumberingRepository = DetailedAccountsNumberingRepository;
exports.DetailedAccountsNumberingRepository = DetailedAccountsNumberingRepository = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(detailed_accounts_numbering_entity_1.DetailedAccountsNumbering)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        id_generation_service_1.IdGenerationService])
], DetailedAccountsNumberingRepository);
//# sourceMappingURL=detailed-accounts-numbering.repository.js.map