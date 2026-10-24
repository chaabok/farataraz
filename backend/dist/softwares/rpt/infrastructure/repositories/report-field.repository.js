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
exports.ReportFieldRepository = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const report_field_entity_1 = require("../../domain/entities/report-field.entity");
let ReportFieldRepository = class ReportFieldRepository {
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
        return this.repository.findOne({ where: { reportFieldID: id } });
    }
    async create(reportField) {
        const newDoc = this.repository.create(reportField);
        return this.repository.save(newDoc);
    }
    async update(id, reportField) {
        await this.repository.update(id, reportField);
        return this.findById(id);
    }
    async delete(id) {
        await this.repository.delete(id);
    }
    async deleteByReportId(reportId) {
        await this.repository.delete({ reportRef: reportId });
    }
};
exports.ReportFieldRepository = ReportFieldRepository;
exports.ReportFieldRepository = ReportFieldRepository = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(report_field_entity_1.ReportField)),
    __metadata("design:paramtypes", [typeorm_2.Repository])
], ReportFieldRepository);
//# sourceMappingURL=report-field.repository.js.map