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
exports.BankReconciliationItem = void 0;
const typeorm_1 = require("typeorm");
const app_base_entity_1 = require("../../../../core/entities/app-base.entity");
const bank_reconciliation_entity_1 = require("./bank-reconciliation.entity");
const reconcile_bank_statement_item_entity_1 = require("./reconcile-bank-statement-item.entity");
let BankReconciliationItem = class BankReconciliationItem extends app_base_entity_1.AppBaseEntity {
};
exports.BankReconciliationItem = BankReconciliationItem;
__decorate([
    (0, typeorm_1.PrimaryColumn)({ type: 'bigint' }),
    __metadata("design:type", Number)
], BankReconciliationItem.prototype, "BankReconciliationItemID", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'bigint', nullable: false }),
    __metadata("design:type", Number)
], BankReconciliationItem.prototype, "BankReconciliationRef", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => bank_reconciliation_entity_1.BankReconciliation, (br) => br.items, { onDelete: 'CASCADE' }),
    (0, typeorm_1.JoinColumn)({ name: 'BankReconciliationRef', referencedColumnName: 'BankReconciliationID' }),
    __metadata("design:type", bank_reconciliation_entity_1.BankReconciliation)
], BankReconciliationItem.prototype, "bankReconciliation", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'bigint', nullable: true }),
    __metadata("design:type", Number)
], BankReconciliationItem.prototype, "BankStatementItemRef", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => reconcile_bank_statement_item_entity_1.ReconcileBankStatementItem, { onDelete: 'RESTRICT' }),
    (0, typeorm_1.JoinColumn)({ name: 'BankStatementItemRef', referencedColumnName: 'ReconcileBankStatementItemID' }),
    __metadata("design:type", reconcile_bank_statement_item_entity_1.ReconcileBankStatementItem)
], BankReconciliationItem.prototype, "bankStatementItem", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 250, nullable: true }),
    __metadata("design:type", String)
], BankReconciliationItem.prototype, "BookItemRef", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 50, nullable: true }),
    __metadata("design:type", String)
], BankReconciliationItem.prototype, "matchId", void 0);
exports.BankReconciliationItem = BankReconciliationItem = __decorate([
    (0, typeorm_1.Entity)('BankReconciliationItem', { schema: 'Rap' })
], BankReconciliationItem);
//# sourceMappingURL=bank-reconciliation-item.entity.js.map