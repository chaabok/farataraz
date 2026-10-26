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
exports.ReceiptNotificationController = void 0;
const common_1 = require("@nestjs/common");
const receipt_notification_service_1 = require("../../application/services/receipt-notification.service");
const create_receipt_notification_dto_1 = require("../../application/dtos/create-receipt-notification.dto");
const update_receipt_notification_dto_1 = require("../../application/dtos/update-receipt-notification.dto");
const jwt_auth_guard_1 = require("../../../../auth/jwt-auth.guard");
const permissions_guard_1 = require("../../../../auth/permissions.guard");
const permissions_decorator_1 = require("../../../../auth/permissions.decorator");
let ReceiptNotificationController = class ReceiptNotificationController {
    constructor(receiptNotificationService) {
        this.receiptNotificationService = receiptNotificationService;
    }
    create(createReceiptNotificationDto) {
        return this.receiptNotificationService.create(createReceiptNotificationDto);
    }
    findAll() {
        return this.receiptNotificationService.findAll();
    }
    getNextNumbers(date) {
        return this.receiptNotificationService.getNextNumbers(date || '');
    }
    getAvailableCheques(operationType, bankAccountRef) {
        return this.receiptNotificationService.getAvailableCheques(operationType, bankAccountRef ? parseInt(bankAccountRef, 10) : undefined);
    }
    getAvailableChequesForTransfer() {
        return this.receiptNotificationService.getAvailableChequesForAssignment();
    }
    getAssignedCheques(partyRef) {
        return this.receiptNotificationService.getAssignedCheques(partyRef);
    }
    getPaidChequesByParty(partyRef) {
        return this.receiptNotificationService.getPaidChequesByParty(partyRef);
    }
    getPaidPromissoryNotesByParty(partyRef) {
        return this.receiptNotificationService.getPaidPromissoryNotesByParty(partyRef);
    }
    getReturnableCheques(partyRef, excludeIds) {
        return this.receiptNotificationService.getReturnableCheques(partyRef, excludeIds);
    }
    getReturnablePromissoryNotes(partyRef, excludeIds) {
        return this.receiptNotificationService.getReturnablePromissoryNotes(partyRef, excludeIds);
    }
    findOne(id) {
        return this.receiptNotificationService.findOne(+id);
    }
    update(id, updateReceiptNotificationDto) {
        return this.receiptNotificationService.update(+id, updateReceiptNotificationDto);
    }
    remove(id) {
        return this.receiptNotificationService.remove(+id);
    }
};
exports.ReceiptNotificationController = ReceiptNotificationController;
__decorate([
    (0, common_1.Post)(),
    (0, permissions_decorator_1.Permissions)('rap:receipt-notifications:create'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_receipt_notification_dto_1.CreateReceiptNotificationDto]),
    __metadata("design:returntype", void 0)
], ReceiptNotificationController.prototype, "create", null);
__decorate([
    (0, common_1.Get)(),
    (0, permissions_decorator_1.Permissions)('rap:receipt-notifications:view'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], ReceiptNotificationController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)('next-numbers'),
    (0, permissions_decorator_1.Permissions)('rap:receipt-notifications:view'),
    __param(0, (0, common_1.Query)('date')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], ReceiptNotificationController.prototype, "getNextNumbers", null);
__decorate([
    (0, common_1.Get)('cheques/available-for-assignment'),
    (0, permissions_decorator_1.Permissions)('rap:receipt-notifications:view'),
    __param(0, (0, common_1.Query)('operationType')),
    __param(1, (0, common_1.Query)('bankAccountRef')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", void 0)
], ReceiptNotificationController.prototype, "getAvailableCheques", null);
__decorate([
    (0, common_1.Get)('cheques/available-for-transfer'),
    (0, permissions_decorator_1.Permissions)('rap:receipt-notifications:view'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], ReceiptNotificationController.prototype, "getAvailableChequesForTransfer", null);
__decorate([
    (0, common_1.Get)('cheques/assigned-to-others'),
    (0, permissions_decorator_1.Permissions)('rap:receipt-notifications:view'),
    __param(0, (0, common_1.Query)('partyRef')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], ReceiptNotificationController.prototype, "getAssignedCheques", null);
__decorate([
    (0, common_1.Get)('cheques/paid-to-party'),
    (0, permissions_decorator_1.Permissions)('rap:receipt-notifications:view'),
    __param(0, (0, common_1.Query)('partyRef')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], ReceiptNotificationController.prototype, "getPaidChequesByParty", null);
__decorate([
    (0, common_1.Get)('promissory-notes/paid-to-party'),
    (0, permissions_decorator_1.Permissions)('rap:receipt-notifications:view'),
    __param(0, (0, common_1.Query)('partyRef')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], ReceiptNotificationController.prototype, "getPaidPromissoryNotesByParty", null);
__decorate([
    (0, common_1.Get)('cheques/returnable'),
    (0, permissions_decorator_1.Permissions)('rap:receipt-notifications:view'),
    __param(0, (0, common_1.Query)('partyRef')),
    __param(1, (0, common_1.Query)('excludeIds')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", void 0)
], ReceiptNotificationController.prototype, "getReturnableCheques", null);
__decorate([
    (0, common_1.Get)('promissory-notes/returnable'),
    (0, permissions_decorator_1.Permissions)('rap:receipt-notifications:view'),
    __param(0, (0, common_1.Query)('partyRef')),
    __param(1, (0, common_1.Query)('excludeIds')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", void 0)
], ReceiptNotificationController.prototype, "getReturnablePromissoryNotes", null);
__decorate([
    (0, common_1.Get)(':id'),
    (0, permissions_decorator_1.Permissions)('rap:receipt-notifications:view'),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", void 0)
], ReceiptNotificationController.prototype, "findOne", null);
__decorate([
    (0, common_1.Put)(':id'),
    (0, permissions_decorator_1.Permissions)('rap:receipt-notifications:edit'),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, update_receipt_notification_dto_1.UpdateReceiptNotificationDto]),
    __metadata("design:returntype", void 0)
], ReceiptNotificationController.prototype, "update", null);
__decorate([
    (0, common_1.Delete)(':id'),
    (0, permissions_decorator_1.Permissions)('rap:receipt-notifications:delete'),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", void 0)
], ReceiptNotificationController.prototype, "remove", null);
exports.ReceiptNotificationController = ReceiptNotificationController = __decorate([
    (0, common_1.Controller)('rap/receipt-notifications'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, permissions_guard_1.PermissionsGuard),
    __metadata("design:paramtypes", [receipt_notification_service_1.ReceiptNotificationService])
], ReceiptNotificationController);
//# sourceMappingURL=receipt-notification.controller.js.map