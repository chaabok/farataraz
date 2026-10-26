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
exports.ReportUserDataService = void 0;
const common_1 = require("@nestjs/common");
const id_generation_service_1 = require("../../../../core/services/id-generation.service");
let ReportUserDataService = class ReportUserDataService {
    constructor(reportUserDataRepository, idGenerationService) {
        this.reportUserDataRepository = reportUserDataRepository;
        this.idGenerationService = idGenerationService;
    }
    async upsertData(dto, authInfo) {
        const { reportName, data } = dto;
        for (const item of data) {
            const existing = await this.reportUserDataRepository.findByDynamicKey(reportName, item.dynamicKey, authInfo);
            if (existing) {
                await this.reportUserDataRepository.update(existing.reportUserDataID, {
                    value: item.value
                });
            }
            else {
                const id = await this.idGenerationService.generateNextId('ReportUserData');
                await this.reportUserDataRepository.create({
                    reportUserDataID: id.toString(),
                    reportName: reportName,
                    dynamicKey: item.dynamicKey,
                    value: item.value,
                    businessStructureRef: authInfo.businessStructureRef?.toString(),
                    companyRef: authInfo.companyRef?.toString()
                });
            }
        }
        return { success: true };
    }
    async getByReportName(reportName, authInfo) {
        return await this.reportUserDataRepository.findByReportName(reportName, authInfo);
    }
};
exports.ReportUserDataService = ReportUserDataService;
exports.ReportUserDataService = ReportUserDataService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, common_1.Inject)('ReportUserDataRepositoryInterface')),
    __metadata("design:paramtypes", [Object, id_generation_service_1.IdGenerationService])
], ReportUserDataService);
//# sourceMappingURL=report-user-data.service.js.map