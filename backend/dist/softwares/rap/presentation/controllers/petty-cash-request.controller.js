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
exports.PettyCashRequestController = void 0;
const common_1 = require("@nestjs/common");
const petty_cash_request_service_1 = require("../../application/services/petty-cash-request.service");
const create_petty_cash_request_dto_1 = require("../../application/dtos/create-petty-cash-request.dto");
const update_petty_cash_request_dto_1 = require("../../application/dtos/update-petty-cash-request.dto");
const jwt_auth_guard_1 = require("../../../../auth/jwt-auth.guard");
const permissions_guard_1 = require("../../../../auth/permissions.guard");
const permissions_decorator_1 = require("../../../../auth/permissions.decorator");
let PettyCashRequestController = class PettyCashRequestController {
    constructor(service) {
        this.service = service;
    }
    async create(createDto) {
        const data = await this.service.create(createDto);
        return { success: true, data };
    }
    async findAll(query) {
        const [data, total] = await this.service.findAll(query);
        return { success: true, data, total };
    }
    async getNextNumbers(date) {
        const data = await this.service.getNextNumbers(date);
        return { success: true, data };
    }
    async findOne(id) {
        const data = await this.service.findOne(+id);
        return { success: true, data };
    }
    async update(id, updateDto) {
        const data = await this.service.update(+id, updateDto);
        return { success: true, data };
    }
    async remove(id) {
        await this.service.remove(+id);
        return { success: true };
    }
};
exports.PettyCashRequestController = PettyCashRequestController;
__decorate([
    (0, common_1.Post)(),
    (0, permissions_decorator_1.Permissions)('rap.pettyCashRequests.create'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_petty_cash_request_dto_1.CreatePettyCashRequestDto]),
    __metadata("design:returntype", Promise)
], PettyCashRequestController.prototype, "create", null);
__decorate([
    (0, common_1.Get)(),
    (0, permissions_decorator_1.Permissions)('rap.pettyCashRequests.view'),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], PettyCashRequestController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)('next-numbers'),
    (0, permissions_decorator_1.Permissions)('rap.pettyCashRequests.view'),
    __param(0, (0, common_1.Query)('date')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], PettyCashRequestController.prototype, "getNextNumbers", null);
__decorate([
    (0, common_1.Get)(':id'),
    (0, permissions_decorator_1.Permissions)('rap.pettyCashRequests.view'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], PettyCashRequestController.prototype, "findOne", null);
__decorate([
    (0, common_1.Patch)(':id'),
    (0, permissions_decorator_1.Permissions)('rap.pettyCashRequests.edit'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, update_petty_cash_request_dto_1.UpdatePettyCashRequestDto]),
    __metadata("design:returntype", Promise)
], PettyCashRequestController.prototype, "update", null);
__decorate([
    (0, common_1.Delete)(':id'),
    (0, permissions_decorator_1.Permissions)('rap.pettyCashRequests.delete'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], PettyCashRequestController.prototype, "remove", null);
exports.PettyCashRequestController = PettyCashRequestController = __decorate([
    (0, common_1.Controller)('rap/petty-cash-requests'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, permissions_guard_1.PermissionsGuard),
    __metadata("design:paramtypes", [petty_cash_request_service_1.PettyCashRequestService])
], PettyCashRequestController);
//# sourceMappingURL=petty-cash-request.controller.js.map