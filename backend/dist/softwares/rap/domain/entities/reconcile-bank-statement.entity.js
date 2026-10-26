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
exports.ReconcileBankStatement = void 0;
const typeorm_1 = require("typeorm");
const app_base_entity_1 = require("../../../../core/entities/app-base.entity");
const reconcile_bank_statement_item_entity_1 = require("./reconcile-bank-statement-item.entity");
const bank_account_entity_1 = require("./bank-account.entity");
let ReconcileBankStatement = class ReconcileBankStatement extends app_base_entity_1.AppBaseEntity {
};
exports.ReconcileBankStatement = ReconcileBankStatement;
__decorate([
    (0, typeorm_1.PrimaryColumn)({ type: 'bigint' }),
    __metadata("design:type", Number)
], ReconcileBankStatement.prototype, "ReconcileBankStatementID", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'bigint', nullable: true }),
    __metadata("design:type", Number)
], ReconcileBankStatement.prototype, "BankAccountRef", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => bank_account_entity_1.BankAccount, { onDelete: 'RESTRICT' }),
    (0, typeorm_1.JoinColumn)({ name: 'BankAccountRef', referencedColumnName: 'bankAccountId' }),
    __metadata("design:type", bank_account_entity_1.BankAccount)
], ReconcileBankStatement.prototype, "bankAccount", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 50, nullable: true }),
    __metadata("design:type", String)
], ReconcileBankStatement.prototype, "Number", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 50, nullable: true }),
    __metadata("design:type", String)
], ReconcileBankStatement.prototype, "Date", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 50, nullable: true }),
    __metadata("design:type", String)
], ReconcileBankStatement.prototype, "fromDate", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'decimal', precision: 18, scale: 4, nullable: true, default: 0 }),
    __metadata("design:type", Number)
], ReconcileBankStatement.prototype, "previousBalance", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'decimal', precision: 18, scale: 4, nullable: true, default: 0 }),
    __metadata("design:type", Number)
], ReconcileBankStatement.prototype, "balance", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'bigint', nullable: true }),
    __metadata("design:type", Number)
], ReconcileBankStatement.prototype, "fiscalYearRef", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => reconcile_bank_statement_item_entity_1.ReconcileBankStatementItem, item => item.statement, { cascade: true, eager: true, orphanedRowAction: 'delete' }),
    __metadata("design:type", Array)
], ReconcileBankStatement.prototype, "items", void 0);
exports.ReconcileBankStatement = ReconcileBankStatement = __decorate([
    (0, typeorm_1.Entity)('ReconcileBankStatement', { schema: 'Rap' })
], ReconcileBankStatement);
//# sourceMappingURL=reconcile-bank-statement.entity.js.map