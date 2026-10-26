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
exports.ReportUserDataController = void 0;
const common_1 = require("@nestjs/common");
const report_user_data_service_1 = require("../../application/services/report-user-data.service");
const upsert_report_user_data_dto_1 = require("../../application/dtos/upsert-report-user-data.dto");
const jwt_auth_guard_1 = require("../../../../auth/jwt-auth.guard");
let ReportUserDataController = class ReportUserDataController {
    constructor(reportUserDataService) {
        this.reportUserDataService = reportUserDataService;
    }
    async upsertData(dto, req) {
        return await this.reportUserDataService.upsertData(dto, req.user);
    }
    async getByReportName(reportName, req) {
        return await this.reportUserDataService.getByReportName(reportName, req.user);
    }
};
exports.ReportUserDataController = ReportUserDataController;
__decorate([
    (0, common_1.Post)(),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [upsert_report_user_data_dto_1.UpsertReportUserDataDto, Object]),
    __metadata("design:returntype", Promise)
], ReportUserDataController.prototype, "upsertData", null);
__decorate([
    (0, common_1.Get)(':reportName'),
    __param(0, (0, common_1.Param)('reportName')),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], ReportUserDataController.prototype, "getByReportName", null);
exports.ReportUserDataController = ReportUserDataController = __decorate([
    (0, common_1.Controller)('report-user-data'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __metadata("design:paramtypes", [report_user_data_service_1.ReportUserDataService])
], ReportUserDataController);
//# sourceMappingURL=report-user-data.controller.js.map