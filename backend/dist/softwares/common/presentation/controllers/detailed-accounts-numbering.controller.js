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
exports.DetailedAccountsNumberingController = void 0;
const common_1 = require("@nestjs/common");
const detailed_accounts_numbering_service_1 = require("../../application/services/detailed-accounts-numbering.service");
const jwt_auth_guard_1 = require("../../../../auth/jwt-auth.guard");
const permissions_guard_1 = require("../../../../auth/permissions.guard");
const permissions_decorator_1 = require("../../../../auth/permissions.decorator");
let DetailedAccountsNumberingController = class DetailedAccountsNumberingController {
    constructor(service) {
        this.service = service;
    }
    async getNumbering() {
        const data = await this.service.getViewList();
        return { data };
    }
    async getNextCode(detailedTypeId) {
        const nextCode = await this.service.getNextCode(detailedTypeId);
        return { data: nextCode };
    }
    async saveNumbering(body) {
        await this.service.saveList(body.dataList);
        return { message: 'Numbering settings saved successfully' };
    }
};
exports.DetailedAccountsNumberingController = DetailedAccountsNumberingController;
__decorate([
    (0, common_1.Get)(),
    (0, permissions_decorator_1.Permissions)('DetailedAccountsNumbering:Read'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], DetailedAccountsNumberingController.prototype, "getNumbering", null);
__decorate([
    (0, common_1.Get)('next-code/:detailedTypeId'),
    (0, permissions_decorator_1.Permissions)('DetailedAccountsNumbering:Read'),
    __param(0, (0, common_1.Param)('detailedTypeId', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", Promise)
], DetailedAccountsNumberingController.prototype, "getNextCode", null);
__decorate([
    (0, common_1.Put)(),
    (0, permissions_decorator_1.Permissions)('DetailedAccountsNumbering:Update'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], DetailedAccountsNumberingController.prototype, "saveNumbering", null);
exports.DetailedAccountsNumberingController = DetailedAccountsNumberingController = __decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, permissions_guard_1.PermissionsGuard),
    (0, common_1.Controller)('common/detailed-accounts-numbering'),
    __metadata("design:paramtypes", [detailed_accounts_numbering_service_1.DetailedAccountsNumberingService])
], DetailedAccountsNumberingController);
//# sourceMappingURL=detailed-accounts-numbering.controller.js.map