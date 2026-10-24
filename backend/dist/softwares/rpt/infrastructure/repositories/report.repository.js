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
exports.ReportRepository = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const report_entity_1 = require("../../domain/entities/report.entity");
let ReportRepository = class ReportRepository {
    constructor(repository) {
        this.repository = repository;
    }
    async findAll(companyRef, businessStructureRef, targetForm) {
        const query = this.repository.createQueryBuilder('report')
            .leftJoinAndSelect('report.reportGroupEntity', 'reportGroup');
        if (companyRef) {
            query.andWhere('(report.companyRef = :companyRef OR report.isSystemReport = :sys)', { companyRef, sys: true });
        }
        if (businessStructureRef) {
            query.andWhere('(report.businessStructureRef = :businessStructureRef OR report.isSystemReport = :sys)', { businessStructureRef, sys: true });
        }
        if (targetForm) {
            query.andWhere('report.targetForm = :targetForm', { targetForm });
        }
        return query.getMany();
    }
    async findById(id) {
        return this.repository.findOne({
            where: { reportID: id },
            relations: ['reportGroupEntity']
        });
    }
    async create(report) {
        const newDoc = this.repository.create(report);
        return this.repository.save(newDoc);
    }
    async update(id, report) {
        await this.repository.update(id, report);
        return this.findById(id);
    }
    async delete(id) {
        await this.repository.delete(id);
    }
};
exports.ReportRepository = ReportRepository;
exports.ReportRepository = ReportRepository = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(report_entity_1.Report)),
    __metadata("design:paramtypes", [typeorm_2.Repository])
], ReportRepository);
//# sourceMappingURL=report.repository.js.map