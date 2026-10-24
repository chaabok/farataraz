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
exports.BankReconciliation = void 0;
const typeorm_1 = require("typeorm");
const app_base_entity_1 = require("../../../../core/entities/app-base.entity");
const bank_account_entity_1 = require("./bank-account.entity");
const reconcile_bank_statement_entity_1 = require("./reconcile-bank-statement.entity");
const bank_reconciliation_item_entity_1 = require("./bank-reconciliation-item.entity");
let BankReconciliation = class BankReconciliation extends app_base_entity_1.AppBaseEntity {
};
exports.BankReconciliation = BankReconciliation;
__decorate([
    (0, typeorm_1.PrimaryColumn)({ type: 'bigint' }),
    __metadata("design:type", Number)
], BankReconciliation.prototype, "BankReconciliationID", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'bigint', nullable: false }),
    __metadata("design:type", Number)
], BankReconciliation.prototype, "BankAccountRef", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => bank_account_entity_1.BankAccount, { onDelete: 'RESTRICT' }),
    (0, typeorm_1.JoinColumn)({ name: 'BankAccountRef', referencedColumnName: 'bankAccountId' }),
    __metadata("design:type", bank_account_entity_1.BankAccount)
], BankReconciliation.prototype, "bankAccount", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'bigint', nullable: false }),
    __metadata("design:type", Number)
], BankReconciliation.prototype, "ReconcileBankStatementRef", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => reconcile_bank_statement_entity_1.ReconcileBankStatement, { onDelete: 'RESTRICT' }),
    (0, typeorm_1.JoinColumn)({ name: 'ReconcileBankStatementRef', referencedColumnName: 'ReconcileBankStatementID' }),
    __metadata("design:type", reconcile_bank_statement_entity_1.ReconcileBankStatement)
], BankReconciliation.prototype, "bankStatement", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 50, nullable: true }),
    __metadata("design:type", String)
], BankReconciliation.prototype, "Number", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 50, nullable: true }),
    __metadata("design:type", String)
], BankReconciliation.prototype, "Date", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'boolean', default: false }),
    __metadata("design:type", Boolean)
], BankReconciliation.prototype, "isOpening", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => bank_reconciliation_item_entity_1.BankReconciliationItem, item => item.bankReconciliation, { cascade: true, eager: true, orphanedRowAction: 'delete' }),
    __metadata("design:type", Array)
], BankReconciliation.prototype, "items", void 0);
exports.BankReconciliation = BankReconciliation = __decorate([
    (0, typeorm_1.Entity)('BankReconciliation', { schema: 'Rap' })
], BankReconciliation);
//# sourceMappingURL=bank-reconciliation.entity.js.map