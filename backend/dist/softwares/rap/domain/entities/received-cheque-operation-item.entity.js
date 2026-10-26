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
Object.defineProperty(exports, "__esModule", { value: true });
exports.ReceivedChequeOperationItem = void 0;
const typeorm_1 = require("typeorm");
const received_cheque_operation_entity_1 = require("./received-cheque-operation.entity");
const receipt_cheque_entity_1 = require("./receipt-cheque.entity");
const cash_entity_1 = require("./cash.entity");
let ReceivedChequeOperationItem = class ReceivedChequeOperationItem {
};
exports.ReceivedChequeOperationItem = ReceivedChequeOperationItem;
__decorate([
    (0, typeorm_1.PrimaryColumn)({
        type: 'bigint',
        name: 'ReceivedChequeOperationItemID',
        transformer: {
            to: (value) => value,
            from: (value) => (value !== null && value !== undefined) ? parseInt(value.toString(), 10) : 0
        }
    }),
    __metadata("design:type", Number)
], ReceivedChequeOperationItem.prototype, "receivedChequeOperationItemId", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'OperationRef', type: 'bigint', nullable: false, transformer: {
            to: (value) => value,
            from: (value) => value !== null && value !== undefined ? parseInt(value.toString(), 10) : null
        } }),
    __metadata("design:type", Number)
], ReceivedChequeOperationItem.prototype, "operationRef", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => received_cheque_operation_entity_1.ReceivedChequeOperation, op => op.items, { onDelete: 'CASCADE' }),
    (0, typeorm_1.JoinColumn)({ name: 'OperationRef', referencedColumnName: 'receivedChequeOperationId' }),
    __metadata("design:type", received_cheque_operation_entity_1.ReceivedChequeOperation)
], ReceivedChequeOperationItem.prototype, "operation", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'ReceiptChequeRef', type: 'bigint', nullable: false, transformer: {
            to: (value) => value,
            from: (value) => value !== null && value !== undefined ? parseInt(value.toString(), 10) : null
        } }),
    __metadata("design:type", Number)
], ReceivedChequeOperationItem.prototype, "receiptChequeRef", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => receipt_cheque_entity_1.ReceiptCheque, { eager: true }),
    (0, typeorm_1.JoinColumn)({ name: 'ReceiptChequeRef', referencedColumnName: 'receiptChequeId' }),
    __metadata("design:type", receipt_cheque_entity_1.ReceiptCheque)
], ReceivedChequeOperationItem.prototype, "receiptCheque", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'ChequeStatus', type: 'int', nullable: true }),
    __metadata("design:type", Number)
], ReceivedChequeOperationItem.prototype, "chequeStatus", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'ForecastDate', type: 'varchar', length: 20, nullable: true }),
    __metadata("design:type", String)
], ReceivedChequeOperationItem.prototype, "forecastDate", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'CashRef', type: 'bigint', nullable: true, transformer: {
            to: (value) => value,
            from: (value) => value !== null && value !== undefined ? parseInt(value.toString(), 10) : null
        } }),
    __metadata("design:type", Number)
], ReceivedChequeOperationItem.prototype, "cashRef", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => cash_entity_1.Cash, { eager: true, nullable: true }),
    (0, typeorm_1.JoinColumn)({ name: 'CashRef', referencedColumnName: 'cashId' }),
    __metadata("design:type", cash_entity_1.Cash)
], ReceivedChequeOperationItem.prototype, "cash", void 0);
exports.ReceivedChequeOperationItem = ReceivedChequeOperationItem = __decorate([
    (0, typeorm_1.Entity)({ schema: 'Rap', name: 'ReceivedChequeOperationItem' })
], ReceivedChequeOperationItem);
//# sourceMappingURL=received-cheque-operation-item.entity.js.map