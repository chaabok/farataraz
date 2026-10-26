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
exports.ReportController = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const report_service_1 = require("../../application/services/report.service");
const upsert_report_dto_1 = require("../../application/dtos/upsert-report.dto");
const base_settings_service_1 = require("../../../common/application/services/base-settings.service");
const request_context_service_1 = require("../../../../core/services/request-context.service");
let ReportController = class ReportController {
    constructor(reportService, baseSettingsService, requestContext, dataSource) {
        this.reportService = reportService;
        this.baseSettingsService = baseSettingsService;
        this.requestContext = requestContext;
        this.dataSource = dataSource;
    }
    async findAll(targetForm) {
        const bsId = this.requestContext.getBusinessStructureId()?.toString() || '1';
        const compId = this.requestContext.getCompanyId()?.toString() || '1';
        let isShared = true;
        try {
            const rows = await this.dataSource.query(`SELECT "IsBasicInfoShared" FROM "Gnr"."BusinessStructure" WHERE "BusinessStructureID" IN ($1, 1)`, [Number(bsId)]);
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
        const refToUse = isShared ? bsId : compId;
        let items;
        if (isShared) {
            items = await this.reportService.findAll(undefined, refToUse, targetForm);
        }
        else {
            items = await this.reportService.findAll(refToUse, undefined, targetForm);
        }
        return items;
    }
    async findOne(id) {
        return this.reportService.findById(id);
    }
    async create(dto) {
        const bsId = this.requestContext.getBusinessStructureId()?.toString() || '1';
        const compId = this.requestContext.getCompanyId()?.toString() || '1';
        return this.reportService.upsert(dto, compId, bsId);
    }
    async update(id, dto) {
        dto.reportID = id;
        const bsId = this.requestContext.getBusinessStructureId()?.toString() || '1';
        const compId = this.requestContext.getCompanyId()?.toString() || '1';
        return this.reportService.upsert(dto, compId, bsId);
    }
    async remove(id) {
        return this.reportService.delete(id);
    }
};
exports.ReportController = ReportController;
__decorate([
    (0, common_1.Get)(),
    __param(0, (0, common_1.Query)('targetForm')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], ReportController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], ReportController.prototype, "findOne", null);
__decorate([
    (0, common_1.Post)(),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [upsert_report_dto_1.UpsertReportDto]),
    __metadata("design:returntype", Promise)
], ReportController.prototype, "create", null);
__decorate([
    (0, common_1.Put)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, upsert_report_dto_1.UpsertReportDto]),
    __metadata("design:returntype", Promise)
], ReportController.prototype, "update", null);
__decorate([
    (0, common_1.Delete)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], ReportController.prototype, "remove", null);
exports.ReportController = ReportController = __decorate([
    (0, common_1.Controller)('rpt/reports'),
    __param(3, (0, typeorm_1.InjectDataSource)()),
    __metadata("design:paramtypes", [report_service_1.ReportService,
        base_settings_service_1.BaseSettingsService,
        request_context_service_1.RequestContextService,
        typeorm_2.DataSource])
], ReportController);
//# sourceMappingURL=report.controller.js.map