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
exports.ReportGroupService = void 0;
const common_1 = require("@nestjs/common");
const report_group_repository_interface_1 = require("../../domain/repositories/report-group.repository.interface");
const report_group_entity_1 = require("../../domain/entities/report-group.entity");
const id_generation_service_1 = require("../../../../core/services/id-generation.service");
let ReportGroupService = class ReportGroupService {
    constructor(reportGroupRepository, idGenerationService) {
        this.reportGroupRepository = reportGroupRepository;
        this.idGenerationService = idGenerationService;
    }
    async findAll(companyRef, businessStructureRef) {
        return this.reportGroupRepository.findAll(companyRef, businessStructureRef);
    }
    async findById(id) {
        return this.reportGroupRepository.findById(id);
    }
    async upsert(dto, companyRef, businessStructureRef) {
        if (dto.reportGroupID) {
            return this.reportGroupRepository.update(dto.reportGroupID, {
                title: dto.title
            });
        }
        else {
            const newId = (await this.idGenerationService.generateNextId('ReportGroup')).toString();
            const newEntity = new report_group_entity_1.ReportGroup();
            newEntity.reportGroupID = newId;
            newEntity.title = dto.title || '';
            newEntity.companyRef = Number(companyRef);
            newEntity.businessStructureRef = Number(businessStructureRef);
            return this.reportGroupRepository.create(newEntity);
        }
    }
    async delete(id) {
        await this.reportGroupRepository.delete(id);
    }
};
exports.ReportGroupService = ReportGroupService;
exports.ReportGroupService = ReportGroupService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, common_1.Inject)(report_group_repository_interface_1.IReportGroupRepository)),
    __metadata("design:paramtypes", [Object, id_generation_service_1.IdGenerationService])
], ReportGroupService);
//# sourceMappingURL=report-group.service.js.map