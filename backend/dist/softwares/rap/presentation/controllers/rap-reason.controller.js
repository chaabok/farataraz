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
exports.RapReasonController = void 0;
const common_1 = require("@nestjs/common");
const rap_reason_service_1 = require("../../application/services/rap-reason.service");
const create_rap_reason_dto_1 = require("../../application/dtos/create-rap-reason.dto");
const update_rap_reason_dto_1 = require("../../application/dtos/update-rap-reason.dto");
const jwt_auth_guard_1 = require("../../../../auth/jwt-auth.guard");
const request_context_service_1 = require("../../../../core/services/request-context.service");
let RapReasonController = class RapReasonController {
    constructor(rapReasonService, requestContextService) {
        this.rapReasonService = rapReasonService;
        this.requestContextService = requestContextService;
    }
    create(createDto) {
        const authContext = {
            businessStructureId: this.requestContextService.getBusinessStructureId() || 2,
            companyId: this.requestContextService.getCompanyId() || 2
        };
        return this.rapReasonService.create(createDto, authContext);
    }
    findAll() {
        const authContext = {
            businessStructureId: this.requestContextService.getBusinessStructureId() || 2,
            companyId: this.requestContextService.getCompanyId() || 2
        };
        return this.rapReasonService.findAll(authContext);
    }
    findTree() {
        const authContext = {
            businessStructureId: this.requestContextService.getBusinessStructureId() || 2,
            companyId: this.requestContextService.getCompanyId() || 2
        };
        return this.rapReasonService.findAllTree(authContext);
    }
    findOne(id) {
        const authContext = {
            businessStructureId: this.requestContextService.getBusinessStructureId() || 2,
            companyId: this.requestContextService.getCompanyId() || 2
        };
        return this.rapReasonService.findOne(id, authContext);
    }
    update(id, updateDto) {
        const authContext = {
            businessStructureId: this.requestContextService.getBusinessStructureId() || 2,
            companyId: this.requestContextService.getCompanyId() || 2
        };
        return this.rapReasonService.update(id, updateDto, authContext);
    }
    remove(id) {
        const authContext = {
            businessStructureId: this.requestContextService.getBusinessStructureId() || 2,
            companyId: this.requestContextService.getCompanyId() || 2
        };
        return this.rapReasonService.remove(id, authContext);
    }
};
exports.RapReasonController = RapReasonController;
__decorate([
    (0, common_1.Post)(),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_rap_reason_dto_1.CreateRapReasonDto]),
    __metadata("design:returntype", void 0)
], RapReasonController.prototype, "create", null);
__decorate([
    (0, common_1.Get)(),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], RapReasonController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)('tree'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], RapReasonController.prototype, "findTree", null);
__decorate([
    (0, common_1.Get)(':id'),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", void 0)
], RapReasonController.prototype, "findOne", null);
__decorate([
    (0, common_1.Put)(':id'),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, update_rap_reason_dto_1.UpdateRapReasonDto]),
    __metadata("design:returntype", void 0)
], RapReasonController.prototype, "update", null);
__decorate([
    (0, common_1.Delete)(':id'),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", void 0)
], RapReasonController.prototype, "remove", null);
exports.RapReasonController = RapReasonController = __decorate([
    (0, common_1.Controller)('rap/reasons'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __metadata("design:paramtypes", [rap_reason_service_1.RapReasonService,
        request_context_service_1.RequestContextService])
], RapReasonController);
//# sourceMappingURL=rap-reason.controller.js.map