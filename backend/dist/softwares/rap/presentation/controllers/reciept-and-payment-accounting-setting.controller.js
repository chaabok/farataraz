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
exports.RecieptAndPaymentAccountingSettingController = void 0;
const common_1 = require("@nestjs/common");
const reciept_and_payment_accounting_setting_service_1 = require("../../application/services/reciept-and-payment-accounting-setting.service");
const create_reciept_and_payment_accounting_setting_dto_1 = require("../../application/dtos/create-reciept-and-payment-accounting-setting.dto");
const update_reciept_and_payment_accounting_setting_dto_1 = require("../../application/dtos/update-reciept-and-payment-accounting-setting.dto");
const jwt_auth_guard_1 = require("../../../../auth/jwt-auth.guard");
let RecieptAndPaymentAccountingSettingController = class RecieptAndPaymentAccountingSettingController {
    constructor(service) {
        this.service = service;
    }
    async create(createDto) {
        const created = await this.service.create(createDto);
        return { data: created, message: 'Settings created successfully' };
    }
    async findAll(query) {
        const result = await this.service.findAll(query);
        return {
            data: result.items,
            total: result.total,
        };
    }
    async getNextNumber() {
        const res = await this.service.getNextNumber();
        return res;
    }
    async findOne(id) {
        const data = await this.service.findById(+id);
        return { data };
    }
    async update(id, updateDto) {
        const updated = await this.service.update(+id, updateDto);
        return { data: updated, message: 'Settings updated successfully' };
    }
    async remove(id) {
        await this.service.delete(+id);
        return { message: 'Settings deleted successfully' };
    }
};
exports.RecieptAndPaymentAccountingSettingController = RecieptAndPaymentAccountingSettingController;
__decorate([
    (0, common_1.Post)(),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_reciept_and_payment_accounting_setting_dto_1.CreateRecieptAndPaymentAccountingSettingDto]),
    __metadata("design:returntype", Promise)
], RecieptAndPaymentAccountingSettingController.prototype, "create", null);
__decorate([
    (0, common_1.Get)(),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], RecieptAndPaymentAccountingSettingController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)('next-number'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], RecieptAndPaymentAccountingSettingController.prototype, "getNextNumber", null);
__decorate([
    (0, common_1.Get)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], RecieptAndPaymentAccountingSettingController.prototype, "findOne", null);
__decorate([
    (0, common_1.Put)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, update_reciept_and_payment_accounting_setting_dto_1.UpdateRecieptAndPaymentAccountingSettingDto]),
    __metadata("design:returntype", Promise)
], RecieptAndPaymentAccountingSettingController.prototype, "update", null);
__decorate([
    (0, common_1.Delete)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], RecieptAndPaymentAccountingSettingController.prototype, "remove", null);
exports.RecieptAndPaymentAccountingSettingController = RecieptAndPaymentAccountingSettingController = __decorate([
    (0, common_1.Controller)('rap/accounting-setting'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __metadata("design:paramtypes", [reciept_and_payment_accounting_setting_service_1.RecieptAndPaymentAccountingSettingService])
], RecieptAndPaymentAccountingSettingController);
//# sourceMappingURL=reciept-and-payment-accounting-setting.controller.js.map