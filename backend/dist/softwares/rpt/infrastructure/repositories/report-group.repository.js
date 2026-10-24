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
exports.ReportGroupRepository = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const report_group_entity_1 = require("../../domain/entities/report-group.entity");
let ReportGroupRepository = class ReportGroupRepository {
    constructor(repository) {
        this.repository = repository;
    }
    async findAll(companyRef, businessStructureRef) {
        const query = this.repository.createQueryBuilder('rg');
        if (companyRef) {
            query.andWhere('rg.companyRef = :companyRef', { companyRef });
        }
        if (businessStructureRef) {
            query.andWhere('rg.businessStructureRef = :businessStructureRef', { businessStructureRef });
        }
        return query.getMany();
    }
    async findById(id) {
        return this.repository.findOne({ where: { reportGroupID: id } });
    }
    async create(reportGroup) {
        const newDoc = this.repository.create(reportGroup);
        return this.repository.save(newDoc);
    }
    async update(id, reportGroup) {
        await this.repository.update(id, reportGroup);
        return this.findById(id);
    }
    async delete(id) {
        await this.repository.delete(id);
    }
};
exports.ReportGroupRepository = ReportGroupRepository;
exports.ReportGroupRepository = ReportGroupRepository = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(report_group_entity_1.ReportGroup)),
    __metadata("design:paramtypes", [typeorm_2.Repository])
], ReportGroupRepository);
//# sourceMappingURL=report-group.repository.js.map