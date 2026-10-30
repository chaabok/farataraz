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
exports.SalesContractController = void 0;
const common_1 = require("@nestjs/common");
const sales_contract_service_1 = require("../../application/services/sales-contract.service");
const sales_contract_dto_1 = require("../../application/dtos/sales-contract.dto");
const jwt_auth_guard_1 = require("../../../../auth/jwt-auth.guard");
const permissions_guard_1 = require("../../../../auth/permissions.guard");
let SalesContractController = class SalesContractController {
    constructor(service) {
        this.service = service;
    }
    create(createDto) {
        return this.service.create(createDto);
    }
    findAll(query) {
        return this.service.findAll(query);
    }
    async getNextNumber() {
        return this.service.getNextNumber();
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
exports.SalesContractController = SalesContractController;
__decorate([
    (0, common_1.Post)(),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [sales_contract_dto_1.CreateSalesContractDto]),
    __metadata("design:returntype", void 0)
], SalesContractController.prototype, "create", null);
__decorate([
    (0, common_1.Get)(),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], SalesContractController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)('next-number'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], SalesContractController.prototype, "getNextNumber", null);
__decorate([
    (0, common_1.Get)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], SalesContractController.prototype, "findOne", null);
__decorate([
    (0, common_1.Put)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, sales_contract_dto_1.UpdateSalesContractDto]),
    __metadata("design:returntype", void 0)
], SalesContractController.prototype, "update", null);
__decorate([
    (0, common_1.Delete)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], SalesContractController.prototype, "remove", null);
exports.SalesContractController = SalesContractController = __decorate([
    (0, common_1.Controller)('sle/sales-contracts'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, permissions_guard_1.PermissionsGuard),
    __metadata("design:paramtypes", [sales_contract_service_1.SalesContractService])
], SalesContractController);
//# sourceMappingURL=sales-contract.controller.js.map