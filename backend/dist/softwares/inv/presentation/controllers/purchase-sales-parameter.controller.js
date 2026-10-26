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
exports.PurchaseSalesParameterController = void 0;
const common_1 = require("@nestjs/common");
const purchase_sales_parameter_service_1 = require("../../application/services/purchase-sales-parameter.service");
const create_purchase_sales_parameter_dto_1 = require("../../application/dtos/create-purchase-sales-parameter.dto");
const update_purchase_sales_parameter_dto_1 = require("../../application/dtos/update-purchase-sales-parameter.dto");
const jwt_auth_guard_1 = require("../../../../auth/jwt-auth.guard");
const permissions_guard_1 = require("../../../../auth/permissions.guard");
let PurchaseSalesParameterController = class PurchaseSalesParameterController {
    constructor(service) {
        this.service = service;
    }
    create(createDto) {
        return this.service.create(createDto);
    }
    findAll(query) {
        return this.service.findAll(query);
    }
    async checkDuplicate(field, value, excludeId) {
        const isDuplicate = await this.service.checkDuplicate(field, value, excludeId ? parseInt(excludeId, 10) : undefined);
        return { isDuplicate };
    }
    findOne(id) {
        return this.service.findOne(+id);
    }
    update(id, updateDto) {
        return this.service.update(+id, updateDto);
    }
    remove(id) {
        return this.service.remove(+id);
    }
};
exports.PurchaseSalesParameterController = PurchaseSalesParameterController;
__decorate([
    (0, common_1.Post)(),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_purchase_sales_parameter_dto_1.CreatePurchaseSalesParameterDto]),
    __metadata("design:returntype", void 0)
], PurchaseSalesParameterController.prototype, "create", null);
__decorate([
    (0, common_1.Get)(),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], PurchaseSalesParameterController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)('check-duplicate'),
    __param(0, (0, common_1.Query)('field')),
    __param(1, (0, common_1.Query)('value')),
    __param(2, (0, common_1.Query)('excludeId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String]),
    __metadata("design:returntype", Promise)
], PurchaseSalesParameterController.prototype, "checkDuplicate", null);
__decorate([
    (0, common_1.Get)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], PurchaseSalesParameterController.prototype, "findOne", null);
__decorate([
    (0, common_1.Put)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, update_purchase_sales_parameter_dto_1.UpdatePurchaseSalesParameterDto]),
    __metadata("design:returntype", void 0)
], PurchaseSalesParameterController.prototype, "update", null);
__decorate([
    (0, common_1.Delete)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], PurchaseSalesParameterController.prototype, "remove", null);
exports.PurchaseSalesParameterController = PurchaseSalesParameterController = __decorate([
    (0, common_1.Controller)('inv/purchase-sales-parameters'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, permissions_guard_1.PermissionsGuard),
    __metadata("design:paramtypes", [purchase_sales_parameter_service_1.PurchaseSalesParameterService])
], PurchaseSalesParameterController);
//# sourceMappingURL=purchase-sales-parameter.controller.js.map