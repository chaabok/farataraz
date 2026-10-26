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
exports.PaymentNotificationController = void 0;
const common_1 = require("@nestjs/common");
const payment_notification_service_1 = require("../../application/services/payment-notification.service");
const create_payment_notification_dto_1 = require("../../application/dtos/create-payment-notification.dto");
const update_payment_notification_dto_1 = require("../../application/dtos/update-payment-notification.dto");
const jwt_auth_guard_1 = require("../../../../auth/jwt-auth.guard");
const permissions_guard_1 = require("../../../../auth/permissions.guard");
const permissions_decorator_1 = require("../../../../auth/permissions.decorator");
let PaymentNotificationController = class PaymentNotificationController {
    constructor(paymentNotificationService) {
        this.paymentNotificationService = paymentNotificationService;
    }
    create(createPaymentNotificationDto) {
        return this.paymentNotificationService.create(createPaymentNotificationDto);
    }
    findAll() {
        return this.paymentNotificationService.findAll();
    }
    getNextNumbers(date) {
        return this.paymentNotificationService.getNextNumbers(date || '');
    }
    getPayableCheques() {
        return this.paymentNotificationService.getPayableCheques();
    }
    getPayablePromissoryNotes() {
        return this.paymentNotificationService.getPayablePromissoryNotes();
    }
    findOne(id) {
        return this.paymentNotificationService.findOne(+id);
    }
    update(id, updatePaymentNotificationDto) {
        return this.paymentNotificationService.update(+id, updatePaymentNotificationDto);
    }
    remove(id) {
        return this.paymentNotificationService.remove(+id);
    }
};
exports.PaymentNotificationController = PaymentNotificationController;
__decorate([
    (0, common_1.Post)(),
    (0, permissions_decorator_1.Permissions)('rap:payment-notifications:create'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_payment_notification_dto_1.CreatePaymentNotificationDto]),
    __metadata("design:returntype", void 0)
], PaymentNotificationController.prototype, "create", null);
__decorate([
    (0, common_1.Get)(),
    (0, permissions_decorator_1.Permissions)('rap:payment-notifications:view'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], PaymentNotificationController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)('next-numbers'),
    (0, permissions_decorator_1.Permissions)('rap:payment-notifications:view'),
    __param(0, (0, common_1.Query)('date')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], PaymentNotificationController.prototype, "getNextNumbers", null);
__decorate([
    (0, common_1.Get)('cheques/payable'),
    (0, permissions_decorator_1.Permissions)('rap:paid-document-clearings:view'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], PaymentNotificationController.prototype, "getPayableCheques", null);
__decorate([
    (0, common_1.Get)('promissory-notes/payable'),
    (0, permissions_decorator_1.Permissions)('rap:paid-document-clearings:view'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], PaymentNotificationController.prototype, "getPayablePromissoryNotes", null);
__decorate([
    (0, common_1.Get)(':id'),
    (0, permissions_decorator_1.Permissions)('rap:payment-notifications:view'),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", void 0)
], PaymentNotificationController.prototype, "findOne", null);
__decorate([
    (0, common_1.Put)(':id'),
    (0, permissions_decorator_1.Permissions)('rap:payment-notifications:edit'),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, update_payment_notification_dto_1.UpdatePaymentNotificationDto]),
    __metadata("design:returntype", void 0)
], PaymentNotificationController.prototype, "update", null);
__decorate([
    (0, common_1.Delete)(':id'),
    (0, permissions_decorator_1.Permissions)('rap:payment-notifications:delete'),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", void 0)
], PaymentNotificationController.prototype, "remove", null);
exports.PaymentNotificationController = PaymentNotificationController = __decorate([
    (0, common_1.Controller)('rap/payment-notifications'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, permissions_guard_1.PermissionsGuard),
    __metadata("design:paramtypes", [payment_notification_service_1.PaymentNotificationService])
], PaymentNotificationController);
//# sourceMappingURL=payment-notification.controller.js.map