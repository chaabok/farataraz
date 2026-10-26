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
exports.ReportAggregateRepository = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const report_aggregate_entity_1 = require("../../domain/entities/report-aggregate.entity");
let ReportAggregateRepository = class ReportAggregateRepository {
    constructor(repo) {
        this.repo = repo;
    }
    async create(aggregate) {
        const et = this.repo.create(aggregate);
        return this.repo.save(et);
    }
    async findByReportId(reportId) {
        return this.repo.find({ where: { reportRef: reportId } });
    }
    async deleteByReportId(reportId) {
        await this.repo.delete({ reportRef: reportId });
    }
};
exports.ReportAggregateRepository = ReportAggregateRepository;
exports.ReportAggregateRepository = ReportAggregateRepository = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(report_aggregate_entity_1.ReportAggregate)),
    __metadata("design:paramtypes", [typeorm_2.Repository])
], ReportAggregateRepository);
//# sourceMappingURL=report-aggregate.repository.js.map