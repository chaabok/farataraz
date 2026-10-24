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
exports.ReportGroupingRepository = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const report_grouping_entity_1 = require("../../domain/entities/report-grouping.entity");
let ReportGroupingRepository = class ReportGroupingRepository {
    constructor(repository) {
        this.repository = repository;
    }
    async findByReportId(reportId) {
        return this.repository.find({
            where: { reportRef: reportId },
            order: { orderIndex: 'ASC' }
        });
    }
    async findById(id) {
        return this.repository.findOne({ where: { reportGroupingID: id } });
    }
    async create(reportGrouping) {
        const newDoc = this.repository.create(reportGrouping);
        return this.repository.save(newDoc);
    }
    async update(id, reportGrouping) {
        await this.repository.update(id, reportGrouping);
        return this.findById(id);
    }
    async delete(id) {
        await this.repository.delete(id);
    }
    async deleteByReportId(reportId) {
        await this.repository.delete({ reportRef: reportId });
    }
};
exports.ReportGroupingRepository = ReportGroupingRepository;
exports.ReportGroupingRepository = ReportGroupingRepository = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(report_grouping_entity_1.ReportGrouping)),
    __metadata("design:paramtypes", [typeorm_2.Repository])
], ReportGroupingRepository);
//# sourceMappingURL=report-grouping.repository.js.map