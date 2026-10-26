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
exports.ReceivedChequeOperation = void 0;
const typeorm_1 = require("typeorm");
const app_base_entity_1 = require("../../../../core/entities/app-base.entity");
const bank_account_entity_1 = require("./bank-account.entity");
const detailed_account_entity_1 = require("../../../accounting/domain/entities/detailed-account.entity");
const voucher_entity_1 = require("../../../accounting/domain/entities/voucher.entity");
const received_cheque_operation_item_entity_1 = require("./received-cheque-operation-item.entity");
let ReceivedChequeOperation = class ReceivedChequeOperation extends app_base_entity_1.AppBaseEntity {
};
exports.ReceivedChequeOperation = ReceivedChequeOperation;
__decorate([
    (0, typeorm_1.PrimaryColumn)({
        type: 'bigint',
        name: 'ReceivedChequeOperationID',
        transformer: {
            to: (value) => value,
            from: (value) => (value !== null && value !== undefined) ? parseInt(value.toString(), 10) : 0
        }
    }),
    __metadata("design:type", Number)
], ReceivedChequeOperation.prototype, "receivedChequeOperationId", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'OperationType', type: 'int', nullable: false }),
    __metadata("design:type", Number)
], ReceivedChequeOperation.prototype, "operationType", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'DocumentNumber', type: 'varchar', length: 50, nullable: false }),
    __metadata("design:type", String)
], ReceivedChequeOperation.prototype, "documentNumber", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'DocumentDate', type: 'varchar', length: 20, nullable: false }),
    __metadata("design:type", String)
], ReceivedChequeOperation.prototype, "documentDate", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'AssignmentNumber', type: 'varchar', length: 50, nullable: true }),
    __metadata("design:type", String)
], ReceivedChequeOperation.prototype, "assignmentNumber", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'Status', type: 'int', nullable: false, default: 1 }),
    __metadata("design:type", Number)
], ReceivedChequeOperation.prototype, "status", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'BankAccountRef', type: 'bigint', nullable: true, transformer: {
            to: (value) => value,
            from: (value) => value !== null && value !== undefined ? parseInt(value.toString(), 10) : null
        } }),
    __metadata("design:type", Number)
], ReceivedChequeOperation.prototype, "bankAccountRef", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => bank_account_entity_1.BankAccount, { eager: true, nullable: true }),
    (0, typeorm_1.JoinColumn)({ name: 'BankAccountRef', referencedColumnName: 'bankAccountId' }),
    __metadata("design:type", bank_account_entity_1.BankAccount)
], ReceivedChequeOperation.prototype, "bankAccount", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'RealizerRef', type: 'bigint', nullable: true, transformer: {
            to: (value) => value,
            from: (value) => value !== null && value !== undefined ? parseInt(value.toString(), 10) : null
        } }),
    __metadata("design:type", Number)
], ReceivedChequeOperation.prototype, "realizerRef", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => detailed_account_entity_1.DetailedAccount, { eager: false, nullable: true }),
    (0, typeorm_1.JoinColumn)({ name: 'RealizerRef', referencedColumnName: 'detailedAccountId' }),
    __metadata("design:type", detailed_account_entity_1.DetailedAccount)
], ReceivedChequeOperation.prototype, "realizer", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'VoucherHeaderRef', type: 'bigint', nullable: true, transformer: {
            to: (value) => value,
            from: (value) => value !== null && value !== undefined ? parseInt(value.toString(), 10) : null
        } }),
    __metadata("design:type", Number)
], ReceivedChequeOperation.prototype, "voucherHeaderRef", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => voucher_entity_1.Voucher, { eager: false, nullable: true, onDelete: 'SET NULL' }),
    (0, typeorm_1.JoinColumn)({ name: 'VoucherHeaderRef', referencedColumnName: 'voucherId' }),
    __metadata("design:type", voucher_entity_1.Voucher)
], ReceivedChequeOperation.prototype, "voucherHeader", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => received_cheque_operation_item_entity_1.ReceivedChequeOperationItem, item => item.operation, { cascade: true, orphanedRowAction: 'delete' }),
    __metadata("design:type", Array)
], ReceivedChequeOperation.prototype, "items", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'FiscalYearRef', type: 'bigint', nullable: false }),
    __metadata("design:type", Number)
], ReceivedChequeOperation.prototype, "fiscalYearRef", void 0);
exports.ReceivedChequeOperation = ReceivedChequeOperation = __decorate([
    (0, typeorm_1.Entity)({ schema: 'Rap', name: 'ReceivedChequeOperation' })
], ReceivedChequeOperation);
//# sourceMappingURL=received-cheque-operation.entity.js.map