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
exports.TrackingFactorController = void 0;
const common_1 = require("@nestjs/common");
const tracking_factor_service_1 = require("../../application/services/tracking-factor.service");
const tracking_factor_dto_1 = require("../../application/dtos/tracking-factor.dto");
const jwt_auth_guard_1 = require("../../../../auth/jwt-auth.guard");
const permissions_guard_1 = require("../../../../auth/permissions.guard");
let TrackingFactorController = class TrackingFactorController {
    constructor(service) {
        this.service = service;
    }
    getNextNumber() {
        return this.service.getNextNumber();
    }
    getNextPriority() {
        return this.service.getNextPriority();
    }
    getAvailableItems(trackingFactorId) {
        const tfId = trackingFactorId ? parseInt(trackingFactorId, 10) : undefined;
        return this.service.getAvailableItems(tfId);
    }
    validateRange(body) {
        return this.service.validateRange(body);
    }
    findAll(query) {
        return this.service.findAll(query);
    }
    findOne(id) {
        return this.service.findOne(+id);
    }
    create(dto) {
        return this.service.create(dto);
    }
    update(id, dto) {
        return this.service.update(+id, dto);
    }
    remove(id) {
        return this.service.remove(+id);
    }
};
exports.TrackingFactorController = TrackingFactorController;
__decorate([
    (0, common_1.Get)('next-number'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], TrackingFactorController.prototype, "getNextNumber", null);
__decorate([
    (0, common_1.Get)('next-priority'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], TrackingFactorController.prototype, "getNextPriority", null);
__decorate([
    (0, common_1.Get)('available-items'),
    __param(0, (0, common_1.Query)('trackingFactorId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], TrackingFactorController.prototype, "getAvailableItems", null);
__decorate([
    (0, common_1.Post)('validate-range'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], TrackingFactorController.prototype, "validateRange", null);
__decorate([
    (0, common_1.Get)(),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], TrackingFactorController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], TrackingFactorController.prototype, "findOne", null);
__decorate([
    (0, common_1.Post)(),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [tracking_factor_dto_1.CreateTrackingFactorDto]),
    __metadata("design:returntype", void 0)
], TrackingFactorController.prototype, "create", null);
__decorate([
    (0, common_1.Put)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, tracking_factor_dto_1.UpdateTrackingFactorDto]),
    __metadata("design:returntype", void 0)
], TrackingFactorController.prototype, "update", null);
__decorate([
    (0, common_1.Delete)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], TrackingFactorController.prototype, "remove", null);
exports.TrackingFactorController = TrackingFactorController = __decorate([
    (0, common_1.Controller)('inv/tracking-factors'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, permissions_guard_1.PermissionsGuard),
    __metadata("design:paramtypes", [tracking_factor_service_1.TrackingFactorService])
], TrackingFactorController);
//# sourceMappingURL=tracking-factor.controller.js.map