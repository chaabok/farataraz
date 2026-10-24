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
exports.ReportUserDataRepository = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const report_user_data_entity_1 = require("../../domain/entities/report-user-data.entity");
let ReportUserDataRepository = class ReportUserDataRepository {
    constructor(repository) {
        this.repository = repository;
    }
    async create(data) {
        const reportUserData = this.repository.create(data);
        return await this.repository.save(reportUserData);
    }
    async findAll(authInfo) {
        const query = this.repository.createQueryBuilder('reportUserData');
        if (authInfo?.companyRef)
            query.andWhere('reportUserData.companyRef = :companyRef', { companyRef: authInfo.companyRef });
        if (authInfo?.businessStructureRef)
            query.andWhere('reportUserData.businessStructureRef = :businessStructureRef', { businessStructureRef: authInfo.businessStructureRef });
        return await query.getMany();
    }
    async findByReportName(reportName, authInfo) {
        const query = this.repository.createQueryBuilder('reportUserData');
        if (authInfo?.companyRef)
            query.andWhere('reportUserData.companyRef = :companyRef', { companyRef: authInfo.companyRef });
        if (authInfo?.businessStructureRef)
            query.andWhere('reportUserData.businessStructureRef = :businessStructureRef', { businessStructureRef: authInfo.businessStructureRef });
        query.andWhere('reportUserData.reportName = :reportName', { reportName });
        return await query.getMany();
    }
    async findByDynamicKey(reportName, dynamicKey, authInfo) {
        const query = this.repository.createQueryBuilder('reportUserData');
        if (authInfo?.companyRef)
            query.andWhere('reportUserData.companyRef = :companyRef', { companyRef: authInfo.companyRef });
        if (authInfo?.businessStructureRef)
            query.andWhere('reportUserData.businessStructureRef = :businessStructureRef', { businessStructureRef: authInfo.businessStructureRef });
        query.andWhere('reportUserData.reportName = :reportName', { reportName });
        query.andWhere('reportUserData.dynamicKey = :dynamicKey', { dynamicKey });
        return await query.getOne();
    }
    async update(id, data) {
        await this.repository.update(id, data);
        return await this.repository.findOne({ where: { reportUserDataID: id } });
    }
    async delete(id) {
        await this.repository.delete(id);
    }
};
exports.ReportUserDataRepository = ReportUserDataRepository;
exports.ReportUserDataRepository = ReportUserDataRepository = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(report_user_data_entity_1.ReportUserData)),
    __metadata("design:paramtypes", [typeorm_2.Repository])
], ReportUserDataRepository);
//# sourceMappingURL=report-user-data.repository.js.map