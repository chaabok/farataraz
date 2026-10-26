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
exports.ReceivedChequeOperationController = void 0;
const common_1 = require("@nestjs/common");
const received_cheque_operation_service_1 = require("../../application/services/received-cheque-operation.service");
const create_received_cheque_operation_dto_1 = require("../../application/dtos/create-received-cheque-operation.dto");
const update_received_cheque_operation_dto_1 = require("../../application/dtos/update-received-cheque-operation.dto");
let ReceivedChequeOperationController = class ReceivedChequeOperationController {
    constructor(service) {
        this.service = service;
    }
    async create(dto) {
        const data = await this.service.create(dto);
        return { data, message: 'عملیات با موفقیت ثبت شد' };
    }
    async update(id, dto) {
        const data = await this.service.update(+id, dto);
        return { data, message: 'عملیات با موفقیت ویرایش شد' };
    }
    async delete(id) {
        await this.service.delete(+id);
        return { message: 'عملیات با موفقیت حذف شد' };
    }
    async getNextNumbers(date) {
        return this.service.getNextNumbers(date || '');
    }
    async findById(id) {
        const data = await this.service.findById(+id);
        return { data };
    }
    async findAll(query) {
        const [data, total] = await this.service.findAll(query);
        return { data, total };
    }
};
exports.ReceivedChequeOperationController = ReceivedChequeOperationController;
__decorate([
    (0, common_1.Post)(),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_received_cheque_operation_dto_1.CreateReceivedChequeOperationDto]),
    __metadata("design:returntype", Promise)
], ReceivedChequeOperationController.prototype, "create", null);
__decorate([
    (0, common_1.Put)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, update_received_cheque_operation_dto_1.UpdateReceivedChequeOperationDto]),
    __metadata("design:returntype", Promise)
], ReceivedChequeOperationController.prototype, "update", null);
__decorate([
    (0, common_1.Delete)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], ReceivedChequeOperationController.prototype, "delete", null);
__decorate([
    (0, common_1.Get)('next-numbers'),
    __param(0, (0, common_1.Query)('date')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], ReceivedChequeOperationController.prototype, "getNextNumbers", null);
__decorate([
    (0, common_1.Get)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], ReceivedChequeOperationController.prototype, "findById", null);
__decorate([
    (0, common_1.Get)(),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], ReceivedChequeOperationController.prototype, "findAll", null);
exports.ReceivedChequeOperationController = ReceivedChequeOperationController = __decorate([
    (0, common_1.Controller)('rap/received-cheque-operations'),
    __metadata("design:paramtypes", [received_cheque_operation_service_1.ReceivedChequeOperationService])
], ReceivedChequeOperationController);
//# sourceMappingURL=received-cheque-operation.controller.js.map