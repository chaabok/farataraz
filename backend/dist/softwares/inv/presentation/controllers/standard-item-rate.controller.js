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
exports.StandardItemRateController = void 0;
const common_1 = require("@nestjs/common");
const standard_item_rate_service_1 = require("../../application/services/standard-item-rate.service");
const create_standard_item_rate_dto_1 = require("../../application/dtos/create-standard-item-rate.dto");
const update_standard_item_rate_dto_1 = require("../../application/dtos/update-standard-item-rate.dto");
const jwt_auth_guard_1 = require("../../../../auth/jwt-auth.guard");
const permissions_guard_1 = require("../../../../auth/permissions.guard");
let StandardItemRateController = class StandardItemRateController {
    constructor(service) {
        this.service = service;
    }
    create(createDto) {
        return this.service.create(createDto);
    }
    findAll(query) {
        return this.service.findAll(query);
    }
    getItemsByCategory(categoryId, rateId) {
        return this.service.getItemsByCategory(+categoryId, rateId ? +rateId : undefined);
    }
    validateEffectiveDate(categoryId, effectiveDate, excludeId) {
        return this.service.validateEffectiveDate(+categoryId, effectiveDate, excludeId ? +excludeId : undefined);
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
exports.StandardItemRateController = StandardItemRateController;
__decorate([
    (0, common_1.Post)(),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_standard_item_rate_dto_1.CreateStandardItemRateDto]),
    __metadata("design:returntype", void 0)
], StandardItemRateController.prototype, "create", null);
__decorate([
    (0, common_1.Get)(),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], StandardItemRateController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)('items-by-category/:categoryId'),
    __param(0, (0, common_1.Param)('categoryId')),
    __param(1, (0, common_1.Query)('rateId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", void 0)
], StandardItemRateController.prototype, "getItemsByCategory", null);
__decorate([
    (0, common_1.Get)('validate-effective-date'),
    __param(0, (0, common_1.Query)('categoryId')),
    __param(1, (0, common_1.Query)('effectiveDate')),
    __param(2, (0, common_1.Query)('excludeId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String]),
    __metadata("design:returntype", void 0)
], StandardItemRateController.prototype, "validateEffectiveDate", null);
__decorate([
    (0, common_1.Get)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], StandardItemRateController.prototype, "findOne", null);
__decorate([
    (0, common_1.Put)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, update_standard_item_rate_dto_1.UpdateStandardItemRateDto]),
    __metadata("design:returntype", void 0)
], StandardItemRateController.prototype, "update", null);
__decorate([
    (0, common_1.Delete)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], StandardItemRateController.prototype, "remove", null);
exports.StandardItemRateController = StandardItemRateController = __decorate([
    (0, common_1.Controller)('inv/standard-item-rates'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, permissions_guard_1.PermissionsGuard),
    __metadata("design:paramtypes", [standard_item_rate_service_1.StandardItemRateService])
], StandardItemRateController);
//# sourceMappingURL=standard-item-rate.controller.js.map