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
exports.ClosingTemporaryAccountController = void 0;
const common_1 = require("@nestjs/common");
const closing_temporary_account_service_1 = require("../../application/services/closing-temporary-account.service");
let ClosingTemporaryAccountController = class ClosingTemporaryAccountController {
    constructor(service) {
        this.service = service;
    }
    async getTemporaryAccountsTree(toDate) {
        const data = await this.service.getTemporaryAccountsTree(toDate);
        return { success: true, data };
    }
    async findAll() {
        const data = await this.service.findAll();
        return { success: true, data };
    }
    async findOne(id) {
        const data = await this.service.findOne(id);
        return { success: true, data };
    }
    async create(dto) {
        const data = await this.service.create(dto);
        return { success: true, data, message: 'اطلاعات بستن حسابهای موقت با موفقیت ثبت شد' };
    }
    async update(id, dto) {
        const data = await this.service.update(id, dto);
        return { success: true, data, message: 'اطلاعات بستن حسابهای موقت بروزرسانی شد' };
    }
    async remove(id) {
        await this.service.delete(id);
        return { success: true, message: 'حذف اطلاعات بستن حسابهای موقت انجام شد' };
    }
};
exports.ClosingTemporaryAccountController = ClosingTemporaryAccountController;
__decorate([
    (0, common_1.Get)('temporary-accounts-tree'),
    __param(0, (0, common_1.Query)('toDate')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], ClosingTemporaryAccountController.prototype, "getTemporaryAccountsTree", null);
__decorate([
    (0, common_1.Get)(),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], ClosingTemporaryAccountController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)(':id'),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", Promise)
], ClosingTemporaryAccountController.prototype, "findOne", null);
__decorate([
    (0, common_1.Post)(),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], ClosingTemporaryAccountController.prototype, "create", null);
__decorate([
    (0, common_1.Put)(':id'),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Object]),
    __metadata("design:returntype", Promise)
], ClosingTemporaryAccountController.prototype, "update", null);
__decorate([
    (0, common_1.Delete)(':id'),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", Promise)
], ClosingTemporaryAccountController.prototype, "remove", null);
exports.ClosingTemporaryAccountController = ClosingTemporaryAccountController = __decorate([
    (0, common_1.Controller)('accounting/closing-temporary-accounts'),
    __metadata("design:paramtypes", [closing_temporary_account_service_1.ClosingTemporaryAccountService])
], ClosingTemporaryAccountController);
//# sourceMappingURL=closing-temporary-account.controller.js.map